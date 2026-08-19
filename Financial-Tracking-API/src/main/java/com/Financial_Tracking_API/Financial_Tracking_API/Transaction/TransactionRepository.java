package com.Financial_Tracking_API.Financial_Tracking_API.Transaction;

import org.springframework.data.jpa.repository.JpaRepository;

import java.math.BigInteger;
import java.sql.Date;

public interface  TransactionRepository extends JpaRepository<Transaction, Integer> {
    boolean existsByReferenceNo(BigInteger referenceNo);


    boolean existsByDateAndDescriptionAndAmountAndTransactionOrigin(Date date, String description, Double amount, TransactionOrigin transactionOrigin);
}
