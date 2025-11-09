<script setup lang="ts">
// Simple root page - langsung ke dashboard untuk testing navigation
const router = useRouter()

// Direct ke dashboard tanpa API checks
onMounted(() => {
  router.push('/dashboard/dashfasop/kinerjascada')
})
</script>

<template>
  <!-- Loading state while redirecting -->
  <div class="d-flex justify-center align-center" style="height: 100vh;">
    <VSpinner size="48" color="primary" />
    <span class="ms-4">Loading dashboard...</span>
  </div>
</template>
