package com.insurance.config;

import com.insurance.entity.*;
import com.insurance.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Component
public class DatabaseSeeder implements CommandLineRunner {

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private InsurancePackageRepository insurancePackageRepository;

    @Autowired
    private CustomerInsuranceRepository customerInsuranceRepository;

    @Autowired
    private CustomerAssignmentRepository customerAssignmentRepository;

    @Autowired
    private IncidentReportRepository incidentReportRepository;

    @Autowired
    private AppointmentRepository appointmentRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        // 1. Seed Roles if empty
        if (roleRepository.count() == 0) {
            roleRepository.save(new Role(null, ERole.ROLE_ADMIN));
            roleRepository.save(new Role(null, ERole.ROLE_EMPLOYEE));
            roleRepository.save(new Role(null, ERole.ROLE_CUSTOMER));
        }

        Role adminRole = roleRepository.findByName(ERole.ROLE_ADMIN)
                .orElseGet(() -> roleRepository.save(new Role(null, ERole.ROLE_ADMIN)));
        Role employeeRole = roleRepository.findByName(ERole.ROLE_EMPLOYEE)
                .orElseGet(() -> roleRepository.save(new Role(null, ERole.ROLE_EMPLOYEE)));
        Role customerRole = roleRepository.findByName(ERole.ROLE_CUSTOMER)
                .orElseGet(() -> roleRepository.save(new Role(null, ERole.ROLE_CUSTOMER)));

        // 2. Seed Users
        // Admin
        User adminUser = userRepository.findByEmail("admin@insurance.com").orElse(null);
        if (adminUser == null) {
            adminUser = new User();
            adminUser.setEmail("admin@insurance.com");
            adminUser.setPassword(passwordEncoder.encode("123456"));
            adminUser.setRole(adminRole);
            adminUser.setStatus("ACTIVE");
            adminUser = userRepository.save(adminUser);
        }

        // Employee
        User employeeUser = userRepository.findByEmail("employee@insurance.com").orElse(null);
        if (employeeUser == null) {
            employeeUser = new User();
            employeeUser.setEmail("employee@insurance.com");
            employeeUser.setPassword(passwordEncoder.encode("123456"));
            employeeUser.setRole(employeeRole);
            employeeUser.setStatus("ACTIVE");
            employeeUser = userRepository.save(employeeUser);
        }

        Employee employee = employeeRepository.findByUserId(employeeUser.getId()).orElse(null);
        if (employee == null) {
            employee = new Employee();
            employee.setEmployeeCode("EMP-001");
            employee.setFullName("Nguyễn Văn Nhân Viên");
            employee.setPhoneNumber("0912345678");
            employee.setPosition("Tư vấn viên");
            employee.setDepartment("Tư vấn bảo hiểm");
            employee.setSalary(15000000.0);
            employee.setHireDate(LocalDate.now().minusYears(1));
            employee.setUser(employeeUser);
            employee.setStatus("ACTIVE");
            employee = employeeRepository.save(employee);
        }

        // Customer (customers@gmail.com)
        User customerUser = userRepository.findByEmail("customers@gmail.com").orElse(null);
        if (customerUser == null) {
            customerUser = new User();
            customerUser.setEmail("customers@gmail.com");
            customerUser.setPassword(passwordEncoder.encode("123456"));
            customerUser.setRole(customerRole);
            customerUser.setStatus("ACTIVE");
            customerUser = userRepository.save(customerUser);
        }

        Customer customer = customerRepository.findByUserId(customerUser.getId()).orElse(null);
        if (customer == null) {
            customer = new Customer();
            customer.setCustomerCode("CUS-001");
            customer.setFullName("Trần Thị Khách Hàng");
            customer.setPhoneNumber("0987654321");
            customer.setAddress("123 Đường Lê Lợi, Quận 1, TP. Hồ Chí Minh");
            customer.setIdentityCard("123456789");
            customer.setGender("Nữ");
            customer.setDateOfBirth(LocalDate.of(1995, 10, 15));
            customer.setUser(customerUser);
            customer.setStatus("ACTIVE");
            customer = customerRepository.save(customer);
        }

