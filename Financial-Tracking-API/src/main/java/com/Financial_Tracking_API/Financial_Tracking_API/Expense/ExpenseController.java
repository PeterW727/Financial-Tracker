package com.Financial_Tracking_API.Financial_Tracking_API.Expense;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/expenses")
@RequiredArgsConstructor
public class ExpenseController {
    private final ExpenseService expenseService;

    @GetMapping
    public ResponseEntity<?> getExpenses() {
        return  ResponseEntity.ok(
            expenseService.getExpenses().stream().map(ExpenseRecord::fromObject).toList()
        );
    }

    @PostMapping
    public ResponseEntity<?> postExpense(@RequestBody ExpenseRecord expenseRecord) {
        try {
            expenseService.saveExpense(ExpenseRecord.toObject(expenseRecord));
            return ResponseEntity.ok().build();
        }
        catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/update")
    public ResponseEntity<?> updateExpense(@RequestBody ExpenseRecord expense) {
        try{
            expenseService.updateExpense(ExpenseRecord.toObject(expense));
            return ResponseEntity.ok().build();
        }catch (Exception e){
            return ResponseEntity.badRequest().body("Error updating expense record");
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteExpense(@PathVariable Integer id) {
        try{
            expenseService.deleteExpense(id);
            return ResponseEntity.ok().build();
        }catch (Exception e){
            return ResponseEntity.badRequest().body("Error deleting expense record");
        }
    }
}
