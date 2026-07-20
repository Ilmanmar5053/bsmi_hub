<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Program extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'title', 'description', 'category', 'status',
        'start_date', 'end_date', 'budget', 'spent',
        'location', 'target_beneficiaries', 'created_by', 'notes',
    ];

    protected $casts = [
        'start_date'          => 'date',
        'end_date'            => 'date',
        'budget'              => 'decimal:2',
        'spent'               => 'decimal:2',
        'target_beneficiaries' => 'integer',
    ];

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function participants(): HasMany
    {
        return $this->hasMany(ProgramParticipant::class);
    }

    public function donations(): HasMany
    {
        return $this->hasMany(Donation::class);
    }

    public function financialTransactions(): HasMany
    {
        return $this->hasMany(FinancialTransaction::class);
    }

    public function getProgressPercentageAttribute(): float
    {
        if ($this->budget <= 0) return 0;
        return min(100, round(($this->spent / $this->budget) * 100, 1));
    }
}
