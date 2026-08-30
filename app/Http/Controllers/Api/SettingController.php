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
            'form_type' => 'required|in:image,video',
        ]);

        if ($request->form_type === 'image') {
            $request->validate([
                'welcome_image' => 'required|image|mimes:jpeg,png,jpg,webp,svg|max:5120',
            ], [
                'welcome_image.required' => 'Pilih gambar terlebih dahulu.',
            ]);

            $path = $request->file('welcome_image')->store('public/settings');
            $url = Storage::url($path);
            Setting::updateOrCreate(['key' => 'welcome_image'], ['value' => $url]);

            return response()->json([
                'success' => true,
                'message' => 'Gambar panduan berhasil disimpan.',
            ]);
        }

        if ($request->form_type === 'video') {
            $request->validate([
                'welcome_video_type' => 'required|in:upload,youtube',
                'welcome_video_file' => 'required_if:welcome_video_type,upload|mimes:mp4,webm|max:51200',
                'welcome_video_url' => 'required_if:welcome_video_type,youtube|url',
            ], [
                'welcome_video_file.required_if' => 'Pilih file video terlebih dahulu.',
                'welcome_video_url.required_if' => 'URL YouTube tidak boleh kosong.',
                'welcome_video_url.url' => 'Format URL tidak valid.',
            ]);

            Setting::updateOrCreate(['key' => 'welcome_video_type'], ['value' => $request->welcome_video_type]);

            if ($request->welcome_video_type === 'upload') {
                if ($request->hasFile('welcome_video_file')) {
                    $path = $request->file('welcome_video_file')->store('public/settings');
                    $url = Storage::url($path);
                    Setting::updateOrCreate(['key' => 'welcome_video_url'], ['value' => $url]);
                }
            } else {
                Setting::updateOrCreate(['key' => 'welcome_video_url'], ['value' => $request->welcome_video_url]);
            }

            return response()->json([
                'success' => true,
                'message' => 'Video panduan berhasil disimpan.',
            ]);
        }
    }
}
