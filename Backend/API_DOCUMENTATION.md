# JP ChatBuddy Backend API Documentation

## Base URL
- `http://localhost:3000`

## General Notes
- All requests with a JSON body must include header:
  - `Content-Type: application/json`
- Protected endpoints require JWT auth:
  - `Authorization: Bearer <token>`
- The JWT token is issued by `/api/auth/login` and `/api/auth/register`.
- Chat and vocabulary endpoints are protected.

---

## Health Check
### GET `/health`
- Public endpoint.
- Used to verify the server is running.

#### Response
```json
"API is running..."
```

---

## Authentication

### POST `/api/auth/register`
- Registers a new user.
- Returns a JWT along with user profile.

#### Request Body
```json
{
  "username": "testuser",
  "email": "testuser@example.com",
  "password": "Password123!"
}
```

#### Successful Response
```json
{
  "success": true,
  "user": {
    "id": "...",
    "email": "testuser@example.com",
    "username": "testuser",
    "createdAt": "2026-05-16T18:12:43.169Z"
  },
  "token": "<jwt-token>"
}
```

#### Errors
- `400 Bad Request` if fields are missing or email already exists.

---

### POST `/api/auth/login`
- Logs in an existing user.
- Returns a JWT and user info.

#### Request Body
```json
{
  "email": "testuser@example.com",
  "password": "Password123!"
}
```

#### Successful Response
```json
{
  "success": true,
  "user": {
    "id": "...",
    "email": "testuser@example.com",
    "username": "testuser"
  },
  "token": "<jwt-token>"
}
```

#### Errors
- `400 Bad Request` if fields are missing.
- `401 Unauthorized` if credentials are invalid.

---

## Chat

All chat routes require `Authorization: Bearer <token>`.

### POST `/api/chat/send`
- Sends a new message to the AI and stores it in the conversation.
- If `conversationId` is provided, the message is appended to that conversation.
- If `newConversation` is `true`, a new conversation is created for the authenticated user.
- Otherwise, the latest conversation for the user is reused.

#### Request Body
```json
{
  "message": "Xin chào",
  "conversationId": "<conversation-id>",
  "quote": "Some quoted text",
  "newConversation": true
}
```
- `conversationId` is optional.
- `quote` is optional.
- `newConversation` is optional; use `true` to create a fresh conversation.

#### Successful Response
```json
{
  "conversationId": "...",
  "reply": "<AI reply>"
}
```

#### Errors
- `401 Unauthorized` if JWT is missing or invalid.
- `500 Internal Server Error` for AI/backend failures.

---

### GET `/api/chat/history`
- Returns the latest chat history for the authenticated user.
- Returns up to 20 most recent messages by default.

#### Query Parameters
- `limit` (optional): number of messages to return.

#### Example
```http
GET /api/chat/history?limit=30
```

#### Successful Response
```json
[
  {
    "id": "...",
    "content": "...",
    "isChatBot": false
  },
  {
    "id": "...",
    "content": "...",
    "isChatBot": true
  }
]
```

---

## Vocabulary

All vocabulary routes require `Authorization: Bearer <token>`.

### POST `/api/vocabulary/add`
- Adds a new vocabulary item for the authenticated user.

#### Request Body
```json
{
  "word": "こんにちは",
  "meaning": "Hello in Japanese"
}
```

#### Successful Response
```json
{
  "user": "<user-id>",
  "word": "こんにちは",
  "meaning": "Hello in Japanese",
  "date": "2026-05-16T18:12:43.330Z",
  "_id": "...",
  "__v": 0
}
```

---

### GET `/api/vocabulary/all`
- Returns all vocabulary items belonging to the authenticated user.

#### Successful Response
```json
[
  {
    "_id": "...",
    "user": "<user-id>",
    "word": "こんにちは",
    "meaning": "Hello in Japanese",
    "date": "2026-05-16T18:12:43.330Z",
    "__v": 0
  }
]
```

---

### DELETE `/api/vocabulary/:id`
- Deletes the vocabulary item with the given ID, only if it belongs to the authenticated user.

#### Example
```http
DELETE /api/vocabulary/642a1c2f1249a5c4d8e7f123
```

#### Successful Response
```json
{
  "message": "Xóa thành công",
  "id": "642a1c2f1249a5c4d8e7f123"
}
```

---

## Grammar

### POST `/api/grammar/check`
- Checks grammar based on recent user chat messages since 8:00 AM today.
- This endpoint is currently public and does not require auth.

#### Request Body
```json
{
  "missions": [
    { "id": 1, "status": false, "content": "..." },
    { "id": 2, "status": true, "content": "..." }
  ]
}
```

#### Successful Response
```json
{
  "missions": [
    { "id": 1, "status": true, "content": "..." },
    { "id": 2, "status": true, "content": "..." }
  ],
  "message": "..."
}
```

---

## Error Handling
- Missing required fields returns `400 Bad Request`.
- Invalid credentials returns `401 Unauthorized`.
- Missing or invalid JWT returns `401 Unauthorized`.
- Server failures return `500 Internal Server Error`.

## Notes for Extension Team
- Store the JWT from `/api/auth/login` or `/api/auth/register` and send it on every protected request.
- For a fresh chat session, send `newConversation: true` in `/api/chat/send`.
- Chat history is always scoped to the authenticated user.
- Vocabulary items are also scoped to the authenticated user.
