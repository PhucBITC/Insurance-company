package com.insurance.service;

import com.insurance.dto.CustomerRequestDto;
import com.insurance.dto.CustomerResponseDto;
import com.insurance.entity.ERole;
import com.insurance.entity.Customer;
import com.insurance.entity.Role;
import com.insurance.entity.User;
import com.insurance.repository.CustomerRepository;
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
public class CustomerService {

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public List<CustomerResponseDto> getAllCustomers() {
        return customerRepository.findAll().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public CustomerResponseDto getCustomerById(Long id) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Lỗi: Không tìm thấy khách hàng với ID " + id));
        return convertToDto(customer);
    }

    public CustomerResponseDto createCustomer(CustomerRequestDto request) {
        if (customerRepository.existsByCustomerCode(request.getCustomerCode())) {
            throw new RuntimeException("Lỗi: Mã khách hàng '" + request.getCustomerCode() + "' đã được sử dụng!");
        }

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Lỗi: Email '" + request.getEmail() + "' đã được sử dụng cho tài khoản khác!");
        }

        if (request.getIdentityCard() != null && !request.getIdentityCard().trim().isEmpty() &&
                customerRepository.existsByIdentityCard(request.getIdentityCard())) {
            throw new RuntimeException("Lỗi: CMND/CCCD '" + request.getIdentityCard() + "' đã được sử dụng!");
        }

        if (request.getPassword() == null || request.getPassword().trim().isEmpty()) {
            throw new RuntimeException("Lỗi: Mật khẩu là bắt buộc khi tạo tài khoản khách hàng mới!");
        }

        // Create User account
        User user = new User();
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));

        Role role = roleRepository.findByName(ERole.ROLE_CUSTOMER)
                .orElseThrow(() -> new RuntimeException("Lỗi: Vai trò ROLE_CUSTOMER không tồn tại trên hệ thống!"));
        user.setRole(role);

        // Create Customer profile
        Customer customer = new Customer();
        customer.setCustomerCode(request.getCustomerCode());
        customer.setFullName(request.getFullName());
        customer.setPhoneNumber(request.getPhoneNumber());
        customer.setAddress(request.getAddress());
        customer.setDateOfBirth(request.getDateOfBirth());
        customer.setGender(request.getGender());
        customer.setIdentityCard(request.getIdentityCard());
        customer.setUser(user);

        Customer savedCustomer = customerRepository.save(customer);
        return convertToDto(savedCustomer);
    }

    public CustomerResponseDto updateCustomer(Long id, CustomerRequestDto request) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Lỗi: Không tìm thấy khách hàng với ID " + id));

        if (!customer.getCustomerCode().equals(request.getCustomerCode()) &&
                customerRepository.existsByCustomerCode(request.getCustomerCode())) {
            throw new RuntimeException("Lỗi: Mã khách hàng '" + request.getCustomerCode() + "' đã được sử dụng!");
        }

        User user = customer.getUser();
        if (!user.getEmail().equals(request.getEmail()) &&
                userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Lỗi: Email '" + request.getEmail() + "' đã được sử dụng!");
        }

        if (request.getIdentityCard() != null && !request.getIdentityCard().trim().isEmpty() &&
                !request.getIdentityCard().equals(customer.getIdentityCard()) &&
                customerRepository.existsByIdentityCard(request.getIdentityCard())) {
            throw new RuntimeException("Lỗi: CMND/CCCD '" + request.getIdentityCard() + "' đã được sử dụng!");
        }

        // Update User account
        user.setEmail(request.getEmail());
        if (request.getPassword() != null && !request.getPassword().trim().isEmpty()) {
            user.setPassword(passwordEncoder.encode(request.getPassword()));
        }

        // Update Customer profile
        customer.setCustomerCode(request.getCustomerCode());
        customer.setFullName(request.getFullName());
        customer.setPhoneNumber(request.getPhoneNumber());
        customer.setAddress(request.getAddress());
        customer.setDateOfBirth(request.getDateOfBirth());
        customer.setGender(request.getGender());
        customer.setIdentityCard(request.getIdentityCard());

        Customer updatedCustomer = customerRepository.save(customer);
        return convertToDto(updatedCustomer);
    }

    public void deleteCustomer(Long id) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Lỗi: Không tìm thấy khách hàng với ID " + id));

        customer.setStatus("INACTIVE");
        if (customer.getUser() != null) {
            customer.getUser().setStatus("INACTIVE");
        }
        customerRepository.save(customer);
    }

    private CustomerResponseDto convertToDto(Customer customer) {
        return new CustomerResponseDto(
                customer.getId(),
                customer.getCustomerCode(),
                customer.getFullName(),
                customer.getPhoneNumber(),
                customer.getAddress(),
                customer.getDateOfBirth(),
                customer.getGender(),
                customer.getIdentityCard(),
                customer.getUser().getId(),
                customer.getUser().getEmail(),
                customer.getStatus(),
                customer.getCreatedAt(),
                customer.getUpdatedAt()
        );
    }
}
