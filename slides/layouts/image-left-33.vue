<script setup lang="ts">
import { computed } from 'vue'
import { handleBackground } from '@slidev/theme-default/layoutHelper';

const props = defineProps({
  image: {
    type: String,
  },
  class: {
    type: String,
  },
})

const style = computed(() => handleBackground(props.image))
</script>

<template>
  <div class="grid grid-cols-3 w-full h-full auto-rows-fr">
    <div class="col-span-1 w-full h-full" :style="style" />
    <div class="slidev-layout default col-span-2" :class="props.class">
      <slot />
    </div>
  </div>
</template>