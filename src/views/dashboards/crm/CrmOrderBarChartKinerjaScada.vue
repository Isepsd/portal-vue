<script setup lang="ts">
import { computed, defineProps, ref } from 'vue'
import VueApexCharts from 'vue3-apexcharts'

const props = defineProps({
  series: { type: Array, default: () => [] },
  categories: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
  title: { type: String, default: 'Kinerja Point' },
  titleY: { type: String, default: 'Jumlah Point' },
  secondaryYAxisTitle: { type: String, default: 'Persentase' },
  type: { type: String, default: 'bar' },
})

// State toggle zoom mode
const zoomMode = ref(false)

// 🔹 Format ulang series supaya ApexCharts tahu mana axis yang dipakai
const formattedSeries = computed(() => {
  return props.series.map((item: any) => ({
    name: item.name,
    data: item.data,
    type: zoomMode.value ? 'line' : 'bar', // tetap bisa menyesuaikan mode
    yAxisIndex: item.yAxis || 0, // mapping ke yAxis kiri (0) atau kanan (1)
  }))
})

const chartOptions = computed(() => ({
  chart: {
    type: zoomMode.value ? 'line' : props.type,
    height: 630,
    stacked: !zoomMode.value,
    zoom: {
      enabled: zoomMode.value,
      type: 'x',
      autoScaleYaxis: true,
    },
    toolbar: {
      show: true,
      tools: {
        zoom: true,
        zoomin: true,
        zoomout: true,
        reset: true,
      },
    },
  },

  title: {
    text: props.title,
    align: 'center',
  },

  xaxis: {
    categories: props.categories,
    title: { text: 'Point' },
  },

  yaxis: [
    {
      title: { text: props.titleY },
      min: 0,
    },
    {
      opposite: true,
      title: { text: props.secondaryYAxisTitle },
      labels: { formatter: (val: number) => `${val}%` },
    },
  ],

  tooltip: {
    shared: true,
    intersect: false,
    custom: function ({ series, seriesIndex, dataPointIndex, w }: any) {
      const category = w.globals.labels[dataPointIndex]
      let tooltip = `<strong>${category}</strong><br/>`
      series.forEach((s: any, i: number) => {
        tooltip += `<span style="color:${w.globals.colors[i]}">\u25CF</span> ${w.config.series[i].name}: ${s[dataPointIndex]}<br/>`
      })
      return tooltip
    },
  },

  plotOptions: {
    bar: {
      horizontal: false,
      borderRadius: 4,
      columnWidth: '40%',
    },
  },

  dataLabels: { enabled: false },
  legend: { position: 'bottom' },
}))
</script>

<template>
  <div v-if="loading" class="text-center py-4">Loading...</div>

  <template v-else>
    <div v-if="categories.length">
      <div class="flex justify-end mb-2">
        <button
          class="bg-blue-500 hover:bg-blue-600 text-white text-sm px-3 py-1 rounded"
          @click="zoomMode = !zoomMode"
        >
          {{ zoomMode ? 'Disable Zoom Mode' : 'Enable Zoom Mode' }}
        </button>
      </div>

      <VueApexCharts
        :options="chartOptions"
        :series="formattedSeries"
        height="630"
      />
    </div>

    <div v-else class="position-relative">
      <p class="text-center text-muted">No Data</p>
    </div>
  </template>
</template>

<style scoped>
.chart-container {
  width: 100%;
  overflow-x: auto;
}
</style>
