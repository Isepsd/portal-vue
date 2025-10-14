<!-- ❗Errors in the form are set on line 60 -->
<script setup lang="ts">
import { initNestedMenu } from '@/components/helper/menu.helper';
import { AuthLoginService, AuthUserDetailService } from '@/composables/auth.service';
import { getAllByPath, getByIdPath } from '@/composables/main.service';
import { useAuthStore } from '@/pages/stores/auth'; // Ganti path sesuai lokasi file `auth.ts` yang kamu lampirkan
import { useNavigationStore } from '@/pages/stores/navigation';
import AuthProvider from '@/views/pages/authentication/AuthProvider.vue';
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
const authThemeImg = useGenerateImageVariant(authV2LoginIllustrationLight, authV2LoginIllustrationDark, authV2LoginIllustrationBorderedLight, authV2LoginIllustrationBorderedDark, true)

const authThemeMask = useGenerateImageVariant(authV2MaskLight, authV2MaskDark)

definePage({
  meta: {
    layout: 'blank',
    unauthenticatedOnly: true,
  },
})

const isPasswordVisible = ref(false)

const route = useRoute()
const router = useRouter()

const ability = useAbility()
const navigationStore = useNavigationStore()
const errors = ref<Record<string, string | undefined>>({
  email: undefined,
  password: undefined,
})
function stringToJSON(str: string) {
  try {
    return JSON.parse(str)
  } catch {
    return {}
  }
}

const refVForm = ref<VForm>()

const credentials = ref({
  email: 'admin',
  password: 'admin123',
})

const rememberMe = ref(false)
const postSignin = async ({ username, password }: any) => {
  const auth = useAuthStore()
  const source = axios.CancelToken.source()

  try {
    const params = { username, password }
    console.log('Mengirim login request...', params)

    // 1. Login
    const reqToken: any = await AuthLoginService({ params, cancelToken: source.token })
    console.log('✅ FULL login response (reqToken):', reqToken)

   
    // 3. Update auth state dan ability
    auth.loginUser(reqToken)
    
    // 4. Ambil detail user (Authorization header akan otomatis terisi)
    const reqUserDetail = await AuthUserDetailService(source.token)
    console.log('✅ Response detail user:', reqUserDetail)
    auth.setLoggedInUserDetail(reqUserDetail?.data)

    // 5. Ambil role
    const reqRole: any = await getByIdPath('roles', reqUserDetail?.data?.roleId, source.token)
    auth.setRoleAccess(reqRole?.results || [])
   console.log('✅ Response role user:', reqUserDetail)
    // 6. Ambil menu
    const reqMenu: any = await getAllByPath('menu', { page: -1, limit: -1 }, source.token)
    const menuItems = (reqMenu?.results || []).map((item: any) => ({
      ...item,
      idParent: item.idParent || '',
      privileges: stringToJSON(item.privileges),
    }))

    try {
      const menus = initNestedMenu('', menuItems, null)
      navigationStore.setNavigation(menus)
       console.log('✅ Response role menus:', menus)
    } catch (menuError) {
      console.warn('⚠️ Gagal inisialisasi menu:', menuError)
    }
      const data:any = { 
    access: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Mn0.cat2xMrZLn0FwicdGtZNzL7ifDTAKWB0k1RurSWjdnw',
    refresh: 'fake-refresh-token',
    userData: {
      id: 1,
      fullName: 'John Doe',
      username: 'johndoe',
      email: 'admin@demo.com',
      role: 'admin',
      avatar: '/images/avatars/avatar-1.png',
      roleId: '1b4aa951-e537-483a-9b03-715f4062111e',
    },
    userAbilityRules: [
      { action: 'manage', subject: 'all' },
    ],} // ← Gunakan langsung karena bukan { data: ... }

    const accessToken = data.access
    // const refreshToken = data.refresh
    const userData = data.userData || {}
    const userAbilityRules = data.userAbilityRules || []

    // 2. Simpan token & user di cookie SEBELUM request lainnya
    useCookie('accessToken').value = accessToken
    // useCookie('refreshToken').value = refreshToken
    useCookie('userData').value = userData
    useCookie('userAbilityRules').value = userAbilityRules

      ability.update(userAbilityRules)
        auth.setSessionLifetime({ rememberMe: rememberMe.value })
      await nextTick(() => {
          router.replace(route.query.to ? String(route.query.to) : '/')
        })
  } catch (error: any) {
    console.error('❌ Login error:', error)
    if (error?.response?.data?.message) {
      errors.value.password = 'Login tidak berhasil, silahkan kontak administrator'
    } else if (error?.message) {
      errors.value.password = `Gagal login: ${error.message}`
    } else {
      errors.value.password = 'Terjadi kesalahan jaringan atau server.'
    }
  }
}
// const postSignin = async ({ username, password }: any) => {
//   const auth = useAuthStore()
//   const source = axios.CancelToken.source()

//   try {
//     const params = { username, password }
//     console.log('Mengirim login request...', params)

