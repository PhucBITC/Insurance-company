# Tổng Quan Dự Án Quản Lý Công Ty Bảo Hiểm

## 1. Mô tả dự án

Dự án là hệ thống phần mềm quản lý công ty bảo hiểm, hỗ trợ vận hành giữa ba nhóm người dùng chính: **Admin**, **Nhân viên** và **Khách hàng**.

Hệ thống kết hợp các chức năng của CRM, quản lý nghiệp vụ bảo hiểm, dashboard thống kê và hỗ trợ khách hàng. Mục tiêu trước mắt là xây dựng một bản MVP chạy được từ đầu đến cuối, có luồng nghiệp vụ rõ ràng, phân quyền đúng và dữ liệu được tổ chức hợp lý.

Định hướng công nghệ:

- Frontend: React, Vite, React Router, Axios.
- Backend: Spring Boot, Spring Security, JWT, Spring Data JPA.
- Database: MySQL.
- Nâng cao sau MVP: chatbot theo tài liệu nội bộ/PDF, chat hỗ trợ, đặt lịch tư vấn, upload tài liệu, export báo cáo.

## 2. Mục tiêu hệ thống

Hệ thống giúp công ty bảo hiểm quản lý các hoạt động chính:

- Quản lý tài khoản và phân quyền người dùng.
- Quản lý nhân viên, khách hàng và hồ sơ liên quan.
- Quản lý gói bảo hiểm và quy trình bảo hiểm.
- Cho phép khách hàng đăng ký gói bảo hiểm.
- Cho phép Admin hoặc nhân viên duyệt/từ chối đăng ký.
- Gán khách hàng cho nhân viên phụ trách.
- Cho phép khách hàng gửi report sự cố hoặc yêu cầu hỗ trợ.
- Cho phép nhân viên xử lý, cập nhật trạng thái report.
- Cung cấp dashboard theo từng vai trò.
- Ghi lại lịch sử truy cập và lịch sử thao tác.

## 3. Vai trò người dùng

### Admin

Admin là người quản trị toàn hệ thống.

Chức năng chính:

- Quản lý tài khoản.
- Quản lý phân quyền.
- Quản lý nhân viên.
- Quản lý khách hàng.
- Quản lý gói bảo hiểm.
- Quản lý quy trình bảo hiểm.
- Gán khách hàng cho nhân viên.
- Theo dõi report sự cố.
- Xem dashboard toàn hệ thống.
- Xem access log và audit log.
- Quản lý tài liệu nội bộ cho chatbot nếu làm phần nâng cao.

### Nhân viên

Nhân viên phụ trách chăm sóc khách hàng và xử lý nghiệp vụ được giao.

Chức năng chính:

- Xem dashboard cá nhân.
- Xem danh sách khách hàng được giao.
- Xem chi tiết khách hàng.
- Ghi chú chăm sóc khách hàng.
- Xử lý report sự cố.
- Cập nhật trạng thái xử lý.
- Đặt lịch tư vấn nếu làm phần nâng cao.
- Chat với khách hàng nếu làm phần nâng cao.

### Khách hàng

Khách hàng là người sử dụng dịch vụ bảo hiểm.

Chức năng chính:

- Xem dashboard cá nhân.
- Xem thông tin cá nhân.
- Xem danh sách gói bảo hiểm.
- Đăng ký gói bảo hiểm.
- Theo dõi gói đã đăng ký.
- Report sự cố hoặc yêu cầu hỗ trợ.
- Theo dõi trạng thái xử lý report.
- Hỏi chatbot nếu làm phần nâng cao.
- Đặt lịch tư vấn nếu làm phần nâng cao.

## 4. Phạm vi MVP

MVP là phần cần làm trước để dự án có thể chạy demo từ đầu đến cuối.

Các chức năng bắt buộc:

- Đăng nhập, đăng xuất bằng JWT.
- Phân quyền Admin, Employee, Customer.
- Admin quản lý user, nhân viên, khách hàng.
- Admin quản lý gói bảo hiểm.
- Khách hàng xem và đăng ký gói bảo hiểm.
- Admin hoặc nhân viên duyệt/từ chối đăng ký.
- Admin gán khách hàng cho nhân viên.
- Nhân viên xem khách hàng được giao.
- Khách hàng tạo report sự cố.
- Nhân viên cập nhật trạng thái xử lý sự cố.
- Dashboard riêng theo từng vai trò.
- Ghi lịch sử truy cập và thao tác.

Phần nâng cao để làm sau:

- Chatbot theo PDF/Wiki nội bộ.
- Upload tài liệu công ty cho chatbot.
- Chat giữa khách hàng và nhân viên.
- Đặt lịch tư vấn.
- Notification.
- Export Excel/PDF.
- Reset mật khẩu qua email.

## 5. Luồng nghiệp vụ chính

### Luồng đăng nhập và phân quyền

Người dùng nhập email và password. Backend kiểm tra tài khoản, xác thực mật khẩu bằng BCrypt, tạo JWT token và trả về thông tin role. Frontend lưu token, sau đó điều hướng người dùng về dashboard tương ứng với vai trò.

### Luồng quản lý gói bảo hiểm

Admin tạo gói bảo hiểm với các thông tin như mã gói, tên gói, loại bảo hiểm, mô tả, giá, thời hạn, quyền lợi và điều kiện. Khách hàng chỉ xem được các gói đang ACTIVE. Khi khách hàng đăng ký, hệ thống tạo bản ghi đăng ký ở trạng thái PENDING.

### Luồng đăng ký bảo hiểm

