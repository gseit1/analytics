<template>
  <div class="work-page">
    <!-- Header Section -->
    <div class="work-header mb-4">
      <div class="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3">
        <div class="header-content">
          <h1 class="h3 mb-1">
            <i class="bi bi-briefcase-fill me-2 text-primary"></i>Work Log
          </h1>
          <p class="text-muted mb-0">Track your work hours, earnings, and manage payments</p>
        </div>
        <div class="header-actions d-flex gap-2">
          <button class="btn btn-outline-primary" @click="showQuickStatsModal" title="View detailed statistics">
            <i class="bi bi-graph-up me-2"></i><span class="btn-text">Quick Stats</span>
          </button>
          <button class="btn btn-primary" @click="showAddModal" title="Log a new work day">
            <i class="bi bi-plus-circle me-2"></i><span class="btn-text">Log Work Day</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Quick Filters & Search -->
    <div class="filters-section mb-4">
      <div class="card border-0 shadow-sm">
        <div class="card-body">
          <div class="row g-3 align-items-end">
            <div class="col-md-3">
              <label class="form-label fw-medium">
                <i class="bi bi-calendar-month me-1"></i>Month
              </label>
              <select class="form-select" v-model="filters.month" @change="fetchWorkDays">
                <option value="">All Months</option>
                <option v-for="month in months" :key="month.value" :value="month.value">
                  {{ month.label }}
                </option>
              </select>
            </div>
            <div class="col-md-3">
              <label class="form-label fw-medium">
                <i class="bi bi-calendar-event me-1"></i>Year
              </label>
              <select class="form-select" v-model="filters.year" @change="fetchWorkDays">
                <option v-for="year in years" :key="year" :value="year">{{ year }}</option>
              </select>
            </div>
            <div class="col-md-4">
              <label class="form-label fw-medium">
                <i class="bi bi-search me-1"></i>Search
              </label>
              <input type="text" class="form-control" v-model="searchQuery" 
                     placeholder="Search by date, notes..." @input="debouncedSearch">
            </div>
            <div class="col-md-2">
              <button class="btn btn-outline-secondary w-100" @click="clearFilters" title="Clear all filters">
                <i class="bi bi-arrow-clockwise me-1"></i>Reset
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- Enhanced Statistics Dashboard -->
    <div class="stats-dashboard mb-4">
      <div class="row g-3">
        <!-- Period Summary Card -->
        <div class="col-lg-8">
          <div class="card border-0 shadow-sm h-100">
            <div class="card-header bg-transparent border-0 pb-0">
              <h6 class="card-title mb-0">
                <i class="bi bi-bar-chart-fill me-2 text-primary"></i>Period Summary
              </h6>
            </div>
            <div class="card-body">
              <div class="row g-3">
                <div class="col-6 col-md-3">
                  <div class="stat-box text-center">
                    <div class="stat-icon bg-primary-subtle">
                      <i class="bi bi-calendar-check text-primary"></i>
                    </div>
                    <div class="stat-value text-primary">{{ totalDays }}</div>
                    <div class="stat-label">Work Days</div>
                  </div>
                </div>
                <div class="col-6 col-md-3">
                  <div class="stat-box text-center">
                    <div class="stat-icon bg-success-subtle">
                      <i class="bi bi-cash-coin text-success"></i>
                    </div>
                    <div class="stat-value text-success">€{{ formatEuroAmount(totalTips) }}</div>
                    <div class="stat-label">Total Tips</div>
                  </div>
                </div>
                <div class="col-6 col-md-3">
                  <div class="stat-box text-center">
                    <div class="stat-icon bg-info-subtle">
                      <i class="bi bi-clock-history text-info"></i>
                    </div>
                    <div class="stat-value text-info">{{ totalHours }}h</div>
                    <div class="stat-label">Total Hours</div>
                  </div>
                </div>
                <div class="col-6 col-md-3">
                  <div class="stat-box text-center">
                    <div class="stat-icon bg-warning-subtle">
                      <i class="bi bi-calculator text-warning"></i>
                    </div>
                    <div class="stat-value text-warning">€{{ avgHourlyEarnings }}</div>
                    <div class="stat-label">Avg/Hour</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Quick Actions Card -->
        <div class="col-lg-4">
          <div class="card border-0 shadow-sm h-100">
            <div class="card-header bg-transparent border-0 pb-0">
              <h6 class="card-title mb-0">
                <i class="bi bi-lightning-fill me-2 text-warning"></i>Quick Actions
              </h6>
            </div>
            <div class="card-body d-flex flex-column justify-content-center">
              <div class="d-grid gap-2">
                <button class="btn btn-primary" @click="showAddModal">
                  <i class="bi bi-plus-circle me-2"></i>Log Today's Work
                </button>
                <button class="btn btn-outline-success" @click="markAllPaid" 
                        :disabled="pendingSummary.days_count === 0">
                  <i class="bi bi-check-circle me-2"></i>Mark All Pending as Paid
                </button>
                <button class="btn btn-outline-info" @click="exportData">
                  <i class="bi bi-download me-2"></i>Export Work Log
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Payment Status Overview -->
    <div class="payment-overview mb-4">
      <div class="card border-0 shadow-sm">
        <div class="card-header bg-transparent border-0">
          <div class="d-flex justify-content-between align-items-center">
            <h6 class="card-title mb-0">
              <i class="bi bi-credit-card-fill me-2 text-success"></i>Payment Status Overview
            </h6>
            <div class="badge bg-primary-subtle text-primary px-3 py-2">
              {{ currentMonthLabel }}
            </div>
          </div>
        </div>
        <div class="card-body">
          <div class="row g-3">
            <!-- Pending Payments -->
            <div class="col-md-6">
              <div class="payment-status-card pending">
                <div class="d-flex justify-content-between align-items-start mb-2">
                  <div class="payment-icon">
                    <i class="bi bi-clock-history"></i>
                  </div>
                  <span class="badge bg-warning">{{ pendingSummary.days_count }} days</span>
                </div>
                <h5 class="text-warning mb-1">€{{ formatEuroAmount(pendingSummary.total_earnings) }}</h5>
                <p class="text-muted mb-2">Pending Earnings</p>
                <div class="small">
                  <i class="bi bi-cash me-1"></i>Tips: €{{ formatEuroAmount(pendingSummary.total_tips) }}
                </div>
              </div>
            </div>
            
            <!-- Paid Payments -->
            <div class="col-md-6">
              <div class="payment-status-card paid">
                <div class="d-flex justify-content-between align-items-start mb-2">
                  <div class="payment-icon">
                    <i class="bi bi-check-circle-fill"></i>
                  </div>
                  <span class="badge bg-success">{{ paidSummary.days_count }} days</span>
                </div>
                <h5 class="text-success mb-1">€{{ formatEuroAmount(paidSummary.total_earnings) }}</h5>
                <p class="text-muted mb-2">Paid Earnings</p>
                <div class="small">
                  <i class="bi bi-cash me-1"></i>Tips: €{{ formatEuroAmount(paidSummary.total_tips) }}
                </div>
              </div>
            </div>
          </div>
          
          <!-- Total Summary -->
          <div class="mt-3 pt-3 border-top">
            <div class="row text-center">
              <div class="col-md-4">
                <div class="h6 text-info mb-1">€{{ formatEuroAmount((pendingSummary.total_earnings || 0) + (pendingSummary.total_tips || 0)) }}</div>
                <small class="text-muted">Total Awaiting</small>
              </div>
              <div class="col-md-4">
                <div class="h6 text-success mb-1">€{{ formatEuroAmount((paidSummary.total_earnings || 0) + (paidSummary.total_tips || 0)) }}</div>
                <small class="text-muted">Total Received</small>
              </div>
              <div class="col-md-4">
                <div class="h6 text-primary mb-1">€{{ formatEuroAmount(totalPeriodEarnings) }}</div>
                <small class="text-muted">Period Total</small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Work Days Table/Cards -->
    <div class="work-days-section">
      <div class="card border-0 shadow-sm">
        <div class="card-header bg-transparent border-0">
          <div class="d-flex justify-content-between align-items-center">
            <h6 class="card-title mb-0">
              <i class="bi bi-list-ul me-2"></i>Work Days
              <span class="badge bg-primary-subtle text-primary ms-2">{{ pagination.total }} total</span>
            </h6>
            <div class="view-toggle">
              <div class="btn-group btn-group-sm" role="group">
                <input type="radio" class="btn-check" name="viewMode" id="tableView" v-model="viewMode" value="table">
                <label class="btn btn-outline-primary" for="tableView" title="Table view">
                  <i class="bi bi-table"></i>
                </label>
                <input type="radio" class="btn-check" name="viewMode" id="cardView" v-model="viewMode" value="cards">
                <label class="btn btn-outline-primary" for="cardView" title="Card view">
                  <i class="bi bi-grid-3x3-gap"></i>
                </label>
              </div>
            </div>
          </div>
        </div>
        
        <div class="card-body">
          <!-- Loading State -->
          <div v-if="loading" class="text-center py-5">
            <div class="spinner-border text-primary" role="status"></div>
            <p class="mt-3 text-muted">Loading your work days...</p>
          </div>

          <!-- Empty State -->
          <div v-else-if="workDays.length === 0" class="empty-state text-center py-5">
            <div class="empty-icon mb-3">
              <i class="bi bi-calendar-x"></i>
            </div>
            <h5 class="text-muted mb-2">No work days found</h5>
            <p class="text-muted mb-4">
              {{ searchQuery ? 'No work days match your search criteria.' : 'Start by logging your first work day!' }}
            </p>
            <button v-if="!searchQuery" class="btn btn-primary btn-lg" @click="showAddModal">
              <i class="bi bi-plus-circle me-2"></i>Log Your First Work Day
            </button>
            <button v-else class="btn btn-outline-secondary" @click="clearFilters">
              <i class="bi bi-arrow-clockwise me-1"></i>Clear Filters
            </button>
          </div>

          <!-- Table View -->
          <div v-else-if="viewMode === 'table'" class="table-responsive">
            <table class="table table-hover work-table">
              <thead class="table-light">
                <tr>
                  <th><i class="bi bi-calendar3 me-1"></i>Date</th>
                  <th><i class="bi bi-clock me-1"></i>Schedule</th>
                  <th><i class="bi bi-stopwatch me-1"></i>Hours</th>
                  <th><i class="bi bi-cash-coin me-1"></i>Tips</th>
                  <th><i class="bi bi-currency-euro me-1"></i>Rate</th>
                  <th><i class="bi bi-calculator me-1"></i>Daily Pay</th>
                  <th><i class="bi bi-wallet2 me-1"></i>Total</th>
                  <th><i class="bi bi-credit-card me-1"></i>Status</th>
                  <th><i class="bi bi-chat-left-text me-1"></i>Notes</th>
                  <th width="100">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="day in workDays" :key="day.id" class="work-day-row">
                  <td>
                    <div class="fw-medium">{{ formatDate(day.work_date) }}</div>
                    <small class="text-muted">{{ formatDateRelative(day.work_date) }}</small>
                  </td>
                  <td>
                    <span v-if="day.start_time && day.end_time" class="badge bg-info-subtle text-info">
                      {{ formatTime(day.start_time) }} - {{ formatTime(day.end_time) }}
                    </span>
                    <span v-else class="text-muted">Not set</span>
                  </td>
                  <td>
                    <span class="fw-medium">{{ day.hours_worked }}h</span>
                  </td>
                  <td>
                    <span v-if="day.tips_amount > 0" class="text-success fw-medium">
                      €{{ formatEuroAmount(day.tips_amount) }}
                    </span>
                    <span v-else class="text-muted">-</span>
                  </td>
                  <td>€{{ formatEuroAmount(day.hourly_rate) }}</td>
                  <td class="text-success fw-bold">€{{ formatEuroAmount(day.calculated_payment) }}</td>
                  <td class="text-primary fw-bold">€{{ formatEuroAmount((parseFloat(day.calculated_payment) + parseFloat(day.tips_amount || 0))) }}</td>
                  <td>
                    <span 
                      :class="`badge ${day.payment_status === 'paid' ? 'bg-success' : 'bg-warning'} payment-badge`"
                      @click="togglePaymentStatus(day)"
                      :title="`Click to mark as ${day.payment_status === 'paid' ? 'pending' : 'paid'}`"
                    >
                      <i :class="`bi ${day.payment_status === 'paid' ? 'bi-check-circle' : 'bi-clock'} me-1`"></i>
                      {{ day.payment_status === 'paid' ? 'Paid' : 'Pending' }}
                    </span>
                    <div v-if="day.payment_date" class="small text-muted mt-1">
                      <i class="bi bi-calendar-check me-1"></i>{{ formatDate(day.payment_date) }}
                    </div>
                  </td>
                  <td>
                    <span v-if="day.notes" class="text-truncate d-inline-block" style="max-width: 120px;" :title="day.notes">
                      {{ day.notes }}
                    </span>
                    <span v-else class="text-muted">-</span>
                  </td>
                  <td>
                    <div class="btn-group btn-group-sm">
                      <button class="btn btn-outline-primary" @click="editWorkDay(day)" title="Edit work day">
                        <i class="bi bi-pencil"></i>
                      </button>
                      <button class="btn btn-outline-danger" @click="deleteWorkDay(day)" title="Delete work day">
                        <i class="bi bi-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Card View -->
          <div v-else class="work-cards-grid">
            <div v-for="day in workDays" :key="day.id" class="work-day-card">
              <div class="card border-0 shadow-sm h-100">
                <div class="card-body">
                  <div class="d-flex justify-content-between align-items-start mb-3">
                    <div>
                      <h6 class="card-title mb-1">{{ formatDate(day.work_date) }}</h6>
                      <small class="text-muted">{{ formatDateRelative(day.work_date) }}</small>
                    </div>
                    <span 
                      :class="`badge ${day.payment_status === 'paid' ? 'bg-success' : 'bg-warning'} payment-badge`"
                      @click="togglePaymentStatus(day)"
                    >
                      <i :class="`bi ${day.payment_status === 'paid' ? 'bi-check-circle' : 'bi-clock'} me-1`"></i>
                      {{ day.payment_status === 'paid' ? 'Paid' : 'Pending' }}
                    </span>
                  </div>
                  
                  <div class="work-details mb-3">
                    <div class="detail-row">
                      <i class="bi bi-clock text-info"></i>
                      <span>{{ day.hours_worked }}h worked</span>
                    </div>
                    <div v-if="day.start_time && day.end_time" class="detail-row">
                      <i class="bi bi-stopwatch text-primary"></i>
                      <span>{{ formatTime(day.start_time) }} - {{ formatTime(day.end_time) }}</span>
                    </div>
                    <div v-if="day.tips_amount > 0" class="detail-row">
                      <i class="bi bi-cash-coin text-success"></i>
                      <span>€{{ formatEuroAmount(day.tips_amount) }} tips</span>
                    </div>
                  </div>
                  
                  <div class="earnings-summary mb-3">
                    <div class="d-flex justify-content-between">
                      <span class="text-muted">Daily Pay:</span>
                      <span class="fw-medium">€{{ formatEuroAmount(day.calculated_payment) }}</span>
                    </div>
                    <div class="d-flex justify-content-between">
                      <span class="text-muted">Total:</span>
                      <span class="fw-bold text-primary">€{{ formatEuroAmount((parseFloat(day.calculated_payment) + parseFloat(day.tips_amount || 0))) }}</span>
                    </div>
                  </div>
                  
                  <div v-if="day.notes" class="notes mb-3">
                    <small class="text-muted d-block">Notes:</small>
                    <small>{{ day.notes }}</small>
                  </div>
                  
                  <div class="card-actions">
                    <button class="btn btn-outline-primary btn-sm" @click="editWorkDay(day)">
                      <i class="bi bi-pencil me-1"></i>Edit
                    </button>
                    <button class="btn btn-outline-danger btn-sm" @click="deleteWorkDay(day)">
                      <i class="bi bi-trash me-1"></i>Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>          </div>

          <!-- Pagination -->
          <nav v-if="pagination.totalPages > 1" class="mt-4">
            <ul class="pagination justify-content-center">
              <li class="page-item" :class="{ disabled: pagination.page === 1 }">
                <button class="page-link" @click="changePage(pagination.page - 1)">
                  <i class="bi bi-chevron-left"></i>
                </button>
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
                <button class="page-link" @click="changePage(pagination.page + 1)">
                  <i class="bi bi-chevron-right"></i>
                </button>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </div>

    <!-- Enhanced Add/Edit Work Day Modal -->
    <div class="modal fade" id="workDayModal" tabindex="-1">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header bg-primary-subtle">
            <h5 class="modal-title">
              <i :class="`bi ${editingWorkDay ? 'bi-pencil-square' : 'bi-plus-circle'} me-2`"></i>
              {{ editingWorkDay ? 'Edit Work Day' : 'Log Work Day' }}
            </h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="saveWorkDay">
              <div class="row g-3">
                <!-- Date Input -->
                <div class="col-md-6">
                  <label class="form-label fw-medium">
                    <i class="bi bi-calendar3 me-1"></i>Work Date
                  </label>
                  <input
                    type="date"
                    class="form-control"
                    v-model="workDayForm.workDate"
                    :disabled="editingWorkDay"
                    required
                  >
                  <div v-if="editingWorkDay" class="form-text">
                    <i class="bi bi-info-circle me-1"></i>Date cannot be changed when editing
                  </div>
                </div>

                <!-- Day Type Selection -->
                <div class="col-md-6">
                  <label class="form-label fw-medium">
                    <i class="bi bi-tag me-1"></i>Day Type
                  </label>
                  <select class="form-select" v-model="workDayForm.dayType">
                    <option value="regular">Regular Day</option>
                    <option value="weekend">Weekend</option>
                    <option value="holiday">Holiday</option>
                    <option value="overtime">Overtime</option>
                  </select>
                </div>

                <!-- Time Inputs -->
                <div class="col-md-6">
                  <label class="form-label fw-medium">
                    <i class="bi bi-clock me-1"></i>Start Time (Optional)
                  </label>
                  <select
                    class="form-select"
                    v-model="workDayForm.startTime"
                    @change="calculateHoursFromTime"
                  >
                    <option v-for="option in timeOptions" :key="option.value" :value="option.value">
                      {{ option.label }}
                    </option>
                  </select>
                </div>
                <div class="col-md-6">
                  <label class="form-label fw-medium">
                    <i class="bi bi-clock-history me-1"></i>End Time (Optional)
                  </label>
                  <select
                    class="form-select"
                    v-model="workDayForm.endTime"
                    @change="calculateHoursFromTime"
                  >
                    <option v-for="option in timeOptions" :key="option.value" :value="option.value">
                      {{ option.label }}
                    </option>
                  </select>
                </div>

                <!-- Hours Worked -->
                <div class="col-md-6">
                  <label class="form-label fw-medium">
                    <i class="bi bi-stopwatch me-1"></i>Hours Worked
                  </label>
                  <div class="input-group">
                    <input
                      type="number"
                      step="0.25"
                      min="0"
                      max="24"
                      class="form-control"
                      v-model="workDayForm.hoursWorked"
                      required
                    >
                    <span class="input-group-text">hours</span>
                  </div>
                  <div class="form-text">
                    <i class="bi bi-lightbulb me-1"></i>
                    Enter start/end times above or manually enter hours here
                  </div>
                </div>

                <!-- Tips Amount -->
                <div class="col-md-6">
                  <label class="form-label fw-medium">
                    <i class="bi bi-cash-coin me-1"></i>Tips Amount
                  </label>
                  <div class="input-group">
                    <span class="input-group-text">€</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      class="form-control"
                      v-model="workDayForm.tipsAmount"
                      placeholder="0.00"
                    >
                  </div>
                </div>

                <!-- Notes -->
                <div class="col-12">
                  <label class="form-label fw-medium">
                    <i class="bi bi-chat-left-text me-1"></i>Notes (Optional)
                  </label>
                  <textarea
                    class="form-control"
                    v-model="workDayForm.notes"
                    rows="3"
                    placeholder="Any notes about this work day (e.g., special events, location, etc.)..."
                  ></textarea>
                </div>

                <!-- Calculation Preview -->
                <div class="col-12">
                  <div class="calculation-preview card bg-light">
                    <div class="card-body py-3">
                      <h6 class="card-title mb-3">
                        <i class="bi bi-calculator me-2"></i>Earnings Preview
                      </h6>
                      <div class="row g-2">
                        <div class="col-sm-4">
                          <div class="text-center">
                            <div class="h6 text-primary mb-1">€{{ previewCalculation.dailyPay }}</div>
                            <small class="text-muted">Daily Pay</small>
                          </div>
                        </div>
                        <div class="col-sm-4">
                          <div class="text-center">
                            <div class="h6 text-success mb-1">€{{ previewCalculation.tips }}</div>
                            <small class="text-muted">Tips</small>
                          </div>
                        </div>
                        <div class="col-sm-4">
                          <div class="text-center">
                            <div class="h6 text-info mb-1">€{{ previewCalculation.total }}</div>
                            <small class="text-muted">Total</small>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">
              <i class="bi bi-x-circle me-2"></i>Cancel
            </button>
            <button type="submit" class="btn btn-primary" :disabled="savingWorkDay" @click="saveWorkDay">
              <span v-if="savingWorkDay" class="spinner-border spinner-border-sm me-2"></span>
              <i v-else :class="`bi ${editingWorkDay ? 'bi-check-circle' : 'bi-plus-circle'} me-2`"></i>
              {{ savingWorkDay ? 'Saving...' : (editingWorkDay ? 'Update Work Day' : 'Log Work Day') }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue'
import { useToast } from 'vue-toastification'
import { authStore } from '@/stores/auth'
import api from '@/services/api'
import { format, formatDistanceToNow } from 'date-fns'
import { formatEuroAmount } from '@/utils/currency'

export default {
  name: 'Work',
  setup () {
    const toast = useToast()
    const { user } = authStore()

    const loading = ref(false)
    const workDays = ref([])
    const pagination = ref({ page: 1, totalPages: 1, total: 0 })
    const editingWorkDay = ref(null)
    const savingWorkDay = ref(false)
    const paymentSummary = ref({ pending: {}, paid: {} })
    const viewMode = ref('table')
    const searchQuery = ref('')

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
      notes: '',
      dayType: 'regular'
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

    // Generate time options (hour and half-hour increments)
    const timeOptions = computed(() => {
      const options = [{ value: '', label: 'Select Time' }]
      
      for (let hour = 0; hour < 24; hour++) {
        // Add full hour
        const hourStr = hour.toString().padStart(2, '0')
        const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour
        const ampm = hour < 12 ? 'AM' : 'PM'
        const displayHour = hour12 === 0 ? 12 : hour12
        
        options.push({
          value: `${hourStr}:00`,
          label: `${displayHour}:00 ${ampm}`
        })
        
        // Add half hour
        options.push({
          value: `${hourStr}:30`,
          label: `${displayHour}:30 ${ampm}`
        })
      }
      
      return options
    })

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

    const totalHours = computed(() => {
      return workDays.value.reduce((sum, day) => sum + parseFloat(day.hours_worked || 0), 0).toFixed(1)
    })

    const avgHourlyEarnings = computed(() => {
      const totalEarnings = workDays.value.reduce((sum, day) => {
        return sum + parseFloat(day.calculated_payment || 0) + parseFloat(day.tips_amount || 0)
      }, 0)
      const hours = parseFloat(totalHours.value)
      return hours > 0 ? (totalEarnings / hours).toFixed(2) : '0.00'
    })

    const currentMonthLabel = computed(() => {
      if (!filters.value.month) return 'All Time'
      const month = months.find(m => m.value === filters.value.month)
      return `${month?.label} ${filters.value.year}`
    })

    const totalPeriodEarnings = computed(() => {
      const pending = (pendingSummary.value.total_earnings || 0) + (pendingSummary.value.total_tips || 0)
      const paid = (paidSummary.value.total_earnings || 0) + (paidSummary.value.total_tips || 0)
      return formatEuroAmount(pending + paid)
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

    const previewCalculation = computed(() => {
      const hours = parseFloat(workDayForm.value.hoursWorked) || 0
      const tips = parseFloat(workDayForm.value.tipsAmount) || 0
      const hourlyRate = user.value?.hourlyRate || 15
      const dailyPay = hours * hourlyRate
      
      return {
        dailyPay: formatEuroAmount(dailyPay),
        tips: formatEuroAmount(tips),
        total: formatEuroAmount(dailyPay + tips)
      }
    })

    // Watch for form changes to update preview
    watch([() => workDayForm.value.hoursWorked, () => workDayForm.value.tipsAmount], () => {
      // Reactive computation will handle the update
    })

    const formatDate = (dateString) => {
      return format(new Date(dateString), 'MMM dd, yyyy')
    }

    const formatDateRelative = (dateString) => {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true })
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
      if (startTime && endTime && startTime !== '' && endTime !== '') {
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
        if (searchQuery.value.trim()) params.search = searchQuery.value.trim()

        const response = await api.get('/work/days', { params })
        workDays.value = response.data.workDays
        pagination.value = response.data.pagination

        // Fetch payment summary
        await fetchPaymentSummary()
      } catch (error) {
        console.error('Error fetching work days:', error)
        toast.error('Failed to load work days. Please check your connection and try again.')
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

    // Debounced search function
    let searchTimeout
    const debouncedSearch = () => {
      clearTimeout(searchTimeout)
      searchTimeout = setTimeout(() => {
        fetchWorkDays(1)
      }, 300)
    }

    const clearFilters = () => {
      filters.value.month = new Date().getMonth() + 1
      filters.value.year = new Date().getFullYear()
      searchQuery.value = ''
      fetchWorkDays(1)
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
        toast.error('Failed to update payment status. Please try again.')
      }
    }

    const markAllPaid = async () => {
      if (pendingSummary.value.days_count === 0) return
      
      if (confirm(`Are you sure you want to mark all ${pendingSummary.value.days_count} pending work days as paid?`)) {
        try {
          await api.patch('/work/payment/mark-all-paid', {
            month: filters.value.month,
            year: filters.value.year
          })
          
          toast.success(`Marked ${pendingSummary.value.days_count} work days as paid`)
          await fetchWorkDays(pagination.value.page)
        } catch (error) {
          console.error('Error marking all as paid:', error)
          toast.error('Failed to mark all as paid. Please try again.')
        }
      }
    }

    const exportData = async () => {
      try {
        const params = {}
        if (filters.value.month) params.month = filters.value.month
        if (filters.value.year) params.year = filters.value.year

        const response = await api.get('/work/export', { 
          params,
          responseType: 'blob'
        })
        
        const blob = new Blob([response.data], { type: 'text/csv' })
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `work-log-${currentMonthLabel.value.replace(' ', '-').toLowerCase()}.csv`
        link.click()
        window.URL.revokeObjectURL(url)
        
        toast.success('Work log exported successfully!')
      } catch (error) {
        console.error('Error exporting data:', error)
        toast.error('Failed to export data. Please try again.')
      }
    }

    const showQuickStatsModal = () => {
      // Could implement a detailed stats modal here
      toast.info('Detailed statistics feature coming soon!')
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
        notes: '',
        dayType: 'regular'
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
        notes: day.notes || '',
        dayType: day.day_type || 'regular'
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
          notes: workDayForm.value.notes,
          dayType: workDayForm.value.dayType
        }

        if (editingWorkDay.value) {
          await api.put(`/work/days/${editingWorkDay.value.id}`, data)
          toast.success('Work day updated successfully!')
        } else {
          data.workDate = workDayForm.value.workDate
          await api.post('/work/days', data)
          toast.success('Work day logged successfully!')
        }

        const modal = window.Modal.getInstance(document.getElementById('workDayModal'))
        modal.hide()
        await fetchWorkDays(pagination.value.page)
      } catch (error) {
        console.error('Error saving work day:', error)
        toast.error(error.response?.data?.message || 'Failed to save work day. Please try again.')
      } finally {
        savingWorkDay.value = false
      }
    }

    const deleteWorkDay = async (day) => {
      if (confirm(`Are you sure you want to delete the work day for ${formatDate(day.work_date)}?\n\nThis action cannot be undone.`)) {
        try {
          await api.delete(`/work/days/${day.id}`)
          toast.success('Work day deleted successfully')
          await fetchWorkDays(pagination.value.page)
        } catch (error) {
          console.error('Error deleting work day:', error)
          toast.error('Failed to delete work day. Please try again.')
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
      timeOptions,
      years,
      viewMode,
      searchQuery,
      totalTips,
      totalDays,
      totalHours,
      avgHourlyEarnings,
      currentMonthLabel,
      totalPeriodEarnings,
      pendingSummary,
      paidSummary,
      visiblePages,
      previewCalculation,
      formatDate,
      formatDateRelative,
      formatTime,
      formatEuroAmount,
      calculateHoursFromTime,
      fetchWorkDays,
      debouncedSearch,
      clearFilters,
      togglePaymentStatus,
      markAllPaid,
      exportData,
      showQuickStatsModal,
      changePage,
      showAddModal,
      editWorkDay,
      saveWorkDay,
      deleteWorkDay
    }
  }
}
</script>

<style scoped>
.work-page {
  padding: 1.5rem;
  max-width: 1400px;
  margin: 0 auto;
}

/* Header Styling */
.work-header {
  animation: fadeInDown 0.6s ease-out;
}

.header-content h1 {
  color: #1e293b;
  font-weight: 700;
}

.header-actions .btn {
  border-radius: 0.5rem;
  transition: all 0.3s ease;
}

.header-actions .btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

/* Filters Section */
.filters-section {
  animation: fadeInUp 0.6s ease-out 0.1s both;
}

.filters-section .card {
  border: none;
  border-radius: 1rem;
}

.filters-section .form-label {
  color: #374151;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.filters-section .form-select,
.filters-section .form-control {
  border-radius: 0.5rem;
  border: 1px solid #d1d5db;
  transition: all 0.2s ease;
}

.filters-section .form-select:focus,
.filters-section .form-control:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

/* Statistics Dashboard */
.stats-dashboard {
  animation: fadeInUp 0.6s ease-out 0.2s both;
}

.stat-box {
  padding: 1rem;
  border-radius: 0.75rem;
  transition: all 0.3s ease;
}

.stat-box:hover {
  transform: translateY(-2px);
}

.stat-icon {
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 0.75rem;
  font-size: 1.25rem;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 0.25rem;
}

.stat-label {
  font-size: 0.875rem;
  color: #6b7280;
  font-weight: 500;
}

/* Payment Overview */
.payment-overview {
  animation: fadeInUp 0.6s ease-out 0.3s both;
}

.payment-status-card {
  background: linear-gradient(135deg, #f8fafc, #f1f5f9);
  border-radius: 1rem;
  padding: 1.5rem;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.payment-status-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #f59e0b, #eab308);
}

.payment-status-card.paid::before {
  background: linear-gradient(90deg, #10b981, #059669);
}

.payment-status-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.payment-icon {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.8);
  font-size: 1.125rem;
}

.payment-status-card.pending .payment-icon {
  color: #f59e0b;
}

.payment-status-card.paid .payment-icon {
  color: #10b981;
}

/* Work Days Section */
.work-days-section {
  animation: fadeInUp 0.6s ease-out 0.4s both;
}

.work-days-section .card {
  border: none;
  border-radius: 1rem;
}

.view-toggle .btn-check:checked + .btn {
  background-color: #3b82f6;
  border-color: #3b82f6;
  color: white;
}

/* Table Styling */
.work-table {
  border-radius: 0.5rem;
  overflow: hidden;
}

.work-table thead th {
  background: linear-gradient(135deg, #f8fafc, #f1f5f9);
  border: none;
  color: #374151;
  font-weight: 600;
  padding: 1rem 0.75rem;
}

.work-day-row {
  transition: all 0.2s ease;
}

.work-day-row:hover {
  background-color: #f8fafc;
  transform: scale(1.005);
}

.work-day-row td {
  vertical-align: middle;
  padding: 1rem 0.75rem;
  border-color: #f1f5f9;
}

.payment-badge {
  cursor: pointer;
  transition: all 0.2s ease;
  border-radius: 0.5rem;
  padding: 0.5rem 0.75rem;
}

.payment-badge:hover {
  transform: scale(1.05);
}

/* Card View */
.work-cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.5rem;
}

.work-day-card {
  animation: fadeInUp 0.6s ease-out;
  transition: all 0.3s ease;
}

.work-day-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 35px rgba(0, 0, 0, 0.15);
}

.work-day-card .card {
  border-radius: 1rem;
  border: none;
}

.work-details {
  border-left: 3px solid #e5e7eb;
  padding-left: 1rem;
}

.detail-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
}

.detail-row i {
  width: 1rem;
  text-align: center;
}

.earnings-summary {
  background: linear-gradient(135deg, #f8fafc, #f1f5f9);
  border-radius: 0.5rem;
  padding: 0.75rem;
}

.notes {
  background: #fef3c7;
  border-radius: 0.5rem;
  padding: 0.75rem;
  border-left: 3px solid #f59e0b;
}

.card-actions {
  display: flex;
  gap: 0.5rem;
}

/* Empty State */
.empty-state {
  animation: fadeIn 0.6s ease-out;
}

.empty-icon {
  font-size: 4rem;
  color: #d1d5db;
}

/* Modal Enhancements */
.modal-dialog {
  border-radius: 1rem;
}

.modal-content {
  border: none;
  border-radius: 1rem;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25);
}

.modal-header {
  border-radius: 1rem 1rem 0 0;
  padding: 1.5rem;
}

.modal-body {
  padding: 1.5rem;
}

.modal-footer {
  padding: 1.5rem;
  border-top: 1px solid #f1f5f9;
}

.calculation-preview {
  border: 2px dashed #d1d5db;
  border-radius: 0.75rem;
  transition: all 0.3s ease;
}

.calculation-preview:hover {
  border-color: #3b82f6;
  background: linear-gradient(135deg, #eff6ff, #dbeafe);
}

/* Animations */
@keyframes fadeInDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

/* Responsive Design */
@media (max-width: 1200px) {
  .work-cards-grid {
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 1rem;
  }
}

@media (max-width: 768px) {
  .work-page {
    padding: 1rem;
  }
  
  .header-actions {
    width: 100%;
    justify-content: space-between;
  }
  
  .btn-text {
    display: none;
  }
  
  .work-cards-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .stats-dashboard .row > div {
    margin-bottom: 1rem;
  }
  
  .stat-box {
    padding: 0.75rem;
  }
  
  .stat-icon {
    width: 2.5rem;
    height: 2.5rem;
    font-size: 1rem;
  }
  
  .stat-value {
    font-size: 1.25rem;
  }
  
  .payment-status-card {
    padding: 1rem;
  }
  
  .modal-dialog {
    margin: 0.5rem;
  }
  
  .table-responsive {
    font-size: 0.875rem;
  }
  
  .work-day-row td {
    padding: 0.75rem 0.5rem;
  }
}

@media (max-width: 576px) {
  .work-page {
    padding: 0.75rem;
  }
  
  .header-content h1 {
    font-size: 1.5rem;
  }
  
  .filters-section .row > div {
    margin-bottom: 0.75rem;
  }
  
  .stat-value {
    font-size: 1.125rem;
  }
  
  .payment-status-card {
    padding: 0.75rem;
  }
  
  .payment-icon {
    width: 2rem;
    height: 2rem;
    font-size: 1rem;
  }
  
  .modal-body {
    padding: 1rem;
  }
  
  .modal-footer {
    padding: 1rem;
  }
}

/* Dark theme support */
@media (prefers-color-scheme: dark) {
  .work-page {
    background-color: #1f2937;
    color: #f9fafb;
  }
  
  .card {
    background-color: #374151;
    border-color: #4b5563;
  }
  
  .table {
    color: #f9fafb;
  }
  
  .table thead th {
    background: linear-gradient(135deg, #374151, #4b5563);
    color: #f9fafb;
  }
  
  .work-day-row:hover {
    background-color: #4b5563;
  }
}

/* Loading state */
.spinner-border {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Accessibility improvements */
.btn:focus {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}

.form-control:focus,
.form-select:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

/* Print styles */
@media print {
  .work-page {
    padding: 0;
  }
  
  .header-actions,
  .view-toggle,
  .card-actions,
  .btn-group {
    display: none !important;
  }
  
  .card {
    border: 1px solid #000 !important;
    box-shadow: none !important;
  }
}
</style>
