<template>
  <div class="container-fluid py-4" :class="`layout-${customizationStore.currentLayout.value?.name?.toLowerCase() || 'grid'}`">
    <!-- Dashboard Header -->
    <div class="dashboard-header mb-4">
      <div class="welcome-section">
        <div class="welcome-content">
          <h1 class="dashboard-title">Dashboard</h1>
          <div class="welcome-message">
            <span class="welcome-text">Welcome back,</span>
            <span class="username-highlight">{{ user?.username }}!</span>
          </div>
          <div class="welcome-subtitle">
            <i class="bi bi-calendar-check me-2"></i>
            <span>{{ formatCurrentDate() }}</span>
          </div>
        </div>
        <div class="header-actions d-flex gap-2 align-items-center">
          <div class="time-display">
            <i class="bi bi-clock me-2"></i>
            <span class="current-time">{{ currentTime }}</span>
          </div>
          <router-link to="/customization" class="btn btn-outline-primary" 
                       title="Customize your dashboard layout, themes, and widgets">
            <i class="bi bi-palette me-2"></i><span class="btn-text">Customize</span>
          </router-link>
        </div>
      </div>
    </div>

    <!-- Loading state -->
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
      <p class="mt-3 text-muted">Loading your dashboard...</p>
    </div>

    <!-- Customizable Dashboard Widgets -->
    <div v-else class="dashboard-grid" :class="`layout-${customizationStore.dashboardSettings.value.layout_type || 'grid'}`">
      
      <!-- Goals Widget -->
      <div v-if="customizationStore.dashboardSettings.value.show_goals" 
           class="dashboard-widget goals-widget"
           :class="`widget-${customizationStore.dashboardSettings.value.goals_widget_size || 'large'}`">
        <div class="goal-hero-card position-relative overflow-hidden p-4 text-white rounded" 
             :style="{ background: `linear-gradient(135deg, ${customizationStore.currentTheme.value.primary || '#4338ca'}, ${customizationStore.currentTheme.value.accent || '#3b82f6'})` }">
          <div v-if="goalLoading" class="text-center py-4">
            <div class="spinner-border text-light" role="status"></div>
            <p class="mt-2 mb-0">Loading goals...</p>
          </div>
          
          <div v-else-if="goals.length === 0" class="text-center py-4">
            <div>
              <i class="bi bi-flag fs-1 mb-3"></i>
              <h4 class="text-white mb-3">No goals set yet.</h4>
              <p class="mb-3">Set your first financial goal to start tracking your progress!</p>
              <router-link to="/goals" class="btn btn-outline-light btn-lg">
                <i class="bi bi-plus-circle me-2"></i>Create Your First Goal
              </router-link>
            </div>
          </div>

          <div v-else>
            <!-- Primary Goal Display -->
            <div v-if="primaryGoal" class="d-flex flex-column flex-md-row align-items-center justify-content-between mb-3">
              <div class="mb-3 mb-md-0">
                <h2 class="fw-bold mb-1">
                  <i class="bi bi-flag me-2"></i>{{ primaryGoal.title }}
                  <span class="badge ms-2" :style="{ backgroundColor: primaryGoal.color }" style="font-size: 0.7rem;">{{ primaryGoal.category }}</span>
                </h2>
                <div class="fs-5 mb-2">
                  Target: <span class="fw-bold">€{{ formatEuroAmount(primaryGoal.target_amount) }}</span>
                  <span class="ms-2">by {{ formatDate(primaryGoal.target_date) }}</span>
                </div>
                <div class="fs-6 mb-2">
                  Progress: <span class="fw-bold">€{{ formatEuroAmount(primaryGoal.current_amount) }}</span>
                  <span class="ms-2">({{ getPrimaryGoalPercent() }}%)</span>
                  <span class="ms-2 small">• {{ getDaysLeft(primaryGoal.target_date) }} days left</span>
                </div>
                <div class="progress mb-2" style="height: 20px; background: rgba(255,255,255,0.2);">
                  <div class="progress-bar" role="progressbar" 
                       :style="{ width: getPrimaryGoalPercent() + '%', backgroundColor: primaryGoal.color }" 
                       :aria-valuenow="getPrimaryGoalPercent()" aria-valuemin="0" aria-valuemax="100">
                    {{ getPrimaryGoalPercent() }}%
                  </div>
                </div>
                <div v-if="primaryGoal.milestone_count > 0" class="small">
                  <i class="bi bi-trophy me-1"></i>
                  {{ primaryGoal.achieved_milestones }}/{{ primaryGoal.milestone_count }} milestones achieved
                </div>
              </div>
              <div class="d-flex flex-column align-items-end gap-2">
                <form @submit.prevent="addGoalProgress" class="d-flex align-items-center gap-2">
                  <input v-model.number="progressAmount" type="number" min="1" step="0.01" 
                         class="form-control form-control-lg" placeholder="Add amount..." 
                         style="max-width: 140px;" required 
                         title="Enter amount to add to your goal progress" />
                  <button class="btn btn-success btn-lg px-4" :disabled="progressLoading"
                          title="Add progress to your goal">
                    <span v-if="progressLoading" class="spinner-border spinner-border-sm"></span>
                    <span v-else>Add</span>
                  </button>
                </form>
                <router-link to="/goals" class="btn btn-outline-light btn-sm mt-2">
                  <i class="bi bi-eye"></i> View All Goals
                </router-link>
              </div>
            </div>

            <!-- Multiple Goals Summary -->
            <div v-if="goals.length > 1" class="border-top pt-3" style="border-color: rgba(255,255,255,0.2) !important;">
              <div class="row">
                <div class="col-md-8">
                  <h6 class="text-white-50 mb-2">Other Active Goals</h6>
                  <div class="d-flex flex-wrap gap-2">
                    <div v-for="goal in otherGoals" :key="goal.id" 
                         class="bg-white bg-opacity-10 rounded p-2 text-white small">
                      <div class="fw-bold">{{ goal.title }}</div>
                      <div class="text-white-75">
                        €{{ formatEuroAmount(goal.current_amount) }}/€{{ formatEuroAmount(goal.target_amount) }}
                        ({{ getGoalPercent(goal) }}%)
                      </div>
                    </div>
                  </div>
                </div>
                <div class="col-md-4 text-end">
                  <div class="text-white-50 small">Total Goals Progress</div>
                  <div class="text-white h5 mb-0">{{ getOverallProgress() }}%</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Statistics Widget -->
      <div v-if="customizationStore.dashboardSettings.value.show_stats" 
           class="dashboard-widget stats-widget"
           :class="`widget-${customizationStore.dashboardSettings.value.stats_widget_size || 'medium'}`">
        <div class="card h-100">
          <div class="card-header d-flex justify-content-between align-items-center">
            <h5 class="mb-0">
              <i class="bi bi-graph-up me-2"></i>Statistics
            </h5>
            <small class="text-muted">{{ currentTime }}</small>
          </div>
          <div class="card-body">
            <div class="stats-grid">
              <div class="stat-item">
                <div class="stat-card success">
                  <div class="stat-value">€{{ formatEuroAmount(dashboardData.currentMonth?.work?.total_earnings || 0) }}</div>
                  <div class="stat-label">This Month Earnings</div>
                </div>
              </div>
              <div class="stat-item">
                <div class="stat-card info">
                  <div class="stat-value">{{ dashboardData.currentMonth?.work?.total_hours || 0 }}h</div>
                  <div class="stat-label">Hours Worked</div>
                </div>
              </div>
              <div class="stat-item">
                <div class="stat-card" :class="netIncomeClass">
                  <div class="stat-value">€{{ netIncome }}</div>
                  <div class="stat-label">Net Income</div>
                </div>
              </div>
              <div class="stat-item">
                <div class="stat-card warning">
                  <div class="stat-value">€{{ formatEuroAmount(dashboardData.currentMonth?.expenses?.expense || 0) }}</div>
                  <div class="stat-label">Expenses</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Schedule Widget -->
      <div v-if="customizationStore.dashboardSettings.value.show_schedule" 
           class="dashboard-widget schedule-widget"
           :class="`widget-${customizationStore.dashboardSettings.value.schedule_widget_size || 'medium'}`">
        <div class="card h-100">
          <div class="card-header d-flex justify-content-between align-items-center">
            <h5 class="mb-0">
              <i class="bi bi-calendar-week me-2"></i>Upcoming Schedule
            </h5>
            <router-link to="/schedule" class="btn btn-outline-primary btn-sm">
              <i class="bi bi-calendar-plus me-1"></i>Manage
            </router-link>
          </div>
          <div class="card-body">
            <div v-if="upcomingDays.length === 0" class="text-center py-3">
              <i class="bi bi-calendar text-muted" style="font-size: 2rem;"></i>
              <p class="text-muted mt-2 mb-2">No upcoming work days</p>
              <router-link to="/schedule" class="btn btn-outline-primary btn-sm">
                <i class="bi bi-calendar-plus me-1"></i>Set Your Schedule
              </router-link>
            </div>
            <div v-else>
              <div v-for="day in upcomingDays.slice(0, 5)" :key="day.date" class="d-flex justify-content-between align-items-center mb-2">
                <div>
                  <strong>{{ day.date ? formatDate(day.date) : 'N/A' }}</strong>
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

      <!-- Recent Work Widget -->
      <div v-if="customizationStore.dashboardSettings.value.show_recent_work" 
           class="dashboard-widget work-widget"
           :class="`widget-${customizationStore.dashboardSettings.value.work_widget_size || 'medium'}`">
        <div class="card h-100">
          <div class="card-header d-flex justify-content-between align-items-center">
            <h5 class="mb-0">
              <i class="bi bi-briefcase me-2"></i>Recent Work
            </h5>
            <router-link to="/work" class="btn btn-outline-primary btn-sm">
              <i class="bi bi-plus-circle me-1"></i>Log Work
            </router-link>
          </div>
          <div class="card-body">
            <div v-if="!dashboardData.recentWork || dashboardData.recentWork.length === 0" class="text-center py-3">
              <i class="bi bi-briefcase text-muted" style="font-size: 2rem;"></i>
              <p class="text-muted mt-2 mb-2">No recent work entries</p>
              <router-link to="/work" class="btn btn-outline-primary btn-sm">
                <i class="bi bi-plus-circle me-1"></i>Log Your First Work Entry
              </router-link>
            </div>
            <div v-else>
              <div v-for="work in dashboardData.recentWork.slice(0, 5)" :key="work.id" class="work-item mb-2">
                <div class="d-flex justify-content-between align-items-center">
                  <div>
                    <strong>{{ formatDate(work.date) }}</strong>
                    <small class="text-muted d-block">{{ work.hours }}h - €{{ formatEuroAmount(work.total_pay) }}</small>
                  </div>
                  <span class="badge bg-primary">{{ work.day_type }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Expenses Widget -->
      <div v-if="customizationStore.dashboardSettings.value.show_expenses" 
           class="dashboard-widget expenses-widget"
           :class="`widget-${customizationStore.dashboardSettings.value.expenses_widget_size || 'small'}`">
        <div class="card h-100">
          <div class="card-header d-flex justify-content-between align-items-center">
            <h5 class="mb-0">
              <i class="bi bi-receipt me-2"></i>Recent Expenses
            </h5>
            <router-link to="/expenses" class="btn btn-outline-primary btn-sm">
              <i class="bi bi-plus-circle me-1"></i>Add Expense
            </router-link>
          </div>
          <div class="card-body">
            <div v-if="!dashboardData.recentTransactions || dashboardData.recentTransactions.length === 0" class="text-center py-3">
              <i class="bi bi-receipt text-muted" style="font-size: 2rem;"></i>
              <p class="text-muted mt-2 mb-2">No recent transactions</p>
              <router-link to="/expenses" class="btn btn-outline-primary btn-sm">
                <i class="bi bi-plus-circle me-1"></i>Add Your First Expense
              </router-link>
            </div>
            <div v-else>
              <div v-for="transaction in dashboardData.recentTransactions.slice(0, 5)" :key="transaction.id" class="transaction-item mb-2">
                <div class="d-flex justify-content-between align-items-center">
                  <div>
                    <strong>{{ transaction.description }}</strong>
                    <small class="text-muted d-block">{{ transaction.category }}</small>
                  </div>
                  <div class="text-end">
                    <span :class="transaction.type === 'income' ? 'text-success' : 'text-danger'">
                      {{ transaction.type === 'income' ? '+' : '-' }}€{{ formatEuroAmount(transaction.amount) }}
                    </span>
                    <small class="text-muted d-block">{{ formatDate(transaction.date) }}</small>
                  </div>
                </div>
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
                <label class="form-label">New Hourly Rate (€)</label>
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
import { customizationStore } from '@/stores/customization'
import { useToast } from 'vue-toastification'
import api from '@/services/api'
import { format } from 'date-fns'
import { formatEuroAmount } from '@/utils/currency'

export default {
  name: 'Dashboard',
  setup () {
    const { user, updateHourlyRate: updateUserHourlyRate } = authStore()
    const toast = useToast()
    
    // Initialize customization store
    const customization = customizationStore()

    const loading = ref(true)
    const dashboardData = ref({})
    const upcomingDays = ref([])
    const newHourlyRate = ref(user.value?.hourlyRate || 15)
    const updatingRate = ref(false)
    const currentTime = ref(new Date().toLocaleString())
    const showGoalModal = ref(false)
    const goalLoading = ref(true)
    const goalForm = ref({ title: '', target_amount: '', target_date: '' })
    const goalSaving = ref(false)
    const goal = ref(null)
    const goals = ref([])
    const progressAmount = ref('')
    const progressLoading = ref(false)

    // Initialize customization
    customization.init()

    // Current time update
    setInterval(() => {
      currentTime.value = new Date().toLocaleString()
    }, 1000)

    // Computed properties
    const netIncome = computed(() => {
      const earnings = dashboardData.value.currentMonth?.work?.total_earnings || 0
      const expenses = dashboardData.value.currentMonth?.expenses?.expense || 0
      return formatEuroAmount(earnings - expenses)
    })

    const netIncomeClass = computed(() => {
      const earnings = dashboardData.value.currentMonth?.work?.total_earnings || 0
      const expenses = dashboardData.value.currentMonth?.expenses?.expense || 0
      const net = earnings - expenses
      return net >= 0 ? 'success' : 'danger'
    })

    const goalPercent = computed(() => {
      if (!goal.value || !goal.value.target_amount) return 0
      return Math.min(Math.round((goal.value.current_amount / goal.value.target_amount) * 100), 100)
    })

    const primaryGoal = computed(() => {
      return goals.value.find(g => g.is_primary) || goals.value[0] || null
    })

    const otherGoals = computed(() => {
      return goals.value.filter(g => g.id !== primaryGoal.value?.id)
    })

    // Goal helper methods
    const getPrimaryGoalPercent = () => {
      if (!primaryGoal.value || !primaryGoal.value.target_amount) return 0
      return Math.min(Math.round((primaryGoal.value.current_amount / primaryGoal.value.target_amount) * 100), 100)
    }

    const getGoalPercent = (goal) => {
      if (!goal || !goal.target_amount) return 0
      return Math.min(Math.round((goal.current_amount / goal.target_amount) * 100), 100)
    }

    const getOverallProgress = () => {
      if (goals.value.length === 0) return 0
      const totalProgress = goals.value.reduce((acc, goal) => {
        return acc + getGoalPercent(goal)
      }, 0)
      return Math.round(totalProgress / goals.value.length)
    }

    const getDaysLeft = (targetDate) => {
      if (!targetDate) return 0
      const today = new Date()
      const target = new Date(targetDate)
      const diffTime = target - today
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      return Math.max(0, diffDays)
    }

    // Date formatting function
    const formatCurrentDate = () => {
      return format(new Date(), 'EEEE, MMMM do, yyyy')
    }

    // Methods
    const fetchDashboardData = async () => {
      try {
        loading.value = true
        const response = await api.get('/dashboard')
        dashboardData.value = response.data
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
        toast.error('Failed to load dashboard data. Please refresh the page or try again later.')
      } finally {
        loading.value = false
      }
    }

    const fetchUpcomingDays = async () => {
      try {
        const response = await api.get('/work/upcoming')
        upcomingDays.value = response.data
      } catch (error) {
        console.error('Error fetching upcoming days:', error)
      }
    }

    const fetchGoals = async () => {
      try {
        goalLoading.value = true
        const response = await api.get('/goals')
        goals.value = response.data || []
      } catch (error) {
        console.error('Error fetching goals:', error)
        toast.error('Failed to load goals. Please check your connection and try again.')
      } finally {
        goalLoading.value = false
      }
    }

    const addGoalProgress = async () => {
      if (!primaryGoal.value || !progressAmount.value) return

      try {
        progressLoading.value = true
        await api.post(`/goals/${primaryGoal.value.id}/progress`, {
          amount: progressAmount.value
        })
        
        toast.success('Progress added successfully!')
        progressAmount.value = ''
        await fetchGoals()
        await fetchDashboardData()
      } catch (error) {
        console.error('Error adding progress:', error)
        toast.error('Failed to add progress. Please try again.')
      } finally {
        progressLoading.value = false
      }
    }

    const updateHourlyRate = async () => {
      try {
        updatingRate.value = true
        await updateUserHourlyRate(newHourlyRate.value)
        toast.success('Hourly rate updated successfully')
        // Hide modal
        const modal = document.getElementById('hourlyRateModal')
        if (modal && window.bootstrap) {
          const bsModal = window.bootstrap.Modal.getInstance(modal)
          if (bsModal) bsModal.hide()
        }
      } catch (error) {
        console.error('Error updating hourly rate:', error)
        toast.error('Failed to update hourly rate')
      } finally {
        updatingRate.value = false
      }
    }

    const updateHourlyRateModal = () => {
      if (window.bootstrap) {
        const modal = new window.bootstrap.Modal(document.getElementById('hourlyRateModal'))
        modal.show()
      }
    }

    const saveGoal = async () => {
      try {
        goalSaving.value = true
        const response = await api.post('/goal', goalForm.value)
        goal.value = response.data
        toast.success('Goal saved successfully!')
        showGoalModal.value = false
        goalForm.value = { title: '', target_amount: '', target_date: '' }
        await fetchGoals()
      } catch (error) {
        console.error('Error saving goal:', error)
        toast.error('Failed to save goal')
      } finally {
        goalSaving.value = false
      }
    }

    const formatDate = (date) => {
      if (!date) return 'N/A'
      try {
        return format(new Date(date), 'MMM dd, yyyy')
      } catch {
        return 'Invalid date'
      }
    }

    // Lifecycle
    onMounted(async () => {
      await Promise.all([
        fetchDashboardData(),
        fetchUpcomingDays(),
        fetchGoals()
      ])
    })

    return {
      // Store
      customizationStore: customization,
      // Refs
      user,
      loading,
      dashboardData,
      upcomingDays,
      newHourlyRate,
      updatingRate,
      currentTime,
      showGoalModal,
      goalLoading,
      goalForm,
      goalSaving,
      goal,
      goals,
      progressAmount,
      progressLoading,
      // Computed
      netIncome,
      netIncomeClass,
      goalPercent,
      primaryGoal,
      otherGoals,
      // Methods
      getPrimaryGoalPercent,
      getGoalPercent,
      getOverallProgress,
      getDaysLeft,
      formatCurrentDate,
      addGoalProgress,
      updateHourlyRate,
      updateHourlyRateModal,
      saveGoal,
      formatDate,
      formatEuroAmount
    }
  }
}
</script>

<style scoped>
/* Enhanced Welcome Section */
.dashboard-header {
  margin-bottom: 2rem;
}

.welcome-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 1rem;
  padding: 2rem;
  color: white;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  position: relative;
  overflow: hidden;
}

