<template>
  <div id="app" class="container">
    <header class="main-header">
      <h1>KYB V2 Registry Search Portal</h1>
      <p class="subtitle">Live Server-Proxied Search across Official International Registries</p>
    </header>

    <div v-if="globalError" class="alert alert-danger">{{ globalError }}</div>

    <search-form 
      :countries="countries" 
      :loading="searching" 
      @trigger-search="executeSearch" 
    />

    <section class="results-section">
      <div class="status-bar" v-if="currentResponseId">
        <span>KYB Reference ID: <strong>{{ currentResponseId }}</strong></span>
        <span>
          Status: 
          <strong :class="status === 'active' ? 'text-success' : 'text-warning'">
            {{ status.toUpperCase() }}
          </strong>
        </span>
      </div>

      <company-table 
        :items="companyList" 
        @view-details="openDetailsModal" 
      />

      <pagination 
        :current-page="pagination.currentPage" 
        :total-pages="pagination.totalPages" 
        @page-change="handlePageChange" 
      />
    </section>

    <company-detail-modal 
      v-if="showModal" 
      :details="selectedDetails" 
      :loading="loadingDetails" 
      :error="modalError" 
      @close="showModal = false" 
    />
  </div>
</template>

<script>
import { KybApiService } from './services/kybApi';
import SearchForm from './components/SearchForm.vue';
import CompanyTable from './components/CompanyTable.vue';
import Pagination from './components/Pagination.vue';
import CompanyDetailModal from './components/CompanyDetailModal.vue';

export default {
  name: 'App',
  components: {
    SearchForm,
    CompanyTable,
    Pagination,
    CompanyDetailModal
  },
  data() {
    return {
      countries: [],
      companyList: [],
      currentSearchParams: null,
      currentResponseId: null,
      status: 'pending',
      searching: false,
      globalError: null,
      pollTimer: null,
      
      // Pagination state
      pagination: {
        currentPage: 1,
        totalPages: 1
      },

      // Modal state
      showModal: false,
      selectedDetails: null,
      loadingDetails: false,
      modalError: null
    };
  },
  mounted() {
    this.fetchSupportedCountries();
  },
  beforeUnmount() {
    this.clearPolling();
  },
  methods: {
    // 1. Load Countries Listing
    async fetchSupportedCountries() {
      try {
        const response = await KybApiService.getCountries();
        this.countries = response.data || response.countries || response;
      } catch (err) {
        this.globalError = `Failed to load registry countries: ${err.message}`;
      }
    },

    // 2. Perform Live KYB Search (POST /v2/kyb)
    // async executeSearch(params, page = 1) {
    //   this.searching = true;
    //   this.globalError = null;
    //   this.currentSearchParams = params;
    //   this.pagination.currentPage = page;
    //   this.clearPolling();

    //   const payload = {
    //     country_code: params.country_code || undefined,
    //     company_name: params.company_name || undefined,
    //     registeration_number: params.registeration_number || undefined,
    //     search_type: params.search_type || 'contain',
    //     page: page
    //   };

    //   try {
    //     const res = await KybApiService.initiateKybCheck(payload);
        
    //     // Extract returned company items & metadata
    //     const data = res.data || res;
    //     this.companyList = data.companies || data.result || [];
    //     this.currentResponseId = res.kyb_response_id || data.kyb_response_id;
        
    //     // Set initial status to pending (or active if instantly available)
    //     this.status = res.status || 'pending';
        
    //     // Setup pagination values if provided
    //     if (res.total_pages || data.total_pages) {
    //       this.pagination.totalPages = res.total_pages || data.total_pages;
    //     }

    //     // If status is pending, trigger live polling to resolve state to active
    //     if (this.status === 'pending' && this.currentResponseId) {
    //       this.startStatusPolling(this.currentResponseId);
    //     } else {
    //       this.status = 'active';
    //     }
    //   } catch (err) {
    //     this.globalError = `Search failed: ${err.message}`;
    //   } finally {
    //     this.searching = false;
    //   }
    // },
// App.vue ke methods inside executeSearch update karein:
async executeSearch(params, page = 1) {
  this.searching = true;
  this.globalError = null;
  this.currentSearchParams = params;
  this.pagination.currentPage = page;
  this.clearPolling();

  const payload = {
    country_code: params.country_code || undefined,
    company_name: params.company_name?.trim() || undefined,
    registration_number: params.registeration_number?.trim() || params.registration_number?.trim() || undefined,
    search_type: params.search_type || 'contain',
    page: page
  };

  try {
    const res = await KybApiService.initiateKybCheck(payload);
    const data = res.data || res;

    // Normalizing company data list
    const rawList = data.companies || data.result || (Array.isArray(data) ? data : []);
    this.companyList = rawList.map(item => ({
      ...item,
      name: item.name || item.company_name || 'N/A',
      registration_number: item.registration_number || item.registeration_number || 'N/A'
    }));

    this.currentResponseId = res.kyb_response_id || data.kyb_response_id;
    this.status = res.status || 'pending';

    if (this.status === 'pending' && this.currentResponseId) {
      this.startStatusPolling(this.currentResponseId);
    } else {
      this.status = 'active';
    }
  } catch (err) {
    this.globalError = `Search error: ${err.message}`;
  } finally {
    this.searching = false;
  }
},
    // 3. Live Polling (GET /v2/kyb) to resolve pending status to active
    startStatusPolling(kybResponseId) {
      this.pollTimer = setInterval(async () => {
        try {
          const res = await KybApiService.getKybStatus(kybResponseId);
          if (res.status === 'active' || res.status === 'completed') {
            this.status = 'active';
            if (res.data && res.data.companies) {
              this.companyList = res.data.companies;
            }
            this.clearPolling();
          }
        } catch (err) {
          console.error("Polling error:", err);
        }
      }, 3000); // Poll every 3 seconds
    },

    clearPolling() {
      if (this.pollTimer) {
        clearInterval(this.pollTimer);
        this.pollTimer = null;
      }
    },

    // 4. Handle Page Change
    handlePageChange(newPage) {
      if (this.currentSearchParams) {
        this.executeSearch(this.currentSearchParams, newPage);
      }
    },

    // 5. Retrieve Full Record Resolution (GET /v2/kyb/:kyb_response_id)
    async openDetailsModal(company) {
      this.showModal = true;
      this.loadingDetails = true;
      this.modalError = null;
      this.selectedDetails = null;

      const responseId = company.kyb_response_id || this.currentResponseId;

      try {
        const details = await KybApiService.getKybDetails(responseId);
        this.selectedDetails = details;
      } catch (err) {
        this.modalError = `Could not resolve company details: ${err.message}`;
      } finally {
        this.loadingDetails = false;
      }
    }
  }
};
</script>