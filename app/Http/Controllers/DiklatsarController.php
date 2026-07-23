<?php

namespace App\Http\Controllers;

use App\Models\Volunteer;
use App\Models\DiklatsarModule;
use App\Models\CertificateSetting;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\RedirectResponse;

class DiklatsarController extends Controller
{
    public function index(Request $request): Response
    {
        $search = $request->get('search');
        
        $volunteers = Volunteer::where('status', 'approved')
            ->when($search, function ($query, $search) {
                $query->where('name', 'like', "%{$search}%")
                      ->orWhere('email', 'like', "%{$search}%");
            })
            ->orderBy('diklatsar_stage')
            ->orderBy('name')
            ->paginate(15)
            ->withQueryString()
            ->through(fn($v) => [
                'id'              => $v->id,
                'name'            => $v->name,
                'email'           => $v->email,
                'phone'           => $v->phone,
                'job_category'    => $v->job_category,
                'job_type'        => $v->job_type,
                'diklatsar_stage' => $v->diklatsar_stage,
                'applied_date'    => $v->applied_date?->toDateString(),
                'photo_url'       => $v->photo_url,
            ]);

        $modules = DiklatsarModule::orderBy('stage_number')->get();
        $certificateSetting = CertificateSetting::firstOrCreate([], [
            'role_text' => 'Peserta',
            'description_text' => 'Telah mengikuti dan dinyatakan LULUS dalam Pendidikan dan Latihan Dasar Kepalangmerahan (LDKO) Bulan Sabit Merah Indonesia. Yang bersangkutan telah menyelesaiakan seluruh tahapan materi dengan baik dan resmi dilantik sebagai Relawan BSMI.',
            'signature_1_name' => 'Dr. M. Djazuli Ambari, SKM, M.Si',
            'signature_1_title' => 'Ketua Umum',
            'signature_2_name' => 'Rizky Febriansyah',
            'signature_2_title' => 'Kepala Divisi Relawan'
        ]);

        return Inertia::render('Diklatsar/Index', [
            'volunteers'         => $volunteers,
            'filters'            => ['search' => $search],
            'modules'            => $modules,
            'certificateSetting' => $certificateSetting,
        ]);
    }

    public function updateModule(Request $request, DiklatsarModule $module): RedirectResponse
    {
        $validated = $request->validate([
            'title'       => 'required|string|max:255',
            'description' => 'nullable|string',
            'schedule'    => 'nullable|string|max:255',
            'speaker'     => 'nullable|string|max:255',
        ]);

        $module->update($validated);

        return back()->with('success', "Modul {$module->title} berhasil diperbarui.");
    }

    public function updateCertificateSetting(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'certificate_number' => 'nullable|string|max:255',
            'role_text'          => 'required|string|max:255',
            'description_text'   => 'nullable|string',
            'year_text'          => 'nullable|string|max:255',
            'organizer'          => 'nullable|string|max:255',
            'location'           => 'nullable|string|max:255',
            'day_text'           => 'nullable|string|max:255',
            'date_text'          => 'nullable|string|max:255',
            'signature_1_name'   => 'nullable|string|max:255',
            'signature_1_title'  => 'nullable|string|max:255',
            'signature_2_name'   => 'nullable|string|max:255',
            'signature_2_title'  => 'nullable|string|max:255',
        ]);

        $setting = CertificateSetting::firstOrCreate([]);
        $setting->update($validated);

        return back()->with('success', 'Pengaturan sertifikat berhasil disimpan.');
    }

    public function advance(Request $request, Volunteer $volunteer): RedirectResponse
    {
        if ($volunteer->status !== 'approved') {
            return back()->with('error', 'Hanya relawan yang disetujui yang dapat mengikuti Diklatsar.');
        }

        if ($volunteer->diklatsar_stage < 6) {
            $volunteer->increment('diklatsar_stage');
            $stageName = $volunteer->diklatsar_stage === 6 ? 'Lulus / Dilantik' : 'Materi ' . $volunteer->diklatsar_stage;
            return back()->with('success', "Status Diklatsar {$volunteer->name} berhasil diperbarui ke: {$stageName}");
        }

        return back()->with('error', 'Relawan sudah lulus tahap Diklatsar.');
    }

    public function bulkAdvance(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'volunteer_ids'   => 'required|array',
            'volunteer_ids.*' => 'exists:volunteers,id',
        ]);

        $volunteers = Volunteer::whereIn('id', $validated['volunteer_ids'])
            ->where('status', 'approved')
            ->where('diklatsar_stage', '<', 6)
            ->get();

        if ($volunteers->isEmpty()) {
            return back()->with('error', 'Tidak ada relawan valid yang dapat dinaikkan tahapnya.');
        }

        foreach ($volunteers as $volunteer) {
            $volunteer->increment('diklatsar_stage');
        }

        return back()->with('success', count($volunteers) . ' relawan berhasil dinaikkan ke tahap selanjutnya.');
    }

    public function certificate(Volunteer $volunteer)
    {
        $user = auth()->user();
        $isOwner = $user && $user->id === $volunteer->user_id;
        $isManager = $user && $user->can('manage-volunteers');

        if (!$isOwner && !$isManager) {
            abort(403, 'Anda tidak berhak mengunduh sertifikat ini.');
        }

        if ($volunteer->status !== 'approved' || $volunteer->diklatsar_stage < 6) {
            abort(403, 'Sertifikat belum tersedia. Relawan harus lulus Diklatsar terlebih dahulu.');
        }

        $setting = CertificateSetting::firstOrCreate([]);

        $pdf = Pdf::loadView('pdf.certificate', [
            'volunteer' => $volunteer,
            'date'      => now()->translatedFormat('d F Y'),
            'setting'   => $setting,
        ])->setPaper('a4', 'landscape');

        return $pdf->download('Sertifikat-LDKO-' . str_replace(' ', '-', $volunteer->name) . '.pdf');
    }

    public function previewCertificate(Volunteer $volunteer)
    {
        $user = auth()->user();
        $isOwner = $user && $user->id === $volunteer->user_id;
        $isManager = $user && $user->can('manage-volunteers');

        if (!$isOwner && !$isManager) {
            abort(403, 'Anda tidak berhak melihat sertifikat ini.');
        }

        if ($volunteer->status !== 'approved' || $volunteer->diklatsar_stage < 6) {
            abort(403, 'Sertifikat belum tersedia. Relawan harus lulus Diklatsar terlebih dahulu.');
        }

        $setting = CertificateSetting::firstOrCreate([]);

        $pdf = Pdf::loadView('pdf.certificate', [
            'volunteer' => $volunteer,
            'date'      => now()->translatedFormat('d F Y'),
            'setting'   => $setting,
        ])->setPaper('a4', 'landscape');

        return $pdf->stream('Preview-Sertifikat-' . str_replace(' ', '-', $volunteer->name) . '.pdf');
    }
}
