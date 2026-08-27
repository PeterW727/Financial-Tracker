package com.Financial_Tracking_API.Financial_Tracking_API.Expense;

import lombok.Getter;

@Getter
public enum ExpenseType {
    FIXED("Fixed"),
    VARIABLE("Variable"),
    HOUSING("Housing"),
    SUBSCRIPTION("Subscription"),
    UTILITIES("Utilities");

    private final String displayName;

    ExpenseType(String displayName) {
        this.displayName = displayName;
    }

   public static ExpenseType fromDisplayName(String displayName) {
       if (displayName == null || displayName.isEmpty()) {
           return null;
       }
       for (ExpenseType type : ExpenseType.values()) {
           if (type.getDisplayName().equalsIgnoreCase(displayName)) {
               return type;
           }
       }
       throw new IllegalArgumentException("No TransactionTypeEnum with display name: " + displayName);
   }

}
