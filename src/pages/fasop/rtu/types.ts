<!-- GridjsExample.vue -->
<template>
  <div>
    <h2 class="text-xl font-semibold mb-3">Daftar Data Random</h2>
    <grid :data="rows" :columns="columns" />
  </div>
</template>

<script>
import { Grid } from "gridjs-vue";
import "gridjs/dist/theme/mermaid.css";

export default {
  name: "GridjsExample",
  components: { grid: Grid },
  data() {
    return {
      columns: ["ID", "Nama", "Umur"],
      rows: [],
    }
  },
  created() {
    this.generateRandomData()
  },
  methods: {
    generateRandomData() {
      const names = ["Andi", "Budi", "Cici", "Dewi", "Eko", "Fajar", "Gina", "Heri", "Indah", "Joko"]
      const rows = []

      // Generate 10 baris data random
      for (let i = 1; i <= 10; i++) {
        const randomName = names[Math.floor(Math.random() * names.length)]
        const randomAge = Math.floor(Math.random() * 40) + 18 // umur 18–57
        rows.push([i, randomName, randomAge])
      }

      this.rows = rows
    },
  },
}
</script>

<style scoped>
h2 {
  margin-bottom: 10px;
}
</style>
