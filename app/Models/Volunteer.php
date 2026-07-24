<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Spatie\Activitylog\Models\Concerns\LogsActivity;
use Spatie\Activitylog\Support\LogOptions;

class Volunteer extends Model
{
    use LogsActivity;

    protected static function booted()
    {
        static::addGlobalScope(new \App\Models\Scopes\RegionalCabangScope);
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logFillable()
            ->logOnlyDirty()
            ->dontLogEmptyChanges()
            ->useLogName('volunteer_management');
    }
    protected $fillable = [
        'name', 'email', 'phone', 'address', 'birth_date', 'user_id',
        'skills', 'motivation', 'job_category', 'job_type', 'id_card_path', 'status', 'diklatsar_stage',
        'applied_date', 'reviewed_by', 'reviewed_at', 'review_notes',
        'gender', 'golongan_darah', 'kesiapan_mobilisasi', 'ukuran_baju', 'emergency_contact', 'emergency_phone', 'regional_cabang', 'pendidikan_terakhir', 'jurusan', 'status_keluarga', 'agama', 'jumlah_tanggungan', 'photo_path'
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

    public function getPhotoUrlAttribute(): string
    {
        if ($this->photo_path) {
            return asset('storage/' . $this->photo_path);
        }

        $bg = $this->gender === 'P' ? 'fbcfe8' : 'bfdbfe';
        $color = $this->gender === 'P' ? '9d174d' : '1e3a8a';
        return 'https://ui-avatars.com/api/?name=' . urlencode($this->name) . '&background=' . $bg . '&color=' . $color;
    }
}
