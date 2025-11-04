import { useAuthStore } from '@/pages/stores/auth'
import { showNotification } from '@/utils/notification'
import { computed, onMounted, ref, watch, type Ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  getAllByPath,
  getByIdPath,
  postByPath,
  putByPath
} from './main.service'

interface UseFormDataOptions {
  fields: Record<string, any>
  path: string
  idParam?: string
  queryParams?: Record<string, any>
  onGetDataResult?: (data: any) => void
  onLoading?: (loading: boolean) => void
  redirectAfterSubmit?: boolean
  customRedirectPath?: string
  isFormData?: boolean
}

interface FormState {
  data: Record<string, any>
  loading: boolean
  errors: Record<string, string>
  dataSelected: any
  dataParams: any
}

export function useFormData<T = Record<string, any>>(options: UseFormDataOptions) {
  const {
    fields,
    path,
    idParam = 'id',
    queryParams = {},
    onGetDataResult,
    onLoading,
    redirectAfterSubmit = true,
    customRedirectPath,
    isFormData = false
  } = options

  // Route dan router
  const route = useRoute()
  const router = useRouter()
  const authStore = useAuthStore()

  // Form state
  const form = ref<T>({ ...fields } as T)
  const loading = ref(false)
  const errors = ref<Record<string, string>>({})
  const dataSelected = ref<any>(null)
  const dataParams = ref<any>(null)

  // Computed properties
  const isEdit = computed(() => !!route.params[idParam])
  const currentId = computed(() => route.params[idParam] as string)
  const currentUser = computed(() => authStore.credentials)

  // Helper functions
  const setLoading = (state: boolean) => {
    loading.value = state
    onLoading?.(state)
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
      ? Object.keys(fields).reduce((acc, key) => {
          if (key in data) {
            acc[key] = data[key]
          }
          return acc
        }, {} as any)
      : { ...fields }

    form.value = { ...valueData } as T
  }

  // Get data by ID for edit mode
  const getDataById = async () => {
    if (!currentId.value) return

    setLoading(true)
    try {
      const response: any = await getByIdPath(path, currentId.value, null)
      
      if (response?.results) {
        dataSelected.value = response.results
        initFormData(response.results)
        onGetDataResult?.(response.results)
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
        response = await putByPath(path, submitData, currentId.value, null)
      } else {
        response = await postByPath(path, submitData, null)
      }

      if (response?.status === 200 || response?.status === 201) {
        const action = isEdit.value ? 'mengubah' : 'menambah'
        showNotification(`Sukses ${action} data`, 'success')
        
        // Reset form for new data
        if (!isEdit.value) {
          initFormData()
        }

        // Handle redirect
        if (redirectAfterSubmit) {
          if (customRedirectPath) {
            router.push(customRedirectPath)
          } else {
            router.go(-1)
          }
        }

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
      const response:any = await getAllByPath(fetchPath, { ...queryParams, ...params }, null)
      
      let data = response?.results?.data || response?.results || []
      
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

  // Watch for form changes
  watch(form, (newVal) => {
    // Can be used for real-time validation or other side effects
  }, { deep: true })

  // Initialize on mount
  onMounted(async () => {
    if (isEdit.value) {
      await getDataById()
    } else {
      initFormData()
    }
  })

  return {
    // Form data
    form: form as Ref<T>,
    loading,
    errors,
    dataSelected,
    dataParams,
    
    // Computed
    isEdit,
    currentId,
    currentUser,
    
    // Methods
    setLoading,
    setErrors,
    clearErrors,
    submitForm,
    initFormData,
    getDataById,
    fetchDynamicData,
    processFormData,
    
    // Helper
    handleValidationErrors
  }
}
