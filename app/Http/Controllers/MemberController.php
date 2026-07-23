<?php

namespace App\Http\Controllers;

use App\Exports\MembersExport;
use App\Models\Member;
use App\Models\User;
use App\Models\Volunteer;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;
use Maatwebsite\Excel\Facades\Excel;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class MemberController extends Controller
{
    public function index(Request $request): Response
    {
        $filters = $request->only(['search', 'status_aktif', 'bagian_divisi', 'per_page', 'sort_by', 'sort_direction']);
        $perPage = $filters['per_page'] ?? '10';
        $sortBy = $filters['sort_by'] ?? 'nama_lengkap';
        $sortDirection = $filters['sort_direction'] ?? 'asc';

        $query = Member::query()
            ->withExists(['executives' => fn ($q) => $q->where('status_aktif', true)])
            ->when($filters['search'] ?? null, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('nama_lengkap', 'like', "%{$search}%")
                      ->orWhere('no_induk_anggota', 'like', "%{$search}%");
                });
            })
            ->when(isset($filters['status_aktif']) && $filters['status_aktif'] !== '', function ($q) use ($filters) {
                $val = $filters['status_aktif'] === 'active' || $filters['status_aktif'] === '1' ? true : false;
                $q->where('status_aktif', $val);
            })
            ->when($filters['bagian_divisi'] ?? null, fn($q, $v) => $q->where('bagian_divisi', $v))
            ->orderBy($sortBy, $sortDirection)
            ->when($sortBy !== 'id', fn($q) => $q->orderBy('id', 'desc'));

        $memberMap = fn($member) => [
            'id'            => $member->id,
            'no_induk_anggota' => $member->no_induk_anggota,
            'nama_lengkap'  => $member->nama_lengkap,
            'gender'        => $member->gender,
            'email'         => $member->email,
            'no_whatsapp'   => $member->no_whatsapp,
            'bagian_divisi'  => $member->bagian_divisi,
            'status_aktif'  => $member->status_aktif,
            'join_date'     => $member->join_date?->toDateString(),
            'birth_date'    => $member->birth_date?->toDateString(),
            'alamat_domisili' => $member->alamat_domisili,
            'golongan_darah'=> $member->golongan_darah,
            'profesi_utama' => $member->profesi_utama,
            'kesiapan_mobilisasi' => $member->kesiapan_mobilisasi,
            'ukuran_baju'   => $member->ukuran_baju,
            'emergency_contact' => $member->emergency_contact,
            'emergency_phone' => $member->emergency_phone,
            'notes' => $member->notes,
            'photo_url'     => $member->photo_url,
            'user_id'       => $member->user_id,
            'regional_cabang'      => $member->regional_cabang,
            'pendidikan_terakhir'  => $member->pendidikan_terakhir,
            'jurusan'              => $member->jurusan,
            'status_keluarga'      => $member->status_keluarga,
            'agama'                => $member->agama,
            'jumlah_tanggungan'    => $member->jumlah_tanggungan,
            'is_pengurus'          => $member->executives_exists ?? false,
        ];

        if ($perPage === 'all') {
            $allMembers = $query->get()->map($memberMap);
            $members = new \Illuminate\Pagination\LengthAwarePaginator(
                $allMembers, $allMembers->count(), $allMembers->count() ?: 1, 1,
                ['path' => request()->url(), 'query' => request()->query()]
            );
        } else {
            $members = $query->paginate((int) $perPage)
                ->withQueryString()
                ->through($memberMap);
        }

        $stats = [
            'total' => Member::count(),
            'gender' => Member::selectRaw('gender, count(*) as count')->groupBy('gender')->pluck('count', 'gender'),
            'profesi' => Member::selectRaw('profesi_utama, count(*) as count')->whereNotNull('profesi_utama')->where('profesi_utama', '!=', '')->groupBy('profesi_utama')->pluck('count', 'profesi_utama'),
            'golongan_darah' => Member::selectRaw('golongan_darah, count(*) as count')->whereNotNull('golongan_darah')->where('golongan_darah', '!=', '')->groupBy('golongan_darah')->pluck('count', 'golongan_darah'),
            'regional' => Member::selectRaw('regional_cabang, count(*) as count')->whereNotNull('regional_cabang')->where('regional_cabang', '!=', '')->groupBy('regional_cabang')->pluck('count', 'regional_cabang'),
        ];

        $eligibleVolunteers = Volunteer::query()
            ->where('status', 'approved')
            ->where('diklatsar_stage', 6)
            ->whereNotIn('email', function ($query) {
                $query->select('email')->from('members')->whereNotNull('email');
            })
            ->orderBy('name')
            ->get()
            ->map(fn($v) => [
                'id' => $v->id,
                'name' => $v->name,
                'email' => $v->email,
                'phone' => $v->phone,
                'gender' => $v->gender,
                'birth_date' => $v->birth_date?->toDateString(),
                'address' => $v->address,
                'occupation' => $v->occupation,
                'golongan_darah' => $v->golongan_darah,
                'regional_cabang' => $v->regional_cabang,
                'pendidikan_terakhir' => $v->pendidikan_terakhir,
                'jurusan' => $v->jurusan,
                'status_keluarga' => $v->status_keluarga,
                'agama' => $v->agama,
                'jumlah_tanggungan' => $v->jumlah_tanggungan,
                'kesiapan_mobilisasi' => (bool)$v->kesiapan_mobilisasi,
                'ukuran_baju' => $v->ukuran_baju,
                'emergency_contact' => $v->emergency_contact,
                'emergency_phone' => $v->emergency_phone,
                'user_id' => $v->user_id,
            ]);

        return Inertia::render('Members/Index', [
            'members' => $members,
            'filters' => $filters,
            'stats'   => $stats,
            'eligibleVolunteers' => $eligibleVolunteers,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        if ($request->filled('no_induk_anggota')) {
            $existing = Member::where('no_induk_anggota', $request->input('no_induk_anggota'))->first();
            if ($existing) {
                $msg = "Nomor Induk Anggota sudah dipakai di {$existing->nama_lengkap}, gunakan No Induk yg sesuai dengan di Kartu Tanda Anggota BSMI";
                return back()->withErrors(['no_induk_anggota' => $msg])->with('error', $msg)->withInput();
            }
        }

        $validated = $request->validate([
            'no_induk_anggota' => 'required|string|max:50',
            'nama_lengkap'     => 'required|string|max:255',
            'gender'           => 'nullable|in:L,P',
            'email'            => 'nullable|email|max:255|unique:members,email',
            'no_whatsapp'      => 'nullable|string|max:20',
            'bagian_divisi'    => 'nullable|string|max:100',
            'status_aktif'     => 'boolean',
            'join_date'        => 'nullable|date',
            'birth_date'       => 'nullable|date',
            'alamat_domisili'  => 'nullable|string|max:500',
            'golongan_darah'   => 'nullable|string|max:5',
            'profesi_utama'    => 'nullable|string|max:100',
            'kesiapan_mobilisasi' => 'boolean',
            'ukuran_baju'      => 'nullable|string|max:10',
            'emergency_contact' => 'nullable|string|max:255',
            'emergency_phone'  => 'nullable|string|max:20',
            'notes'            => 'nullable|string',
            'photo'            => 'nullable|image|mimes:jpg,jpeg,png,webp|max:2048',
            'regional_cabang'      => 'nullable|string|max:100',
            'pendidikan_terakhir'  => 'nullable|string|max:50',
            'jurusan'              => 'nullable|string|max:100',
            'status_keluarga'      => 'nullable|string|max:50',
            'agama'                => 'nullable|string|max:50',
            'jumlah_tanggungan'    => 'nullable|string|max:20',
            'volunteer_id'         => 'nullable|exists:volunteers,id',
        ]);

        try {
            if ($request->hasFile('photo')) {
                $validated['photo_path'] = $request->file('photo')->store('members', 'public');
            }
            unset($validated['photo']);

            // Sync with Volunteer if volunteer_id is provided
            if ($request->filled('volunteer_id')) {
                $volunteer = Volunteer::find($request->input('volunteer_id'));
                if ($volunteer) {
                    // Update user_id in member
                    $validated['user_id'] = $volunteer->user_id;

                    // Sync photo_path from volunteer if member has no photo uploaded
                    if (!isset($validated['photo_path']) && $volunteer->photo_path) {
                        $validated['photo_path'] = $volunteer->photo_path;
                    }

                    // Sync changes back to the Volunteer record
                    $volunteerData = [
                        'name' => $validated['nama_lengkap'],
                        'gender' => $validated['gender'] ?? null,
                        'email' => $validated['email'] ?? null,
                        'phone' => $validated['no_whatsapp'] ?? null,
                        'address' => $validated['alamat_domisili'] ?? null,
                        'golongan_darah' => $validated['golongan_darah'] ?? null,
                        'regional_cabang' => $validated['regional_cabang'] ?? null,
                        'occupation' => $validated['profesi_utama'] ?? null,
                        'pendidikan_terakhir' => $validated['pendidikan_terakhir'] ?? null,
                        'jurusan' => $validated['jurusan'] ?? null,
                        'status_keluarga' => $validated['status_keluarga'] ?? null,
                        'agama' => $validated['agama'] ?? null,
                        'jumlah_tanggungan' => $validated['jumlah_tanggungan'] ?? null,
                        'kesiapan_mobilisasi' => $validated['kesiapan_mobilisasi'] ?? false,
                        'ukuran_baju' => $validated['ukuran_baju'] ?? null,
                        'emergency_contact' => $validated['emergency_contact'] ?? null,
                        'emergency_phone' => $validated['emergency_phone'] ?? null,
                    ];
                    
                    if (isset($validated['photo_path'])) {
                        $volunteerData['photo_path'] = $validated['photo_path'];
                    }

                    $volunteer->update($volunteerData);
                }
            }
            unset($validated['volunteer_id']);

            Member::create($validated);

            return redirect()->route('members.index')
                ->with('success', 'Data anggota berhasil disimpan.');
        } catch (\Throwable $e) {
            return back()->with('error', 'Gagal menyimpan data anggota: ' . $e->getMessage());
        }
    }

    public function update(Request $request, Member $member): RedirectResponse
    {
        if ($request->filled('no_induk_anggota') && $request->input('no_induk_anggota') !== $member->no_induk_anggota) {
            $existing = Member::where('no_induk_anggota', $request->input('no_induk_anggota'))->first();
            if ($existing) {
                $msg = "Nomor Induk Anggota sudah dipakai di {$existing->nama_lengkap}, gunakan No Induk yg sesuai dengan di Kartu Tanda Anggota BSMI";
                return back()->withErrors(['no_induk_anggota' => $msg])->with('error', $msg)->withInput();
            }
        }

        $validated = $request->validate([
            'no_induk_anggota' => 'required|string|max:50',
            'nama_lengkap'     => 'required|string|max:255',
            'gender'           => 'nullable|in:L,P',
            'email'            => 'nullable|email|max:255|unique:members,email,' . $member->id,
            'no_whatsapp'      => 'nullable|string|max:20',
            'bagian_divisi'    => 'nullable|string|max:100',
            'status_aktif'     => 'boolean',
            'join_date'        => 'nullable|date',
            'birth_date'       => 'nullable|date',
            'alamat_domisili'  => 'nullable|string|max:500',
            'golongan_darah'   => 'nullable|string|max:5',
            'profesi_utama'    => 'nullable|string|max:100',
            'kesiapan_mobilisasi' => 'boolean',
            'ukuran_baju'      => 'nullable|string|max:10',
            'emergency_contact' => 'nullable|string|max:255',
            'emergency_phone'  => 'nullable|string|max:20',
            'notes'            => 'nullable|string',
            'photo'            => 'nullable|image|mimes:jpg,jpeg,png,webp|max:2048',
            'regional_cabang'      => 'nullable|string|max:100',
            'pendidikan_terakhir'  => 'nullable|string|max:50',
            'jurusan'              => 'nullable|string|max:100',
            'status_keluarga'      => 'nullable|string|max:50',
            'agama'                => 'nullable|string|max:50',
            'jumlah_tanggungan'    => 'nullable|string|max:20',
        ]);

        try {
            if ($request->hasFile('photo')) {
                // Remove old photo
                if ($member->photo_path) {
                    Storage::disk('public')->delete($member->photo_path);
                }
                $validated['photo_path'] = $request->file('photo')->store('members', 'public');
            }
            unset($validated['photo']);

            $member->update($validated);

            return redirect()->route('members.index')
                ->with('success', 'Data anggota berhasil diperbarui.');
        } catch (\Throwable $e) {
            return back()->with('error', 'Gagal memperbarui data anggota: ' . $e->getMessage());
        }
    }

    public function destroy(Member $member): RedirectResponse
    {
        try {
            if ($member->photo_path) {
                Storage::disk('public')->delete($member->photo_path);
            }
            $member->delete();

            return redirect()->route('members.index')
                ->with('success', 'Data anggota berhasil dihapus.');
        } catch (\Throwable $e) {
            return back()->with('error', 'Gagal menghapus data anggota: ' . $e->getMessage());
        }
    }

    public function exportExcel(): BinaryFileResponse
    {
        return Excel::download(new MembersExport(), 'anggota-' . now()->format('Ymd') . '.xlsx');
    }

    public function toggleStatus(Member $member): RedirectResponse
    {
        try {
            $newStatus = !$member->status_aktif;
            $member->update(['status_aktif' => $newStatus]);
            
            $label = $newStatus ? 'diaktifkan' : 'dinonaktifkan';
            return back()->with('success', "Anggota {$member->nama_lengkap} berhasil {$label}.");
        } catch (\Throwable $e) {
            return back()->with('error', 'Gagal mengubah status anggota: ' . $e->getMessage());
        }
    }
    public function createAccount(Member $member): RedirectResponse
    {
        if (!$member->email) {
            return back()->with('error', 'Gagal: Anggota ini belum memiliki alamat email.');
        }

        if ($member->user_id) {
            return back()->with('error', 'Gagal: Anggota ini sudah memiliki akun login.');
        }

        try {
            // Check if a user with this email already exists
            $existingUser = User::where('email', $member->email)->first();

            if ($existingUser) {
                // Reset password for the existing user so we can share it
                $newPassword = Str::random(8);
                $existingUser->update(['password' => Hash::make($newPassword)]);

                // Assign role if not already assigned
                if (!$existingUser->hasRole('anggota')) {
                    $existingUser->assignRole('anggota');
                }
                $member->update(['user_id' => $existingUser->id]);

                return back()->with('success', 'Akun ditemukan dan dihubungkan ke anggota ini. Password baru untuk ' . $member->email . ' adalah: ' . $newPassword);
            }

            // Create a new user account
            $password = Str::random(8);

            $user = User::create([
                'name'     => $member->nama_lengkap,
                'email'    => $member->email,
                'password' => Hash::make($password),
            ]);

            $user->assignRole('anggota');
            $member->update(['user_id' => $user->id]);

            return back()->with('success', 'Akun berhasil dibuat. Password untuk ' . $member->email . ' adalah: ' . $password);
        } catch (\Throwable $e) {
            return back()->with('error', 'Gagal membuat akun: ' . $e->getMessage());
        }
    }

    public function resetPassword(Member $member, Request $request): RedirectResponse
    {
        $request->validate([
            'password'              => ['required', 'string', 'min:6', 'confirmed'],
            'password_confirmation' => ['required'],
        ]);

        if (!$member->user_id) {
            return back()->with('error', 'Gagal: Anggota ini belum memiliki akun login.');
        }

        $user = User::find($member->user_id);
        if (!$user) {
            return back()->with('error', 'Gagal: Akun pengguna tidak ditemukan.');
        }

        $user->update(['password' => Hash::make($request->password)]);

        return back()->with('success', 'Password untuk ' . $member->email . ' berhasil diubah.');
    }
}
