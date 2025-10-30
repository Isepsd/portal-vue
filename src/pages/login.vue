<!-- ❗Errors in the form are set on line 60 -->
<script setup lang="ts">
import { filterMenuByRole, initNestedMenu } from '@/components/helper/menu.helper';
import { AuthLoginService, AuthUserDetailService } from '@/composables/auth.service';
import { getAllByPath, getByIdPath } from '@/composables/main.service';
import { useAuthStore } from '@/pages/stores/auth';
import { useNavigationStore } from '@/pages/stores/navigation';
import { useGenerateImageVariant } from '@core/composable/useGenerateImageVariant';
import authV2LoginIllustrationBorderedDark from '@images/pages/auth-v2-login-illustration-bordered-dark.png';
import authV2LoginIllustrationBorderedLight from '@images/pages/auth-v2-login-illustration-bordered-light.png';
import authV2LoginIllustrationDark from '@images/pages/auth-v2-login-illustration-dark.png';
import authV2LoginIllustrationLight from '@images/pages/auth-v2-login-illustration-light.png';
import authV2MaskDark from '@images/pages/misc-mask-dark.png';
import authV2MaskLight from '@images/pages/misc-mask-light.png';
import { VNodeRenderer } from '@layouts/components/VNodeRenderer';
import { themeConfig } from '@themeConfig';
import axios from 'axios';
import { VForm } from 'vuetify/components/VForm';

const authThemeImg = useGenerateImageVariant(
  authV2LoginIllustrationLight,
  authV2LoginIllustrationDark,
  authV2LoginIllustrationBorderedLight,
  authV2LoginIllustrationBorderedDark,
  true
);

const authThemeMask = useGenerateImageVariant(authV2MaskLight, authV2MaskDark);

definePage({
  meta: { layout: 'blank', unauthenticatedOnly: true },
});

const isPasswordVisible = ref(false);
// const route = useRoute();
const router = useRouter();
// const ability = useAbility();
const navigationStore = useNavigationStore();
const errors = ref<Record<string, string | undefined>>({ username: undefined, password: undefined });
const refVForm = ref<VForm>();

const credentials = ref({ username: '', password: '' });
const rememberMe = ref(false);

function stringToJSON(str: string) {
  try { return JSON.parse(str); } 
  catch { return {}; }
}

// ✅ Safe bind helper untuk mencegah key invalid
function safeBind(obj: Record<string, any> | undefined) {
  if (!obj) return {};
  const sanitized: Record<string, any> = {};
  Object.keys(obj).forEach(key => {
    // Hanya izinkan key yang valid untuk DOM attributes
    // Rules:
    // 1. Tidak boleh numeric atau diawali angka
    // 2. Harus diawali huruf, underscore, atau dash
    // 3. Bisa mengandung huruf, angka, underscore, dash, colon, titik
    // 4. Tidak boleh kosong
    if (typeof key === 'string' &&
        key.trim() !== '' && // Tidak boleh kosong
        !/^\d/.test(key) && // Tidak boleh diawali angka
        !/^\d+$/.test(key) && // Tidak boleh numeric string
        /^[a-zA-Z][a-zA-Z0-9\-_:.]*$/.test(key) // Format yang valid
       ) {
      sanitized[key] = obj[key];
    } else {
      console.warn(`🚫 Invalid prop key filtered: "${key}"`);
    }
  });
  return sanitized;
}
const isLoading = ref(false); // <-- tambahkan state loading

