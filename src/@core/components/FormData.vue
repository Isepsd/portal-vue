<template>
  <div>
    <!-- Loading overlay -->

    <!-- Optional title -->
    <div v-if="!hideTitle" class="form-header">
      <h5 class="py-1">
        <i class="fa-solid fa-circle-info"></i>
        {{ isEdit ? 'Update' : 'Tambah' }} {{ customLabel || activePageDisplay }}
      </h5>
      <hr />
    </div>
    <VOverlay 
      v-if="loading" 
      class="align-center justify-center"
      :absolute="true"
      :contained="true"
    >
      <VProgressCircular indeterminate size="64" />
    </VOverlay>

    <!-- Form content dengan dynamic behavior mirip React FormData -->
    <slot 
      :form="form"
      :loading="loading"
      :errors="errors"
      :dataSelected="dataSelected"
      :dataParams="dataParams"
      :isEdit="isEdit"
      :currentId="currentId"
      :currentUser="currentUser"
      :submitForm="submitForm"
      :fetchDynamicData="fetchDynamicData"
      :setErrors="setErrors"
      :clearErrors="clearErrors"
      :validateForm="validateForm"
    />

    
  </div>
</template>

<script setup lang="ts">
import {
  getAllByPath,
  getByIdPath,
  postByPath,
  putByPath
} from '@/composables/main.service'
import { useAuthStore } from '@/pages/stores/auth'
import { showNotification } from '@/utils/notification'
import axios from 'axios'
import { computed, onMounted, provide, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
// Props
interface Props {
  fields?: Record<string, any>
  path: string
  customLabel?: string
  onLoading?: (loading: boolean) => void
  onGetDataResult?: (data: any) => void
  hideTitle?: boolean
  redirectAfterSubmit?: boolean
  customRedirectPath?: string
  isFormData?: boolean
  queryParams?: Record<string, any>
  idParam?: string
}

const props = withDefaults(defineProps<Props>(), {
  fields: () => ({}),
  queryParams: () => ({}),
  idParam: 'id',
  hideTitle: false,
  redirectAfterSubmit: true,
  isFormData: false
})

// Emits
const emit = defineEmits<{
  'form-submit': [data: any]
  'data-loaded': [data: any]
  'loading-change': [loading: boolean]
}>()

// Composables
const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const source = axios.CancelToken.source();


// State
const form = ref<Record<string, any>>({ ...props.fields })
const loading = ref(false)
const errors = ref<Record<string, string>>({})
const dataSelected = ref<any>(null)
const dataParams = ref<any>(null)

// Computed
const isEdit = computed(() => !!route.params[props.idParam])
const currentId = computed(() => route.params[props.idParam] as string)
const currentUser = computed(() => authStore.credentials)
const activePageDisplay = computed(() => {
  // This would come from your UI store or similar
  return 'Data' // Placeholder
})
const customLabel = computed(() => props.customLabel || '')

// Helper functions
const setLoading = (state: boolean) => {
  loading.value = state
  props.onLoading?.(state)
  emit('loading-change', state)
}

const setErrors = (newErrors: Record<string, string>) => {
  errors.value = newErrors
}

const clearErrors = () => {
  errors.value = {}
}

// Process form data before submission
const processFormData = (data: any): any => {
  const processed = { ...data }
  
  // Remove null values
  Object.keys(processed).forEach(key => {
    if (processed[key] === 'null' || processed[key] === null) {
      delete processed[key]
    }
  })

  // Add user info
  const id = currentId.value
  if (id) {
    processed.id_user_updated = currentUser.value?.id_user
    processed.updated_user = currentUser.value?.id_user
  } else {
    processed.id_user_created = currentUser.value?.id_user
    processed.created_user = currentUser.value?.id_user
  }

  return processed
}

// Handle server validation errors
const handleValidationErrors = (serverErrors: any) => {
  const formattedErrors: Record<string, string> = {}
  
  if (typeof serverErrors === 'object' && !Array.isArray(serverErrors)) {
    Object.entries(serverErrors).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        formattedErrors[key] = value.join(' ')
      } else {
        formattedErrors[key] = String(value)
      }
    })
  }
  
  errors.value = formattedErrors
}

