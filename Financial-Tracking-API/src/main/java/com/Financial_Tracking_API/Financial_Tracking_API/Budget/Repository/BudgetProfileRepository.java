package com.Financial_Tracking_API.Financial_Tracking_API.Budget.Repository;

import com.Financial_Tracking_API.Financial_Tracking_API.Budget.BudgetProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface BudgetProfileRepository extends JpaRepository<BudgetProfile, Integer> {
}
