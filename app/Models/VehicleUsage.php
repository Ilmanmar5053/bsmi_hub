<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class VehicleUsage extends Model
{
    use HasFactory;

    protected $fillable = [
        'tanggal_pengajuan',
        'nama_pengaju',
        'asset_id',
        'pic_pemakai',
        'no_telp',
        'alasan_keperluan',
        'tujuan',
        'tanggal_mulai',
        'km_awal',
        'tanggal_selesai',
        'km_akhir',
        'ktp_path',
        'status',
    ];

    protected $casts = [
        'tanggal_pengajuan' => 'date',
        'tanggal_mulai' => 'datetime',
        'tanggal_selesai' => 'datetime',
    ];

    public function asset()
    {
        return $this->belongsTo(Asset::class);
    }
}
