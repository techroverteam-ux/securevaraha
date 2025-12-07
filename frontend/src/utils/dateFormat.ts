// Date formatting utilities to match PHP admin system

export const formatDate = (date: string | Date): string => {
  if (!date) return '';
  
  // Handle string dates in dd-mm-yyyy format
  if (typeof date === 'string') {
    if (date.includes('-') && date.split('-').length === 3) {
      const parts = date.split('-');
      if (parts[0].length === 2) {
        // Already in dd-mm-yyyy format
        return date;
      }
    }
  }
  
  const d = new Date(date);
  if (isNaN(d.getTime())) return date.toString();
  
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  
  return `${day}-${month}-${year}`;
};

export const formatDateTime = (date: string | Date): string => {
  if (!date) return '';
  
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';
  
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  
  return `${day}-${month}-${year} ${hours}:${minutes}`;
};

export const formatAmount = (amount: number | string): string => {
  if (!amount && amount !== 0) return '₹0.00';
  
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(num)) return '₹0.00';
  
  return `₹${num.toLocaleString('en-IN', { 
    minimumFractionDigits: 2, 
    maximumFractionDigits: 2 
  })}`;
};

export const getCurrentDate = (): string => {
  const now = new Date();
  const day = String(now.getDate()).padStart(2, '0');
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const year = now.getFullYear();
  
  return `${day}-${month}-${year}`;
};

// Convert any date to dd-mm-yyyy format for display
export const toDisplayDate = (dateStr: string): string => {
  if (!dateStr) return '';
  
  // Handle various input formats
  let date: Date;
  
  if (dateStr.includes('-')) {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      // Check if it's yyyy-mm-dd or dd-mm-yyyy
      if (parts[0].length === 4) {
        // yyyy-mm-dd format
        date = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
      } else {
        // dd-mm-yyyy format - already correct
        return dateStr;
      }
    } else {
      date = new Date(dateStr);
    }
  } else {
    date = new Date(dateStr);
  }
  
  if (isNaN(date.getTime())) return dateStr;
  
  return formatDate(date);
};

// For download filenames with current date
export const getDownloadDate = (): string => {
  return getCurrentDate().replace(/-/g, '');
};

// Convert 24-hour time to 12-hour AM/PM format
export const formatTime12Hour = (time: string | number): string => {
  if (!time) return '';
  
  let timeStr = time.toString();
  
  // Handle different time formats
  if (timeStr.length === 3) {
    // Format like "1396" -> "13:96" which is invalid, treat as "13:36"
    const hours = parseInt(timeStr.substring(0, 1));
    const minutes = parseInt(timeStr.substring(1));
    if (minutes >= 60) {
      // Invalid minutes, try different parsing
      const h = parseInt(timeStr.substring(0, 2));
      const m = parseInt(timeStr.substring(2));
      if (h <= 23 && m <= 59) {
        timeStr = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
      } else {
        return timeStr; // Return as is if can't parse
      }
    } else {
      timeStr = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    }
  } else if (timeStr.length === 4) {
    // Format like "1396" -> "13:96"
    const hours = parseInt(timeStr.substring(0, 2));
    const minutes = parseInt(timeStr.substring(2));
    if (hours <= 23 && minutes <= 59) {
      timeStr = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    } else {
      return timeStr; // Return as is if can't parse
    }
  }
  
  // Parse HH:MM format
  if (timeStr.includes(':')) {
    const [hoursStr, minutesStr] = timeStr.split(':');
    const hours = parseInt(hoursStr);
    const minutes = parseInt(minutesStr);
    
    if (isNaN(hours) || isNaN(minutes) || hours > 23 || minutes > 59) {
      return timeStr; // Return original if invalid
    }
    
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
    
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
  }
  
  return timeStr;
};

// Format appointment time with date and AM/PM
export const formatAppointmentTime = (date: string, timeIn: string | number, timeOut?: string | number): string => {
  const formattedDate = formatDate(date);
  const formattedTimeIn = formatTime12Hour(timeIn);
  const formattedTimeOut = timeOut ? formatTime12Hour(timeOut) : '';
  
  if (formattedTimeOut) {
    return `${formattedDate} (${formattedTimeIn} - ${formattedTimeOut})`;
  } else {
    return `${formattedDate} ${formattedTimeIn}`;
  }
};