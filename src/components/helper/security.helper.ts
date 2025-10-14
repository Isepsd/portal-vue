// src/helper/security.helper.ts
import CryptoES from 'crypto-es';
import { isJson } from './data.helper';

const ENCRYPTION_PASSWORD =  import.meta.env.VITE_ENCRIPTION_PASSWORD || 'default_password';

export function dataEncryption(data: any): string {
  const obj = typeof data === 'object' ? JSON.stringify(data) : data;
  const encrypted = CryptoES.Rabbit.encrypt(obj, ENCRYPTION_PASSWORD);
  return encrypted.toString();
}

export function dataDecryption(data: string): any {
  try {
    const decrypted = CryptoES.Rabbit.decrypt(data, ENCRYPTION_PASSWORD);
    const decryptedStr = decrypted.toString(CryptoES.enc.Utf8);
    return isJson(decryptedStr) ? JSON.parse(decryptedStr) : decryptedStr;
  } catch (error) {
    console.error('Decryption failed:', error);
    return null;
  }
}
