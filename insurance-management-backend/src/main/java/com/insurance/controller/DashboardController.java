package com.insurance.controller;

import com.insurance.entity.*;
import com.insurance.repository.*;
import com.insurance.security.UserDetailsImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.TemporalAdjusters;
import java.util.*;
import java.util.stream.Collectors;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api")
public class DashboardController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private InsurancePackageRepository insurancePackageRepository;

    @Autowired
    private CustomerInsuranceRepository customerInsuranceRepository;

    @Autowired
    private CustomerAssignmentRepository customerAssignmentRepository;

    @Autowired
    private IncidentReportRepository incidentReportRepository;

    // --- ADMIN DASHBOARD ---

    @GetMapping("/admin/dashboard")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getAdminDashboard() {
        Map<String, Object> data = new HashMap<>();

        // 1. KPIs
        long totalUsers = userRepository.count();
        long activePackages = insurancePackageRepository.countByStatus("ACTIVE");
        long totalAssignments = customerAssignmentRepository.count();
        long pendingIncidents = incidentReportRepository.countByStatus("NEW");

        data.put("totalUsers", totalUsers);
        data.put("activePackages", activePackages);
        data.put("totalAssignments", totalAssignments);
        data.put("pendingIncidents", pendingIncidents);

        // 2. Chart Data: Last 6 months trend of subscriptions & revenue
        List<Map<String, Object>> chartData = new ArrayList<>();
        LocalDate today = LocalDate.now();
        List<CustomerInsurance> approvedInsurances = customerInsuranceRepository.findAll();

        for (int i = 5; i >= 0; i--) {
            LocalDate targetDate = today.minusMonths(i);
            int year = targetDate.getYear();
            int month = targetDate.getMonthValue();
            String monthName = "T" + month;

            // Filter approved insurances for this specific month/year
            List<CustomerInsurance> monthContracts = approvedInsurances.stream()
                    .filter(ci -> "APPROVED".equals(ci.getStatus()))
                    .filter(ci -> ci.getCreatedAt() != null && 
                            ci.getCreatedAt().getYear() == year && 
                            ci.getCreatedAt().getMonthValue() == month)
                    .collect(Collectors.toList());

            long subscriptions = monthContracts.size();
            double revenue = monthContracts.stream().mapToDouble(CustomerInsurance::getPrice).sum();

            Map<String, Object> monthData = new HashMap<>();
            monthData.put("name", monthName);
            monthData.put("subscriptions", subscriptions);
            monthData.put("revenue", revenue);
            chartData.add(monthData);
        }
        data.put("chartData", chartData);

        // 3. Dynamic Activity Logs
        List<Map<String, Object>> logs = new ArrayList<>();

        // A. Recent customer signups
        List<Customer> recentCustomers = customerRepository.findAll().stream()
                .filter(c -> c.getCreatedAt() != null)
                .sorted(Comparator.comparing(Customer::getCreatedAt).reversed())
                .limit(4)
                .collect(Collectors.toList());
        for (Customer c : recentCustomers) {
            Map<String, Object> log = new HashMap<>();
            log.put("id", "cust-" + c.getId());
            log.put("action", "Đăng ký tài khoản khách hàng mới: " + c.getFullName());
            log.put("user", c.getUser() != null ? c.getUser().getEmail() : "customer@insurance.com");
            log.put("role", "ROLE_CUSTOMER");
            log.put("time", formatRelativeTime(c.getCreatedAt()));
            log.put("timestamp", c.getCreatedAt());
            log.put("status", "SUCCESS");
            logs.add(log);
        }

        // B. Recent incident reports
        List<IncidentReport> recentIncidents = incidentReportRepository.findAll().stream()
                .filter(ir -> ir.getCreatedAt() != null)
                .sorted(Comparator.comparing(IncidentReport::getCreatedAt).reversed())
                .limit(4)
                .collect(Collectors.toList());
        for (IncidentReport ir : recentIncidents) {
            Map<String, Object> log = new HashMap<>();
            log.put("id", "inc-" + ir.getId());
            String actionPrefix = "NEW".equals(ir.getStatus()) ? "Khai báo sự cố bảo hiểm: " : "Cập nhật trạng thái sự cố: ";
            log.put("action", actionPrefix + ir.getTitle() + " (#" + ir.getReportCode() + ")");
            log.put("user", ir.getCustomer() != null && ir.getCustomer().getUser() != null ? ir.getCustomer().getUser().getEmail() : "customer@insurance.com");
            log.put("role", "ROLE_CUSTOMER");
            log.put("time", formatRelativeTime(ir.getCreatedAt()));
            log.put("timestamp", ir.getCreatedAt());
            log.put("status", "NEW".equals(ir.getStatus()) ? "WARNING" : "SUCCESS");
            logs.add(log);
        }

        // C. Recent insurance purchases / approvals
        List<CustomerInsurance> recentContracts = customerInsuranceRepository.findAll().stream()
                .filter(ci -> ci.getCreatedAt() != null)
                .sorted(Comparator.comparing(CustomerInsurance::getCreatedAt).reversed())
                .limit(4)
                .collect(Collectors.toList());
        for (CustomerInsurance ci : recentContracts) {
            Map<String, Object> log = new HashMap<>();
            log.put("id", "contract-" + ci.getId());
            String action = "APPROVED".equals(ci.getStatus()) 
                    ? "Phê duyệt hợp đồng bảo hiểm: " + ci.getInsurancePackage().getName() + " (#" + ci.getContractCode() + ")"
                    : "Khách hàng đăng ký gói bảo hiểm: " + ci.getInsurancePackage().getName();
            log.put("action", action);
            log.put("user", ci.getCustomer() != null && ci.getCustomer().getUser() != null ? ci.getCustomer().getUser().getEmail() : "customer@insurance.com");
            log.put("role", "APPROVED".equals(ci.getStatus()) ? "ROLE_ADMIN" : "ROLE_CUSTOMER");
            log.put("time", formatRelativeTime(ci.getCreatedAt()));
            log.put("timestamp", ci.getCreatedAt());
            log.put("status", "APPROVED".equals(ci.getStatus()) ? "SUCCESS" : "WARNING");
            logs.add(log);
        }

        // Sort all logs by timestamp descending
        List<Map<String, Object>> sortedLogs = logs.stream()
                .sorted((a, b) -> ((LocalDateTime) b.get("timestamp")).compareTo((LocalDateTime) a.get("timestamp")))
                .limit(6)
                .map(log -> {
                    log.remove("timestamp");
                    return log;
                })
                .collect(Collectors.toList());

        data.put("logs", sortedLogs);

        return ResponseEntity.ok(data);
    }

    // --- EMPLOYEE DASHBOARD ---

    @GetMapping("/employee/dashboard")
    @PreAuthorize("hasRole('EMPLOYEE')")
    public ResponseEntity<?> getEmployeeDashboard(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        Map<String, Object> data = new HashMap<>();

        // Find Employee profile
        Employee employee = employeeRepository.findByUserId(userDetails.getId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy thông tin nhân viên!"));

        // 1. KPIs
        List<CustomerAssignment> assignments = customerAssignmentRepository.findByEmployeeId(employee.getId());
        long assignedCustomersCount = assignments.size();
        long pendingIncidentsCount = incidentReportRepository.countByHandlerEmployeeIdAndStatusIn(employee.getId(), Arrays.asList("NEW", "PROCESSING"));
        long resolvedIncidentsCount = incidentReportRepository.countByHandlerEmployeeIdAndStatus(employee.getId(), "RESOLVED");

        data.put("assignedCustomersCount", assignedCustomersCount);
        data.put("pendingIncidentsCount", pendingIncidentsCount);
        data.put("resolvedIncidentsCount", resolvedIncidentsCount);
        data.put("consultations", 3); // Simulated consultations count

        // 2. Incident Processing Performance Chart (Weekly)
        List<Map<String, Object>> incidentStats = new ArrayList<>();
        List<IncidentReport> employeeIncidents = incidentReportRepository.findByHandlerEmployeeIdOrderByCreatedAtDesc(employee.getId());

        String[] daysOfWeek = {"Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "Chủ Nhật"};
        LocalDate now = LocalDate.now();
        LocalDate startOfWeek = now.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));

        for (int i = 0; i < 6; i++) { // Monday to Saturday
            LocalDate targetDay = startOfWeek.plusDays(i);
            String dayName = daysOfWeek[i];

            List<IncidentReport> dayReports = employeeIncidents.stream()
                    .filter(ir -> ir.getCreatedAt() != null && ir.getCreatedAt().toLocalDate().isEqual(targetDay))
                    .collect(Collectors.toList());

            long resolved = dayReports.stream().filter(ir -> "RESOLVED".equals(ir.getStatus())).count();
            long processing = dayReports.stream().filter(ir -> "PROCESSING".equals(ir.getStatus())).count();
            long pending = dayReports.stream().filter(ir -> "NEW".equals(ir.getStatus())).count();

            // Default to mock data if there are no reports at all, to keep the chart beautiful for demo
            if (employeeIncidents.isEmpty()) {
                // Return dynamic simulated look
                Map<String, Object> dayStat = new HashMap<>();
                dayStat.put("name", dayName);
                dayStat.put("resolved", i + 1);
                dayStat.put("processing", (i % 2) + 1);
                dayStat.put("pending", i == 2 || i == 4 ? 1 : 0);
                incidentStats.add(dayStat);
            } else {
                Map<String, Object> dayStat = new HashMap<>();
                dayStat.put("name", dayName);
                dayStat.put("resolved", resolved);
                dayStat.put("processing", processing);
                dayStat.put("pending", pending);
                incidentStats.add(dayStat);
            }
        }
        data.put("incidentStats", incidentStats);

        // 3. Assigned Customers Table
        List<Map<String, Object>> customerList = new ArrayList<>();
        for (CustomerAssignment ca : assignments) {
            Customer customer = ca.getCustomer();
            Map<String, Object> customerData = new HashMap<>();
            customerData.put("id", customer.getId());
            customerData.put("name", customer.getFullName());
            customerData.put("email", customer.getUser() != null ? customer.getUser().getEmail() : "---");

            // Find newest active/pending contract
            List<CustomerInsurance> customerInsurances = customerInsuranceRepository.findByCustomerIdAndDeletedByCustomerFalseOrderByCreatedAtDesc(customer.getId());
            Optional<CustomerInsurance> activeContract = customerInsurances.stream()
                    .filter(ci -> "APPROVED".equals(ci.getStatus()))
                    .findFirst();

            if (activeContract.isPresent()) {
                customerData.put("package", activeContract.get().getInsurancePackage().getName());
                customerData.put("date", activeContract.get().getStartDate() != null ? 
                        activeContract.get().getStartDate().format(DateTimeFormatter.ofPattern("dd/MM/yyyy")) : "---");
                customerData.put("status", "ACTIVE"); // Map APPROVED to ACTIVE for frontend badge
            } else {
                Optional<CustomerInsurance> pendingContract = customerInsurances.stream()
                        .filter(ci -> "PENDING".equals(ci.getStatus()))
                        .findFirst();
                if (pendingContract.isPresent()) {
                    customerData.put("package", pendingContract.get().getInsurancePackage().getName());
                    customerData.put("date", "Đang chờ duyệt");
                    customerData.put("status", "PROCESSING");
                } else {
                    customerData.put("package", "Chưa tham gia");
                    customerData.put("date", "Chưa thiết lập");
                    customerData.put("status", "PENDING");
                }
            }
            customerList.add(customerData);
        }
        data.put("customers", customerList);

        return ResponseEntity.ok(data);
    }

    // --- CUSTOMER DASHBOARD ---

    @GetMapping("/customer/dashboard")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<?> getCustomerDashboard(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        Map<String, Object> data = new HashMap<>();

        // Find Customer profile
        Customer customer = customerRepository.findByUserId(userDetails.getId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy hồ sơ khách hàng!"));

        // 1. KPIs & Contracts
        long activePoliciesCount = customerInsuranceRepository.countByCustomerIdAndStatus(customer.getId(), "APPROVED");
        long totalIncidentsCount = incidentReportRepository.countByCustomerId(customer.getId());

        data.put("activePoliciesCount", activePoliciesCount);
        data.put("totalIncidentsCount", totalIncidentsCount);

        // Find latest approved contract
        List<CustomerInsurance> approvedContracts = customerInsuranceRepository.findByCustomerIdAndStatusOrderByCreatedAtDesc(customer.getId(), "APPROVED");
        
        if (!approvedContracts.isEmpty()) {
            CustomerInsurance latest = approvedContracts.get(0);
            Map<String, Object> contractDetails = new HashMap<>();
            contractDetails.put("hasContract", true);
            contractDetails.put("contractCode", latest.getContractCode());
            contractDetails.put("packageName", latest.getInsurancePackage().getName());
            contractDetails.put("startDate", latest.getStartDate() != null ? latest.getStartDate().toString() : "---");
            contractDetails.put("endDate", latest.getEndDate() != null ? latest.getEndDate().toString() : "---");
            contractDetails.put("limit", latest.getInsurancePackage().getMaxBenefit());
            contractDetails.put("price", latest.getPrice());
            data.put("latestContract", contractDetails);

            data.put("nextPaymentDate", latest.getEndDate() != null ? 
                    latest.getEndDate().format(DateTimeFormatter.ofPattern("dd/MM/yyyy")) : "---");
        } else {
            Map<String, Object> contractDetails = new HashMap<>();
            contractDetails.put("hasContract", false);
            data.put("latestContract", contractDetails);
            data.put("nextPaymentDate", "Chưa có hợp đồng");
        }

        // 2. Consultant / Assigned Support Employee
        Optional<CustomerAssignment> assignment = customerAssignmentRepository.findByCustomerId(customer.getId());
        if (assignment.isPresent()) {
            Employee employee = assignment.get().getEmployee();
            Map<String, Object> consultantDetails = new HashMap<>();
            consultantDetails.put("hasConsultant", true);
            consultantDetails.put("fullName", employee.getFullName());
            consultantDetails.put("email", employee.getUser() != null ? employee.getUser().getEmail() : "employee@insurance.com");
            consultantDetails.put("employeeCode", employee.getEmployeeCode());
            consultantDetails.put("phone", employee.getPhoneNumber() != null ? employee.getPhoneNumber() : "---");
            data.put("consultant", consultantDetails);
        } else {
            Map<String, Object> consultantDetails = new HashMap<>();
            consultantDetails.put("hasConsultant", false);
            data.put("consultant", consultantDetails);
        }

        return ResponseEntity.ok(data);
    }

    // --- HELPER FUNCTION ---

    private String formatRelativeTime(LocalDateTime dt) {
        if (dt == null) return "Vừa xong";
        LocalDateTime now = LocalDateTime.now();
        java.time.Duration duration = java.time.Duration.between(dt, now);
        long seconds = duration.getSeconds();
        if (seconds < 0) {
            return "Vừa xong";
        }
        if (seconds < 60) {
            return "Vài giây trước";
        } else if (seconds < 3600) {
            return (seconds / 60) + " phút trước";
        } else if (seconds < 86400) {
            return (seconds / 3600) + " giờ trước";
        } else {
            return (seconds / 86400) + " ngày trước";
        }
    }
}
