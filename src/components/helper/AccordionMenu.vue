<script setup lang="ts">
import TreeItem from "./TreeItem.vue";
defineProps<{ menu: any[] }>();
defineEmits(["edit", "delete", "move"]);
</script>

<template>
  <div class="accordion-menu">
    <ul class="tree-list">
      <TreeItem
        v-for="item in menu"
        :key="item.id"
        :item="item"
        @edit="$emit('edit', $event)"
        @delete="$emit('delete', $event)"
        @move="$emit('move', $event)"
      />
    </ul>
  </div>
</template>


<style scoped>
.accordion-menu {
  background: #ffffff;
  padding: 6px;
  border-radius: 6px;
}

.tree-list {
  list-style: none;
  padding-left: 0;
  margin: 0;
}
</style>
