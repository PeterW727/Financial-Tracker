package com.Financial_Tracking_API.Financial_Tracking_API.Expense;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name="expense")
@Data
@Builder
@Getter
public class Expense {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer expenseId;
    private String name;
    private Double amount;
    @Enumerated(EnumType.STRING)
    private Frequency frequency;
    @Enumerated(EnumType.STRING)
    private ExpenseType expenseType;
    private LocalDate startDate;


}
