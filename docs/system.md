# Hệ Thống Quản Lý Thu Chi Bằng VueJS + Firebase

# 1. Giới thiệu

Đây là hệ thống quản lý thu chi sử dụng:

- Frontend: VueJS
- Backend/BaaS: Firebase
- Database: Firestore

Mục tiêu:
- Không cần VPS
- Không cần backend server riêng
- Không cần MySQL
- Deploy dễ dàng
- Có thể hoạt động như app thực tế

Hệ thống hỗ trợ:
- Quản lý thu chi
- Tổng hợp theo ngày/tháng/năm
- Thống kê doanh thu
- Biểu đồ
- Quản lý danh mục chi tiêu
- Quản lý giao dịch

---

# 2. Kiến trúc hệ thống

```text
VueJS Frontend
      ↓
Firebase SDK
      ↓
Cloud Firestore
```

Frontend sẽ thao tác trực tiếp với Firebase SDK.

Không cần:
- NodeJS server
- PHP backend
- VPS
- MySQL

---

# 3. Công nghệ sử dụng

## Frontend

### Vue 3
Framework frontend hiện đại.

Ưu điểm:
- Reactive
- Component-based
- Hiệu năng tốt
- Dễ mở rộng

---

### Vite
Build tool siêu nhanh cho VueJS.

Ưu điểm:
- startup nhanh
- build nhanh
- hot reload tốt

---

### Pinia
State management cho Vue.

Dùng để:
- lưu auth user
- cache transaction
- state dashboard

---

### Vue Router
Điều hướng SPA.

---

### TailwindCSS
Framework CSS utility-first.

Ưu điểm:
- responsive nhanh
- dashboard đẹp
- code UI nhanh

---

# 4. Firebase sử dụng gì?

## Firebase Authentication

Dùng để:
- đăng nhập
- đăng ký
- xác thực user

Có thể login bằng:
- email/password
- google

---

## Cloud Firestore

Dùng để:
- lưu dữ liệu thu chi
- query dữ liệu
- thống kê

Firestore phù hợp hơn Realtime Database vì:
- query mạnh hơn
- scale tốt hơn
- tối ưu tốt hơn

---

# 5. Chức năng hệ thống

# 5.1 Dashboard

Hiển thị:
- tổng thu hôm nay
- tổng chi hôm nay
- lợi nhuận hôm nay
- tổng thu tháng
- tổng chi tháng
- biểu đồ doanh thu

Ví dụ:

```text
Hôm nay:
Thu: 5.000.000
Chi: 2.000.000
Lãi: 3.000.000
```

---

# 5.2 Quản lý giao dịch

CRUD đầy đủ:

- thêm giao dịch
- sửa giao dịch
- xóa giao dịch
- xem danh sách

---

# 5.3 Danh mục thu chi

## Thu

Ví dụ:
- bán cafe
- bán bánh
- bán nước
- doanh thu khác

---

## Chi

Ví dụ:
- nhập cafe
- tiền điện
- tiền nước
- tiền lương
- marketing

---

# 5.4 Thống kê theo thời gian

## Theo ngày

Ví dụ:

```text
Ngày 1/1/2026

Thu:
15.000.000

Chi:
10.000.000

Lãi:
5.000.000
```

---

## Theo tháng

```text
Tháng 1/2026

Thu:
300.000.000

Chi:
220.000.000

Lãi:
80.000.000
```

---

## Theo năm

```text
Năm 2026

Thu:
3 tỷ

Chi:
2.4 tỷ

Lãi:
600 triệu
```

---

# 5.5 Thống kê theo danh mục

Ví dụ:

```text
Chi phí tháng này:

- Nhập cafe: 40 triệu
- Tiền điện: 5 triệu
- Marketing: 10 triệu
```

---

# 6. Thiết kế Database Firestore

# Collection users

```text
users
   └── uid
```

---

# Collection transactions

```text
users
   └── uid
        └── transactions
```

---

# 6.1 Schema transaction

Ví dụ document:

```json
{
  "type": "expense",
  "category": "Nhập cafe",
  "amount": 10000000,
  "note": "Nhập cafe Arabica",
  "date": "2026-01-01",

  "day": 1,
  "month": 1,
  "year": 2026,

  "createdAt": "Firebase Timestamp"
}
```

---

# 6.2 Giải thích field

| Field | Ý nghĩa |
|---|---|
| type | income hoặc expense |
| category | danh mục |
| amount | số tiền |
| note | ghi chú |
| date | ngày giao dịch |
| day | query theo ngày |
| month | query theo tháng |
| year | query theo năm |
| createdAt | thời gian tạo |

