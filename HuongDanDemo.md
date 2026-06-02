# Hướng Dẫn Kịch Bản Demo Hệ Thống Quản Lý Bảo Hiểm (Bảo An Insurance)

Tài liệu này cung cấp danh sách tài khoản thử nghiệm và kịch bản demo từng bước (Step-by-Step Script) để bạn ghi hình video demo sản phẩm hoặc trình bày trực tiếp trước nhà tuyển dụng.

---

## 1. Thông Tin Tài Khoản Thử Nghiệm (Seed Accounts)

Tất cả tài khoản dưới đây đã được cài đặt sẵn mật khẩu mặc định trong cơ sở dữ liệu.

| Vai trò | Email đăng nhập | Mật khẩu | Dữ liệu Hồ sơ mặc định |
| :--- | :--- | :---: | :--- |
| **Admin (Quản trị viên)** | `admin@insurance.com` | `123456` | Quản trị toàn hệ thống |
| **Employee (Nhân viên)** | `employee@insurance.com` | `123456` | **EMP001** - Nguyễn Văn Nhân Viên (Tư vấn viên) |
| **Customer (Khách hàng)** | `customer@insurance.com` | `123456` | **CUS001** - Trần Thị Khách Hàng |

---

## 2. Kịch Bản Demo Chi Tiết (Demo Script)

> [!TIP]
> Để demo luồng thời gian thực (Real-time Chat, Đã xem, Duyệt hồ sơ), bạn nên mở **hai cửa sổ trình duyệt khác nhau** (ví dụ: một tab ẩn danh cho Khách hàng và một tab thường cho Nhân viên/Admin).

### KỊCH BẢN 1: QUẢN TRỊ VIÊN (ADMIN) - Khởi tạo & Cấu hình hệ thống
*Mục tiêu: Show năng lực quản lý của Admin về gói bảo hiểm, dữ liệu Wiki AI và phân công nhân sự.*

1. **Đăng nhập:** Đăng nhập bằng tài khoản `admin@insurance.com` / `123456`.
2. **Dashboard Admin:** 
   * Chỉ ra các khối số liệu tổng quan (Tổng số User, Khách hàng, Gói bảo hiểm, Số hợp đồng...).
   * Xem biểu đồ phân tích doanh thu và số lượng yêu cầu xử lý trực quan bằng Recharts.
3. **Quản lý gói bảo hiểm:**
   * Vào mục **Quản lý gói bảo hiểm** -> Bấm **Thêm gói mới**.
   * Nhập thông tin gói mới (ví dụ: Bảo hiểm Nhà Ở, Giá 3.000.000đ, thời hạn 12 tháng, Quyền lợi 200.000.000đ).
   * Bấm **Lưu** -> Xác nhận gói mới xuất hiện trong danh sách.
4. **Quản lý Tài liệu Wiki AI (RAG Chatbot):**
   * Vào mục **Quản lý tài liệu Wiki**.
   * Tải lên một tệp tài liệu dạng `.pdf` hoặc `.txt` chứa chính sách bảo hiểm của công ty (Hệ thống sẽ tự động phân tích và trích xuất text thô lưu vào cơ sở dữ liệu để làm bộ nhớ tri thức cho Chatbot).
5. **Phân công hỗ trợ:**
   * Vào mục **Phân công hỗ trợ**.
   * Chọn Chuyên viên `Nguyễn Văn Nhân Viên` và Khách hàng `Trần Thị Khách Hàng`. Bấm **Phân công**. Điều này giúp kết nối nhân viên tư vấn riêng cho khách hàng.

---

### KỊCH BẢN 2: KHÁCH HÀNG (CUSTOMER) - Đăng ký, Đặt lịch & Trợ lý ảo AI
*Mục tiêu: Show trải nghiệm người dùng cao cấp, AI thông minh và đặt lịch tư vấn.*

1. **Đăng nhập:** Đăng nhập bằng tài khoản `customer@insurance.com` / `123456`.
2. **Dashboard Khách hàng:** Xem thống kê các gói bảo hiểm đang tham gia, số sự cố đã báo cáo và các lịch hẹn tư vấn sắp tới.
3. **Đăng ký bảo hiểm:**
   * Vào mục **Gói bảo hiểm hiện có**.
   * Chọn gói *Bảo hiểm Sức khỏe Toàn diện* hoặc gói bạn vừa tạo ở Kịch bản 1.
   * Xem chi tiết quyền lợi và bấm **Đăng ký ngay**. Trạng thái đăng ký sẽ hiển thị là `PENDING` (Chờ duyệt).
4. **Hỏi đáp Trợ lý AI (Wiki RAG Chatbot):**
   * Vào mục **Trợ lý ảo AI**.
   * Đặt câu hỏi liên quan đến file tài liệu bạn đã upload ở Kịch bản 1 (ví dụ hỏi về điều khoản bồi thường, số điện thoại đường dây nóng, phạm vi cứu hộ...).
   * Chatbot AI tự động truy xuất nội dung tài liệu Wiki và trả lời chính xác, trích dẫn nội dung thực tế từ file PDF.
5. **Đặt lịch tư vấn:**
   * Vào mục **Đặt lịch tư vấn** -> Chọn ngày, giờ mong muốn và nhập nội dung yêu cầu (ví dụ: *Cần tư vấn quyền lợi bảo hiểm sức khỏe*).
   * Bấm **Đặt lịch** -> Trạng thái lịch hẹn sẽ được tạo thành công.
6. **Báo cáo sự cố hỗ trợ:**
   * Vào mục **Báo cáo sự cố** -> Bấm **Tạo báo cáo mới**.
   * Nhập tiêu đề, mô tả sự cố (ví dụ: *Tai nạn giao thông nhẹ tại Q1*), chọn mức độ ưu tiên và chọn gói bảo hiểm tương ứng.
   * Gửi báo cáo để hệ thống tự động gán cho Nhân viên phụ trách hỗ trợ.

