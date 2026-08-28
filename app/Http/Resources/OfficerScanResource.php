<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OfficerScanResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        // Inherit everything from standard VisitResource
        $data = (new VisitResource($this->resource))->toArray($request);
        
        // Inject PII fields only for Officer Scan Context
        if ($this->relationLoaded('visitor') && $this->visitor) {
            $data['visitor']['nik'] = $this->visitor->nik;
            $data['visitor']['phone'] = $this->visitor->phone;
            $data['visitor']['email'] = $this->visitor->email;
        }

        // Inject members array
        if ($this->relationLoaded('members') && $this->members) {
            $data['members'] = $this->members->map(function ($member) {
                return [
                    'name' => $member->name
                ];
            })->toArray();
        }

        return $data;
    }
}
