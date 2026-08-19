package com.Financial_Tracking_API.Financial_Tracking_API.Budget;

import com.Financial_Tracking_API.Financial_Tracking_API.Budget.Repository.BudgetCategoryRepository;
import com.Financial_Tracking_API.Financial_Tracking_API.Budget.Repository.BudgetProfileRepository;
import com.Financial_Tracking_API.Financial_Tracking_API.Budget.Repository.MonthlyBudgetRepository;
import com.Financial_Tracking_API.Financial_Tracking_API.Budget.Repository.RecurringExpenseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class BudgetService {

    private final BudgetCategoryRepository budgetCategoryRepository;
    private final MonthlyBudgetRepository monthlyBudgetRepository;
    private final RecurringExpenseRepository recurringExpenseRepository;
    private final BudgetProfileRepository budgetProfileRepository;

    public List<BudgetCategory> getBudgetCategories() {
        return budgetCategoryRepository.findAll();
    }

    public List<MonthlyBudget> getMonthlyBudgets() {
        return monthlyBudgetRepository.findAll();
    }

    public List<RecurringExpense> getRecurringExpenses() {
        return recurringExpenseRepository.findAll();
    }

    public List<BudgetProfile> getBudgetProfiles() {
        return budgetProfileRepository.findAll();
    }
}
