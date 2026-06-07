# Arena API Documentation

## Mô tả chung

Tính năng Arena cho phép người dùng tạo phòng thi đấu, mời bạn bè tham gia bằng mã phòng, xác nhận sẵn sàng, trả lời câu hỏi, và xem bảng xếp hạng.

> Tất cả endpoint đều yêu cầu xác thực JWT qua middleware `authMiddleware`.

---

## Base URL

`/api/arena`

---

## Endpoint

### 1. Tạo phòng Arena

- Method: `POST`
- URL: `/api/arena/rooms`
- Auth: Có

#### Mô tả

Tạo một phòng mới và đặt người tạo làm host.

#### Request

- Không có body.

#### Response thành công

- Status: `201`
- Body:

```json
{
  "_id": "...",
  "code": "ABC123",
  "host": "...",
  "participants": [
    {
      "user": "...",
      "ready": false,
      "joinedAt": "...",
      "answers": [],
      "correctCount": 0,
      "totalTime": 0
    }
  ],
  "status": "waiting",
  "createdAt": "...",
  "updatedAt": "..."
}
```

#### Lỗi

- `401 Unauthorized` nếu không có token hợp lệ.
- `500` nếu tạo phòng thất bại.

---

### 2. Tham gia phòng

- Method: `POST`
- URL: `/api/arena/rooms/:code/join`
- Auth: Có

#### Mô tả

Tham gia vào phòng theo mã phòng. Phòng phải ở trạng thái `waiting`.

#### Path parameters

- `code` - mã phòng Arena.

#### Response thành công

- Status: `200`
- Body: đối tượng room đã cập nhật.

#### Lỗi

- `400` nếu `code` không tồn tại.
- `401` nếu không có token hợp lệ.
- `404` nếu phòng không tồn tại hoặc đã bắt đầu.
- `500` nếu tham gia phòng thất bại.

---

### 3. Rời phòng

- Method: `POST`
- URL: `/api/arena/rooms/:code/leave`
- Auth: Có

#### Mô tả

Người chơi rời phòng. Nếu host rời và còn người chơi khác, host mới được chỉ định. Nếu phòng trống thì xóa phòng.

#### Path parameters

- `code` - mã phòng Arena.

#### Response thành công

- Status: `200`
- Body: đối tượng room đã cập nhật hoặc message nếu phòng bị đóng.

#### Lỗi

- `400` nếu `code` không tồn tại.
- `401` nếu không có token hợp lệ.
- `500` nếu rời phòng thất bại.

---

### 4. Lấy thông tin phòng

- Method: `GET`
- URL: `/api/arena/rooms/:code`
- Auth: Có

#### Mô tả

Lấy thông tin chi tiết phòng, bao gồm host, danh sách participants và trạng thái.

#### Path parameters

- `code` - mã phòng Arena.

#### Response thành công

- Status: `200`
- Body: đối tượng room với `host` và `participants.user` được populate thông tin người dùng.

#### Lỗi

- `400` nếu `code` không tồn tại.
- `401` nếu không có token hợp lệ.
- `404` nếu phòng không tìm thấy.
- `500` nếu truy vấn phòng thất bại.

---

### 5. Đặt trạng thái sẵn sàng

- Method: `POST`
- URL: `/api/arena/rooms/:code/ready`
- Auth: Có

#### Mô tả

Đặt ready cho người chơi. Nếu tất cả participants đều ready, phòng sẽ chuyển sang trạng thái `running` và tạo danh sách câu hỏi.

#### Path parameters

- `code` - mã phòng Arena.

#### Body

```json
{
  "ready": true
}
```

#### Response thành công

- Status: `200`
- Body: đối tượng room đã cập nhật.

#### Lỗi

- `400` nếu `code` không tồn tại hoặc `ready` không phải boolean.
- `401` nếu không có token hợp lệ.
- `404` nếu phòng không tồn tại hoặc game đã bắt đầu.
- `500` nếu cập nhật ready thất bại.

---

### 6. Gửi câu trả lời

- Method: `POST`
- URL: `/api/arena/rooms/:code/answer`
- Auth: Có

#### Mô tả

Gửi câu trả lời của người chơi cho một câu hỏi trong phòng đang chạy.

#### Path parameters

- `code` - mã phòng Arena.

#### Body

```json
{
  "questionIndex": 0,
  "answer": "xin chào",
  "duration": 12
}
```

#### Response thành công

- Status: `200`
- Body: đối tượng room đã cập nhật.

#### Lỗi

- `400` nếu thiếu `questionIndex`, `answer`, hoặc `duration` không hợp lệ.
- `401` nếu không có token hợp lệ.
- `404` nếu phòng không tồn tại hoặc không đang chạy.
- `500` nếu gửi câu trả lời thất bại.

---

### 7. Lấy bảng xếp hạng

- Method: `GET`
- URL: `/api/arena/rooms/:code/ranking`
- Auth: Có

#### Mô tả

Trả về danh sách participant đã sắp xếp theo `correctCount` giảm dần, rồi `totalTime` tăng dần.

#### Path parameters

- `code` - mã phòng Arena.

#### Response thành công

- Status: `200`
- Body:

```json
[
  {
    "user": {
      "_id": "...",
      "username": "...",
      "email": "..."
    },
    "ready": true,
    "correctCount": 5,
    "totalTime": 60,
    "answers": [
      {
        "questionIndex": 0,
        "answer": "...",
        "correct": true,
        "duration": 12,
        "answeredAt": "..."
      }
    ]
  }
]
```

#### Lỗi

- `400` nếu `code` không tồn tại.
- `401` nếu không có token hợp lệ.
- `404` nếu phòng không tìm thấy.
- `500` nếu truy vấn bảng xếp hạng thất bại.

---

## Cấu trúc phòng Arena

### Thuộc tính chính của room

- `code`: mã phòng 6 ký tự
- `host`: ID người tạo phòng
- `participants`: danh sách người chơi trong phòng
- `status`: `waiting`, `running`, `finished`
- `questions`: danh sách câu hỏi khi bắt đầu game
- `startedAt`: thời gian bắt đầu game

### Thuộc tính participant

- `user`: ID người chơi
- `ready`: trạng thái sẵn sàng
- `joinedAt`: thời gian tham gia
- `answers`: câu trả lời đã gửi
- `correctCount`: số câu đúng
- `totalTime`: tổng thời gian trả lời

---

## Ghi chú

- API dùng middleware `authMiddleware`, do đó phải gửi token hợp lệ trong header `Authorization: Bearer <token>`.
- Phòng chỉ có thể join khi trạng thái là `waiting`.
- Khi tất cả người chơi ready, phòng tự động chuyển sang `running`.
- Khi mọi người đã trả lời đủ câu hỏi, trạng thái phòng sẽ chuyển thành `finished`.
