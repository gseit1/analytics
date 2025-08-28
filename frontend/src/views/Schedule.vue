<template>
  <div class="schedule-page">
    <!-- Header Section -->
    <div class="schedule-header mb-4">
      <div class="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3">
        <div class="header-content">
          <h1 class="h3 mb-1">
            <i class="bi bi-calendar3 me-2 text-primary"></i>Work Schedule
          </h1>
          <p class="text-muted mb-0">Manage your work schedule, track progress, and view earnings</p>
        </div>
        <div class="header-actions d-flex gap-2">
          <button class="btn btn-outline-primary" @click="goToToday">
            <i class="bi bi-house me-1"></i>Today
          </button>
          <button class="btn btn-primary" @click="openScheduleModal">
            <i class="bi bi-gear me-2"></i>Manage Schedule
          </button>
        </div>
      </div>
    </div>

    <style>
    .schedule-page {
      padding: 2rem 2vw;
      width: 100%;
      max-width: 100vw;
      box-sizing: border-box;
    }
    .calendar-section {
      margin-top: 2rem;
      width: 100%;
      max-width: 100vw;
      overflow-x: auto;
    }
    .card {
      width: 100%;
      max-width: 100vw;
      box-sizing: border-box;
      overflow-x: auto;
    }
    .calendar-grid {
      display: grid;
      grid-template-rows: auto 1fr;
      gap: 0.5rem;
      width: 100%;
      min-width: 600px;
      max-width: 100vw;
      overflow-x: auto;
    }
    .calendar-header-row, .calendar-days {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      gap: 0.25rem;
    }
    .calendar-day {
      min-height: 100px;
      background: #fff;
      border-radius: 0.5rem;
      box-shadow: 0 1px 2px rgba(0,0,0,0.03);
      padding: 0.5rem;
      cursor: pointer;
      transition: box-shadow 0.2s;
      overflow: hidden;
      border: 1px solid #f1f1f1;
      box-sizing: border-box;
    }
    .calendar-day.today {
      border: 2px solid #2563eb;
    }
    .calendar-day.other-month {
      background: #f3f4f6;
      color: #b0b0b0;
    }
    .calendar-day.worked {
      border-left: 4px solid #22c55e;
    }
    .calendar-day.scheduled {
      border-left: 4px solid #2563eb;
    }
    .calendar-day.skipped {
      border-left: 4px solid #f59e42;
    }
    .calendar-day.day-off {
      border-left: 4px solid #a3a3a3;
    }
    .day-number {
      font-weight: 600;
      margin-bottom: 0.25rem;
    }
    .work-info, .scheduled-info, .skipped-info, .day-off-info {
      font-size: 0.75rem;
      margin-top: 0.25rem;
    }
    .week-card {
      background: #f9fafb;
      border-radius: 0.5rem;
      box-shadow: 0 1px 2px rgba(0,0,0,0.03);
      padding: 1rem;
      margin-bottom: 1rem;
      width: 100%;
      box-sizing: border-box;
    }
    .week-header {
      font-size: 1rem;
      font-weight: 500;
      margin-bottom: 0.5rem;
    }
    .stat-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 0.25rem;
    }
    .legend {
      display: flex;
      gap: 1rem;
      align-items: center;
    }
    .legend-dot {
      width: 14px;
      height: 14px;
      border-radius: 50%;
      display: inline-block;
      margin-right: 0.5em;
    }
    .legend-dot.worked {
      background: #22c55e;
    }
    .legend-dot.scheduled {
      background: #2563eb;
    }
    .legend-dot.skipped {
      background: #f59e42;
    }
    .legend-dot.day-off {
      background: #a3a3a3;
    }
    .day-schedule-row {
      background: #f8fafc;
      border-radius: 0.5rem;
      padding: 1rem;
      margin-bottom: 0.5rem;
    }
    /* Modal */
    .modal {
      background-color: rgba(0, 0, 0, 0.5);
    }
    .modal.show {
      display: block !important;
    }
    /* Responsive */
    @media (max-width: 900px) {
      .schedule-page {
        padding: 1rem 0.5rem;
      }
      .calendar-section {
        margin-top: 1rem;
        padding: 0;
      }
      .card {
        padding: 0.5rem;
      }
      .calendar-grid {
        min-width: 400px;
        font-size: 0.95rem;
      }
    }
    @media (max-width: 768px) {
      .schedule-page {
        padding: 0.5rem 0.25rem;
      }
      .calendar-section {
        margin-top: 0.5rem;
      }
      .calendar-day {
        min-height: 80px;
        padding: 0.25rem;
        font-size: 0.875rem;
      }
      .week-card {
        margin-bottom: 1rem;
      }
      .legend {
        justify-content: center;
      }
      .header-actions {
        flex-direction: column;
        width: 100%;
      }
      .calendar-grid {
        min-width: 320px;
        font-size: 0.85rem;
      }
    }
    @media (max-width: 480px) {
      .calendar-day {
        min-height: 60px;
        font-size: 0.75rem;
      }
      .day-number {
        font-size: 0.875rem;
      }
      .work-info, .scheduled-info, .skipped-info, .day-off-info {
        font-size: 0.625rem;
      }
      .calendar-grid {
        min-width: 220px;
        font-size: 0.75rem;
      }
    }
    /* Animation */
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
    </style>
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ formatDate(selectedDay?.date) }}</h5>
            <button type="button" class="btn-close" @click="closeDayModal"></button>
          </div>
          <div class="modal-body" v-if="selectedDay">
            <div class="day-status mb-3">
              <h6>Status: 
                <span :class="`badge bg-${getStatusColor(selectedDay.status)}`">
                  {{ getStatusLabel(selectedDay.status) }}
                </span>
              </h6>
            </div>

            <!-- Worked Day Details -->
            <div v-if="selectedDay.status === 'worked'" class="worked-details">
              <div class="row g-3">
                <div class="col-6">
                  <strong>Hours Worked:</strong> {{ selectedDay.hours_worked }}h
                </div>
                <div class="col-6">
                  <strong>Earnings:</strong> ${{ selectedDay.calculated_payment }}
                </div>
                <div class="col-6">
                  <strong>Tips:</strong> ${{ selectedDay.tips_amount || 0 }}
                </div>
                <div class="col-6">
                  <strong>Total:</strong> ${{ (Number(selectedDay.calculated_payment || 0) + Number(selectedDay.tips_amount || 0)).toFixed(2) }}
                </div>
              </div>
              <button class="btn btn-primary mt-3" @click="goToWorkPage">
                <i class="bi bi-pencil me-1"></i>Edit Work Day
              </button>
            </div>

            <!-- Scheduled Day Actions -->
            <div v-else-if="selectedDay.status === 'scheduled'" class="scheduled-actions">
              <p><strong>Scheduled Hours:</strong> {{ selectedDay.scheduled_hours }}h</p>
              <div class="d-flex gap-2 mt-3">
                <button class="btn btn-success" @click="logWork">
                  <i class="bi bi-check-circle me-1"></i>Log Work
                </button>
                <button class="btn btn-warning" @click="skipDay">
                  <i class="bi bi-skip-forward me-1"></i>Skip Day
                </button>
                <button class="btn btn-outline-danger" @click="unscheduleDay">
                  <i class="bi bi-x-circle me-1"></i>Unschedule
                </button>
              </div>
            </div>

            <!-- Skipped Day Actions -->
            <div v-else-if="selectedDay.status === 'skipped'" class="skipped-actions">
              <p class="text-warning">This day was skipped.</p>
              <div class="d-flex gap-2 mt-3">
                <button class="btn btn-success" @click="logWork">
                  <i class="bi bi-check-circle me-1"></i>Log Work Instead
                </button>
                <button class="btn btn-outline-primary" @click="rescheduleDay">
                  <i class="bi bi-arrow-clockwise me-1"></i>Reschedule
                </button>
              </div>
            </div>

            <!-- Day Off or Available Day -->
            <div v-else class="available-actions">
              <p>This day is available for scheduling.</p>
              <button class="btn btn-primary" @click="scheduleDay">
                <i class="bi bi-calendar-plus me-1"></i>Schedule Work
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Manage Schedule Modal -->
    <div class="modal fade" tabindex="-1" :class="{ show: showScheduleModal }" style="display: block;" v-if="showScheduleModal">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Manage Work Schedule</h5>
            <button type="button" class="btn-close" @click="closeScheduleModal"></button>
          </div>
          <div class="modal-body">
            <div class="mb-4">
              <h6>Weekly Schedule</h6>
              <p class="text-muted">Set your default work schedule for each day of the week</p>
            </div>

            <div class="schedule-form">
              <div v-for="(day, index) in weeklySchedule" :key="index" class="day-schedule-row">
                <div class="row align-items-center mb-3">
                  <div class="col-3">
                    <strong>{{ day.name }}</strong>
                  </div>
                  <div class="col-3">
                    <div class="form-check">
                      <input 
                        class="form-check-input" 
                        type="checkbox" 
                        v-model="day.is_work_day"
                        :id="`workday-${index}`"
                      >
                      <label class="form-check-label" :for="`workday-${index}`">
                        Work Day
                      </label>
                    </div>
                  </div>
                  <div class="col-3">
                    <input 
                      type="number" 
                      class="form-control" 
                      v-model="day.default_hours"
                      :disabled="!day.is_work_day"
                      min="0" 
                      max="24" 
                      step="0.5"
                      placeholder="Hours"
                    >
                  </div>
                  <div class="col-3">
                    <small class="text-muted">
                      {{ day.is_work_day ? `$${(day.default_hours * hourlyRate).toFixed(2)}` : 'Day Off' }}
                    </small>
                  </div>
                </div>
              </div>
            </div>

            <hr>

            <div class="bulk-actions">
              <h6>Bulk Schedule Actions</h6>
              <div class="row g-3">
                <div class="col-md-6">
                  <label class="form-label">Schedule for Date Range:</label>
                  <div class="d-flex gap-2">
                    <input type="date" class="form-control" v-model="bulkSchedule.startDate">
                    <input type="date" class="form-control" v-model="bulkSchedule.endDate">
                  </div>
                </div>
                <div class="col-md-3">
                  <label class="form-label">Hours:</label>
                  <input type="number" class="form-control" v-model="bulkSchedule.hours" min="0" max="24" step="0.5">
                </div>
                <div class="col-md-3">
                  <label class="form-label">&nbsp;</label>
                  <button class="btn btn-outline-primary w-100" @click="applyBulkSchedule">
                    Apply Schedule
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="closeScheduleModal">Cancel</button>
            <button type="button" class="btn btn-primary" @click="saveSchedule">Save Schedule</button>
          </div>
        </div>
      </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useToast } from 'vue-toastification'