---

# 7. Vì sao phải lưu day/month/year riêng?

Firestore query kiểu này rất nhanh:

```js
where("month", "==", 1)
where("year", "==", 2026)
```

Nếu chỉ lưu string date:
- khó query
- chậm hơn
- khó tối ưu

Đây là cách thiết kế production thường dùng.

---

# 8. Cấu trúc source VueJS

```text
src/
├── assets/
├── components/
├── composables/
├── firebase/
├── layouts/
├── router/
├── services/
├── stores/
├── utils/
├── views/
└── App.vue
```

---

# 9. Giải thích thư mục

| Folder | Chức năng |
|---|---|
| assets | hình ảnh/css |
| components | component tái sử dụng |
| composables | composition logic |
| firebase | config firebase |
| router | router vue |
| services | firestore services |
| stores | pinia store |
| utils | helper |
| views | page |

---

# 10. Các màn hình hệ thống

# 10.1 Login

Chức năng:
- login
- register
- google login

---

# 10.2 Dashboard

Hiển thị:
- tổng thu
- tổng chi
- lợi nhuận
- chart

---

# 10.3 Transaction List

Danh sách giao dịch:
- filter ngày
- filter tháng
- search
- pagination

---

# 10.4 Add Transaction

Form:
- loại giao dịch
- số tiền
- danh mục
- ghi chú
- ngày

---

# 10.5 Reports

Báo cáo:
- theo tháng
- theo năm
- theo category

---

# 11. Logic tính toán

# Tổng thu

```js
const income = docs
  .filter(i => i.type === 'income')
  .reduce((sum, item) => sum + item.amount, 0)
```

---

# Tổng chi

```js
const expense = docs
  .filter(i => i.type === 'expense')
  .reduce((sum, item) => sum + item.amount, 0)
```

---

# Lợi nhuận

```js
const profit = income - expense
```

---

# 12. Query Firestore

# Query theo tháng

```js
query(
  collection(db, "users", uid, "transactions"),
  where("month", "==", 1),
  where("year", "==", 2026)
)
```

---

# Query theo ngày

```js
query(
  collection(db, "users", uid, "transactions"),
  where("day", "==", 1),
  where("month", "==", 1),
  where("year", "==", 2026)
)
```

---

# 13. Tối ưu Firestore

# Không query toàn bộ dữ liệu

Sai:

```js
get tất cả transaction
```

Đúng:
- query theo tháng
- filter trước
- pagination

---

# Dùng index

Firestore sẽ yêu cầu tạo index.

Cần tạo để:
- query nhanh
- giảm chi phí
- tăng hiệu năng

---

# 14. Quy tắc dữ liệu quan trọng

# 14.1 Lưu amount dạng number

Sai:

```json
"10000000"
```

Đúng:

```json
10000000
```

---

# 14.2 Dùng Timestamp

```js
createdAt: serverTimestamp()
```

---

# 14.3 Không lưu tổng cố định

Không nên lưu:
- tổng tháng
- tổng năm

Nên:
- tính động
- hoặc cache riêng

---

# 15. Khả năng mở rộng sau này

Có thể mở rộng thêm:
- quản lý kho
- POS bán hàng
- nhiều chi nhánh
- nhiều nhân viên
- phân quyền
- export excel
- export pdf
- AI phân tích
- mobile app

---

# 16. Deploy hệ thống

Có thể deploy frontend lên:

- Vercel
- Firebase Hosting
- Netlify

---

# 17. Firebase pricing

App nhỏ gần như miễn phí.

Free tier đủ cho:
- vài nghìn giao dịch
- vài user
- query cơ bản

Firebase tính phí theo:
- reads
- writes
- storage

---

# 18. Stack đề xuất cuối cùng

# Frontend

- Vue 3
- Vite
- Pinia
- Vue Router
- TailwindCSS

---

# Backend/BaaS

- Firebase Auth
- Firestore

---

# Hosting

- Vercel
hoặc
- Firebase Hosting

---

# 19. Kết luận

Đây là mô hình rất phù hợp cho:
- solo developer
- startup nhỏ
- quán cafe
- cửa hàng nhỏ
- quản lý cá nhân

Ưu điểm:
- không cần VPS
- không cần backend server
- phát triển nhanh
- chi phí thấp
- dễ scale

Điểm quan trọng nhất:
- thiết kế Firestore đúng
- query tối ưu
- tính toán chính xác
- tránh đọc dữ liệu dư thừa