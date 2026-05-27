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
