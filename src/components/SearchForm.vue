<template>
  <form @submit.prevent="onSearch" class="search-form">
    <div class="form-row">
      <country-select 
        v-model="searchParams.country_code" 
        :countries="countries" 
        :loading="loading" 
      />

      <div class="form-group">
        <label>Company Name:</label>
        <input 
          type="text" 
          v-model="searchParams.company_name" 
          placeholder="e.g. Acme Corp" 
        />
      </div>

      <div class="form-group">
        <label>Registration Number:</label>
        <input 
          type="text" 
          v-model="searchParams.registeration_number" 
          placeholder="e.g. 12345678" 
        />
      </div>

      <div class="form-group">
        <label>Search Type:</label>
        <select v-model="searchParams.search_type">
          <option value="contain">Contain (Default)</option>
          <option value="start">Start</option>
          <option value="fuzzy">Fuzzy</option>
        </select>
      </div>
    </div>

    <button type="submit" :disabled="loading || !isValid">
      <span v-if="loading">Searching...</span>
      <span v-else>Perform Live Search</span>
    </button>
  </form>
</template>

<script>
import CountrySelect from './CountrySelect.vue';

export default {
  name: 'SearchForm',
  components: { CountrySelect },
  props: {
    countries: Array,
    loading: Boolean
  },
  data() {
    return {
      searchParams: {
        country_code: '',
        company_name: '',
        registeration_number: '',
        search_type: 'contain'
      }
    };
  },
  computed: {
    isValid() {
      return this.searchParams.company_name.trim() !== '' || 
             this.searchParams.registeration_number.trim() !== '';
    }
  },
  methods: {
    onSearch() {
      this.$emit('trigger-search', { ...this.searchParams });
    }
  }
};
</script>