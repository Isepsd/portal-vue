<script setup lang="ts">
import { hexToRgb } from '@layouts/utils';
import { computed, ref } from 'vue';
import VueApexCharts from 'vue3-apexcharts';
import { useTheme } from 'vuetify';

const props = defineProps({
  categories: { type: Array as PropType<string[]>, required: true },
  series: { type: Array as PropType<any[]>, required: true },
  loading: { type: Boolean, default: false },
});

const vuetifyTheme = useTheme();
const currentTab = ref<number>(0);
const refVueApexChart = ref();

const { colors, variables } = vuetifyTheme.current.value;

const getLabelColor = (colorKey: string) => `rgba(${hexToRgb(colors[colorKey])}, ${variables['dragged-opacity']})`;

const chartConfigs = computed(() => {
  const labelPrimaryColor = getLabelColor('primary');
  const legendColor = getLabelColor('on-background');
  const borderColor = `rgba(${hexToRgb(String(variables['border-color']))}, ${variables['border-opacity']})`;
  const labelColor = `rgba(${hexToRgb(colors['on-surface'])}, ${variables['disabled-opacity']})`;
  
  // Generate colors dynamically based on the number of series
  const lineColors = props.series.map((_, index) => {
    const baseColors = [
      'rgba(255, 99, 132, 1)',  // Red
      'rgba(54, 162, 235, 1)',  // Blue
      'rgba(255, 206, 86, 1)',  // Yellow
      'rgba(75, 192, 192, 1)',  // Green
      'rgba(153, 102, 255, 1)', // Purple
      'rgba(255, 159, 64, 1)',  // Orange
    ];
    return baseColors[index % baseColors.length]; // Reuse colors if there are more series than base colors
  });

  return [
    {
      title: 'Income',
      icon: 'tabler-chart-pie-2',
      chartOptions: {
        chart: {
          type: 'line',
          toolbar: { show: false },
        },
        plotOptions: {
          line: {
            dataLabels: { position: 'top' },
          },
        },
        grid: { show: true },
        colors: lineColors,  // Use the dynamically generated colors
        dataLabels: {
          enabled: true,
          formatter: (val: number) => `${val}%`, // Add percent symbol
          offsetY: -60,
          style: { fontSize: '15px', colors: [legendColor], fontWeight: '600', fontFamily: 'Public Sans' },
        },
        legend: { show: true },
        tooltip: { enabled: true },
        xaxis: {
          categories: props.categories,
          axisBorder: { show: true, color: borderColor },
          labels: { style: { colors: labelColor, fontSize: '13px', fontFamily: 'Public Sans' } },
        },
        yaxis: {
          labels: {
            offsetX: -15,
            formatter: (val: number) => `${val}%`, // Add percent symbol on y-axis
            style: { fontSize: '13px', colors: labelColor, fontFamily: 'Public Sans' },
            min: 0,
            max: 100, // Max value 100%
            tickAmount: 6,
          },
        },
        responsive: [
          { breakpoint: 1441, options: { plotOptions: { line: { curve: 'smooth' } } } },
          {
            breakpoint: 590,
            options: {
              plotOptions: { line: { curve: 'smooth' } },
              dataLabels: { style: { fontSize: '12px', fontWeight: '400' } },
              grid: { padding: { right: 0 } },
              yaxis: { labels: { show: false } },
            },
          },
        ],
      },
      series: props.series, // Multiple series can be added here
    },
  ];
});
</script>

<template>
  <VCard title="Grafik Kinerja Scada">
    <template #append>
      <div class="mt-n4 me-n2">
        <!-- <MoreBtn size="small" :menu-list="moreList" /> -->
      </div>
    </template>

    <VCardText>
      <VSlideGroup v-model="currentTab" show-arrows mandatory class="mb-10">
        <!-- Tab navigation code here if needed -->
      </VSlideGroup>

      <VueApexCharts
        ref="refVueApexChart"
        :key="currentTab"
        :options="chartConfigs[Number(currentTab)].chartOptions"
        :series="chartConfigs[Number(currentTab)].series"
        height="300"
        class="mt-3"
      />

      <!-- Table Data Section -->
      <div style="margin-top: 20px;">
        <VCard>
          <VCardTitle>Table Data</VCardTitle>
          <VCardText>
            <div style="width: 100%; max-height: 300px; overflow-y: auto; border: 1px solid #ddd;">
              <table style="width: 100%; min-width: 100%; border-collapse: collapse;">
                <thead>
                      <tr>
                        <th
                          style="
                            border: 1px solid #ddd;
                            padding: 8px;
                            position: sticky;
                            top: 0;
                            background-color: #20B2AA;
                            color: white;
                          "
                        >
                          Category
                        </th>

                        <!-- Render Series Headers -->
                        <template v-for="(s, index) in props.series" :key="index">
                          <th
                            style="
                              border: 1px solid #ddd;
                              padding: 8px;
                              position: sticky;
                              top: 0;
                              background-color: #20B2AA;
                              color: white;
                            "
                          >
                            {{ s.name }}
                          </th>
                        </template>
                      </tr>
                    </thead>

                <tbody>
                  <!-- Render Table Rows for Categories -->
                  <template v-for="(category, catIndex) in props.categories" :key="catIndex">
                    <tr>
                      <td style="border: 1px solid #ddd; padding: 8px;">{{ category }}</td>
                      <!-- Render Data for Each Series -->
                      <template v-for="(s, serIndex) in props.series" :key="serIndex">
                        <td style="border: 1px solid #ddd; padding: 8px;">
                          {{ s.data[catIndex] !== undefined ? s.data[catIndex] : '-' }}
                        </td>
                      </template>
                    </tr>
                  </template>
                </tbody>
              </table>
            </div>
          </VCardText>
        </VCard>
      </div>
    </VCardText>
  </VCard>
</template>
