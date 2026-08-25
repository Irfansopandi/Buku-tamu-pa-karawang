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
    public function dashboardStats()
    {
        $today = Carbon::today('Asia/Jakarta');
        $startOfMonth = Carbon::now('Asia/Jakarta')->startOfMonth();

        $totalVisitsToday = Visit::whereDate('visit_date', $today)->count();
        $activeVisits = Visit::whereDate('visit_date', $today)
            ->whereIn('status', ['pending', 'checked_in'])
            ->count();
        $completedToday = Visit::whereDate('visit_date', $today)
            ->where('status', 'completed')
            ->count();
        $totalVisitsThisMonth = Visit::whereBetween('visit_date', [$startOfMonth, $today])->count();

        return response()->json([
            'data' => [
                'total_visits_today' => $totalVisitsToday,
                'active_visits' => $activeVisits,
                'completed_today' => $completedToday,
                'total_visits_this_month' => $totalVisitsThisMonth,
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

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('date')) {
            $query->whereDate('visit_date', $request->date);
        }

        return VisitResource::collection($query->orderBy('created_at', 'desc')->paginate(15));
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
