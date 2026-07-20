<?php

namespace App\Exports;

use App\Models\Executive;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithTitle;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;
use Illuminate\Support\Collection;
use Carbon\Carbon;

class ExecutivesExport implements
    FromCollection,
    WithHeadings,
    WithMapping,
    WithStyles,
    ShouldAutoSize,
    WithTitle
{
    public function __construct(
        private readonly array $filters = []
    ) {}

    /**
     * Return the collection of executives to export.
     */
    public function collection(): Collection
    {
        $status = $this->filters['status'] ?? null;
        $jabatan = $this->filters['jabatan'] ?? null;

        return Executive::query()
            ->when(isset($status) && $status !== '', fn ($q) => $q->where('status_aktif', $status === 'aktif' ? 1 : 0))
            ->when(isset($jabatan) && $jabatan !== '', fn ($q) => $q->where('jabatan', $jabatan))
            ->get();
    }

    /**
     * Column headings for the spreadsheet.
     */
    public function headings(): array
    {
        return [
            'No',
            'Nama Lengkap',
            'Jabatan',
            'Bagian/Divisi',
            'Periode Mulai',
            'Periode Selesai',
            'Status Aktif',
            'Profesi Utama',
            'Golongan Darah',
            'Kesiapan Mobilisasi',
            'Ukuran Baju'
        ];
    }

    /**
     * Map each row to an array for the spreadsheet.
     */
    public function map($row): array
    {
        static $no = 0;
        $no++;

        return [
            $no,
            $row->nama_lengkap,
            $row->jabatan,
            $row->bagian_divisi,
            $row->periode_mulai ? Carbon::parse($row->periode_mulai)->format('d M Y') : '-',
            $row->periode_selesai ? Carbon::parse($row->periode_selesai)->format('d M Y') : '-',
            $row->status_aktif ? 'Aktif' : 'Tidak Aktif',
            $row->profesi_utama ?: '-',
            $row->golongan_darah ?: '-',
            $row->kesiapan_mobilisasi ? 'Ya' : 'Tidak',
            $row->ukuran_baju ?: '-',
        ];
    }

    /**
     * Apply styles to the spreadsheet (like bold headings).
     */
    public function styles(Worksheet $sheet)
    {
        return [
            1 => [
                'font' => [
                    'bold' => true,
                    'color' => ['argb' => 'FFFFFFFF'],
                ],
                'fill' => [
                    'fillType' => \PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID,
                    'startColor' => ['argb' => 'FFDC2626'], // Red-600
                ],
            ],
        ];
    }

    /**
     * Set the title of the worksheet.
     */
    public function title(): string
    {
        return 'Data Pengurus';
    }
}
