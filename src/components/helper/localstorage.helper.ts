import { isJson } from './data.helper';
import { dataDecryption, dataEncryption } from './security.helper';

const isEncode = import.meta.env.VITE_ENCODE === 'true';

export function getItem(key: string, defaultValue: any = null) {
  try {
    const LsData = localStorage.getItem(key);
    if (LsData === null) return defaultValue;

    if (isEncode) {
      const decryptedData = dataDecryption(LsData);
      return decryptedData ?? defaultValue;
    } else {
      return isJson(LsData) ? JSON.parse(LsData) : LsData;
    }
  } catch (error) {
    console.error('getItem error:', error);
    return defaultValue;
  }
}

export function setItem(key: string, value: any) {
  try {
    let data = JSON.stringify(value);

    if (isEncode) {
      data = dataEncryption(data);
    }

    localStorage.setItem(key, data);
  } catch (error) {
    console.error('setItem error:', error);
  }
}

export function deleteItem(key: string) {
  localStorage.removeItem(key);
}

export function deleteAll() {
  localStorage.clear();
}
