<?php

namespace App\Http\Controllers;

use App\Exports\VolunteersExport;
use App\Models\User;
use App\Models\Volunteer;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;
use Maatwebsite\Excel\Facades\Excel;
use Symfony\Component\HttpFoundation\BinaryFileResponse;
use Illuminate\Support\Facades\Storage;

class VolunteerController extends Controller
{
    // ── Admin: protected index ────────────────────────────────────────────────

    public function index(Request $request): Response
    {
        $filters = $request->only(['status', 'search', 'sort_by', 'sort_direction', 'regional_cabang']);
        $sortBy = $filters['sort_by'] ?? null;
        $sortDirection = $filters['sort_direction'] ?? 'asc';

        $volunteers = Volunteer::query()
            ->when($filters['search'] ?? null, fn($q, $v) =>
                $q->where(function($query) use ($v) {
                    $query->where('name', 'like', "%{$v}%")
                          ->orWhere('email', 'like', "%{$v}%")
                          ->orWhere('phone', 'like', "%{$v}%")
                          ->orWhere('regional_cabang', 'like', "%{$v}%");
                })
            )
            ->when($filters['status'] ?? null, fn($q, $v) => $q->where('status', $v))
            ->when($filters['regional_cabang'] ?? null, fn($q, $v) => $q->where('regional_cabang', $v))
            ->when($sortBy, function ($q) use ($sortBy, $sortDirection) {
                $q->orderBy($sortBy, $sortDirection)
                  ->when($sortBy !== 'id', fn($query) => $query->orderBy('id', 'desc'));
            }, function ($q) {
                $q->orderByRaw("CASE WHEN status = 'pending' THEN 1 WHEN status = 'approved' THEN 2 WHEN status = 'rejected' THEN 3 ELSE 4 END")
                  ->orderByDesc('applied_date');
            })
            ->paginate(15)
            ->withQueryString()
            ->through(fn($v) => [
                'id'           => $v->id,
                'name'         => $v->name,
                'email'        => $v->email,
                'regional_cabang' => $v->regional_cabang,
                'phone'        => $v->phone,
                'address'      => $v->address,
                'birth_date'   => $v->birth_date?->toDateString(),
                'job_category' => $v->job_category,
                'job_type'     => $v->job_type,
                'id_card_path' => $v->id_card_path ? Storage::url($v->id_card_path) : null,
                'skills'       => $v->skills,
                'motivation'   => $v->motivation,
                'status'       => $v->status,
                'applied_date' => $v->applied_date?->toDateString(),
                'reviewed_at'  => $v->reviewed_at?->toDateString(),
                'review_notes' => $v->review_notes,
                'user_id'      => $v->user_id,
                'gender'              => $v->gender,
                'golongan_darah'      => $v->golongan_darah,
                'kesiapan_mobilisasi' => $v->kesiapan_mobilisasi,
                'ukuran_baju'         => $v->ukuran_baju,
                'emergency_contact'   => $v->emergency_contact,
                'emergency_phone'     => $v->emergency_phone,
                'regional_cabang'     => $v->regional_cabang,
                'pendidikan_terakhir' => $v->pendidikan_terakhir,
                'jurusan'             => $v->jurusan,
                'status_keluarga'     => $v->status_keluarga,
                'agama'               => $v->agama,
                'jumlah_tanggungan'   => $v->jumlah_tanggungan,
            ]);

        return Inertia::render('Volunteers/Index', [
            'volunteers' => $volunteers,
            'filters'    => $filters,
        ]);
    }

    public function export(Request $request): BinaryFileResponse
    {
        $status = $request->get('status');

        $filename = 'relawan';
        if ($status) {
            $filename .= '-' . $status;
        }
        $filename .= '-' . now()->format('Ymd') . '.xlsx';

        return Excel::download(new VolunteersExport($request->only(['status', 'search'])), $filename);
    }

    // ── Public: volunteer registration form ───────────────────────────────────

    public function register(): Response
    {
        return Inertia::render('Volunteers/Register');
    }