const postSignin = async ({ username, password }: any) => {
  const auth = useAuthStore();
  const source = axios.CancelToken.source();
 isLoading.value = true;

  // 🔹 Clear all auth cookies sebelum login untuk reset state
  // console.log('🧹 Clearing old auth cookies...');
  const accessTokenCookie = useCookie('accessToken');
  const userDataCookie = useCookie('userData');
  const userAbilityRulesCookie = useCookie('userAbilityRules');
  
  accessTokenCookie.value = undefined;
  userDataCookie.value = undefined;
  userAbilityRulesCookie.value = undefined;
  
  // 🔹 Clear navigation store
  navigationStore.$reset();
  auth.$reset();
  
  // console.log('✅ Auth cookies cleared, starting fresh login...');

  try {
    // 1. Login
    const reqToken: any = await AuthLoginService({ params: { username, password }, cancelToken: source.token });
    auth.loginUser(reqToken);

    // 2. Ambil detail user
    const reqUserDetail = await AuthUserDetailService(source.token);
    auth.setLoggedInUserDetail(reqUserDetail?.data);

    // 3. Ambil role & privileges
    const reqRole: any = await getByIdPath('roles', reqUserDetail?.data?.roleId, source.token);
    const roleData = { ...reqRole?.results, privileges: stringToJSON(reqRole?.results?.privileges) };
    auth.setRoleAccess(roleData);

    // 4. Ambil menu lengkap
    const reqMenu: any = await getAllByPath('menu', { page: -1, limit: -1 }, source.token);
    const menuItems = (reqMenu?.results || []).map((item: any) => ({
      ...item,
      idParent: item.idParent || '',
      privileges: stringToJSON(item.privileges),
    }));

    // 5. Buat nested menu & simpan ke store
    const nestedMenus = initNestedMenu('', menuItems, null);
    navigationStore.setNavigation(nestedMenus);

    // 6. Filter menu berdasarkan role & convert ke format vertical nav
    // const rolePrivileges:any = auth.roleAccess?.privileges || {};
    // console
    const filteredMenu = filterMenuByRole(nestedMenus, null);
    
    // console.log('🔍 Debug - filteredMenu:', JSON.stringify(filteredMenu, null, 2));
    
    const verticalNavItems = convertTreeToNav(filteredMenu);
    navigationStore.setVerticalNav(verticalNavItems);
    // console.log('Step 6 completed:', rolePrivileges);
    
    // 🔹 Set cookies setelah navigation siap
    const accessTokenCookie = useCookie<string>('accessToken');
    const userDataCookie = useCookie<Record<string, any>>('userData');
    const userAbilityRulesCookie = useCookie<any>('userAbilityRules');

    accessTokenCookie.value = reqToken.access;
    userDataCookie.value = safeBind(reqUserDetail?.data);
// console.log("userdata",userDataCookie)
    // 🔹 Set ability rules - prioritize role privileges, fallback to admin rights
    const abilityRules = roleData?.privileges && roleData.privileges.length > 0 
      ? roleData.privileges 
      : [{ action: 'manage', subject: 'all' }];

    userAbilityRulesCookie.value = abilityRules;
    // console.log('🔐 Ability Rules set:', abilityRules);

    auth.setSessionLifetime({ rememberMe: rememberMe.value });
    
    // 🔹 DEBUG: Verifikasi navigation data tersimpan
    // console.log('🔍 DEBUG - Navigation Store State:');
    // console.log('  - navigationStore.navigation:', navigationStore.navigation);
    // console.log('  - navigationStore.verticalNav:', navigationStore.verticalNav);
    
    // 🔹 Force save navigation ke cookie untuk persistence
    // console.log('💾 Forcing navigation save to cookie...');
    navigationStore.setNavigation(navigationStore.navigation);
    navigationStore.setVerticalNav(navigationStore.verticalNav);
    
    // 🔹 Tunggu lebih lama untuk memastikan semua state ter-set dengan benar
    // console.log('⏳ Waiting for states to settle before navigation...');
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 🔹 Final verification sebelum navigation
    // console.log('🔍 FINAL CHECK:');
    // console.log('  - verticalNav items count:', navigationStore.verticalNav.length);
    // console.log('  - navigation items count:', navigationStore.navigation.length);
    
    // console.log('🚀 Navigating to dashboard...');
    // Gunakan router.push dengan path yang benar
    await router.push('/dashboards/dashfasop/kinerjascada');

  } catch (error: any) {
    console.error('❌ Login error:', error);
    errors.value.password = error?.response?.data?.message
      ? 'Login tidak berhasil, silahkan kontak administrator'
      : error?.message
      ? `Gagal login: ${error.message}`
      : 'Terjadi kesalahan jaringan atau server.';
  }finally {
    // Nonaktifkan loading
    isLoading.value = false;
  }
};

const onSubmit = () => {
  refVForm.value?.validate().then(({ valid }) => {
    if (!valid) return;

    postSignin({
      username: credentials.value.username,
      password: credentials.value.password,
    });
  });
};
</script>

