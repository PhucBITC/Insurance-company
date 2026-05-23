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
}
