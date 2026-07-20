<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class DuesPeriod extends Model
{
    protected $fillable = ['month', 'year', 'amount', 'due_date', 'notes'];

    protected $casts = [
        'amount'   => 'decimal:2',
        'due_date' => 'date',
        'month'    => 'integer',
        'year'     => 'integer',
    ];

    public function payments(): HasMany
    {
        return $this->hasMany(DuesPayment::class);
    }

    public function getMonthNameAttribute(): string
    {
        $months = [
            1 => 'Januari', 2 => 'Februari', 3 => 'Maret', 4 => 'April',
            5 => 'Mei', 6 => 'Juni', 7 => 'Juli', 8 => 'Agustus',
            9 => 'September', 10 => 'Oktober', 11 => 'November', 12 => 'Desember',
        ];
        return $months[$this->month] . ' ' . $this->year;
    }
}
