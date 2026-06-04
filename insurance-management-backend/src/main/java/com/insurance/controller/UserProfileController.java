package com.insurance.controller;

import com.insurance.entity.*;
import com.insurance.repository.*;
import com.insurance.security.UserDetailsImpl;
import com.insurance.dto.MessageResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.*;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/profile")
public class UserProfileController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @GetMapping
    public ResponseEntity<?> getProfile(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        if (userDetails == null) {
            return ResponseEntity.badRequest().body(new MessageResponse("Lỗi: Không tìm thấy phiên đăng nhập!"));
        }

        User user = userRepository.findById(userDetails.getId()).orElse(null);
        if (user == null) {
            return ResponseEntity.badRequest().body(new MessageResponse("Lỗi: Người dùng không tồn tại!"));
        }

        Map<String, Object> profile = new HashMap<>();
        profile.put("id", user.getId());
        profile.put("email", user.getEmail());
        profile.put("role", user.getRole().getName().toString());

        if ("ROLE_EMPLOYEE".equals(user.getRole().getName().toString())) {
            Employee employee = employeeRepository.findByUserId(user.getId()).orElse(null);
            if (employee != null) {
                profile.put("employeeCode", employee.getEmployeeCode());
                profile.put("fullName", employee.getFullName());
                profile.put("phoneNumber", employee.getPhoneNumber());
                profile.put("position", employee.getPosition());
                profile.put("department", employee.getDepartment());
                profile.put("salary", employee.getSalary());
                profile.put("hireDate", employee.getHireDate() != null ? employee.getHireDate().toString() : null);
            }
        } else if ("ROLE_CUSTOMER".equals(user.getRole().getName().toString())) {
            Customer customer = customerRepository.findByUserId(user.getId()).orElse(null);
            if (customer != null) {
                profile.put("customerCode", customer.getCustomerCode());
                profile.put("fullName", customer.getFullName());
                profile.put("phoneNumber", customer.getPhoneNumber());
                profile.put("address", customer.getAddress());
                profile.put("dateOfBirth", customer.getDateOfBirth() != null ? customer.getDateOfBirth().toString() : null);
                profile.put("gender", customer.getGender());
                profile.put("identityCard", customer.getIdentityCard());
            }
        }

        return ResponseEntity.ok(profile);
    }

    @PutMapping
    public ResponseEntity<?> updateProfile(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @RequestBody Map<String, Object> request) {
        
        if (userDetails == null) {
            return ResponseEntity.badRequest().body(new MessageResponse("Lỗi: Không tìm thấy phiên đăng nhập!"));
        }

        User user = userRepository.findById(userDetails.getId()).orElse(null);
        if (user == null) {
            return ResponseEntity.badRequest().body(new MessageResponse("Lỗi: Người dùng không tồn tại!"));
        }

        String role = user.getRole().getName().toString();

        if ("ROLE_ADMIN".equals(role)) {
            return ResponseEntity.ok(new MessageResponse("Thông tin tài khoản quản trị đã được lưu."));
        } else if ("ROLE_EMPLOYEE".equals(role)) {
            Employee employee = employeeRepository.findByUserId(user.getId()).orElse(null);
            if (employee == null) {
                return ResponseEntity.badRequest().body(new MessageResponse("Lỗi: Không tìm thấy hồ sơ nhân viên!"));
            }

            String fullName = (String) request.get("fullName");
            String phoneNumber = (String) request.get("phoneNumber");

            if (fullName == null || fullName.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(new MessageResponse("Lỗi: Họ và tên không được để trống!"));
            }
            if (fullName.trim().length() < 2) {
                return ResponseEntity.badRequest().body(new MessageResponse("Lỗi: Họ và tên phải có ít nhất 2 ký tự!"));
            }

            if (phoneNumber == null || phoneNumber.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(new MessageResponse("Lỗi: Số điện thoại không được để trống!"));
            }
            if (!phoneNumber.trim().matches("^(0[3|5|7|8|9])[0-9]{8}$")) {
                return ResponseEntity.badRequest().body(new MessageResponse("Lỗi: Số điện thoại phải gồm 10 chữ số và bắt đầu bằng 03/05/07/08/09!"));
            }

            employee.setFullName(fullName.trim());
            employee.setPhoneNumber(phoneNumber.trim());
            employeeRepository.save(employee);

            return ResponseEntity.ok(new MessageResponse("Cập nhật thông tin nhân viên thành công!"));
        } else if ("ROLE_CUSTOMER".equals(role)) {
            Customer customer = customerRepository.findByUserId(user.getId()).orElse(null);
            if (customer == null) {
                return ResponseEntity.badRequest().body(new MessageResponse("Lỗi: Không tìm thấy hồ sơ khách hàng!"));
            }

            String fullName = (String) request.get("fullName");
            String phoneNumber = (String) request.get("phoneNumber");
            String address = (String) request.get("address");
            String dateOfBirthStr = (String) request.get("dateOfBirth");
            String gender = (String) request.get("gender");
            String identityCard = (String) request.get("identityCard");

            if (fullName == null || fullName.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(new MessageResponse("Lỗi: Họ và tên không được để trống!"));
            }
            if (fullName.trim().length() < 2) {
                return ResponseEntity.badRequest().body(new MessageResponse("Lỗi: Họ và tên phải có ít nhất 2 ký tự!"));
            }

            if (phoneNumber == null || phoneNumber.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(new MessageResponse("Lỗi: Số điện thoại không được để trống!"));
            }
            if (!phoneNumber.trim().matches("^(0[3|5|7|8|9])[0-9]{8}$")) {
                return ResponseEntity.badRequest().body(new MessageResponse("Lỗi: Số điện thoại không hợp lệ!"));
            }

            if (identityCard == null || identityCard.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(new MessageResponse("Lỗi: Số CMND/CCCD không được để trống!"));
            }
            if (!identityCard.trim().matches("^[0-9]{9}$|^[0-9]{12}$")) {
                return ResponseEntity.badRequest().body(new MessageResponse("Lỗi: Số CMND/CCCD không hợp lệ!"));
            }
            if (!identityCard.equals(customer.getIdentityCard()) && customerRepository.existsByIdentityCard(identityCard)) {
                return ResponseEntity.badRequest().body(new MessageResponse("Lỗi: Số CMND/CCCD đã được sử dụng bởi khách hàng khác!"));
            }

            if (address == null || address.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(new MessageResponse("Lỗi: Địa chỉ không được để trống!"));
            }
            if (address.trim().length() < 5) {
                return ResponseEntity.badRequest().body(new MessageResponse("Lỗi: Địa chỉ phải dài ít nhất 5 ký tự!"));
            }

            if (dateOfBirthStr == null || dateOfBirthStr.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(new MessageResponse("Lỗi: Ngày sinh không được để trống!"));
            }
            LocalDate dob = LocalDate.parse(dateOfBirthStr);
            if (dob.isAfter(LocalDate.now())) {
                return ResponseEntity.badRequest().body(new MessageResponse("Lỗi: Ngày sinh không hợp lệ!"));
            }

            customer.setFullName(fullName.trim());
            customer.setPhoneNumber(phoneNumber.trim());
            customer.setAddress(address.trim());
            customer.setDateOfBirth(dob);
            customer.setGender(gender != null ? gender.trim() : "Khác");
            customer.setIdentityCard(identityCard.trim());

            customerRepository.save(customer);
            return ResponseEntity.ok(new MessageResponse("Cập nhật thông tin khách hàng thành công!"));
        }

        return ResponseEntity.badRequest().body(new MessageResponse("Lỗi: Vai trò không được hỗ trợ!"));
    }

    @PostMapping("/change-password")
    public ResponseEntity<?> changePassword(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @RequestBody Map<String, String> request) {

        if (userDetails == null) {
            return ResponseEntity.badRequest().body(new MessageResponse("Lỗi: Không tìm thấy phiên đăng nhập!"));
        }

        User user = userRepository.findById(userDetails.getId()).orElse(null);
        if (user == null) {
            return ResponseEntity.badRequest().body(new MessageResponse("Lỗi: Người dùng không tồn tại!"));
        }

        String oldPassword = request.get("oldPassword");
        String newPassword = request.get("newPassword");

        if (oldPassword == null || oldPassword.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(new MessageResponse("Lỗi: Mật khẩu cũ không được để trống!"));
        }

        if (newPassword == null || newPassword.trim().length() < 6) {
            return ResponseEntity.badRequest().body(new MessageResponse("Lỗi: Mật khẩu mới phải có ít nhất 6 ký tự!"));
        }

        if (!passwordEncoder.matches(oldPassword, user.getPassword())) {
            return ResponseEntity.badRequest().body(new MessageResponse("Lỗi: Mật khẩu cũ không chính xác!"));
        }

        if (passwordEncoder.matches(newPassword, user.getPassword())) {
            return ResponseEntity.badRequest().body(new MessageResponse("Lỗi: Mật khẩu mới không được trùng với mật khẩu hiện tại!"));
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        return ResponseEntity.ok(new MessageResponse("Thay đổi mật khẩu thành công!"));
    }
}
