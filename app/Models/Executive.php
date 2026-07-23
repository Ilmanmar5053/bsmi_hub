<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Spatie\Activitylog\Models\Concerns\LogsActivity;
use Spatie\Activitylog\Support\LogOptions;

class Executive extends Model
{
    use LogsActivity;

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logFillable()
            ->logOnlyDirty()
            ->dontLogEmptyChanges()
            ->useLogName('executive_management');
    }
    protected $fillable = [
        'member_id', 'regional_cabang', 'nama_lengkap', 'jabatan', 'bagian_divisi',
        'periode_mulai', 'periode_selesai', 'status_aktif', 'photo_path', 'notes',
        'profesi_utama', 'golongan_darah', 'kesiapan_mobilisasi', 'ukuran_baju'
    ];

    protected $casts = [
        'periode_mulai' => 'date',
        'periode_selesai' => 'date',
        'status_aktif'    => 'boolean',
        'kesiapan_mobilisasi' => 'boolean',
    ];

    public function member(): BelongsTo
    {
        return $this->belongsTo(Member::class);
    }

    public function getPhotoUrlAttribute(): ?string
    {
        return $this->photo_path
            ? asset('storage/' . $this->photo_path)
            : null;
    }
}
