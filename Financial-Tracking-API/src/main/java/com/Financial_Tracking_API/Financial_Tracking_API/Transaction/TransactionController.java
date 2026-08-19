package com.Financial_Tracking_API.Financial_Tracking_API.Transaction;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/transaction")
@RequiredArgsConstructor
public class TransactionController {
    private final TransactionService transactionService;

    @GetMapping
    public ResponseEntity<?> getTransactions(){
        return ResponseEntity.ok(transactionService.getTransactions());
    }

    // New Endpoint to handle file uploads
    @PostMapping("/upload-amex")
    public ResponseEntity<?> uploadTransactions(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body("Please select a file to upload.");
        }

        try {
            transactionService.processAmexFile(file);
            return ResponseEntity.ok("activity.csv uploaded and processed successfully!");
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Failed to process file: " + e.getMessage());
        }
    }
    @PostMapping("/upload-chase")
    public ResponseEntity<?> uploadChaseTransactions(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body("Please select a file to upload.");
        }
        try {
            transactionService.processChaseFile(file);
            return ResponseEntity.ok("Chase activity file uploaded and processed successfully!");
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Failed to process Chase file: " + e.getMessage());
        }
    }

}