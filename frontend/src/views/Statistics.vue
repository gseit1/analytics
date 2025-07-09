<template>
  <div class="container-fluid py-4">
    <div class="row">
      <div class="col-12">
        <h1 class="h3 mb-4">Statistics</h1>
      </div>
    </div>

    <div class="row mb-4">
      <div class="col-lg-6">
        <div class="card">
          <div class="card-header">
            <h5 class="mb-0">Year Overview</h5>
          </div>
          <div class="card-body">
            <select class="form-select mb-3" v-model="selectedYear" @change="fetchYearData">
              <option v-for="year in years" :key="year" :value="year">{{ year }}</option>
            </select>
            <div v-if="loadingYear" class="text-center py-4">
              <div class="spinner-border text-primary" role="status"></div>
            </div>
            <div v-else class="chart-container">
              <canvas ref="yearChart"></canvas>
            </div>
          </div>
        </div>
      </div>

      <div class="col-lg-6">
        <div class="card">
          <div class="card-header">
            <h5 class="mb-0">Monthly Breakdown</h5>
          </div>
          <div class="card-body">
            <div class="row g-3 mb-3">
              <div class="col-md-6">
                <select class="form-select" v-model="selectedMonth" @change="fetchMonthlyStats">
                  <option v-for="month in months" :key="month.value" :value="month.value">
                    {{ month.label }}
                  </option>
                </select>
              </div>
              <div class="col-md-6">
                <select class="form-select" v-model="selectedMonthYear" @change="fetchMonthlyStats">
                  <option v-for="year in years" :key="year" :value="year">{{ year }}</option>
                </select>
              </div>
            </div>

            <div v-if="loadingMonth" class="text-center py-4">
              <div class="spinner-border text-primary" role="status"></div>
            </div>
            <div v-else-if="monthlyStats.length === 0" class="text-center py-4">
              <i class="bi bi-pie-chart text-muted" style="font-size: 3rem;"></i>
              <p class="text-muted mt-2">No data for selected month</p>
            </div>
            <div v-else class="chart-container">
              <canvas ref="monthChart"></canvas>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Summary Cards -->
    <div class="row mb-4">
      <div class="col-md-3">
        <div class="card stats-card">
          <div class="card-body text-center">
            <div class="stats-value">{{ yearData.totalHours || 0 }}</div>
            <div class="stats-label">Total Hours ({{ selectedYear }})</div>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card stats-card success">
          <div class="card-body text-center">
            <div class="stats-value">${{ yearData.totalEarnings || 0 }}</div>
            <div class="stats-label">Total Earnings ({{ selectedYear }})</div>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card stats-card warning">
          <div class="card-body text-center">
            <div class="stats-value">{{ yearData.totalDays || 0 }}</div>
            <div class="stats-label">Days Worked ({{ selectedYear }})</div>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card stats-card">
          <div class="card-body text-center">
            <div class="stats-value">{{ yearData.avgHoursPerDay || 0 }}</div>
            <div class="stats-label">Avg Hours/Day ({{ selectedYear }})</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Work Patterns -->
    <div class="row">
      <div class="col-lg-8">
        <div class="card">
          <div class="card-header">
            <h5 class="mb-0">Monthly Work Trends</h5>
          </div>
          <div class="card-body">
            <div v-if="loadingYear" class="text-center py-4">
              <div class="spinner-border text-primary" role="status"></div>
            </div>
            <div v-else class="table-responsive">
              <table class="table table-hover">
                <thead>
                  <tr>
                    <th>Month</th>
                    <th>Days Worked</th>
                    <th>Total Hours</th>
                    <th>Avg Hours/Day</th>
                    <th>Total Earnings</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="month in yearData.monthlyData" :key="month.month">
                    <td class="fw-bold">{{ getMonthName(month.month) }}</td>
                    <td>{{ month.days_worked }}</td>
                    <td>{{ parseFloat(month.total_hours) || 0 }}h</td>
                    <td>{{ month.days_worked > 0 ? ((parseFloat(month.total_hours) || 0) / month.days_worked).toFixed(2) : 0 }}h</td>
                    <td class="text-success fw-bold">${{ parseFloat(month.work_earnings) || 0 }}</td>
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
            <h5 class="mb-0">Quick Stats</h5>
          </div>
          <div class="card-body">
            <div class="mb-3">
              <div class="d-flex justify-content-between">
                <span>Most Productive Month:</span>
                <strong>{{ mostProductiveMonth }}</strong>
              </div>
            </div>
            <div class="mb-3">
              <div class="d-flex justify-content-between">
                <span>Highest Earnings Month:</span>
                <strong>{{ highestEarningsMonth }}</strong>
              </div>
            </div>
            <div class="mb-3">
              <div class="d-flex justify-content-between">
                <span>Average Monthly Hours:</span>
                <strong>{{ avgMonthlyHours }}h</strong>
              </div>
            </div>
            <div class="mb-0">
              <div class="d-flex justify-content-between">
                <span>Average Monthly Earnings:</span>
                <strong class="text-success">${{ avgMonthlyEarnings }}</strong>
              </div>
            </div>
          </div>
        </div>

        <div class="card mt-4">
          <div class="card-header">
            <h5 class="mb-0">Goals & Progress</h5>
          </div>
          <div class="card-body">
            <div class="mb-3">
              <small class="text-muted">Monthly Hour Goal Progress</small>
              <div class="progress mt-1">
                <div
                  class="progress-bar"
                  :style="`width: ${hourGoalProgress}%`"
                  :class="hourGoalProgress >= 100 ? 'bg-success' : 'bg-primary'"
                >
                  {{ hourGoalProgress }}%
                </div>
              </div>
              <small class="text-muted">{{ currentMonthHours }}h / 160h (target)</small>
            </div>

            <div class="mb-0">
              <small class="text-muted">Monthly Earnings Goal Progress</small>
              <div class="progress mt-1">
                <div
                  class="progress-bar"
                  :style="`width: ${earningsGoalProgress}%`"
                  :class="earningsGoalProgress >= 100 ? 'bg-success' : 'bg-primary'"
                >
                  {{ earningsGoalProgress }}%
                </div>
              </div>
              <small class="text-muted">${{ currentMonthEarnings }} / $2400 (target)</small>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, nextTick } from 'vue'
