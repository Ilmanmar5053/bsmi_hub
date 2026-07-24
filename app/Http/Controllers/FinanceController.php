<?php

namespace App\Http\Controllers;

use App\Exports\FinanceExport;
use App\Exports\FinanceTemplateExport;
use App\Imports\FinanceImport;
use App\Models\FinancialTransaction;
use App\Models\Program;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;
use Maatwebsite\Excel\Facades\Excel;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class FinanceController extends Controller
{
    public function index(Request $request): Response
    {
        $filters = $request->only(['type', 'category', 'date_from', 'date_to', 'search', 'month', 'year', 'sort_by', 'sort_direction']);

        $sortBy = $filters['sort_by'] ?? 'date';
        $sortDirection = $filters['sort_direction'] ?? 'desc';

        $transactions = FinancialTransaction::with(['program', 'creator'])
            ->when($filters['type'] ?? null, fn($q, $v) => $q->where('type', $v))
            ->when($filters['category'] ?? null, fn($q, $v) => $q->where('category', $v))
            ->when($filters['date_from'] ?? null, fn($q, $v) => $q->where('date', '>=', $v))
            ->when($filters['date_to'] ?? null, fn($q, $v) => $q->where('date', '<=', $v))
            ->when($filters['month'] ?? null, fn($q, $v) => $q->whereMonth('date', $v))
            ->when($filters['year'] ?? null, fn($q, $v) => $q->whereYear('date', $v))
            ->when($filters['search'] ?? null, fn($q, $v) =>
                $q->where(function($query) use ($v) {
                    $query->where('description', 'like', "%{$v}%")
                          ->orWhere('notes', 'like', "%{$v}%");
                })
            )
            ->orderBy($sortBy, $sortDirection)
            ->when($sortBy !== 'id', fn($q) => $q->orderBy('id', 'desc'))
            ->paginate(20)
            ->withQueryString()
            ->through(fn($t) => [
                'id'          => $t->id,
                'type'        => $t->type,
                'amount'      => (float) $t->amount,
                'category'    => $t->category,
                'description' => $t->description,
                'date'        => $t->date?->toDateString(),
                'program'     => $t->program?->title,
                'creator'     => $t->creator?->name,
                'notes'       => $t->notes,
            ]);

        // ── Summary stats (filtered range) ────────────────────────────────────
        $summaryQuery = FinancialTransaction::query()
            ->when($filters['date_from'] ?? null, fn($q, $v) => $q->where('date', '>=', $v))
            ->when($filters['date_to'] ?? null, fn($q, $v) => $q->where('date', '<=', $v))
            ->when($filters['month'] ?? null, fn($q, $v) => $q->whereMonth('date', $v))
            ->when($filters['year'] ?? null, fn($q, $v) => $q->whereYear('date', $v));

        $totalIncome  = (clone $summaryQuery)->where('type', 'pemasukan')->sum('amount');
        $totalExpense = (clone $summaryQuery)->where('type', 'pengeluaran')->sum('amount');

        $categories = FinancialTransaction::distinct()->pluck('category')->filter()->sort()->values();
        $programs   = Program::orderBy('title')->get(['id', 'title']);

        $bankAccounts = \App\Models\BankAccount::all();

        return Inertia::render('Finance/Index', [
            'transactions' => $transactions,
            'summary'      => [
                'totalIncome'  => (float) $totalIncome,
                'totalExpense' => (float) $totalExpense,
                'balance'      => (float) ($totalIncome - $totalExpense),
            ],
            'categories'   => $categories,
            'programs'     => $programs,
            'filters'      => $filters,
            'bankAccounts' => $bankAccounts,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'type'        => 'required|in:pemasukan,pengeluaran',
            'amount'      => 'required|numeric|min:0',
            'category'    => 'required|string|max:100',
            'description' => 'required|string|max:500',
            'date'        => 'required|date',
            'program_id'  => 'nullable|exists:programs,id',
            'notes'       => 'nullable|string',
            'attachment'  => 'nullable|file|mimes:jpg,jpeg,png,pdf|max:4096',
        ]);

        try {
            if ($request->hasFile('attachment')) {
                $validated['attachment_path'] = $request->file('attachment')
                    ->store('finance/attachments', 'public');
            }
            unset($validated['attachment']);

            $validated['created_by'] = auth()->id();
            FinancialTransaction::create($validated);

            return redirect()->route('finance.index')
                ->with('success', 'Transaksi arus kas berhasil disimpan.');
        } catch (\Throwable $e) {
            return back()->with('error', 'Gagal menyimpan transaksi: ' . $e->getMessage());
        }
    }

    public function update(Request $request, FinancialTransaction $finance): RedirectResponse
    {
        $validated = $request->validate([
            'type'        => 'required|in:pemasukan,pengeluaran',
            'amount'      => 'required|numeric|min:0',
            'category'    => 'required|string|max:100',
            'description' => 'required|string|max:500',
            'date'        => 'required|date',
            'program_id'  => 'nullable|exists:programs,id',
            'notes'       => 'nullable|string',
            'attachment'  => 'nullable|file|mimes:jpg,jpeg,png,pdf|max:4096',
        ]);

        try {
            if ($request->hasFile('attachment')) {
                if ($finance->attachment_path) {
                    Storage::disk('public')->delete($finance->attachment_path);
                }
                $validated['attachment_path'] = $request->file('attachment')
                    ->store('finance/attachments', 'public');
            }
            unset($validated['attachment']);

            $finance->update($validated);

            return redirect()->route('finance.index')
                ->with('success', 'Transaksi arus kas berhasil diperbarui.');
        } catch (\Throwable $e) {
            return back()->with('error', 'Gagal memperbarui transaksi: ' . $e->getMessage());
        }
    }

    public function destroy(FinancialTransaction $finance): RedirectResponse
    {
        try {
            if ($finance->attachment_path) {
                Storage::disk('public')->delete($finance->attachment_path);
            }
            $finance->delete();

            return redirect()->route('finance.index')
                ->with('success', 'Transaksi arus kas berhasil dihapus.');
        } catch (\Throwable $e) {
            return back()->with('error', 'Gagal menghapus transaksi: ' . $e->getMessage());
        }
    }

    public function exportExcel(Request $request): BinaryFileResponse
    {
        $filters = $request->only(['type', 'category', 'date_from', 'date_to', 'month', 'year']);
        return Excel::download(
            new FinanceExport($filters),
            'arus-kas-' . now()->format('Ymd') . '.xlsx'
        );
    }

    public function downloadTemplate(): BinaryFileResponse
    {
        return Excel::download(new FinanceTemplateExport(), 'template-import-arus-kas.xlsx');
    }

    public function importExcel(Request $request): RedirectResponse
    {
        $request->validate([
            'file' => 'required|mimes:xlsx,xls,csv|max:10240',
        ]);

        try {
            Excel::import(new FinanceImport, $request->file('file'));
            return back()->with('success', 'Data arus kas berhasil diimport.');
        } catch (\Maatwebsite\Excel\Validators\ValidationException $e) {
            return back()->with('error', 'Gagal import: Periksa format data Excel.');
        } catch (\Throwable $e) {
            return back()->with('error', 'Terjadi kesalahan saat import: ' . $e->getMessage());
        }
    }
}
