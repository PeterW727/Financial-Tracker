package com.Financial_Tracking_API.Financial_Tracking_API.Exceptions;

import com.Financial_Tracking_API.Financial_Tracking_API.Expense.Expense;
import com.Financial_Tracking_API.Financial_Tracking_API.Expense.ExpenseRecord;
import lombok.Builder;

@Builder
public record ExceptionRecord(
        Integer exceptionId,
        String exceptionName,
        String regexRule
) {

    public static ExceptionRecord fromObject(Exceptions exceptions) {
        return ExceptionRecord.builder()
                .exceptionId(exceptions.getExceptionId())
                .exceptionName(exceptions.getExceptionName())
                .regexRule(exceptions.getRegexRule())
                .build();
    }

    public static Exceptions toObject(ExceptionRecord exceptionRecord) {
        return Exceptions.builder()
                .exceptionId(exceptionRecord.exceptionId())
                .exceptionName(exceptionRecord.exceptionName())
                .regexRule(exceptionRecord.regexRule())
                .build();
    }
}
