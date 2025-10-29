import requestApi from './api.service';

/**
 * AuthLoginService
 * @param params = {"username":"", "password":""}
 * @returns
 */

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api/v1';
const API_MAIN_SERVICE = import.meta.env.VITE_API_MAIN_SERVICE || '/main';

const AuthLoginService = ({ params = {}, cancelToken }: any) => {
  return requestApi().post(
    '/auth/login',
    params,
    {
      cancelToken: cancelToken,
    }
  );
};

/**
 * AuthLoginService
 * @param params = {"id", "oldPassword":"", "newPassword":""}
 * @returns
 */
const ChangePasswordService = (params: any = {}, id: any, sourceToken: any) => {
  return requestApi().put(
   '/auth/change-password/' + id,
    params,
    { cancelToken: sourceToken } // <-- IMPORTANT!
  );
};

/**
 * Get user detail yg login
 * @returns
 */
const AuthUserDetailService = (cancelToken: any = undefined) => {
  return requestApi().post(
   '/auth/details',
    {},
    {
      cancelToken: cancelToken,
    }
  );
};

// services/AuthUserDetailService.ts
// const AuthUserDetailService = async (cancelToken?: any) => {
//   return {
//     data: {
//       id: 1,
//       fullName: 'Admin User',
//       username: 'admin',
//       email: 'admin@demo.com',
//       role: 'admin',
//       roleId: '1b4aa951-e537-483a-9b03-715f4062111e',
//       url_dashboard: '/dashboards/ecommerce',
//     },
//   }
// }


export { AuthLoginService, AuthUserDetailService, ChangePasswordService };

