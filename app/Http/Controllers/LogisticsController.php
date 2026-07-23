<?php

namespace App\Http\Controllers;

use App\Models\Beneficiary;
use App\Models\LogisticsItem;
use App\Models\Asset;
use App\Models\LogisticsTransaction;
use App\Models\Program;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class LogisticsController extends Controller
{
    public function index(Request $request): Response
    {
        $filters = $request->only(['search', 'category', 'sort_by', 'sort_direction']);
        $sortBy = $filters['sort_by'] ?? 'name';
        $sortDirection = $filters['sort_direction'] ?? 'asc';

        $items = LogisticsItem::query()
            ->when($filters['search'] ?? null, fn($q, $v) =>
                $q->where('name', 'like', "%{$v}%")
                  ->orWhere('location', 'like', "%{$v}%")
            )
            ->when($filters['category'] ?? null, fn($q, $v) => $q->where('category', $v))
            ->orderBy($sortBy, $sortDirection)
            ->when($sortBy !== 'id', fn($q) => $q->orderBy('id', 'desc'))
            ->paginate(15)
            ->withQueryString()
            ->through(fn($item) => [
                'id'          => $item->id,
                'name'        => $item->name,
                'category'    => $item->category,
                'quantity'    => $item->quantity,
                'unit'        => $item->unit,
                'condition'   => $item->condition,
                'location'    => $item->location,
                'expiry_date' => $item->expiry_date?->toDateString(),
                'notes'       => $item->notes,
            ]);

        // Recent transactions (last 20)
        $recentTransactions = LogisticsTransaction::with(['item', 'beneficiary', 'program', 'creator'])
            ->orderByDesc('date')
            ->limit(20)
            ->get()
            ->map(fn($t) => [
                'id'             => $t->id,
                'item_name'      => $t->item?->name,
                'type'           => $t->type,
                'quantity'       => $t->quantity,
                'date'           => $t->date?->toDateString(),
                'source'         => $t->source,
                'destination'    => $t->destination,
                'donor_name'     => $t->donor_name,
                'beneficiary'    => $t->beneficiary?->name,
                'program'        => $t->program?->title,
                'notes'          => $t->notes,
            ]);

        $beneficiaries = Beneficiary::orderBy('name')->get(['id', 'name']);
        $programs      = Program::where('status', 'ongoing')->orderBy('title')->get(['id', 'title']);

        $vehicles = Asset::where('kategori_barang', 'like', '%kendaraan%')
                         ->orWhere('kategori_barang', 'like', '%mobil%')
                         ->orWhere('kategori_barang', 'like', '%ambulance%')
                         ->with(['vehicleUsages' => function($q) {
                             $q->whereIn('status', ['Diajukan', 'Disetujui', 'Sedang Dipakai', 'Menunggu Pengecekan']);
                         }])
                         ->get();

        return Inertia::render('Logistics/Index', [
            'items'              => $items,
            'recentTransactions' => $recentTransactions,
            'beneficiaries'      => $beneficiaries,
            'programs'           => $programs,
            'vehicles'           => $vehicles,
            'filters'            => $filters,
        ]);
    }

    // ── Logistics Items CRUD ─────────────────────────────────────────────────

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name'        => 'required|string|max:255',
            'category'    => 'required|string|max:100',
            'quantity'    => 'required|integer|min:0',
            'unit'        => 'required|string|max:50',
            'condition'   => 'nullable|in:baik,rusak_ringan,rusak_berat',
            'location'    => 'nullable|string|max:255',
            'expiry_date' => 'nullable|date',
            'notes'       => 'nullable|string',
        ]);

        try {
            LogisticsItem::create($validated);

            return redirect()->route('logistics.index')
                ->with('success', 'Barang logistik berhasil disimpan.');
        } catch (\Throwable $e) {
            return back()->with('error', 'Gagal menyimpan barang logistik: ' . $e->getMessage());
        }
    }

    public function update(Request $request, LogisticsItem $logistic): RedirectResponse
    {
        $validated = $request->validate([
            'name'        => 'required|string|max:255',
            'category'    => 'required|string|max:100',
            'quantity'    => 'required|integer|min:0',
            'unit'        => 'required|string|max:50',
            'condition'   => 'nullable|in:baik,rusak_ringan,rusak_berat',
            'location'    => 'nullable|string|max:255',
            'expiry_date' => 'nullable|date',
            'notes'       => 'nullable|string',
        ]);

        try {
            $logistic->update($validated);

            return redirect()->route('logistics.index')
                ->with('success', 'Barang logistik berhasil diperbarui.');
        } catch (\Throwable $e) {
            return back()->with('error', 'Gagal memperbarui barang logistik: ' . $e->getMessage());
        }
    }

    public function destroy(LogisticsItem $logistic): RedirectResponse
    {
        try {
            $logistic->delete();

            return redirect()->route('logistics.index')
                ->with('success', 'Barang logistik berhasil dihapus.');
        } catch (\Throwable $e) {
            return back()->with('error', 'Gagal menghapus barang logistik: ' . $e->getMessage());
        }
    }

    // ── Logistics Transactions ───────────────────────────────────────────────

    public function storeTransaction(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'logistics_item_id' => 'required|exists:logistics_items,id',
            'type'              => 'required|in:masuk,keluar',
            'quantity'          => 'required|integer|min:1',
            'date'              => 'required|date',
            'source'            => 'nullable|string|max:255',
            'destination'       => 'nullable|string|max:255',
            'donor_name'        => 'nullable|string|max:255',
            'beneficiary_id'    => 'nullable|exists:beneficiaries,id',
            'program_id'        => 'nullable|exists:programs,id',
            'notes'             => 'nullable|string',
        ]);

        try {
            DB::transaction(function () use ($validated) {
                LogisticsTransaction::create(
                    array_merge($validated, ['created_by' => auth()->id()])
                );

                $item = LogisticsItem::findOrFail($validated['logistics_item_id']);

                // Adjust stock based on transaction type
                if ($validated['type'] === 'masuk') {
                    $item->increment('quantity', $validated['quantity']);
                } elseif ($validated['type'] === 'keluar') {
                    if ($item->quantity < $validated['quantity']) {
                        throw new \RuntimeException('Stok tidak mencukupi.');
                    }
                    $item->decrement('quantity', $validated['quantity']);
                }
            });

            return redirect()->route('logistics.index')
                ->with('success', 'Transaksi logistik berhasil dicatat.');
        } catch (\Throwable $e) {
            return back()->with('error', 'Gagal mencatat transaksi: ' . $e->getMessage());
        }
    }
}
