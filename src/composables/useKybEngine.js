import { ref, reactive, computed, onUnmounted } from 'vue'
import { KybService } from '../services/kybApi'

export function useKybEngine() {
  const countries = ref([])
  const records = ref([])
  const selectedRecord = ref(null)

  const loading = ref(false)
  const isSubmitting = ref(false)
  const errorMessage = ref('')
  const autoResolvedCount = ref(0)

  // Pagination State
  const pagination = reactive({
    currentPage: 1,
    perPage: 10,
    totalPages: 1,
    totalRecords: 0
  })

  // Poll intervals store karne ke liye
  const pollIntervals = new Map()

  // Dynamic Counters
  const activeCount = computed(() => records.value.filter(r => r.status === 'active' || r.status === 'verified').length)
  const pendingCount = computed(() => records.value.filter(r => r.status === 'pending').length)

  // 1. Fetch Countries
  const loadCountries = async () => {
    try {
      const res = await KybService.getCountries()
      countries.value = res.data.countries || res.data || []
    } catch (err) {
      errorMessage.value = 'Failed to fetch country list.'
    }
  }

  // 2. Fetch Live Paginated Records
  const fetchLiveRecords = async (page = 1) => {
    loading.value = true
    errorMessage.value = ''
    try {
      const res = await KybService.getVerifications({
        page: page,
        limit: pagination.perPage
      })

      const data = res.data
      records.value = data.data || data.results || []
      pagination.currentPage = page
      pagination.totalPages = data.total_pages || Math.ceil((data.total || records.value.length) / pagination.perPage)
      pagination.totalRecords = data.total || records.value.length

      // Check for pending items to auto-poll
      checkAndPollPendingItems()
    } catch (err) {
      errorMessage.value = 'Could not load registry records.'
    } finally {
      loading.value = false
    }
  }

  // 3. Initiate New Search
  const submitSearch = async (formPayload) => {
    isSubmitting.value = true
    errorMessage.value = ''
    try {
      const res = await KybService.createVerification(formPayload)
      await fetchLiveRecords(1) // Refresh table live
      if (res.data?.status === 'pending') {
        startPollingItem(res.data.kyb_response_id || res.data.id)
      }
    } catch (err) {
      errorMessage.value = err.response?.data?.message || 'Verification request failed.'
    } finally {
      isSubmitting.value = false
    }
  }

  // 4. Auto-Resolution Logic (Pending -> Active)
  const startPollingItem = (id) => {
    if (!id || pollIntervals.has(id)) return

    const intervalId = setInterval(async () => {
      try {
        const res = await KybService.getVerificationById(id)
        const updated = res.data

        if (updated.status !== 'pending') {
          // Update item in live array
          const index = records.value.findIndex(r => (r.kyb_response_id || r.id) === id)
          if (index !== -1) {
            records.value[index] = updated
          }
          autoResolvedCount.value++
          clearInterval(intervalId)
          pollIntervals.delete(id)
        }
      } catch (e) {
        clearInterval(intervalId)
        pollIntervals.delete(id)
      }
    }, 5000) // Every 5 seconds check backend status

    pollIntervals.set(id, intervalId)
  }

  const checkAndPollPendingItems = () => {
    records.value.forEach(item => {
      if (item.status === 'pending') {
        startPollingItem(item.kyb_response_id || item.id)
      }
    })
  }

  // Fetch Full Details Modal
  const loadSingleDetails = async (id) => {
    try {
      const res = await KybService.getVerificationById(id)
      selectedRecord.value = res.data
    } catch (err) {
      errorMessage.value = 'Failed to load details.'
    }
  }

  onUnmounted(() => {
    pollIntervals.forEach(interval => clearInterval(interval))
  })

  return {
    countries,
    records,
    selectedRecord,
    loading,
    isSubmitting,
    errorMessage,
    pagination,
    activeCount,
    pendingCount,
    autoResolvedCount,
    loadCountries,
    fetchLiveRecords,
    submitSearch,
    loadSingleDetails
  }
}