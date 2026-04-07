import { format } from 'date-fns';

export const formatDate = (dateStr: string): string => {
  try { return format(new Date(dateStr), 'MMM dd, yyyy'); }
  catch { return dateStr; }
};

export const formatDateTime = (dateStr: string): string => {
  try { return format(new Date(dateStr), 'MMM dd, yyyy h:mm a'); }
  catch { return dateStr; }
};