.welcome-section::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -50%;
  width: 100%;
  height: 200%;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%);
  animation: shimmer 3s ease-in-out infinite;
}

@keyframes shimmer {
  0%, 100% { transform: translateX(-100%); }
  50% { transform: translateX(100%); }
}

.welcome-content {
  position: relative;
  z-index: 2;
}

.dashboard-title {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  color: white;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.welcome-message {
  font-size: 1.2rem;
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.welcome-text {
  color: rgba(255, 255, 255, 0.9);
  font-weight: 400;
}

.username-highlight {
  font-weight: 700;
  font-size: 1.3em;
  background: linear-gradient(45deg, #ffd700, #ffed4e);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-shadow: none;
  display: inline-block;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

.welcome-subtitle {
  font-size: 0.95rem;
  color: rgba(255, 255, 255, 0.8);
  display: flex;
  align-items: center;
  font-weight: 500;
}

.header-actions {
  position: relative;
  z-index: 2;
  gap: 1rem;
}

.time-display {
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 0.75rem;
  padding: 0.75rem 1.25rem;
  display: flex;
  align-items: center;
  color: white;
  font-weight: 600;
  font-size: 0.95rem;
}

.current-time {
  font-family: 'Courier New', monospace;
  letter-spacing: 0.5px;
}

.header-actions .btn {
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  font-weight: 600;
  padding: 0.75rem 1.25rem;
  border-radius: 0.75rem;
  transition: all 0.3s ease;
}

.header-actions .btn:hover {
  background: rgba(255, 255, 255, 0.25);
  border-color: rgba(255, 255, 255, 0.4);
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

/* Responsive welcome section */
@media (max-width: 768px) {
  .welcome-section {
    flex-direction: column;
    text-align: center;
    gap: 1.5rem;
    padding: 1.5rem;
  }
  
  .dashboard-title {
    font-size: 2rem;
  }
  
  .welcome-message {
    justify-content: center;
  }
  
  .header-actions {
    flex-direction: column;
    width: 100%;
    gap: 0.75rem;
  }
  
  .time-display {
    justify-content: center;
  }
}

@media (max-width: 576px) {
  .dashboard-title {
    font-size: 1.75rem;
  }
  
  .welcome-message {
    font-size: 1.1rem;
    flex-direction: column;
    gap: 0.25rem;
  }
  
  .username-highlight {
    font-size: 1.2em;
  }
  
  .welcome-section {
    padding: 1.25rem;
  }
}

.dashboard-grid {
  display: grid;
  gap: 1.5rem;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
}

.layout-grid .dashboard-grid {
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
}

.layout-columns .dashboard-grid {
  grid-template-columns: 1fr;
  max-width: 800px;
  margin: 0 auto;
}

.layout-sidebar .dashboard-grid {
  grid-template-columns: 2fr 1fr;
  gap: 2rem;
}

/* Dashboard widget responsive behavior */
@media (max-width: 1400px) {
  .layout-grid .dashboard-grid {
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  }
}

@media (max-width: 1200px) {
  .layout-sidebar .dashboard-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
  
  .widget-large {
    grid-column: span 1;
  }
}

@media (max-width: 992px) {
  .dashboard-grid {
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 1rem;
  }
}

.dashboard-widget {
  transition: all 0.3s ease;
  animation: fadeInUp 0.6s ease-out;
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

.dashboard-widget:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.widget-small {
  grid-column: span 1;
}

.widget-medium {
  grid-column: span 1;
}

.widget-large {
  grid-column: span 2;
}

.widget-full {
  grid-column: 1 / -1;
}

.goal-hero-card {
  background: linear-gradient(135deg, #4338ca, #3b82f6);
  border-radius: 1rem;
  box-shadow: 0 10px 25px rgba(67, 56, 202, 0.3);
}

.stat-card {
  background: #fff;
  border-radius: 0.75rem;
  padding: 1.5rem;
  text-align: center;
  border: 1px solid #e5e7eb;
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.stat-card.success {
  border-left: 4px solid #10b981;
  background: linear-gradient(135deg, #f0fdf4, #dcfce7);
}

.stat-card.info {
  border-left: 4px solid #3b82f6;
  background: linear-gradient(135deg, #eff6ff, #dbeafe);
}

.stat-card.warning {
  border-left: 4px solid #f59e0b;
  background: linear-gradient(135deg, #fffbeb, #fef3c7);
}

.stat-card.danger {
  border-left: 4px solid #ef4444;
  background: linear-gradient(135deg, #fef2f2, #fecaca);
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 0.25rem;
}

.stat-label {
  font-size: 0.875rem;
  color: #6b7280;
  font-weight: 500;
}

.work-item, .transaction-item {
  padding: 0.75rem;
  border-radius: 0.5rem;
  border: 1px solid #e5e7eb;
  transition: all 0.2s ease;
}

.work-item:hover, .transaction-item:hover {
  background-color: #f9fafb;
  border-color: #d1d5db;
}

/* Make work and transaction items responsive */
@media (max-width: 768px) {
  .work-item, .transaction-item {
    padding: 0.5rem;
  }
  
  .work-item .d-flex,
  .transaction-item .d-flex {
    flex-direction: column;
    align-items: flex-start !important;
    gap: 0.25rem;
  }
  
  .work-item small,
  .transaction-item small {
    font-size: 0.75rem;
  }
}

.card {
  border: 1px solid #e5e7eb;
  border-radius: 0.75rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.card:hover {
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.card-header {
  border-bottom: 1px solid #e5e7eb;
  background-color: #f9fafb;
  border-radius: 0.75rem 0.75rem 0 0;
}

/* Dashboard header responsive */
.dashboard-header {
  flex-wrap: wrap;
  gap: 1rem;
}

.header-actions {
  flex-wrap: wrap;
}

.time-badge {
  white-space: nowrap;
}

/* Responsive statistics grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

/* Responsive adjustments */
@media (max-width: 1200px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .dashboard-grid {
    grid-template-columns: 1fr;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
    gap: 0.75rem;
  }
  
  .widget-large,
  .widget-medium,
  .widget-small {
    grid-column: span 1;
  }
  
  .layout-sidebar .dashboard-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 576px) {
  .stats-grid {
    gap: 0.5rem;
  }
  
  .stat-card {
    padding: 1rem;
  }
  
  .stat-value {
    font-size: 1.25rem;
  }
  
  .stat-label {
    font-size: 0.8rem;
  }
  
  .dashboard-header {
    flex-direction: column;
    align-items: flex-start !important;
    gap: 1rem;
  }
  
  .header-actions {
    width: 100%;
    justify-content: space-between;
  }
  
  .btn-text {
    display: none;
  }
  
  .time-badge {
    font-size: 0.75rem;
  }
  
  .dashboard-grid {
    gap: 0.75rem;
  }
  
  .goal-hero-card {
    padding: 1.5rem !important;
  }
  
  .goal-hero-card .d-flex.flex-md-row {
    flex-direction: column !important;
    align-items: flex-start !important;
    gap: 1rem;
  }
  
  .goal-hero-card .d-flex.align-items-end {
    align-items: flex-start !important;
    width: 100%;
  }
  
  .goal-hero-card form {
    width: 100%;
  }
  
  .goal-hero-card input {
    max-width: none !important;
    flex: 1;
  }
}

/* Theme customization support */
.dashboard-grid[data-theme="dark"] {
  color: #f9fafb;
}

.dashboard-grid[data-theme="dark"] .card {
  background-color: #1f2937;
  border-color: #374151;
  color: #f9fafb;
}

.dashboard-grid[data-theme="dark"] .card-header {
  background-color: #111827;
  border-color: #374151;
}

.dashboard-grid[data-theme="dark"] .stat-card {
  background-color: #1f2937;
  border-color: #374151;
  color: #f9fafb;
}
</style>
