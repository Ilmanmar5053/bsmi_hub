<?php

namespace App\Http\Controllers;

use App\Models\Asset;
use App\Models\Member;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Storage;

class AssetController extends Controller
{
    public function index(Request $request): Response
    {
        $search = $request->get('search');
        $category = $request->get('category');
        $sortBy = $request->get('sort_by') ?? 'created_at';
        $sortDirection = $request->get('sort_direction') ?? 'desc';
        
        $assets = Asset::with('pic:id,nama_lengkap')
            ->when($search, function ($query, $search) {
                $query->where('nama_barang', 'like', "%{$search}%")
                      ->orWhere('nomor_sku_serial', 'like', "%{$search}%");
            })
            ->when($category, function ($query, $category) {
                $query->where('kategori_barang', $category);
            })
            ->orderBy($sortBy, $sortDirection)
            ->when($sortBy !== 'id', fn($q) => $q->orderBy('id', 'desc'))
            ->paginate(15)
            ->withQueryString();

        $members = Member::where('status_aktif', true)->select('id', 'nama_lengkap', 'no_induk_anggota', 'regional_cabang')->get();
        $regionals = $members->pluck('regional_cabang')->filter()->unique()->values();

        $topAssets = Asset::whereNotNull('nilai_aset')
            ->orderBy('nilai_aset', 'desc')
            ->take(5)
            ->get();

        return Inertia::render('Assets/Index', [
            'assets' => $assets,
            'members' => $members,
            'regionals' => $regionals,
            'filters' => [
                'search' => $search,
                'category' => $category,
                'sort_by' => $sortBy,
                'sort_direction' => $sortDirection,
            ],
            'topAssets' => $topAssets,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'nama_barang' => 'required|string|max:255',
            'kategori_barang' => 'required|string|max:255',
            'nilai_aset' => 'nullable|integer',
            'tipe_model' => 'nullable|string|max:255',
            'nomor_sku_serial' => 'nullable|string|max:255',
            'tanggal_pembelian' => 'nullable|date',
            'kepemilikan' => 'nullable|string|max:255',
            'pic_id' => 'nullable|exists:members,id',
            'foto_aset' => 'nullable|image|max:5120', // 5MB max
            'lokasi' => 'nullable|string|max:255',
            'tanggal_stock_opname' => 'nullable|date',
        ]);

        if ($request->hasFile('foto_aset')) {
            $path = $request->file('foto_aset')->store('assets', 'public');
            $validated['foto_aset'] = '/storage/' . $path;
        }

        Asset::create($validated);

        return back()->with('success', 'Aset berhasil ditambahkan.');
    }

    public function update(Request $request, Asset $asset): RedirectResponse
    {
        $validated = $request->validate([
            'nama_barang' => 'required|string|max:255',
            'kategori_barang' => 'required|string|max:255',
            'nilai_aset' => 'nullable|integer',
            'tipe_model' => 'nullable|string|max:255',
            'nomor_sku_serial' => 'nullable|string|max:255',
            'tanggal_pembelian' => 'nullable|date',
            'kepemilikan' => 'nullable|string|max:255',
            'pic_id' => 'nullable|exists:members,id',
            'foto_aset' => 'nullable|image|max:5120',
            'lokasi' => 'nullable|string|max:255',
            'tanggal_stock_opname' => 'nullable|date',
        ]);

        if ($request->hasFile('foto_aset')) {
            if ($asset->foto_aset) {
                $oldPath = str_replace('/storage/', '', $asset->foto_aset);
                Storage::disk('public')->delete($oldPath);
            }
            $path = $request->file('foto_aset')->store('assets', 'public');
            $validated['foto_aset'] = '/storage/' . $path;
        }

        $asset->update($validated);

        return back()->with('success', 'Aset berhasil diperbarui.');
    }

    public function destroy(Asset $asset): RedirectResponse
    {
        if ($asset->foto_aset) {
            $oldPath = str_replace('/storage/', '', $asset->foto_aset);
            Storage::disk('public')->delete($oldPath);
        }
        
        $asset->delete();
        
        return back()->with('success', 'Aset berhasil dihapus.');
    }
}
