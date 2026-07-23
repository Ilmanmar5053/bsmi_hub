<?php

namespace App\Http\Controllers;

use App\Models\OrganizationProfile;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class OrganizationProfileController extends Controller
{
    public function show(): Response
    {
        $profile = OrganizationProfile::first()
            ?? new OrganizationProfile();

        return Inertia::render('Profile/Index', [
            'profile' => [
                'id'           => $profile->id,
                'name'         => $profile->name,
                'vision'       => $profile->vision,
                'mission'      => $profile->mission,
                'address'      => $profile->address,
                'phone'        => $profile->phone,
                'email'        => $profile->email,
                'website'      => $profile->website,
                'founded_year' => $profile->founded_year,
                'history'      => $profile->history,
                'logo_path'    => $profile->logo_path,
                'logo_url'     => $profile->logo_url,
                'regional_logos' => $profile->regional_logos ?: [],
                'regional_logos_url' => collect($profile->regional_logos ?: [])->mapWithKeys(function ($path, $region) {
                    return [$region => asset('storage/' . $path)];
                })->toArray(),
            ],
        ]);
    }

    public function update(Request $request): RedirectResponse
    {
        if ($request->user() && $request->user()->hasAnyRole(['anggota', 'relawan'])) {
            return back()->with('error', 'Peran Anggota/Relawan tidak diizinkan untuk mengubah profil organisasi.');
        }

        $validated = $request->validate([
            'name'         => 'required|string|max:255',
            'vision'       => 'nullable|string',
            'mission'      => 'nullable|string',
            'address'      => 'nullable|string|max:500',
            'phone'        => 'nullable|string|max:20',
            'email'        => 'nullable|email|max:255',
            'website'      => 'nullable|url|max:255',
            'founded_year' => 'nullable|integer|min:1900|max:' . date('Y'),
            'history'      => 'nullable|string',
            'logo'         => 'nullable|image|mimes:jpg,jpeg,png,svg,webp|max:2048',
        ]);

        try {
            $profile = OrganizationProfile::first();

            if ($request->hasFile('logo')) {
                if ($profile?->logo_path) {
                    Storage::disk('public')->delete($profile->logo_path);
                }
                $validated['logo_path'] = $request->file('logo')
                    ->store('organization', 'public');
            }
            unset($validated['logo']);

            if ($profile) {
                $profile->update($validated);
            } else {
                OrganizationProfile::create($validated);
            }

            return redirect()->route('profil-organisasi.show')
                ->with('success', 'Profil organisasi berhasil diperbarui.');
        } catch (\Throwable $e) {
            return back()->with('error', 'Gagal memperbarui profil: ' . $e->getMessage());
        }
    }

    public function updateRegionalLogos(Request $request): RedirectResponse
    {
        if ($request->user() && $request->user()->hasAnyRole(['anggota', 'relawan'])) {
            return back()->with('error', 'Peran Anggota/Relawan tidak diizinkan untuk mengubah profil organisasi.');
        }

        $request->validate([
            'regional' => 'required|string',
            'logo'     => 'nullable|image|mimes:jpg,jpeg,png,svg,webp|max:2048',
        ]);

        try {
            $profile = OrganizationProfile::first() ?? OrganizationProfile::create(['name' => 'BSMI']);
            $logos = $profile->regional_logos ?: [];
            $regional = $request->regional;

            if ($request->hasFile('logo')) {
                // Hapus logo lama jika ada
                if (isset($logos[$regional])) {
                    Storage::disk('public')->delete($logos[$regional]);
                }
                $logos[$regional] = $request->file('logo')->store('regional_logos', 'public');
            } else {
                // Jika tidak ada file tapi disubmit, mungkin ingin menghapus? 
                // Untuk sementara kita biarkan jika tidak ada action remove eksplisit.
                if ($request->input('remove')) {
                    if (isset($logos[$regional])) {
                        Storage::disk('public')->delete($logos[$regional]);
                        unset($logos[$regional]);
                    }
                }
            }

            $profile->update(['regional_logos' => $logos]);

            return back()->with('success', "Logo regional {$regional} berhasil diperbarui.");
        } catch (\Throwable $e) {
            return back()->with('error', 'Gagal memperbarui logo regional: ' . $e->getMessage());
        }
    }
}
