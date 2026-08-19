package com.Financial_Tracking_API.Financial_Tracking_API.Income;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class IncomeService {
    private final IncomeRepository incomeRepository;

    public List<Income> getIncome() {
        return incomeRepository.findAll();
    }

    public void createIncome(Income income) {
        incomeRepository.save(income);
    }
}
