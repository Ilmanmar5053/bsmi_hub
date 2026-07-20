<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Maatwebsite\Excel\Facades\Excel;
use App\Exports\MembersExport;
use App\Exports\VolunteersExport;
use App\Exports\FinanceExport;
use App\Exports\ExecutivesExport;
use App\Exports\LogisticsExport;
use App\Exports\BeneficiariesExport;
use App\Exports\DuesExport;

class ReportController extends Controller
{
    /**
     * Tampilkan halaman pelaporan.
     */
    public function index()
    {
        return Inertia::render('Reports/Index');
    }

    /**
     * Download export excel berdasarkan tipe laporan.
     */
    public function export(Request $request, $type)
    {
        $fileName = 'Laporan_' . ucfirst($type) . '_' . date('Ymd_His') . '.xlsx';
        
        // Pass filter parameter to export class
        $filters = $request->all();

        switch ($type) {
            case 'anggota':
                return Excel::download(new MembersExport($filters), $fileName);
            case 'pengurus':
                return Excel::download(new ExecutivesExport($filters), $fileName);
            case 'relawan':
                return Excel::download(new VolunteersExport($filters), $fileName);
            case 'keuangan':
                return Excel::download(new FinanceExport($filters), $fileName);
            case 'logistik':
                return Excel::download(new LogisticsExport($filters), $fileName);
            case 'penerima_manfaat':
                return Excel::download(new BeneficiariesExport($filters), $fileName);
            case 'iuran':
                return Excel::download(new DuesExport($filters), $fileName);
            default:
                return redirect()->back()->with('error', 'Tipe laporan tidak ditemukan.');
        }
    }
}
