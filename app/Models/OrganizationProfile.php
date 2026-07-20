<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OrganizationProfile extends Model
{
    protected $fillable = [
        'name', 'vision', 'mission', 'address', 'phone',
        'email', 'website', 'logo_path', 'founded_year', 'history',
    ];

    public function getLogoUrlAttribute(): string
    {
        return $this->logo_path
            ? asset('storage/' . $this->logo_path)
            : asset('images/bsmi-logo.svg');
    }
}
