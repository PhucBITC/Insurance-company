package com.insurance.controller;

import com.insurance.dto.ChatbotRequestDto;
import com.insurance.dto.ChatbotResponseDto;
import com.insurance.dto.MessageResponse;
import com.insurance.entity.*;
import com.insurance.repository.*;
import com.insurance.security.UserDetailsImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api")
public class ChatbotController {

    @Value("${ai.chat.api.key}")
    private String apiKey;

    @Value("${ai.chat.base.url}")
    private String baseUrl;

    @Value("${ai.chat.model}")
    private String modelName;

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private CustomerInsuranceRepository customerInsuranceRepository;

    @Autowired
    private CustomerAssignmentRepository customerAssignmentRepository;

    @Autowired
    private InsurancePackageRepository insurancePackageRepository;

    private final RestTemplate restTemplate = new RestTemplate();

    @PostMapping("/customer/chatbot/chat")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<?> getChatbotReply(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @RequestBody ChatbotRequestDto request) {
        
        try {
            Customer customer = customerRepository.findByUserId(userDetails.getId())
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy thông tin khách hàng!"));

            String userMessage = request.getMessage();

            // 1. Check if Groq Cloud config is available
            if (apiKey == null || apiKey.trim().isEmpty() || apiKey.startsWith("${") || apiKey.contains("your_")) {
                // Config not set, use local smart fallback
                String fallbackReply = getFallbackResponse(userMessage, customer);
                return ResponseEntity.ok(new ChatbotResponseDto(fallbackReply, false));
            }

            // 2. Build context-aware system prompt (RAG)
            String systemPrompt = buildSystemPrompt(customer);

            // 3. Make REST call to Groq Cloud (OpenAI compatible)
            try {
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
                requestBody.put("temperature", 0.7);

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
                            String reply = (String) messageMap.get("content");
                            return ResponseEntity.ok(new ChatbotResponseDto(reply, true));
                        }
                    }
                }
                
