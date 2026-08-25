/**
 * Parses a date string in YYYY-MM-DD format as a local date.
 * If the input is already a Date object, it returns it.
 * This avoids UTC conversion issues where YYYY-MM-DD is often treated as UTC midnight.
 */
export function parseLocalDate(dateInput: string | Date | null | undefined): Date | null {
  if (!dateInput) return null;
  if (dateInput instanceof Date) return dateInput;
  
  // If it's a string, try to parse YYYY-MM-DD
  if (typeof dateInput === 'string') {
    // Handle ISO strings with T or space
    const datePart = dateInput.split(/[T ]/)[0];
    const parts = datePart.split('-');
    
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1; // JS months are 0-indexed
      const day = parseInt(parts[2], 10);
      
      const date = new Date(year, month, day);
      // Validate the date
      if (!isNaN(date.getTime())) {
        return date;
      }
    }
    
    // Fallback for other string formats
    const date = new Date(dateInput);
    if (!isNaN(date.getTime())) {
      return date;
    }
  }
  
  return null;
}

/**
 * Format a date as YYYY-MM-DD in local time
 */
export function formatLocalDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
