// Simple encryption utility for payload security
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'tomo-split-default-key-2024';

// Simple XOR encryption (for demo purposes - use proper encryption in production)
export function encrypt(data: string): string {
  let encrypted = '';
  for (let i = 0; i < data.length; i++) {
    const charCode = data.charCodeAt(i) ^ ENCRYPTION_KEY.charCodeAt(i % ENCRYPTION_KEY.length);
    encrypted += String.fromCharCode(charCode);
  }
  return btoa(encrypted); // Base64 encode
}

export function decrypt(encryptedData: string): string {
  try {
    const decoded = atob(encryptedData); // Base64 decode
    let decrypted = '';
    for (let i = 0; i < decoded.length; i++) {
      const charCode = decoded.charCodeAt(i) ^ ENCRYPTION_KEY.charCodeAt(i % ENCRYPTION_KEY.length);
      decrypted += String.fromCharCode(charCode);
    }
    return decrypted;
  } catch (error) {
    throw new Error('Invalid encrypted data');
  }
}

// Generate unique user ID based on name and timestamp
export function generateUserId(name: string): string {
  const timestamp = Date.now().toString();
  const random = Math.random().toString(36).substring(2, 15);
  return `user_${name.toLowerCase().replace(/\s+/g, '_')}_${timestamp}_${random}`;
}

// Validate user data
export function validateUserData(data: any): { isValid: boolean; error?: string } {
  if (!data.name || typeof data.name !== 'string' || data.name.trim().length < 2) {
    return { isValid: false, error: 'Name must be at least 2 characters long' };
  }
  
  if (data.email && typeof data.email !== 'string') {
    return { isValid: false, error: 'Email must be a valid string' };
  }
  
  return { isValid: true };
}
