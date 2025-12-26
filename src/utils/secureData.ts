/**
 * Security utilities for masking sensitive customer data in admin displays
 */

// Mask email address: show first 2 chars and domain
export const maskEmail = (email: string | null): string => {
  if (!email) return '***@***.com';
  const [local, domain] = email.split('@');
  if (!domain) return '***@***.com';
  const maskedLocal = local.length > 2 
    ? local.slice(0, 2) + '*'.repeat(Math.min(local.length - 2, 5))
    : local + '***';
  return `${maskedLocal}@${domain}`;
};

// Mask phone number: show last 4 digits
export const maskPhone = (phone: string | null): string => {
  if (!phone) return '******';
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length < 4) return '******';
  return '*'.repeat(cleaned.length - 4) + cleaned.slice(-4);
};

// Mask full name: show first name initial + last name
export const maskName = (name: string | null): string => {
  if (!name) return '***';
  const parts = name.trim().split(' ');
  if (parts.length === 1) return parts[0][0] + '*'.repeat(parts[0].length - 1);
  const firstName = parts[0];
  const lastName = parts[parts.length - 1];
  return `${firstName[0]}. ${lastName}`;
};

// Mask address line
export const maskAddress = (address: string | null): string => {
  if (!address) return '***';
  const parts = address.split(' ');
  if (parts.length <= 2) return address;
  // Show building/house number and mask the rest
  return `${parts[0]} ${parts[1]} ***`;
};

// Get initials from name
export const getInitials = (name: string | null): string => {
  if (!name) return '?';
  const parts = name.trim().split(' ');
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

// Format currency safely
export const formatCurrency = (amount: number | null): string => {
  if (amount === null || amount === undefined) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

// Secure customer data for admin display
export interface SecureCustomerData {
  id: string;
  displayName: string;
  maskedEmail: string;
  maskedPhone: string;
  initials: string;
  avatar_url: string | null;
}

export const secureCustomerData = (customer: {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  avatar_url: string | null;
}): SecureCustomerData => ({
  id: customer.id,
  displayName: customer.full_name || 'Customer',
  maskedEmail: maskEmail(customer.email),
  maskedPhone: maskPhone(customer.phone),
  initials: getInitials(customer.full_name),
  avatar_url: customer.avatar_url,
});
