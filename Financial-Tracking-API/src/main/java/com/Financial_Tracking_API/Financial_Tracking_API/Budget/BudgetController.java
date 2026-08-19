package com.Financial_Tracking_API.Financial_Tracking_API.Budget;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/budget")
@RequiredArgsConstructor
public class BudgetController {

    private final BudgetService budgetService;

    @GetMapping("/budget-category")
    public ResponseEntity<List<BudgetCategory>> getBudgetCategories() {
        return ResponseEntity.ok(budgetService.getBudgetCategories());
    }

    @GetMapping("/monthly-budget")
    public ResponseEntity<List<MonthlyBudget>> getMonthlyBudgets() {
        return ResponseEntity.ok(budgetService.getMonthlyBudgets());
    }

    @GetMapping("/recurring-expense")
    public ResponseEntity<List<RecurringExpense>> getRecurringExpenses() {
        return ResponseEntity.ok(budgetService.getRecurringExpenses());
    }

    @GetMapping("/budget-profile")
    public ResponseEntity<List<BudgetProfile>> getBudgetProfiles() {
        return ResponseEntity.ok(budgetService.getBudgetProfiles());
    }
}
