<template>
  <div class="container-fluid py-4">
    <div class="row">
      <div class="col-12">
        <div class="d-flex justify-content-between align-items-center mb-4">
          <h1 class="h3 mb-0">Work Log</h1>
          <button class="btn btn-primary" @click="showAddModal">
            <i class="bi bi-plus-circle me-2"></i>Log Work Day
          </button>
        </div>
      </div>
    </div>

    <!-- Filters -->
    <div class="row mb-4">
      <div class="col-lg-6">
        <div class="card">
          <div class="card-body">
            <div class="row g-3">
              <div class="col-md-6">
                <label class="form-label">Month</label>
                <select class="form-select" v-model="filters.month" @change="fetchWorkDays">
                  <option value="">All Months</option>
                  <option v-for="month in months" :key="month.value" :value="month.value">
                    {{ month.label }}
                  </option>
                </select>
              </div>
              <div class="col-md-6">
                <label class="form-label">Year</label>
                <select class="form-select" v-model="filters.year" @change="fetchWorkDays">
                  <option v-for="year in years" :key="year" :value="year">{{ year }}</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>          <div class="col-lg-6">
        <div class="card">
          <div class="card-body">
            <h6 class="card-title">Period Summary</h6>
            <div class="row g-3">
              <div class="col-6">
                <div class="text-center">
                  <div class="h5 text-success mb-1">€{{ formatEuroAmount(totalTips) }}</div>
                  <small class="text-muted">Total Tips</small>
                </div>
              </div>
              <div class="col-6">
                <div class="text-center">
                  <div class="h5 text-primary mb-1">{{ totalDays }}</div>
                  <small class="text-muted">Work Days</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Payment Status Summary -->
    <div class="row mb-4">
      <div class="col-12">
        <div class="card">
          <div class="card-body">
            <h6 class="card-title">Payment Status</h6>
            <div class="row g-3">
              <div class="col-md-3">
                <div class="text-center">
                  <div class="h5 text-warning mb-1">{{ pendingSummary.days_count }}</div>
                  <small class="text-muted">Pending Days</small>
                  <div class="text-warning fw-bold">€{{ formatEuroAmount(pendingSummary.total_earnings) }}</div>
                  <small class="text-muted">Daily Earnings</small>
                  <div class="text-success">€{{ formatEuroAmount(pendingSummary.total_tips) }}</div>
                  <small class="text-muted">Tips</small>
                </div>
              </div>
              <div class="col-md-3">
                <div class="text-center">
                  <div class="h5 text-success mb-1">{{ paidSummary.days_count }}</div>
                  <small class="text-muted">Paid Days</small>
                  <div class="text-success fw-bold">€{{ formatEuroAmount(paidSummary.total_earnings) }}</div>
                  <small class="text-muted">Daily Earnings</small>
                  <div class="text-success">€{{ formatEuroAmount(paidSummary.total_tips) }}</div>
                  <small class="text-muted">Tips</small>
                </div>
              </div>
              <div class="col-md-3">
                <div class="text-center">
                  <div class="h5 text-info mb-1">€{{ formatEuroAmount(pendingSummary.total_earnings) }}</div>
                  <small class="text-muted">Awaiting Earnings</small>
                  <div class="text-info">€{{ formatEuroAmount(pendingSummary.total_tips) }}</div>
                  <small class="text-muted">Awaiting Tips</small>
                </div>
              </div>
              <div class="col-md-3">
                <div class="text-center">
                  <div class="h5 text-primary mb-1">€{{ formatEuroAmount((pendingSummary.total_earnings || 0) + (pendingSummary.total_tips || 0)) }}</div>
                  <small class="text-muted">Total Awaiting</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Work Days Table -->
    <div class="row">
      <div class="col-12">
        <div class="card">
          <div class="card-header">
            <h5 class="mb-0">Work Days</h5>
          </div>
          <div class="card-body">
            <div v-if="loading" class="text-center py-4">
              <div class="spinner-border text-primary" role="status"></div>
            </div>

            <div v-else-if="workDays.length === 0" class="text-center py-4">
              <i class="bi bi-calendar-x text-muted" style="font-size: 3rem;"></i>
              <p class="text-muted mt-2">No work days logged yet</p>
              <button class="btn btn-primary" @click="showAddModal">Log Your First Work Day</button>
            </div>

            <div v-else>
              <div class="table-responsive">
                <table class="table table-hover">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Work Hours</th>
                      <th>Hours Worked</th>
                      <th>Tips</th>
                      <th>Hourly Rate</th>
                      <th>Daily Payment</th>
                      <th>Total Earnings</th>
                      <th>Payment Status</th>
                      <th>Notes</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="day in workDays" :key="day.id">
                      <td>{{ formatDate(day.work_date) }}</td>
                      <td>
                        <span v-if="day.start_time && day.end_time" class="badge bg-info">
                          {{ formatTime(day.start_time) }} - {{ formatTime(day.end_time) }}
                        </span>
                        <span v-else class="text-muted">-</span>
                      </td>
                      <td>{{ day.hours_worked }}h</td>
                      <td class="text-success">
                        <span v-if="day.tips_amount > 0">€{{ formatEuroAmount(day.tips_amount) }}</span>
                        <span v-else class="text-muted">-</span>
                      </td>
                      <td>€{{ formatEuroAmount(day.hourly_rate) }}</td>
                      <td class="text-success fw-bold">€{{ formatEuroAmount(day.calculated_payment) }}</td>
                      <td class="text-success fw-bold">€{{ formatEuroAmount((parseFloat(day.calculated_payment) + parseFloat(day.tips_amount || 0))) }}</td>
                      <td>
                        <span 
                          :class="`badge ${day.payment_status === 'paid' ? 'bg-success' : 'bg-warning'}`"
                          style="cursor: pointer"
                          @click="togglePaymentStatus(day)"
                          :title="`Click to mark as ${day.payment_status === 'paid' ? 'pending' : 'paid'}`"
                        >
                          {{ day.payment_status === 'paid' ? 'Paid' : 'Pending' }}
                        </span>
                        <div v-if="day.payment_date" class="small text-muted mt-1">
                          {{ formatDate(day.payment_date) }}
                        </div>
                      </td>
                      <td>{{ day.notes || '-' }}</td>
                      <td>
                        <div class="btn-group btn-group-sm">
                          <button class="btn btn-outline-primary" @click="editWorkDay(day)">
                            <i class="bi bi-pencil"></i>
                          </button>
                          <button class="btn btn-outline-danger" @click="deleteWorkDay(day)">
                            <i class="bi bi-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <!-- Pagination -->
              <nav v-if="pagination.totalPages > 1" class="mt-4">
                <ul class="pagination justify-content-center">
                  <li class="page-item" :class="{ disabled: pagination.page === 1 }">
                    <button class="page-link" @click="changePage(pagination.page - 1)">Previous</button>
                  </li>
                  <li
                    v-for="page in visiblePages"
                    :key="page"
                    class="page-item"
                    :class="{ active: page === pagination.page }"
                  >
                    <button class="page-link" @click="changePage(page)">{{ page }}</button>
                  </li>
                  <li class="page-item" :class="{ disabled: pagination.page === pagination.totalPages }">
                    <button class="page-link" @click="changePage(pagination.page + 1)">Next</button>
                  </li>
                </ul>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Add/Edit Work Day Modal -->
    <div class="modal fade" id="workDayModal" tabindex="-1">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ editingWorkDay ? 'Edit Work Day' : 'Log Work Day' }}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="saveWorkDay">
              <div class="mb-3">
                <label class="form-label">Date</label>
                <input
                  type="date"
                  class="form-control"
                  v-model="workDayForm.workDate"
                  :disabled="editingWorkDay"
                  required
                >
              </div>
              <div class="row mb-3">
                <div class="col-md-6">
                  <label class="form-label">Start Time (Optional)</label>
                  <input
                    type="time"
                    class="form-control"
                    v-model="workDayForm.startTime"
                    @change="calculateHoursFromTime"
                  >
                </div>
                <div class="col-md-6">
                  <label class="form-label">End Time (Optional)</label>
                  <input
                    type="time"
                    class="form-control"
                    v-model="workDayForm.endTime"
                    @change="calculateHoursFromTime"
                  >
                </div>
              </div>
              <div class="mb-3">
                <label class="form-label">Hours Worked</label>
                <input
                  type="number"
                  step="0.25"
                  min="0"
                  max="24"
                  class="form-control"
                  v-model="workDayForm.hoursWorked"
                  required
                >
                <div class="form-text">You can enter start/end times above or manually enter hours here</div>
              </div>
              <div class="mb-3">
                <label class="form-label">Tips Amount (€)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  class="form-control"
                  v-model="workDayForm.tipsAmount"
                  placeholder="0,00"
                >
              </div>
              <div class="mb-3">
                <label class="form-label">Notes (Optional)</label>
                <textarea
                  class="form-control"
                  v-model="workDayForm.notes"
                  rows="3"
                  placeholder="Any notes about this work day..."
                ></textarea>
              </div>
              <div class="text-end">
                <button type="button" class="btn btn-secondary me-2" data-bs-dismiss="modal">Cancel</button>
                <button type="submit" class="btn btn-primary" :disabled="savingWorkDay">
                  {{ savingWorkDay ? 'Saving...' : 'Save' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useToast } from 'vue-toastification'
import api from '@/services/api'
import { format } from 'date-fns'
import { formatEuroAmount } from '@/utils/currency'

export default {
  name: 'Work',
  setup () {
    const toast = useToast()

    const loading = ref(false)
    const workDays = ref([])
    const pagination = ref({ page: 1, totalPages: 1, total: 0 })
    const editingWorkDay = ref(null)
    const savingWorkDay = ref(false)
    const paymentSummary = ref({ pending: {}, paid: {} })

    const filters = ref({
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear()
    })

    const workDayForm = ref({
      workDate: format(new Date(), 'yyyy-MM-dd'),
      startTime: '',
      endTime: '',
      hoursWorked: 8,
      tipsAmount: 0,
      notes: ''
    })

    const months = [
      { value: 1, label: 'January' },
      { value: 2, label: 'February' },
      { value: 3, label: 'March' },
      { value: 4, label: 'April' },
      { value: 5, label: 'May' },
      { value: 6, label: 'June' },
      { value: 7, label: 'July' },
      { value: 8, label: 'August' },
      { value: 9, label: 'September' },
      { value: 10, label: 'October' },
      { value: 11, label: 'November' },
      { value: 12, label: 'December' }
    ]

    const years = computed(() => {
      const currentYear = new Date().getFullYear()
      return Array.from({ length: 5 }, (_, i) => currentYear - 2 + i)
    })

    const totalTips = computed(() => {
      return workDays.value.reduce((sum, day) => sum + parseFloat(day.tips_amount || 0), 0).toFixed(2)
    })

    const totalDays = computed(() => {
      return workDays.value.length
    })

    const pendingSummary = computed(() => {
      return paymentSummary.value.pending || { days_count: 0, total_earnings: 0, total_tips: 0 }
    })

    const paidSummary = computed(() => {
      return paymentSummary.value.paid || { days_count: 0, total_earnings: 0, total_tips: 0 }
    })

    const visiblePages = computed(() => {
      const total = pagination.value.totalPages
      const current = pagination.value.page
      const pages = []

      for (let i = Math.max(1, current - 2); i <= Math.min(total, current + 2); i++) {
        pages.push(i)
      }
      return pages
    })

    const formatDate = (dateString) => {
      return format(new Date(dateString), 'MMM dd, yyyy')
    }

    const formatTime = (timeString) => {
      if (!timeString) return ''
      const [hours, minutes] = timeString.split(':')
      const hour = parseInt(hours)
      const ampm = hour >= 12 ? 'PM' : 'AM'
      const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour
      return `${displayHour}:${minutes} ${ampm}`
    }

    const calculateHoursFromTime = () => {
      const { startTime, endTime } = workDayForm.value
      if (startTime && endTime) {
        const start = new Date(`2000-01-01T${startTime}:00`)
        let end = new Date(`2000-01-01T${endTime}:00`)
        
        // Handle overnight shifts (end time is next day)
        if (end <= start) {
          end = new Date(`2000-01-02T${endTime}:00`)
        }
        
        const diffMs = end - start
        const diffHours = diffMs / (1000 * 60 * 60)
        workDayForm.value.hoursWorked = Math.round(diffHours * 4) / 4 // Round to nearest 0.25
      }
    }

    const fetchWorkDays = async (page = 1) => {
      loading.value = true
      try {
        const params = { page, limit: 30 }
        if (filters.value.month) params.month = filters.value.month
        if (filters.value.year) params.year = filters.value.year

        const response = await api.get('/work/days', { params })
        workDays.value = response.data.workDays
        pagination.value = response.data.pagination

        // Fetch payment summary
        await fetchPaymentSummary()
      } catch (error) {
        console.error('Error fetching work days:', error)
        toast.error('Failed to load work days')
      } finally {
        loading.value = false
      }
    }

    const fetchPaymentSummary = async () => {
      try {
        const params = {}
        if (filters.value.month) params.month = filters.value.month
        if (filters.value.year) params.year = filters.value.year

        const response = await api.get('/work/payment/summary', { params })
        paymentSummary.value = response.data
      } catch (error) {
        console.error('Error fetching payment summary:', error)
      }
    }

    const togglePaymentStatus = async (day) => {
      try {
        const newStatus = day.payment_status === 'paid' ? 'pending' : 'paid'
        const data = { paymentStatus: newStatus }
        
        if (newStatus === 'paid') {
          data.paymentDate = new Date().toISOString().split('T')[0]
        }

        await api.patch(`/work/days/${day.id}/payment`, data)
        
        toast.success(`Payment status updated to ${newStatus}`)
        await fetchWorkDays(pagination.value.page)
      } catch (error) {
        console.error('Error updating payment status:', error)
        toast.error('Failed to update payment status')
      }
    }

    const changePage = (page) => {
      if (page >= 1 && page <= pagination.value.totalPages) {
        fetchWorkDays(page)
      }
    }

    const showAddModal = () => {
      editingWorkDay.value = null
      workDayForm.value = {
        workDate: format(new Date(), 'yyyy-MM-dd'),
        startTime: '',
        endTime: '',
        hoursWorked: 8,
        tipsAmount: 0,
        notes: ''
      }
      const modal = new window.Modal(document.getElementById('workDayModal'))
      modal.show()
    }

    const editWorkDay = (day) => {
      editingWorkDay.value = day
      workDayForm.value = {
        workDate: format(new Date(day.work_date), 'yyyy-MM-dd'),
        startTime: day.start_time || '',
        endTime: day.end_time || '',
        hoursWorked: day.hours_worked,
        tipsAmount: day.tips_amount || 0,
        notes: day.notes || ''
      }
      const modal = new window.Modal(document.getElementById('workDayModal'))
      modal.show()
    }

    const saveWorkDay = async () => {
      savingWorkDay.value = true
      try {
        const data = {
          startTime: workDayForm.value.startTime || null,
          endTime: workDayForm.value.endTime || null,
          hoursWorked: parseFloat(workDayForm.value.hoursWorked),
          tipsAmount: parseFloat(workDayForm.value.tipsAmount) || 0,
          notes: workDayForm.value.notes
        }

        console.log('Sending work day data:', data)

        if (editingWorkDay.value) {
          await api.put(`/work/days/${editingWorkDay.value.id}`, data)
          toast.success('Work day updated successfully')
        } else {
          data.workDate = workDayForm.value.workDate
          console.log('Complete data with workDate:', data)
          await api.post('/work/days', data)
          toast.success('Work day logged successfully')
        }

        const modal = window.Modal.getInstance(document.getElementById('workDayModal'))
        modal.hide()
        await fetchWorkDays(pagination.value.page)
      } catch (error) {
        console.error('Error saving work day:', error)
        toast.error(error.response?.data?.message || 'Failed to save work day')
      } finally {
        savingWorkDay.value = false
      }
    }

    const deleteWorkDay = async (day) => {
      if (confirm(`Are you sure you want to delete the work day for ${formatDate(day.work_date)}?`)) {
        try {
          await api.delete(`/work/days/${day.id}`)
          toast.success('Work day deleted successfully')
          await fetchWorkDays(pagination.value.page)
        } catch (error) {
          console.error('Error deleting work day:', error)
          toast.error('Failed to delete work day')
        }
      }
    }

    onMounted(() => {
      fetchWorkDays()
    })

    return {
      loading,
      workDays,
      pagination,
      editingWorkDay,
      savingWorkDay,
      filters,
      workDayForm,
      months,
      years,
      totalTips,
      totalDays,
      pendingSummary,
      paidSummary,
      visiblePages,
      formatDate,
      formatTime,
      formatEuroAmount,
      calculateHoursFromTime,
      fetchWorkDays,
      togglePaymentStatus,
      changePage,
      showAddModal,
      editWorkDay,
      saveWorkDay,
      deleteWorkDay
    }
  }
}
</script>
