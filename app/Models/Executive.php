<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Executive extends Model
{
    protected $fillable = [
        'member_id', 'nama_lengkap', 'jabatan', 'bagian_divisi',
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
