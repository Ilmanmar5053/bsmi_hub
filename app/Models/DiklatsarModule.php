<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DiklatsarModule extends Model
{
    use HasFactory;

    protected $fillable = [
        'stage_number',
        'title',
        'description',
        'schedule',
        'speaker',
    ];
}
