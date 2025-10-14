import { getItem } from '../components/helper/localstorage.helper';

/**
 * GET REFRESH TOKEN
 */
const getRefreshToken = (): string | null => {
  const refreshToken = getItem('credentials')?.refresh;
  return typeof refreshToken === 'string' ? refreshToken : null;
};

/**
 * GET ACCESS TOKEN
 */
const getAccessToken = (): string | null => {
  const accessToken = getItem('credentials')?.access;
  return typeof accessToken === 'string' ? accessToken : null;
};

export { getAccessToken, getRefreshToken };

