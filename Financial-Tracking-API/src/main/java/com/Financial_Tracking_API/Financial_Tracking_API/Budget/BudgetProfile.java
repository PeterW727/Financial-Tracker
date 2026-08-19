package com.Financial_Tracking_API.Financial_Tracking_API.Budget;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "budget_profiles")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BudgetProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    private Double grossBaseSalary;
    private Double taxRate;
    private Double bonusEstimate;
    private Double savingsApr;
}
