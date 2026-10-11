<template>
  <div class="form-group">
    <label for="country">Select Country / Registry:</label>
    <select 
      id="country" 
      :value="modelValue" 
      @change="$emit('update:modelValue', $event.target.value)"
      :disabled="loading"
    >
      <option value="">-- All Countries (Includes Pakistan) --</option>
      <option 
        v-for="country in sortedCountries" 
        :key="country.code" 
        :value="country.code"
      >
        {{ country.name }} ({{ country.code }})
      </option>
    </select>
  </div>
</template>

<script>
export default {
  name: 'CountrySelect',
  props: {
    modelValue: {
      type: String,
      default: ''
    },
    countries: {
      type: Array,
      default: () => []
    },
    loading: {
      type: Boolean,
      default: false
    }
  },
  emits: ['update:modelValue'],
  computed: {
    sortedCountries() {
      // Clone original list
      let list = [...this.countries].map(c => ({
        name: c.name || c.country_name || 'Unknown',
        code: c.code || c.country_code || ''
      }));

      // Ensure Pakistan (PK) is included if API misses it
      const hasPakistan = list.some(c => c.code.toUpperCase() === 'PK');
      if (!hasPakistan) {
        list.push({ name: 'Pakistan', code: 'PK' });
      }

      // Sort A to Z by Country Name
      return list.sort((a, b) => a.name.localeCompare(b.name));
    }
  }
};
</script>