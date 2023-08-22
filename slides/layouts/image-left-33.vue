<script setup lang="ts">
import { computed } from 'vue'

import type { CSSProperties } from 'vue'

/**
 * Resolve urls from frontmatter and append with the base url
 */
 function resolveAssetUrl(url: string) {
  if (url.startsWith('/'))
    return import.meta.env.BASE_URL + url.slice(1)
  return url
}

 function handleBackground(background?: string, dim = false, backgroundSize = 'cover'): CSSProperties {
  const isColor = background && (background[0] === '#' || background.startsWith('rgb'))

  const style = {
    background: isColor
      ? background
      : undefined,
    color: (background && !isColor)
      ? 'white'
      : undefined,
    backgroundImage: isColor
      ? undefined
      : background
        ? dim
          ? `linear-gradient(#0005, #0008), url(${resolveAssetUrl(background)})`
          : `url("${resolveAssetUrl(background)}")`
        : undefined,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center',
    backgroundSize,
  }

  if (!style.background)
    delete style.background

  return style
}


const props = defineProps({
  image: {
    type: String,
  },
  class: {
    type: String,
  },
  backgroundSize: {
    type: String,
    default: 'cover',
  },
})

const style = computed(() => handleBackground(props.image, false, props.backgroundSize))
</script>

<template>
  <div class="grid grid-cols-3 w-full h-full auto-rows-fr">
    <div class="col-span-1 w-full h-full" :style="style" />
    <div class="slidev-layout default col-span-2" :class="props.class">
      <slot />
    </div>
  </div>
</template>