    public function submitRegistration(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name'       => 'required|string|max:255',
            'email'      => 'required|email|max:255|unique:volunteers,email',
            'phone'        => 'required|string|max:20',
            'address'      => 'nullable|string|max:500',
            'birth_date'   => 'nullable|date',
            'job_category' => 'nullable|string|max:100',
            'job_type'     => 'nullable|string|max:100',
            'id_card'      => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:2048',
            'photo'        => 'nullable|image|mimes:jpg,jpeg,png,webp|max:2048',
            'skills'       => 'required|string|max:1000',
            'motivation'   => 'required|string|max:2000',
            'gender'              => 'nullable|in:L,P',
            'golongan_darah'      => 'nullable|string|max:5',
            'kesiapan_mobilisasi' => 'boolean',
            'ukuran_baju'         => 'nullable|string|max:10',
            'emergency_contact'   => 'nullable|string|max:255',
            'emergency_phone'     => 'nullable|string|max:20',
            'regional_cabang'     => 'nullable|string|max:100',
            'pendidikan_terakhir' => 'nullable|string|max:50',
            'jurusan'             => 'nullable|string|max:100',
            'status_keluarga'     => 'nullable|string|max:50',
            'agama'               => 'nullable|string|max:50',
            'jumlah_tanggungan'   => 'nullable|string|max:20',
        ]);

        try {
            $idCardPath = null;
            if ($request->hasFile('id_card')) {
                $idCardPath = $request->file('id_card')->store('id_cards', 'public');
            }
            $photoPath = null;
            if ($request->hasFile('photo')) {
                $photoPath = $request->file('photo')->store('volunteers', 'public');
            }

            Volunteer::create(array_merge($validated, [
                'status'       => 'pending',
                'applied_date' => now()->toDateString(),
                'id_card_path' => $idCardPath,
                'photo_path'   => $photoPath,
            ]));

            return redirect()->route('volunteers.register')
                ->with('success', 'Pendaftaran relawan berhasil dikirim. Kami akan menghubungi Anda segera.');
        } catch (\Throwable $e) {
            return back()->with('error', 'Gagal mengirim pendaftaran: ' . $e->getMessage());
        }
    }

    // ── Admin: CRUD ───────────────────────────────────────────────────────────

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name'       => 'required|string|max:255',
            'email'      => 'required|email|max:255|unique:volunteers,email',
            'phone'        => 'required|string|max:20',
            'address'      => 'nullable|string|max:500',
            'birth_date'   => 'nullable|date',
            'job_category' => 'nullable|string|max:100',
            'job_type'     => 'nullable|string|max:100',
            'id_card'      => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:2048',
            'photo'        => 'nullable|image|mimes:jpg,jpeg,png,webp|max:2048',
            'skills'       => 'required|string|max:1000',
            'motivation'   => 'required|string|max:2000',
            'status'     => 'required|in:pending,approved,rejected',
            'gender'              => 'nullable|in:L,P',
            'golongan_darah'      => 'nullable|string|max:5',
            'kesiapan_mobilisasi' => 'boolean',
            'ukuran_baju'         => 'nullable|string|max:10',
            'emergency_contact'   => 'nullable|string|max:255',
            'emergency_phone'     => 'nullable|string|max:20',
            'regional_cabang'     => 'nullable|string|max:100',
            'pendidikan_terakhir' => 'nullable|string|max:50',
            'jurusan'             => 'nullable|string|max:100',
            'status_keluarga'     => 'nullable|string|max:50',
            'agama'               => 'nullable|string|max:50',
            'jumlah_tanggungan'   => 'nullable|string|max:20',
        ]);

        try {
            $validated['applied_date'] = $validated['applied_date'] ?? now()->toDateString();
            
            if ($request->hasFile('id_card')) {
                $validated['id_card_path'] = $request->file('id_card')->store('id_cards', 'public');
            }
            if ($request->hasFile('photo')) {
                $validated['photo_path'] = $request->file('photo')->store('volunteers', 'public');
            }

            Volunteer::create($validated);

            return redirect()->route('volunteers.index')
                ->with('success', 'Data relawan berhasil disimpan.');
        } catch (\Throwable $e) {
            return back()->with('error', 'Gagal menyimpan data relawan: ' . $e->getMessage());
        }
    }

    public function update(Request $request, Volunteer $volunteer): RedirectResponse
    {
        $validated = $request->validate([
            'name'       => 'required|string|max:255',
            'email'      => 'required|email|max:255|unique:volunteers,email,' . $volunteer->id,
            'phone'        => 'required|string|max:20',
            'address'      => 'nullable|string|max:500',
            'birth_date'   => 'nullable|date',
            'job_category' => 'nullable|string|max:100',
            'job_type'     => 'nullable|string|max:100',
            'id_card'      => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:2048',
            'photo'        => 'nullable|image|mimes:jpg,jpeg,png,webp|max:2048',
            'skills'       => 'required|string|max:1000',
            'motivation'   => 'required|string|max:2000',
            'status'     => 'required|in:pending,approved,rejected',
            'gender'              => 'nullable|in:L,P',
            'golongan_darah'      => 'nullable|string|max:5',
            'kesiapan_mobilisasi' => 'boolean',
            'ukuran_baju'         => 'nullable|string|max:10',
            'emergency_contact'   => 'nullable|string|max:255',
            'emergency_phone'     => 'nullable|string|max:20',
            'regional_cabang'     => 'nullable|string|max:100',
            'pendidikan_terakhir' => 'nullable|string|max:50',
            'jurusan'             => 'nullable|string|max:100',
            'status_keluarga'     => 'nullable|string|max:50',
            'agama'               => 'nullable|string|max:50',
            'jumlah_tanggungan'   => 'nullable|string|max:20',
        ]);

        try {
            if ($request->hasFile('id_card')) {
                if ($volunteer->id_card_path) {
                    Storage::disk('public')->delete($volunteer->id_card_path);
                }
                $validated['id_card_path'] = $request->file('id_card')->store('id_cards', 'public');
            }
            if ($request->hasFile('photo')) {
                if ($volunteer->photo_path) {
                    Storage::disk('public')->delete($volunteer->photo_path);
                }
                $validated['photo_path'] = $request->file('photo')->store('volunteers', 'public');
            }

            $volunteer->update($validated);

            return redirect()->route('volunteers.index')
                ->with('success', 'Data relawan berhasil diperbarui.');
        } catch (\Throwable $e) {
            return back()->with('error', 'Gagal memperbarui data relawan: ' . $e->getMessage());
        }
    }

    public function destroy(Volunteer $volunteer): RedirectResponse
    {
        try {
            if ($volunteer->id_card_path) {
                Storage::disk('public')->delete($volunteer->id_card_path);
            }
            $volunteer->delete();

            return redirect()->route('volunteers.index')
                ->with('success', 'Data relawan berhasil dihapus.');
        } catch (\Throwable $e) {
            return back()->with('error', 'Gagal menghapus data relawan: ' . $e->getMessage());
        }
    }

    // ── Approve / Reject ──────────────────────────────────────────────────────

    public function approve(Request $request, Volunteer $volunteer): RedirectResponse
    {
        $validated = $request->validate([
            'review_notes' => 'nullable|string|max:500',
        ]);

        try {
            $volunteer->update([
                'status'       => 'approved',
                'reviewed_by'  => auth()->id(),
                'reviewed_at'  => now()->toDateString(),
                'review_notes' => $validated['review_notes'] ?? null,
            ]);

            return back()->with('success', 'Relawan berhasil disetujui.');
        } catch (\Throwable $e) {
            return back()->with('error', 'Gagal menyetujui relawan: ' . $e->getMessage());
        }
    }

    public function reject(Request $request, Volunteer $volunteer): RedirectResponse
    {
        $validated = $request->validate([
            'review_notes' => 'required|string|max:500',
        ]);

        try {
            $volunteer->update([
                'status'       => 'rejected',
                'reviewed_by'  => auth()->id(),
                'reviewed_at'  => now()->toDateString(),
                'review_notes' => $validated['review_notes'],
            ]);

            return back()->with('success', 'Relawan berhasil ditolak.');
        } catch (\Throwable $e) {
            return back()->with('error', 'Gagal menolak relawan: ' . $e->getMessage());
        }
    }

    public function createAccount(Volunteer $volunteer): RedirectResponse
    {
        if (!$volunteer->email) {
            return back()->with('error', 'Gagal: Relawan ini belum memiliki alamat email.');
        }

        if ($volunteer->user_id) {
            return back()->with('error', 'Gagal: Relawan ini sudah memiliki akun login.');
        }

        if ($volunteer->status !== 'approved') {
            return back()->with('error', 'Gagal: Hanya relawan yang telah disetujui yang dapat dibuatkan akun.');
        }

        try {
            $user = \App\Models\User::where('email', $volunteer->email)->first();

            if ($user) {
                // User already exists, link and assign role
                $user->assignRole('relawan');
                $volunteer->update(['user_id' => $user->id]);
                return back()->with('success', 'Akun dengan email ini sudah ada di sistem. Berhasil menautkan data relawan ke akun tersebut dan memberikan hak akses relawan.');
            }

            // Create new user
            $password = \Illuminate\Support\Str::random(8);

            $user = \App\Models\User::create([
                'name' => $volunteer->name,
                'email' => $volunteer->email,
                'password' => \Illuminate\Support\Facades\Hash::make($password),
            ]);

            $user->assignRole('relawan');
            $volunteer->update(['user_id' => $user->id]);

            return back()->with('success', 'Akun baru berhasil dibuat. Password untuk ' . $volunteer->email . ' adalah: ' . $password);
        } catch (\Throwable $e) {
            return back()->with('error', 'Gagal membuat akun: ' . $e->getMessage());
        }
    }

    public function resetPassword(Volunteer $volunteer, Request $request): RedirectResponse
    {
        $request->validate([
            'password'              => ['required', 'string', 'min:6', 'confirmed'],
            'password_confirmation' => ['required'],
        ]);

        if (!$volunteer->user_id) {
            return back()->with('error', 'Gagal: Relawan ini belum memiliki akun login.');
        }

        $user = User::find($volunteer->user_id);
        if (!$user) {
            return back()->with('error', 'Gagal: Akun pengguna tidak ditemukan.');
        }

        $user->update(['password' => Hash::make($request->password)]);

        return back()->with('success', 'Password untuk ' . $volunteer->email . ' berhasil diubah.');
    }
}
