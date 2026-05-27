package com.insurance.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "chat_messages")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ChatMessage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sender_id", nullable = false)
    private User sender;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "recipient_id", nullable = false)
    private User recipient;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String content;

    @CreationTimestamp
    @Column(name = "timestamp", updatable = false)
    private LocalDateTime timestamp;

    @Column(name = "is_read")
    private boolean isRead = false;

    @Column(name = "is_recalled")
    private Boolean isRecalled = false;

    @Column(name = "is_edited")
    private Boolean isEdited = false;

    @Column(name = "reaction")
    private String reaction;

    public boolean isRecalled() {
        return isRecalled != null && isRecalled;
    }

    public boolean isEdited() {
        return isEdited != null && isEdited;
    }

    public void setRecalled(boolean recalled) {
        this.isRecalled = recalled;
    }

    public void setEdited(boolean edited) {
        this.isEdited = edited;
    }
}
