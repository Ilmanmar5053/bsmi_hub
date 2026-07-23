<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class BankAccount extends Model
{
    use HasFactory;

    protected $fillable = [
        'account_number',
        'bank_name',
        'account_name',
        'branch_name',
        'logo_url'
    ];
}
