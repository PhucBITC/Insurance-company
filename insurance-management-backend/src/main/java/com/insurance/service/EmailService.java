package com.insurance.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import jakarta.mail.internet.MimeMessage;

@Service
public class EmailService {

    @Autowired(required = false)
    private JavaMailSender mailSender;

    @Value("${spring.mail.username:}")
    private String fromEmail;

    public void sendPasswordResetEmail(String recipientEmail, String resetLink) {
        // Log the link in the console regardless so developers can test easily
        System.out.println("=================================================");
        System.out.println("YÊU CẦU ĐẶT LẠI MẬT KHẨU CHO: " + recipientEmail);
        System.out.println("ĐƯỜNG DẪN THỰC THI: " + resetLink);
        System.out.println("=================================================");

        java.util.concurrent.CompletableFuture.runAsync(() -> {
            if (mailSender == null || fromEmail == null || fromEmail.trim().isEmpty()) {
                System.out.println("[EmailService] SMTP chưa được cấu hình. Link reset đã được in ra console.");
                return;
            }

            try {
                MimeMessage message = mailSender.createMimeMessage();
                MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

                helper.setFrom(fromEmail);
                helper.setTo(recipientEmail);
                helper.setSubject("Đặt lại mật khẩu - Bảo hiểm Bảo An");

                String htmlContent = "<div style=\"font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 20px; max-width: 600px; border: 1px solid #e0e0e0; border-radius: 8px;\">" +
                        "<h2 style=\"color: #6366f1; margin-bottom: 20px;\">Yêu Cầu Đặt Lại Mật Khẩu</h2>" +
                        "<p>Chào bạn,</p>" +
                        "<p>Hệ thống nhận được yêu cầu đặt lại mật khẩu cho tài khoản liên kết với email này. Vui lòng bấm vào nút bên dưới để tiến hành đổi mật khẩu mới (liên kết này có hiệu lực trong vòng 15 phút):</p>" +
                        "<div style=\"text-align: center; margin: 30px 0;\">" +
                        "<a href=\"" + resetLink + "\" style=\"background-color: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;\">Đặt lại mật khẩu</a>" +
                        "</div>" +
                        "<p style=\"color: #666; font-size: 0.9em;\">Nếu bạn không gửi yêu cầu này, vui lòng bỏ qua email này.</p>" +
                        "<hr style=\"border: none; border-top: 1px solid #eee; margin: 20px 0;\" />" +
                        "<p style=\"color: #999; font-size: 0.8em; text-align: center;\">Hệ thống quản lý Công ty Bảo hiểm Bảo An</p>" +
                        "</div>";

                helper.setText(htmlContent, true);
                mailSender.send(message);
                System.out.println("[EmailService] Đã gửi email thành công tới: " + recipientEmail);
            } catch (Exception e) {
                System.err.println("[EmailService] Gửi email thất bại: " + e.getMessage());
            }
        });
    }

    public void sendVerificationOtpEmail(String recipientEmail, String otp) {
        // Log OTP in console for developer fallback
        System.out.println("=================================================");
        System.out.println("MÃ OTP XÁC THỰC ĐĂNG KÝ CHO: " + recipientEmail);
        System.out.println("MÃ OTP: " + otp);
        System.out.println("=================================================");

        java.util.concurrent.CompletableFuture.runAsync(() -> {
            if (mailSender == null || fromEmail == null || fromEmail.trim().isEmpty()) {
                System.out.println("[EmailService] SMTP chưa được cấu hình. Mã OTP đã được in ra console.");
                return;
            }

            try {
                MimeMessage message = mailSender.createMimeMessage();
                MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

                helper.setFrom(fromEmail);
                helper.setTo(recipientEmail);
                helper.setSubject("Mã xác thực tài khoản OTP - Bảo hiểm Bảo An");

                String htmlContent = "<div style=\"font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 20px; max-width: 600px; border: 1px solid #e0e0e0; border-radius: 8px;\">" +
                        "<h2 style=\"color: #6366f1; margin-bottom: 20px;\">Xác Thực Tài Khoản Đăng Ký</h2>" +
                        "<p>Chào bạn,</p>" +
                        "<p>Cảm ơn bạn đã lựa chọn dịch vụ của Bảo hiểm Bảo An. Để hoàn tất quy trình đăng ký tài khoản mới và kích hoạt dịch vụ, vui lòng nhập mã xác thực OTP dưới đây (mã có hiệu lực trong vòng 5 phút):</p>" +
                        "<div style=\"text-align: center; margin: 30px 0;\">" +
                        "<span style=\"background-color: #f1f5f9; color: #1e1b4b; padding: 12px 30px; font-size: 1.8rem; font-weight: bold; border-radius: 6px; letter-spacing: 5px; display: inline-block; border: 1px dashed #6366f1;\">" + otp + "</span>" +
                        "</div>" +
                        "<p style=\"color: #666; font-size: 0.9em;\">Nếu bạn không thực hiện đăng ký tài khoản trên hệ thống Bảo An, vui lòng bỏ qua email này.</p>" +
                        "<hr style=\"border: none; border-top: 1px solid #eee; margin: 20px 0;\" />" +
                        "<p style=\"color: #999; font-size: 0.8em; text-align: center;\">Hệ thống quản lý Công ty Bảo hiểm Bảo An</p>" +
                        "</div>";

                helper.setText(htmlContent, true);
                mailSender.send(message);
                System.out.println("[EmailService] Đã gửi mã OTP thành công tới: " + recipientEmail);
            } catch (Exception e) {
                System.err.println("[EmailService] Gửi mã OTP thất bại: " + e.getMessage());
            }
        });
    }
}
