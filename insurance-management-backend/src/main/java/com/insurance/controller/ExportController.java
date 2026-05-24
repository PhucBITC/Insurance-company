package com.insurance.controller;

import com.insurance.entity.Customer;
import com.insurance.entity.CustomerInsurance;
import com.insurance.entity.IncidentReport;
import com.insurance.repository.CustomerInsuranceRepository;
import com.insurance.repository.CustomerRepository;
import com.insurance.repository.IncidentReportRepository;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;
import java.io.OutputStreamWriter;
import java.io.PrintWriter;
import java.nio.charset.StandardCharsets;
import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/admin/exports")
@PreAuthorize("hasRole('ADMIN')")
public class ExportController {

    @Autowired
    private CustomerInsuranceRepository customerInsuranceRepository;

    @Autowired
    private IncidentReportRepository incidentReportRepository;

    @Autowired
    private CustomerRepository customerRepository;

    @GetMapping("/contracts")
    public void exportContracts(HttpServletResponse response) throws IOException {
        response.setContentType("text/csv; charset=utf-8");
        response.setHeader("Content-Disposition", "attachment; filename=\"hop_dong_bao_hiem.csv\"");

        // Write UTF-8 BOM
        response.getOutputStream().write(new byte[] { (byte)0xEF, (byte)0xBB, (byte)0xBF });

        PrintWriter writer = new PrintWriter(new OutputStreamWriter(response.getOutputStream(), StandardCharsets.UTF_8));
        writer.println("Mã hợp đồng,Tên khách hàng,Mã khách hàng,Gói bảo hiểm,Ngày bắt đầu,Ngày kết thúc,Giá (VNĐ),Trạng thái");

        List<CustomerInsurance> list = customerInsuranceRepository.findAllByOrderByCreatedAtDesc();
        for (CustomerInsurance ci : list) {
            writer.println(String.format("\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",\"%.2f\",\"%s\"",
                    escapeCsv(ci.getContractCode() != null ? ci.getContractCode() : "Chưa có"),
                    escapeCsv(ci.getCustomer().getFullName()),
                    escapeCsv(ci.getCustomer().getCustomerCode()),
                    escapeCsv(ci.getInsurancePackage().getName()),
                    escapeCsv(ci.getStartDate() != null ? ci.getStartDate().toString() : "N/A"),
                    escapeCsv(ci.getEndDate() != null ? ci.getEndDate().toString() : "N/A"),
                    ci.getPrice(),
                    escapeCsv(ci.getStatus())
            ));
        }
        writer.flush();
    }

    @GetMapping("/incidents")
    public void exportIncidents(HttpServletResponse response) throws IOException {
        response.setContentType("text/csv; charset=utf-8");
        response.setHeader("Content-Disposition", "attachment; filename=\"su_co_bao_hiem.csv\"");

        // Write UTF-8 BOM
        response.getOutputStream().write(new byte[] { (byte)0xEF, (byte)0xBB, (byte)0xBF });

        PrintWriter writer = new PrintWriter(new OutputStreamWriter(response.getOutputStream(), StandardCharsets.UTF_8));
        writer.println("Mã báo cáo,Tiêu đề,Khách hàng,Số điện thoại,Gói bảo hiểm,Mã hợp đồng,Số tiền bồi thường (VNĐ),Ngày xảy ra,Trạng thái");

        List<IncidentReport> list = incidentReportRepository.findAllByOrderByCreatedAtDesc();
        for (IncidentReport ir : list) {
            writer.println(String.format("\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",\"%.2f\",\"%s\",\"%s\"",
                    escapeCsv(ir.getReportCode() != null ? ir.getReportCode() : "Chưa có"),
                    escapeCsv(ir.getTitle()),
                    escapeCsv(ir.getCustomer().getFullName()),
                    escapeCsv(ir.getCustomer().getPhoneNumber() != null ? ir.getCustomer().getPhoneNumber() : ""),
                    escapeCsv(ir.getCustomerInsurance().getInsurancePackage().getName()),
                    escapeCsv(ir.getCustomerInsurance().getContractCode() != null ? ir.getCustomerInsurance().getContractCode() : ""),
                    ir.getClaimAmount() != null ? ir.getClaimAmount() : 0.0,
                    escapeCsv(ir.getIncidentDate() != null ? ir.getIncidentDate().toString() : "N/A"),
                    escapeCsv(ir.getStatus())
            ));
        }
        writer.flush();
    }

    @GetMapping("/customers")
    public void exportCustomers(HttpServletResponse response) throws IOException {
        response.setContentType("text/csv; charset=utf-8");
        response.setHeader("Content-Disposition", "attachment; filename=\"danh_sach_khach_hang.csv\"");

        // Write UTF-8 BOM
        response.getOutputStream().write(new byte[] { (byte)0xEF, (byte)0xBB, (byte)0xBF });

        PrintWriter writer = new PrintWriter(new OutputStreamWriter(response.getOutputStream(), StandardCharsets.UTF_8));
        writer.println("Mã khách hàng,Họ tên,Số điện thoại,Địa chỉ,Ngày sinh,Giới tính,CMND/CCCD,Email,Trạng thái");

        List<Customer> list = customerRepository.findAll();
        for (Customer c : list) {
            writer.println(String.format("\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",\"%s\"",
                    escapeCsv(c.getCustomerCode()),
                    escapeCsv(c.getFullName()),
                    escapeCsv(c.getPhoneNumber() != null ? c.getPhoneNumber() : ""),
                    escapeCsv(c.getAddress() != null ? c.getAddress() : ""),
                    escapeCsv(c.getDateOfBirth() != null ? c.getDateOfBirth().toString() : ""),
                    escapeCsv(c.getGender() != null ? c.getGender() : ""),
                    escapeCsv(c.getIdentityCard() != null ? c.getIdentityCard() : ""),
                    escapeCsv(c.getUser().getEmail()),
                    escapeCsv(c.getStatus())
            ));
        }
        writer.flush();
    }

    private String escapeCsv(String text) {
        if (text == null) {
            return "";
        }
        return text.replace("\"", "\"\"");
    }
}
