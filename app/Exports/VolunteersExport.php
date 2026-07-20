<?php

namespace App\Exports;

use App\Models\Volunteer;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithTitle;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;
use Illuminate\Support\Collection;

class VolunteersExport implements
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
     * Return the collection of volunteers to export.
     */
    public function collection(): Collection
    {
        $status = $this->filters['status'] ?? null;

        return Volunteer::with('reviewer')
            ->when(isset($status) && $status !== '', fn ($q) => $q->where('status', $status))
            ->orderByRaw("CASE WHEN status = 'pending' THEN 1 WHEN status = 'approved' THEN 2 WHEN status = 'rejected' THEN 3 ELSE 4 END")
            ->orderByDesc('applied_date')
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
            'Email',
            'Telepon',
            'Tanggal Lahir',
            'Alamat',
            'Pekerjaan',
            'Keahlian & Pengalaman',
            'Motivasi Bergabung',
            'Tanggal Daftar',
            'Status',
            'Direview Oleh',
            'Tanggal Review',
            'Catatan Review',
        ];
    }

    /**
     * Map each Volunteer model row to an array of cell values.
     */
    public function map(mixed $volunteer): array
    {
        static $index = 0;
        $index++;

        $statusLabel = match($volunteer->status) {
            'pending' => 'Menunggu',
            'approved' => 'Disetujui',
            'rejected' => 'Ditolak',
            default => $volunteer->status,
        };

        return [
            $index,
            $volunteer->name,
            $volunteer->email,
            $volunteer->phone,
            $volunteer->birth_date?->format('d/m/Y') ?? '-',
            $volunteer->address ?? '-',
            $volunteer->occupation ?? '-',
            $volunteer->skills,
            $volunteer->motivation,
            $volunteer->applied_date?->format('d/m/Y') ?? '-',
            $statusLabel,
            $volunteer->reviewer?->name ?? '-',
            $volunteer->reviewed_at?->format('d/m/Y') ?? '-',
            $volunteer->review_notes ?? '-',
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
                    'startColor' => ['argb' => 'FFDC2626'], // red-600 (to match BSMI brand red theme)
                ],
                'alignment' => ['horizontal' => 'center'],
            ],
        ];
    }

    /**
     * Sheet title.
     */
    public function title(): string
    {
        $status = $this->filters['status'] ?? null;
        if ($status) {
            $statusLabel = match($status) {
                'pending' => 'Menunggu',
                'approved' => 'Disetujui',
                'rejected' => 'Ditolak',
                default => ucfirst($status),
            };
            return 'Relawan ' . $statusLabel;
        }

        return 'Semua Relawan';
    }
}
