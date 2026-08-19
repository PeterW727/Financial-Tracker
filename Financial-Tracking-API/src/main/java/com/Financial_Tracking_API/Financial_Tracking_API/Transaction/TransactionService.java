package com.Financial_Tracking_API.Financial_Tracking_API.Transaction;

import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.*;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.math.BigInteger;
import java.sql.Date;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TransactionService {
    private final TransactionRepository transactionRepository;

    public List<Transaction> getTransactions(){
        return transactionRepository.findAll();
    }

    // Updated method to process the Excel file
    public void processAmexFile(MultipartFile file) throws Exception {
        List<Transaction> transactions = new ArrayList<>();
        DateTimeFormatter stringDateFormatter = DateTimeFormatter.ofPattern("MM/dd/yyyy");

        // DataFormatter helps extract the string representation of Excel cells easily
        DataFormatter dataFormatter = new DataFormatter();

        try (Workbook workbook = WorkbookFactory.create(file.getInputStream())) {
            // Get the first sheet in the Excel file
            Sheet sheet = workbook.getSheetAt(0);
            boolean isHeaderRows = true;
            int numRowsProcessed = 0;
            int numberHeaderRows = 8;
            for (Row row : sheet) {
                // Skip the header row
                if (isHeaderRows) {
                    numRowsProcessed++;
                    isHeaderRows = numRowsProcessed != numberHeaderRows;
                    continue;
                }

                // Break if we hit an empty row
                if (row == null || row.getCell(0) == null || row.getCell(0).getCellType() == CellType.BLANK) {
                    break;
                }

                // 1. Extract Reference No First (Column 9)
                String refString = dataFormatter.formatCellValue(row.getCell(9)).replaceAll("['\"]", "").trim();
                BigInteger referenceNo = new BigInteger(refString);

                // 2. Check if it already exists in the database
                if (!transactionRepository.existsByReferenceNo(referenceNo)) {

                    // It doesn't exist, so parse the rest of the data
                    Cell dateCell = row.getCell(0);
                    LocalDate localDate;
                    if (dateCell.getCellType() == CellType.NUMERIC && DateUtil.isCellDateFormatted(dateCell)) {
                        localDate = dateCell.getLocalDateTimeCellValue().toLocalDate();
                    } else {
                        String dateStr = dataFormatter.formatCellValue(dateCell).trim();
                        localDate = LocalDate.parse(dateStr, stringDateFormatter);
                    }
                    Date date = Date.valueOf(localDate);

                    String description = dataFormatter.formatCellValue(row.getCell(1)).trim();
                    String category = dataFormatter.formatCellValue(row.getCell(10)).trim();

                    String amountStr = dataFormatter.formatCellValue(row.getCell(2)).replace(",", "").trim();
                    Double amount = Double.parseDouble(amountStr);

                    // Build the entity
                    Transaction transaction = Transaction.builder()
                            .date(date)
                            .description(description)
                            .amount(amount)
                            .referenceNo(referenceNo)
                            .category(category)
                            .transactionOrigin(TransactionOrigin.AMEX)
                            .build();

                    // Add to our batch list
                    transactions.add(transaction);
                }
            }

            // Save only the new rows to the database
            // If the list is empty (all duplicates), this won't do anything
            if (!transactions.isEmpty()) {
                transactionRepository.saveAll(transactions);
            }
        }
    }

    public void processChaseFile(MultipartFile file) throws Exception {
        List<Transaction> transactions = new ArrayList<>();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("MM/dd/yyyy");

        try (BufferedReader br = new BufferedReader(new InputStreamReader(file.getInputStream()))) {
            String line;
            boolean isFirstLine = true;

            while ((line = br.readLine()) != null) {
                // Skip the header row ("Details,Posting Date,Description,Amount,Type,Balance,Check or Slip #")
                if (isFirstLine) {
                    isFirstLine = false;
                    continue;
                }

                // Regex to split on commas but ignore commas inside double quotes
                String[] data = line.split(",(?=(?:[^\"]*\"[^\"]*\")*[^\"]*$)");

                if (data.length >= 4) {

                    // 1. Parse Date (Index 1 is Posting Date)
                    LocalDate localDate = LocalDate.parse(data[1].trim(), formatter);
                    Date date = Date.valueOf(localDate);

                    // 2. Parse Description (Index 2) - Removing surrounding quotes if any
                    String description = data[2].replaceAll("^\"|\"$", "").replaceAll("\\s+", " ").trim();

                    // 3. Parse Amount (Index 3)
                    Double amount = Double.parseDouble(data[3].trim());

                    // 4. Check for duplicates (Since we have no reference number)
                    if (!transactionRepository.existsByDateAndDescriptionAndAmountAndTransactionOrigin(
                            date, description, amount, TransactionOrigin.CHASE)) {

                        Transaction transaction = Transaction.builder()
                                .date(date)
                                .description(description)
                                .amount(amount)
                                .category("Chase")
                                .referenceNo(null) // Ensuring this stays null
                                .transactionOrigin(TransactionOrigin.CHASE)
                                .build();

                        transactions.add(transaction);
                    }
                }
            }

            if (!transactions.isEmpty()) {
                transactionRepository.saveAll(transactions);
            }
        }
    }
}