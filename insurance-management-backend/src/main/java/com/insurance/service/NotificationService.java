package com.insurance.service;

import com.insurance.dto.NotificationResponseDto;
import com.insurance.entity.ERole;
import com.insurance.entity.Notification;
import com.insurance.entity.User;
import com.insurance.repository.NotificationRepository;
import com.insurance.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private UserRepository userRepository;

    public void sendNotification(User recipient, String title, String content, String link) {
        try {
            Notification notification = new Notification();
            notification.setUser(recipient);
            notification.setTitle(title);
            notification.setContent(content);
            notification.setLink(link);
            notification.setIsRead(false);
            notificationRepository.save(notification);
        } catch (Exception e) {
            System.err.println("Lỗi khi gửi thông báo: " + e.getMessage());
        }
    }

    public void sendNotificationToAllAdmins(String title, String content, String link) {
        try {
            List<User> admins = userRepository.findByRoleName(ERole.ROLE_ADMIN);
            for (User admin : admins) {
                sendNotification(admin, title, content, link);
            }
        } catch (Exception e) {
            System.err.println("Lỗi khi gửi thông báo đến các Admin: " + e.getMessage());
        }
    }

    @Transactional(readOnly = true)
    public List<NotificationResponseDto> getNotificationsForUser(Long userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public long getUnreadCount(Long userId) {
        return notificationRepository.countByUserIdAndIsReadFalse(userId);
    }

    public void markAsRead(Long notificationId, Long userId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Lỗi: Không tìm thấy thông báo!"));
        
        if (!notification.getUser().getId().equals(userId)) {
            throw new RuntimeException("Lỗi: Bạn không có quyền chỉnh sửa thông báo này!");
        }

        notification.setIsRead(true);
        notificationRepository.save(notification);
    }

    public void markAllAsRead(Long userId) {
        List<Notification> unread = notificationRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .filter(n -> !n.getIsRead())
                .collect(Collectors.toList());
        
        for (Notification n : unread) {
            n.setIsRead(true);
        }
        notificationRepository.saveAll(unread);
    }

    public void sendTestNotification(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Lỗi: Không tìm thấy người dùng với ID: " + userId));
        sendNotification(
            user,
            "Thông báo thử nghiệm",
            "Hệ thống thông báo của bạn đã hoạt động thành công! Lịch hẹn và báo cáo sự cố sẽ kích hoạt thông báo tự động tại đây.",
            null
        );
    }

    private NotificationResponseDto convertToDto(Notification entity) {
        NotificationResponseDto dto = new NotificationResponseDto();
        dto.setId(entity.getId());
        dto.setTitle(entity.getTitle());
        dto.setContent(entity.getContent());
        dto.setIsRead(entity.getIsRead());
        dto.setLink(entity.getLink());
        dto.setCreatedAt(entity.getCreatedAt());
        return dto;
    }
}
