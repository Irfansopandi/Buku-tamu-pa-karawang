<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Carbon\Carbon;
use App\Models\Service;

class StoreVisitRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true; // Public endpoint
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $groupSize = max(1, $this->integer('group_size', 1));
        $expectedMembersCount = $groupSize - 1;

        return [
            'full_name' => ['required', 'string', 'max:100'],
            'nik' => ['required', 'digits:16'],
            'phone' => ['required', 'string', 'regex:/^[0-9]+$/', 'max:20'],
            'email' => ['required', 'email', 'max:150'],
            'group_size' => ['required', 'integer', 'min:1'],
            'members' => ['array', 'size:' . $expectedMembersCount],
            'members.*.name' => ['required_with:members', 'string', 'max:100'],
            'visit_date' => ['required', 'date', 'date_format:Y-m-d'],
            'service_id' => ['required', 'integer', 'exists:services,id'],
        ];
    }

    /**
     * Configure the validator instance.
     *
     * @param  \Illuminate\Validation\Validator  $validator
     * @return void
     */
    public function withValidator($validator)
    {
        $validator->after(function ($validator) {
            // 1. Validate Service is active
            $service = Service::find($this->service_id);
            if ($service && !$service->is_active) {
                $validator->errors()->add('service_id', 'The selected service is not active.');
            }

            // 2. Validate Visit Date (Today onwards, no weekends in Asia/Jakarta)
            if ($this->visit_date) {
                $tz = 'Asia/Jakarta';
                $today = Carbon::now($tz)->startOfDay();
                $visitDate = Carbon::parse($this->visit_date, $tz)->startOfDay();

                if ($visitDate->lt($today)) {
                    $validator->errors()->add('visit_date', 'Tanggal kunjungan tidak boleh di masa lalu.');
                } elseif ($visitDate->isWeekend()) {
                    $validator->errors()->add('visit_date', 'Tanggal kunjungan tidak bisa pada hari Sabtu atau Minggu.');
                }
            }
        });
    }
}
