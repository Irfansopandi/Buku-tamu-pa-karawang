<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class VisitResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'visit_number' => $this->visit_number,
            'visit_date' => $this->visit_date ? $this->visit_date->format('Y-m-d') : null,
            'status' => $this->status,
            'checked_in_at' => $this->checked_in_at,
            'completed_at' => $this->completed_at,
            'service' => new ServiceResource($this->whenLoaded('service')),
            'visitor' => [
                'visitor_code' => $this->whenLoaded('visitor', function () {
                    return $this->visitor->visitor_code;
                }),
                'name' => $this->whenLoaded('visitor', function () {
                    return $this->visitor->full_name;
                }),
                'nik' => $this->whenLoaded('visitor', function () use ($request) {
                    return $request->is('api/admin/*') || $request->is('api/officer/*') ? $this->visitor->nik : null;
                }),
                'phone' => $this->whenLoaded('visitor', function () use ($request) {
                    return $request->is('api/admin/*') || $request->is('api/officer/*') ? $this->visitor->phone : null;
                }),
                'email' => $this->whenLoaded('visitor', function () use ($request) {
                    return $request->is('api/admin/*') || $request->is('api/officer/*') ? $this->visitor->email : null;
                }),
            ],
            'members_count' => $this->whenCounted('members'),
            'group_size' => $this->whenLoaded('members', function () {
                return $this->members->count() + 1;
            }),
            'members' => $this->whenLoaded('members', function () {
                return $this->members->map(function ($member) {
                    return [
                        'name' => $member->name,
                    ];
                });
            }),
        ];
    }
}
