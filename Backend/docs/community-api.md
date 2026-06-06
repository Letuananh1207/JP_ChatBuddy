# Community Feature API

This document describes the backend endpoints for the community feature: posts with text, images, audio, likes, and comments.

## Base URL

All endpoints are mounted under:

- `http://<host>:<port>/api/posts`

## Authentication

All community endpoints require a valid JWT bearer token in the `Authorization` header:

```
Authorization: Bearer <access_token>
```

The token is validated by `authMiddleware` and the user ID is extracted as `req.user.id`.

---

## Endpoints

### 1. Create a post

`POST /api/posts`

Create a new community post. Supports text, image files, and audio files.

#### Request

- Content-Type: `multipart/form-data`
- Fields:
  - `text` (optional): string
  - `images` (optional): up to 6 image files
  - `audio` (optional): up to 4 audio files

#### Behavior

- Uploaded files are stored in Cloudinary.
- The post document stores arrays of Cloudinary secure URLs in `images` and `audio`.
- If upload fails for a file, the endpoint still attempts to create the post with successful uploads.

#### Example cURL

```bash
curl -X POST "http://localhost:3000/api/posts" \
  -H "Authorization: Bearer <token>" \
  -F "text=Hello cộng đồng!" \
  -F "images=@/path/to/photo1.jpg" \
  -F "images=@/path/to/photo2.jpg" \
  -F "audio=@/path/to/voice1.mp3"
```

#### Example response

```json
{
  "_id": "64a8b9f3e8f72200123abcd4",
  "author": "64a1a2b3c4d5e6f789012345",
  "text": "Hello cộng đồng!",
  "images": [
    "https://res.cloudinary.com/.../photo1.jpg",
    "https://res.cloudinary.com/.../photo2.jpg"
  ],
  "audio": ["https://res.cloudinary.com/.../voice1.mp3"],
  "likes": [],
  "comments": [],
  "createdAt": "2026-06-07T03:00:00.000Z",
  "updatedAt": "2026-06-07T03:00:00.000Z",
  "__v": 0
}
```

---

### 2. List posts

`GET /api/posts`

Retrieve community posts in descending creation order.

#### Query parameters

- `limit` (optional): number of posts to return (default `20`)
- `page` (optional): zero-based page index (default `0`)

#### Example cURL

```bash
curl -X GET "http://localhost:3000/api/posts?limit=10&page=0" \
  -H "Authorization: Bearer <token>"
```

#### Example response

```json
[
  {
    "_id": "64a8b9f3e8f72200123abcd4",
    "author": {
      "_id": "64a1a2b3c4d5e6f789012345",
      "username": "hanh",
      "email": "hanh@example.com"
    },
    "text": "Hello cộng đồng!",
    "images": ["https://res.cloudinary.com/.../photo1.jpg"],
    "audio": ["https://res.cloudinary.com/.../voice1.mp3"],
    "likes": [],
    "comments": [],
    "createdAt": "2026-06-07T03:00:00.000Z",
    "updatedAt": "2026-06-07T03:00:00.000Z"
  }
]
```

---

### 3. Get post details

`GET /api/posts/:id`

Retrieve a single post by ID.

#### Example cURL

```bash
curl -X GET "http://localhost:3000/api/posts/64a8b9f3e8f72200123abcd4" \
  -H "Authorization: Bearer <token>"
```

#### Example response

```json
{
  "_id": "64a8b9f3e8f72200123abcd4",
  "author": {
    "_id": "64a1a2b3c4d5e6f789012345",
    "username": "hanh",
    "email": "hanh@example.com"
  },
  "text": "Hello cộng đồng!",
  "images": ["https://res.cloudinary.com/.../photo1.jpg"],
  "audio": ["https://res.cloudinary.com/.../voice1.mp3"],
  "likes": [],
  "comments": [],
  "createdAt": "2026-06-07T03:00:00.000Z",
  "updatedAt": "2026-06-07T03:00:00.000Z"
}
```

---

### 4. Like / Unlike a post

`POST /api/posts/:id/like`

Toggle a like for the authenticated user on the post.

#### Example cURL

```bash
curl -X POST "http://localhost:3000/api/posts/64a8b9f3e8f72200123abcd4/like" \
  -H "Authorization: Bearer <token>"
```

#### Example response

```json
{
  "_id": "64a8b9f3e8f72200123abcd4",
  "author": {
    "_id": "64a1a2b3c4d5e6f789012345",
    "username": "hanh",
    "email": "hanh@example.com"
  },
  "text": "Hello cộng đồng!",
  "images": ["https://res.cloudinary.com/.../photo1.jpg"],
  "audio": ["https://res.cloudinary.com/.../voice1.mp3"],
  "likes": ["64b0c1d2e3f4a5b678901234"],
  "comments": [],
  "createdAt": "2026-06-07T03:00:00.000Z",
  "updatedAt": "2026-06-07T03:05:00.000Z"
}
```

---

### 5. Add a comment

`POST /api/posts/:id/comment`

Add a new comment to the given post.

#### Request body

- Content-Type: `application/json`
- Body:
  - `content`: string

#### Example cURL

```bash
curl -X POST "http://localhost:3000/api/posts/64a8b9f3e8f72200123abcd4/comment" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"content":"Nice post!"}'
```

#### Example response

```json
{
  "_id": "64a8b9f3e8f72200123abcd4",
  "author": {
    "_id": "64a1a2b3c4d5e6f789012345",
    "username": "hanh",
    "email": "hanh@example.com"
  },
  "text": "Hello cộng đồng!",
  "images": ["https://res.cloudinary.com/.../photo1.jpg"],
  "audio": ["https://res.cloudinary.com/.../voice1.mp3"],
  "likes": [],
  "comments": [
    {
      "_id": "64a9c0d1e2f3b4a567890123",
      "user": "64b0c1d2e3f4a5b678901234",
      "content": "Nice post!",
      "createdAt": "2026-06-07T03:10:00.000Z"
    }
  ],
  "createdAt": "2026-06-07T03:00:00.000Z",
  "updatedAt": "2026-06-07T03:10:00.000Z"
}
```

---

## Cloudinary configuration

The backend expects Cloudinary credentials in the environment:

- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`

Files uploaded via `POST /api/posts` are sent to Cloudinary and stored as secure URLs.

## Notes

- `POST /api/posts` uses `multipart/form-data` and memory storage for uploads.
- `images` and `audio` are stored as arrays of strings in MongoDB.
- `likes` is a list of user IDs.
- `comments` stores embedded user references and content.
