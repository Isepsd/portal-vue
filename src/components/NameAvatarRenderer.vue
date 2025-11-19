
<script setup lang="ts">
import { User as UserIcon } from "lucide-vue-next";

// props dari AG Grid
defineProps<{ params: any }>();
</script>

<template>
  <div class="d-flex align-items-center">
    <UserIcon class="icon-avatar" />
    <div class="ps-3">
      <div class="fw-bold">{{ params.data.fullname }}</div>
      <div class="text-muted" style="font-size: 12px;">
        {{ params.data.username }}
      </div>
    </div>
  </div>
</template>


<style scoped>
.icon-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  padding: 6px;
  background: #e0f2f1;
  color: #009688;
}
</style>
