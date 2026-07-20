<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Volunteer extends Model
{
    protected $fillable = [
        'name', 'email', 'phone', 'address', 'birth_date', 'user_id',
        'skills', 'motivation', 'job_category', 'job_type', 'id_card_path', 'status', 'diklatsar_stage',
        'applied_date', 'reviewed_by', 'reviewed_at', 'review_notes',
        'gender', 'golongan_darah', 'kesiapan_mobilisasi', 'ukuran_baju', 'emergency_contact', 'emergency_phone', 'regional_cabang', 'pendidikan_terakhir', 'jurusan', 'status_keluarga', 'agama', 'jumlah_tanggungan'
    ];

    protected $casts = [
        'birth_date'  => 'date',
        'applied_date' => 'date',
        'reviewed_at' => 'date',
        'kesiapan_mobilisasi' => 'boolean',
    ];

    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }
}
