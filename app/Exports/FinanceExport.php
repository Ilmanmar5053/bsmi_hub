<?php

namespace App\Exports;

use App\Models\FinancialTransaction;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithTitle;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;
use Illuminate\Support\Collection;

class FinanceExport implements
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
     * Return the collection of financial transactions to export.
     */
    public function collection(): Collection
    {
        $type = $this->filters['type'] ?? null;
        $startDate = $this->filters['start_date'] ?? null;
        $endDate = $this->filters['end_date'] ?? null;

        return FinancialTransaction::query()
            ->when(isset($type) && $type !== '', fn ($q) => $q->where('type', $type))
            ->when(isset($startDate) && $startDate !== '', fn ($q) => $q->whereDate('date', '>=', $startDate))
            ->when(isset($endDate) && $endDate !== '', fn ($q) => $q->whereDate('date', '<=', $endDate))
            ->orderBy('date')
            ->orderBy('id')
            ->get();
    }

    /**
     * Column headings for the spreadsheet.
     */
    public function headings(): array
    {
        return [
            'No',
            'Tanggal',
            'Jenis',
            'Kategori',
            'Keterangan',
            'Jumlah (Rp)',
        ];
    }

    /**
     * Map each FinancialTransaction model row to an array of cell values.
     */
    public function map(mixed $transaction): array
    {
        static $index = 0;
        $index++;

        return [
            $index,
            $transaction->date?->format('d/m/Y') ?? '-',
            $transaction->type === 'income' ? 'Pemasukan' : 'Pengeluaran',
            $transaction->category,
            $transaction->description,
            number_format((float) $transaction->amount, 0, ',', '.'),
        ];
    }

    /**
     * Style the heading row (bold + background colour keyed by type).
     */
    public function styles(Worksheet $sheet): array
    {
        return [
            1 => [
                'font'      => ['bold' => true, 'color' => ['argb' => 'FFFFFFFF']],
                'fill'      => [
                    'fillType'   => 'solid',
                    'startColor' => ['argb' => 'FF1D4ED8'], // blue-700
                ],
                'alignment' => ['horizontal' => 'center'],
            ],
        ];
    }

    /**
     * Sheet tab title.
     */
    public function title(): string
    {
        return 'Transaksi Keuangan';
    }
}
