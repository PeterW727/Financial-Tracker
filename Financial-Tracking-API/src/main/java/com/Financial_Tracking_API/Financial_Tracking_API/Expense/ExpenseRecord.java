package com.Financial_Tracking_API.Financial_Tracking_API.Expense;

import jakarta.persistence.EnumType;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;

@Builder
public record ExpenseRecord(
        Integer expenseId,
        String name,
        Double amount,
        String frequency,
        String expenseType,
        LocalDate startDate,
        LocalDate endDate
) {
    public static ExpenseRecord fromObject(Expense expense) {
        return ExpenseRecord.builder()
                .expenseId(expense.getExpenseId())
                .name(expense.getName())
                .amount(expense.getAmount())
                .frequency(expense.getFrequency().getDisplayName())
                .expenseType(expense.getExpenseType().getDisplayName())
                .startDate(expense.getStartDate())
                .endDate(expense.getEndDate())
                .build();
    }

    public static Expense toObject(ExpenseRecord expenseRecord) {
        return Expense.builder()
                .expenseId(expenseRecord.expenseId())
                .name(expenseRecord.name())
                .amount(expenseRecord.amount())
                .frequency(Frequency.fromDisplayName(expenseRecord.frequency))
                .expenseType(ExpenseType.fromDisplayName(expenseRecord.expenseType))
                .startDate(expenseRecord.startDate())
                .endDate(expenseRecord.endDate())
                .build();
    }
}
