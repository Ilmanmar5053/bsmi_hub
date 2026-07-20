<?php

namespace App\Exports;

use App\Models\Member;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;
use Illuminate\Support\Collection;

class MembersExport implements
    FromCollection,
    WithHeadings,
    WithMapping,
    WithStyles,
    ShouldAutoSize
{
    public function __construct(
        private readonly array $filters = []
    ) {}

    /**
     * Return the collection of members to export.
     */
    public function collection(): Collection
    {
        $status = $this->filters['status'] ?? null;
        $division = $this->filters['division'] ?? null;

        return Member::query()
            ->when(isset($status) && $status !== '', fn ($q) => $q->where('status_aktif', $status))
            ->when(isset($division) && $division !== '', fn ($q) => $q->where('bagian_divisi', $division))
            ->orderBy('no_induk_anggota')
            ->get();
    }

    /**
     * Column headings for the spreadsheet.
     */
    public function headings(): array
    {
        return [
            'No',
            'No Induk Anggota',
            'Nama Lengkap',
            'Email',
            'No Whatsapp',
            'Bagian/Divisi',
            'Tanggal Bergabung',
            'Status Aktif',
            'Profesi Utama',
            'Kesiapan Mobilisasi',
            'Ukuran Baju',
            'Golongan Darah',
            'Regional Cabang',
            'Pendidikan Terakhir',
            'Jurusan',
            'Status Keluarga',
            'Agama',
            'Jumlah Tanggungan',
        ];
    }

    /**
     * Map each Member model row to an array of cell values.
     */
    public function map(mixed $member): array
    {
        static $index = 0;
        $index++;

        return [
            $index,
            $member->no_induk_anggota,
            $member->nama_lengkap,
            $member->email,
            $member->no_whatsapp,
            $member->bagian_divisi,
            $member->join_date?->format('d/m/Y') ?? '-',
            $member->status_aktif ? 'Aktif' : 'Nonaktif',
            $member->profesi_utama,
            $member->kesiapan_mobilisasi ? 'Ya' : 'Tidak',
            $member->ukuran_baju,
            $member->golongan_darah,
            $member->regional_cabang,
            $member->pendidikan_terakhir,
            $member->jurusan,
            $member->status_keluarga,
            $member->agama,
            $member->jumlah_tanggungan,
        ];
    }

    /**
     * Style the heading row (bold + background colour).
     */
    public function styles(Worksheet $sheet): array
    {
        return [
            1 => [
                'font'      => ['bold' => true, 'color' => ['argb' => 'FFFFFFFF']],
                'fill'      => [
                    'fillType'   => 'solid',
                    'startColor' => ['argb' => 'FF16A34A'], // green-600
                ],
                'alignment' => ['horizontal' => 'center'],
            ],
        ];
    }
}