//     // 1. Login
//     const reqToken: any = await AuthLoginService({ params, cancelToken: source.token })
//     console.log('✅ FULL login response (reqToken):', reqToken)

//     const data = reqToken // ← Gunakan langsung karena bukan { data: ... }

//     const accessToken = data.access
//     const refreshToken = data.refresh
//     const userData = data.userData || {}
//     const userAbilityRules = data.userAbilityRules || []

//     // 2. Simpan token & user di cookie SEBELUM request lainnya
//     useCookie('accessToken').value = accessToken
//     useCookie('refreshToken').value = refreshToken
//     useCookie('userData').value = userData
//     useCookie('userAbilityRules').value = userAbilityRules

//     // 3. Update auth state dan ability
//     auth.loginUser(data)
//     ability.update(userAbilityRules)
//     auth.setSessionLifetime({ rememberMe: rememberMe.value })

//     // 4. Ambil detail user (Authorization header akan otomatis terisi)
//     const reqUserDetail = await AuthUserDetailService(source.token)
//     console.log('✅ Response detail user:', reqUserDetail)
//     auth.setLoggedInUserDetail(reqUserDetail?.data)

//     // 5. Ambil role
//     const reqRole: any = await getByIdPath('roles', reqUserDetail?.data?.roleId, source.token)
//     auth.setRoleAccess(reqRole?.results || [])

//     // 6. Ambil menu
//     const reqMenu: any = await getAllByPath('menu', { page: -1, limit: -1 }, source.token)
//     const menuItems = (reqMenu?.results || []).map((item: any) => ({
//       ...item,
//       idParent: item.idParent || '',
//       privileges: stringToJSON(item.privileges),
//     }))

//     try {
//       const menus = initNestedMenu('', menuItems, null)
//       navigationStore.setNavigation(menus)
//     } catch (menuError) {
//       console.warn('⚠️ Gagal inisialisasi menu:', menuError)
//     }

//     // 7. Redirect ke dashboard
//     const path = reqUserDetail?.data?.url_dashboard || '/dashboards/ecommerce'
//     await nextTick(() => {
//       router.replace(path)
//     })
//   } catch (error: any) {
//     console.error('❌ Login error:', error)
//     if (error?.response?.data?.message) {
//       errors.value.password = 'Login tidak berhasil, silahkan kontak administrator'
//     } else if (error?.message) {
//       errors.value.password = `Gagal login: ${error.message}`
//     } else {
//       errors.value.password = 'Terjadi kesalahan jaringan atau server.'
//     }
//   }
// }



// const login = async () => {
//   try {
//     const res = await $api('/auth/login', {
//       method: 'POST',
//       body: {
//         email: credentials.value.email,
//         password: credentials.value.password,
//       },
//       onResponseError({ response }) {
//         errors.value = response._data.errors
//       },
//     })

//     const { accessToken, userData, userAbilityRules } = res

//     useCookie('userAbilityRules').value = userAbilityRules
//     ability.update(userAbilityRules)

//     useCookie('userData').value = userData
//     useCookie('accessToken').value = accessToken

//     // Redirect to `to` query if exist or redirect to index route
//     // ❗ nextTick is required to wait for DOM updates and later redirect
//     await nextTick(() => {
//       router.replace(route.query.to ? String(route.query.to) : '/')
//     })
//   }
//   catch (err) {
//     console.error(err)
//   }
// }


const onSubmit = () => {
   refVForm.value?.validate().then(({ valid }) => {
    if (!valid) return

    const payload = {
      username: credentials.value.email,
      password: credentials.value.password,
    }

    postSignin(payload)
  })
  // refVForm.value?.validate()
  //   .then(({ valid: isValid }) => {
  //     if (isValid)
  //       login()
  //   })
}
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
            Welcome to <span class="text-capitalize"> {{ themeConfig.app.title }} </span>! 👋🏻
          </h4>
          <p class="mb-0">
            Please sign-in to your account and start the adventure
          </p>
        </VCardText>
        <VCardText>
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
        </VCardText>
        <VCardText>
          <VForm
            ref="refVForm"
            @submit.prevent="onSubmit"
          >
            <VRow>
              <!-- email -->
              <VCol cols="12">
                <AppTextField
                  v-model="credentials.email"
                  label="Email"
                  placeholder="johndoe@email.com"
                  type="email"
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
                />

                <div class="d-flex align-center flex-wrap justify-space-between my-6">
                  <VCheckbox
                    v-model="rememberMe"
                    label="Remember me"
                  />
                  <RouterLink
                    class="text-primary ms-2 mb-1"
                    :to="{ name: 'forgot-password' }"
                  >
                    Forgot Password?
                  </RouterLink>
                </div>

                <VBtn
                  block
                  type="submit"
                >
                  Login
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
              <VCol
                cols="12"
                class="d-flex align-center"
              >
                <VDivider />
                <span class="mx-4">or</span>
                <VDivider />
              </VCol>

              <!-- auth providers -->
              <VCol
                cols="12"
                class="text-center"
              >
                <AuthProvider />
              </VCol>
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
