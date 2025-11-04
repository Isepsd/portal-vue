// Simple notification helper
export const showNotification = (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') => {
  // You can integrate with your preferred notification library here
  // For now, using console.log as placeholder
  console.log(`[${type.toUpperCase()}] ${message}`)
  
  // Example integration with Vuetify snackbar:
  // const snackbar = useSnackbar()
  // snackbar.show({ message, color: type })
}

export const notificationTemplate = (message: string, type: string) => {
  return {
    message,
    type,
    timestamp: new Date().toISOString()
  }
}
