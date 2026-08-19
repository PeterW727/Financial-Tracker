package com.Financial_Tracking_API.Financial_Tracking_API.Income;

import lombok.RequiredArgsConstructor;
import org.apache.coyote.Response;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/income")
@RequiredArgsConstructor
public class IncomeController {
    private final IncomeService incomeService;

    @GetMapping
    public ResponseEntity<?> getIncome() {
        return ResponseEntity.ok(
                incomeService.getIncome().stream().map(IncomeRecord::fromObject).toList()
        );
    }

    @PostMapping
    public ResponseEntity<?> createIncome(@RequestBody IncomeRecord income) {
        try{
            incomeService.createIncome(IncomeRecord.toObject(income));
            return ResponseEntity.ok().build();
        }catch (Exception e){
            return ResponseEntity.badRequest().body("Error creating income record");
        }
    }
}
