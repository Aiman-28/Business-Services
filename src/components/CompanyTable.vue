<template>
  <div class="table-container">
    <table class="kyb-table">
      <thead>
        <tr>
          <th>Company Name</th>
          <th>Registry Number</th>
          <th>Country</th>
          <th>Status</th>
          <th>State / Resolution</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="items.length === 0">
          <td colspan="6" class="text-center">No registry data retrieved yet. Run a live query above.</td>
        </tr>
        <tr v-for="item in items" :key="item.id || item.kyb_response_id">
          <td>{{ item.name || item.company_name || 'N/A' }}</td>
          <td>{{ item.registration_number || item.registeration_number || 'N/A' }}</td>
          <td>{{ item.country_code || item.country || 'Global' }}</td>
          <td>
            <span :class="['badge', item.status === 'active' ? 'badge-success' : 'badge-warning']">
              {{ item.status || 'pending' }}
            </span>
          </td>
          <td>
            <span class="resolve-state">{{ item.resolve_state || item.state || 'Resolved' }}</span>
          </td>
          <td>
            <button @click="$emit('view-details', item)" class="btn-sm">
              View Live Data
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
export default {
  name: 'CompanyTable',
  props: {
    items: {
      type: Array,
      default: () => []
    }
  },
  emits: ['view-details']
};
</script>