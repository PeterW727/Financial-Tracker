package com.Financial_Tracking_API.Financial_Tracking_API.Budget;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "recurring_expenses")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RecurringExpense {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    private String name;
    private Double amount;

    @Enumerated(EnumType.STRING)
    private BillingCycle billingCycle;

    @ManyToOne
    @JoinColumn(name = "category_id")
    private BudgetCategory category;
}
