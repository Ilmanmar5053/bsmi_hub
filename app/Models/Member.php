<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Spatie\Activitylog\Models\Concerns\LogsActivity;
use Spatie\Activitylog\Support\LogOptions;

class Member extends Model
{
    use SoftDeletes, LogsActivity;

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logFillable()
            ->logOnlyDirty()
            ->dontLogEmptyChanges()
            ->useLogName('member_management');
    }

    protected $fillable = [
        'user_id', 'no_induk_anggota', 'nama_lengkap', 'gender', 'email', 'no_whatsapp', 'photo_path',
        'bagian_divisi', 'join_date', 'status_aktif', 'alamat_domisili', 'birth_date',
        'golongan_darah', 'emergency_contact', 'emergency_phone', 'notes',
        'profesi_utama', 'kesiapan_mobilisasi', 'ukuran_baju',
        'regional_cabang', 'pendidikan_terakhir', 'jurusan', 'status_keluarga', 'agama', 'jumlah_tanggungan'
    ];

    protected $casts = [
        'join_date'  => 'date',
        'birth_date' => 'date',
        'status_aktif' => 'boolean',
        'kesiapan_mobilisasi' => 'boolean',
    ];

    public function executives(): HasMany
    {
        return $this->hasMany(Executive::class);
    }

    public function duesPayments(): HasMany
    {
        return $this->hasMany(DuesPayment::class);
    }

    public function programParticipations(): HasMany
    {
        return $this->hasMany(ProgramParticipant::class);
    }

    public function getPhotoUrlAttribute(): string
    {
        if ($this->photo_path) {
            return asset('storage/' . $this->photo_path);
        }

        $bg = $this->gender === 'P' ? 'fbcfe8' : 'bfdbfe';
        $color = $this->gender === 'P' ? 'be185d' : '1d4ed8';
        $name = urlencode($this->nama_lengkap);
        
        return "https://ui-avatars.com/api/?name={$name}&background={$bg}&color={$color}&rounded=true&bold=true";
    }
}
