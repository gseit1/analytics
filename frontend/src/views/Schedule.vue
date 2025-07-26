<template>
  <div class="container-fluid py-4">
    <div class="row">
      <div class="col-12">
        <div class="d-flex justify-content-between align-items-center mb-4 flex-wrap">
          <h1 class="h3 mb-0">Monthly Schedule</h1>
          <div class="d-flex gap-2 flex-wrap">
            <button class="btn btn-primary" @click="openScheduleModal">
              <i class="bi bi-plus-circle me-2"></i>Manage Schedule
            </button>
            <select class="form-select" v-model="selectedMonth" @change="fetchCalendarData" style="width: auto; min-width: 120px;">
              <option v-for="month in months" :key="month.value" :value="month.value">
                {{ month.label }}
              </option>
            </select>
            <select class="form-select" v-model="selectedYear" @change="fetchCalendarData" style="width: auto; min-width: 100px;">
              <option v-for="year in years" :key="year" :value="year">{{ year }}</option>
            </select>
          </div>
        </div>
      </div>
    </div>

    <!-- Monthly Summary -->
    <div class="row mb-4">
      <div class="col-md-2">
        <div class="card text-center">
          <div class="card-body">
            <div class="h4 mb-0">{{ summary.workedDays }}</div>
            <small class="text-muted">Days Worked</small>
          </div>
        </div>
      </div>
      <div class="col-md-2">
        <div class="card text-center">
          <div class="card-body">
            <div class="h4 mb-0">{{ summary.totalHours.toFixed(1) }}h</div>
            <small class="text-muted">Total Hours</small>
          </div>
        </div>
      </div>
      <div class="col-md-2">
        <div class="card text-center">
          <div class="card-body">
            <div class="h4 mb-0 text-success">${{ summary.totalEarnings.toFixed(2) }}</div>
            <small class="text-muted">Total Earnings</small>
          </div>
        </div>
      </div>
      <div class="col-md-2">
        <div class="card text-center">
          <div class="card-body">
            <div class="h4 mb-0 text-warning">${{ summary.totalTips.toFixed(2) }}</div>
            <small class="text-muted">Total Tips</small>
          </div>
        </div>
      </div>
      <div class="col-md-2">
        <div class="card text-center">
          <div class="card-body">
            <div class="h4 mb-0">{{ summary.avgHoursPerDay.toFixed(1) }}h</div>
            <small class="text-muted">Avg Hours/Day</small>
          </div>
        </div>
      </div>
      <div class="col-md-2">
        <div class="card text-center">
          <div class="card-body">
            <div class="h4 mb-0">{{ summary.attendanceRate.toFixed(0) }}%</div>
            <small class="text-muted">Attendance</small>
          </div>
        </div>
      </div>
    </div>

    <!-- Weekly Estimated Earnings -->
    <div class="row mb-4">
      <div class="col-12">
        <div class="card">
          <div class="card-header">
            <h5 class="mb-0">Weekly Estimated Earnings</h5>
            <small class="text-muted">Based on actual work days and scheduled hours</small>
          </div>
          <div class="card-body">
            <div class="table-responsive">
              <table class="table table-hover">
                <thead>
                  <tr>
                    <th>Week</th>
                    <th>Actual Hours</th>
                    <th>Actual Earnings</th>
                    <th>Scheduled Hours</th>
                    <th>Estimated Earnings</th>
                    <th>Total Projected</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(week, index) in weeklyBreakdown" :key="index">
                    <td>
                      <strong>Week {{ index + 1 }}</strong>
                      <small class="text-muted d-block">{{ week.dateRange }}</small>
                    </td>
                    <td>
                      <span class="badge bg-success">{{ week.actualHours.toFixed(1) }}h</span>
                    </td>
                    <td>
                      <span class="text-success fw-bold">${{ week.actualEarnings.toFixed(2) }}</span>
                    </td>
                    <td>
                      <span class="badge bg-primary">{{ week.scheduledHours.toFixed(1) }}h</span>
                    </td>
                    <td>
                      <span class="text-primary">${{ week.estimatedEarnings.toFixed(2) }}</span>
                    </td>
                    <td>
                      <span class="fw-bold text-info">${{ week.totalProjected.toFixed(2) }}</span>
                    </td>
                  </tr>
                </tbody>
                <tfoot>
                  <tr class="table-warning">
                    <td><strong>Total Month</strong></td>
                    <td><strong>{{ monthlyTotals.actualHours.toFixed(1) }}h</strong></td>
                    <td><strong class="text-success">${{ monthlyTotals.actualEarnings.toFixed(2) }}</strong></td>
                    <td><strong>{{ monthlyTotals.scheduledHours.toFixed(1) }}h</strong></td>
                    <td><strong class="text-primary">${{ monthlyTotals.estimatedEarnings.toFixed(2) }}</strong></td>
                    <td><strong class="text-info">${{ monthlyTotals.totalProjected.toFixed(2) }}</strong></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Legend -->
    <div class="row mb-3">
      <div class="col-12">
        <div class="card">
          <div class="card-body py-2">
            <div class="d-flex justify-content-center gap-4 flex-wrap">
              <div class="d-flex align-items-center">
                <div class="legend-dot worked me-2"></div>
                <small>Worked</small>
              </div>
              <div class="d-flex align-items-center">
                <div class="legend-dot scheduled me-2"></div>
                <small>Scheduled</small>
              </div>
              <div class="d-flex align-items-center">
                <div class="legend-dot missed me-2"></div>
                <small>Missed</small>
              </div>
              <div class="d-flex align-items-center">
                <div class="legend-dot skipped me-2"></div>
                <small>Skipped</small>
              </div>
              <div class="d-flex align-items-center">
                <div class="legend-dot day-off me-2"></div>
                <small>Day Off</small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Calendar Grid -->
    <div class="row">
      <div class="col-12">
        <div class="card">
          <div class="card-body">
            <div v-if="loading" class="text-center py-5">
              <div class="spinner-border text-primary" role="status"></div>
              <p class="mt-2">Loading calendar...</p>
            </div>
            <div v-else class="calendar-grid">
              <!-- Day headers -->
              <div class="calendar-header">
                <div class="day-header">Mon</div>
                <div class="day-header">Tue</div>
                <div class="day-header">Wed</div>
                <div class="day-header">Thu</div>
                <div class="day-header">Fri</div>
                <div class="day-header">Sat</div>
                <div class="day-header">Sun</div>
              </div>
              
              <!-- Calendar days -->
              <div class="calendar-days">
                <!-- Empty cells for days before month start -->
                <div v-for="n in monthStartDay" :key="`empty-${n}`" class="calendar-day empty"></div>
                
                <!-- Actual month days -->
                <div 
                  v-for="day in calendarData" 
                  :key="day.date" 
                  class="calendar-day"
                  :class="getDayClass(day)"
                  @click="selectDay(day)"
                >
                  <div class="day-number">{{ day.day }}</div>
                  <div class="day-content">
                    <div v-if="day.worked" class="work-info">
                      <div class="hours">{{ day.hours }}h</div>
                      <div class="earnings">${{ day.earnings.toFixed(0) }}</div>
                      <div v-if="day.tips > 0" class="tips">+${{ day.tips.toFixed(0) }}</div>
                    </div>
                    <div v-else-if="day.status === 'scheduled'" class="scheduled-info">
                      <div class="scheduled-hours">{{ day.hours }}h</div>
                      <div class="scheduled-text">Scheduled</div>
                    </div>                  <div v-else-if="day.status === 'missed'" class="missed-info">
                    <div class="missed-text">Missed</div>
                  </div>
                  <div v-else-if="day.status === 'skipped'" class="skipped-info">
                    <div class="skipped-text">Skipped</div>
                  </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Day Detail Modal -->
    <div v-if="showModal && selectedDay" class="modal-overlay" @click="closeModal">
      <div class="modal-container" @click.stop>
        <div class="modal-header">
          <h5 class="modal-title">
            {{ selectedDay.dayName }}, {{ getMonthName(selectedMonth) }} {{ selectedDay.day }}, {{ selectedYear }}
          </h5>
          <button type="button" class="btn-close" @click="closeModal">&times;</button>
        </div>
        <div class="modal-body">
          <div class="row">
            <div class="col-md-6">
              <h6>Status</h6>
              <span class="badge" :class="getStatusBadgeClass(selectedDay.status)">
                {{ getStatusText(selectedDay.status) }}
              </span>
              <div v-if="selectedDay.status === 'scheduled'" class="mt-2">
                <small class="text-muted">
                  {{ selectedDay.isSpecificallyScheduled ? 'Specifically scheduled for this date' : 'Scheduled as part of weekly routine' }}
                </small>
              </div>
            </div>
            <div class="col-md-6">
              <h6>Day Type</h6>
              <span class="badge bg-secondary">
                {{ selectedDay.isScheduledWorkDay ? 'Work Day' : 'Day Off' }}
              </span>
            </div>
          </div>
          
          <div v-if="selectedDay.worked" class="mt-3">
            <h6>Work Details</h6>
            <div class="row">
              <div class="col-md-6">
                <strong>Hours:</strong> {{ selectedDay.hours }}h<br>
                <strong>Earnings:</strong> ${{ selectedDay.earnings.toFixed(2) }}<br>
                <strong>Tips:</strong> ${{ selectedDay.tips.toFixed(2) }}
              </div>
              <div class="col-md-6">
                <strong>Start:</strong> {{ selectedDay.startTime || 'N/A' }}<br>
                <strong>End:</strong> {{ selectedDay.endTime || 'N/A' }}<br>
                <strong>Payment:</strong> 
                <span class="badge" :class="selectedDay.paymentStatus === 'paid' ? 'bg-success' : 'bg-warning'">
                  {{ selectedDay.paymentStatus || 'pending' }}
                </span>
              </div>
            </div>
            <div v-if="selectedDay.notes" class="mt-2">
              <strong>Notes:</strong><br>
              <div class="bg-light p-2 rounded">{{ selectedDay.notes }}</div>
            </div>
          </div>
          
          <div v-else-if="selectedDay.status === 'scheduled'" class="mt-3">
            <h6>Scheduled Details</h6>
            <p><strong>Planned Hours:</strong> {{ selectedDay.hours }}h</p>
            <p><strong>Estimated Earnings:</strong> ${{ selectedDay.earnings.toFixed(2) }}</p>
          </div>

          <div v-else-if="selectedDay.status === 'skipped'" class="mt-3">
            <h6>Skipped Day</h6>
            <p><strong>Reason:</strong> {{ selectedDay.skipReason || 'User skipped' }}</p>
            <div class="alert alert-warning">
              <i class="bi bi-info-circle me-2"></i>
              This day was marked as skipped. You can un-skip it to restore the schedule.
            </div>
          </div>

          <!-- Debug Information (temporary) -->
          <div class="mt-3 p-2 bg-light rounded" style="font-size: 12px;">
            <strong>Debug Info:</strong><br>
            Status: {{ selectedDay.status }}<br>
            Is Specifically Scheduled: {{ selectedDay.isSpecificallyScheduled }}<br>
            Can Remove From Schedule: {{ selectedDay.canRemoveFromSchedule }}<br>
            Is Scheduled Work Day: {{ selectedDay.isScheduledWorkDay }}<br>
            Worked: {{ selectedDay.worked }}
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" @click="closeModal">Close</button>
          <div class="btn-group" v-if="!selectedDay.worked">
            <!-- Schedule button: show for day-off status only -->
            <button 
              v-if="selectedDay.status === 'day-off'" 
              type="button" 
              class="btn btn-success" 
              @click="scheduleWorkDay"
              :disabled="updatingSchedule"
            >
              <i class="bi bi-plus-circle me-1"></i>
              {{ updatingSchedule ? 'Scheduling...' : 'Schedule Work Day' }}
            </button>
            <!-- Remove button: show for specifically scheduled days -->
            <button 
              v-if="selectedDay.canRemoveFromSchedule && selectedDay.isSpecificallyScheduled" 
              type="button" 
              class="btn btn-warning" 
              @click="unscheduleWorkDay"
              :disabled="updatingSchedule"
            >
              <i class="bi bi-x-circle me-1"></i>
              {{ updatingSchedule ? 'Removing...' : 'Remove from Schedule' }}
            </button>
            <!-- Skip button: show for recurring scheduled days -->
            <button 
              v-if="selectedDay.status === 'scheduled' && !selectedDay.isSpecificallyScheduled" 
              type="button" 
              class="btn btn-outline-warning" 
              @click="skipScheduledDay"
              :disabled="updatingSchedule"
            >
              <i class="bi bi-skip-forward me-1"></i>
              {{ updatingSchedule ? 'Skipping...' : 'Skip This Day' }}
            </button>
            <!-- Un-skip button: show for skipped days -->
            <button 
              v-if="selectedDay.status === 'skipped'" 
              type="button" 
              class="btn btn-outline-success" 
              @click="unskipDay"
              :disabled="updatingSchedule"
            >
              <i class="bi bi-arrow-counterclockwise me-1"></i>
              {{ updatingSchedule ? 'Restoring...' : 'Un-skip Day' }}
            </button>
          </div>
          <!-- Log work button: show for any scheduled day -->
          <button v-if="selectedDay.status === 'scheduled'" type="button" class="btn btn-primary" @click="goToWorkPage">
            <i class="bi bi-clock me-1"></i>Log Work Day
          </button>
        </div>
      </div>
    </div>

    <!-- Schedule Management Modal -->
    <div v-if="showScheduleModal" class="modal-overlay" @click="closeScheduleModal">
      <div class="modal-container large-modal" @click.stop>
        <div class="modal-header">
          <h5 class="modal-title">
            Manage Work Schedule - {{ getMonthName(selectedMonth) }} {{ selectedYear }}
          </h5>
          <button type="button" class="btn-close" @click="closeScheduleModal">&times;</button>
        </div>
        <div class="modal-body">
          <div class="row mb-3">
            <div class="col-md-6">
              <label class="form-label">Default Hours per Work Day</label>
              <input
                type="number"
                step="0.5"
                min="1"
                max="24"
                class="form-control"
                v-model="scheduleForm.defaultHours"
                placeholder="8"
              >
            </div>
            <div class="col-md-6">
              <label class="form-label">Quick Actions</label>
              <div class="d-grid gap-2">
                <button class="btn btn-outline-primary btn-sm" @click="selectWeekdays">
                  <i class="bi bi-calendar-week me-1"></i>Schedule All Weekdays
                </button>
                <button class="btn btn-outline-warning btn-sm" @click="clearAllScheduled">
                  <i class="bi bi-x-circle me-1"></i>Clear All Scheduled
                </button>
              </div>
            </div>
          </div>

          <div class="schedule-grid">
            <div class="schedule-header">
              <div class="day-header">Mon</div>
              <div class="day-header">Tue</div>
              <div class="day-header">Wed</div>
              <div class="day-header">Thu</div>
              <div class="day-header">Fri</div>
              <div class="day-header">Sat</div>
              <div class="day-header">Sun</div>
            </div>
            
            <div class="schedule-days">
              <!-- Empty cells for days before month start -->
              <div v-for="n in monthStartDay" :key="`empty-${n}`" class="schedule-day empty"></div>
              
              <!-- Actual month days -->
              <div 
                v-for="day in scheduleCalendarData" 
                :key="day.date" 
                class="schedule-day"
                :class="getScheduleDayClass(day)"
                @click="toggleDaySchedule(day)"
              >
                <div class="day-number">{{ day.day }}</div>
                <div class="day-content">
                  <div v-if="day.worked" class="worked-indicator">
                    <i class="bi bi-check-circle text-success"></i>
                    <small>Worked</small>
                  </div>
                  <div v-else-if="day.tempScheduled || day.status === 'scheduled'" class="scheduled-indicator">
                    <i class="bi bi-clock text-primary"></i>
                    <small>{{ scheduleForm.defaultHours }}h</small>
                  </div>
                  <div v-else class="unscheduled-indicator">
                    <i class="bi bi-plus-circle text-muted"></i>
                    <small>Click to schedule</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" @click="closeScheduleModal">Cancel</button>
          <button type="button" class="btn btn-primary" @click="saveScheduleChanges" :disabled="savingSchedule">
            <i class="bi bi-save me-1"></i>
            {{ savingSchedule ? 'Saving...' : 'Save Schedule' }}
          </button>
        </div>
      </div>
    </div>

    <div class="card mt-4">
      <div class="card-header">
        <h5 class="mb-0">Tips</h5>
      </div>
      <div class="card-body">
        <ul class="list-unstyled mb-0">
          <li class="mb-2">
            <i class="bi bi-lightbulb text-warning me-2"></i>
            Set realistic default hours for each work day
          </li>
          <li class="mb-2">
            <i class="bi bi-lightbulb text-warning me-2"></i>
            You can always adjust actual hours when logging work days
          </li>
          <li class="mb-0">
            <i class="bi bi-lightbulb text-warning me-2"></i>
            Your schedule helps with planning and tracking consistency
          </li>
        </ul>
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

