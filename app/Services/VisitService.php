<?php

namespace App\Services;

use App\Models\Visitor;
use App\Models\Visit;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class VisitService
{
    /**
     * Generate a concurrency-safe Visitor Code (e.g., PA001).
     *
     * @return string
     */
    public function generateVisitorCode(): string
    {
        return DB::transaction(function () {
            $lastVisitor = Visitor::lockForUpdate()->orderBy('id', 'desc')->first();

            if (!$lastVisitor || !preg_match('/^PA(\d+)$/', $lastVisitor->visitor_code, $matches)) {
                return 'PA001';
            }

            $nextNumber = (int) $matches[1] + 1;
            return 'PA' . str_pad($nextNumber, 3, '0', STR_PAD_LEFT);
        });
    }

    /**
     * Generate a concurrency-safe Visit Number (e.g., PAK-260825-001).
     *
     * @return string
     */
    public function generateVisitNumber(): string
    {
        return DB::transaction(function () {
            $datePrefix = 'PAK-' . now()->timezone('Asia/Jakarta')->format('ymd') . '-';
            
            $lastVisit = Visit::lockForUpdate()
                ->where('visit_number', 'like', $datePrefix . '%')
                ->orderBy('id', 'desc')
                ->first();

            if (!$lastVisit) {
                return $datePrefix . '001';
            }

            $lastSequence = (int) substr($lastVisit->visit_number, -3);
            $nextSequence = $lastSequence + 1;

            return $datePrefix . str_pad($nextSequence, 3, '0', STR_PAD_LEFT);
        });
    }

    /**
     * Generate a cryptographically secure QR token and its hash.
     *
     * @return array [raw_token, token_hash]
     */
    public function generateQrToken(): array
    {
        $rawToken = Str::random(40);
        $tokenHash = hash('sha256', $rawToken);

        return [$rawToken, $tokenHash];
    }
}
