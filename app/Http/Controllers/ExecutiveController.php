<?php

namespace App\Http\Controllers;

use App\Models\Executive;
use App\Models\Member;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class ExecutiveController extends Controller
{
    public function index(Request $request): Response
    {
        $executives = Executive::with('member')
            ->when($request->search, fn($q, $v) => $q->where('nama_lengkap', 'like', "%{$v}%"))
            ->when($request->bagian_divisi, fn($q, $v) => $q->where('bagian_divisi', $v))
            ->when($request->filled('status_aktif'), fn($q) => $q->where('status_aktif', filter_var($request->status_aktif, FILTER_VALIDATE_BOOLEAN)))
            ->orderByDesc('status_aktif')
            ->orderBy('bagian_divisi')
            ->orderBy('nama_lengkap')
            ->paginate(15)
            ->withQueryString()
            ->through(fn($e) => [
                'id'           => $e->id,
                'member_id'    => $e->member_id,
                'member_name'  => $e->member?->nama_lengkap,
                'nama_lengkap' => $e->nama_lengkap,
                'jabatan'      => $e->jabatan,
                'bagian_divisi'=> $e->bagian_divisi,
                'periode_mulai'=> $e->periode_mulai?->toDateString(),
                'periode_selesai'=> $e->periode_selesai?->toDateString(),
                'status_aktif' => $e->status_aktif,
                'profesi_utama'=> $e->profesi_utama,
                'golongan_darah'=> $e->golongan_darah,
                'kesiapan_mobilisasi'=> $e->kesiapan_mobilisasi,
                'ukuran_baju'  => $e->ukuran_baju,
                'photo_url'    => $e->photo_url,
                'notes'        => $e->notes,
            ]);

        $members = Member::where('status_aktif', true)
            ->orderBy('nama_lengkap')
            ->get(['id', 'nama_lengkap', 'no_induk_anggota']);

        return Inertia::render('Executives/Index', [
            'executives' => $executives,
            'members'    => $members,
            'filters'    => $request->only(['search', 'bagian_divisi', 'status_aktif']),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'member_id'    => 'nullable|exists:members,id',
            'nama_lengkap' => 'required|string|max:255',
            'jabatan'      => 'required|string|max:100',
            'bagian_divisi'=> 'nullable|string|max:100',
            'periode_mulai'=> 'nullable|date',
            'periode_selesai'=> 'nullable|date|after_or_equal:periode_mulai',
            'status_aktif' => 'boolean',
            'profesi_utama'=> 'nullable|string|max:100',
            'golongan_darah'=> 'nullable|string|max:5',
            'kesiapan_mobilisasi'=> 'boolean',
            'ukuran_baju'  => 'nullable|string|max:10',
            'notes'        => 'nullable|string',
            'photo'        => 'nullable|image|mimes:jpg,jpeg,png,webp|max:2048',
        ]);

        try {
            if ($request->hasFile('photo')) {
                $validated['photo_path'] = $request->file('photo')->store('executives', 'public');
            }
            unset($validated['photo']);

            Executive::create($validated);

            return redirect()->route('executives.index')
                ->with('success', 'Data pengurus berhasil disimpan.');
        } catch (\Throwable $e) {
            return back()->with('error', 'Gagal menyimpan data pengurus: ' . $e->getMessage());
        }
    }

    public function update(Request $request, Executive $executive): RedirectResponse
    {
        $validated = $request->validate([
            'member_id'    => 'nullable|exists:members,id',
            'nama_lengkap' => 'required|string|max:255',
            'jabatan'      => 'required|string|max:100',
            'bagian_divisi'=> 'nullable|string|max:100',
            'periode_mulai'=> 'nullable|date',
            'periode_selesai'=> 'nullable|date|after_or_equal:periode_mulai',
            'status_aktif' => 'boolean',
            'profesi_utama'=> 'nullable|string|max:100',
            'golongan_darah'=> 'nullable|string|max:5',
            'kesiapan_mobilisasi'=> 'boolean',
            'ukuran_baju'  => 'nullable|string|max:10',
            'notes'        => 'nullable|string',
            'photo'        => 'nullable|image|mimes:jpg,jpeg,png,webp|max:2048',
        ]);

        try {
            if ($request->hasFile('photo')) {
                if ($executive->photo_path) {
                    Storage::disk('public')->delete($executive->photo_path);
                }
                $validated['photo_path'] = $request->file('photo')->store('executives', 'public');
            }
            unset($validated['photo']);

            $executive->update($validated);

            return redirect()->route('executives.index')
                ->with('success', 'Data pengurus berhasil diperbarui.');
        } catch (\Throwable $e) {
            return back()->with('error', 'Gagal memperbarui data pengurus: ' . $e->getMessage());
        }
    }

    public function destroy(Executive $executive): RedirectResponse
    {
        try {
            if ($executive->photo_path) {
                Storage::disk('public')->delete($executive->photo_path);
            }
            $executive->delete();

            return redirect()->route('executives.index')
                ->with('success', 'Data pengurus berhasil dihapus.');
        } catch (\Throwable $e) {
            return back()->with('error', 'Gagal menghapus data pengurus: ' . $e->getMessage());
        }
    }
}
