package com.insurance.controller;

import com.insurance.entity.*;
import com.insurance.repository.*;
import com.insurance.security.UserDetailsImpl;
import com.insurance.dto.MessageResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/chat")
public class ChatController {

    @Autowired
    private ChatMessageRepository chatMessageRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private CustomerAssignmentRepository customerAssignmentRepository;

    // Get active contacts for the logged-in user
    @GetMapping("/contacts")
    public ResponseEntity<?> getContacts(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        User user = userRepository.findById(userDetails.getId()).orElse(null);
        if (user == null) {
            return ResponseEntity.badRequest().body(new MessageResponse("Lỗi: Không tìm thấy tài khoản đăng nhập!"));
        }

        List<Map<String, Object>> contactList = new ArrayList<>();
        Long currentUserId = user.getId();

        if ("ROLE_CUSTOMER".equals(user.getRole().getName().toString())) {
            // Customer looks for their assigned Employee
            Customer customer = customerRepository.findByUserId(user.getId()).orElse(null);
            if (customer != null) {
                Optional<CustomerAssignment> assignment = customerAssignmentRepository.findByCustomerId(customer.getId());
                if (assignment.isPresent()) {
                    Employee employee = assignment.get().getEmployee();
                    if (employee.getUser() != null) {
                        Map<String, Object> contact = new HashMap<>();
                        Long contactUserId = employee.getUser().getId();
                        contact.put("userId", contactUserId);
                        contact.put("fullName", employee.getFullName());
                        contact.put("role", "ROLE_EMPLOYEE");
                        contact.put("email", employee.getUser().getEmail());
                        contact.put("phoneNumber", employee.getPhoneNumber());
                        
                        long unreads = chatMessageRepository.countUnreadMessages(contactUserId, currentUserId);
                        contact.put("unreadCount", unreads);
                        
                        contactList.add(contact);
                    }
                }
            }
        } else if ("ROLE_EMPLOYEE".equals(user.getRole().getName().toString())) {
            // Employee looks for their assigned Customers
            Employee employee = employeeRepository.findByUserId(user.getId()).orElse(null);
            if (employee != null) {
                List<CustomerAssignment> assignments = customerAssignmentRepository.findByEmployeeId(employee.getId());
                for (CustomerAssignment ca : assignments) {
                    Customer customer = ca.getCustomer();
                    if (customer.getUser() != null) {
                        Map<String, Object> contact = new HashMap<>();
                        Long contactUserId = customer.getUser().getId();
                        contact.put("userId", contactUserId);
                        contact.put("fullName", customer.getFullName());
                        contact.put("role", "ROLE_CUSTOMER");
                        contact.put("email", customer.getUser().getEmail());
                        contact.put("phoneNumber", customer.getPhoneNumber());
                        
                        long unreads = chatMessageRepository.countUnreadMessages(contactUserId, currentUserId);
                        contact.put("unreadCount", unreads);
                        
                        contactList.add(contact);
                    }
                }
            }
        }

        return ResponseEntity.ok(contactList);
    }

    // Mark messages from contactId to current user as read
    @PostMapping("/read")
    public ResponseEntity<?> markAsRead(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @RequestParam("contactId") Long contactId) {
        
        Long currentUserId = userDetails.getId();
        List<ChatMessage> unread = chatMessageRepository.findUnreadMessages(contactId, currentUserId);
        for (ChatMessage msg : unread) {
            msg.setRead(true);
        }
        chatMessageRepository.saveAll(unread);
        
        return ResponseEntity.ok(new MessageResponse("Đã đánh dấu đã đọc!"));
    }

    // Get chat history between current user and contactId
    @GetMapping("/history")
    public ResponseEntity<?> getChatHistory(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @RequestParam("contactId") Long contactId) {
        
        Long currentUserId = userDetails.getId();
        List<ChatMessage> messages = chatMessageRepository.findChatHistory(currentUserId, contactId);
        
        List<Map<String, Object>> response = new ArrayList<>();
        for (ChatMessage msg : messages) {
            Map<String, Object> item = new HashMap<>();
            item.put("id", msg.getId());
            item.put("senderId", msg.getSender().getId());
            item.put("recipientId", msg.getRecipient().getId());
            item.put("content", msg.getContent());
            item.put("timestamp", msg.getTimestamp().toString());
            item.put("isRead", msg.isRead());
            item.put("isRecalled", msg.isRecalled());
            item.put("isEdited", msg.isEdited());
            item.put("reaction", msg.getReaction());
            response.add(item);
        }
        
        return ResponseEntity.ok(response);
    }
}
