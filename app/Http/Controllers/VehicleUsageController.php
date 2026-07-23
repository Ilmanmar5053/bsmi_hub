<?php

namespace App\Http\Controllers;

use App\Models\Asset;
use App\Models\VehicleUsage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class VehicleUsageController extends Controller
{
    private function checkOverlap($asset_id, $tanggal_mulai, $tanggal_selesai, $ignore_id = null)
    {
        $reqStart = $tanggal_mulai;
        $reqEnd = $tanggal_selesai ?? $reqStart;
        
        return VehicleUsage::where('asset_id', $asset_id)
            ->whereIn('status', ['Diajukan', 'Disetujui', 'Sedang Dipakai', 'Menunggu Pengecekan'])
            ->when($ignore_id, function ($q, $id) {
                $q->where('id', '!=', $id);
            })
            ->where(function ($query) use ($reqStart, $reqEnd) {
                $query->where(function ($q) use ($reqStart, $reqEnd) {
                    $q->whereNull('tanggal_selesai')
                      ->where('tanggal_mulai', '<=', $reqEnd);
                })->orWhere(function ($q) use ($reqStart, $reqEnd) {
                    $q->whereNotNull('tanggal_selesai')
                      ->where('tanggal_mulai', '<=', $reqEnd)
                      ->where('tanggal_selesai', '>=', $reqStart);
                });
            })->exists();
    }

    public function index(Request $request)
    {
        $now = now()->toDateTimeString();
        
        // Auto-update status when reaching start time
        VehicleUsage::where('status', 'Disetujui')
            ->where('tanggal_mulai', '<=', $now)
            ->update(['status' => 'Sedang Dipakai']);
            
        // Auto-update status when reaching end time
        VehicleUsage::where('status', 'Sedang Dipakai')
            ->whereNotNull('tanggal_selesai')
            ->where('tanggal_selesai', '<=', $now)
            ->update(['status' => 'Menunggu Pengecekan']);

        $query = VehicleUsage::with('asset');

        if ($request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('nama_pengaju', 'like', "%{$request->search}%")
                  ->orWhere('pic_pemakai', 'like', "%{$request->search}%")
                  ->orWhere('tujuan', 'like', "%{$request->search}%");
            });
        }

        if ($request->status) {
            $query->where('status', $request->status);
        }

        $sortBy = $request->sort_by ?? 'tanggal_pengajuan';
        $sortDir = $request->sort_direction ?? 'desc';
        $query->orderBy($sortBy, $sortDir);

        $usages = $query->paginate($request->per_page ?? 10)->withQueryString();
        
        $vehicles = Asset::where('kategori_barang', 'like', '%kendaraan%')
                         ->orWhere('kategori_barang', 'like', '%mobil%')
                         ->orWhere('kategori_barang', 'like', '%ambulance%')
                         ->with(['vehicleUsages' => function($q) {
                             $q->whereIn('status', ['Diajukan', 'Disetujui', 'Sedang Dipakai', 'Menunggu Pengecekan']);
                         }])
                         ->get();

        $activeUsages = VehicleUsage::whereIn('status', ['Diajukan', 'Disetujui', 'Sedang Dipakai', 'Menunggu Pengecekan'])
                                    ->select('id', 'asset_id', 'tanggal_mulai', 'tanggal_selesai', 'status')
                                    ->get();

        return Inertia::render('VehicleUsages/Index', [
            'usages' => $usages,
            'vehicles' => $vehicles,
            'active_usages' => $activeUsages,
            'filters' => $request->only(['search', 'status', 'sort_by', 'sort_direction', 'per_page']),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'tanggal_pengajuan' => 'required|date',
            'nama_pengaju' => 'required|string|max:255',
            'asset_id' => 'required|exists:assets,id',
            'pic_pemakai' => 'required|string|max:255',
            'no_telp' => 'required|string|max:20',
            'alasan_keperluan' => 'required|string',
            'tujuan' => 'required|string|max:255',
            'tanggal_mulai' => 'required|date',
            'km_awal' => 'required|integer|min:0',
            'tanggal_selesai' => 'required|date|after_or_equal:tanggal_mulai',
            'km_akhir' => 'nullable|integer|gte:km_awal',
            'ktp' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:2048',
            'status' => 'nullable|string',
        ]);

        if ($this->checkOverlap($request->asset_id, $request->tanggal_mulai, $request->tanggal_selesai)) {
            return back()->withErrors(['asset_id' => 'Kendaraan sudah dipesan pada rentang waktu tersebut.'])->withInput();
        }

        if ($request->hasFile('ktp')) {
            $validated['ktp_path'] = $request->file('ktp')->store('ktp_kendaraan', 'public');
        }

        VehicleUsage::create($validated);

        return back()->with('success', 'Data pengajuan pemakaian kendaraan berhasil ditambahkan.');
    }

    public function update(Request $request, VehicleUsage $vehicleUsage)
    {
        $validated = $request->validate([
            'tanggal_pengajuan' => 'required|date',
            'nama_pengaju' => 'required|string|max:255',
            'asset_id' => 'required|exists:assets,id',
            'pic_pemakai' => 'required|string|max:255',
            'no_telp' => 'required|string|max:20',
            'alasan_keperluan' => 'required|string',
            'tujuan' => 'required|string|max:255',
            'tanggal_mulai' => 'required|date',
            'km_awal' => 'required|integer|min:0',
            'tanggal_selesai' => 'required|date|after_or_equal:tanggal_mulai',
            'km_akhir' => 'nullable|integer|gte:km_awal',
            'ktp' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:2048',
            'status' => 'required|string',
        ]);

        if ($this->checkOverlap($request->asset_id, $request->tanggal_mulai, $request->tanggal_selesai, $vehicleUsage->id)) {
            return back()->withErrors(['asset_id' => 'Kendaraan sudah dipesan pada rentang waktu tersebut.'])->withInput();
        }

        if ($request->hasFile('ktp')) {
            if ($vehicleUsage->ktp_path) {
                Storage::disk('public')->delete($vehicleUsage->ktp_path);
            }
            $validated['ktp_path'] = $request->file('ktp')->store('ktp_kendaraan', 'public');
        }

        $vehicleUsage->update($validated);

        return back()->with('success', 'Data pemakaian kendaraan berhasil diperbarui.');
    }

    public function destroy(VehicleUsage $vehicleUsage)
    {
        if ($vehicleUsage->ktp_path) {
            Storage::disk('public')->delete($vehicleUsage->ktp_path);
        }
        $vehicleUsage->delete();

        return back()->with('success', 'Data pemakaian kendaraan berhasil dihapus.');
    }
}
