<template>
  <div class="skeleton-list" :class="[`layout-${layout}`]">
    <SkeletonCard 
      v-for="i in count" 
      :key="i" 
      :type="cardType"
    />
  </div>
</template>

<script setup>
import SkeletonCard from './SkeletonCard.vue'

defineProps({
  count: {
    type: Number,
    default: 4
  },
  layout: {
    type: String,
    default: 'list', // list | grid
    validator: (val) => ['list', 'grid'].includes(val)
  },
  cardType: {
    type: String,
    default: 'list'
  }
})
</script>

<style lang="scss" scoped>
.skeleton-list {
  &.layout-list {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
  
  &.layout-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 20px;
  }
}
</style>
