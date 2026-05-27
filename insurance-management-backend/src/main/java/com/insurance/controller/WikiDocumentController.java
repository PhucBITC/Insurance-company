package com.insurance.controller;

import com.insurance.entity.WikiDocument;
import com.insurance.repository.WikiDocumentRepository;
import com.insurance.dto.MessageResponse;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.security.Principal;
import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/admin/wiki")
@PreAuthorize("hasRole('ADMIN')")
public class WikiDocumentController {

    @Autowired
    private WikiDocumentRepository wikiDocumentRepository;

    @GetMapping("/list")
    public ResponseEntity<List<WikiDocument>> getAllDocuments() {
        return ResponseEntity.ok(wikiDocumentRepository.findAll());
    }

    @PostMapping("/upload")
    public ResponseEntity<?> uploadDocument(@RequestParam("file") MultipartFile file, Principal principal) {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body(new MessageResponse("Lỗi: File tải lên bị rỗng!"));
        }

        String fileName = file.getOriginalFilename();
        if (fileName == null) {
            return ResponseEntity.badRequest().body(new MessageResponse("Lỗi: Tên file không hợp lệ!"));
        }

        try {
            String content = "";
            if (fileName.toLowerCase().endsWith(".txt")) {
                content = new String(file.getBytes(), StandardCharsets.UTF_8);
            } else if (fileName.toLowerCase().endsWith(".pdf")) {
                try (InputStream is = file.getInputStream();
                     PDDocument document = PDDocument.load(is)) {
                    PDFTextStripper stripper = new PDFTextStripper();
                    content = stripper.getText(document);
                }
            } else {
                return ResponseEntity.badRequest().body(new MessageResponse("Lỗi: Chỉ hỗ trợ định dạng file .pdf hoặc .txt!"));
            }

            if (content.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(new MessageResponse("Lỗi: Nội dung file rỗng hoặc không trích xuất được văn bản!"));
            }

            WikiDocument doc = new WikiDocument();
            doc.setFileName(fileName);
            doc.setContent(content);
            doc.setUploadedBy(principal != null ? principal.getName() : "ADMIN");
            wikiDocumentRepository.save(doc);

            return ResponseEntity.ok(new MessageResponse("Tải lên và trích xuất tài liệu Wiki thành công!"));

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body(new MessageResponse("Lỗi xử lý file: " + e.getMessage()));
        }
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<?> deleteDocument(@PathVariable Long id) {
        if (!wikiDocumentRepository.existsById(id)) {
            return ResponseEntity.badRequest().body(new MessageResponse("Lỗi: Tài liệu không tồn tại!"));
        }
        wikiDocumentRepository.deleteById(id);
        return ResponseEntity.ok(new MessageResponse("Xóa tài liệu thành công!"));
    }
}