        // 3. Seed Insurance Packages
        InsurancePackage pkgHealth = null;
        InsurancePackage pkgVehicle = null;
        InsurancePackage pkgHome = null;

        if (!insurancePackageRepository.existsByPackageCode("PKG-HEALTH-GOLD")) {
            pkgHealth = new InsurancePackage();
            pkgHealth.setPackageCode("PKG-HEALTH-GOLD");
            pkgHealth.setName("Bảo hiểm Sức khỏe Toàn diện Gold");
            pkgHealth.setType("HEALTH");
            pkgHealth.setDescription("Chăm sóc sức khỏe nội trú, ngoại trú, hỗ trợ tiền giường bệnh và chi phí phẫu thuật tại các bệnh viện liên kết quốc tế.");
            pkgHealth.setPrice(3500000.0);
            pkgHealth.setDurationMonths(12);
            pkgHealth.setMaxBenefit(500000000.0);
            pkgHealth.setConditions("Công dân Việt Nam tuổi từ 1 đến 65, không mắc bệnh hiểm nghèo trước khi tham gia.");
            pkgHealth.setStatus("ACTIVE");
            pkgHealth = insurancePackageRepository.save(pkgHealth);
        } else {
            pkgHealth = insurancePackageRepository.findByPackageCode("PKG-HEALTH-GOLD").orElse(null);
        }

        if (!insurancePackageRepository.existsByPackageCode("PKG-VEHICLE-CAR")) {
            pkgVehicle = new InsurancePackage();
            pkgVehicle.setPackageCode("PKG-VEHICLE-CAR");
            pkgVehicle.setName("Bảo hiểm Ô tô Thân vỏ Bạc");
            pkgVehicle.setType("VEHICLE");
            pkgVehicle.setDescription("Bồi thường các thiệt hại vật chất xe do tai nạn, va quẹt, cháy nổ, thiên tai hoặc mất cắp bộ phận.");
            pkgVehicle.setPrice(8500000.0);
            pkgVehicle.setDurationMonths(12);
            pkgVehicle.setMaxBenefit(1200000000.0);
            pkgVehicle.setConditions("Xe ô tô sử dụng cho mục đích cá nhân, niên hạn sử dụng dưới 10 năm.");
            pkgVehicle.setStatus("ACTIVE");
            pkgVehicle = insurancePackageRepository.save(pkgVehicle);
        } else {
            pkgVehicle = insurancePackageRepository.findByPackageCode("PKG-VEHICLE-CAR").orElse(null);
        }

        if (!insurancePackageRepository.existsByPackageCode("PKG-LIFE-SECURE")) {
            InsurancePackage pkgLife = new InsurancePackage();
            pkgLife.setPackageCode("PKG-LIFE-SECURE");
            pkgLife.setName("Bảo hiểm An sinh Giáo dục");
            pkgLife.setType("LIFE");
            pkgLife.setDescription("Tích lũy tài chính vững chắc cho tương lai học tập của con trẻ, đi kèm quyền lợi bảo vệ trước các rủi ro sức khỏe.");
            pkgLife.setPrice(15000000.0);
            pkgLife.setDurationMonths(60);
            pkgLife.setMaxBenefit(2000000000.0);
            pkgLife.setConditions("Người được bảo hiểm từ 0 đến 15 tuổi, người mua bảo hiểm từ 18 đến 55 tuổi.");
            pkgLife.setStatus("ACTIVE");
            insurancePackageRepository.save(pkgLife);
        }

