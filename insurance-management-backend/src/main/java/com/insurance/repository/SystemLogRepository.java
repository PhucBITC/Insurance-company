package com.insurance.repository;

import com.insurance.entity.SystemLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface SystemLogRepository extends JpaRepository<SystemLog, Long> {

    @Query("SELECT sl FROM SystemLog sl WHERE " +
           "(:role = 'ALL' OR sl.role = :role) AND " +
           "(LOWER(sl.userEmail) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(sl.action) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<SystemLog> searchLogs(@Param("role") String role, @Param("search") String search, Pageable pageable);
}
