<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use App\Models\Admin;
use App\Models\Officer;

class AuthController extends Controller
{
    public function loginAdmin(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        $admin = Admin::where('email', $request->email)->first();

        if (!$admin) {
            return response()->json(['message' => 'Alamat email tidak ditemukan.'], 401);
        }

        if (!Hash::check($request->password, $admin->password)) {
            return response()->json(['message' => 'Kata sandi yang Anda masukkan salah.'], 401);
        }

        if (!$admin->is_active) {
            return response()->json(['message' => 'Account is inactive.'], 403);
        }

        $token = $admin->createToken('admin-token')->plainTextToken;

        return response()->json(['token' => $token, 'user' => $admin]);
    }

    public function loginOfficer(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        $officer = Officer::where('email', $request->email)->first();

        if (!$officer) {
            return response()->json(['message' => 'Alamat email tidak ditemukan.'], 401);
        }

        if (!Hash::check($request->password, $officer->password)) {
            return response()->json(['message' => 'Kata sandi yang Anda masukkan salah.'], 401);
        }

        if (!$officer->is_active) {
            return response()->json(['message' => 'Account is inactive.'], 403);
        }

        $token = $officer->createToken('officer-token')->plainTextToken;

        return response()->json(['token' => $token, 'user' => $officer]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Logged out successfully.']);
    }
}