import { useRouter } from 'vue-router'
import { authStore } from '@/stores/auth'
import api from '@/services/api'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, addMonths, subMonths, startOfWeek, endOfWeek } from 'date-fns'

export default {
  name: 'Schedule',
  setup() {
    const toast = useToast()
    const router = useRouter()
    const { user } = authStore()

    // Reactive data
    const loading = ref(false)
    const selectedMonth = ref(new Date().getMonth() + 1)
    const selectedYear = ref(new Date().getFullYear())
    const calendarDays = ref([])
    const weeklyBreakdown = ref([])
    const showDayModal = ref(false)
    const showScheduleModal = ref(false)
    const selectedDay = ref(null)
    const weeklySchedule = ref([])
    const hourlyRate = ref(user.value?.hourlyRate || 15)

    const bulkSchedule = ref({
      startDate: '',
      endDate: '',
      hours: 8
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
      return Array.from({ length: 3 }, (_, i) => currentYear - 1 + i)
    })

    const currentMonthDisplay = computed(() => {
      const month = months.find(m => m.value === selectedMonth.value)
      return `${month?.label} ${selectedYear.value}`
    })

    // Initialize weekly schedule
    const initializeWeeklySchedule = () => {
      weeklySchedule.value = [
        { name: 'Monday', day_of_week: 1, is_work_day: true, default_hours: 8 },
        { name: 'Tuesday', day_of_week: 2, is_work_day: true, default_hours: 8 },
        { name: 'Wednesday', day_of_week: 3, is_work_day: true, default_hours: 8 },
        { name: 'Thursday', day_of_week: 4, is_work_day: true, default_hours: 8 },
        { name: 'Friday', day_of_week: 5, is_work_day: true, default_hours: 8 },
        { name: 'Saturday', day_of_week: 6, is_work_day: false, default_hours: 0 },
        { name: 'Sunday', day_of_week: 0, is_work_day: false, default_hours: 0 }
      ]
    }

    // Fetch calendar data
    const fetchCalendarData = async () => {
      loading.value = true
      try {
        const response = await api.get('/work/calendar/monthly', {
          params: {
            month: selectedMonth.value,
            year: selectedYear.value
          }
        })

        console.log('Calendar API response:', response.data)
        console.log('Selected month/year:', selectedMonth.value, selectedYear.value)
        console.log('User info:', user.value)
        generateCalendarDays(response.data)
        calculateWeeklyBreakdown(response.data)
      } catch (error) {
        console.error('Error fetching calendar data:', error)
        toast.error('Failed to load calendar data')
      } finally {
        loading.value = false
      }
    }

    // Generate calendar days
    const generateCalendarDays = (data) => {
      const firstDay = new Date(selectedYear.value, selectedMonth.value - 1, 1)
      const lastDay = new Date(selectedYear.value, selectedMonth.value, 0)
      const startDate = startOfWeek(firstDay, { weekStartsOn: 1 })
      const endDate = endOfWeek(lastDay, { weekStartsOn: 1 })
      
      const days = eachDayOfInterval({ start: startDate, end: endDate })
      
      calendarDays.value = days.map(date => {
        const dateStr = format(date, 'yyyy-MM-dd')
        
        // Find all entries for this date
        const dayEntries = data.filter(d => d.work_date === dateStr)
        
        // Prioritize status: worked > skipped > scheduled > available
        let dayData = null
        if (dayEntries.find(d => d.status === 'worked')) {
          dayData = dayEntries.find(d => d.status === 'worked')
        } else if (dayEntries.find(d => d.status === 'skipped')) {
          dayData = dayEntries.find(d => d.status === 'skipped')
        } else if (dayEntries.find(d => d.status === 'scheduled')) {
          dayData = dayEntries.find(d => d.status === 'scheduled')
        }
        
        const isCurrentMonth = date.getMonth() === selectedMonth.value - 1
        
        return {
          date: dateStr,
          day: date.getDate(),
          dayOfWeek: getDay(date),
          currentMonth: isCurrentMonth,
          isToday: format(date, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd'),
          status: dayData?.status || 'available',
          hours_worked: Number(dayData?.hours || 0),
          calculated_payment: Number(dayData?.calculated_payment || 0),
          tips_amount: Number(dayData?.tips_amount || 0),
          scheduled_hours: Number(dayData?.hours || 0)
        }
      })
    }

    // Calculate weekly breakdown
    const calculateWeeklyBreakdown = (data) => {
      const weeks = []
      const monthData = data.filter(d => d && d.work_date && typeof d.work_date === 'string' && d.work_date.startsWith(`${selectedYear.value}-${String(selectedMonth.value).padStart(2, '0')}`))
      
      // Group by weeks
      const firstDay = new Date(selectedYear.value, selectedMonth.value - 1, 1)
      const lastDay = new Date(selectedYear.value, selectedMonth.value, 0)
      
      let currentWeekStart = startOfWeek(firstDay, { weekStartsOn: 1 })
      let weekIndex = 0
      
      while (currentWeekStart <= lastDay && weekIndex < 6) {
        const weekEnd = endOfWeek(currentWeekStart, { weekStartsOn: 1 })
        const weekData = monthData.filter(d => {
          if (!d || !d.work_date) return false
          const date = new Date(d.work_date)
          return date >= currentWeekStart && date <= weekEnd
        })
        
        const actualHours = weekData.reduce((sum, d) => sum + Number(d.hours || 0), 0)
        const actualEarnings = weekData.reduce((sum, d) => sum + Number(d.calculated_payment || 0), 0)
        const tips = weekData.reduce((sum, d) => sum + Number(d.tips_amount || 0), 0)
        const scheduledHours = weekData.reduce((sum, d) => sum + Number(d.hours || 0), 0)
        
        weeks.push({
          dateRange: `${format(currentWeekStart, 'MMM d')} - ${format(weekEnd, 'MMM d')}`,
          actualHours: actualHours.toFixed(1),
          scheduledHours: scheduledHours.toFixed(1),
          actualEarnings,
          tips,
          estimatedEarnings: (scheduledHours - actualHours) * hourlyRate.value,
          completionRate: scheduledHours > 0 ? Math.round((actualHours / scheduledHours) * 100) : 0
        })
        
        currentWeekStart = new Date(currentWeekStart.getTime() + 7 * 24 * 60 * 60 * 1000)
        weekIndex++
      }
      
      weeklyBreakdown.value = weeks
    }

    // Navigation functions
    const navigatePrevious = () => {
      if (selectedMonth.value === 1) {
        selectedMonth.value = 12
        selectedYear.value--
      } else {
        selectedMonth.value--
      }
      fetchCalendarData()
    }

    const navigateNext = () => {
      if (selectedMonth.value === 12) {
        selectedMonth.value = 1
        selectedYear.value++
      } else {
        selectedMonth.value++
      }
      fetchCalendarData()
    }

    const goToToday = () => {
      const today = new Date()
      selectedMonth.value = today.getMonth() + 1
      selectedYear.value = today.getFullYear()
      fetchCalendarData()
    }

    // Modal functions
    const openDayModal = (day) => {
      if (day && day.currentMonth) {
        selectedDay.value = day
        showDayModal.value = true
      }
    }

    const closeDayModal = () => {
      showDayModal.value = false
      selectedDay.value = null
    }

    const openScheduleModal = async () => {
      try {
        const response = await api.get('/work/schedule')
        // Update weekly schedule with fetched data
        response.data.forEach(item => {
          const day = weeklySchedule.value.find(d => d.day_of_week === item.day_of_week)
          if (day) {
            day.is_work_day = item.is_work_day
            day.default_hours = item.default_hours
          }
        })
      } catch (error) {
        console.error('Error fetching schedule:', error)
      }
      showScheduleModal.value = true
    }

    const closeScheduleModal = () => {
      showScheduleModal.value = false
    }

    // Schedule management
    const saveSchedule = async () => {
      try {
        await api.put('/work/schedule', {
          schedule: weeklySchedule.value.map(day => ({
            day_of_week: day.day_of_week,
            is_work_day: day.is_work_day,
            default_hours: day.default_hours
          }))
        })
        toast.success('Schedule saved successfully')
        closeScheduleModal()
        fetchCalendarData()
      } catch (error) {
        console.error('Error saving schedule:', error)
        toast.error('Failed to save schedule')
      }
    }

    // Day actions
    const scheduleDay = async () => {
      try {
        const dayOfWeek = selectedDay.value.dayOfWeek
        const defaultDay = weeklySchedule.value.find(d => d.day_of_week === dayOfWeek)
        const hours = defaultDay?.default_hours || 8

        await api.post('/work/schedule/bulk', {
          dates: [selectedDay.value.date],
          hours
        })
        
        toast.success('Day scheduled successfully')
        closeDayModal()
        fetchCalendarData()
      } catch (error) {
        console.error('Error scheduling day:', error)
        toast.error('Failed to schedule day')
      }
    }

    const skipDay = async () => {
      try {
        await api.post(`/work/schedule/skip/${selectedDay.value.date}`)
        toast.success('Day skipped')
        closeDayModal()
        fetchCalendarData()
      } catch (error) {
        console.error('Error skipping day:', error)
        toast.error('Failed to skip day')
      }
    }

    const unscheduleDay = async () => {
      try {
        await api.delete(`/work/schedule/${selectedDay.value.date}`)
        toast.success('Day unscheduled')
        closeDayModal()
        fetchCalendarData()
      } catch (error) {
        console.error('Error unscheduling day:', error)
        toast.error('Failed to unschedule day')
      }
    }

    const rescheduleDay = async () => {
      try {
        await api.delete(`/work/schedule/skip/${selectedDay.value.date}`)
        await scheduleDay()
      } catch (error) {
        console.error('Error rescheduling day:', error)
        toast.error('Failed to reschedule day')
      }
    }

    const logWork = () => {
      router.push('/work')
    }

    const goToWorkPage = () => {
      router.push('/work')
    }

    // Bulk schedule
    const applyBulkSchedule = async () => {
      if (!bulkSchedule.value.startDate || !bulkSchedule.value.endDate) {
        toast.error('Please select start and end dates')
        return
      }

      try {
        const start = new Date(bulkSchedule.value.startDate)
        const end = new Date(bulkSchedule.value.endDate)
        const dates = eachDayOfInterval({ start, end }).map(date => format(date, 'yyyy-MM-dd'))

        await api.post('/work/schedule/bulk', {
          dates,
          hours: bulkSchedule.value.hours
        })

        toast.success(`Scheduled ${dates.length} days`)
        fetchCalendarData()
      } catch (error) {
        console.error('Error applying bulk schedule:', error)
        toast.error('Failed to apply bulk schedule')
      }
    }

    // Utility functions
    const formatDate = (dateStr) => {
      if (!dateStr) return ''
      return format(new Date(dateStr), 'EEEE, MMMM d, yyyy')
    }

    const getStatusColor = (status) => {
      const colors = {
        worked: 'success',
        scheduled: 'primary',
        skipped: 'warning',
        day_off: 'secondary',
        available: 'light'
      }
      return colors[status] || 'light'
    }

    const getStatusLabel = (status) => {
      const labels = {
        worked: 'Worked',
        scheduled: 'Scheduled',
        skipped: 'Skipped',
        day_off: 'Day Off',
        available: 'Available'
      }
      return labels[status] || 'Available'
    }

    // Initialize
    onMounted(() => {
      initializeWeeklySchedule()
      fetchCalendarData()
    })

    return {
      // Data
      loading,
      selectedMonth,
      selectedYear,
      calendarDays,
      weeklyBreakdown,
      showDayModal,
      showScheduleModal,
      selectedDay,
      weeklySchedule,
      hourlyRate,
      bulkSchedule,
      months,
      years,
      
      // Computed
      currentMonthDisplay,
      
      // Methods
      fetchCalendarData,
      navigatePrevious,
      navigateNext,
      goToToday,
      openDayModal,
      closeDayModal,
      openScheduleModal,
      closeScheduleModal,
      saveSchedule,
      scheduleDay,
      skipDay,
      unscheduleDay,
      rescheduleDay,
      logWork,
      goToWorkPage,
      applyBulkSchedule,
      formatDate,
      getStatusColor,
      getStatusLabel
    }
  }
}
</script>

<style scoped>
.schedule-page {
  padding: 1.5rem;
  max-width: 1400px;
  margin: 0 auto;
}

/* Header */
.schedule-header {
  animation: fadeInDown 0.6s ease-out;
}

.header-content h1 {
  color: #1e293b;
  font-weight: 700;
}

/* Calendar Grid */
.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 1px;
  background-color: #e5e7eb;
  border-radius: 0.5rem;
  overflow: hidden;
}

