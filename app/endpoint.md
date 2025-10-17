## Admin Endpoints

### GET /admin/dashboard

Get dashboard statistics and heatmap data (government only).

*Request Headers:*

Authorization: Bearer <jwt_token>


*Response (200 OK):*
json
{
  "success": true,
  "stats": {
    "total_issues": 1250,
    "open_issues": 450,
    "in_progress_issues": 200,
    "resolved_issues": 500,
    "closed_issues": 100,
    "total_citizens": 5000,
    "avg_priority": "52.30",
    "category_breakdown": [
      { "category": "pothole", "count": 500 },
      { "category": "garbage", "count": 350 },
      { "category": "streetlight", "count": 200 },
      { "category": "water", "count": 150 },
      { "category": "other", "count": 50 }
    ]
  },
  "heatmap_data": [
    {
      "issue_id": "...",
      "lat": 17.38,
      "lng": 78.48,
      "priority_score": 65.2,
      "status": "open",
      "category": "pothole"
    }
  ],
  "top_priority_issues": [
    {
      "issue_id": "...",
      "reporter_user_id": "...",
      "reporter_name": "John Doe",
      "reporter_profile_pic": "...",
      "image_url": "/uploads/...",
      "description": "...",
      "category": "water",
      "lat": 17.38,
      "lng": 78.48,
      "region": "Downtown",
      "status": "open",
      "priority_score": 85.5,
      "upvotes": 25,
      "downvotes": 0,
      "created_at": "..."
    }
  ]
}


### GET /admin/issues

Get all issues with advanced filters (government only).

*Request Headers:*

Authorization: Bearer <jwt_token>


*Query Parameters:*
- status (optional): Filter by status
- category (optional): Filter by category
- date_from (optional): Filter by creation date (ISO 8601)
- date_to (optional): Filter by creation date (ISO 8601)
- sort_by (optional): Sort field (priority, date_newest, date_oldest, upvotes)
- page (optional): Page number (default: 1)
- limit (optional): Results per page (default: 20)

*Example:*

GET /admin/issues?status=open&category=pothole&sort_by=priority&page=1&limit=10


*Response (200 OK):*
json
{
  "success": true,
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 45,
    "total_pages": 5
  },
  "issues": [
    {
      "issue_id": "...",
      "reporter_user_id": "...",
      "reporter_name": "John Doe",
      "reporter_profile_pic": "...",
      "reporter_email": "user@example.com",
      "wallet_address": "...",
      "image_url": "/uploads/...",
      "description": "...",
      "category": "pothole",
      "lat": 17.38,
      "lng": 78.48,
      "region": "Downtown",
      "status": "open",
      "priority_score": 65.2,
      "blockchain_tx_hash": "...",
      "upvotes": 10,
      "downvotes": 1,
      "admin_proof_url": null,
      "verification_count": 0,
      "created_at": "...",
      "updated_at": "..."
    }
  ]
}


### POST /issue/:id/update-status

Update issue status (government users only).

*Request Headers:*

Authorization: Bearer <jwt_token>
Content-Type: multipart/form-data


*Request Body:*

status: in_progress | resolved | closed
proof_image: [binary file] (optional)


*Response (200 OK):*
json
{
  "success": true,
  "message": "Issue status updated successfully",
  "issue": {
    "issue_id": "...",
    "status": "resolved",
    "admin_proof_url": "/uploads/proof-123.jpg",
    "updated_at": "2024-01-15T15:30:00.000Z"
  },
  "blockchain_tx_hash": "..."
}


*Error Response (403):*
json
{
  "success": false,
  "error": "Only government users can update issue status"
}


---

## Error Handling

### Common Error Responses

*401 Unauthorized:*
json
{
  "success": false,
  "error": "No token provided"
}


*403 Forbidden:*
json
{
  "success": false,
  "error": "Access denied. Government role required."
}


*404 Not Found:*
json
{
  "success": false,
  "error": "Endpoint not found"
}


*500 Internal Server Error:*
json
{
  "success": false,
  "error": "Internal server error"
}


---

## Response Formats

All API responses follow this structure:

### Success Response
json
{
  "success": true,
  "data": { ... }
}


### Error Response
json
{
  "success": false,
  "error": "Error message",
  "details": "Additional error details (optional)"
}


---

## Rate Limiting

Currently no rate limiting is implemented. This should be added in production.

## Versioning

API version: v1 (implicit in all endpoints)

---

Built with ❤ for transparent civic governance