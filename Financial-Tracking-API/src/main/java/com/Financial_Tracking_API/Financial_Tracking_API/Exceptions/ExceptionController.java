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
    public ResponseEntity<List<Exceptions>> getAllExceptions() {
        return ResponseEntity.ok(exceptionService.getAllExceptions());
    }

    @PostMapping
    public ResponseEntity<?> createException(Exceptions exception) {
        exceptionService.saveException(exception);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteException(Integer id) {
        exceptionService.deleteException(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/update")
    public ResponseEntity<?> updateException(Exceptions exception) {
        try {
            exceptionService.findExceptionById(exception.getExceptionId());
            exceptionService.saveException(exception);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
        return ResponseEntity.ok().build();
    }
}
