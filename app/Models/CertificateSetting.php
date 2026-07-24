<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CertificateSetting extends Model
{
    protected $fillable = [
        'certificate_number', 'role_text', 'description_text', 'year_text',
        'organizer', 'location', 'day_text', 'date_text',
        'signature_1_name', 'signature_1_title', 'signature_1_image',
        'signature_2_name', 'signature_2_title', 'signature_2_image'
    ];
}
