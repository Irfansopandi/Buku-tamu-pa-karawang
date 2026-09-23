<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class SettingController extends Controller
{
    public function index()
    {
        $settings = Setting::pluck('value', 'key');
        return response()->json([
            'success' => true,
            'data' => $settings
        ]);
    }

    public function updatePublicGuide(Request $request)
    {
        $request->validate([
            'form_type' => 'required|in:pdf,youtube',
        ]);

        if ($request->form_type === 'youtube') {
            $request->validate([
                'tutorial_youtube_url' => 'required|url',
            ], [
                'tutorial_youtube_url.required' => 'URL YouTube tidak boleh kosong.',
                'tutorial_youtube_url.url' => 'Format URL tidak valid.',
            ]);

            Setting::updateOrCreate(['key' => 'tutorial_youtube_url'], ['value' => $request->tutorial_youtube_url]);

            return response()->json([
                'success' => true,
                'message' => 'URL Video Tutorial berhasil disimpan.',
            ]);
        }

        if ($request->form_type === 'pdf') {
            $request->validate([
                'welcome_pdf' => 'required|mimes:pdf|max:10240', // max 10MB
            ], [
                'welcome_pdf.required' => 'Pilih file PDF terlebih dahulu.',
                'welcome_pdf.mimes' => 'File harus berupa PDF.',
                'welcome_pdf.max' => 'Ukuran file PDF maksimal 10MB.',
            ]);

            if ($request->hasFile('welcome_pdf')) {
                $path = $request->file('welcome_pdf')->store('settings', 'public');
                $url = '/storage/' . $path;
                Setting::updateOrCreate(['key' => 'welcome_pdf'], ['value' => $url]);
                
                // Opsional: Hapus setting lama jika belum terhapus
                Setting::whereIn('key', ['welcome_image', 'welcome_video_type', 'welcome_video_url'])->delete();
            }

            return response()->json([
                'success' => true,
                'message' => 'Buku Panduan PDF berhasil disimpan.',
            ]);
        }
    }
}