                // If response parsing fails, fallback
                String fallbackReply = getFallbackResponse(userMessage, customer);
                return ResponseEntity.ok(new ChatbotResponseDto(fallbackReply, false));

            } catch (Exception e) {
                // If API call fails (rate limit, offline, timeout), use fallback gracefully
                System.err.println("Error calling Groq API: " + e.getMessage());
                String fallbackReply = getFallbackResponse(userMessage, customer);
                return ResponseEntity.ok(new ChatbotResponseDto(fallbackReply, false));
            }

        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    // --- PROMPT CONTEXT BUILDER (RAG) ---

    private String buildSystemPrompt(Customer customer) {
        StringBuilder sb = new StringBuilder();
        sb.append("Bạn là trợ lý ảo AI Chatbot chăm sóc khách hàng thông minh của hệ thống bảo hiểm Bảo An.\n");
        sb.append("Hãy chào đón khách hàng, giải đáp thắc mắc và tư vấn cho họ một cách thân thiện, lễ phép và chuyên nghiệp bằng tiếng Việt.\n");
        sb.append("Bạn có quyền truy cập trực tiếp các thông tin thật sau từ cơ sở dữ liệu để phục vụ tư vấn:\n\n");
        
        sb.append("--- THÔNG TIN KHÁCH HÀNG ---\n");
        sb.append("- Họ và tên: ").append(customer.getFullName()).append("\n");
        sb.append("- Số điện thoại: ").append(customer.getPhoneNumber() != null ? customer.getPhoneNumber() : "Chưa cập nhật").append("\n");
        sb.append("- Mã số khách hàng: ").append(customer.getCustomerCode()).append("\n\n");

        sb.append("--- HỢP ĐỒNG BẢO HIỂM CỦA HỌ ---\n");
        List<CustomerInsurance> activeInsurances = customerInsuranceRepository.findByCustomerIdAndStatusOrderByCreatedAtDesc(customer.getId(), "APPROVED");
        if (activeInsurances.isEmpty()) {
            sb.append("Khách hàng này hiện chưa có hợp đồng bảo hiểm nào đang hoạt động. Hãy khuyến khích họ mua gói bảo hiểm mới.\n");
        } else {
            for (CustomerInsurance ci : activeInsurances) {
                sb.append("- Mã hợp đồng: ").append(ci.getContractCode()).append("\n");
                sb.append("  + Gói bảo hiểm: ").append(ci.getInsurancePackage().getName()).append("\n");
                sb.append("  + Hạn mức chi trả tối đa: ").append(new java.text.DecimalFormat("#,###").format(ci.getInsurancePackage().getMaxBenefit())).append("đ\n");
                sb.append("  + Ngày đáo hạn: ").append(ci.getEndDate() != null ? ci.getEndDate().toString() : "---").append("\n");
            }
        }
        sb.append("\n");

        sb.append("--- TƯ VẤN VIÊN PHỤ TRÁCH CHĂM SÓC RIÊNG ---\n");
        Optional<CustomerAssignment> assignment = customerAssignmentRepository.findByCustomerId(customer.getId());
        if (assignment.isPresent()) {
            Employee emp = assignment.get().getEmployee();
            sb.append("- Họ và tên: ").append(emp.getFullName()).append("\n");
            sb.append("- Email liên hệ: ").append(emp.getUser() != null ? emp.getUser().getEmail() : "employee@insurance.com").append("\n");
            sb.append("- Số điện thoại: ").append(emp.getPhoneNumber() != null ? emp.getPhoneNumber() : "---").append("\n");
        } else {
            sb.append("Chưa phân công tư vấn viên riêng. Hệ thống sẽ tự động gán nhân viên hỗ trợ khi họ tạo yêu cầu sự cố hoặc đăng ký gói.\n");
        }
        sb.append("\n");

        sb.append("--- CÁC GÓI BẢO HIỂM ĐANG KINH DOANH ---\n");
        List<InsurancePackage> packages = insurancePackageRepository.findByStatus("ACTIVE");
        for (InsurancePackage ip : packages) {
            sb.append("- Tên gói: ").append(ip.getName()).append(" (Mã: ").append(ip.getPackageCode()).append(")\n");
            sb.append("  + Phân loại: ").append(ip.getType()).append("\n");
            sb.append("  + Phí bảo hiểm: ").append(new java.text.DecimalFormat("#,###").format(ip.getPrice())).append("đ\n");
            sb.append("  + Quyền lợi tối đa: ").append(new java.text.DecimalFormat("#,###").format(ip.getMaxBenefit())).append("đ\n");
            sb.append("  + Mô tả: ").append(ip.getDescription()).append("\n");
        }
        sb.append("\n");

        sb.append("--- QUY TRÌNH BÁO CÁO SỰ CỐ / YÊU CẦU BỒI THƯỜNG ---\n");
        sb.append("Nếu khách hàng hỏi cách làm thủ tục bồi thường sự cố bảo hiểm (tai nạn, viện phí, v.v.), hãy hướng dẫn họ thực hiện các bước sau trên website:\n");
        sb.append("1. Truy cập vào mục 'Báo cáo sự cố' ở thanh menu bên trái (sidebar).\n");
        sb.append("2. Bấm nút 'Khai báo sự cố mới' ở góc trên bên phải.\n");
        sb.append("3. Chọn đúng hợp đồng bảo hiểm đang có hiệu lực liên kết với sự cố.\n");
        sb.append("4. Nhập tiêu đề, ngày xảy ra sự cố, mô tả chi tiết tai nạn, số tiền đề xuất bồi thường, và đính kèm hình ảnh hóa đơn viện phí/biên bản tai nạn.\n");
        sb.append("5. Bấm 'Gửi báo cáo'. Phiếu yêu cầu sẽ được gửi tới Nhân viên tư vấn phụ trách chăm sóc riêng để duyệt.\n\n");
        
        sb.append("LƯU Ý: Chỉ tư vấn và trả lời các thông tin liên quan đến các gói bảo hiểm, quy trình bảo hiểm hoặc thông tin tài khoản của họ. Nếu người dùng hỏi các câu hỏi không liên quan đến bảo hiểm, hãy hướng dẫn họ một cách khéo léo quay lại chủ đề bảo hiểm Bảo An.");
        
        return sb.toString();
    }

    // --- SMART KEYWORD-BASED FALLBACK RESPONSE ---

    private String getFallbackResponse(String userText, Customer customer) {
        String text = userText.toLowerCase();
        
        if (text.contains("sự cố") || text.contains("báo cáo") || text.contains("bồi thường") || text.contains("tai nạn") || text.contains("khai báo")) {
            return "Chào " + customer.getFullName() + "! Để khai báo sự cố và yêu cầu bồi thường bảo hiểm, bạn hãy làm theo các bước sau:\n\n" +
                   "1. Vào trang **Báo cáo sự cố** từ thanh menu bên trái.\n" +
                   "2. Bấm nút **Khai báo sự cố mới** ở góc phải.\n" +
                   "3. Chọn hợp đồng bảo hiểm đang hoạt động, nhập tiêu đề, ngày xảy ra sự cố, số tiền yêu cầu bồi thường và tải lên file ảnh hóa đơn/viện phí.\n" +
                   "4. Bấm **Gửi báo cáo**. Nhân viên tư vấn chăm sóc của bạn sẽ tiếp nhận và tiến hành xử lý bồi thường sớm nhất.";
        }
        
        if (text.contains("hợp đồng") || text.contains("quyền lợi") || text.contains("gói của tôi") || text.contains("tham gia")) {
            List<CustomerInsurance> activeInsurances = customerInsuranceRepository.findByCustomerIdAndStatusOrderByCreatedAtDesc(customer.getId(), "APPROVED");
            if (activeInsurances.isEmpty()) {
                return "Chào bạn, hiện tại bạn chưa có hợp đồng bảo hiểm nào đang hoạt động trên hệ thống. Bạn vui lòng vào mục **Mua gói bảo hiểm** để đăng ký các gói bảo hiểm sức khỏe, xe máy hoặc tài sản nhé!";
            } else {
                StringBuilder sb = new StringBuilder("Chào " + customer.getFullName() + "! Dưới đây là danh sách hợp đồng đang hoạt động của bạn:\n\n");
                for (CustomerInsurance ci : activeInsurances) {
                    sb.append("* **Hợp đồng ").append(ci.getContractCode()).append("**:\n")
                      .append("  - Gói sản phẩm: ").append(ci.getInsurancePackage().getName()).append("\n")
                      .append("  - Hạn mức bảo vệ: ").append(new java.text.DecimalFormat("#,###").format(ci.getInsurancePackage().getMaxBenefit())).append("đ\n")
                      .append("  - Ngày đáo hạn: ").append(ci.getEndDate() != null ? ci.getEndDate().toString() : "---").append("\n\n");
                }
                return sb.toString();
            }
        }
        
        if (text.contains("nhân viên") || text.contains("tư vấn") || text.contains("hỗ trợ") || text.contains("liên hệ")) {
            Optional<CustomerAssignment> assignment = customerAssignmentRepository.findByCustomerId(customer.getId());
            if (assignment.isPresent()) {
                Employee emp = assignment.get().getEmployee();
                return "Chào bạn! Nhân viên tư vấn riêng chịu trách nhiệm chăm sóc và hỗ trợ bạn là:\n\n" +
                       "* **Họ tên**: " + emp.getFullName() + "\n" +
                       "* **Email**: " + (emp.getUser() != null ? emp.getUser().getEmail() : "employee@insurance.com") + "\n" +
                       "* **Số điện thoại**: " + (emp.getPhoneNumber() != null ? emp.getPhoneNumber() : "---") + "\n\n" +
                       "Bạn có thể liên hệ trực tiếp với nhân viên này hoặc gửi yêu cầu bồi thường để được hỗ trợ giải quyết nhanh nhất.";
            } else {
                return "Chào bạn! Hiện tại tài khoản của bạn chưa được phân công nhân viên tư vấn riêng. Hệ thống sẽ tự động gán nhân viên tư vấn cho bạn ngay sau khi bạn đăng ký gói bảo hiểm hoặc gửi yêu cầu báo cáo sự cố đầu tiên.";
            }
        }

        if (text.contains("gói bảo hiểm") || text.contains("gói bảo") || text.contains("gói nào") || text.contains("giới thiệu")) {
            List<InsurancePackage> packages = insurancePackageRepository.findByStatus("ACTIVE");
            if (packages.isEmpty()) {
                return "Chào bạn! Hiện tại hệ thống chưa mở bán gói bảo hiểm nào. Bạn vui lòng quay lại sau nhé.";
            } else {
                StringBuilder sb = new StringBuilder("Chào bạn! Dưới đây là các gói bảo hiểm đang mở bán trên hệ thống Bảo An:\n\n");
                for (InsurancePackage ip : packages) {
                    sb.append("* **").append(ip.getName()).append("** (").append(ip.getType()).append("):\n")
                      .append("  - Phí đóng: ").append(new java.text.DecimalFormat("#,###").format(ip.getPrice())).append("đ\n")
                      .append("  - Hạn mức bảo vệ: ").append(new java.text.DecimalFormat("#,###").format(ip.getMaxBenefit())).append("đ\n")
                      .append("  - Mô tả: ").append(ip.getDescription()).append("\n\n");
                }
                sb.append("Bạn có thể đăng ký mua trực tiếp các gói này tại mục **Mua gói bảo hiểm**.");
                return sb.toString();
            }
        }
        
        return "Chào " + customer.getFullName() + "! Tôi là Trợ lý ảo AI của bảo hiểm Bảo An.\n\n" +
               "Tôi có thể hỗ trợ bạn các chủ đề sau:\n" +
               "1. Hướng dẫn quy trình **khai báo sự cố và yêu cầu bồi thường**.\n" +
               "2. Tra cứu danh sách **hợp đồng bảo hiểm** của bạn.\n" +
               "3. Cung cấp thông tin **nhân viên tư vấn riêng** hỗ trợ bạn.\n" +
               "4. Giới thiệu các **gói bảo hiểm** đang mở bán.\n\n" +
               "Bạn muốn tôi hỗ trợ thông tin gì ạ?";
    }
}
