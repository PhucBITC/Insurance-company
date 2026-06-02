package com.insurance.controller;

import com.insurance.entity.*;
import com.insurance.repository.*;
import com.insurance.security.UserDetailsImpl;
import com.insurance.service.SystemLogService;
import com.insurance.dto.MessageResponse;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api")
public class AiAssistantController {

    @Value("${ai.chat.api.key}")
    private String apiKey;

    @Value("${ai.chat.base.url}")
    private String baseUrl;

    @Value("${ai.chat.model}")
    private String modelName;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private CustomerInsuranceRepository customerInsuranceRepository;

    @Autowired
    private IncidentReportRepository incidentReportRepository;

    @Autowired
    private AppointmentRepository appointmentRepository;

    @Autowired
    private WikiDocumentRepository wikiDocumentRepository;

    @Autowired
    private ChatMessageRepository chatMessageRepository;

    @Autowired
    private SystemLogService systemLogService;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    // ==========================================
    // 1. ADMIN SYSTEM AI ANALYST ENDPOINT
    // ==========================================
    @PostMapping("/admin/ai/query-system")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> querySystem(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @RequestBody Map<String, String> request) {
        
        try {
            String query = request.get("query");
            if (query == null || query.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(new MessageResponse("Câu hỏi không được để trống!"));
            }

            // Gather system metrics
            long totalUsers = userRepository.count();
            long totalAdmins = userRepository.findByRoleName(ERole.ROLE_ADMIN).size();
            long totalEmployees = userRepository.findByRoleName(ERole.ROLE_EMPLOYEE).size();
            long totalCustomers = userRepository.findByRoleName(ERole.ROLE_CUSTOMER).size();

            long totalContracts = customerInsuranceRepository.count();
            long pendingContracts = customerInsuranceRepository.countByStatus("PENDING");
            long approvedContracts = customerInsuranceRepository.countByStatus("APPROVED");
            long rejectedContracts = customerInsuranceRepository.countByStatus("REJECTED");

            long totalIncidents = incidentReportRepository.count();
            long newIncidents = incidentReportRepository.countByStatus("NEW");
            long processingIncidents = incidentReportRepository.countByStatus("PROCESSING");
            long resolvedIncidents = incidentReportRepository.countByStatus("RESOLVED");
            long rejectedIncidents = incidentReportRepository.countByStatus("REJECTED");

            long totalAppointments = appointmentRepository.count();

            // Fetch last 15 system logs using SystemLogService
            List<SystemLog> logs = systemLogService.getLogs("ALL", "", 0, 15).getContent();

            // Check if Groq config is available
            if (apiKey == null || apiKey.trim().isEmpty() || apiKey.startsWith("${") || apiKey.contains("your_")) {
                String fallback = getAdminFallbackResponse(query, totalUsers, totalAdmins, totalEmployees, totalCustomers,
                        totalContracts, pendingContracts, approvedContracts, rejectedContracts,
                        totalIncidents, newIncidents, processingIncidents, resolvedIncidents, rejectedIncidents,
                        totalAppointments, logs);
                return ResponseEntity.ok(Map.of("reply", fallback, "isAi", false));
            }

            // Build context-aware prompt
            StringBuilder systemPrompt = new StringBuilder();
            systemPrompt.append("Bạn là trợ lý AI phân tích hệ thống Bảo An chuyên nghiệp. Nhiệm vụ của bạn là giúp quản trị viên (Admin) theo dõi, đánh giá và tóm tắt hoạt động của toàn bộ hệ thống bảo hiểm.\n\n");
            systemPrompt.append("--- SỐ LIỆU THỐNG KÊ THỜI GIAN THỰC ---\n");
            systemPrompt.append("- Người dùng: Tổng ").append(totalUsers).append(" (Admin: ").append(totalAdmins)
                    .append(", Nhân viên: ").append(totalEmployees).append(", Khách hàng: ").append(totalCustomers).append(")\n");
            systemPrompt.append("- Hợp đồng bảo hiểm: Tổng ").append(totalContracts)
                    .append(" (Đang chờ duyệt: ").append(pendingContracts).append(", Đã kích hoạt: ").append(approvedContracts)
                    .append(", Từ chối: ").append(rejectedContracts).append(")\n");
            systemPrompt.append("- Sự cố bồi thường: Tổng ").append(totalIncidents)
                    .append(" (Mới: ").append(newIncidents).append(", Đang xử lý: ").append(processingIncidents)
                    .append(", Đã duyệt chi trả: ").append(resolvedIncidents).append(", Bị từ chối: ").append(rejectedIncidents).append(")\n");
            systemPrompt.append("- Lịch hẹn tư vấn: Tổng ").append(totalAppointments).append("\n\n");

            systemPrompt.append("--- 15 NHẬT KÝ HOẠT ĐỘNG (AUDIT LOGS) GẦN NHẤT ---\n");
            for (SystemLog log : logs) {
                systemPrompt.append("- [").append(log.getCreatedAt() != null ? log.getCreatedAt().toString() : "---")
                        .append("] ")
                        .append(log.getUserEmail()).append(" (").append(log.getRole()).append("): ")
                        .append(log.getAction()).append(" [Trạng thái: ").append(log.getStatus()).append("]\n");
            }
            systemPrompt.append("\n");
            systemPrompt.append("Hãy sử dụng số liệu và logs trên để giải đáp câu hỏi của Admin. Nếu phát hiện hành động có trạng thái DANGER hoặc WARNING gần đây hoặc dấu hiệu bất thường (ví dụ: nhiều yêu cầu từ chối liên tiếp, đăng nhập lỗi nhiều lần), hãy cảnh báo và đưa ra gợi ý xử lý. Trả lời bằng tiếng Việt, súc tích, định dạng markdown đẹp mắt.");

            String aiReply = callGroqApi(systemPrompt.toString(), query);
            return ResponseEntity.ok(Map.of("reply", aiReply, "isAi", true));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MessageResponse("Lỗi hệ thống khi xử lý AI: " + e.getMessage()));
        }
    }

    // ==========================================
    // 2. EMPLOYEE INCIDENT REPORT AUDIT ENDPOINT
    // ==========================================
    @PostMapping("/employee/ai/analyze-incident/{id}")
    @PreAuthorize("hasRole('EMPLOYEE')")
    public ResponseEntity<?> analyzeIncident(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @PathVariable Long id) {
        
        try {
            IncidentReport report = incidentReportRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy báo cáo sự cố ID: " + id));

            Customer customer = report.getCustomer();
            CustomerInsurance ci = report.getCustomerInsurance();

            if (ci == null) {
                return ResponseEntity.badRequest().body(new MessageResponse("Sự cố này không liên kết với hợp đồng bảo hiểm nào để đối soát!"));
            }

            InsurancePackage ip = ci.getInsurancePackage();

            // Local checklist evaluation
            boolean isDateValid = !report.getIncidentDate().isBefore(ci.getStartDate()) 
                    && !report.getIncidentDate().isAfter(ci.getEndDate());
            boolean isAmountValid = report.getClaimAmount() <= ip.getMaxBenefit();
            boolean isContractApproved = "APPROVED".equals(ci.getStatus());
            
            // Check if Groq config is available
            if (apiKey == null || apiKey.trim().isEmpty() || apiKey.startsWith("${") || apiKey.contains("your_")) {
                Map<String, Object> fallbackResult = getIncidentFallbackResponse(report, customer, ci, ip, isDateValid, isAmountValid, isContractApproved);
                return ResponseEntity.ok(fallbackResult);
            }

            // Build auditing prompt
            StringBuilder systemPrompt = new StringBuilder();
            systemPrompt.append("Bạn là trợ lý AI giám định bảo hiểm thông minh của Bảo An. Nhiệm vụ của bạn là hỗ trợ Nhân viên tư vấn thẩm định yêu cầu bồi thường sự cố của khách hàng.\n\n");
            systemPrompt.append("--- CHI TIẾT SỰ CỐ KHAI BÁO ---\n");
            systemPrompt.append("- Mã sự cố: ").append(report.getReportCode()).append("\n");
            systemPrompt.append("- Khách hàng: ").append(customer.getFullName()).append("\n");
            systemPrompt.append("- Tiêu đề sự cố: ").append(report.getTitle()).append("\n");
            systemPrompt.append("- Mô tả sự cố: ").append(report.getDescription()).append("\n");
            systemPrompt.append("- Số tiền đề xuất bồi thường: ").append(new java.text.DecimalFormat("#,###").format(report.getClaimAmount())).append("đ\n");
            systemPrompt.append("- Ngày xảy ra sự cố: ").append(report.getIncidentDate().toString()).append("\n\n");

            systemPrompt.append("--- THÔNG TIN HỢP ĐỒNG BẢO HIỂM ĐỐI CHIẾU ---\n");
            systemPrompt.append("- Mã hợp đồng: ").append(ci.getContractCode()).append("\n");
            systemPrompt.append("- Gói bảo hiểm sản phẩm: ").append(ip.getName()).append(" (Phân loại: ").append(ip.getType()).append(")\n");
            systemPrompt.append("- Thời hạn hợp đồng: Từ ").append(ci.getStartDate().toString()).append(" đến ").append(ci.getEndDate().toString()).append("\n");
            systemPrompt.append("- Trạng thái hợp đồng: ").append(ci.getStatus()).append("\n");
            systemPrompt.append("- Hạn mức chi trả tối đa quy định: ").append(new java.text.DecimalFormat("#,###").format(ip.getMaxBenefit())).append("đ\n");
            systemPrompt.append("- Mô tả quyền lợi bảo vệ gói: ").append(ip.getDescription()).append("\n\n");

            systemPrompt.append("Quy tắc thẩm định:\n");
            systemPrompt.append("1. Hiệu lực thời gian: Ngày xảy ra sự cố phải nằm trong hạn hợp đồng bảo hiểm.\n");
            systemPrompt.append("2. Hạn mức chi trả: Số tiền yêu cầu bồi thường không được vượt quá hạn mức tối đa của gói.\n");
            systemPrompt.append("3. Phạm vi bảo hiểm: Nội dung mô tả sự cố phải phù hợp với quyền lợi gói (Ví dụ: sự cố sức khỏe/viện phí cho gói sức khỏe, tai nạn xe cộ cho gói xe máy/tài sản).\n\n");

            systemPrompt.append("Hãy trả về kết quả thẩm định dưới dạng một chuỗi JSON duy nhất, không kèm các từ thừa ở ngoài, với định dạng chính xác sau:\n");
            systemPrompt.append("{\n");
            systemPrompt.append("  \"summary\": \"Tóm tắt phân tích ngắn gọn lý do...\",\n");
            systemPrompt.append("  \"dateCheck\": \"Đạt / Không đạt (Chi tiết hạn hợp đồng và ngày xảy ra)\",\n");
            systemPrompt.append("  \"amountCheck\": \"Đạt / Không đạt (Chi tiết số tiền yêu cầu và hạn mức gói)\",\n");
            systemPrompt.append("  \"validityCheck\": \"Đạt / Không đạt (Đánh giá mức độ liên quan giữa mô tả sự cố và mô tả bảo vệ của gói)\",\n");
            systemPrompt.append("  \"recommendation\": \"APPROVE\" hoặc \"REJECT\",\n");
            systemPrompt.append("  \"suggestedReason\": \"Lý do đề xuất duyệt chi trả hoặc từ chối bồi thường để nhân viên gửi cho khách hàng.\"\n");
            systemPrompt.append("}");

            String jsonResponse = callGroqApi(systemPrompt.toString(), "Hãy thẩm định và trả về JSON kết quả.");
            
            try {
                // Try parsing the json output to make sure it's valid
                Map<String, Object> result = objectMapper.readValue(jsonResponse, Map.class);
                result.put("isAi", true);
                return ResponseEntity.ok(result);
            } catch (Exception e) {
                // If AI doesn't return clean JSON, clean it or fallback
                System.err.println("Failed to parse AI JSON response, returning raw or using fallback: " + jsonResponse);
                Map<String, Object> fallbackResult = getIncidentFallbackResponse(report, customer, ci, ip, isDateValid, isAmountValid, isContractApproved);
                fallbackResult.put("rawAiReply", jsonResponse);
                return ResponseEntity.ok(fallbackResult);
            }

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MessageResponse("Lỗi hệ thống khi thẩm định sự cố: " + e.getMessage()));
        }
    }

    // ==========================================
    // 3. EMPLOYEE SUPPORT CHAT SUGGEST REPLY
    // ==========================================
    @PostMapping("/employee/ai/suggest-reply")
    @PreAuthorize("hasRole('EMPLOYEE')")
    public ResponseEntity<?> suggestReply(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @RequestBody Map<String, Long> request) {
        
        try {
            Long contactId = request.get("contactId");
            if (contactId == null) {
                return ResponseEntity.badRequest().body(new MessageResponse("Không nhận diện được ID khách hàng hỗ trợ!"));
            }

            Customer customer = customerRepository.findByUserId(contactId)
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy hồ sơ khách hàng!"));

            // Fetch chat history between employee (sender or recipient) and customer
            List<ChatMessage> history = chatMessageRepository.findChatHistory(userDetails.getId(), contactId);
            
            // Get last customer message to perform search key matching
            String lastCustomerMessage = "";
            StringBuilder chatContext = new StringBuilder();
            
            int startIndex = Math.max(0, history.size() - 10);
            for (int i = startIndex; i < history.size(); i++) {
                ChatMessage m = history.get(i);
                boolean isCustomer = m.getSender().getId().equals(contactId);
                String senderName = isCustomer ? customer.getFullName() : "Nhân viên (Bạn)";
                chatContext.append("- ").append(senderName).append(": ").append(m.getContent()).append("\n");
                if (isCustomer) {
                    lastCustomerMessage = m.getContent();
                }
            }

            // Keyword match Wiki document contexts (RAG)
            String wikiContext = getWikiContext(lastCustomerMessage);

            // Fetch active customer insurances
            List<CustomerInsurance> activeInsurances = customerInsuranceRepository.findByCustomerIdAndStatusOrderByCreatedAtDesc(customer.getId(), "APPROVED");
            StringBuilder contractInfo = new StringBuilder();
            if (activeInsurances.isEmpty()) {
                contractInfo.append("Khách hàng hiện chưa mua hoặc chưa được kích hoạt hợp đồng bảo hiểm nào.");
            } else {
                for (CustomerInsurance ci : activeInsurances) {
                    contractInfo.append("- Hợp đồng ").append(ci.getContractCode())
                            .append(": Gói ").append(ci.getInsurancePackage().getName())
                            .append(" (Hạn mức: ").append(new java.text.DecimalFormat("#,###").format(ci.getInsurancePackage().getMaxBenefit())).append("đ, Hạn dùng: ").append(ci.getEndDate().toString()).append(")\n");
                }
            }

            // Check if Groq config is available
            if (apiKey == null || apiKey.trim().isEmpty() || apiKey.startsWith("${") || apiKey.contains("your_")) {
                String fallback = getReplyFallbackResponse(lastCustomerMessage, customer, activeInsurances, wikiContext);
                return ResponseEntity.ok(Map.of("suggestion", fallback, "isAi", false));
            }

            // Build prompt
            StringBuilder systemPrompt = new StringBuilder();
            systemPrompt.append("Bạn là trợ lý ảo hỗ trợ tư vấn viên chăm sóc khách hàng của bảo hiểm Bảo An.\n");
            systemPrompt.append("Nhiệm vụ của bạn là soạn thảo một câu trả lời mẫu lịch sự, thân thiện bằng tiếng Việt giúp nhân viên phản hồi lại tin nhắn của khách hàng.\n\n");
            systemPrompt.append("--- THÔNG TIN KHÁCH HÀNG ---\n");
            systemPrompt.append("- Họ tên: ").append(customer.getFullName()).append("\n");
            systemPrompt.append("- Email: ").append(customer.getUser() != null ? customer.getUser().getEmail() : "").append("\n");
            systemPrompt.append("- Điện thoại: ").append(customer.getPhoneNumber() != null ? customer.getPhoneNumber() : "").append("\n\n");

            systemPrompt.append("--- CÁC GÓI BẢO HIỂM HỌ ĐANG THAM GIA ---\n");
            systemPrompt.append(contractInfo).append("\n");

            if (!wikiContext.isEmpty()) {
                systemPrompt.append("--- TÀI LIỆU HƯỚNG DẪN NGHIỆP VỤ LIÊN QUAN (WIKI) ---\n");
                systemPrompt.append(wikiContext).append("\n");
            }

            systemPrompt.append("--- LỊCH SỬ CHAT GẦN ĐÂY ---\n");
            systemPrompt.append(chatContext).append("\n");

            systemPrompt.append("Yêu cầu câu trả lời mẫu:\n");
            systemPrompt.append("1. Xưng hô chuẩn mực lịch sự bằng tiếng Việt (Chào anh/chị ").append(customer.getFullName()).append(").\n");
            systemPrompt.append("2. Phải bám sát thông tin hợp đồng và hướng dẫn Wiki để hỗ trợ chính xác.\n");
            systemPrompt.append("3. Chỉ xuất ra trực tiếp nội dung tin nhắn sẽ gửi đi cho khách hàng, KHÔNG thêm bất cứ phần giải thích ngoài lề hoặc lời dẫn nào khác (ví dụ: không bắt đầu bằng 'Dưới đây là gợi ý...').");

            String aiSuggestion = callGroqApi(systemPrompt.toString(), "Hãy viết tin nhắn trả lời khách hàng.");
            return ResponseEntity.ok(Map.of("suggestion", aiSuggestion.trim(), "isAi", true));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MessageResponse("Lỗi hệ thống khi gợi ý phản hồi: " + e.getMessage()));
        }
    }

    // ==========================================
    // HELPERS & FALLBACKS
    // ==========================================
    
    private String callGroqApi(String systemPrompt, String userMessage) throws Exception {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("Authorization", "Bearer " + apiKey);

        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("model", modelName);

        List<Map<String, String>> messages = new ArrayList<>();
        
        Map<String, String> systemMessage = new HashMap<>();
        systemMessage.put("role", "system");
        systemMessage.put("content", systemPrompt);
        messages.add(systemMessage);

        Map<String, String> userMessageMap = new HashMap<>();
        userMessageMap.put("role", "user");
        userMessageMap.put("content", userMessage);
        messages.add(userMessageMap);

        requestBody.put("messages", messages);
        requestBody.put("temperature", 0.3); // Low temperature for high precision responses

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
        String url = baseUrl + "/chat/completions";
        
        ResponseEntity<Map> response = restTemplate.postForEntity(url, entity, Map.class);
        if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
            Map<String, Object> body = response.getBody();
            List<Map<String, Object>> choices = (List<Map<String, Object>>) body.get("choices");
            if (choices != null && !choices.isEmpty()) {
                Map<String, Object> firstChoice = choices.get(0);
                Map<String, Object> messageMap = (Map<String, Object>) firstChoice.get("message");
                if (messageMap != null) {
                    return (String) messageMap.get("content");
                }
            }
        }
        throw new RuntimeException("Groq API response format is incorrect");
    }

    private String getWikiContext(String message) {
        if (message == null || message.trim().isEmpty()) return "";
        List<WikiDocument> docs = wikiDocumentRepository.findAll();
        if (docs.isEmpty()) return "";

        StringBuilder context = new StringBuilder();
        String lowerMsg = message.toLowerCase();
        String[] words = lowerMsg.split("[\\s\\p{Punct}]+");

        for (WikiDocument doc : docs) {
            String docContent = doc.getContent().toLowerCase();
            boolean matches = false;
            int matchCount = 0;
            for (String word : words) {
                if (word.length() > 2 && docContent.contains(word)) {
                    matches = true;
                    matchCount++;
                }
            }
            if (matches || docs.size() <= 2) {
                String content = doc.getContent();
                if (content.length() > 1500) {
                    content = content.substring(0, 1500) + "...";
                }
                context.append("- Hướng dẫn ").append(doc.getFileName()).append(":\n")
                       .append(content).append("\n\n");
            }
        }
        return context.toString();
    }

    private String getAdminFallbackResponse(String query, long totalUsers, long totalAdmins, long totalEmployees, long totalCustomers,
                                            long totalContracts, long pendingContracts, long approvedContracts, long rejectedContracts,
                                            long totalIncidents, long newIncidents, long processingIncidents, long resolvedIncidents, long rejectedIncidents,
                                            long totalAppointments, List<SystemLog> logs) {
        
        String lower = query.toLowerCase();
        StringBuilder sb = new StringBuilder();
        
        sb.append("*(Báo cáo tự động từ cơ sở dữ liệu - Chế độ ngoại tuyến)*\n\n");

        if (lower.contains("user") || lower.contains("người dùng") || lower.contains("tài khoản")) {
            sb.append("### Thống kê tài khoản người dùng:\n")
              .append("- Tổng số tài khoản: **").append(totalUsers).append("**\n")
              .append("  - Quản trị viên (Admin): **").append(totalAdmins).append("**\n")
              .append("  - Nhân viên tư vấn: **").append(totalEmployees).append("**\n")
              .append("  - Khách hàng: **").append(totalCustomers).append("**\n");
        } else if (lower.contains("sự cố") || lower.contains("bồi thường") || lower.contains("yêu cầu")) {
            sb.append("### Thống kê yêu cầu bồi thường sự cố:\n")
              .append("- Tổng số yêu cầu sự cố: **").append(totalIncidents).append("**\n")
              .append("  - Chờ tiếp nhận (NEW): **").append(newIncidents).append("**\n")
              .append("  - Đang xử lý (PROCESSING): **").append(processingIncidents).append("**\n")
              .append("  - Đã thanh toán (RESOLVED): **").append(resolvedIncidents).append("**\n")
              .append("  - Bị từ chối (REJECTED): **").append(rejectedIncidents).append("**\n");
        } else if (lower.contains("hợp đồng") || lower.contains("gói") || lower.contains("doanh thu")) {
            sb.append("### Thống kê hợp đồng bảo hiểm:\n")
              .append("- Tổng số đăng ký hợp đồng: **").append(totalContracts).append("**\n")
              .append("  - Đang chờ duyệt hợp đồng: **").append(pendingContracts).append("**\n")
              .append("  - Hợp đồng đang hoạt động: **").append(approvedContracts).append("**\n")
              .append("  - Đơn đăng ký bị từ chối: **").append(rejectedContracts).append("**\n");
        } else if (lower.contains("bất thường") || lower.contains("lỗi") || lower.contains("log")) {
            sb.append("### Phân tích logs và phát hiện dấu hiệu bất thường:\n");
            boolean hasDanger = false;
            for (SystemLog log : logs) {
                if ("DANGER".equalsIgnoreCase(log.getStatus()) || "WARNING".equalsIgnoreCase(log.getStatus())) {
                    sb.append("⚠️ **Cảnh báo**: Hành động \"").append(log.getAction())
                      .append("\" thực hiện bởi ").append(log.getUserEmail())
                      .append(" có trạng thái ").append(log.getStatus()).append(".\n");
                    hasDanger = true;
                }
            }
            if (!hasDanger) {
                sb.append("✅ Không phát hiện hành động lỗi hoặc bất thường nguy hiểm (DANGER/WARNING) trong 15 nhật ký gần nhất.\n");
            }
            sb.append("\n**Danh sách 5 hành động gần đây:**\n");
            int limit = Math.min(5, logs.size());
            for (int i = 0; i < limit; i++) {
                SystemLog log = logs.get(i);
                sb.append("- ").append(log.getUserEmail()).append(": ").append(log.getAction()).append("\n");
            }
        } else {
            sb.append("### Tổng quan trạng thái hệ thống:\n")
              .append("- Hệ thống đang hoạt động ổn định.\n")
              .append("- Người dùng trực tuyến: **").append(totalCustomers).append(" Khách hàng**, **").append(totalEmployees).append(" Nhân viên**.\n")
              .append("- Hợp đồng hoạt động: **").append(approvedContracts).append("** gói.\n")
              .append("- Sự cố đang chờ xử lý: **").append(newIncidents).append("** hồ sơ.\n")
              .append("- Lịch tư vấn: **").append(totalAppointments).append("** lịch hẹn.\n\n")
              .append("Bạn có thể đặt câu hỏi cụ thể hơn về: `tài khoản`, `sự cố`, `hợp đồng`, hoặc `bất thường` để xem phân tích chi tiết.");
        }

        return sb.toString();
    }

    private Map<String, Object> getIncidentFallbackResponse(IncidentReport report, Customer customer, CustomerInsurance ci, InsurancePackage ip,
                                                            boolean isDateValid, boolean isAmountValid, boolean isContractApproved) {
        Map<String, Object> result = new HashMap<>();
        
        boolean overallPassed = isDateValid && isAmountValid && isContractApproved;
        
        result.put("isAi", false);
        result.put("dateCheck", isDateValid 
                ? "ĐẠT (Sự cố xảy ra ngày " + report.getIncidentDate() + " nằm trong hạn hợp đồng từ " + ci.getStartDate() + " đến " + ci.getEndDate() + ")"
                : "KHÔNG ĐẠT (Sự cố xảy ra ngày " + report.getIncidentDate() + " ngoài thời hạn hợp đồng từ " + ci.getStartDate() + " đến " + ci.getEndDate() + ")");
        
        result.put("amountCheck", isAmountValid
                ? "ĐẠT (Yêu cầu " + new java.text.DecimalFormat("#,###").format(report.getClaimAmount()) + "đ nằm trong hạn mức gói bảo hiểm " + new java.text.DecimalFormat("#,###").format(ip.getMaxBenefit()) + "đ)"
                : "KHÔNG ĐẠT (Yêu cầu " + new java.text.DecimalFormat("#,###").format(report.getClaimAmount()) + "đ vượt quá hạn mức tối đa của gói bảo hiểm " + new java.text.DecimalFormat("#,###").format(ip.getMaxBenefit()) + "đ)");
        
        result.put("validityCheck", isContractApproved 
                ? "ĐẠT (Hợp đồng đang ở trạng thái hiệu lực APPROVED)"
                : "KHÔNG ĐẠT (Hợp đồng bảo hiểm liên kết chưa được kích hoạt hoặc đang bị từ chối)");
        
        if (overallPassed) {
            result.put("recommendation", "APPROVE");
            result.put("summary", "Đối soát tự động thành công. Mọi điều kiện về thời hạn bảo hiểm, hạn mức chi trả tối đa của gói bảo hiểm " + ip.getName() + " và trạng thái hoạt động của hợp đồng đều được đáp ứng đầy đủ.");
            result.put("suggestedReason", "Hồ sơ của Quý khách đầy đủ và hợp lệ. Yêu cầu bồi thường sự cố \"" + report.getTitle() + "\" trị giá " + new java.text.DecimalFormat("#,###").format(report.getClaimAmount()) + "đ đã được phê duyệt chi trả thành công.");
        } else {
            result.put("recommendation", "REJECT");
            StringBuilder reasonSb = new StringBuilder("Từ chối do vi phạm điều khoản đối soát: ");
            if (!isContractApproved) reasonSb.append("Hợp đồng bảo hiểm không ở trạng thái hoạt động. ");
            if (!isDateValid) reasonSb.append("Sự cố xảy ra ngoài thời gian hiệu lực bảo vệ của hợp đồng. ");
            if (!isAmountValid) reasonSb.append("Số tiền đề xuất bồi thường vượt mức chi trả tối đa của gói bảo hiểm. ");
            
            result.put("summary", reasonSb.toString().trim());
            result.put("suggestedReason", "Rất tiếc, yêu cầu bồi thường sự cố của Quý khách đã bị từ chối. Lý do: " + reasonSb.toString().trim());
        }
        
        return result;
    }

    private String getReplyFallbackResponse(String lastCustomerMsg, Customer customer, List<CustomerInsurance> activeInsurances, String wikiContext) {
        String lower = lastCustomerMsg.toLowerCase();
        
        // Match keywords against wiki or direct questions
        if (!wikiContext.isEmpty()) {
            return "Chào anh/chị " + customer.getFullName() + "! Về thắc mắc của anh/chị, Bảo An xin được thông tin dựa trên hướng dẫn chính sách như sau:\n\n" 
                    + wikiContext + "\nHy vọng thông tin này giúp ích cho anh/chị. Cần thêm hỗ trợ gì, anh/chị cứ nhắn em nhé!";
        }
        
        if (lower.contains("sự cố") || lower.contains("bồi thường") || lower.contains("khai báo")) {
            return "Chào anh/chị " + customer.getFullName() + "! Để gửi yêu cầu bồi thường bảo hiểm, anh/chị vui lòng truy cập mục \"Báo cáo sự cố\" bên menu trái, chọn \"Khai báo sự cố mới\", điền thông tin sự cố kèm hóa đơn viện phí/biên bản và gửi yêu cầu để bên em tiến hành thẩm định chi trả ạ.";
        }
        
        if (lower.contains("gói") || lower.contains("hợp đồng") || lower.contains("mua")) {
            if (activeInsurances.isEmpty()) {
                return "Chào anh/chị " + customer.getFullName() + "! Hiện tại anh/chị chưa đăng ký hợp đồng bảo hiểm nào. Anh/chị có thể tham khảo danh sách các gói bảo hiểm sức khỏe, xe máy và tài sản đang mở bán ở mục \"Mua gói bảo hiểm\" để đăng ký trực tuyến ạ.";
            } else {
                CustomerInsurance first = activeInsurances.get(0);
                return "Chào anh/chị " + customer.getFullName() + "! Anh/chị đang có hợp đồng bảo hiểm hoạt động là gói **" + first.getInsurancePackage().getName() 
                        + "** (Mã hợp đồng: " + first.getContractCode() + ", hạn dùng đến " + first.getEndDate() + "). Anh/chị cần hỗ trợ kiểm tra thông tin hay quyền lợi gì của gói này ạ?";
            }
        }

        return "Chào anh/chị " + customer.getFullName() + "! Em là nhân viên hỗ trợ của bảo hiểm Bảo An. Em có thể hỗ trợ giải đáp thắc mắc hoặc tư vấn dịch vụ gì cho anh/chị ngày hôm nay ạ?";
    }
}