---

### KỊCH BẢN 3: NHÂN VIÊN (EMPLOYEE) - Nghiệp vụ phê duyệt, Chat WebSocket & Xử lý sự cố
*Mục tiêu: Show tính năng phê duyệt, Chat thời gian thực WebSocket (Seen status, emoji, recall) và xuất báo cáo.*

1. **Đăng nhập:** Đăng nhập bằng tài khoản `employee@insurance.com` / `123456`.
2. **Phê duyệt Đăng ký:**
   * Vào mục **Phê duyệt bảo hiểm**.
   * Tìm thấy yêu cầu đăng ký của khách hàng vừa gửi ở Kịch bản 2.
   * Bấm **Duyệt** -> Hệ thống tự động sinh mã số hợp đồng độc nhất (`contract_code`), ngày bắt đầu và ngày kết thúc hợp đồng theo thời hạn gói.
3. **Chat hỗ trợ trực tiếp (WebSocket Real-time):**
   * Vào mục **Trò chuyện hỗ trợ**.
   * Chọn Khách hàng `Trần Thị Khách Hàng` từ danh sách.
   * **Kiểm thử Tin nhắn chưa đọc (Unread badge):** Nếu khách hàng gửi tin nhắn khi nhân viên chưa mở chat, một badge số tin nhắn chưa đọc màu đỏ (ví dụ: `1`, `2`) sẽ hiện cạnh tên khách hàng.
   * **Kiểm thử Đã xem (Seen receipt):** Ngay khi nhân viên click vào chat, trạng thái bên phía khách hàng lập tức chuyển thành chữ `• Đã xem`.
   * **Kiểm thử Tương tác tin nhắn:**
     * **Thả cảm xúc:** Di chuột qua tin nhắn bất kỳ, bấm biểu tượng cảm xúc (ví dụ: ❤️). Badge emoji lập tức xuất hiện ở cả 2 màn hình.
     * **Sửa tin nhắn:** Click dấu ba chấm ở tin nhắn vừa gửi, chọn **Sửa tin nhắn**, đổi nội dung và lưu lại. Màn hình đồng bộ tức thời kèm chữ *(đã chỉnh sửa)*.
     * **Thu hồi tin nhắn:** Chọn **Thu hồi** tin nhắn vừa gửi. Nội dung lập tức chuyển thành chữ nghiêng màu xám: *"Tin nhắn đã được thu hồi"* ở cả hai phía.
4. **Xử lý sự cố:**
   * Vào mục **Quản lý sự cố**.
   * Chọn báo cáo sự cố của khách hàng, cập nhật trạng thái từ `NEW` -> `PROCESSING` -> `RESOLVED`.
5. **Xuất báo cáo dữ liệu:**
   * Bấm nút **Xuất báo cáo** (ở góc trên màn hình quản lý) để tải về trực tiếp file Excel tổng hợp các báo cáo sự cố hoặc danh sách khách hàng phụ trách để phục vụ lưu trữ nội bộ.

---

### KỊCH BẢN 4: ĐỐI SOÁT & NHẬT KÝ HỆ THỐNG (ADMIN)
*Mục tiêu: Minh chứng tính bảo mật, ghi nhận lịch sử của hệ thống quản trị chuyên nghiệp.*

1. **Đăng nhập lại:** Trở lại màn hình Admin (`admin@insurance.com`).
2. **Nhật ký hệ thống (Audit Logs):**
   * Vào mục **Nhật ký hệ thống**.
   * Chỉ ra các dòng nhật ký thao tác: hệ thống ghi nhận chính xác giây, phút, tài khoản nào đã thực hiện đăng nhập, đăng ký gói bảo hiểm, duyệt hợp đồng, hay thay đổi trạng thái sự cố kèm theo nhãn phân loại (SUCCESS, WARNING, DANGER).
3. **Đăng xuất & Khôi phục mật khẩu:**
   * Bấm **Đăng xuất**.
   * Bấm **Quên mật khẩu** tại màn hình đăng nhập -> Nhập email để hệ thống gửi mã xác thực OTP về hòm thư, chứng minh luồng bảo mật tài khoản hoàn chỉnh.

---

## 3. Các Điểm Cộng Kỹ Thuật Nên Nhấn Mạnh Trong Video/Phỏng Vấn

Khi quay video hoặc trả lời phỏng vấn, hãy nhấn mạnh các yếu tố công nghệ cốt lõi giúp bài thi của bạn nổi bật hơn các ứng viên khác:

1. **Kiến trúc phân quyền đa tầng (Multi-role Authorization):** Spring Security bảo vệ cả API ở Backend và định tuyến bảo mật ở React Frontend (`ProtectedRoute`).
2. **Ứng dụng Generative AI thông minh (RAG Chatbot):** Đọc tệp PDF động bằng Apache PDFBox, phân tích ngữ cảnh từ tài liệu Wiki để trả lời khách hàng mà không bị ảo tưởng thông tin (hallucination). Có cơ chế dự phòng thông minh (Fallback) nếu mất kết nối API AI.
3. **Kết nối thời gian thực hai chiều (WebSocket):** Không sử dụng cơ chế reload trang hoặc gọi API tuần hoàn (Polling), toàn bộ luồng chat, biên nhận đã xem, thu hồi, sửa và emoji đều truyền tải tức thời qua kết nối socket liên tục.
4. **Quản trị an toàn (Audit Trail):** Mọi hành động làm thay đổi dữ liệu nghiệp vụ đều được ghi nhận tự động vào cơ sở dữ liệu làm bằng chứng đối soát hệ thống.
