package com.Financial_Tracking_API.Financial_Tracking_API.Exceptions;

import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ExceptionService {
    private final ExceptionRepository exceptionRepository;

    public List<Exceptions> getAllExceptions() {
        return exceptionRepository.findAll();
    }

    public void saveException(Exceptions exception) {
        exceptionRepository.save(exception);
    }

    public void deleteException(Integer exceptionId) {
        exceptionRepository.deleteById(exceptionId);
    }

    public Exceptions findExceptionById(Integer exceptionId) {
        return exceptionRepository.findById(exceptionId).orElseThrow(() -> new RuntimeException("Exception not found"));
    }
}