.calendar-header-row {
  display: contents;
}

.day-header {
  background-color: #f8fafc;
  padding: 0.75rem;
  text-align: center;
  font-weight: 600;
  color: #374151;
  border-bottom: 2px solid #e5e7eb;
}

.calendar-days {
  display: contents;
}

.calendar-day {
  background-color: white;
  min-height: 100px;
  padding: 0.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
}

.calendar-day:hover {
  background-color: #f8fafc;
  transform: scale(1.02);
}

.calendar-day.other-month {
  background-color: #f9fafb;
  color: #9ca3af;
}

.calendar-day.today {
  background-color: #dbeafe;
  border: 2px solid #3b82f6;
}

.day-number {
  font-weight: 600;
  margin-bottom: 0.25rem;
}

/* Status-based styling */
.calendar-day.worked {
  background-color: #d1fae5;
  border-left: 4px solid #10b981;
}

.calendar-day.worked:hover {
  background-color: #a7f3d0;
}

.calendar-day.scheduled {
  background-color: #dbeafe;
  border-left: 4px solid #3b82f6;
}

.calendar-day.scheduled:hover {
  background-color: #bfdbfe;
}

.calendar-day.skipped {
  background-color: #fef3c7;
  border-left: 4px solid #f59e0b;
}

.calendar-day.skipped:hover {
  background-color: #fde68a;
}

