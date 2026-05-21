package com.insurance.controller;

import com.insurance.dto.MessageResponse;
import com.insurance.dto.UserResponseDto;
import com.insurance.entity.ERole;
import com.insurance.entity.Role;
import com.insurance.entity.User;
import com.insurance.repository.RoleRepository;
import com.insurance.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/admin/users")
@PreAuthorize("hasRole('ADMIN')")
public class AdminUserController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @GetMapping
    public ResponseEntity<List<UserResponseDto>> getAllUsers() {
        List<UserResponseDto> users = userRepository.findAll().stream()
                .map(user -> new UserResponseDto(
                        user.getId(),
                        user.getEmail(),
                        user.getRole().getName().name(),
                        user.getCreatedAt()
                ))
                .collect(Collectors.toList());
        return ResponseEntity.ok(users);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateUserRole(@PathVariable Long id, @RequestParam String roleName) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Lỗi: Không tìm thấy tài khoản với ID " + id));

        try {
            ERole eRole = ERole.valueOf(roleName);
            Role role = roleRepository.findByName(eRole)
                    .orElseThrow(() -> new RuntimeException("Lỗi: Vai trò không tồn tại!"));
            user.setRole(role);
            userRepository.save(user);
            return ResponseEntity.ok(new MessageResponse("Cập nhật vai trò người dùng thành công!"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(new MessageResponse("Lỗi: Tên vai trò không hợp lệ!"));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Lỗi: Không tìm thấy tài khoản với ID " + id));

        if (id == 1L || "admin@insurance.com".equals(user.getEmail())) {
            return ResponseEntity.badRequest().body(new MessageResponse("Lỗi: Không thể xóa tài khoản Admin mặc định!"));
        }

        userRepository.delete(user);
        return ResponseEntity.ok(new MessageResponse("Xóa tài khoản thành công!"));
    }
}
