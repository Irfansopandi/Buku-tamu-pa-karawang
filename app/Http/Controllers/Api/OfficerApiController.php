<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Visit;
use App\Http\Resources\VisitResource;
use Illuminate\Support\Facades\DB;

class OfficerApiController extends Controller
{
    public function scan(Request $request)
    {
        $request->validate(['qr_token' => 'required|string']);

        $tokenHash = hash('sha256', $request->qr_token);
        
        $visit = Visit::with(['visitor', 'service', 'members'])->where('qr_token_hash', $tokenHash)->first();

        if (!$visit) {
            return response()->json(['message' => 'Invalid QR Code.'], 404);
        }

        return response()->json([
            'data' => new \App\Http\Resources\OfficerScanResource($visit)
        ]);
    }

    public function checkIn(Request $request, Visit $id)
    {
        $visit = $id;
        
        if ($visit->status !== 'pending') {
            return response()->json([
                'message' => 'Visit cannot be checked in. Current status: ' . $visit->status
            ], 422);
        }

        $today = \Carbon\Carbon::today('Asia/Jakarta')->format('Y-m-d');
        $visitDate = \Carbon\Carbon::parse($visit->visit_date)->format('Y-m-d');
        if ($visitDate !== $today) {
            return response()->json([
                'message' => 'Tiket hanya dapat digunakan pada tanggal kunjungan (' . $visitDate . ').'
            ], 422);
        }

        $visit->update([
            'status' => 'checked_in',
            'checked_in_at' => now()
        ]);

        return response()->json([
            'message' => 'Successfully checked in.',
            'data' => new \App\Http\Resources\OfficerScanResource($visit->load(['visitor', 'service', 'members']))
        ]);
    }

    public function getVisits(Request $request)
    {
        $today = \Carbon\Carbon::today('Asia/Jakarta');
        
        $query = Visit::with(['visitor', 'service', 'members'])
            ->whereDate('checked_in_at', $today);
            
        $totalVisits = clone $query;
        $totalVisitsCount = $totalVisits->count();
        
        $totalMembersCount = \Illuminate\Support\Facades\DB::table('visit_members')
            ->join('visits', 'visit_members.visit_id', '=', 'visits.id')
            ->whereDate('visits.checked_in_at', $today)
            ->count();
            
        $totalPeople = $totalVisitsCount + $totalMembersCount;
        
        $paginator = $query
            ->orderBy('checked_in_at', 'desc')
            ->orderBy('id', 'desc')
            ->paginate(10);
        
        return VisitResource::collection($paginator)->additional([
            'meta' => [
                'total_people' => (int) $totalPeople
            ]
        ]);
    }
}
