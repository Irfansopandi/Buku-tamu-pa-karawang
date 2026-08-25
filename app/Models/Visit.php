<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Visit extends Model
{
    protected $fillable = [
        'visitor_id',
        'service_id',
        'visit_number',
        'qr_token_hash',
        'visit_date',
        'status',
        'checked_in_at',
        'completed_at',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'visit_date' => 'date',
            'checked_in_at' => 'datetime',
            'completed_at' => 'datetime',
        ];
    }

    public function visitor(): BelongsTo
    {
        return $this->belongsTo(Visitor::class);
    }

    public function service(): BelongsTo
    {
        return $this->belongsTo(Service::class);
    }

    public function members(): HasMany
    {
        return $this->hasMany(VisitMember::class);
    }
}
