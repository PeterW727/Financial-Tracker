package com.Financial_Tracking_API.Financial_Tracking_API.Income;

import lombok.Builder;

import java.time.LocalDate;

@Builder
public record IncomeRecord(
    Integer incomeId,
    Double salary,
    Double salaryTaxRate,
    Double bonus,
    Double bonusTaxRate,
    LocalDate bonusPayoutDate
) {

    public static IncomeRecord fromObject(Income i) {
        return IncomeRecord.builder()
                .incomeId(i.getIncomeId())
                .salary(i.getSalary())
                .salaryTaxRate(i.getSalaryTaxRate())
                .bonus(i.getBonus())
                .bonusTaxRate(i.getBonusTaxRate())
                .bonusPayoutDate(i.getBonusPayoutDate())
                .build();
    }
    public static Income toObject(IncomeRecord i) {
        return Income.builder()
                .incomeId(i.incomeId())
                .salary(i.salary())
                .salaryTaxRate(i.salaryTaxRate())
                .bonus(i.bonus())
                .bonusTaxRate(i.bonusTaxRate())
                .bonusPayoutDate(i.bonusPayoutDate())
                .build();
    }
}
