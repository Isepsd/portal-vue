<script setup lang="ts">
import { ref } from 'vue';
import type { FilterValues, HandleRespDataApiFn } from '../types';
import TableIgrid from './TableIgrid.vue';

// Sample data
const sampleData = ref([
  { id: 1, name: 'Pembangkit A', location: 'Jakarta', status: 'Active', capacity: '1000MW' },
  { id: 2, name: 'Pembangkit B', location: 'Bandung', status: 'Inactive', capacity: '800MW' },
  { id: 3, name: 'Pembangkit C', location: 'Surabaya', status: 'Active', capacity: '1200MW' },
  { id: 4, name: 'Pembangkit D', location: 'Medan', status: 'Maintenance', capacity: '600MW' },
  { id: 5, name: 'Pembangkit E', location: 'Makassar', status: 'Active', capacity: '900MW' },
])

// Column definitions
const columnDefinitions = ref([
  {
    headerName: 'Nama Pembangkit',
    field: 'name',
    filter: 'agTextColumnFilter',
    sortable: true,
    width: 200,
  },
  {
    headerName: 'Lokasi',
    field: 'location',
    filter: 'agTextColumnFilter',
    sortable: true,
    width: 150,
  },
  {
    headerName: 'Status',
    field: 'status',
    filter: 'agSetColumnFilter',
    sortable: true,
    width: 120,
  },
  {
    headerName: 'Kapasitas',
    field: 'capacity',
    filter: 'agTextColumnFilter',
    sortable: true,
    width: 100,
  },
])

// Filter values
const filterValues = ref<FilterValues>({
  page: 1,
  limit: 10,
})

// Handle API response
const handleRespDataApi: HandleRespDataApiFn = (results: any[], page: number, limit: number) => {
  return results.map((item, index) => ({
    ...item,
    number: (page - 1) * limit + index + 1,
  }))
}

// Action handlers
const handleEdit = (item: any) => {
  console.log('📝 Edit item:', item)
  // Implement edit logic here
  alert(`Edit: ${item.name}`)
}

const handleDelete = (item: any) => {
  console.log('🗑️ Delete item:', item)
  // Implement delete logic here
  if (confirm(`Are you sure you want to delete ${item.name}?`)) {
    alert(`Deleted: ${item.name}`)
  }
}

const handleView = (item: any) => {
  console.log('👁️ View item:', item)
  // Implement view logic here
  alert(`View details for: ${item.name}`)
}

const handleCopy = (item: any) => {
  console.log('📋 Copy item:', item)
  // Implement copy logic here
  navigator.clipboard.writeText(JSON.stringify(item, null, 2))
  alert(`Copied: ${item.name}`)
}

const handleDownload = (item: any) => {
  console.log('⬇️ Download item:', item)
  // Implement download logic here
  const dataStr = JSON.stringify(item, null, 2)
  const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr)
  const exportFileDefaultName = `${item.name.replace(/\s+/g, '_')}.json`
  
  const linkElement = document.createElement('a')
  linkElement.setAttribute('href', dataUri)
  linkElement.setAttribute('download', exportFileDefaultName)
  linkElement.click()
}

const handlePrint = (item: any) => {
  console.log('🖨️ Print item:', item)
  // Implement print logic here
  const printWindow = window.open('', '_blank')
  if (printWindow) {
    printWindow.document.write(`
      <html>
        <head><title>${item.name}</title></head>
        <body>
          <h1>${item.name}</h1>
          <p><strong>Lokasi:</strong> ${item.location}</p>
          <p><strong>Status:</strong> ${item.status}</p>
          <p><strong>Kapasitas:</strong> ${item.capacity}</p>
        </body>
      </html>
    `)
    printWindow.document.close()
    printWindow.print()
  }
}

const handleArchive = (item: any) => {
  console.log('📦 Archive item:', item)
  // Implement archive logic here
  if (confirm(`Archive ${item.name}?`)) {
    alert(`Archived: ${item.name}`)
  }
}

const handleActivate = (item: any) => {
  console.log('✅ Activate item:', item)
  // Implement activate logic here
  alert(`Activated: ${item.name}`)
}

const handleDeactivate = (item: any) => {
  console.log('❌ Deactivate item:', item)
  // Implement deactivate logic here
  if (confirm(`Deactivate ${item.name}?`)) {
    alert(`Deactivated: ${item.name}`)
  }
}

const handleRefresh = (item: any) => {
  console.log('🔄 Refresh item:', item)
  // Implement refresh logic here
  alert(`Refreshed: ${item.name}`)
}

