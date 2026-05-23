package com.insurance.repository;

import com.insurance.entity.IncidentReport;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface IncidentReportRepository extends JpaRepository<IncidentReport, Long> {
    List<IncidentReport> findByCustomerIdOrderByCreatedAtDesc(Long customerId);
    List<IncidentReport> findByHandlerEmployeeIdOrderByCreatedAtDesc(Long employeeId);
    List<IncidentReport> findAllByOrderByCreatedAtDesc();
    boolean existsByReportCode(String reportCode);
}
