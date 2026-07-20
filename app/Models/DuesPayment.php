<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DuesPayment extends Model
{
    protected $fillable = [
        'dues_period_id', 'member_id', 'amount', 'paid_date',
        'status', 'receipt_path', 'notes',
    ];

    protected $casts = [
        'amount'    => 'decimal:2',
        'paid_date' => 'date',
    ];

    public function period(): BelongsTo
    {
        return $this->belongsTo(DuesPeriod::class, 'dues_period_id');
    }

    public function member(): BelongsTo
    {
        return $this->belongsTo(Member::class);
    }
}