// Initialize form with data
const initFormData = (data: any = undefined) => {
  const valueData = isEdit.value && data 
    ? Object.keys(props.fields).reduce((acc, key) => {
        if (key in data) {
          acc[key] = data[key]
        }
        return acc
      }, {} as any)
    : { ...props.fields }

  form.value = { ...valueData }
}

// Get data by ID for edit mode
const getDataById = async () => {
  if (!currentId.value) return

  setLoading(true)
  try {
    const response: any = await getByIdPath(props.path, currentId.value,  source.token)
    
    if (response?.results) {
      dataSelected.value = response.results
      initFormData(response.results)
      props.onGetDataResult?.(response.results)
      emit('data-loaded', response.results)
    }
  } catch (error) {
    console.error('Error fetching data:', error)
    showNotification('Gagal memuat data', 'error')
  } finally {
    setLoading(false)
  }
}

// Submit form data
const submitForm = async (customData?: any) => {
  clearErrors()
  
  const submitData = customData || processFormData(form.value)
  dataParams.value = submitData

  setLoading(true)
  
  try {
    let response: any
    
    if (isEdit.value) {
      response = await putByPath(props.path, submitData, currentId.value, source.token)
    } else {
      response = await postByPath(props.path, submitData, source.token)
    }

    if (response?.status === 200 || response?.status === 201) {
      const action = isEdit.value ? 'mengubah' : 'menambah'
      showNotification(`Sukses ${action} data`, 'success')
      
      // Reset form for new data
      if (!isEdit.value) {
        initFormData()
      }

      // Handle redirect
      if (props.redirectAfterSubmit) {
        if (props.customRedirectPath) {
          router.push(props.customRedirectPath)
        } else {
          router.go(-1)
        }
      }

      emit('form-submit', { success: true, data: response })
      return { success: true, data: response }
    } else {
      showNotification(response?.message || 'Terjadi kesalahan', 'error')
      return { success: false, error: response?.message }
    }
  } catch (error: any) {
    console.error('Submit error:', error)
    
    // Handle validation errors
    if (error?.response?.data?.results) {
      handleValidationErrors(error.response.data.results)
      showNotification('Validasi form gagal', 'error')
    } else {
      const message = error?.response?.data?.message || 'Terjadi kesalahan saat submit'
      showNotification(message, 'error')
    }
    
    return { success: false, error }
  } finally {
    setLoading(false)
  }
}

// Dynamic data fetching function
const fetchDynamicData = async (
  fetchPath: string, 
  params: any = {},
  options: { 
    transformData?: (data: any) => any 
    onSuccess?: (data: any) => void 
  } = {}
) => {
  try {
    const response = await getAllByPath(fetchPath, { ...props.queryParams, ...params }, source.token)
    
    let data = (response as any)?.results?.data || (response as any)?.results || []
    
    if (options.transformData) {
      data = options.transformData(data)
    }
    
    options.onSuccess?.(data)
    
    return data
  } catch (error) {
    console.error('Error fetching dynamic data:', error)
    return []
  }
}

// Form validation
const validateForm = (customValidation?: (formData: any) => Record<string, string>): boolean => {
  let validationErrors: Record<string, string> = {}
  
  // Custom validation function if provided
  if (customValidation) {
    validationErrors = customValidation(form.value)
  }
  
  errors.value = validationErrors
  return Object.keys(validationErrors).length === 0
}

// Provide form context untuk child components
provide('formContext', {
  form,
  loading,
  errors,
  dataSelected,
  dataParams,
  isEdit,
  currentId,
  currentUser,
  submitForm,
  fetchDynamicData,
  setErrors,
  clearErrors,
  validateForm,
  setLoading
})

// Watch for changes
watch(form, (newVal) => {
  dataParams.value = newVal
}, { deep: true })

// Initialize on mount
onMounted(async () => {
  if (isEdit.value) {
    await getDataById()
  } else {
    initFormData()
  }
})
</script>

<style scoped>
.form-header {
  margin-bottom: 1rem;
}

.form-header h5 {
  color: var(--v-theme-on-surface);
  font-weight: 500;
}
</style>
