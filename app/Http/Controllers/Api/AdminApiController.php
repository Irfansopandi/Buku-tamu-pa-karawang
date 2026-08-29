<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Visit;
use App\Models\Visitor;
use App\Models\Service;
use App\Models\Officer;
use App\Http\Resources\VisitResource;
use Carbon\Carbon;
use Illuminate\Support\Facades\Hash;

class AdminApiController extends Controller
{
    public function dashboardStats(Request $request)
    {
        $today = Carbon::today('Asia/Jakarta');
        $startOfMonth = Carbon::now('Asia/Jakarta')->startOfMonth();

        // 1. Kunjungan Hari Ini (Tiket) - existing retained
        $totalVisitsToday = Visit::whereDate('visit_date', $today)->count();
        
        // 1.b Kunjungan Hari Ini (Orang)
        $totalMembersToday = \Illuminate\Support\Facades\DB::table('visit_members')
            ->join('visits', 'visit_members.visit_id', '=', 'visits.id')
            ->whereDate('visits.visit_date', $today)
            ->count();
        $totalPeopleToday = $totalVisitsToday + $totalMembersToday;

        // 2. Kunjungan Aktif (Tiket yang belum check-in)
        $activeVisitsQuery = Visit::whereDate('visit_date', $today)->where('status', 'pending');
        $activeVisits = $activeVisitsQuery->count();
        
        $activeMembersToday = \Illuminate\Support\Facades\DB::table('visit_members')
            ->join('visits', 'visit_members.visit_id', '=', 'visits.id')
            ->whereDate('visits.visit_date', $today)
            ->where('visits.status', 'pending')
            ->count();
        $pendingPeopleToday = $activeVisits + $activeMembersToday;
            
        // 3. Selesai Hari Ini (Tiket yang berhasil check-in/scan hari ini)
        $completedToday = Visit::whereDate('checked_in_at', $today)->count();
        
        // 4. Scan Hari Ini (Orang dari tiket yang berhasil check-in/scan hari ini)
        $scannedMembersToday = \Illuminate\Support\Facades\DB::table('visit_members')
            ->join('visits', 'visit_members.visit_id', '=', 'visits.id')
            ->whereDate('visits.checked_in_at', $today)
            ->count();
        $scannedPeopleToday = $completedToday + $scannedMembersToday;

        $totalVisitsThisMonth = Visit::whereBetween('visit_date', [$startOfMonth, $today])->count();

        // --- NEW: Live Operational Summary Lists ---
        $recentScanned = Visit::whereDate('checked_in_at', $today)
            ->with(['visitor', 'service', 'members'])
            ->orderBy('checked_in_at', 'desc')
            ->orderBy('id', 'desc')
            ->take(10)
            ->get()
            ->map(function ($visit, $index) use ($completedToday) {
                return [
                    'sequence_number' => $completedToday - $index,
                    'visit_number' => $visit->visit_number,
                    'visitor_name' => $visit->visitor->full_name ?? $visit->visitor->name,
                    'visitor_email' => $visit->visitor->email ?? null,
                    'visitor_phone' => $visit->visitor->phone ?? null,
                    'service_name' => $visit->service->name ?? '-',
                    'people_count' => 1 + $visit->members->count(),
                    'checked_in_at' => $visit->checked_in_at ? \Carbon\Carbon::parse($visit->checked_in_at)->timezone('Asia/Jakarta')->format('H:i') : null,
                ];
            });

        $recentPending = Visit::whereDate('visit_date', $today)
            ->where('status', 'pending')
            ->with(['visitor', 'service', 'members'])
            ->orderBy('created_at', 'desc')
            ->orderBy('id', 'desc')
            ->take(10)
            ->get()
            ->map(function ($visit, $index) {
                return [
                    'sequence_number' => $index + 1,
                    'visit_number' => $visit->visit_number,
                    'visitor_name' => $visit->visitor->full_name ?? $visit->visitor->name,
                    'visitor_email' => $visit->visitor->email ?? null,
                    'visitor_phone' => $visit->visitor->phone ?? null,
                    'service_name' => $visit->service->name ?? '-',
                    'people_count' => 1 + $visit->members->count(),
                    'created_at' => $visit->created_at ? \Carbon\Carbon::parse($visit->created_at)->timezone('Asia/Jakarta')->format('H:i') : null,
                ];
            });

        // --- NEW: Analytics based on filter ---
        $dailyFilter = $request->query('daily_filter', '7d');
        $monthlyFilter = $request->query('monthly_filter', '1y');
        
        $now = Carbon::now('Asia/Jakarta');
        
        // --- Daily Analytics ---
        $dailyStartDate = clone $now;
        switch ($dailyFilter) {
            case '1m': $dailyStartDate->subMonth(); break;
            case '7d':
            default: $dailyStartDate->subDays(6); break;
        }
        $dailyStartDate->startOfDay();

        $dailyRecords = \Illuminate\Support\Facades\DB::table('visits')
            ->leftJoin('visit_members', 'visits.id', '=', 'visit_members.visit_id')
            ->whereNotNull('visits.checked_in_at')
            ->where('visits.checked_in_at', '>=', $dailyStartDate)
            ->where('visits.checked_in_at', '<=', $now)
            ->selectRaw('DATE(visits.checked_in_at) as date, COUNT(DISTINCT visits.id) as tickets, COUNT(DISTINCT visits.id) + COUNT(visit_members.id) as people')
            ->groupBy('date')
            ->orderBy('date')
            ->get()
            ->keyBy('date');

        $daily = [];
        $currentDate = clone $dailyStartDate;
        $endDateDaily = clone $now;
        
        while ($currentDate->lte($endDateDaily)) {
            $dateStr = $currentDate->toDateString();
            if ($dailyRecords->has($dateStr)) {
                $daily[] = [
                    'date' => $dateStr,
                    'tickets' => (int) $dailyRecords[$dateStr]->tickets,
                    'people' => (int) $dailyRecords[$dateStr]->people,
                ];
            } else {
                $daily[] = ['date' => $dateStr, 'tickets' => 0, 'people' => 0];
            }
            $currentDate->addDay();
        }

        // --- Monthly Analytics ---
        $monthlyStartDate = clone $now;
        switch ($monthlyFilter) {
            case '3m': $monthlyStartDate->subMonths(2); break;
            case '6m': $monthlyStartDate->subMonths(5); break;
            case '1y':
            default: $monthlyStartDate->subMonths(11); break;
        }
        $monthlyStartDate->startOfMonth();

        $monthlyRecords = \Illuminate\Support\Facades\DB::table('visits')
            ->leftJoin('visit_members', 'visits.id', '=', 'visit_members.visit_id')
            ->whereNotNull('visits.checked_in_at')
            ->where('visits.checked_in_at', '>=', $monthlyStartDate)
            ->where('visits.checked_in_at', '<=', $now)
            ->selectRaw('DATE_FORMAT(visits.checked_in_at, "%Y-%m") as month, COUNT(DISTINCT visits.id) as tickets, COUNT(DISTINCT visits.id) + COUNT(visit_members.id) as people')
            ->groupBy('month')
            ->orderBy('month')
            ->get()
            ->keyBy('month');

        $monthly = [];
        $currentMonth = (clone $monthlyStartDate)->startOfMonth();
        $endMonthLoop = clone $now;

        while ($currentMonth->lte($endMonthLoop)) {
            $monthStr = $currentMonth->format('Y-m');
            if ($monthlyRecords->has($monthStr)) {
                $monthly[] = [
                    'month' => $monthStr,
                    'tickets' => (int) $monthlyRecords[$monthStr]->tickets,
                    'people' => (int) $monthlyRecords[$monthStr]->people,
                ];
            } else {
                $monthly[] = ['month' => $monthStr, 'tickets' => 0, 'people' => 0];
            }
            $currentMonth->addMonth();
        }

        return response()->json([
            'data' => [
                'total_visits_today' => $totalVisitsToday,
                'total_people_today' => $totalPeopleToday,
                'active_visits' => $activeVisits,
                'pending_people_today' => $pendingPeopleToday,
                'completed_today' => $completedToday,
                'scanned_people_today' => $scannedPeopleToday,
                'total_visits_this_month' => $totalVisitsThisMonth,
                'recent_scanned' => $recentScanned,
                'recent_pending' => $recentPending,
                'analytics' => [
                    'daily_filter' => $dailyFilter,
                    'monthly_filter' => $monthlyFilter,
                    'daily' => $daily,
                    'monthly' => $monthly,
                ],
            ]
        ]);
    }

