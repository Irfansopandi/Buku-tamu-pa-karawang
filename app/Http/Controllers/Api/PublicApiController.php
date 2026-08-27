<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreVisitRequest;
use App\Http\Resources\ServiceResource;
use App\Models\Service;
use App\Models\Visitor;
use App\Models\Visit;
use App\Services\VisitService;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class PublicApiController extends Controller
{
    protected VisitService $visitService;

    public function __construct(VisitService $visitService)
    {
        $this->visitService = $visitService;
    }

    /**
     * Get active services.
     */
    public function services(): JsonResponse
    {
        $services = Service::where('is_active', true)->orderBy('sort_order')->get();
        return response()->json([
            'data' => ServiceResource::collection($services)
        ]);
    }

    /**
     * Create a public visit (group visit).
     */
    public function storeVisit(StoreVisitRequest $request): JsonResponse
    {
        try {
            $result = DB::transaction(function () use ($request) {
                // 1. Find or Create Main Visitor based on NIK
                // Enforce Existing Visitor Data Integrity rule
                $visitor = Visitor::where('nik', $request->nik)->first();

                if (!$visitor) {
                    $visitor = Visitor::create([
                        'visitor_code' => $this->visitService->generateVisitorCode(),
                        'full_name' => $request->full_name,
                        'nik' => $request->nik,
                        'phone' => $request->phone,
                        'email' => $request->email,
                    ]);
                }
                // Do not update existing visitor data if found

                // 2. Generate QR token and Visit Number
                [$rawToken, $tokenHash] = $this->visitService->generateQrToken();
                $visitNumber = $this->visitService->generateVisitNumber();

                // 3. Create Visit
                $visit = Visit::create([
                    'visitor_id' => $visitor->id,
                    'service_id' => $request->service_id,
                    'visit_number' => $visitNumber,
                    'qr_token_hash' => $tokenHash,
                    'visit_date' => $request->visit_date,
                    'status' => 'pending',
                ]);

                // 4. Create Visit Members
                if ($request->has('members')) {
                    $membersData = array_map(function ($member) {
                        return ['name' => $member['name']];
                    }, $request->members);

                    $visit->members()->createMany($membersData);
                }

                return [
                    'visitor_code' => $visitor->visitor_code,
                    'visit_number' => $visit->visit_number,
                    'qr_token' => $rawToken,
                ];
            });

            return response()->json([
                'message' => 'Visit successfully created.',
                'data' => $result
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to create visit.',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal Server Error'
            ], 500);
        }
    }

    /**
     * Search for a ticket.
     */
    public function searchTicket(\Illuminate\Http\Request $request): JsonResponse
    {
        $request->validate([
            'query' => 'required|string'
        ]);

        $query = $request->input('query');

        $visits = Visit::with(['visitor'])
            ->where('visit_number', $query)
            ->orWhereHas('visitor', function ($q) use ($query) {
                $q->where('nik', $query)
                  ->orWhere('visitor_code', $query);
            })
            ->orderBy('id', 'desc')
            ->get();

        if ($visits->isEmpty()) {
            return response()->json(['message' => 'Tiket kunjungan tidak ditemukan.'], 404);
        }

        $data = $visits->map(function ($visit) {
            // Generate a new QR token so it can be re-rendered
            [$rawToken, $tokenHash] = $this->visitService->generateQrToken();
            $visit->update(['qr_token_hash' => $tokenHash]);
            
            return [
                'visitor_code' => $visit->visitor->visitor_code,
                'visit_number' => $visit->visit_number,
                'full_name' => $visit->visitor->full_name,
                'visit_date' => $visit->visit_date,
                'qr_token' => $rawToken
            ];
        });

        return response()->json([
            'message' => 'Ticket found.',
            'data' => $data
        ]);
    }

    /**
     * Check visitor by NIK for auto-fill in registration form.
     */
    public function checkVisitorByNik($nik): JsonResponse
    {
        $visitor = Visitor::where('nik', $nik)->first();

        if (!$visitor) {
            return response()->json(['message' => 'Visitor not found.'], 404);
        }

        return response()->json([
            'message' => 'Visitor found.',
            'data' => [
                'full_name' => $visitor->full_name,
                'phone' => $visitor->phone,
                'email' => $visitor->email,
            ]
        ]);
    }
}
