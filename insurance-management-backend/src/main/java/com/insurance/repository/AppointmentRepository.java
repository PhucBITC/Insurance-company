package com.insurance.repository;

import com.insurance.entity.Appointment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Long> {
    List<Appointment> findByCustomerIdOrderByAppointmentDateDescCreatedAtDesc(Long customerId);
    List<Appointment> findByEmployeeIdOrderByAppointmentDateDescCreatedAtDesc(Long employeeId);
    List<Appointment> findAllByOrderByAppointmentDateDescCreatedAtDesc();
}
