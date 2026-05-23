package com.insurance.repository;

import com.insurance.entity.CustomerInsurance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CustomerInsuranceRepository extends JpaRepository<CustomerInsurance, Long> {
    List<CustomerInsurance> findByCustomerIdOrderByCreatedAtDesc(Long customerId);
    List<CustomerInsurance> findAllByOrderByCreatedAtDesc();
    boolean existsByContractCode(String contractCode);

    @org.springframework.data.jpa.repository.Query("SELECT COUNT(ci) > 0 FROM CustomerInsurance ci " +
            "WHERE ci.customer.id = ?1 " +
            "AND ci.insurancePackage.id = ?2 " +
            "AND (ci.status = 'PENDING' OR (ci.status = 'APPROVED' AND ci.endDate >= ?3))")
    boolean hasActiveOrPendingInsurance(Long customerId, Long packageId, java.time.LocalDate today);
}
