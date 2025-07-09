<template>
  <div class="container-fluid py-4">
    <div class="row">
      <div class="col-12">
        <div class="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h1 class="h3 mb-0">Dashboard</h1>
            <p class="text-muted mb-0">Welcome back, {{ user?.username }}!</p>
          </div>
          <div class="text-end">
            <small class="text-muted">Last updated: {{ currentTime }}</small>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading state -->
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>

    <!-- Dashboard content -->
    <div v-else>
      <!-- Stats Cards -->
      <div class="row mb-4">
        <div class="col-md-3 mb-3">
          <div class="card stats-card success">
            <div class="card-body">
              <div class="d-flex justify-content-between">
                <div>
                  <div class="stats-label">This Month Earnings</div>
                  <div class="stats-value">€{{ formatEuroAmount(dashboardData.currentMonth?.work?.total_earnings || 0) }}</div>
                </div>
                <div class="text-success">
                  <i class="bi bi-currency-dollar" style="font-size: 2rem;"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="col-md-3 mb-3">
          <div class="card stats-card info">
            <div class="card-body">
              <div class="d-flex justify-content-between">
                <div>
                  <div class="stats-label">Total Tips</div>
                  <div class="stats-value">€{{ formatEuroAmount(dashboardData.currentMonth?.work?.total_tips || 0) }}</div>
                </div>
                <div class="text-info">
                  <i class="bi bi-cash-coin" style="font-size: 2rem;"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="col-md-3 mb-3">
          <div class="card stats-card">
            <div class="card-body">
              <div class="d-flex justify-content-between">
                <div>
                  <div class="stats-label">Hours Worked</div>
                  <div class="stats-value">{{ dashboardData.currentMonth?.work?.total_hours || 0 }}</div>
                </div>
                <div class="text-primary">
                  <i class="bi bi-clock" style="font-size: 2rem;"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="col-md-3 mb-3">
          <div class="card stats-card warning">
            <div class="card-body">
              <div class="d-flex justify-content-between">
                <div>
                  <div class="stats-label">Days Worked</div>
                  <div class="stats-value">{{ dashboardData.currentMonth?.work?.days_worked || 0 }}</div>
                </div>
                <div class="text-warning">
                  <i class="bi bi-calendar-check" style="font-size: 2rem;"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Net Income Row -->
      <div class="row mb-4">
        <div class="col-md-6 mx-auto">
          <div class="card stats-card" :class="netIncomeClass">
            <div class="card-body">
              <div class="d-flex justify-content-between">
                <div>
                  <div class="stats-label">Net Income (After Expenses)</div>
                  <div class="stats-value">€{{ formatEuroAmount(netIncome) }}</div>
                </div>
                <div :class="`text-${netIncomeClass}`">
                  <i class="bi bi-graph-up" style="font-size: 2rem;"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Actions & Recent Activity -->
      <div class="row mb-4">
        <div class="col-lg-8">
          <div class="card">
            <div class="card-header">
              <h5 class="mb-0">Recent Work Days</h5>
            </div>
            <div class="card-body">
              <div v-if="dashboardData.recentActivity?.workDays?.length === 0" class="text-center py-4">
                <i class="bi bi-calendar-x text-muted" style="font-size: 3rem;"></i>
                <p class="text-muted mt-2">No work days logged recently</p>
                <router-link to="/work" class="btn btn-primary">Log Work Day</router-link>
              </div>
              <div v-else class="table-responsive">
                <table class="table table-hover">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Hours</th>
                      <th>Earnings</th>
                      <th>Tips</th>
                      <th>Total</th>
                      <th>Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="day in dashboardData.recentActivity?.workDays" :key="day.id">
                      <td>{{ formatDate(day.work_date) }}</td>
                      <td>{{ day.hours_worked }}h</td>
                      <td>€{{ formatEuroAmount(day.calculated_payment) }}</td>
                      <td class="text-success">
                        <span v-if="day.tips_amount > 0">€{{ formatEuroAmount(day.tips_amount) }}</span>
                        <span v-else class="text-muted">-</span>
                      </td>
                      <td class="text-success fw-bold">€{{ formatEuroAmount((parseFloat(day.calculated_payment) + parseFloat(day.tips_amount || 0))) }}</td>
                      <td>{{ day.notes || '-' }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <div class="col-lg-4">
          <div class="card">
            <div class="card-header">
              <h5 class="mb-0">Quick Actions</h5>
            </div>
            <div class="card-body">
              <div class="d-grid gap-2">
                <router-link to="/work" class="btn btn-primary">
                  <i class="bi bi-plus-circle me-2"></i>Log Work Day
                </router-link>
                <router-link to="/expenses" class="btn btn-outline-primary">
                  <i class="bi bi-plus-circle me-2"></i>Add Expense
                </router-link>
                <button class="btn btn-outline-secondary" @click="updateHourlyRateModal">
                  <i class="bi bi-gear me-2"></i>Update Hourly Rate
                </button>
              </div>
            </div>
          </div>

          <!-- Upcoming Schedule -->
          <div class="card mt-4">
            <div class="card-header">
              <h5 class="mb-0">Upcoming Work Days</h5>
            </div>
            <div class="card-body">
              <div v-if="upcomingDays.length === 0" class="text-center py-3">
                <i class="bi bi-calendar text-muted" style="font-size: 2rem;"></i>
                <p class="text-muted mt-2 mb-0">No upcoming work days</p>
              </div>
              <div v-else>
                <div v-for="day in upcomingDays" :key="day.date" class="d-flex justify-content-between align-items-center mb-2">
                  <div>
                    <strong>{{ formatDate(day.date) }}</strong>
                    <small class="text-muted d-block">{{ day.defaultHours }}h scheduled</small>
                  </div>
                  <div>
                    <span v-if="day.isLogged" class="badge bg-success">
                      <i class="bi bi-check-circle me-1"></i>{{ day.loggedHours }}h
                    </span>
                    <span v-else class="badge bg-secondary">
                      <i class="bi bi-clock me-1"></i>Pending
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Recent Transactions -->
      <div class="row">
        <div class="col-12">
          <div class="card">
            <div class="card-header">
              <h5 class="mb-0">Recent Transactions</h5>
            </div>
            <div class="card-body">
              <div v-if="dashboardData.recentActivity?.transactions?.length === 0" class="text-center py-4">
                <i class="bi bi-receipt text-muted" style="font-size: 3rem;"></i>
                <p class="text-muted mt-2">No recent transactions</p>
                <router-link to="/expenses" class="btn btn-primary">Add Transaction</router-link>
              </div>
              <div v-else class="table-responsive">
                <table class="table table-hover">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Description</th>
                      <th>Category</th>
                      <th>Type</th>
                      <th>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="transaction in dashboardData.recentActivity?.transactions" :key="transaction.id">
                      <td>{{ formatDate(transaction.expense_date) }}</td>
                      <td>{{ transaction.description }}</td>
                      <td>{{ transaction.category }}</td>
                      <td>
                        <span :class="`badge bg-${transaction.type === 'income' ? 'success' : 'danger'}`">
                          {{ transaction.type }}
                        </span>
                      </td>
                      <td :class="transaction.type === 'income' ? 'text-success' : 'text-danger'">
                        {{ transaction.type === 'income' ? '+' : '-' }}€{{ formatEuroAmount(transaction.amount) }}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Hourly Rate Modal -->
    <div class="modal fade" id="hourlyRateModal" tabindex="-1">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Update Hourly Rate</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="updateHourlyRate">
              <div class="mb-3">
                <label class="form-label">New Hourly Rate ($)</label>
                <input
                  type="number"
                  step="0.01"
                  class="form-control"
                  v-model="newHourlyRate"
                  required
                >
              </div>
              <div class="text-end">
                <button type="button" class="btn btn-secondary me-2" data-bs-dismiss="modal">Cancel</button>
                <button type="submit" class="btn btn-primary" :disabled="updatingRate">
                  {{ updatingRate ? 'Updating...' : 'Update' }}
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
import { authStore } from '@/stores/auth'
import { useToast } from 'vue-toastification'
import api from '@/services/api'
import { format } from 'date-fns'
import { formatEuroAmount } from '@/utils/currency'

export default {
  name: 'Dashboard',
  setup () {
    const { user, updateHourlyRate: updateUserHourlyRate } = authStore()
    const toast = useToast()

    const loading = ref(true)
    const dashboardData = ref({})
    const upcomingDays = ref([])
    const newHourlyRate = ref(user.value?.hourlyRate || 15)
    const updatingRate = ref(false)
    const currentTime = ref(new Date().toLocaleString())

    const netIncome = computed(() => {
      const work = dashboardData.value.currentMonth?.work?.total_earnings || 0
      const expenses = dashboardData.value.currentMonth?.expenses
      const income = expenses?.income || 0
      const expense = expenses?.expense || 0
      return (work + income - expense).toFixed(2)
    })

    const netIncomeClass = computed(() => {
      const net = parseFloat(netIncome.value)
      return net >= 0 ? 'success' : 'danger'
    })

    const formatDate = (dateString) => {
      return format(new Date(dateString), 'MMM dd, yyyy')
    }

    const fetchDashboardData = async () => {
      try {
        const [overviewResponse, scheduleResponse] = await Promise.all([
          api.get('/dashboard/overview'),
          api.get('/dashboard/upcoming-schedule')
        ])

        dashboardData.value = overviewResponse.data
        upcomingDays.value = scheduleResponse.data
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
        toast.error('Failed to load dashboard data')
      } finally {
        loading.value = false
      }
    }

    const updateHourlyRateModal = () => {
      newHourlyRate.value = user.value?.hourlyRate || 15
      const modal = new window.Modal(document.getElementById('hourlyRateModal'))
      modal.show()
    }

    const updateHourlyRate = async () => {
      updatingRate.value = true
      try {
        const result = await updateUserHourlyRate(newHourlyRate.value)
        if (result.success) {
          toast.success('Hourly rate updated successfully')
          const modal = window.Modal.getInstance(document.getElementById('hourlyRateModal'))
          modal.hide()
          // Refresh dashboard data
          await fetchDashboardData()
        } else {
          toast.error(result.message)
        }
      } catch (error) {
        toast.error('Failed to update hourly rate')
      } finally {
        updatingRate.value = false
      }
    }

    onMounted(() => {
      fetchDashboardData()
      // Update time every minute
      setInterval(() => {
        currentTime.value = new Date().toLocaleString()
      }, 60000)
    })

    return {
      user,
      loading,
      dashboardData,
      upcomingDays,
      newHourlyRate,
      updatingRate,
      currentTime,
      netIncome,
      netIncomeClass,
      formatDate,
      formatEuroAmount,
      updateHourlyRateModal,
      updateHourlyRate
    }
  }
}
</script>
