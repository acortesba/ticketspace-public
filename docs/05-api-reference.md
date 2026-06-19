# 05. API Reference — TicketSpace

> A comprehensive reference for the TicketSpace REST API endpoints.

---

## Authentication & Authorization

All protected endpoints require a JWT token to be passed in the `Authorization` header as a Bearer token.

**Header Format**: `Authorization: Bearer <access_token>`

If an access token is expired, the server returns a `401 Unauthorized` response. The client must then use the `refresh_token` to obtain a new access token via the `/api/v1/auth/refresh` endpoint.

Role-Based Access Control (RBAC) applies to all endpoints. Users must have the required roles or permissions to access specific routes.

---

## 1. Authentication Endpoints

### 1.1. Login
Authenticate a user and retrieve tokens.

**Endpoint**: `POST /api/v1/auth/login`
**Rate Limit**: Strict (10 req / 60s)

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

**Response** (`200 OK`):
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "uuid": "uuid-v4-string",
      "email": "user@example.com",
      "first_name": "John",
      "last_name": "Doe",
      "roles": ["host"]
    },
    "access_token": "jwt.string.here",
    "refresh_token": "hex.string.here"
  }
}
```

### 1.2. Register
Register a new user account.

**Endpoint**: `POST /api/v1/auth/register`
**Rate Limit**: Strict

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "securepassword123",
  "password_confirmation": "securepassword123",
  "first_name": "John",
  "last_name": "Doe",
  "phone": "+34 600 000 000"
}
```

### 1.3. Refresh Token
Obtain a new access token using a refresh token.

**Endpoint**: `POST /api/v1/auth/refresh`

**Request Body**:
```json
{
  "refresh_token": "hex.string.here"
}
```

**Response** (`200 OK`):
```json
{
  "success": true,
  "data": {
    "access_token": "new.jwt.string.here"
  }
}
```

---

## 2. Event Endpoints

### 2.1. Create Event
Create a new event, including ticket types and assigning promoters. This is an atomic transaction.

**Endpoint**: `POST /api/v1/events`
**Authorization**: `Bearer` required.
**Roles**: `host` or `admin`

**Request Body**:
```json
{
  "title": "Summer Music Festival",
  "description": "The biggest event of the summer.",
  "event_type": "festival",
  "allocation_type": "general_admission",
  "venue_name": "Estadio Municipal",
  "venue_address": "Calle Principal 1, Madrid",
  "latitude": 40.4168,
  "longitude": -3.7038,
  "doors_open": "2026-08-15 18:00:00",
  "event_start": "2026-08-15 20:00:00",
  "event_end": "2026-08-16 02:00:00",
  "capacity": 5000,
  "is_public": 1,
  "tickets": [
    {
      "name": "General Admission",
      "price": 25.00,
      "quantity": 4000,
      "saleStart": "2026-06-01 00:00:00",
      "saleEnd": "2026-08-15 19:00:00"
    }
  ],
  "promoters": [
    {
      "uid": "optional-existing-uid",
      "email": "invitee@example.com",
      "firstName": "Jane",
      "lastName": "Smith",
      "commissionType": "percentage",
      "commissionValue": 10,
      "promoCode": "SUMMER10"
    }
  ]
}
```
*Note: If `email` is provided instead of `uid` for a promoter, the system creates a Provisional User.*

### 2.2. Get My Promoters
Fetch a list of promoters the current host has used in the past.

**Endpoint**: `GET /api/v1/events/my-promoters`
**Authorization**: `Bearer` required.

**Response** (`200 OK`):
```json
{
  "success": true,
  "data": [
    {
      "uid": "12345",
      "email": "promoter1@example.com",
      "first_name": "Alice",
      "last_name": "Brown"
    }
  ]
}
```

---

## 3. Ticket Endpoints

### 3.1. Get My Tickets
Retrieve the active and upcoming tickets for the authenticated user.

**Endpoint**: `GET /api/v1/tickets/my`
**Authorization**: `Bearer` required.

### 3.2. Get Past Tickets
Retrieve past (expired/used) tickets for the authenticated user.

**Endpoint**: `GET /api/v1/tickets/past`
**Authorization**: `Bearer` required.

### 3.3. Get Ticket Details
Get details for a specific ticket by its secure token.

**Endpoint**: `GET /api/v1/tickets/{token}`
**Authorization**: `Bearer` required.

### 3.4. Scan Ticket (Staff/Host Only)
Scan and validate a ticket QR code at the door.

**Endpoint**: `POST /api/v1/tickets/scan`
**Authorization**: `Bearer` required.
**Roles**: `staff`, `host`, `admin`

**Request Body**:
```json
{
  "token": "64-char-hex-token-from-qr-code"
}
```

**Response** (`200 OK`):
```json
{
  "success": true,
  "message": "Ticket validated successfully.",
  "data": {
    "status": "checked_in"
  }
}
```

---

## 4. User Profile Endpoints

### 4.1. Update Profile
Update the authenticated user's profile information.

**Endpoint**: `PUT /api/v1/users/profile`
**Authorization**: `Bearer` required.

### 4.2. Update Password
Change the authenticated user's password.

**Endpoint**: `PUT /api/v1/users/password`
**Authorization**: `Bearer` required.
