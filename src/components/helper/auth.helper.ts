import { useAuthStore } from '@/pages/stores/auth';

/** GET ALL ROLES ACTION IN A MODULE */
const ROLE_ACCESS = (module: string) => {
  const auth = useAuthStore(); 
  const roleAccess: Record<string, string[]> = auth.roleAccess || {}; // ambil dari store

  if (module === 'all') {
    return roleAccess; // return seluruh module + action
  }

  return roleAccess[module] || []; // return action untuk module tertentu
};

/** CHECK ROLE ACTION IN MODULE */
const ROLE_ACTION = (roleAccess: string[] = [], action: string) => {
  if (!Array.isArray(roleAccess)) return false;
  return roleAccess.includes(action); // true jika action ada
};

export { ROLE_ACCESS, ROLE_ACTION };

