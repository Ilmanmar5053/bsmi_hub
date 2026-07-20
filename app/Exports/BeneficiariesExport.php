<?php

namespace App\Exports;

use App\Models\Beneficiary;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithTitle;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;
use Illuminate\Support\Collection;

class BeneficiariesExport implements
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
     * Return the collection of beneficiaries to export.
     */
    public function collection(): Collection
    {
        $category = $this->filters['category'] ?? null;

        return Beneficiary::query()
            ->when(isset($category) && $category !== '', fn ($q) => $q->where('category', $category))
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
            'Nama Lengkap',
            'Kategori',
            'Alamat',
            'No HP',
            'NIK',
            'Jumlah Anggota Keluarga',
            'Total Nilai Bantuan (Rp)',
            'Keterangan'
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
            $row->address,
            $row->phone ?: '-',
            $row->nik ?: '-',
            $row->family_members ?: '-',
            $row->total_received ?: 0,
            $row->description ?: '-',
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
            'H' => [
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
        return 'Penerima Manfaat';
    }
}
