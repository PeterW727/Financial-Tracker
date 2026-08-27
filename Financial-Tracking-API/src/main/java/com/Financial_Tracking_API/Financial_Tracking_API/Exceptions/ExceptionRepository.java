package com.Financial_Tracking_API.Financial_Tracking_API.Exceptions;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ExceptionRepository extends JpaRepository<Exceptions, Integer> {
}