export default {
  name: 'Schedule',
  setup () {
    const toast = useToast()
    const router = useRouter()
    const { user } = authStore()

    const loading = ref(false)
    const selectedMonth = ref(new Date().getMonth() + 1)
    const selectedYear = ref(new Date().getFullYear())
    const selectedDay = ref(null)
    const showModal = ref(false)
    const showScheduleModal = ref(false)
    const updatingSchedule = ref(false)
    const savingSchedule = ref(false)
    
    const calendarData = ref([])
    const scheduleCalendarData = ref([])
    const scheduleForm = ref({
      defaultHours: 8,
      scheduledDays: new Set()
    })
    const summary = ref({
      totalDays: 0,
      scheduledWorkDays: 0,
      workedDays: 0,
      missedDays: 0,
      totalHours: 0,
      totalEarnings: 0,
      totalTips: 0,
      avgHoursPerDay: 0,
      attendanceRate: 0
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

    const monthStartDay = computed(() => {
      const firstDay = new Date(selectedYear.value, selectedMonth.value - 1, 1)
      let dayOfWeek = firstDay.getDay()
      // Convert Sunday (0) to be last day (6), shift Monday (1) to be first day (0)
      dayOfWeek = dayOfWeek === 0 ? 6 : dayOfWeek - 1
      return dayOfWeek
    })

    // Weekly breakdown calculation
    const weeklyBreakdown = computed(() => {
      if (!calendarData.value.length) return []
      
      const weeks = []
      const hourlyRate = user.value?.hourlyRate || 15 // Default rate if not set
      
      // Group days by week
      const daysInMonth = new Date(selectedYear.value, selectedMonth.value, 0).getDate()
      let currentWeek = []
      
      for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(selectedYear.value, selectedMonth.value - 1, day)
        const dayOfWeek = date.getDay() === 0 ? 6 : date.getDay() - 1 // Monday = 0
        
        const dayData = calendarData.value.find(d => d.day === day) || {
          day,
          worked: false,
          status: 'day-off',
          hours: 0,
          earnings: 0,
          tips: 0
        }
        
        currentWeek.push({ ...dayData, date })
        
        // End of week (Sunday) or last day of month
        if (dayOfWeek === 6 || day === daysInMonth) {
          const weekStart = currentWeek[0].date
          const weekEnd = currentWeek[currentWeek.length - 1].date
          
          const actualHours = currentWeek
            .filter(d => d.worked)
            .reduce((sum, d) => sum + (d.hours || 0), 0)
          
          const actualEarnings = currentWeek
            .filter(d => d.worked)
            .reduce((sum, d) => sum + (d.earnings || 0), 0)
          
          const scheduledHours = currentWeek
            .filter(d => d.status === 'scheduled')
            .reduce((sum, d) => sum + (d.hours || 0), 0)
          
          const estimatedEarnings = scheduledHours * hourlyRate
          const totalProjected = actualEarnings + estimatedEarnings
          
          weeks.push({
            dateRange: `${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`,
            actualHours,
            actualEarnings,
            scheduledHours,
            estimatedEarnings,
            totalProjected
          })
          
          currentWeek = []
        }
      }
      
      return weeks
    })

    // Monthly totals
    const monthlyTotals = computed(() => {
      return weeklyBreakdown.value.reduce((totals, week) => ({
        actualHours: totals.actualHours + week.actualHours,
        actualEarnings: totals.actualEarnings + week.actualEarnings,
        scheduledHours: totals.scheduledHours + week.scheduledHours,
        estimatedEarnings: totals.estimatedEarnings + week.estimatedEarnings,
        totalProjected: totals.totalProjected + week.totalProjected
      }), {
        actualHours: 0,
        actualEarnings: 0,
        scheduledHours: 0,
        estimatedEarnings: 0,
        totalProjected: 0
      })
    })

    const getMonthName = (monthNumber) => {
      return months.find(m => m.value === monthNumber)?.label || 'Unknown'
    }

    const getDayClass = (day) => {
      const classes = ['day-card']
      
      switch (day.status) {
        case 'worked':
          classes.push('worked')
          if (day.paymentStatus === 'paid') {
            classes.push('paid')
          }
          break
        case 'scheduled':
          classes.push('scheduled')
          break
        case 'missed':
          classes.push('missed')
          break
        case 'skipped':
          classes.push('skipped')
          break
        default:
          classes.push('day-off')
      }
      
      return classes.join(' ')
    }

    const getStatusBadgeClass = (status) => {
      switch (status) {
        case 'worked': return 'bg-success'
        case 'scheduled': return 'bg-primary'
        case 'missed': return 'bg-danger'
        case 'skipped': return 'bg-warning'
        default: return 'bg-secondary'
      }
    }

    const getStatusText = (status) => {
      switch (status) {
        case 'worked': return 'Worked'
        case 'scheduled': return 'Scheduled'
        case 'missed': return 'Missed'
        case 'skipped': return 'Skipped'
        default: return 'Day Off'
      }
    }

    const selectDay = (day) => {
      selectedDay.value = day
      showModal.value = true
    }

    const closeModal = () => {
      showModal.value = false
      selectedDay.value = null
    }

    const goToWorkPage = () => {
      closeModal()
      router.push('/work')
    }

    // Schedule management functions
    const openScheduleModal = () => {
      // Generate full month calendar data for schedule management
      const daysInMonth = new Date(selectedYear.value, selectedMonth.value, 0).getDate()
      const fullMonthData = []
      
      for (let day = 1; day <= daysInMonth; day++) {
        const existingDay = calendarData.value.find(d => d.day === day)
        if (existingDay) {
          fullMonthData.push({
            ...existingDay,
            tempScheduled: existingDay.status === 'scheduled'
          })
        } else {
          // Create day data for days not in calendarData
          const date = new Date(selectedYear.value, selectedMonth.value - 1, day)
          const dayOfWeek = date.getDay()
          fullMonthData.push({
            day,
            date: `${selectedYear.value}-${String(selectedMonth.value).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
            dayOfWeek,
            dayName: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][dayOfWeek],
            worked: false,
            status: 'day-off',
            hours: 0,
            earnings: 0,
            tips: 0,
            tempScheduled: false
          })
        }
      }
      
      scheduleCalendarData.value = fullMonthData
      scheduleForm.value.scheduledDays.clear()
      showScheduleModal.value = true
    }

    const closeScheduleModal = () => {
      showScheduleModal.value = false
      scheduleCalendarData.value = []
      scheduleForm.value.scheduledDays.clear()
    }

    const getScheduleDayClass = (day) => {
      const classes = ['schedule-day-card']
      
      if (day.worked) {
        classes.push('worked')
      } else if (day.tempScheduled || day.status === 'scheduled') {
        classes.push('scheduled')
      } else {
        classes.push('unscheduled')
      }
      
      return classes.join(' ')
    }

    const toggleDaySchedule = (day) => {
      if (day.worked) return // Can't modify worked days
      
      console.log('Toggling day schedule for day:', day.day, 'current state:', day.tempScheduled)
      
      const dayIndex = scheduleCalendarData.value.findIndex(d => d.day === day.day)
      if (dayIndex !== -1) {
        scheduleCalendarData.value[dayIndex].tempScheduled = !scheduleCalendarData.value[dayIndex].tempScheduled
        
        console.log('New state for day', day.day, ':', scheduleCalendarData.value[dayIndex].tempScheduled)
        
        if (scheduleCalendarData.value[dayIndex].tempScheduled) {
          scheduleForm.value.scheduledDays.add(day.day)
        } else {
          scheduleForm.value.scheduledDays.delete(day.day)
        }
        
        console.log('Scheduled days set size:', scheduleForm.value.scheduledDays.size)
      }
    }

    const selectWeekdays = () => {
      scheduleCalendarData.value.forEach((day, index) => {
        if (!day.worked) {
          const date = new Date(selectedYear.value, selectedMonth.value - 1, day.day)
          const dayOfWeek = date.getDay()
          
          // Monday = 1, Friday = 5
          if (dayOfWeek >= 1 && dayOfWeek <= 5) {
            scheduleCalendarData.value[index].tempScheduled = true
            scheduleForm.value.scheduledDays.add(day.day)
          }
        }
      })
    }

    const clearAllScheduled = () => {
      scheduleCalendarData.value.forEach((day, index) => {
        if (!day.worked) {
          scheduleCalendarData.value[index].tempScheduled = false
        }
      })
      scheduleForm.value.scheduledDays.clear()
    }

    const saveScheduleChanges = async () => {
      savingSchedule.value = true
      try {
        const scheduledDays = scheduleCalendarData.value
          .filter(day => day.tempScheduled && !day.worked)
          .map(day => ({
            date: `${selectedYear.value}-${String(selectedMonth.value).padStart(2, '0')}-${String(day.day).padStart(2, '0')}`,
            hours: scheduleForm.value.defaultHours
          }))

        console.log('Saving schedule changes:', {
          month: selectedMonth.value,
          year: selectedYear.value,
          scheduledDays: scheduledDays.length,
          defaultHours: scheduleForm.value.defaultHours,
          data: scheduledDays
        })

        await api.post('/work/schedule/bulk', {
          month: selectedMonth.value,
          year: selectedYear.value,
          scheduledDays,
          defaultHours: scheduleForm.value.defaultHours
        })

        toast.success('Schedule updated successfully')
        closeScheduleModal()
        await fetchCalendarData()
      } catch (error) {
        console.error('Error saving schedule:', error)
        toast.error('Failed to save schedule changes')
      } finally {
        savingSchedule.value = false
      }
    }

    const scheduleWorkDay = async () => {
      if (!selectedDay.value) return
      
      updatingSchedule.value = true
      try {
        const dateStr = `${selectedYear.value}-${String(selectedMonth.value).padStart(2, '0')}-${String(selectedDay.value.day).padStart(2, '0')}`
        
        await api.post('/work/schedule', {
          date: dateStr,
          hours: 8 // Default hours
        })

        toast.success('Day scheduled successfully')
        closeModal()
        await fetchCalendarData()
      } catch (error) {
        console.error('Error scheduling day:', error)
        toast.error('Failed to schedule work day')
      } finally {
        updatingSchedule.value = false
      }
    }

    const unscheduleWorkDay = async () => {
      if (!selectedDay.value) return
      
      console.log('Unscheduling day:', selectedDay.value)
      
      updatingSchedule.value = true
      try {
        const dateStr = `${selectedYear.value}-${String(selectedMonth.value).padStart(2, '0')}-${String(selectedDay.value.day).padStart(2, '0')}`
        console.log('DELETE request to:', `/work/schedule/${dateStr}`)
        
        const response = await api.delete(`/work/schedule/${dateStr}`)
        console.log('Unschedule response:', response)

        toast.success('Day removed from schedule')
        closeModal()
        await fetchCalendarData()
      } catch (error) {
        console.error('Error unscheduling day:', error)
        toast.error(error.response?.data?.message || 'Failed to remove from schedule')
      } finally {
        updatingSchedule.value = false
      }
    }

    const skipScheduledDay = async () => {
      if (!selectedDay.value) return
      
      console.log('Skipping scheduled day:', selectedDay.value)
      
      updatingSchedule.value = true
      try {
        const dateStr = `${selectedYear.value}-${String(selectedMonth.value).padStart(2, '0')}-${String(selectedDay.value.day).padStart(2, '0')}`
        console.log('POST request to skip day:', `/work/schedule/skip/${dateStr}`)
        
        const response = await api.post(`/work/schedule/skip/${dateStr}`)
        console.log('Skip response:', response)

        toast.success('Day marked as skipped')
        closeModal()
        await fetchCalendarData()
      } catch (error) {
        console.error('Error skipping day:', error)
        toast.error(error.response?.data?.message || 'Failed to skip day')
      } finally {
        updatingSchedule.value = false
      }
    }

    const unskipDay = async () => {
      if (!selectedDay.value) return
      
      console.log('Un-skipping day:', selectedDay.value)
      
      updatingSchedule.value = true
      try {
        const dateStr = `${selectedYear.value}-${String(selectedMonth.value).padStart(2, '0')}-${String(selectedDay.value.day).padStart(2, '0')}`
        console.log('DELETE request to unskip day:', `/work/schedule/skip/${dateStr}`)
        
        const response = await api.delete(`/work/schedule/skip/${dateStr}`)
        console.log('Unskip response:', response)

        toast.success('Day restored to schedule')
        closeModal()
        await fetchCalendarData()
      } catch (error) {
        console.error('Error un-skipping day:', error)
        toast.error(error.response?.data?.message || 'Failed to restore day')
      } finally {
        updatingSchedule.value = false
      }
    }

    const fetchCalendarData = async () => {
      loading.value = true
      try {
        const response = await api.get('/work/calendar/monthly', {
          params: {
            month: selectedMonth.value,
            year: selectedYear.value
          }
        })
        
        calendarData.value = response.data.days
        summary.value = response.data.summary
      } catch (error) {
        console.error('Error fetching calendar data:', error)
        toast.error('Failed to load calendar data')
      } finally {
        loading.value = false
      }
    }

    onMounted(() => {
      fetchCalendarData()
    })

    return {
      loading,
      selectedMonth,
      selectedYear,
      selectedDay,
      showModal,
      showScheduleModal,
      updatingSchedule,
      savingSchedule,
      calendarData,
      scheduleCalendarData,
      scheduleForm,
      summary,
      months,
      years,
      monthStartDay,
      weeklyBreakdown,
      monthlyTotals,
      getMonthName,
      getDayClass,
      getScheduleDayClass,
      getStatusBadgeClass,
      getStatusText,
      selectDay,
      closeModal,
      openScheduleModal,
      closeScheduleModal,
      toggleDaySchedule,
      selectWeekdays,
      clearAllScheduled,
      saveScheduleChanges,
      scheduleWorkDay,
      unscheduleWorkDay,
      skipScheduledDay,
      unskipDay,
      goToWorkPage,
      fetchCalendarData
    }
  }
}
</script>

<style scoped>
.calendar-grid {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.calendar-header {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 1px;
  background-color: #e9ecef;
  padding: 1px;
  border-radius: 6px 6px 0 0;
}

.day-header {
  background-color: #f8f9fa;
  padding: 12px 8px;
  text-align: center;
  font-weight: 600;
  font-size: 14px;
  color: #6c757d;
}

.calendar-days {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 1px;
  background-color: #e9ecef;
  padding: 1px;
  border-radius: 0 0 6px 6px;
}

.calendar-day {
  background-color: white;
  min-height: 100px;
  padding: 8px;
  display: flex;
  flex-direction: column;
  position: relative;
  cursor: pointer;
  transition: all 0.2s ease;
}

.calendar-day:hover {
  background-color: #f8f9fa;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
}

.calendar-day.empty {
  background-color: #f8f9fa;
  cursor: default;
}

.calendar-day.empty:hover {
  background-color: #f8f9fa;
  transform: none;
  box-shadow: none;
}

.day-number {
  font-weight: 600;
  font-size: 14px;
  color: #495057;
  margin-bottom: 4px;
}

.day-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  text-align: center;
}

/* Status-based styling */
.calendar-day.worked {
  background-color: #d4edda;
  border-left: 4px solid #28a745;
}

.calendar-day.worked:hover {
  background-color: #c3e6cb;
}

.calendar-day.worked.paid {
  background-color: #d1ecf1;
  border-left: 4px solid #17a2b8;
}

.calendar-day.worked.paid:hover {
  background-color: #bee5eb;
}

.calendar-day.scheduled {
  background-color: #e2e3f3;
  border-left: 4px solid #6f42c1;
}

.calendar-day.scheduled:hover {
  background-color: #d4d5e8;
}

.calendar-day.missed {
  background-color: #f8d7da;
  border-left: 4px solid #dc3545;
}

.calendar-day.missed:hover {
  background-color: #f5c6cb;
}

.calendar-day.skipped {
  background-color: #fff3cd;
  border-left: 4px solid #ffc107;
}

.calendar-day.skipped:hover {
  background-color: #ffeaa7;
}

.calendar-day.day-off {
  background-color: #f8f9fa;
  border-left: 4px solid #6c757d;
}

.calendar-day.day-off:hover {
  background-color: #e9ecef;
}

/* Work info styling */
.work-info {
  font-size: 12px;
  line-height: 1.2;
}

.hours {
  font-weight: 600;
  color: #28a745;
  margin-bottom: 2px;
}

.earnings {
  font-weight: 500;
  color: #495057;
  margin-bottom: 2px;
}

.tips {
  font-size: 11px;
  color: #fd7e14;
  font-weight: 500;
}

.scheduled-info {
  font-size: 12px;
  line-height: 1.2;
}

.scheduled-hours {
  font-weight: 600;
  color: #6f42c1;
  margin-bottom: 2px;
}

.scheduled-text {
  font-size: 11px;
  color: #6c757d;
  font-style: italic;
}

.missed-info {
  font-size: 12px;
}

.missed-text {
  color: #dc3545;
  font-weight: 500;
  font-size: 11px;
}

.skipped-info {
  font-size: 12px;
}

.skipped-text {
  color: #ffc107;
  font-weight: 500;
  font-size: 11px;
}

/* Legend styling */
.legend-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  display: inline-block;
}

.legend-dot.worked {
  background-color: #28a745;
}

.legend-dot.scheduled {
  background-color: #6f42c1;
}

.legend-dot.missed {
  background-color: #dc3545;
}

.legend-dot.skipped {
  background-color: #ffc107;
}

.legend-dot.day-off {
  background-color: #6c757d;
}

/* Responsive design */
@media (max-width: 768px) {
  .calendar-day {
    min-height: 70px;
    padding: 4px;
  }
  
  .day-number {
    font-size: 12px;
    margin-bottom: 2px;
  }
  
  .day-content {
    font-size: 10px;
  }
  
  .work-info, .scheduled-info, .missed-info {
    font-size: 9px;
    line-height: 1.1;
  }
  
  .hours, .scheduled-hours {
    font-size: 10px;
    margin-bottom: 1px;
  }
  
  .earnings {
    font-size: 9px;
    margin-bottom: 1px;
  }
  
  .tips {
    font-size: 8px;
  }
  
  .scheduled-text, .missed-text {
    font-size: 8px;
  }
  
  .day-header {
    padding: 8px 2px;
    font-size: 11px;
  }
  
  /* Mobile summary cards - stack vertically */
  .row.mb-4 .col-md-2 {
    margin-bottom: 0.5rem;
  }
  
  .card .h4 {
    font-size: 1.2rem;
  }
  
  /* Mobile modal adjustments */
  .modal-container {
    width: 95%;
    margin: 10px;
  }
  
  .modal-header {
    padding: 0.75rem 1rem;
  }
  
  .modal-title {
    font-size: 1rem;
  }
  
  .modal-body {
    padding: 1rem;
  }
  
  .modal-footer {
    padding: 0.75rem 1rem;
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .modal-footer .btn {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .calendar-day {
    min-height: 60px;
    padding: 3px;
  }
  
  .day-number {
    font-size: 11px;
    margin-bottom: 1px;
  }
  
  .work-info, .scheduled-info, .missed-info {
    font-size: 8px;
  }
  
  .hours, .scheduled-hours {
    font-size: 9px;
  }
  
  .earnings {
    font-size: 8px;
  }
  
  .tips {
    font-size: 7px;
  }
  
  .scheduled-text, .missed-text {
    font-size: 7px;
  }
  
  .day-header {
    padding: 6px 1px;
    font-size: 10px;
  }
  
  /* Very small screens - adjust header */
  .d-flex.justify-content-between.align-items-center {
    flex-direction: column;
    gap: 1rem;
  }
  
  .d-flex.gap-3 {
    width: 100%;
    justify-content: center;
  }
  
  .form-select {
    min-width: 120px;
  }
  
  /* Legend adjustments for mobile */
  .d-flex.justify-content-center.gap-4.flex-wrap {
    gap: 1rem !important;
  }
  
  .d-flex.align-items-center {
    font-size: 12px;
  }
  
  .legend-dot {
    width: 10px;
    height: 10px;
  }
}

/* Summary cards */
.card .h4 {
  font-size: 1.5rem;
  font-weight: 600;
}

.text-success {
  color: #28a745 !important;
}

.text-warning {
  color: #ffc107 !important;
}

/* Modal enhancements */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1050;
}

.modal-container {
  background-color: white;
  border-radius: 8px;
  max-width: 600px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
}

.modal-header {
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #dee2e6;
  display: flex;
  justify-content: between;
  align-items: center;
}

.modal-title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 500;
  flex: 1;
}

.btn-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0;
  margin-left: auto;
  color: #6c757d;
}

.btn-close:hover {
  color: #000;
}

.modal-body {
  padding: 1.5rem;
}

.modal-footer {
  padding: 1rem 1.5rem;
  border-top: 1px solid #dee2e6;
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
}

.badge {
  font-size: 0.875em;
}

/* Schedule Management Modal */
.large-modal {
  max-width: 900px;
  width: 95%;
}

.schedule-grid {
  display: flex;
  flex-direction: column;
  gap: 0;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  overflow: hidden;
}

.schedule-header {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 1px;
  background-color: #e9ecef;
  padding: 1px;
}

.schedule-days {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 1px;
  background-color: #e9ecef;
  padding: 1px;
}

.schedule-day {
  background-color: white;
  min-height: 80px;
  padding: 8px;
  display: flex;
  flex-direction: column;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 2px solid transparent;
}

.schedule-day:hover {
  background-color: #f8f9fa;
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.schedule-day.empty {
  background-color: #f8f9fa;
  cursor: default;
}

.schedule-day.empty:hover {
  background-color: #f8f9fa;
  transform: none;
  box-shadow: none;
}

.schedule-day.worked {
  background-color: #d4edda;
  border-color: #28a745;
  cursor: not-allowed;
}

.schedule-day.worked:hover {
  background-color: #d4edda;
  transform: none;
}

.schedule-day.scheduled {
  background-color: #e2e3f3;
  border-color: #6f42c1;
}

.schedule-day.scheduled:hover {
  background-color: #d4d5e8;
}

.schedule-day.unscheduled {
  background-color: #fff;
  border-color: #dee2e6;
}

.schedule-day.unscheduled:hover {
  background-color: #f8f9fa;
  border-color: #6f42c1;
}

.day-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
}

.worked-indicator,
.scheduled-indicator,
.unscheduled-indicator {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.worked-indicator i {
  font-size: 1.2rem;
}

.scheduled-indicator i {
  font-size: 1.1rem;
}

.unscheduled-indicator i {
  font-size: 1rem;
}

.worked-indicator small,
.scheduled-indicator small,
.unscheduled-indicator small {
  font-size: 10px;
  font-weight: 500;
}

/* Responsive adjustments for schedule modal */
@media (max-width: 768px) {
  .large-modal {
    width: 98%;
    margin: 5px;
  }
  
  .schedule-day {
    min-height: 60px;
    padding: 4px;
  }
  
  .worked-indicator i,
  .scheduled-indicator i,
  .unscheduled-indicator i {
    font-size: 0.9rem;
  }
  
  .worked-indicator small,
  .scheduled-indicator small,
  .unscheduled-indicator small {
    font-size: 8px;
  }
  
  .day-number {
    font-size: 12px;
  }
}
</style>
