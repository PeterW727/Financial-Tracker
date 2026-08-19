package com.Financial_Tracking_API.Financial_Tracking_API.Transaction;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigInteger;
import java.sql.Date;

@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name="transactions")
@Data
@Builder
public class Transaction {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer transactionId;

    @Column(unique = true)
    private BigInteger referenceNo;

    private Date date;
    private String description;
    private Double amount;
    private String category;

    @Enumerated(EnumType.STRING)
    private TransactionOrigin transactionOrigin;
}
