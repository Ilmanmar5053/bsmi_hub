<?php

namespace App\Imports;

use App\Models\FinancialTransaction;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Maatwebsite\Excel\Concerns\WithValidation;
use PhpOffice\PhpSpreadsheet\Shared\Date;

class FinanceImport implements ToModel, WithHeadingRow, WithValidation
{
    public function model(array $row)
    {
        // Handle Excel numeric dates
        $date = null;
        if (isset($row['tanggal'])) {
            if (is_numeric($row['tanggal'])) {
                $date = Date::excelToDateTimeObject($row['tanggal'])->format('Y-m-d');
            } else {
                $date = date('Y-m-d', strtotime($row['tanggal']));
            }
        }

        return new FinancialTransaction([
            'date'        => $date,
            'type'        => strtolower($row['jenis'] ?? 'pemasukan'),
            'category'    => $row['kategori'] ?? 'Lainnya',
            'amount'      => isset($row['nominal']) ? (float) preg_replace('/[^0-9.]/', '', $row['nominal']) : 0,
            'description' => $row['deskripsi'] ?? 'Import Excel',
            'notes'       => $row['catatan'] ?? null,
            'created_by'  => auth()->id(),
        ]);
    }

    public function rules(): array
    {
        return [
            'tanggal' => 'required',
            'jenis' => 'required|in:pemasukan,pengeluaran,Pemasukan,Pengeluaran',
            'kategori' => 'required',
            'nominal' => 'required',
            'deskripsi' => 'required',
        ];
    }
}
