<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Beneficiary extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'name', 'category', 'address', 'phone', 'nik',
        'family_members', 'description', 'total_received',
    ];

    protected $casts = [
        'total_received' => 'decimal:2',
        'family_members' => 'integer',
    ];

    public function donations(): HasMany
    {
        return $this->hasMany(Donation::class);
    }

    public function logisticsTransactions(): HasMany
    {
        return $this->hasMany(LogisticsTransaction::class);
    }
}
