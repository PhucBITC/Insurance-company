package com.insurance.repository;

import com.insurance.entity.WikiDocument;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface WikiDocumentRepository extends JpaRepository<WikiDocument, Long> {
}
