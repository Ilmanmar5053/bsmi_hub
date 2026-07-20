<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class News extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'slug',
        'content',
        'category',
        'images',
        'status',
        'published_at',
    ];

    protected $casts = [
        'images' => 'array',
        'published_at' => 'datetime',
    ];
}
