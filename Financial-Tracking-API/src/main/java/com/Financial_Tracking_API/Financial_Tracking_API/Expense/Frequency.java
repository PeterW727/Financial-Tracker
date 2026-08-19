package com.Financial_Tracking_API.Financial_Tracking_API.Expense;

import lombok.Getter;

@Getter
public enum Frequency {
    MONTHLY("Monthly"),
    YEARLY("Yearly"),
    QUARTERLY("Quarterly"),
    WEEKLY("Weekly"),
    DAILY("Daily"),
    SINGLE("Single");

    private final String displayName;

    Frequency(String displayName) {
        this.displayName = displayName;
    }

    public static Frequency fromDisplayName(String displayName) {
        if (displayName == null || displayName.isEmpty()) {
            return null;
        }
        for (Frequency type : Frequency.values()) {
            if (type.getDisplayName().equalsIgnoreCase(displayName)) {
                return type;
            }
        }
        throw new IllegalArgumentException("No TransactionTypeEnum with display name: " + displayName);
    }
}
