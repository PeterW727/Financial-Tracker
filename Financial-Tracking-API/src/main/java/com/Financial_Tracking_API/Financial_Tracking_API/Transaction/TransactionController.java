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
    @PostMapping("/upload-amex/{isCreditCard}")
    public ResponseEntity<?> uploadTransactions(@RequestParam("file") MultipartFile file,
                                                @PathVariable boolean isCreditCard) {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body("Please select a file to upload.");
        }

        try {
            transactionService.processAmexFile(file, isCreditCard);
            return ResponseEntity.ok("activity.csv uploaded and processed successfully!");
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Failed to process file: " + e.getMessage());
        }
    }
    @PostMapping("/upload-chase/{isCreditCard}")
    public ResponseEntity<?> uploadChaseTransactions(@RequestParam("file") MultipartFile file,
                                                     @PathVariable boolean isCreditCard) {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body("Please select a file to upload.");
        }
        try {
            transactionService.processChaseFile(file, isCreditCard);
            return ResponseEntity.ok("Chase activity file uploaded and processed successfully!");
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Failed to process Chase file: " + e.getMessage());
        }
    }

}