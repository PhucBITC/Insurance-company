package com.insurance.security.websocket;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.insurance.entity.ChatMessage;
import com.insurance.entity.User;
import com.insurance.repository.ChatMessageRepository;
import com.insurance.repository.UserRepository;
import com.insurance.security.JwtTokenProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.*;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class ChatWebSocketHandler extends TextWebSocketHandler {

    // Maps User ID to WebSocket Session
    private static final Map<Long, WebSocketSession> activeSessions = new ConcurrentHashMap<>();
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ChatMessageRepository chatMessageRepository;

    @Autowired
    private com.insurance.repository.CustomerRepository customerRepository;

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        String query = session.getUri().getQuery();
        String token = null;
        if (query != null && query.contains("token=")) {
            token = query.split("token=")[1];
        }

        if (token != null && jwtTokenProvider.validateJwtToken(token)) {
            String email = jwtTokenProvider.getUserNameFromJwtToken(token);
            User user = userRepository.findByEmail(email).orElse(null);
            if (user != null) {
                session.getAttributes().put("userId", user.getId());
                activeSessions.put(user.getId(), session);
                System.out.println("[ChatWS] Connected User ID: " + user.getId() + " (" + email + ")");
                return;
            }
        }
        System.err.println("[ChatWS] Connection rejected: Token invalid or missing");
        session.close(CloseStatus.NOT_ACCEPTABLE);
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        Long senderId = (Long) session.getAttributes().get("userId");
        if (senderId == null) return;

        try {
            Map<String, Object> payload = objectMapper.readValue(message.getPayload(), Map.class);
            String type = payload.getOrDefault("type", "CHAT").toString();

            if ("DELETE_HISTORY".equals(type)) {
                Long recipientId = Long.valueOf(payload.get("recipientId").toString());
                chatMessageRepository.deleteChatHistory(senderId, recipientId);

                // Send confirmation to sender
                if (session.isOpen()) {
                    Map<String, Object> confirmation = Map.of(
                        "type", "DELETE_HISTORY",
                        "contactId", recipientId
                    );
                    session.sendMessage(new TextMessage(objectMapper.writeValueAsString(confirmation)));
                }

                // Notify recipient if online
                WebSocketSession recipientSession = activeSessions.get(recipientId);
                if (recipientSession != null && recipientSession.isOpen()) {
                    Map<String, Object> notification = Map.of(
                        "type", "DELETE_HISTORY",
                        "contactId", senderId
                    );
                    recipientSession.sendMessage(new TextMessage(objectMapper.writeValueAsString(notification)));
                }
                return;
            }

            if ("READ".equals(type)) {
                Long recipientId = Long.valueOf(payload.get("recipientId").toString());
                // senderId is marking messages from recipientId to senderId as read
                java.util.List<ChatMessage> unread = chatMessageRepository.findUnreadMessages(recipientId, senderId);
                for (ChatMessage m : unread) {
                    m.setRead(true);
                }
                chatMessageRepository.saveAll(unread);

                // Notify recipientId that senderId has read their messages in real-time
                WebSocketSession recipientSession = activeSessions.get(recipientId);
                if (recipientSession != null && recipientSession.isOpen()) {
                    Map<String, Object> response = Map.of(
                        "type", "READ_RECEIPT",
                        "senderId", senderId
                    );
                    recipientSession.sendMessage(new TextMessage(objectMapper.writeValueAsString(response)));
                    System.out.println("[ChatWS] Sent READ_RECEIPT to " + recipientId + " from reader " + senderId);
                }
                return;
            }

            if ("RECALL".equals(type)) {
                Long messageId = Long.valueOf(payload.get("messageId").toString());
                Long recipientId = Long.valueOf(payload.get("recipientId").toString());
                java.util.Optional<ChatMessage> msgOpt = chatMessageRepository.findById(messageId);
                if (msgOpt.isPresent()) {
                    ChatMessage msg = msgOpt.get();
                    if (msg.getSender().getId().equals(senderId)) {
                        msg.setRecalled(true);
                        msg.setContent("Tin nhắn đã được thu hồi");
                        chatMessageRepository.save(msg);

                        WebSocketSession recipientSession = activeSessions.get(recipientId);
                        if (recipientSession != null && recipientSession.isOpen()) {
                            Map<String, Object> response = Map.of(
                                "type", "RECALL",
                                "messageId", messageId,
                                "senderId", senderId
                            );
                            recipientSession.sendMessage(new TextMessage(objectMapper.writeValueAsString(response)));
                        }
                    }
                }
                return;
            }

            if ("EDIT".equals(type)) {
                Long messageId = Long.valueOf(payload.get("messageId").toString());
                Long recipientId = Long.valueOf(payload.get("recipientId").toString());
                String newContent = payload.get("content").toString();
                java.util.Optional<ChatMessage> msgOpt = chatMessageRepository.findById(messageId);
                if (msgOpt.isPresent()) {
                    ChatMessage msg = msgOpt.get();
                    if (msg.getSender().getId().equals(senderId)) {
                        msg.setEdited(true);
                        msg.setContent(newContent);
                        chatMessageRepository.save(msg);

                        WebSocketSession recipientSession = activeSessions.get(recipientId);
                        if (recipientSession != null && recipientSession.isOpen()) {
                            Map<String, Object> response = Map.of(
                                "type", "EDIT",
                                "messageId", messageId,
                                "content", newContent,
                                "senderId", senderId
                            );
                            recipientSession.sendMessage(new TextMessage(objectMapper.writeValueAsString(response)));
                        }
                    }
                }
                return;
            }

            if ("REACT".equals(type)) {
                Long messageId = Long.valueOf(payload.get("messageId").toString());
                Long recipientId = Long.valueOf(payload.get("recipientId").toString());
                String reaction = payload.get("reaction") != null ? payload.get("reaction").toString() : null;
                java.util.Optional<ChatMessage> msgOpt = chatMessageRepository.findById(messageId);
                if (msgOpt.isPresent()) {
                    ChatMessage msg = msgOpt.get();
                    if (msg.getSender().getId().equals(senderId) || msg.getRecipient().getId().equals(senderId)) {
                        msg.setReaction(reaction);
                        chatMessageRepository.save(msg);

                        WebSocketSession recipientSession = activeSessions.get(recipientId);
                        if (recipientSession != null && recipientSession.isOpen()) {
                            Map<String, Object> response = Map.of(
                                "type", "REACT",
                                "messageId", messageId,
                                "reaction", reaction != null ? reaction : "",
                                "senderId", senderId
                            );
                            recipientSession.sendMessage(new TextMessage(objectMapper.writeValueAsString(response)));
                        }
                    }
                }
                return;
            }

            Long recipientId = Long.valueOf(payload.get("recipientId").toString());
            String content = payload.get("content").toString();
            String tempId = payload.getOrDefault("tempId", "").toString();

            User sender = userRepository.findById(senderId).orElse(null);
            User recipient = userRepository.findById(recipientId).orElse(null);

            if (sender != null && recipient != null) {
                ChatMessage chatMsg = new ChatMessage();
                chatMsg.setSender(sender);
                chatMsg.setRecipient(recipient);
                chatMsg.setContent(content);
                chatMsg.setTimestamp(LocalDateTime.now());
                chatMsg = chatMessageRepository.save(chatMsg);

                // Send confirmation to sender
                if (session.isOpen()) {
                    Map<String, Object> confirmation = Map.of(
                        "type", "SENT_CONFIRMATION",
                        "tempId", tempId,
                        "id", chatMsg.getId(),
                        "senderId", senderId,
                        "recipientId", recipientId,
                        "content", content,
                        "timestamp", chatMsg.getTimestamp().toString(),
                        "isRead", false
                    );
                    session.sendMessage(new TextMessage(objectMapper.writeValueAsString(confirmation)));
                }

                // Forward message to recipient if online
                WebSocketSession recipientSession = activeSessions.get(recipientId);
                if (recipientSession != null && recipientSession.isOpen()) {
                    Map<String, Object> response = Map.of(
                        "id", chatMsg.getId(),
                        "senderId", senderId,
                        "recipientId", recipientId,
                        "content", content,
                        "timestamp", chatMsg.getTimestamp().toString(),
                        "isRead", false
                    );
                    recipientSession.sendMessage(new TextMessage(objectMapper.writeValueAsString(response)));
                    System.out.println("[ChatWS] Forwarded message from " + senderId + " to " + recipientId);
                } else {
                    System.out.println("[ChatWS] Recipient " + recipientId + " is offline. Saved message in DB.");
                }

                // Auto-reply logic: If Customer sends to Employee, check if we need to auto-reply
                boolean isCustomerSender = "ROLE_CUSTOMER".equals(sender.getRole().getName().toString());
                if (isCustomerSender) {
                    java.util.List<ChatMessage> history = chatMessageRepository.findChatHistory(senderId, recipientId);
                    boolean shouldAutoReply = false;

                    if (history.size() <= 1) { // Only the message we just saved
                        shouldAutoReply = true;
                    } else {
                        // Find the last message sent by the employee (recipient)
                        ChatMessage lastEmployeeMsg = null;
                        for (int i = history.size() - 2; i >= 0; i--) {
                            if (history.get(i).getSender().getId().equals(recipientId)) {
                                lastEmployeeMsg = history.get(i);
                                break;
                            }
                        }
                        if (lastEmployeeMsg == null) {
                            shouldAutoReply = true;
                        } else {
                            // If last employee reply was more than 10 minutes ago, auto-reply again
                            LocalDateTime tenMinutesAgo = LocalDateTime.now().minusMinutes(10);
                            if (lastEmployeeMsg.getTimestamp().isBefore(tenMinutesAgo)) {
                                shouldAutoReply = true;
                            }
                        }
                    }

                    if (shouldAutoReply) {
                        String customerName = "Khách hàng";
                        java.util.Optional<com.insurance.entity.Customer> custOpt = customerRepository.findByUserId(senderId);
                        if (custOpt.isPresent()) {
                            customerName = custOpt.get().getFullName();
                        }

                        String autoContent = "Chào anh/chị " + customerName + "! Tôi là trợ lý tự động của bảo hiểm Bảo An.\n\n" +
                                "Cảm ơn anh/chị đã liên hệ. Để hỗ trợ tốt nhất, xin hỏi anh/chị đang cần hỗ trợ về chủ đề nào dưới đây ạ?\n" +
                                "1. Thủ tục khai báo sự cố và nhận bồi thường.\n" +
                                "2. Tra cứu thông tin hợp đồng bảo hiểm của tôi.\n" +
                                "3. Tham khảo các gói bảo hiểm đang mở bán.\n\n" +
                                "*(Anh/chị vui lòng để lại mô tả chi tiết, Nhân viên tư vấn phụ trách sẽ trực tiếp vào hỗ trợ anh/chị ngay lập tức!)*";

                        ChatMessage autoMsg = new ChatMessage();
                        autoMsg.setSender(recipient); // sent from employee
                        autoMsg.setRecipient(sender); // sent to customer
                        autoMsg.setContent(autoContent);
                        autoMsg.setTimestamp(LocalDateTime.now().plusSeconds(1)); // slightly after
                        autoMsg = chatMessageRepository.save(autoMsg);

                        // Send autoMsg to Customer (sender)
                        if (session.isOpen()) {
                            Map<String, Object> autoMsgPayload = Map.of(
                                "id", autoMsg.getId(),
                                "senderId", recipientId,
                                "recipientId", senderId,
                                "content", autoContent,
                                "timestamp", autoMsg.getTimestamp().toString(),
                                "isRead", false
                            );
                            session.sendMessage(new TextMessage(objectMapper.writeValueAsString(autoMsgPayload)));
                        }

                        // Send autoMsg to Employee (recipient) if online
                        if (recipientSession != null && recipientSession.isOpen()) {
                            Map<String, Object> autoMsgPayload = Map.of(
                                "id", autoMsg.getId(),
                                "senderId", recipientId,
                                "recipientId", senderId,
                                "content", autoContent,
                                "timestamp", autoMsg.getTimestamp().toString(),
                                "isRead", false
                            );
                            recipientSession.sendMessage(new TextMessage(objectMapper.writeValueAsString(autoMsgPayload)));
                        }
                    }
                }
            }
        } catch (Exception e) {
            System.err.println("[ChatWS] Error processing message: " + e.getMessage());
        }
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws Exception {
        Long userId = (Long) session.getAttributes().get("userId");
        if (userId != null) {
            activeSessions.remove(userId);
            System.out.println("[ChatWS] Disconnected User ID: " + userId);
        }
    }
}