<template>
  <RouterLink to="/">
    <div class="auth-logo d-flex align-center gap-x-3">
      <VNodeRenderer :nodes="themeConfig.app.logo" />
      <h1 class="auth-title">
        {{ themeConfig.app.title }}
      </h1>
    </div>
  </RouterLink>


    
  <VRow
    no-gutters
    class="auth-wrapper bg-surface"
  >
    <VCol
      md="8"
      class="d-none d-md-flex"
    >
    
      <div class="position-relative bg-background w-100 me-0">
        <div
          class="d-flex align-center justify-center w-100 h-100"
          style="padding-inline: 6.25rem;"
        >
          <VImg
            max-width="613"
            :src="authThemeImg"
            class="auth-illustration mt-16 mb-2"
          />
        </div>

        <img
          class="auth-footer-mask"
          :src="authThemeMask"
          alt="auth-footer-mask"
          height="280"
          width="100"
        >
      </div>
    </VCol>

  <VCol
      cols="12"
      md="4"
      class="auth-card-v2 d-flex align-center justify-center"
    >
      <VCard
          flat
          :max-width="500"
          class="mt-12 mt-sm-0 pa-4"
        >
          <VCardText>
            <h4 class="text-h4 mb-1">
              Welcome to <span class="text-capitalize">  
            </span>! <VNodeRenderer :nodes="themeConfig.app.logo" class="mx-auto mb-4" />
            </h4>
            <p class="mb-0">
              Please sign-in to your account and start the adventure
            </p>
          </VCardText>
          <!-- <VCardText>
            <VAlert
              color="primary"
              variant="tonal"
            >
              <p class="text-sm mb-2">
                Admin Email: <strong>admin@demo.com</strong> / Pass: <strong>admin</strong>
              </p>
              <p class="text-sm mb-0">
                Client Email: <strong>client@demo.com</strong> / Pass: <strong>client</strong>
              </p>
            </VAlert>
          </VCardText> -->
          <VCardText>
            <VForm
              ref="refVForm"
              @submit.prevent="onSubmit"
             >
            <VRow>
              <!-- email -->
              <VCol cols="12">
                <AppTextField
                  v-model="credentials.username"
                  label="Username"
                  placeholder="Masukan User Name"
                  type="username"
                  autofocus
         
                />
              </VCol>

              <!-- password -->
              <VCol cols="12">
                <AppTextField
                  v-model="credentials.password"
                  label="Password"
                  placeholder="············"
                  :type="isPasswordVisible ? 'text' : 'password'"
                  autocomplete="password"
                  :append-inner-icon="isPasswordVisible ? 'tabler-eye-off' : 'tabler-eye'"
                  @click:append-inner="isPasswordVisible = !isPasswordVisible"
                  :error="!!errors.password"
                  :error-messages="errors.password"
                />

                <div class="d-flex align-center flex-wrap justify-space-between my-6">
                  <VCheckbox v-model="rememberMe" label="Remember me" />
                  <RouterLink class="text-primary ms-2 mb-1" :to="{ name: 'forgot-password' }">
                    Forgot Password?
                  </RouterLink>
                </div>

             <VBtn block type="submit" :disabled="isLoading">
                <template v-if="isLoading">
                  <VProgressCircular indeterminate size="18" color="white" class="me-2" />
                  Logging in...
                </template>
                <template v-else>
                  Login
                </template>
              </VBtn>
              </VCol>


              <!-- create account -->
              <VCol
                cols="12"
                class="text-center"
              >
                <span>New on our platform?</span>
                <RouterLink
                  class="text-primary ms-1"
                  :to="{ name: 'register' }"
                >
                  Create an account
                </RouterLink>
              </VCol>
              <!-- <VCol
                cols="12"
                class="d-flex align-center"
              >
                <VDivider />
                <span class="mx-4">or</span>
                <VDivider />
              </VCol> -->

              <!-- auth providers -->
              <!-- <VCol
                cols="12"
                class="text-center"
              >
                <AuthProvider />
              </VCol> -->
            </VRow>
          </VForm>
        </VCardText>
      </VCard>
    </VCol>

    
  </VRow>


</template>


<style lang="scss">
@use "@core/scss/template/pages/page-auth";
</style>
