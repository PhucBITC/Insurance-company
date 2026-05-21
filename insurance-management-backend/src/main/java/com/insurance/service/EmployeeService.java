package com.insurance.service;

import com.insurance.dto.EmployeeRequestDto;
import com.insurance.dto.EmployeeResponseDto;
import com.insurance.entity.ERole;
import com.insurance.entity.Employee;
import com.insurance.entity.Role;
import com.insurance.entity.User;
import com.insurance.repository.EmployeeRepository;
import com.insurance.repository.RoleRepository;
import com.insurance.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class EmployeeService {

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public List<EmployeeResponseDto> getAllEmployees() {
        return employeeRepository.findAll().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public EmployeeResponseDto getEmployeeById(Long id) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Lỗi: Không tìm thấy nhân viên với ID " + id));
        return convertToDto(employee);
    }

    public EmployeeResponseDto createEmployee(EmployeeRequestDto request) {
        if (employeeRepository.existsByEmployeeCode(request.getEmployeeCode())) {
            throw new RuntimeException("Lỗi: Mã nhân viên '" + request.getEmployeeCode() + "' đã được sử dụng!");
        }

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Lỗi: Email '" + request.getEmail() + "' đã được sử dụng cho tài khoản khác!");
        }

        if (request.getPassword() == null || request.getPassword().trim().isEmpty()) {
            throw new RuntimeException("Lỗi: Mật khẩu là bắt buộc khi tạo tài khoản nhân viên mới!");
        }

        // Create User account
        User user = new User();
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));

        Role role = roleRepository.findByName(ERole.ROLE_EMPLOYEE)
                .orElseThrow(() -> new RuntimeException("Lỗi: Vai trò ROLE_EMPLOYEE không tồn tại trên hệ thống!"));
        user.setRole(role);

        // Create Employee profile
        Employee employee = new Employee();
        employee.setEmployeeCode(request.getEmployeeCode());
        employee.setFullName(request.getFullName());
        employee.setPhoneNumber(request.getPhoneNumber());
        employee.setPosition(request.getPosition());
        employee.setDepartment(request.getDepartment());
        employee.setSalary(request.getSalary());
        employee.setHireDate(request.getHireDate());
        employee.setUser(user);

        Employee savedEmployee = employeeRepository.save(employee);
        return convertToDto(savedEmployee);
    }

    public EmployeeResponseDto updateEmployee(Long id, EmployeeRequestDto request) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Lỗi: Không tìm thấy nhân viên với ID " + id));

        if (!employee.getEmployeeCode().equals(request.getEmployeeCode()) &&
                employeeRepository.existsByEmployeeCode(request.getEmployeeCode())) {
            throw new RuntimeException("Lỗi: Mã nhân viên '" + request.getEmployeeCode() + "' đã được sử dụng!");
        }

        User user = employee.getUser();
        if (!user.getEmail().equals(request.getEmail()) &&
                userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Lỗi: Email '" + request.getEmail() + "' đã được sử dụng!");
        }

        // Update User account
        user.setEmail(request.getEmail());
        if (request.getPassword() != null && !request.getPassword().trim().isEmpty()) {
            user.setPassword(passwordEncoder.encode(request.getPassword()));
        }

        // Update Employee profile
        employee.setEmployeeCode(request.getEmployeeCode());
        employee.setFullName(request.getFullName());
        employee.setPhoneNumber(request.getPhoneNumber());
        employee.setPosition(request.getPosition());
        employee.setDepartment(request.getDepartment());
        employee.setSalary(request.getSalary());
        employee.setHireDate(request.getHireDate());

        Employee updatedEmployee = employeeRepository.save(employee);
        return convertToDto(updatedEmployee);
    }

    public void deleteEmployee(Long id) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Lỗi: Không tìm thấy nhân viên với ID " + id));
        
        // Deleting employee will delete user due to CascadeType.ALL on employee.user
        employeeRepository.delete(employee);
    }

    private EmployeeResponseDto convertToDto(Employee employee) {
        return new EmployeeResponseDto(
                employee.getId(),
                employee.getEmployeeCode(),
                employee.getFullName(),
                employee.getPhoneNumber(),
                employee.getPosition(),
                employee.getDepartment(),
                employee.getSalary(),
                employee.getHireDate(),
                employee.getUser().getId(),
                employee.getUser().getEmail(),
                employee.getCreatedAt(),
                employee.getUpdatedAt()
        );
    }
}