const handleExport = (item: any) => {
  console.log('📤 Export item:', item)
  // Implement export logic here
  const csvContent = [
    ['Name', 'Location', 'Status', 'Capacity'],
    [item.name, item.location, item.status, item.capacity]
  ].map(row => row.join(',')).join('\n')
  
  const blob = new Blob([csvContent], { type: 'text/csv' })
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${item.name.replace(/\s+/g, '_')}.csv`
  a.click()
  window.URL.revokeObjectURL(url)
}

const handleShare = (item: any) => {
  console.log('🔗 Share item:', item)
  // Implement share logic here
  if (navigator.share) {
    navigator.share({
      title: item.name,
      text: `Check out ${item.name} - ${item.location} (${item.capacity})`,
      url: window.location.href
    })
  } else {
    // Fallback for browsers that don't support Web Share API
    const shareText = `Check out ${item.name} - ${item.location} (${item.capacity})`
    navigator.clipboard.writeText(shareText)
    alert(`Share link copied: ${shareText}`)
  }
}
</script>

<template>
  <div class="enhanced-table-example">
    <div class="header-section mb-4">
      <h2 class="text-h4 font-weight-bold mb-2">
        <i class="mdi mdi-table"></i>
        Enhanced Table with Action Buttons
      </h2>
      <p class="text-body-2 text-medium-emphasis mb-4">
        This table demonstrates all available action buttons including Edit, Delete, View, Copy, Download, Print, Archive, Activate, Deactivate, Refresh, Export, and Share functions.
      </p>
    </div>

    <TableIgrid
      :column="columnDefinitions"
      :filterValues="filterValues"
      pathService="/api/sample-endpoint"
      :handleRespDataApi="handleRespDataApi"
      primaryKey="id"
      :editBtn="true"
      :deleteBtn="true"
      :viewBtn="true"
      :copyBtn="true"
      :downloadBtn="true"
      :printBtn="true"
      :archiveBtn="true"
      :activateBtn="true"
      :deactivateBtn="true"
      :refreshBtn="true"
      :exportBtn="true"
      :shareBtn="true"
      :onclickEdit="handleEdit"
      :onclickDelete="handleDelete"
      :onclickView="handleView"
      :onclickCopy="handleCopy"
      :onclickDownload="handleDownload"
      :onclickPrint="handlePrint"
      :onclickArchive="handleArchive"
      :onclickActivate="handleActivate"
      :onclickDeactivate="handleDeactivate"
      :onclickRefresh="handleRefresh"
      :onclickExport="handleExport"
      :onclickShare="handleShare"
    />

    <div class="usage-guide mt-6">
      <h3 class="text-h5 font-weight-bold mb-3">
        <i class="mdi mdi-information"></i>
        Usage Guide
      </h3>
      
      <div class="row">
        <div class="col-md-6">
          <div class="card mb-3">
            <div class="card-body">
              <h6 class="card-title">
                <i class="mdi mdi-pencil text-primary"></i>
                Primary Actions (Always Visible)
              </h6>
              <ul class="list-unstyled">
                <li><strong>Edit:</strong> Modify existing data</li>
                <li><strong>Delete:</strong> Remove data permanently</li>
                <li><strong>Activate:</strong> Enable or activate item</li>
                <li><strong>Deactivate:</strong> Disable or deactivate item</li>
              </ul>
            </div>
          </div>
        </div>
        
        <div class="col-md-6">
          <div class="card mb-3">
            <div class="card-body">
              <h6 class="card-title">
                <i class="mdi mdi-dots-vertical text-secondary"></i>
                Secondary Actions (Dropdown Menu)
              </h6>
              <ul class="list-unstyled">
                <li><strong>View:</strong> See detailed information</li>
                <li><strong>Copy:</strong> Copy data to clipboard</li>
                <li><strong>Download:</strong> Export as JSON file</li>
                <li><strong>Print:</strong> Print formatted details</li>
                <li><strong>Archive:</strong> Move to archive</li>
                <li><strong>Refresh:</strong> Reload item data</li>
                <li><strong>Export:</strong> Export as CSV file</li>
                <li><strong>Share:</strong> Share via Web Share API</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div class="card mt-3">
        <div class="card-body">
          <h6 class="card-title">
            <i class="mdi mdi-code-tags text-info"></i>
            Implementation Example
          </h6>
          <pre class="bg-grey-lighten-5 p-3 rounded"><code><TableIgrid
  :column="columnDefinitions"
  :filterValues="filterValues"
  pathService="/api/your-endpoint"
  :handleRespDataApi="handleRespDataApi"
  :editBtn="true"
  :deleteBtn="true"
  :viewBtn="true"
  :copyBtn="true"
  :downloadBtn="true"
  :printBtn="true"
  :archiveBtn="true"
  :activateBtn="true"
  :deactivateBtn="true"
  :refreshBtn="true"
  :exportBtn="true"
  :shareBtn="true"
  :onclickEdit="handleEdit"
  :onclickDelete="handleDelete"
  :onclickView="handleView"
  :onclickCopy="handleCopy"
  :onclickDownload="handleDownload"
  :onclickPrint="handlePrint"
  :onclickArchive="handleArchive"
  :onclickActivate="handleActivate"
  :onclickDeactivate="handleDeactivate"
  :onclickRefresh="handleRefresh"
  :onclickExport="handleExport"
  :onclickShare="handleShare"
/></code></pre>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.enhanced-table-example {
  padding: 20px;
}

.header-section {
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 30px;
  border-radius: 12px;
  margin-bottom: 30px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.usage-guide .card {
  border: none;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  transition: transform 0.2s ease;
}

.usage-guide .card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0,0,0,0.15);
}

.usage-guide .card-title i {
  margin-right: 8px;
}

.usage-guide ul li {
  margin-bottom: 8px;
  padding-left: 16px;
  position: relative;
}

.usage-guide ul li:before {
  content: "•";
  position: absolute;
  left: 0;
  color: #009688;
  font-weight: bold;
}

pre {
  font-size: 12px;
  max-height: 300px;
  overflow-y: auto;
  border-radius: 8px;
  border: 1px solid #dee2e6;
}

code {
  color: #d63384;
  background-color: transparent;
}
</style>
