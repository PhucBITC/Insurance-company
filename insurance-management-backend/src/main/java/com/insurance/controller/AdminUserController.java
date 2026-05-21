package com.insurance.controller;

import com.insurance.dto.MessageResponse;
import com.insurance.dto.UserResponseDto;
import com.insurance.entity.ERole;
import com.insurance.entity.Role;
import com.insurance.entity.User;
import com.insurance.repository.RoleRepository;
import com.insurance.repository.UserRepository;
import com.insurance.repository.EmployeeRepository;
import com.insurance.repository.CustomerRepository;
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

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private CustomerRepository customerRepository;

    @GetMapping
    public ResponseEntity<List<UserResponseDto>> getAllUsers() {
        List<UserResponseDto> users = userRepository.findAll().stream()
                .map(user -> {
                    String fullName = "";
                    if (user.getRole().getName() == ERole.ROLE_EMPLOYEE) {
                        fullName = employeeRepository.findByUserId(user.getId())
                                .map(e -> e.getFullName())
                                .orElse("");
                    } else if (user.getRole().getName() == ERole.ROLE_CUSTOMER) {
                        fullName = customerRepository.findByUserId(user.getId())
                                .map(c -> c.getFullName())
                                .orElse("");
                    } else if (user.getRole().getName() == ERole.ROLE_ADMIN) {
                        fullName = "Admin Hệ Thống";
                    }
                    return new UserResponseDto(
                            user.getId(),
                            user.getEmail(),
                            user.getRole().getName().name(),
                            user.getStatus(),
                            fullName,
                            user.getCreatedAt()
                    );
                })
                .collect(Collectors.toList());
        return ResponseEntity.ok(users);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateUserRole(@PathVariable Long id, @RequestParam String roleName, java.security.Principal principal) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Lỗi: Không tìm thấy tài khoản với ID " + id));

        if (principal.getName().equals(user.getEmail())) {
            return ResponseEntity.badRequest().body(new MessageResponse("Bạn không thể tự thay đổi hoặc khóa tài khoản của chính mình."));
        }

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

    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateUserStatus(@PathVariable Long id, @RequestParam String status, java.security.Principal principal) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Lỗi: Không tìm thấy tài khoản với ID " + id));

        if (principal.getName().equals(user.getEmail())) {
            return ResponseEntity.badRequest().body(new MessageResponse("Bạn không thể tự thay đổi hoặc khóa tài khoản của chính mình."));
        }

        user.setStatus(status.toUpperCase());
        userRepository.save(user);

        if (user.getRole().getName() == ERole.ROLE_EMPLOYEE) {
            employeeRepository.findByUserId(user.getId()).ifPresent(e -> {
                e.setStatus(status.toUpperCase());
                employeeRepository.save(e);
            });
        } else if (user.getRole().getName() == ERole.ROLE_CUSTOMER) {
            customerRepository.findByUserId(user.getId()).ifPresent(c -> {
                c.setStatus(status.toUpperCase());
                customerRepository.save(c);
            });
        }

        return ResponseEntity.ok(new MessageResponse("Cập nhật trạng thái tài khoản thành công!"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id, java.security.Principal principal) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Lỗi: Không tìm thấy tài khoản với ID " + id));

        if (principal.getName().equals(user.getEmail())) {
            return ResponseEntity.badRequest().body(new MessageResponse("Bạn không thể tự thay đổi hoặc khóa tài khoản của chính mình."));
        }

        // Soft delete user and associated profile
        user.setStatus("INACTIVE");
        userRepository.save(user);

        if (user.getRole().getName() == ERole.ROLE_EMPLOYEE) {
            employeeRepository.findByUserId(user.getId()).ifPresent(e -> {
                e.setStatus("INACTIVE");
                employeeRepository.save(e);
            });
        } else if (user.getRole().getName() == ERole.ROLE_CUSTOMER) {
            customerRepository.findByUserId(user.getId()).ifPresent(c -> {
                c.setStatus("INACTIVE");
                customerRepository.save(c);
            });
        }

        return ResponseEntity.ok(new MessageResponse("Xóa tài khoản thành công!"));
    }
}
