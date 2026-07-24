<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FinancialReceipt extends Model
{
    use HasFactory;

    protected $fillable = [
        'receipt_number',
        'date',
        'pic_name',
        'description',
        'amount',
        'signature_path',
        'created_by',
    ];

    protected $casts = [
        'date' => 'date',
        'amount' => 'decimal:2',
    ];

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
