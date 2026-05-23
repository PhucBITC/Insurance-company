package com.insurance.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ChatbotRequestDto {
    @NotBlank(message = "Nội dung tin nhắn không được để trống")
    private String message;
}
