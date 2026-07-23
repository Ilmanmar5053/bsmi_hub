<?php

namespace App\Http\Controllers;

use App\Models\Executive;
use App\Models\Member;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use App\Models\OrganizationProfile;
use Inertia\Inertia;
use Inertia\Response;

class ExecutiveController extends Controller
{
    public function index(Request $request): Response
    {
        $executives = Executive::with('member')
            ->when($request->regional_cabang, fn($q, $v) => $q->where('regional_cabang', $v))
            ->when($request->search, function ($q, $v) {
                $q->where(function ($q) use ($v) {
                    $q->where('nama_lengkap', 'like', "%{$v}%")
                      ->orWhere('jabatan', 'like', "%{$v}%")
                      ->orWhere('bagian_divisi', 'like', "%{$v}%")
                      ->orWhere('regional_cabang', 'like', "%{$v}%")
                      ->orWhereHas('member', function ($q) use ($v) {
                          $q->where('no_induk_anggota', 'like', "%{$v}%")
                            ->orWhere('nama_lengkap', 'like', "%{$v}%");
                      });
                });
            })
            ->when($request->bagian_divisi, fn($q, $v) => $q->where('bagian_divisi', $v))
            ->when($request->filled('status_aktif'), fn($q) => $q->where('status_aktif', filter_var($request->status_aktif, FILTER_VALIDATE_BOOLEAN)))
            ->orderBy('regional_cabang')
            ->orderByDesc('status_aktif')
            ->orderBy('bagian_divisi')
            ->orderBy('nama_lengkap')
            ->paginate($request->regional_cabang ? 15 : 500)
            ->withQueryString()
            ->through(fn($e) => [
                'id'           => $e->id,
                'member_id'    => $e->member_id,
                'regional_cabang' => $e->regional_cabang,
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
                'member_no_hp' => $e->member?->no_whatsapp ?? $e->member?->no_hp,
                'member_email' => $e->member?->email,
                'member_alamat'=> $e->member?->alamat_domisili,
                'member_nia'   => $e->member?->no_induk_anggota,
                'member_gender'=> $e->member?->gender,
                'member_pendidikan' => $e->member?->pendidikan_terakhir,
                'member_jurusan' => $e->member?->jurusan,
                'member_agama' => $e->member?->agama,
                'member_status_keluarga' => $e->member?->status_keluarga,
                'member_jumlah_tanggungan' => $e->member?->jumlah_tanggungan,
            ]);

        $usedMemberIds = Executive::whereNotNull('member_id')->pluck('member_id')->toArray();

        $members = Member::where('status_aktif', true)
            ->orderBy('nama_lengkap')
            ->get(['id', 'nama_lengkap', 'no_induk_anggota', 'profesi_utama', 'golongan_darah', 'kesiapan_mobilisasi', 'ukuran_baju', 'regional_cabang', 'bagian_divisi']);

        $orgProfile = OrganizationProfile::first();
        $regionalLogos = $orgProfile ? $orgProfile->regional_logos : [];

        return Inertia::render('Executives/Index', [
            'executives' => $executives,
            'members'    => $members,
            'usedMemberIds' => $usedMemberIds,
            'regionalLogos' => $regionalLogos,
            'filters'    => $request->only(['search', 'bagian_divisi', 'status_aktif', 'regional_cabang']),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'member_id'    => 'nullable|exists:members,id|unique:executives,member_id',
            'regional_cabang' => 'nullable|string|max:100',
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
        ], [
            'member_id.unique' => 'Nama anggota ini tidak dapat digunakan karena sudah masuk dalam daftar pengurus.',
        ]);

        try {
            if ($request->hasFile('photo')) {
                $validated['photo_path'] = $request->file('photo')->store('executives', 'public');
            }
            unset($validated['photo']);

            Executive::create($validated);

            $redirectParams = $request->regional_cabang ? ['regional_cabang' => $request->regional_cabang] : [];
            return redirect()->route('executives.index', $redirectParams)
                ->with('success', 'Data pengurus berhasil disimpan.');
        } catch (\Throwable $e) {
            return back()->with('error', 'Gagal menyimpan data pengurus: ' . $e->getMessage());
        }
    }

    public function update(Request $request, Executive $executive): RedirectResponse
    {
        $validated = $request->validate([
            'member_id'    => 'nullable|exists:members,id|unique:executives,member_id,' . $executive->id,
            'regional_cabang' => 'nullable|string|max:100',
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
        ], [
            'member_id.unique' => 'Nama anggota ini tidak dapat digunakan karena sudah masuk dalam daftar pengurus.',
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

            $redirectParams = $request->regional_cabang ? ['regional_cabang' => $request->regional_cabang] : [];
            return redirect()->route('executives.index', $redirectParams)
                ->with('success', 'Data pengurus berhasil diperbarui.');
        } catch (\Throwable $e) {
            return back()->with('error', 'Gagal memperbarui data pengurus: ' . $e->getMessage());
        }
    }

    public function destroy(Request $request, Executive $executive): RedirectResponse
    {
        try {
            if ($executive->photo_path) {
                Storage::disk('public')->delete($executive->photo_path);
            }
            $executive->delete();

            $redirectParams = $request->regional_cabang ? ['regional_cabang' => $request->regional_cabang] : [];
            return redirect()->route('executives.index', $redirectParams)
                ->with('success', 'Data pengurus berhasil dihapus.');
        } catch (\Throwable $e) {
            return back()->with('error', 'Gagal menghapus data pengurus: ' . $e->getMessage());
        }
    }
}
