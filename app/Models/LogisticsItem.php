<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class LogisticsItem extends Model
{
    protected $fillable = [
        'name', 'category', 'quantity', 'unit', 'condition',
        'location', 'expiry_date', 'notes',
    ];

    protected $casts = [
        'quantity'    => 'integer',
        'expiry_date' => 'date',
    ];

    public function transactions(): HasMany
    {
        return $this->hasMany(LogisticsTransaction::class);
    }
}
