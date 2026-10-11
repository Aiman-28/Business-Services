<template>
  <div class="pagination-controls" v-if="totalPages > 1">
    <button 
      :disabled="currentPage <= 1" 
      @click="$emit('page-change', currentPage - 1)"
    >
      &laquo; Previous
    </button>
    
    <span>Page {{ currentPage }} of {{ totalPages }}</span>

    <button 
      :disabled="currentPage >= totalPages" 
      @click="$emit('page-change', currentPage + 1)"
    >
      Next &raquo;
    </button>
  </div>
</template>

<script>
export default {
  name: 'Pagination',
  props: {
    currentPage: {
      type: Number,
      required: true
    },
    totalPages: {
      type: Number,
      required: true
    }
  },
  emits: ['page-change']
};
</script>