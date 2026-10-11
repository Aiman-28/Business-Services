<template>
  <div class="modal-backdrop" @click.self="$emit('close')">
    <div class="modal-card">
      <header class="modal-header">
        <h3>Live Registry Record Resolution</h3>
        <button class="close-btn" @click="$emit('close')">&times;</button>
      </header>

      <section class="modal-body">
        <div v-if="loading" class="spinner">Fetching detailed company payload...</div>
        <div v-else-if="error" class="error-msg">{{ error }}</div>
        <pre v-else class="json-tree">{{ JSON.stringify(details, null, 2) }}</pre>
      </section>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CompanyDetailModal',
  props: {
    details: Object,
    loading: Boolean,
    error: String
  },
  emits: ['close']
};
</script>