        if (!insurancePackageRepository.existsByPackageCode("PKG-HOME-SAFE")) {
            pkgHome = new InsurancePackage();
            pkgHome.setPackageCode("PKG-HOME-SAFE");
            pkgHome.setName("Bảo hiểm Nhà tư nhân Gia An");
            pkgHome.setType("PROPERTY");
            pkgHome.setDescription("Bảo vệ ngôi nhà và tài sản bên trong trước các rủi ro hỏa hoạn, sét đánh, nổ, giông bão, lũ lụt và trộm cướp.");
            pkgHome.setPrice(1200000.0);
            pkgHome.setDurationMonths(12);
            pkgHome.setMaxBenefit(3000000000.0);
            pkgHome.setConditions("Nhà chung cư hoặc nhà mặt đất kiên cố được xây dựng bằng vật liệu khó cháy.");
            pkgHome.setStatus("ACTIVE");
            pkgHome = insurancePackageRepository.save(pkgHome);
        } else {
            pkgHome = insurancePackageRepository.findByPackageCode("PKG-HOME-SAFE").orElse(null);
        }

        // 4. Seed Customer Assignments
        if (!customerAssignmentRepository.existsByEmployeeIdAndCustomerId(employee.getId(), customer.getId())) {
            CustomerAssignment assignment = new CustomerAssignment();
            assignment.setCustomer(customer);
            assignment.setEmployee(employee);
            customerAssignmentRepository.save(assignment);
        }

        // 5. Seed Customer Insurances (Contracts)
        CustomerInsurance contractHealth = null;
        if (!customerInsuranceRepository.existsByContractCode("HD-HEALTH-88992")) {
            if (pkgHealth != null) {
                contractHealth = new CustomerInsurance();
                contractHealth.setCustomer(customer);
                contractHealth.setInsurancePackage(pkgHealth);
                contractHealth.setStartDate(LocalDate.now().minusMonths(3));
                contractHealth.setEndDate(LocalDate.now().plusMonths(9));
                contractHealth.setPrice(pkgHealth.getPrice());
                contractHealth.setStatus("APPROVED");
                contractHealth.setContractCode("HD-HEALTH-88992");
                contractHealth = customerInsuranceRepository.save(contractHealth);
            }
        } else {
            if (pkgHealth != null) {
                List<CustomerInsurance> healthInsurances = customerInsuranceRepository.findByCustomerIdAndDeletedByCustomerFalseOrderByCreatedAtDesc(customer.getId());
                for (CustomerInsurance ci : healthInsurances) {
                    if (ci.getInsurancePackage().getId().equals(pkgHealth.getId()) && "HD-HEALTH-88992".equals(ci.getContractCode())) {
                        contractHealth = ci;
                        break;
                    }
                }
            }
        }

        final InsurancePackage finalPkgVehicle = pkgVehicle;
        boolean hasPendingVehicle = false;
        if (finalPkgVehicle != null) {
            hasPendingVehicle = customerInsuranceRepository.findByCustomerIdAndStatusOrderByCreatedAtDesc(customer.getId(), "PENDING").stream()
                    .anyMatch(ci -> ci.getInsurancePackage().getId().equals(finalPkgVehicle.getId()));
        }
        if (!hasPendingVehicle && pkgVehicle != null) {
            CustomerInsurance contractVehicle = new CustomerInsurance();
            contractVehicle.setCustomer(customer);
            contractVehicle.setInsurancePackage(pkgVehicle);
            contractVehicle.setPrice(pkgVehicle.getPrice());
            contractVehicle.setStatus("PENDING");
            customerInsuranceRepository.save(contractVehicle);
        }

        final InsurancePackage finalPkgHome = pkgHome;
        boolean hasRejectedHome = false;
        if (finalPkgHome != null) {
            hasRejectedHome = customerInsuranceRepository.findByCustomerIdAndStatusOrderByCreatedAtDesc(customer.getId(), "REJECTED").stream()
                    .anyMatch(ci -> ci.getInsurancePackage().getId().equals(finalPkgHome.getId()));
        }
        if (!hasRejectedHome && pkgHome != null) {
            CustomerInsurance contractHome = new CustomerInsurance();
            contractHome.setCustomer(customer);
            contractHome.setInsurancePackage(pkgHome);
            contractHome.setPrice(pkgHome.getPrice());
            contractHome.setStatus("REJECTED");
            contractHome.setRejectReason("Không đủ điều kiện về kết cấu nhà (nhà gỗ tạm bợ, nguy cơ cháy nổ cao).");
            customerInsuranceRepository.save(contractHome);
        }

