<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\PublicApiController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\OfficerApiController;
use App\Http\Controllers\Api\AdminApiController;

// Public Routes (Rate limited to 60 per minute to accommodate auto-fill and searches)
Route::middleware('throttle:60,1')->group(function () {
    Route::post('/visits', [PublicApiController::class, 'storeVisit']);
    Route::get('/visits/search', [PublicApiController::class, 'searchTicket']);
    Route::get('/visitors/check/{nik}', [PublicApiController::class, 'checkVisitorByNik']);
});

Route::get('/services', [PublicApiController::class, 'services']);

// Public Settings API (No Auth Required)
Route::get('/settings', [App\Http\Controllers\Api\SettingController::class, 'index']);

// Auth Routes (Rate limited)
Route::middleware('throttle:10,1')->group(function () {
    Route::post('/login/admin', [AuthController::class, 'loginAdmin']);
    Route::post('/login/officer', [AuthController::class, 'loginOfficer']);
});

// Officer Routes
Route::middleware(['auth:officer', 'is_active'])->prefix('officer')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::post('/scan', [OfficerApiController::class, 'scan']);
    Route::post('/visits/{id}/check-in', [OfficerApiController::class, 'checkIn']);
    Route::get('/visits', [OfficerApiController::class, 'getVisits']);
});

// Admin Routes
Route::middleware(['auth:admin', 'is_active'])->prefix('admin')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/dashboard', [AdminApiController::class, 'dashboardStats']);
    
    // Settings
    Route::post('/settings/public-guide', [App\Http\Controllers\Api\SettingController::class, 'updatePublicGuide']);
    
    // Visitors
    Route::get('/visitors', [AdminApiController::class, 'getVisitors']);
    
    // Visits
    Route::get('/visits', [AdminApiController::class, 'getVisits']);
    Route::put('/visits/{visit}/status', [AdminApiController::class, 'updateVisitStatus']);
    
    // Services
    Route::get('/services', [AdminApiController::class, 'getServices']);
    Route::post('/services', [AdminApiController::class, 'storeService']);
    Route::put('/services/{service}', [AdminApiController::class, 'updateService']);
    Route::delete('/services/{service}', [AdminApiController::class, 'deleteService']);
    
    // Officers
    Route::get('/officers', [AdminApiController::class, 'getOfficers']);
    Route::post('/officers', [AdminApiController::class, 'storeOfficer']);
    Route::put('/officers/{officer}', [AdminApiController::class, 'updateOfficer']);
    Route::delete('/officers/{officer}', [AdminApiController::class, 'deleteOfficer']);
});
