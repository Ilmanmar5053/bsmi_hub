<?php

namespace App\Http\Controllers;

use App\Models\DuesPayment;
use App\Models\DuesPeriod;
use App\Models\FinancialTransaction;
use App\Models\Member;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class DuesController extends Controller
{
    public function index(Request $request): Response
    {
        $filters = $request->only(['year', 'search', 'status']);

        $periods = DuesPeriod::query()
            ->when($filters['year'] ?? null, fn($q, $v) => $q->where('year', $v))
            ->orderByDesc('year')
            ->orderByDesc('month')
            ->paginate(12)
            ->withQueryString()
            ->through(function ($period) {
                $paymentsCount = $period->payments()->count();
                $paidCount     = $period->payments()->where('status', 'paid')->count();

                return [
                    'id'            => $period->id,
                    'month'         => $period->month,
                    'year'          => $period->year,
                    'amount'        => (float) $period->amount,
                    'due_date'      => $period->due_date?->toDateString(),
                    'notes'         => $period->notes,
                    'total_members' => $paymentsCount,
                    'paid_count'    => $paidCount,
                    'unpaid_count'  => $paymentsCount - $paidCount,
                ];
            });

        $currentPeriod = null;
        if ($request->filled('period_id')) {
            $currentPeriod = DuesPeriod::find($request->period_id);
        } elseif ($periods->count() > 0) {
            $currentPeriod = DuesPeriod::orderByDesc('year')->orderByDesc('month')->first();
        }

        // Payments for the current period
        $payments = [];
        if ($currentPeriod) {
            $payments = DuesPayment::with('member')
                ->where('dues_period_id', $currentPeriod->id)
                ->when($filters['search'] ?? null, fn($q, $v) =>
                    $q->whereHas('member', fn($mq) => $mq->where('name', 'like', "%{$v}%"))
                )
                ->when($filters['status'] ?? null, fn($q, $v) => $q->where('status', $v))
                ->orderBy('status')
                ->get()
                ->map(fn($p) => [
                    'id'          => $p->id,
                    'member_id'   => $p->member_id,
                    'dues_period_id' => $p->dues_period_id,
                    'amount'      => (float) $p->amount,
                    'paid_at'     => $p->paid_date?->toDateString(),
                    'status'      => $p->status,
                    'notes'       => $p->notes,
                    'member'      => [
                        'no_induk_anggota' => $p->member?->no_induk_anggota,
                        'nama_lengkap' => $p->member?->nama_lengkap,
                    ]
                ]);
        }

        $members = Member::where('status_aktif', true)->orderBy('nama_lengkap')->get(['id', 'nama_lengkap', 'no_induk_anggota']);
        $years   = DuesPeriod::distinct()->pluck('year')->sortDesc()->values();

        return Inertia::render('Dues/Index', [
            'periods'       => $periods, // paginated, will have .data
            'currentPeriod' => $currentPeriod ? [
                'id' => $currentPeriod->id,
                'month' => $currentPeriod->month,
                'year' => $currentPeriod->year,
                'amount' => (float) $currentPeriod->amount,
                'due_date' => $currentPeriod->due_date?->toDateString(),
            ] : null,
            'payments'      => ['data' => $payments], // matches frontend { data: Payment[] }
            'members'       => $members,
            'years'         => $years,
            'filters'       => array_merge($filters, ['period_id' => $currentPeriod?->id]),
        ]);
    }

    // ── Dues Periods ─────────────────────────────────────────────────────────

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'month'    => 'required|integer|between:1,12',
            'year'     => 'required|integer|min:2000|max:2100',
            'amount'   => 'required|numeric|min:0',
            'due_date' => 'nullable|date',
            'notes'    => 'nullable|string',
        ]);

        try {
            // Prevent duplicate period
            $exists = DuesPeriod::where('month', $validated['month'])
                ->where('year', $validated['year'])
                ->exists();

            if ($exists) {
                return back()->with('error', 'Periode iuran untuk bulan dan tahun tersebut sudah ada.');
            }

            DB::transaction(function () use ($validated) {
                $period = DuesPeriod::create($validated);

                // Auto-generate payment rows for all active members
                $members = Member::where('status_aktif', true)->get();
                $now     = now();
                $rows    = $members->map(fn($m) => [
                    'dues_period_id' => $period->id,
                    'member_id'      => $m->id,
                    'amount'         => $period->amount,
                    'status'         => 'unpaid',
                    'created_at'     => $now,
                    'updated_at'     => $now,
                ])->toArray();

                DuesPayment::insert($rows);
            });

            return redirect()->route('dues.index')
                ->with('success', 'Periode iuran berhasil dibuat dan tagihan digenerate.');
        } catch (\Throwable $e) {
            return back()->with('error', 'Gagal membuat periode iuran: ' . $e->getMessage());
        }
    }

    public function update(Request $request, DuesPeriod $due): RedirectResponse
    {
        $validated = $request->validate([
            'amount'   => 'required|numeric|min:0',
            'due_date' => 'nullable|date',
            'notes'    => 'nullable|string',
        ]);

        try {
            $due->update($validated);

            return redirect()->route('dues.index')
                ->with('success', 'Periode iuran berhasil diperbarui.');
        } catch (\Throwable $e) {
            return back()->with('error', 'Gagal memperbarui periode iuran: ' . $e->getMessage());
        }
    }

    public function destroy(DuesPeriod $due): RedirectResponse
    {
        try {
            $due->payments()->delete();
            $due->delete();

            return redirect()->route('dues.index')
                ->with('success', 'Periode iuran berhasil dihapus.');
        } catch (\Throwable $e) {
            return back()->with('error', 'Gagal menghapus periode iuran: ' . $e->getMessage());
        }
    }

    // ── Mark Payment as Paid ─────────────────────────────────────────────────

    public function markPaid(Request $request, DuesPayment $payment): RedirectResponse
    {
        $validated = $request->validate([
            'paid_date' => 'required|date',
            'notes'     => 'nullable|string|max:500',
        ]);

        try {
            DB::transaction(function () use ($validated, $payment) {
                $payment->update([
                    'status'    => 'paid',
                    'paid_date' => $validated['paid_date'],
                    'notes'     => $validated['notes'] ?? $payment->notes,
                ]);

                // Record as income
                $period = $payment->period;
                $member = $payment->member;
                $desc = "Iuran {$member->nama_lengkap} - Periode {$period->month}/{$period->year}";

                FinancialTransaction::create([
                    'type' => 'pemasukan',
                    'amount' => $payment->amount,
                    'category' => 'Iuran Anggota',
                    'description' => $desc,
                    'date' => $validated['paid_date'],
                    'created_by' => auth()->id(),
                ]);
            });

            return back()->with('success', 'Iuran berhasil ditandai sebagai lunas.');
        } catch (\Throwable $e) {
            return back()->with('error', 'Gagal memperbarui status pembayaran: ' . $e->getMessage());
        }
    }

    public function markUnpaid(DuesPayment $payment): RedirectResponse
    {
        try {
            DB::transaction(function () use ($payment) {
                $period = $payment->period;
                $member = $payment->member;
                $desc = "Iuran {$member->nama_lengkap} - Periode {$period->month}/{$period->year}";

                // Remove the associated financial transaction
                FinancialTransaction::where('type', 'pemasukan')
                    ->where('category', 'Iuran Anggota')
                    ->where('description', $desc)
                    ->where('date', $payment->paid_date)
                    ->delete();

                $payment->update([
                    'status'    => 'unpaid',
                    'paid_date' => null,
                ]);
            });

            return back()->with('success', 'Status iuran berhasil diubah ke belum bayar.');
        } catch (\Throwable $e) {
            return back()->with('error', 'Gagal memperbarui status pembayaran: ' . $e->getMessage());
        }
    }
}
