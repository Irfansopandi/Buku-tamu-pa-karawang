<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Visitor extends Model
{
    protected $fillable = [
        'visitor_code',
        'full_name',
        'nik',
        'phone',
        'email',
    ];

    public function visits(): HasMany
    {
        return $this->hasMany(Visit::class);
    }
}
