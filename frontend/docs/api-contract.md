# API Contract — Buku Tamu Pengadilan Agama Karawang

This document serves as the factual API contract for the Next.js frontend, derived directly from the Laravel 12 backend implementation.

## Public API

### GET `/api/services`
* **Method:** GET
* **Authentication:** None (Public)
* **Rate Limit:** None specified for this endpoint.
* **Request:** No parameters required.
* **Response:** (200 OK)
  ```json
  {
    "data": [
      {
        "id": 1,
        "name": "Service Name",
        "description": "Optional description"
      }
    ]
  }
  ```
* **Notes:** Only active services are returned, ordered by `sort_order`.

### POST `/api/visits`
* **Method:** POST
* **Authentication:** None (Public)
* **Rate Limit:** 5 requests per minute.
* **Request Body (JSON):**
  * `full_name` (string, required, max 100)
  * `nik` (string, required, exactly 16 digits)
  * `phone` (string, required, numeric regex, max 20)
  * `email` (string, required, email format, max 150)
  * `group_size` (integer, required, min 1)
  * `members` (array, required if group_size > 1, size must equal group_size - 1)
    * `members.*.name` (string, required if members exist, max 100)
  * `visit_date` (string, required, format Y-m-d)
  * `service_id` (integer, required, must exist in active services)
* **Backend Validation Rules:** 
  * `visit_date` must be between H-2 and Today (Asia/Jakarta timezone).
  * `service_id` must be an active service.
* **Response:** (201 Created)
  ```json
  {
    "message": "Visit successfully created.",
    "data": {
      "visitor_code": "V-XXXXXX",
      "visit_number": "VN-XXXXXX",
      "qr_token": "raw-token-string"
    }
  }
  ```
* **Errors:**
  * `422 Unprocessable Entity`: Validation failed.
  * `429 Too Many Requests`: Rate limit exceeded.

## Auth API

### POST `/api/login/admin`
* **Method:** POST
* **Rate Limit:** 10 requests per minute.
* **Request:** `email` (required, email), `password` (required)
* **Response:** (200 OK) Returns `{ "token": "...", "user": { ... } }`
* **Errors:** 
  * `401 Unauthorized`: Invalid credentials.
  * `403 Forbidden`: Account is inactive.

### POST `/api/login/officer`
* **Method:** POST
* **Rate Limit:** 10 requests per minute.
* **Request:** `email` (required, email), `password` (required)
* **Response:** (200 OK) Returns `{ "token": "...", "user": { ... } }`
* **Errors:** 
  * `401 Unauthorized`: Invalid credentials.
  * `403 Forbidden`: Account is inactive.

## Officer API
*(Requires Bearer Token with `officer` guard and `is_active` true)*

### POST `/api/officer/logout`
* **Method:** POST
* **Response:** (200 OK) `{ "message": "Logged out successfully." }`

### POST `/api/officer/scan`
* **Method:** POST
* **Request:** `qr_token` (string, required)
* **Response:** (200 OK)
  ```json
  {
    "data": {
      "id": 1,
      "visit_number": "VN-...",
      "visit_date": "2026-08-25",
      "status": "pending",
      "checked_in_at": null,
      "completed_at": null,
      "service": { "id": 1, "name": "...", "description": "..." },
      "visitor": { "visitor_code": "V-...", "name": "..." },
      "members_count": 0,
      "group_size": 1
    }
  }
  ```
* **Errors:** `404 Not Found` if token invalid.

### POST `/api/officer/visits/{id}/check-in`
* **Method:** POST
* **Path Parameter:** `id` (integer, visit ID)
* **Response:** (200 OK)
  ```json
  {
    "message": "Successfully checked in.",
    "data": { ...visit resource... }
  }
  ```
* **Errors:** `422 Unprocessable Entity` if status is not 'pending'.

## Admin API
*(Requires Bearer Token with `admin` guard and `is_active` true)*

### GET `/api/admin/dashboard`
* **Response:** `{ "data": { "total_visits_today": 0, "active_visits": 0, "completed_today": 0, "total_visits_this_month": 0 } }`

### GET `/api/admin/visitors`
* **Query Params:** `search` (optional)
* **Response:** Paginated Laravel response (15 per page).

### GET `/api/admin/visits`
* **Query Params:** `status` (optional), `date` (optional, Y-m-d)
* **Response:** Paginated Laravel resource collection (15 per page).

### PUT `/api/admin/visits/{visit}/status`
* **Request:** `status` (required, in: pending, checked_in, completed, cancelled)
* **Allowed Transitions:** pending -> checked_in/cancelled, checked_in -> completed.
* **Response:** (200 OK) `{ "message": "Status updated.", "data": { ... } }`
* **Errors:** `422 Unprocessable Entity` if invalid transition.

### Services CRUD
* `GET /api/admin/services`
* `POST /api/admin/services` (requires `name`, `is_active`, `sort_order`)
* `PUT /api/admin/services/{service}` 
* `DELETE /api/admin/services/{service}`

### Officers CRUD
* `GET /api/admin/officers`
* `POST /api/admin/officers` (requires `name`, `email`, `password`, `is_active`)
* `PUT /api/admin/officers/{officer}`
* `DELETE /api/admin/officers/{officer}`

## Error Contract
Laravel standard errors:
```json
{
  "message": "The given data was invalid.",
  "errors": {
    "field_name": ["Error message 1", "Error message 2"]
  }
}
```

## PII / Security Notes
* **NIK, Phone, Email:** Stored in backend but intentionally omitted from the `VisitResource` to prevent exposure during officer scanning or public responses.
* **Frontend Handling:** Do NOT place NIK, phone, or email in local storage, URL params, or QR codes. The QR code must only contain the backend-provided `qr_token`.
