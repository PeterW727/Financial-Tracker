package com.Financial_Tracking_API.Financial_Tracking_API.Income;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.util.Date;

@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name="income")
@Data
@Builder
@Getter
public class Income {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer incomeId;

    private Double salary;
    private Double salaryTaxRate;
    private Double bonus;
    private Double bonusTaxRate;
    private LocalDate bonusPayoutDate;
    private LocalDate startDate;
    private LocalDate endDate;

}