    public function getVisitors(Request $request)
    {
        $query = Visitor::query();
        
        if ($request->has('search')) {
            $search = $request->search;
            $query->where('full_name', 'like', "%{$search}%")
                  ->orWhere('visitor_code', 'like', "%{$search}%")
                  ->orWhere('nik', 'like', "%{$search}%");
        }

        return response()->json($query->paginate(15));
    }

    public function getVisits(Request $request)
    {
        $query = Visit::with(['visitor', 'service', 'members']);

        $isScannedOnly = filter_var($request->query('scanned_only', false), FILTER_VALIDATE_BOOLEAN);

        if ($isScannedOnly) {
            $query->whereNotNull('checked_in_at');
        }

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('date')) {
            if ($isScannedOnly) {
                $query->whereDate('checked_in_at', $request->date);
            } else {
                $query->whereDate('visit_date', $request->date);
            }
        }

        if ($request->has('month') && $request->has('year')) {
            if ($isScannedOnly) {
                $query->whereMonth('checked_in_at', $request->month)
                      ->whereYear('checked_in_at', $request->year);
            } else {
                $query->whereMonth('visit_date', $request->month)
                      ->whereYear('visit_date', $request->year);
            }
        }

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('visit_number', 'like', "%{$search}%")
                  ->orWhereHas('visitor', function($qVisitor) use ($search) {
                      $qVisitor->where('nik', 'like', "%{$search}%");
                  });
            });
        }

        $perPage = $request->input('per_page', 10);

        if ($isScannedOnly) {
            $query->orderBy('checked_in_at', 'desc')->orderBy('id', 'desc');
        } else {
            $query->orderBy('created_at', 'desc')->orderBy('id', 'desc');
        }

        $resource = VisitResource::collection($query->paginate($perPage));

        // --- Calculate Summary Stats ---
        $scannedQuery = Visit::whereNotNull('checked_in_at');
        $pendingQuery = Visit::where('status', 'pending');
        
        if ($request->has('date')) {
            $scannedQuery->whereDate('checked_in_at', $request->date);
            $pendingQuery->whereDate('visit_date', $request->date);
        }
        if ($request->has('month') && $request->has('year')) {
            $scannedQuery->whereMonth('checked_in_at', $request->month)->whereYear('checked_in_at', $request->year);
            $pendingQuery->whereMonth('visit_date', $request->month)->whereYear('visit_date', $request->year);
        }
        if ($request->has('search')) {
            $search = $request->search;
            $searchClosure = function($q) use ($search) {
                $q->where('visit_number', 'like', "%{$search}%")
                  ->orWhereHas('visitor', function($qVisitor) use ($search) {
                      $qVisitor->where('nik', 'like', "%{$search}%");
                  });
            };
            $scannedQuery->where($searchClosure);
            $pendingQuery->where($searchClosure);
        }
        
        $scannedTickets = (clone $scannedQuery)->count();
        $scannedMembers = \Illuminate\Support\Facades\DB::table('visit_members')
            ->joinSub((clone $scannedQuery)->select('id'), 'v', function ($join) { $join->on('visit_members.visit_id', '=', 'v.id'); })
            ->count();
            
        $pendingTickets = (clone $pendingQuery)->count();
        $pendingMembers = \Illuminate\Support\Facades\DB::table('visit_members')
            ->joinSub((clone $pendingQuery)->select('id'), 'v', function ($join) { $join->on('visit_members.visit_id', '=', 'v.id'); })
            ->count();
            
        return $resource->additional([
            'summary' => [
                'scanned' => [
                    'tickets' => $scannedTickets, 
                    'people' => $scannedTickets + $scannedMembers
                ],
                'pending' => [
                    'tickets' => $pendingTickets, 
                    'people' => $pendingTickets + $pendingMembers
                ],
            ]
        ]);
    }

    public function updateVisitStatus(Request $request, Visit $visit)
    {
        $request->validate([
            'status' => 'required|in:pending,checked_in,completed,cancelled'
        ]);
        
        // Allowed transitions: pending->checked_in, pending->cancelled, checked_in->completed
        $validTransitions = [
            'pending' => ['checked_in', 'cancelled'],
            'checked_in' => ['completed']
        ];

        $currentStatus = $visit->status;
        $newStatus = $request->status;

        if ($currentStatus === $newStatus) {
             return response()->json(['message' => 'Status is already ' . $newStatus], 422);
        }

        if (!isset($validTransitions[$currentStatus]) || !in_array($newStatus, $validTransitions[$currentStatus])) {
             return response()->json(['message' => 'Invalid state transition from ' . $currentStatus . ' to ' . $newStatus], 422);
        }

        $updateData = ['status' => $newStatus];
        if ($newStatus === 'checked_in') $updateData['checked_in_at'] = now();
        if ($newStatus === 'completed') $updateData['completed_at'] = now();

        $visit->update($updateData);

        return response()->json(['message' => 'Status updated.', 'data' => new VisitResource($visit)]);
    }

    // --- Services CRUD ---
    public function getServices() { return response()->json(Service::orderBy('sort_order')->get()); }
    public function storeService(Request $request) {
        $validated = $request->validate(['name' => 'required', 'description' => 'nullable', 'is_active' => 'boolean', 'sort_order' => 'integer']);
        return response()->json(Service::create($validated), 201);
    }
    public function updateService(Request $request, Service $service) {
        $validated = $request->validate(['name' => 'required', 'description' => 'nullable', 'is_active' => 'boolean', 'sort_order' => 'integer']);
        $service->update($validated);
        return response()->json($service);
    }
    public function deleteService(Service $service) {
        $service->delete();
        return response()->json(['message' => 'Deleted']);
    }

    // --- Officers CRUD ---
    public function getOfficers() { return response()->json(Officer::all()); }
    public function storeOfficer(Request $request) {
        $validated = $request->validate(['name' => 'required', 'email' => 'required|email|unique:officers', 'password' => 'required|min:6', 'is_active' => 'boolean']);
        $validated['password'] = Hash::make($validated['password']);
        return response()->json(Officer::create($validated), 201);
    }
    public function updateOfficer(Request $request, Officer $officer) {
        $validated = $request->validate(['name' => 'required', 'email' => 'required|email|unique:officers,email,'.$officer->id, 'password' => 'nullable|min:6', 'is_active' => 'boolean']);
        if (!empty($validated['password'])) {
            $validated['password'] = Hash::make($validated['password']);
        } else {
            unset($validated['password']);
        }
        $officer->update($validated);
        return response()->json($officer);
    }
    public function deleteOfficer(Officer $officer) {
        $officer->delete();
        return response()->json(['message' => 'Deleted']);
    }
}
