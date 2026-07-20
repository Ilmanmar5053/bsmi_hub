<?php

namespace App\Exports;

use App\Models\DuesPayment;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithTitle;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;
use Illuminate\Support\Collection;
use Carbon\Carbon;

class DuesExport implements
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
     * Return the collection of dues payments to export.
     */
    public function collection(): Collection
    {
        $status = $this->filters['status'] ?? null;
        $periodId = $this->filters['period_id'] ?? null;

        return DuesPayment::with(['member', 'period'])
            ->when(isset($status) && $status !== '', fn ($q) => $q->where('status', $status))
            ->when(isset($periodId) && $periodId !== '', fn ($q) => $q->where('dues_period_id', $periodId))
            ->orderBy('paid_date', 'desc')
            ->get();
    }

    /**
     * Column headings for the spreadsheet.
     */
    public function headings(): array
    {
        return [
            'No',
            'Nama Anggota',
            'No Induk',
            'Periode Iuran',
            'Nominal (Rp)',
            'Tanggal Bayar',
            'Status',
            'Catatan'
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
            $row->member ? $row->member->nama_lengkap : '-',
            $row->member ? $row->member->no_induk_anggota : '-',
            $row->period ? $row->period->month . ' ' . $row->period->year : '-',
            $row->amount,
            $row->paid_date ? Carbon::parse($row->paid_date)->format('d M Y') : '-',
            ucfirst($row->status),
            $row->notes ?: '-',
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
            'E' => [
                'numberFormat' => [
                    'formatCode' => '#,##0',
                ],
            ],
        ];
    }

    /**
     * Set the title of the worksheet.
     */
    public function title(): string
    {
        return 'Data Iuran Anggota';
    }
}
