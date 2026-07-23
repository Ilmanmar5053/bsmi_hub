<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\FromArray;
use Maatwebsite\Excel\Concerns\WithHeadings;

class FinanceTemplateExport implements FromArray, WithHeadings
{
    public function array(): array
    {
        return [
            ['2026-07-22', 'pemasukan', 'Donasi', '1500000', 'Donasi dari Hamba Allah', ''],
            ['2026-07-22', 'pengeluaran', 'Operasional', '500000', 'Pembelian ATK', 'Nota terlampir'],
        ];
    }

    public function headings(): array
    {
        return [
            'Tanggal',
            'Jenis',
            'Kategori',
            'Nominal',
            'Deskripsi',
            'Catatan'
        ];
    }
}
