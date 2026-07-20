<?php

namespace App\Exports;

use App\Models\LogisticsItem;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithTitle;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;
use Illuminate\Support\Collection;
use Carbon\Carbon;

class LogisticsExport implements
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
     * Return the collection of logistics items to export.
     */
    public function collection(): Collection
    {
        $category = $this->filters['category'] ?? null;
        $condition = $this->filters['condition'] ?? null;

        return LogisticsItem::query()
            ->when(isset($category) && $category !== '', fn ($q) => $q->where('category', $category))
            ->when(isset($condition) && $condition !== '', fn ($q) => $q->where('condition', $condition))
            ->orderBy('name')
            ->get();
    }

    /**
     * Column headings for the spreadsheet.
     */
    public function headings(): array
    {
        return [
            'No',
            'Nama Barang',
            'Kategori',
            'Jumlah',
            'Satuan',
            'Kondisi',
            'Lokasi Penyimpanan',
            'Tanggal Kedaluwarsa',
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
            $row->name,
            $row->category,
            $row->quantity,
            $row->unit,
            ucfirst($row->condition),
            $row->location ?: '-',
            $row->expiry_date ? Carbon::parse($row->expiry_date)->format('d M Y') : '-',
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
        ];
    }

    /**
     * Set the title of the worksheet.
     */
    public function title(): string
    {
        return 'Data Logistik';
    }
}
