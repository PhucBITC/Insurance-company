package com.insurance.repository;

import com.insurance.entity.CustomerAssignment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CustomerAssignmentRepository extends JpaRepository<CustomerAssignment, Long> {
    List<CustomerAssignment> findByEmployeeId(Long employeeId);
    Optional<CustomerAssignment> findByCustomerId(Long customerId);
    Optional<CustomerAssignment> findByEmployeeIdAndCustomerId(Long employeeId, Long customerId);
    boolean existsByEmployeeIdAndCustomerId(Long employeeId, Long customerId);
    List<CustomerAssignment> findAllByOrderByAssignedAtDesc();
}
