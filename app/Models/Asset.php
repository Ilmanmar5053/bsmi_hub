<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Asset extends Model
{
    use HasFactory;

    protected $fillable = [
        'nama_barang',
        'kategori_barang',
        'nilai_aset',
        'tipe_model',
        'nomor_sku_serial',
        'tanggal_pembelian',
        'kepemilikan',
        'pic_id',
        'foto_aset',
        'lokasi',
        'tanggal_stock_opname',
    ];

    public function pic()
    {
        return $this->belongsTo(Member::class, 'pic_id');
    }

    public function vehicleUsages()
    {
        return $this->hasMany(VehicleUsage::class, 'asset_id');
    }
}