.calendar-day.day-off {
  background-color: #f3f4f6;
  border-left: 4px solid #6b7280;
}

.calendar-day.day-off:hover {
  background-color: #e5e7eb;
}

/* Work info styling */
.work-info, .scheduled-info, .skipped-info, .day-off-info {
  font-size: 0.75rem;
  text-align: center;
}

.hours {
  font-weight: 600;
  color: #059669;
}

.earnings {
  color: #0d9488;
  font-weight: 500;
}

.scheduled-hours {
  font-weight: 600;
  color: #2563eb;
}

.scheduled-text {
  color: #3b82f6;
  font-size: 0.7rem;
}

.skipped-text {
  color: #d97706;
  font-weight: 500;
}

.day-off-text {
  color: #6b7280;
  font-size: 0.7rem;
}

/* Legend */
.legend {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
}

.legend-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.legend-dot.worked {
  background-color: #10b981;
}

.legend-dot.scheduled {
  background-color: #3b82f6;
}

.legend-dot.skipped {
  background-color: #f59e0b;
}

.legend-dot.day-off {
  background-color: #6b7280;
}

/* Weekly Money Cards */
.week-card {
  background: linear-gradient(135deg, #f8fafc, #f1f5f9);
  border-radius: 0.75rem;
  padding: 1rem;
  border: 1px solid #e2e8f0;
  transition: all 0.3s ease;
}

.week-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.week-header {
  margin-bottom: 0.75rem;
  text-align: center;
}

.week-stats .stat-row:not(:last-child) {
  margin-bottom: 0.5rem;
}

.stat-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.25rem;
}

.stat-label {
  font-size: 0.875rem;
  color: #6b7280;
}

.stat-value {
  font-weight: 600;
}

/* Schedule Form */
.day-schedule-row {
  background: #f8fafc;
  border-radius: 0.5rem;
  padding: 1rem;
  margin-bottom: 0.5rem;
}

/* Modal */
.modal {
  background-color: rgba(0, 0, 0, 0.5);
}

.modal.show {
  display: block !important;
}

/* Responsive */
@media (max-width: 768px) {
  .schedule-page {
    padding: 1rem;
  }
  
  .calendar-day {
    min-height: 80px;
    padding: 0.25rem;
    font-size: 0.875rem;
  }
  
  .week-card {
    margin-bottom: 1rem;
  }
  
  .legend {
    justify-content: center;
  }
  
  .header-actions {
    flex-direction: column;
    width: 100%;
  }
}

@media (max-width: 480px) {
  .calendar-day {
    min-height: 60px;
    font-size: 0.75rem;
  }
  
  .day-number {
    font-size: 0.875rem;
  }
  
  .work-info, .scheduled-info, .skipped-info, .day-off-info {
    font-size: 0.625rem;
  }
}

/* Animation */
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
</style>