import { useToast } from 'vue-toastification'
import api from '@/services/api'
import Chart from 'chart.js/auto'

export default {
  name: 'Statistics',
  setup () {
    const toast = useToast()

    const selectedYear = ref(new Date().getFullYear())
    const selectedMonth = ref(new Date().getMonth() + 1)
    const selectedMonthYear = ref(new Date().getFullYear())

    const loadingYear = ref(false)
    const loadingMonth = ref(false)

    const yearData = ref({ monthlyData: [] })
    const monthlyStats = ref([])

    const yearChart = ref(null)
    const monthChart = ref(null)
    let yearChartInstance = null
    let monthChartInstance = null

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

    const mostProductiveMonth = computed(() => {
      if (!yearData.value.monthlyData.length) return 'N/A'
      const max = yearData.value.monthlyData.reduce((prev, current) =>
        ((parseFloat(prev.total_hours) || 0) > (parseFloat(current.total_hours) || 0)) ? prev : current
      )
      return (parseFloat(max.total_hours) || 0) > 0 ? getMonthName(max.month) : 'N/A'
    })

    const highestEarningsMonth = computed(() => {
      if (!yearData.value.monthlyData.length) return 'N/A'
      const max = yearData.value.monthlyData.reduce((prev, current) =>
        ((parseFloat(prev.work_earnings) || 0) > (parseFloat(current.work_earnings) || 0)) ? prev : current
      )
      return (parseFloat(max.work_earnings) || 0) > 0 ? getMonthName(max.month) : 'N/A'
    })

    const avgMonthlyHours = computed(() => {
      if (!yearData.value.monthlyData.length) return '0.00'
      const total = yearData.value.monthlyData.reduce((sum, month) => sum + (parseFloat(month.total_hours) || 0), 0)
      const monthsWithData = yearData.value.monthlyData.filter(m => (parseFloat(m.total_hours) || 0) > 0).length
      return monthsWithData > 0 ? (total / monthsWithData).toFixed(2) : '0.00'
    })

    const avgMonthlyEarnings = computed(() => {
      if (!yearData.value.monthlyData.length) return '0.00'
      const total = yearData.value.monthlyData.reduce((sum, month) => sum + (parseFloat(month.work_earnings) || 0), 0)
      const monthsWithData = yearData.value.monthlyData.filter(m => (parseFloat(m.work_earnings) || 0) > 0).length
      return monthsWithData > 0 ? (total / monthsWithData).toFixed(2) : '0.00'
    })

    const currentMonthHours = computed(() => {
      const currentMonth = new Date().getMonth() + 1
      const currentYear = new Date().getFullYear()

      if (selectedYear.value !== currentYear) return 0

      const monthData = yearData.value.monthlyData.find(m => m.month === currentMonth)
      return monthData ? (parseFloat(monthData.total_hours) || 0) : 0
    })

    const currentMonthEarnings = computed(() => {
      const currentMonth = new Date().getMonth() + 1
      const currentYear = new Date().getFullYear()

      if (selectedYear.value !== currentYear) return 0

      const monthData = yearData.value.monthlyData.find(m => m.month === currentMonth)
      return monthData ? (parseFloat(monthData.work_earnings) || 0) : 0
    })

    const hourGoalProgress = computed(() => {
      const progress = (currentMonthHours.value / 160) * 100
      return Math.min(100, Math.round(progress))
    })

    const earningsGoalProgress = computed(() => {
      const progress = (currentMonthEarnings.value / 2400) * 100
      return Math.min(100, Math.round(progress))
    })

    const getMonthName = (monthNumber) => {
      return months.find(m => m.value === monthNumber)?.label || 'Unknown'
    }

    const fetchYearData = async () => {
      loadingYear.value = true
      try {
        const response = await api.get('/dashboard/year-overview', {
          params: { year: selectedYear.value }
        })

        yearData.value = response.data

        // Calculate totals
        const totalHours = yearData.value.monthlyData.reduce((sum, m) => sum + (parseFloat(m.total_hours) || 0), 0)
        const totalEarnings = yearData.value.monthlyData.reduce((sum, m) => sum + (parseFloat(m.work_earnings) || 0), 0)
        const totalDays = yearData.value.monthlyData.reduce((sum, m) => sum + (parseInt(m.days_worked) || 0), 0)
        
        yearData.value.totalHours = totalHours.toFixed(2)
        yearData.value.totalEarnings = totalEarnings.toFixed(2)
        yearData.value.totalDays = totalDays
        yearData.value.avgHoursPerDay = totalDays > 0 ? (totalHours / totalDays).toFixed(2) : '0.00'

        await nextTick()
        createYearChart()
      } catch (error) {
        console.error('Error fetching year data:', error)
        toast.error('Failed to load year statistics')
      } finally {
        loadingYear.value = false
      }
    }

    const fetchMonthlyStats = async () => {
      loadingMonth.value = true
      try {
        const response = await api.get('/expenses/summary/category', {
          params: {
            month: selectedMonth.value,
            year: selectedMonthYear.value
          }
        })
        monthlyStats.value = response.data

        await nextTick()
        createMonthChart()
      } catch (error) {
        console.error('Error fetching monthly stats:', error)
        toast.error('Failed to load monthly statistics')
      } finally {
        loadingMonth.value = false
      }
    }

    const createYearChart = () => {
      if (yearChartInstance) {
        yearChartInstance.destroy()
      }

      const ctx = yearChart.value?.getContext('2d')
      if (!ctx) return

      yearChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
          labels: yearData.value.monthlyData.map(m => getMonthName(m.month)),
          datasets: [{
            label: 'Hours Worked',
            data: yearData.value.monthlyData.map(m => parseFloat(m.total_hours) || 0),
            borderColor: '#6366f1',
            backgroundColor: 'rgba(99, 102, 241, 0.1)',
            tension: 0.4,
            yAxisID: 'y'
          }, {
            label: 'Earnings ($)',
            data: yearData.value.monthlyData.map(m => parseFloat(m.work_earnings) || 0),
            borderColor: '#10b981',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            tension: 0.4,
            yAxisID: 'y1'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              type: 'linear',
              display: true,
              position: 'left',
              title: {
                display: true,
                text: 'Hours'
              }
            },
            y1: {
              type: 'linear',
              display: true,
              position: 'right',
              title: {
                display: true,
                text: 'Earnings ($)'
              },
              grid: {
                drawOnChartArea: false
              }
            }
          },
          plugins: {
            legend: {
              display: true
            }
          }
        }
      })
    }

    const createMonthChart = () => {
      if (monthChartInstance) {
        monthChartInstance.destroy()
      }

      const ctx = monthChart.value?.getContext('2d')
      if (!ctx || !monthlyStats.value.length) return

      const categories = [...new Set(monthlyStats.value.map(item => item.category))]
      const expenseData = categories.map(category => {
        const item = monthlyStats.value.find(s => s.category === category && s.type === 'expense')
        return item ? item.total_amount : 0
      })

      monthChartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: categories,
          datasets: [{
            label: 'Amount ($)',
            data: expenseData,
            backgroundColor: [
              '#ef4444', '#f59e0b', '#10b981', '#6366f1',
              '#8b5cf6', '#06b6d4', '#84cc16', '#f97316'
            ]
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: true,
              position: 'bottom'
            }
          }
        }
      })
    }

    onMounted(() => {
      fetchYearData()
      fetchMonthlyStats()
    })

    return {
      selectedYear,
      selectedMonth,
      selectedMonthYear,
      loadingYear,
      loadingMonth,
      yearData,
      monthlyStats,
      yearChart,
      monthChart,
      months,
      years,
      mostProductiveMonth,
      highestEarningsMonth,
      avgMonthlyHours,
      avgMonthlyEarnings,
      currentMonthHours,
      currentMonthEarnings,
      hourGoalProgress,
      earningsGoalProgress,
      getMonthName,
      fetchYearData,
      fetchMonthlyStats
    }
  }
}
</script>