Khách hàng chọn một gói bảo hiểm đang hoạt động và gửi đăng ký. Admin hoặc nhân viên kiểm tra rồi duyệt hoặc từ chối. Khi duyệt, hệ thống sinh mã hợp đồng, ngày bắt đầu và ngày kết thúc theo thời hạn gói.

### Luồng gán khách hàng cho nhân viên

Admin chọn một nhân viên và một khách hàng để tạo bản ghi phân công. Sau khi được gán, nhân viên chỉ được xem và chăm sóc những khách hàng thuộc phạm vi của mình.

### Luồng report sự cố

Khách hàng tạo report khi có tai nạn, nhập viện, yêu cầu bồi thường, cần tư vấn hoặc vấn đề khác. Hệ thống có thể gán report cho nhân viên phụ trách khách hàng. Nhân viên cập nhật trạng thái xử lý như NEW, ASSIGNED, PROCESSING, NEED_MORE_INFO, RESOLVED hoặc REJECTED.

### Luồng dashboard

Dashboard hiển thị dữ liệu theo từng vai trò:

- Admin xem số lượng user, khách hàng, nhân viên, gói bảo hiểm, đăng ký, report và thống kê toàn hệ thống.
- Nhân viên xem số khách hàng được giao, report cần xử lý và lịch hẹn.
- Khách hàng xem gói đang tham gia, report đã gửi và trạng thái xử lý.

## 6. Entity database đề xuất

Các bảng chính:

- `roles`: lưu vai trò ADMIN, EMPLOYEE, CUSTOMER.
- `users`: tài khoản đăng nhập.
- `employees`: hồ sơ nhân viên.
- `customers`: hồ sơ khách hàng.
- `insurance_packages`: gói bảo hiểm.
- `insurance_processes`: quy trình bảo hiểm.
- `process_steps`: các bước trong quy trình.
- `customer_insurances`: gói bảo hiểm khách hàng đã đăng ký.
- `customer_assignments`: phân công khách hàng cho nhân viên.
- `incident_reports`: report sự cố hoặc yêu cầu hỗ trợ.
- `incident_files`: file đính kèm report.
- `care_notes`: ghi chú chăm sóc khách hàng.
- `appointments`: lịch hẹn/tư vấn.
- `access_logs`: lịch sử truy cập.
- `audit_logs`: lịch sử thao tác nghiệp vụ.
- `wiki_documents`: tài liệu nội bộ cho chatbot.
- `chatbot_messages`: lịch sử hỏi đáp chatbot.

## 7. API backend chính

Nhóm API cần có:

- Auth API: login, logout, thông tin người dùng hiện tại.
- Admin User API: CRUD user, khóa tài khoản, reset mật khẩu.
- Insurance Package API: CRUD gói bảo hiểm, xem danh sách gói active.
- Customer Insurance API: đăng ký gói, duyệt, từ chối, hủy.
- Assignment API: gán khách hàng cho nhân viên.
- Incident Report API: tạo report, xem report, cập nhật trạng thái, phân công xử lý.
- Dashboard API: dashboard cho Admin, Employee, Customer.
- Log API: xem access log và audit log.
- Chatbot API: upload tài liệu, hỏi chatbot, xem lịch sử nếu làm phần nâng cao.

## 8. Cấu trúc dự án đề xuất

Backend Spring Boot:

```text
insurance-management-backend
├── config
├── security
├── entity
├── repository
├── dto
├── service
├── controller
├── mapper
├── enums
├── exception
└── util
```

Frontend React:

```text
insurance-management-frontend
├── api
├── routes
├── layouts
├── components
├── pages
├── hooks
├── context
├── utils
└── styles
```

## 9. Thứ tự triển khai

### Giai đoạn 1: Nền tảng

- Tạo backend Spring Boot.
- Tạo frontend React.
- Thiết kế database ban đầu.
- Làm User, Role, Auth JWT.
- Làm login page.
- Làm route bảo vệ theo role.
- Làm layout riêng cho Admin, Employee, Customer.

### Giai đoạn 2: Admin CRUD

- Quản lý user.
- Quản lý nhân viên.
- Quản lý khách hàng.
- Quản lý gói bảo hiểm.

### Giai đoạn 3: Nghiệp vụ bảo hiểm

- Customer đăng ký gói.
- Admin/Employee duyệt hoặc từ chối đăng ký.
- Admin gán khách hàng cho nhân viên.
- Employee xem khách hàng được giao.

### Giai đoạn 4: Report sự cố

- Customer tạo report.
- Employee xem và xử lý report.
- Admin xem toàn bộ report.
- Cập nhật trạng thái xử lý.

### Giai đoạn 5: Dashboard

- Dashboard Admin.
- Dashboard Employee.
- Dashboard Customer.
- Biểu đồ và thống kê cơ bản.

### Giai đoạn 6: Log

- Ghi access log khi login/logout.
- Ghi audit log khi create/update/delete hoặc đổi trạng thái.
- Admin xem log.

### Giai đoạn 7: Nâng cao

- Chatbot theo PDF/Wiki nội bộ.
- Upload tài liệu nội bộ.
- Chat hỗ trợ.
- Đặt lịch tư vấn.
- Notification.
- Export báo cáo.

## 10. Kết luận hướng làm

Hướng triển khai hợp lý nhất là làm chắc bản MVP trước: đăng nhập, phân quyền, CRUD, gán khách hàng, đăng ký gói bảo hiểm, report sự cố, dashboard và log.

Điểm quan trọng nhất của dự án không phải là số lượng chức năng, mà là luồng nghiệp vụ rõ ràng, database hợp lý, phân quyền đúng, giao diện dễ dùng và demo chạy được từ đầu đến cuối.

