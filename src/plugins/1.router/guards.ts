export const setupGuards = (router: any) => {
  router.beforeEach((to: any) => {
    const requiresAuth = to.meta.requiresAuth;
    const isLoggedIn = !!(useCookie('userData').value && useCookie('accessToken').value);

    // 🔹 Allow access to login/register/forgot-password/index
    const publicPages = ['login', 'register', 'forgot-password', 'index'];
    const isPublicPage = publicPages.includes(to.name as string);

    // ✅ Jika user sudah login tapi mau buka login/register → redirect ke dashboard
    if (isLoggedIn && ['login', 'register', 'forgot-password'].includes(to.name as string)) {
      return { name: 'index' }; // atau route dashboard utama kamu
    }

    // 🔹 Redirect ke login jika butuh auth tapi belum login
    if (requiresAuth && !isLoggedIn && !isPublicPage) {
      return { name: 'login' };
    }

    // Lanjutkan untuk route lain
    return undefined;
  });
}
