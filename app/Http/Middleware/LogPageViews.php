<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Illuminate\Support\Facades\Auth;

class LogPageViews
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        // Hanya log jika user sudah login, request adalah GET, dan respon sukses (200)
        // Kita juga memfilter request Inertia agar tidak double log atau log assets
        if (Auth::check() && $request->isMethod('GET') && $response->getStatusCode() === 200) {
            
            $path = $request->path();

            // Abaikan path yang tidak perlu dilog (assets, api, dll)
            $ignoredPaths = ['_inertia', 'sanctum', 'api', 'storage', 'build', 'activity-logs', 'up'];
            
            $shouldLog = true;
            foreach ($ignoredPaths as $ignored) {
                if (str_starts_with($path, $ignored) || str_contains($path, $ignored)) {
                    $shouldLog = false;
                    break;
                }
            }

            // Juga hindari request XHR murni yang bukan Inertia visit page utama
            // Inertia request dengan header X-Inertia tapi bukan Partial
            if ($shouldLog && (!$request->ajax() || $request->header('X-Inertia'))) {
                
                // Jika itu adalah request Partial Reload Inertia, kita abaikan saja agar tidak spam
                if ($request->hasHeader('X-Inertia-Partial-Data')) {
                    $shouldLog = false;
                }

                if ($shouldLog) {
                    $moduleName = $this->getModuleName($path);
                    
                    if ($moduleName) {
                        activity('page_access')
                            ->causedBy(Auth::user())
                            ->event('page_access')
                            ->withProperties([
                                'url' => $request->fullUrl(),
                                'ip' => $request->ip(),
                                'user_agent' => $request->userAgent()
                            ])
                            ->log("Membuka modul {$moduleName}");
                    }
                }
            }
        }

        return $response;
    }

    private function getModuleName(string $path): ?string
    {
        if ($path === '/' || $path === 'dashboard') return 'Dashboard';
        if (str_starts_with($path, 'members')) return 'Data Anggota';
        if (str_starts_with($path, 'executives')) return 'Data Pengurus';
        if (str_starts_with($path, 'beneficiaries')) return 'Penerima Manfaat';
        if (str_starts_with($path, 'programs')) return 'Program & Kegiatan';
        if (str_starts_with($path, 'logistics')) return 'Logistik';
        if (str_starts_with($path, 'delivery-notes')) return 'Surat Jalan';
        if (str_starts_with($path, 'news')) return 'Berita & Informasi';
        if (str_starts_with($path, 'dues')) return 'Iuran';
        if (str_starts_with($path, 'finance')) return 'Arus Kas';
        if (str_starts_with($path, 'volunteers')) return 'Relawan';
        if (str_starts_with($path, 'diklatsar')) return 'Diklatsar';
        if (str_starts_with($path, 'reports')) return 'Pelaporan';
        if (str_starts_with($path, 'users')) return 'Manajemen Pengguna';
        if (str_starts_with($path, 'profil-organisasi')) return 'Profil Organisasi';
        if (str_starts_with($path, 'profile')) return 'Profil Akun (Settings)';
        
        return null;
    }
}
