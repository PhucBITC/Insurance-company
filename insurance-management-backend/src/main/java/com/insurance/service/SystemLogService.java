package com.insurance.service;

import com.insurance.entity.SystemLog;
import com.insurance.repository.SystemLogRepository;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

@Service
public class SystemLogService {

    @Autowired
    private SystemLogRepository systemLogRepository;

    @Autowired(required = false)
    private HttpServletRequest request;

    public void log(String action, String userEmail, String role, String status) {
        String ipAddress = "127.0.0.1";
        if (request != null) {
            String xHeader = request.getHeader("X-Forwarded-For");
            if (xHeader != null && !xHeader.isEmpty()) {
                ipAddress = xHeader.split(",")[0].trim();
            } else {
                ipAddress = request.getRemoteAddr();
            }
        }
        log(action, userEmail, role, status, ipAddress);
    }

    public void log(String action, String userEmail, String role, String status, String ipAddress) {
        try {
            SystemLog log = new SystemLog();
            log.setAction(action);
            log.setUserEmail(userEmail);
            log.setRole(role);
            log.setStatus(status);
            log.setIpAddress(ipAddress);
            systemLogRepository.save(log);
        } catch (Exception e) {
            System.err.println("Lỗi khi ghi nhật ký hệ thống: " + e.getMessage());
        }
    }

    public Page<SystemLog> getLogs(String role, String search, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return systemLogRepository.searchLogs(role, search, pageable);
    }
}
