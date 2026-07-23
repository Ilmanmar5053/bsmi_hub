<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OrganizationProfile extends Model
{
    protected $fillable = [
        'name', 'vision', 'mission', 'address', 'phone',
        'email', 'website', 'logo_path', 'regional_logos', 'founded_year', 'history',
    ];

    protected $casts = [
        'regional_logos' => 'array',
    ];

    public function getLogoUrlAttribute(): string
    {
        return $this->logo_path
            ? asset('storage/' . $this->logo_path)
            : asset('images/bsmi-logo.svg');
    }
}
