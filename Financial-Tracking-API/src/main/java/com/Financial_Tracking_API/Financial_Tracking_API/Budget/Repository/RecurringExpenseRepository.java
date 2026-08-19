package com.Financial_Tracking_API.Financial_Tracking_API.Budget.Repository;

import com.Financial_Tracking_API.Financial_Tracking_API.Budget.RecurringExpense;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RecurringExpenseRepository extends JpaRepository<RecurringExpense, Integer> {
}