        // 6. Seed Incident Reports
        if (!incidentReportRepository.existsByReportCode("SC-2026-001")) {
            IncidentReport report1 = new IncidentReport();
            report1.setReportCode("SC-2026-001");
            report1.setCustomer(customer);
            report1.setCustomerInsurance(contractHealth);
            report1.setTitle("Yêu cầu thanh toán chi phí nằm viện do sốt xuất huyết");
            report1.setDescription("Khách hàng nhập viện tại Bệnh viện Hoàn Mỹ từ ngày 15/02/2026 đến ngày 20/02/2026 điều trị sốt xuất huyết. Tổng chi phí thực tế điều trị là 5.200.000đ.");
            report1.setClaimAmount(5200000.0);
            report1.setIncidentDate(LocalDate.of(2026, 2, 15));
            report1.setStatus("RESOLVED");
            report1.setHandlerEmployee(employee);
            incidentReportRepository.save(report1);
        }

        if (!incidentReportRepository.existsByReportCode("SC-2026-002")) {
            IncidentReport report2 = new IncidentReport();
            report2.setReportCode("SC-2026-002");
            report2.setCustomer(customer);
            report2.setCustomerInsurance(contractHealth);
            report2.setTitle("Báo cáo tai nạn trượt ngã rạn xương cổ tay");
            report2.setDescription("Khách hàng bị trượt ngã tại nhà riêng dẫn đến rạn xương cổ tay phải, đang bó bột điều trị ngoại trú tại Bệnh viện Chấn thương chỉnh hình.");
            report2.setClaimAmount(2500000.0);
            report2.setIncidentDate(LocalDate.now().minusDays(7));
            report2.setStatus("PROCESSING");
            report2.setHandlerEmployee(employee);
            incidentReportRepository.save(report2);
        }

        // 7. Seed Appointments
        boolean hasApp1 = appointmentRepository.findAll().stream().anyMatch(a -> "Tư vấn mua thêm gói bảo hiểm ô tô thân vỏ".equals(a.getTitle()));
        if (!hasApp1) {
            Appointment app1 = new Appointment();
            app1.setCustomer(customer);
            app1.setEmployee(employee);
            app1.setAppointmentDate(LocalDate.now().plusDays(3));
            app1.setAppointmentTime("14:00");
            app1.setConsultationType("ONLINE");
            app1.setTitle("Tư vấn mua thêm gói bảo hiểm ô tô thân vỏ");
            app1.setNotes("Khách hàng muốn tham khảo thêm chi phí bồi thường mất cắp gương chiếu hậu.");
            app1.setStatus("APPROVED");
            appointmentRepository.save(app1);
        }

        boolean hasApp2 = appointmentRepository.findAll().stream().anyMatch(a -> "Giải đáp điều khoản miễn trừ bồi thường sức khỏe".equals(a.getTitle()));
        if (!hasApp2) {
            Appointment app2 = new Appointment();
            app2.setCustomer(customer);
            app2.setEmployee(employee);
            app2.setAppointmentDate(LocalDate.now().plusDays(8));
            app2.setAppointmentTime("09:30");
            app2.setConsultationType("OFFLINE");
            app2.setTitle("Giải đáp điều khoản miễn trừ bồi thường sức khỏe");
            app2.setNotes("Lịch hẹn trực tiếp tại văn phòng đại diện để đối chiếu hồ sơ bệnh án cũ.");
            app2.setStatus("PENDING");
            appointmentRepository.save(app2);
        }
    }
}
