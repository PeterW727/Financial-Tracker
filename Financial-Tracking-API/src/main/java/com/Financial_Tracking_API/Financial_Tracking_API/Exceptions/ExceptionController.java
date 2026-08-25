package com.Financial_Tracking_API.Financial_Tracking_API.Exceptions;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/exceptions")
@RequiredArgsConstructor
public class ExceptionController {
    private final ExceptionService exceptionService;

    @GetMapping
    public ResponseEntity<?> getAllExceptions() {
        return ResponseEntity.ok(
                exceptionService.getAllExceptions().stream()
                        .map(ExceptionRecord::fromObject)
                        .toList()
        );
    }

    @PostMapping
    public ResponseEntity<?> createException(@RequestBody ExceptionRecord exception) {
        exceptionService.saveException(ExceptionRecord.toObject(exception));
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteException(@PathVariable Integer id) {
        exceptionService.deleteException(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/update")
    public ResponseEntity<?> updateException(@RequestBody ExceptionRecord exception) {
        try {
            exceptionService.findExceptionById(exception.exceptionId());
            exceptionService.saveException(ExceptionRecord.toObject(exception));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
        return ResponseEntity.ok().build();
    }
}
