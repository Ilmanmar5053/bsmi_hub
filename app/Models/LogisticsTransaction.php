<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LogisticsTransaction extends Model
{
    protected $fillable = [
        'logistics_item_id', 'type', 'quantity', 'date',
        'source', 'destination', 'donor_name',
        'beneficiary_id', 'program_id', 'notes', 'created_by',
    ];

    protected $casts = [
        'quantity' => 'integer',
        'date'     => 'date',
    ];

    public function item(): BelongsTo
    {
        return $this->belongsTo(LogisticsItem::class, 'logistics_item_id');
    }

    public function beneficiary(): BelongsTo
    {
        return $this->belongsTo(Beneficiary::class);
    }

    public function program(): BelongsTo
    {
        return $this->belongsTo(Program::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
