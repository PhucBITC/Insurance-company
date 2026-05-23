package com.insurance.repository;

import com.insurance.entity.InsurancePackage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface InsurancePackageRepository extends JpaRepository<InsurancePackage, Long> {
    Optional<InsurancePackage> findByPackageCode(String packageCode);
    boolean existsByPackageCode(String packageCode);
    List<InsurancePackage> findByStatus(String status);
    long countByStatus(String status);
}
