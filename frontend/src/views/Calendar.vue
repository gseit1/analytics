<template>
  <div class="calendar-page">
    <!-- Header Section -->
    <div class="calendar-header mb-4">
      <div class="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3">
        <div class="header-content">
          <h1 class="h3 mb-1">
            <i class="bi bi-calendar3 me-2 text-primary"></i>Calendar & Schedule
          </h1>
          <p class="text-muted mb-0">Organize your todos, meetings, reminders, and work schedule</p>
        </div>
        <div class="header-actions d-flex gap-2">
          <!-- View Selector -->
          <div class="btn-group" role="group">
            <button 
              type="button" 
              class="btn btn-outline-primary"
              :class="{ active: currentView === 'day' }"
              @click="setView('day')"
            >
              <i class="bi bi-calendar-day me-1"></i>Day
            </button>
            <button 
              type="button" 
              class="btn btn-outline-primary"
              :class="{ active: currentView === 'week' }"
              @click="setView('week')"
            >
              <i class="bi bi-calendar-week me-1"></i>Week
            </button>
            <button 
              type="button" 
              class="btn btn-outline-primary"
              :class="{ active: currentView === 'month' }"
              @click="setView('month')"
            >
              <i class="bi bi-calendar3 me-1"></i>Month
            </button>
          </div>
          
          <!-- Navigation Controls -->
          <div class="d-flex gap-2 align-items-center">
            <button class="btn btn-outline-secondary" @click="navigatePrevious">
              <i class="bi bi-chevron-left"></i>
            </button>
            <div class="date-display fw-medium text-nowrap">
              {{ currentDateDisplay }}
            </div>
            <button class="btn btn-outline-secondary" @click="navigateNext">
              <i class="bi bi-chevron-right"></i>
            </button>
            <button class="btn btn-outline-info" @click="goToToday">
              <i class="bi bi-house me-1"></i>Today
            </button>
          </div>
          
          <button class="btn btn-primary" @click="showAddEventModal">
            <i class="bi bi-plus-circle me-2"></i>Add Event
          </button>
        </div>
      </div>
    </div>

    <!-- Calendar Statistics -->
    <div class="stats-section mb-4">
      <div class="row g-3">
        <div class="col-md-3">
          <div class="stat-card">
            <div class="stat-icon bg-primary-subtle">
              <i class="bi bi-calendar-event text-primary"></i>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ calendarStats.total_events }}</div>
              <div class="stat-label">Total Events</div>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="stat-card">
            <div class="stat-icon bg-success-subtle">
              <i class="bi bi-check-circle text-success"></i>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ calendarStats.completed_todos }}</div>
              <div class="stat-label">Completed Todos</div>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="stat-card">
            <div class="stat-icon bg-warning-subtle">
              <i class="bi bi-clock text-warning"></i>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ calendarStats.upcoming_deadlines }}</div>
              <div class="stat-label">Upcoming Deadlines</div>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="stat-card">
            <div class="stat-icon bg-info-subtle">
              <i class="bi bi-people text-info"></i>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ meetingCount }}</div>
              <div class="stat-label">Meetings</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Calendar Grid -->
    <div class="calendar-container">
      <!-- Monthly View -->
      <div v-if="currentView === 'month'" class="calendar-grid">
        <!-- Calendar Header -->
        <div class="calendar-header-row">
          <div class="day-header">Mon</div>
          <div class="day-header">Tue</div>
          <div class="day-header">Wed</div>
          <div class="day-header">Thu</div>
          <div class="day-header">Fri</div>
          <div class="day-header">Sat</div>
          <div class="day-header">Sun</div>
        </div>

        <!-- Calendar Days -->
        <div class="calendar-days">
          <div 
            v-for="day in calendarDays"
            :key="day?.date"
            class="calendar-day"
            :class="{
              'other-month': day && !day.currentMonth,
              'today': day && day.isToday,
              'has-events': day && Array.isArray(day.events) && day.events.length > 0,
              'work-day': day && Array.isArray(day.events) && day.events.some(ev => ev.event_type === 'work'),
              'scheduled-work-day': day && isScheduledWorkDay(day.date)
            }"
            @click="openDayModal(day)"
          >
            <div class="day-number">{{ day?.day }}</div>
            <!-- Scheduled work day indicator -->
            <div v-if="day && isScheduledWorkDay(day.date)" class="scheduled-work-indicator mb-1">
              <i class="bi bi-calendar-check me-1"></i>
              <span class="scheduled-work-label">{{ getScheduledWorkHours(day.date) }}h scheduled</span>
            </div>
            <!-- Work day indicator -->
            <div v-if="day && Array.isArray(day.events) && day.events.some(ev => ev.event_type === 'work')" class="work-day-indicator mb-1">
              <i class="bi bi-briefcase me-1"></i>
              <span class="work-day-label">Work Day</span>
            </div>
            <!-- Work hours label -->
            <div v-if="day && Array.isArray(day.events) && getWorkHours(day.events)" class="work-hours-label mb-1">
              <i class="bi bi-briefcase me-1"></i>
              {{ day && Array.isArray(day.events) ? getWorkHours(day.events) : '' }}h work
            </div>
            <!-- Study hours per course -->
            <div v-for="(hours, course) in (day && Array.isArray(day.events) ? getStudyHoursByCourse(day.events) : {})" :key="course" class="study-hours-label mb-1">
              <i class="bi bi-book me-1"></i>
              {{ course }}: {{ hours }}h study
            </div>
            <!-- Exam label -->
            <div v-if="day && Array.isArray(day.events) && day.events.some(ev => ev.event_type === 'exam')" class="exam-label mb-1">
              <i class="bi bi-award text-danger"></i> Exam
            </div>
            <div class="day-events">
              <!-- Show event titles instead of just dots -->
              <div 
                v-for="event in (day && Array.isArray(day.events) ? day.events.slice(0, 2) : [])"
                :key="event.id"
                class="event-item-compact"
                :class="`event-${event.event_type}`"
                :title="`${event.title} - ${event.event_type}${event.start_time ? ' at ' + formatTime(event.start_time) : ''}`"
              >
                <div class="event-dot" :style="{ backgroundColor: event.color }"></div>
                <div class="event-text">{{ event.title }}</div>
              </div>
              <div v-if="day && Array.isArray(day.events) && day.events.length > 2" class="more-events">
                +{{ (day && Array.isArray(day.events)) ? day.events.length - 2 : 0 }} more
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Weekly View -->
      <div v-if="currentView === 'week'" class="week-view">
        <!-- Week Header -->
        <div class="week-header">
          <div class="time-column"></div>
          <div 
            v-for="day in weekDays" 
            :key="day.date"
            class="week-day-header"
            :class="{ 'today': day.isToday }"
          >
            <div class="day-name">{{ day.dayName }}</div>
            <div class="day-number">{{ day.day }}</div>
            <div class="day-date">{{ day.monthDay }}</div>
          </div>
        </div>

        <!-- Week Grid -->
        <div class="week-grid">
          <!-- Time slots -->
          <div class="time-column">
            <div 
              v-for="hour in timeSlots" 
              :key="hour"
              class="time-slot"
            >
              {{ formatHour(hour) }}
            </div>
          </div>

          <!-- Days columns -->
          <div 
            v-for="day in weekDays" 
            :key="day.date"
            class="week-day-column"
            @click="addEventForDay(day.date)"
          >
            <div 
              v-for="hour in timeSlots" 
              :key="`${day.date}-${hour}`"
              class="week-time-slot"
              :class="{ 'current-hour': day.isToday && hour === currentHour }"
            >
              <!-- Events for this time slot -->
              <div 
                v-for="event in getEventsForTimeSlot(day.events, hour)"
                :key="event.id"
                class="week-event"
                :class="`event-${event.event_type}`"
                :style="{ backgroundColor: event.color }"
                @click.stop="editEvent(event)"
              >
                <div class="event-title">{{ event.title }}</div>
                <div class="event-time">{{ formatTime(event.start_time) }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Daily View -->
      <div v-if="currentView === 'day'" class="day-view">
        <div class="day-view-header">
          <h4>{{ currentDateDisplay }}</h4>
          <div class="day-summary">
            <span class="badge bg-primary me-2">{{ selectedDayEvents.length }} events</span>
            <span v-if="getWorkHours(selectedDayEvents)" class="badge bg-info me-2">
              {{ getWorkHours(selectedDayEvents) }}h work
            </span>
          </div>
        </div>

        <div class="day-view-content">
          <!-- Time grid for daily view -->
          <div class="day-time-grid">
            <div 
              v-for="hour in timeSlots" 
              :key="hour"
              class="day-time-slot"
              :class="{ 'current-hour': isToday(currentDate) && hour === currentHour }"
              @click="addEventAtTime(hour)"
            >
              <div class="time-label">{{ formatHour(hour) }}</div>
              <div class="time-content">
                <!-- Events for this hour -->
                <div 
                  v-for="event in getEventsForTimeSlot(selectedDayEvents, hour)"
                  :key="event.id"
                  class="day-event"
                  :class="`event-${event.event_type}`"
                  :style="{ backgroundColor: event.color }"
                  @click.stop="editEvent(event)"
                >
                  <div class="event-header">
                    <span class="event-title">{{ event.title }}</span>
                    <span class="event-time">
                      {{ formatTime(event.start_time) }}
                      <span v-if="event.end_time"> - {{ formatTime(event.end_time) }}</span>
                    </span>
                  </div>
                  <div v-if="event.description" class="event-description">
                    {{ event.description }}
                  </div>
                  <div v-if="event.location" class="event-location">
                    <i class="bi bi-geo-alt me-1"></i>{{ event.location }}
                  </div>
                </div>
                
                <!-- All day events -->
                <template v-if="hour === 0">
                  <div 
                    v-for="event in getAllDayEvents(selectedDayEvents)"
                    :key="`allday-${event.id}`"
                    class="day-event all-day-event"
                    :class="`event-${event.event_type}`"
                    :style="{ backgroundColor: event.color }"
                    @click.stop="editEvent(event)"
                  >
                    <div class="event-header">
                      <span class="event-title">{{ event.title }}</span>
                      <span class="badge bg-light text-dark ms-2">All Day</span>
                    </div>
                    <div v-if="event.description" class="event-description">
                      {{ event.description }}
                    </div>
                  </div>
                </template>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Today's Events Sidebar -->
    <div class="today-events mt-4">
      <div class="card">
        <div class="card-header bg-primary text-white">
          <h5 class="mb-0">
            <i class="bi bi-calendar-day me-2"></i>Today's Schedule
          </h5>
        </div>
        <div class="card-body">
          <div v-if="todayEvents.length === 0" class="text-center py-3 text-muted">
            <i class="bi bi-calendar-x fs-1"></i>
            <p class="mt-2">No events scheduled for today</p>
          </div>
          <div v-else class="event-list">
            <div 
              v-for="event in todayEvents" 
              :key="event.id"
              class="event-item"
              :class="`event-${event.status}`"
            >
              <div class="event-indicator" :style="{ backgroundColor: event.color }"></div>
              <div class="event-content">
                <div class="event-title">
                  <span class="event-type-icon">
                    <i :class="getEventIcon(event.event_type)"></i>
                  </span>
                  {{ event.title }}
                  <span v-if="event.priority === 'high' || event.priority === 'urgent'" 
                        class="badge bg-danger ms-2">{{ event.priority }}</span>
                </div>
                <div v-if="event.start_time" class="event-time">
                  <i class="bi bi-clock me-1"></i>
                  {{ formatTime(event.start_time) }}
                  <span v-if="event.end_time"> - {{ formatTime(event.end_time) }}</span>
                </div>
                <div v-if="event.description" class="event-description">
                  {{ event.description }}
                </div>
                <div class="event-actions">
                  <button 
                    v-if="event.event_type === 'todo' && event.status !== 'completed'"
                    class="btn btn-sm btn-success"
                    @click="markAsCompleted(event)"
                  >
                    <i class="bi bi-check"></i> Complete
                  </button>
                  <button class="btn btn-sm btn-outline-primary" @click="editEvent(event)">
                    <i class="bi bi-pencil"></i> Edit
                  </button>
                  <button class="btn btn-sm btn-outline-danger" @click="deleteEvent(event)">
                    <i class="bi bi-trash"></i> Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Add/Edit Event Modal -->
    <div class="modal fade" id="eventModal" tabindex="-1">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              <i :class="`bi ${editingEvent ? 'bi-pencil-square' : 'bi-plus-circle'} me-2`"></i>
              {{ editingEvent ? 'Edit Event' : 'Add New Event' }}
            </h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="saveEvent">
              <div class="row g-3">
                <!-- Event Type -->
                <div class="col-md-6">
                  <label class="form-label fw-medium">
                    <i class="bi bi-tag me-1"></i>Event Type
                  </label>
                  <select class="form-select" v-model="eventForm.event_type" required>
                    <option value="todo">Todo</option>
                    <option value="meeting">Meeting</option>
                    <option value="reminder">Reminder</option>
                    <option value="work">Work</option>
                    <option value="study">Study</option>
                    <option value="exam">Exam</option>
                    <option value="personal">Personal</option>
                    <option value="appointment">Appointment</option>
                  </select>
                </div>

                <!-- Priority -->
                <div class="col-md-6">
                  <label class="form-label fw-medium">
                    <i class="bi bi-flag me-1"></i>Priority
                  </label>
                  <select class="form-select" v-model="eventForm.priority">
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>

                <!-- Course field for Study/Exam events -->
                <div v-if="eventForm.event_type === 'study' || eventForm.event_type === 'exam'" class="col-12">
                  <label class="form-label fw-medium">
                    <i class="bi bi-book me-1"></i>Course
                  </label>
                  <input type="text" class="form-control" v-model="eventForm.course" required>
                </div>

                <!-- Title -->
                <div class="col-12">
                  <label class="form-label fw-medium">
                    <i class="bi bi-card-text me-1"></i>Title
                  </label>
                  <input type="text" class="form-control" v-model="eventForm.title" required>
                </div>

                <!-- Description -->
                <div class="col-12">
                  <label class="form-label fw-medium">
                    <i class="bi bi-chat-left-text me-1"></i>Description
                  </label>
                  <textarea class="form-control" v-model="eventForm.description" rows="3"></textarea>
                </div>

                <!-- Date -->
                <div class="col-md-6">
                  <label class="form-label fw-medium">
                    <i class="bi bi-calendar3 me-1"></i>Date
                  </label>
                  <input type="date" class="form-control" v-model="eventForm.start_date" required>
                </div>

                <!-- All Day Toggle -->
                <div class="col-md-6">
                  <label class="form-label fw-medium">
                    <i class="bi bi-clock me-1"></i>Time Settings
                  </label>
                  <div class="form-check">
                    <input 
                      class="form-check-input" 
                      type="checkbox" 
                      v-model="eventForm.is_all_day"
                      id="allDayCheck"
                    >
                    <label class="form-check-label" for="allDayCheck">
                      All Day Event
                    </label>
                  </div>
                </div>

                <!-- Time Fields -->
                <div v-if="!eventForm.is_all_day" class="col-md-6">
                  <label class="form-label fw-medium">Start Time</label>
                  <select class="form-select" v-model="eventForm.start_time">
                    <option value="">Select Time</option>
                    <option v-for="option in timeOptions" :key="option.value" :value="option.value">
                      {{ option.label }}
                    </option>
                  </select>
                </div>

                <div v-if="!eventForm.is_all_day" class="col-md-6">
                  <label class="form-label fw-medium">End Time</label>
                  <select class="form-select" v-model="eventForm.end_time">
                    <option value="">Select Time</option>
                    <option v-for="option in timeOptions" :key="option.value" :value="option.value">
                      {{ option.label }}
                    </option>
                  </select>
                </div>

                <!-- Location -->
                <div class="col-md-6">
                  <label class="form-label fw-medium">
                    <i class="bi bi-geo-alt me-1"></i>Location
                  </label>
                  <input type="text" class="form-control" v-model="eventForm.location">
                </div>

                <!-- Color -->
                <div class="col-md-6">
                  <label class="form-label fw-medium">
                    <i class="bi bi-palette me-1"></i>Color
                  </label>
                  <input type="color" class="form-control form-control-color" v-model="eventForm.color">
                </div>

                <!-- Reminder -->
                <div class="col-md-6">
                  <label class="form-label fw-medium">
                    <i class="bi bi-bell me-1"></i>Reminder
                  </label>
                  <select class="form-select" v-model="eventForm.reminder_minutes">
                    <option value="">No reminder</option>
                    <option value="15">15 minutes before</option>
                    <option value="30">30 minutes before</option>
                    <option value="60">1 hour before</option>
                    <option value="1440">1 day before</option>
                  </select>
                </div>

                <!-- Status -->
                <div class="col-md-6">
                  <label class="form-label fw-medium">
                    <i class="bi bi-check-circle me-1"></i>Status
                  </label>
                  <select class="form-select" v-model="eventForm.status">
                    <option value="pending">Pending</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">
              Cancel
            </button>
            <button type="button" class="btn btn-primary" :disabled="savingEvent" @click="saveEvent">
              <span v-if="savingEvent" class="spinner-border spinner-border-sm me-2"></span>
              {{ editingEvent ? 'Update Event' : 'Create Event' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Day Detail Modal -->
    <div class="modal fade" id="dayModal" tabindex="-1">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              <i class="bi bi-calendar-day me-2"></i>
              {{ selectedDay ? formatDate(selectedDay.date) : '' }}
            </h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <div v-if="selectedDay && Array.isArray(selectedDay.events) && selectedDay.events.length === 0" class="text-center py-4">
              <i class="bi bi-calendar-x fs-1 text-muted"></i>
              <p class="mt-2 text-muted">No events scheduled for this day</p>
              <button class="btn btn-primary" @click="addEventForDay(selectedDay?.date)">
                <i class="bi bi-plus-circle me-2"></i>Add Event
              </button>
            </div>
            <div v-else-if="selectedDay && Array.isArray(selectedDay.events) && selectedDay.events.length > 0" class="event-list">
              <div 
                v-for="event in selectedDay.events" 
                :key="event.id"
                class="event-item mb-3"
              >
                <div class="event-indicator" :style="{ backgroundColor: event.color }"></div>
                <div class="event-content">
                  <div class="event-title">
                    <span class="event-type-icon me-2">
                      <i :class="getEventIcon(event.event_type)"></i>
                    </span>
                    {{ event.title }}
                    <span v-if="event.priority === 'high' || event.priority === 'urgent'" 
                          class="badge bg-danger ms-2">{{ event.priority }}</span>
                  </div>
                  <div v-if="event.start_time" class="event-time">
                    <i class="bi bi-clock me-1"></i>
                    {{ formatTime(event.start_time) }}
                    <span v-if="event.end_time"> - {{ formatTime(event.end_time) }}</span>
                  </div>
                  <div v-if="event.description" class="event-description">
                    {{ event.description }}
                  </div>
                  <div v-if="event.location" class="event-location">
                    <i class="bi bi-geo-alt me-1"></i>{{ event.location }}
                  </div>
                  <div class="event-actions mt-2">
                    <button 
                      v-if="event.event_type === 'todo' && event.status !== 'completed'"
                      class="btn btn-sm btn-success me-2"
                      @click="markAsCompleted(event)"
                    >
                      <i class="bi bi-check"></i> Complete
                    </button>
                    <button class="btn btn-sm btn-outline-primary me-2" @click="editEvent(event)">
                      <i class="bi bi-pencil"></i> Edit
                    </button>
                    <button class="btn btn-sm btn-outline-danger" @click="deleteEvent(event)">
                      <i class="bi bi-trash"></i> Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">
              Close
            </button>
            <button type="button" class="btn btn-primary" @click="addEventForDay(selectedDay?.date)">
              <i class="bi bi-plus-circle me-2"></i>Add Event
            </button>
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
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isSameDay, 
  isToday, 
  getDay,
  startOfWeek,
  endOfWeek,
  addDays,
  addWeeks,
  addMonths,
  subDays,
  subWeeks,
  subMonths,
  startOfDay,
  parseISO
} from 'date-fns'

export default {
  name: 'Calendar',
  setup () {
    const toast = useToast()

    const loading = ref(false)
    const events = ref([])
    const scheduledWorkDays = ref([]) // Add scheduled work days
    const currentView = ref('month')
    const currentDate = ref(new Date())
    const calendarStats = ref({
      total_events: 0,
      completed_todos: 0,
      upcoming_deadlines: 0
    })
    const editingEvent = ref(null)
    const savingEvent = ref(false)
    const selectedDay = ref(null)

    const eventForm = ref({
      title: '',
      description: '',
      event_type: 'todo',
      start_date: format(new Date(), 'yyyy-MM-dd'),
      end_date: '',
      start_time: '',
      end_time: '',
      is_all_day: false,
      priority: 'medium',
      status: 'pending',
      reminder_minutes: '',
      location: '',
      color: '#3B82F6',
      course: '' // For study/exam events
    })

    // Generate time options
    const timeOptions = computed(() => {
      const options = []
      
      for (let hour = 0; hour < 24; hour++) {
        const hourStr = hour.toString().padStart(2, '0')
        const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour
        const ampm = hour < 12 ? 'AM' : 'PM'
        const displayHour = hour12 === 0 ? 12 : hour12
        
        options.push({
          value: `${hourStr}:00`,
          label: `${displayHour}:00 ${ampm}`
        })
        
        options.push({
          value: `${hourStr}:30`,
          label: `${displayHour}:30 ${ampm}`
        })
      }
      
      return options
    })

    // Time slots for week/day view (0-23 hours)
    const timeSlots = computed(() => {
      return Array.from({ length: 24 }, (_, i) => i)
    })

    // Current hour for highlighting
    const currentHour = computed(() => {
      return new Date().getHours()
    })

    // Current date display based on view
    const currentDateDisplay = computed(() => {
      switch (currentView.value) {
        case 'day': {
          return format(currentDate.value, 'EEEE, MMMM do, yyyy')
        }
        case 'week': {
          const weekStart = startOfWeek(currentDate.value, { weekStartsOn: 1 })
          const weekEnd = endOfWeek(currentDate.value, { weekStartsOn: 1 })
          return `${format(weekStart, 'MMM d')} - ${format(weekEnd, 'MMM d, yyyy')}`
        }
        case 'month':
        default: {
          return format(currentDate.value, 'MMMM yyyy')
        }
      }
    })

    // Week days for weekly view
    const weekDays = computed(() => {
      const start = startOfWeek(currentDate.value, { weekStartsOn: 1 }) // Start on Monday
      const days = []
      
      for (let i = 0; i < 7; i++) {
        const day = addDays(start, i)
        const dayEvents = events.value.filter(event => {
          let eventDate
          if (typeof event.start_date === 'string') {
            if (event.start_date.includes('T')) {
              eventDate = format(new Date(event.start_date), 'yyyy-MM-dd')
            } else {
              eventDate = event.start_date
            }
          } else {
            eventDate = format(new Date(event.start_date), 'yyyy-MM-dd')
          }
          return eventDate === format(day, 'yyyy-MM-dd')
        })
        
        days.push({
          date: format(day, 'yyyy-MM-dd'),
          day: day.getDate(),
          dayName: format(day, 'EEE'),
          monthDay: format(day, 'MMM d'),
          isToday: isToday(day),
          events: dayEvents
        })
      }
      
      return days
    })

    // Selected day events for daily view
    const selectedDayEvents = computed(() => {
      const dateStr = format(currentDate.value, 'yyyy-MM-dd')
      return events.value.filter(event => {
        let eventDate
        if (typeof event.start_date === 'string') {
          if (event.start_date.includes('T')) {
            eventDate = format(new Date(event.start_date), 'yyyy-MM-dd')
          } else {
            eventDate = event.start_date
          }
        } else {
          eventDate = format(new Date(event.start_date), 'yyyy-MM-dd')
        }
        return eventDate === dateStr
      }).sort((a, b) => {
        if (!a.start_time && !b.start_time) return 0
        if (!a.start_time) return 1
        if (!b.start_time) return -1
        return a.start_time.localeCompare(b.start_time)
      })
    })

    const todayEvents = computed(() => {
      const today = format(new Date(), 'yyyy-MM-dd')
      console.log('=== DEBUG Today Events ===')
      console.log('Today date:', today)
      
      const filtered = events.value.filter(event => {
        let eventDate
        if (typeof event.start_date === 'string') {
          // Handle ISO date strings like "2025-07-31T21:00:00.000Z"
          if (event.start_date.includes('T')) {
            eventDate = format(new Date(event.start_date), 'yyyy-MM-dd')
          } else {
            eventDate = event.start_date
          }
        } else if (event.start_date instanceof Date) {
          eventDate = format(event.start_date, 'yyyy-MM-dd')
        } else {
          eventDate = format(new Date(event.start_date), 'yyyy-MM-dd')
        }
        
        const matches = eventDate === today
        console.log('Event check:', {
          title: event.title,
          raw_start_date: event.start_date,
          formatted_date: eventDate,
          today,
          matches
        })
        
        return matches
      }).sort((a, b) => {
        if (!a.start_time && !b.start_time) return 0
        if (!a.start_time) return 1
        if (!b.start_time) return -1
        return a.start_time.localeCompare(b.start_time)
      })
      
      console.log('Filtered today events:', filtered)
      return filtered
    })

    const meetingCount = computed(() => {
      return events.value.filter(event => event.event_type === 'meeting').length
    })

    const calendarDays = computed(() => {
      const start = startOfMonth(currentDate.value)
      const end = endOfMonth(currentDate.value)
      
      // Get all days in month
      const daysInMonth = eachDayOfInterval({ start, end })
      
      // Add days from previous month to fill the grid (Monday start)
      const startDay = (getDay(start) + 6) % 7 // Convert Sunday=0 to Monday=0
      const prevMonthDays = []
      for (let i = startDay - 1; i >= 0; i--) {
        const day = new Date(start)
        day.setDate(day.getDate() - (i + 1))
        prevMonthDays.push(day)
      }
      
      // Add days from next month to fill the grid
      const endDay = (getDay(end) + 6) % 7 // Convert Sunday=0 to Monday=0
      const nextMonthDays = []
      for (let i = 1; i <= (6 - endDay); i++) {
        const day = new Date(end)
        day.setDate(day.getDate() + i)
        nextMonthDays.push(day)
      }
      
      const allDays = [...prevMonthDays, ...daysInMonth, ...nextMonthDays]
      
      return allDays.map(day => {
        const dateStr = format(day, 'yyyy-MM-dd')
        const dayEvents = events.value.filter(event => {
          // Handle both string dates and Date objects from the database
          let eventDate
          if (typeof event.start_date === 'string') {
            // Handle ISO date strings like "2025-07-31T21:00:00.000Z"
            if (event.start_date.includes('T')) {
              eventDate = format(new Date(event.start_date), 'yyyy-MM-dd')
            } else {
              eventDate = event.start_date
            }
          } else if (event.start_date instanceof Date) {
            // If it's a Date object, format it
            eventDate = format(event.start_date, 'yyyy-MM-dd')
          } else {
            // If it's something else (like a timestamp), convert to Date first
            eventDate = format(new Date(event.start_date), 'yyyy-MM-dd')
          }
          
          const matches = eventDate === dateStr
          
          // Debug for first few days and when we have events
          if (day.getDate() === 1 || matches) {
            console.log(`Day ${day.getDate()} (${dateStr}):`, {
              event_title: event.title,
              raw_start_date: event.start_date,
              formatted_event_date: eventDate,
              day_date: dateStr,
              matches
            })
          }
          
          return matches
        })
        
        return {
          date: dateStr,
          day: day.getDate(),
          currentMonth: day.getMonth() === currentDate.value.getMonth(),
          isToday: isToday(day),
          events: dayEvents
        }
      })
    })

    const fetchCalendarData = async () => {
      loading.value = true
      try {
        let params = {}
        
        // Adjust params based on current view
        switch (currentView.value) {
          case 'day': {
            params = {
              date: format(currentDate.value, 'yyyy-MM-dd')
            }
            break
          }
          case 'week': {
            const weekStart = startOfWeek(currentDate.value, { weekStartsOn: 1 })
            const weekEnd = endOfWeek(currentDate.value, { weekStartsOn: 1 })
            params = {
              start_date: format(weekStart, 'yyyy-MM-dd'),
              end_date: format(weekEnd, 'yyyy-MM-dd')
            }
            break
          }
          case 'month':
          default: {
            params = {
              month: currentDate.value.getMonth() + 1,
              year: currentDate.value.getFullYear()
            }
            break
          }
        }
        
        const [eventsResponse, statsResponse, workScheduleResponse] = await Promise.all([
          api.get('/calendar/events', { params }),
          api.get('/calendar/stats', { params }),
          api.get('/work/calendar/monthly', { 
            params: {
              month: currentDate.value.getMonth() + 1,
              year: currentDate.value.getFullYear()
            }
          })
        ])
        
        events.value = eventsResponse.data.events
        calendarStats.value = statsResponse.data.summary
        scheduledWorkDays.value = workScheduleResponse.data || [] // The API returns an array directly
        
        // Debug each event individually to see the date format
        events.value.forEach((event, index) => {
          console.log(`Event ${index}:`, {
            id: event.id,
            title: event.title,
            start_date: event.start_date,
            start_date_type: typeof event.start_date,
            formatted_if_date: event.start_date instanceof Date ? format(event.start_date, 'yyyy-MM-dd') : 'not a date',
            event_type: event.event_type,
            course: event.course
          })
        })
      } catch (error) {
        console.error('Error fetching calendar data:', error)
        toast.error('Failed to load calendar data')
      } finally {
        loading.value = false
      }
    }

    // View management
    const setView = (view) => {
      currentView.value = view
      fetchCalendarData()
    }

    // Navigation
    const navigatePrevious = () => {
      switch (currentView.value) {
        case 'day': {
          currentDate.value = subDays(currentDate.value, 1)
          break
        }
        case 'week': {
          currentDate.value = subWeeks(currentDate.value, 1)
          break
        }
        case 'month': {
          currentDate.value = subMonths(currentDate.value, 1)
          break
        }
      }
      fetchCalendarData()
    }

    const navigateNext = () => {
      switch (currentView.value) {
        case 'day': {
          currentDate.value = addDays(currentDate.value, 1)
          break
        }
        case 'week': {
          currentDate.value = addWeeks(currentDate.value, 1)
          break
        }
        case 'month': {
          currentDate.value = addMonths(currentDate.value, 1)
          break
        }
      }
      fetchCalendarData()
    }

    const goToToday = () => {
      currentDate.value = new Date()
      fetchCalendarData()
    }

    // Helper functions for week and day views
    const formatHour = (hour) => {
      const ampm = hour >= 12 ? 'PM' : 'AM'
      const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour
      return `${displayHour} ${ampm}`
    }

    const getEventsForTimeSlot = (dayEvents, hour) => {
      if (!Array.isArray(dayEvents)) return []
      
      return dayEvents.filter(event => {
        if (!event.start_time || event.is_all_day) return false
        
        const eventHour = parseInt(event.start_time.split(':')[0])
        return eventHour === hour
      })
    }

    const getAllDayEvents = (dayEvents) => {
      if (!Array.isArray(dayEvents)) return []
      return dayEvents.filter(event => event.is_all_day || !event.start_time)
    }

    const addEventAtTime = (hour) => {
      editingEvent.value = null
      resetEventForm()
      eventForm.value.start_date = format(currentDate.value, 'yyyy-MM-dd')
      eventForm.value.start_time = `${hour.toString().padStart(2, '0')}:00`
      eventForm.value.is_all_day = false
      
      const modalEl = document.getElementById('eventModal')
      if (modalEl) {
        const modal = new window.Modal(modalEl)
        modal.show()
      }
    }

    const formatDate = (dateString) => {
      return format(new Date(dateString), 'EEEE, MMMM do, yyyy')
    }

    const formatTime = (timeString) => {
      if (!timeString) return ''
      const [hours, minutes] = timeString.split(':')
      const hour = parseInt(hours)
      const ampm = hour >= 12 ? 'PM' : 'AM'
      const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour
      return `${displayHour}:${minutes} ${ampm}`
    }

    const getEventIcon = (eventType) => {
      const icons = {
        todo: 'bi-check-square',
        meeting: 'bi-people',
        reminder: 'bi-bell',
        work: 'bi-briefcase',
        personal: 'bi-person',
        appointment: 'bi-calendar-check',
        study: 'bi-book',
        exam: 'bi-award'
      }
      return icons[eventType] || 'bi-calendar-event'
    }

    const showAddEventModal = () => {
      editingEvent.value = null
      resetEventForm()
      const modalEl = document.getElementById('eventModal')
      if (modalEl) {
        const modal = new window.Modal(modalEl)
        modal.show()
      }
    }

    const addEventForDay = (date) => {
      editingEvent.value = null
      resetEventForm()
      eventForm.value.start_date = date
      // Close day modal if open
      const dayModalEl = document.getElementById('dayModal')
      if (dayModalEl) {
        const dayModal = window.Modal.getInstance(dayModalEl)
        if (dayModal) dayModal.hide()
      }
      // Open event modal
      const modalEl = document.getElementById('eventModal')
      if (modalEl) {
        const modal = new window.Modal(modalEl)
        modal.show()
      }
    }

    const editEvent = (event) => {
      editingEvent.value = event
      
      // Format dates properly for the form
      let startDate = event.start_date
      if (typeof startDate !== 'string') {
        startDate = format(new Date(startDate), 'yyyy-MM-dd')
      }
      
      let endDate = event.end_date || ''
      if (endDate && typeof endDate !== 'string') {
        endDate = format(new Date(endDate), 'yyyy-MM-dd')
      }
      
      eventForm.value = {
        title: event.title,
        description: event.description || '',
        event_type: event.event_type,
        start_date: startDate,
        end_date: endDate,
        start_time: event.start_time || '',
        end_time: event.end_time || '',
        is_all_day: event.is_all_day,
        priority: event.priority,
        status: event.status,
        reminder_minutes: event.reminder_minutes || '',
        location: event.location || '',
        color: event.color,
        course: event.course || ''
      }
      // Close any open modals
      const dayModalEl = document.getElementById('dayModal')
      if (dayModalEl) {
        const dayModal = window.Modal.getInstance(dayModalEl)
        if (dayModal) dayModal.hide()
      }
      const modalEl = document.getElementById('eventModal')
      if (modalEl) {
        const modal = new window.Modal(modalEl)
        modal.show()
      }
    }

    const saveEvent = async () => {
      savingEvent.value = true
      try {
        const data = { ...eventForm.value }
        
        // Convert empty strings to null
        Object.keys(data).forEach(key => {
          if (data[key] === '') data[key] = null
        })

        if (editingEvent.value) {
          await api.put(`/calendar/events/${editingEvent.value.id}`, data)
          toast.success('Event updated successfully')
        } else {
          await api.post('/calendar/events', data)
          toast.success('Event created successfully')
        }

        const modal = window.Modal.getInstance(document.getElementById('eventModal'))
        modal.hide()
        
        await fetchCalendarData()
      } catch (error) {
        console.error('Error saving event:', error)
        toast.error('Failed to save event')
      } finally {
        savingEvent.value = false
      }
    }

    const deleteEvent = async (event) => {
      if (confirm(`Are you sure you want to delete "${event.title}"?`)) {
        try {
          await api.delete(`/calendar/events/${event.id}`)
          toast.success('Event deleted successfully')
          await fetchCalendarData()
        } catch (error) {
          console.error('Error deleting event:', error)
          toast.error('Failed to delete event')
        }
      }
    }

    const markAsCompleted = async (event) => {
      try {
        await api.patch(`/calendar/events/${event.id}/status`, { status: 'completed' })
        toast.success('Task marked as completed')
        await fetchCalendarData()
      } catch (error) {
        console.error('Error updating event status:', error)
        toast.error('Failed to update task status')
      }
    }

    const openDayModal = (day) => {
      selectedDay.value = day
      const modalEl = document.getElementById('dayModal')
      if (modalEl) {
        const modal = new window.Modal(modalEl)
        modal.show()
      }
    }

    const resetEventForm = () => {
      eventForm.value = {
        title: '',
        description: '',
        event_type: 'todo',
        start_date: format(new Date(), 'yyyy-MM-dd'),
        end_date: '',
        start_time: '',
        end_time: '',
        is_all_day: false,
        priority: 'medium',
        status: 'pending',
        reminder_minutes: '',
        location: '',
        color: '#3B82F6',
        course: ''
      }
    }
    // Calculate total work hours for a day
    const getWorkHours = (events) => {
      if (!Array.isArray(events)) return ''
      let totalMinutes = 0
      events.forEach(ev => {
        if (ev.event_type === 'work' && ev.start_time && ev.end_time) {
          const [sh, sm] = ev.start_time.split(':').map(Number)
          const [eh, em] = ev.end_time.split(':').map(Number)
          let diff = (eh * 60 + em) - (sh * 60 + sm)
          if (diff < 0) diff += 24 * 60
          totalMinutes += diff
        }
      })
      return totalMinutes ? (totalMinutes / 60).toFixed(1) : ''
    }

    // Calculate study hours per course for a day
    const getStudyHoursByCourse = (events) => {
      if (!Array.isArray(events)) return {}
      const result = {}
      events.forEach(ev => {
        if (ev.event_type === 'study' && ev.start_time && ev.end_time && ev.course) {
          const [sh, sm] = ev.start_time.split(':').map(Number)
          const [eh, em] = ev.end_time.split(':').map(Number)
          let diff = (eh * 60 + em) - (sh * 60 + sm)
          if (diff < 0) diff += 24 * 60
          result[ev.course] = (result[ev.course] || 0) + diff
        }
      })
      Object.keys(result).forEach(course => {
        result[course] = (result[course] / 60).toFixed(1)
      })
      return result
    }

    // Check if a day is a scheduled work day
    const isScheduledWorkDay = (dateStr) => {
      if (!scheduledWorkDays.value || !Array.isArray(scheduledWorkDays.value)) {
        return false
      }
      return scheduledWorkDays.value.some(day => {
        return day.work_date === dateStr && day.status === 'scheduled'
      })
    }

    // Get scheduled work hours for a day
    const getScheduledWorkHours = (dateStr) => {
      if (!scheduledWorkDays.value || !Array.isArray(scheduledWorkDays.value)) {
        return 0
      }
      const scheduledDay = scheduledWorkDays.value.find(day => {
        return day.work_date === dateStr && day.status === 'scheduled'
      })
      return scheduledDay ? scheduledDay.hours || 0 : 0
    }

    onMounted(() => {
      fetchCalendarData()
    })

    return {
      loading,
      events,
      currentView,
      currentDate,
      calendarStats,
      editingEvent,
      savingEvent,
      selectedDay,
      eventForm,
      timeOptions,
      timeSlots,
      currentHour,
      currentDateDisplay,
      weekDays,
      selectedDayEvents,
      todayEvents,
      meetingCount,
      calendarDays,
      fetchCalendarData,
      setView,
      navigatePrevious,
      navigateNext,
      goToToday,
      formatHour,
      getEventsForTimeSlot,
      getAllDayEvents,
      addEventAtTime,
      formatDate,
      formatTime,
      getEventIcon,
      showAddEventModal,
      addEventForDay,
      editEvent,
      saveEvent,
      deleteEvent,
      markAsCompleted,
      openDayModal,
      resetEventForm,
      getWorkHours,
      getStudyHoursByCourse,
      isScheduledWorkDay,
      getScheduledWorkHours,
      isToday
    }
  }
}
</script>

<style scoped>
.calendar-page {
  padding: 1.5rem;
  max-width: 1400px;
  margin: 0 auto;
}

/* Header Styling */
.calendar-header {
  animation: fadeInDown 0.6s ease-out;
}

.header-content h1 {
  color: #1e293b;
  font-weight: 700;
}

.header-actions {
  gap: 0.75rem;
  flex-wrap: wrap;
}

.header-actions .form-select {
  min-width: 120px;
}

.btn-group .btn.active {
  background-color: #3b82f6;
  border-color: #3b82f6;
  color: white;
}

.date-display {
  min-width: 200px;
  text-align: center;
  color: #1e293b;
  font-size: 1.1rem;
}

/* Statistics Cards */
.stats-section {
  animation: fadeInUp 0.6s ease-out 0.1s both;
}

.stat-card {
  background: white;
  border-radius: 1rem;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  border: 1px solid #f1f5f9;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.stat-icon {
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
}

.stat-value {
  font-size: 1.75rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 0.25rem;
}

.stat-label {
  font-size: 0.875rem;
  color: #64748b;
  font-weight: 500;
}

/* Calendar Container */
.calendar-container {
  animation: fadeInUp 0.6s ease-out 0.2s both;
}

.calendar-grid {
  background: white;
  border-radius: 1rem;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  border: 1px solid #f1f5f9;
}

.calendar-header-row {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.day-header {
  padding: 1rem;
  text-align: center;
  font-weight: 600;
  color: white;
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.calendar-days {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
}

.calendar-day {
  min-height: 120px;
  padding: 0.75rem;
  border: 1px solid #f1f5f9;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  display: flex;
  flex-direction: column;
}

.calendar-day:hover {
  background-color: #f8fafc;
}

.calendar-day.today {
  background-color: #eff6ff;
  border-color: #3b82f6;
}

.calendar-day.other-month {
  background-color: #f8fafc;
  color: #9ca3af;
}

.calendar-day.has-events {
  border-left: 4px solid #3b82f6;
}

.calendar-day.work-day {
  background-color: #f0f9ff;
  border-left: 4px solid #0ea5e9;
}

.calendar-day.work-day.today {
  background-color: #e0f2fe;
  border-color: #0ea5e9;
}

.calendar-day.scheduled-work-day {
  background-color: #fefce8;
  border-left: 4px solid #eab308;
}

.calendar-day.scheduled-work-day.today {
  background-color: #fef3c7;
  border-color: #eab308;
}

.calendar-day.scheduled-work-day.work-day {
  background-color: #ecfdf5;
  border-left: 4px solid #10b981;
}

.day-number {
  font-weight: 600;
  font-size: 1rem;
  margin-bottom: 0.5rem;
}

.today .day-number {
  color: #3b82f6;
  font-weight: 700;
}

.day-events {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  flex: 1;
}

.event-item-compact {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.125rem 0.25rem;
  border-radius: 0.25rem;
  background-color: rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(0, 0, 0, 0.1);
  font-size: 0.7rem;
  line-height: 1.2;
  cursor: pointer;
  transition: all 0.2s ease;
}

.event-item-compact:hover {
  background-color: rgba(255, 255, 255, 0.95);
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.event-dot {
  height: 6px;
  width: 6px;
  border-radius: 50%;
  flex-shrink: 0;
}

.event-text {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
  font-weight: 500;
  color: #374151;
}

.more-events {
  font-size: 0.75rem;
  color: #6b7280;
  font-weight: 500;
  margin-top: 0.25rem;
}

/* Work, Study, and Exam labels */
.scheduled-work-indicator,
.work-day-indicator,
.work-hours-label,
.study-hours-label,
.exam-label {
  font-size: 0.7rem;
  padding: 0.125rem 0.25rem;
  border-radius: 0.25rem;
  margin-bottom: 0.25rem;
  display: flex;
  align-items: center;
  font-weight: 500;
}

.scheduled-work-indicator {
  background-color: #fef3c7;
  color: #92400e;
  border: 1px solid #fbbf24;
}

.scheduled-work-label {
  font-weight: 600;
}

.work-day-indicator {
  background-color: #eff6ff;
  color: #1d4ed8;
  border: 1px solid #bfdbfe;
}

.work-day-label {
  font-weight: 600;
}

.work-hours-label {
  background-color: #dbeafe;
  color: #1e40af;
}

.study-hours-label {
  background-color: #d1fae5;
  color: #065f46;
}

.exam-label {
  background-color: #fee2e2;
  color: #991b1b;
}

/* Today's Events */
.today-events {
  animation: fadeInUp 0.6s ease-out 0.3s both;
}

.event-list {
  max-height: 500px;
  overflow-y: auto;
}

.event-item {
  display: flex;
  gap: 1rem;
  padding: 1rem;
  border: 1px solid #f1f5f9;
  border-radius: 0.75rem;
  margin-bottom: 0.75rem;
  transition: all 0.2s ease;
  background: white;
}

.event-item:hover {
  border-color: #e2e8f0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.event-item.event-completed {
  opacity: 0.7;
  background-color: #f0fdf4;
}

.event-indicator {
  width: 4px;
  border-radius: 2px;
  flex-shrink: 0;
}

.event-content {
  flex: 1;
}

.event-title {
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 0.25rem;
  display: flex;
  align-items: center;
}

.event-type-icon {
  color: #6b7280;
}

.event-time,
.event-location,
.event-description {
  font-size: 0.875rem;
  color: #64748b;
  margin-bottom: 0.25rem;
}

.event-description {
  margin-bottom: 0.5rem;
}

.event-actions {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.event-actions .btn {
  padding: 0.25rem 0.75rem;
  font-size: 0.8rem;
}

/* Modal Enhancements */
.modal-content {
  border-radius: 1rem;
  border: none;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25);
}

.modal-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 1rem 1rem 0 0;
}

.modal-header .btn-close {
  filter: invert(1);
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

/* Responsive Design */
@media (max-width: 768px) {
  .calendar-page {
    padding: 1rem;
  }
  
  .header-actions {
    width: 100%;
    justify-content: center;
    flex-wrap: wrap;
  }
  
  .header-actions .btn-group {
    order: 1;
    width: 100%;
    margin-bottom: 1rem;
  }
  
  .header-actions .btn-group .btn {
    flex: 1;
  }
  
  .date-display {
    min-width: 150px;
    font-size: 1rem;
  }
  
  .calendar-day {
    min-height: 80px;
    padding: 0.5rem;
  }
  
  .day-header {
    padding: 0.75rem 0.5rem;
    font-size: 0.75rem;
  }
  
  .stat-card {
    padding: 1rem;
  }
  
  .stat-icon {
    width: 2.5rem;
    height: 2.5rem;
    font-size: 1rem;
  }
  
  .stat-value {
    font-size: 1.5rem;
  }
  
  /* Week view mobile adjustments */
  .week-header {
    grid-template-columns: 60px repeat(7, 1fr);
  }
  
  .week-grid {
    grid-template-columns: 60px repeat(7, 1fr);
  }
  
  .week-day-header {
    padding: 0.75rem 0.25rem;
  }
  
  .day-name {
    font-size: 0.7rem;
  }
  
  .day-number {
    font-size: 1.2rem;
  }
  
  .day-date {
    display: none;
  }
  
  .time-slot {
    height: 50px;
    font-size: 0.7rem;
  }
  
  .week-time-slot {
    height: 50px;
  }
  
  /* Day view mobile adjustments */
  .day-view-header {
    padding: 1rem;
    flex-direction: column;
    gap: 0.5rem;
    text-align: center;
  }
  
  .day-time-slot {
    grid-template-columns: 80px 1fr;
    min-height: 60px;
  }
  
  .time-label {
    padding: 0.75rem 0.5rem;
    font-size: 0.75rem;
  }
  
  .day-event {
    padding: 0.5rem;
  }
  
  .day-event .event-title {
    font-size: 0.85rem;
  }
}

@media (max-width: 576px) {
  .calendar-day {
    min-height: 60px;
    padding: 0.5rem 0.25rem;
  }
  
  .day-number {
    font-size: 0.875rem;
  }
  
  .event-dot {
    height: 3px;
  }
  
  .more-events {
    font-size: 0.7rem;
  }
  
  .event-actions {
    flex-direction: column;
  }
  
  .event-actions .btn {
    width: 100%;
  }
  
  /* Ultra mobile week view */
  .week-header {
    grid-template-columns: 50px repeat(7, 1fr);
  }
  
  .week-grid {
    grid-template-columns: 50px repeat(7, 1fr);
  }
  
  .week-day-header {
    padding: 0.5rem 0.125rem;
  }
  
  .day-name {
    font-size: 0.6rem;
  }
  
  .day-number {
    font-size: 1rem;
  }
  
  .time-slot {
    height: 40px;
    font-size: 0.6rem;
  }
  
  .week-time-slot {
    height: 40px;
  }
  
  .week-event {
    font-size: 0.6rem;
    padding: 2px 3px;
  }
  
  /* Ultra mobile day view */
  .day-time-slot {
    grid-template-columns: 60px 1fr;
    min-height: 50px;
  }
  
  .time-label {
    padding: 0.5rem 0.25rem;
    font-size: 0.7rem;
  }
}

/* Event type specific colors */
.event-todo .event-indicator { background-color: #f59e0b !important; }
.event-meeting .event-indicator { background-color: #ef4444 !important; }
.event-reminder .event-indicator { background-color: #8b5cf6 !important; }
.event-work .event-indicator { background-color: #3b82f6 !important; }
.event-personal .event-indicator { background-color: #10b981 !important; }
.event-appointment .event-indicator { background-color: #06b6d4 !important; }
.event-study .event-indicator { background-color: #059669 !important; }
.event-exam .event-indicator { background-color: #dc2626 !important; }

/* Week View Styles */
.week-view {
  background: white;
  border-radius: 1rem;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  border: 1px solid #f1f5f9;
}

.week-header {
  display: grid;
  grid-template-columns: 80px repeat(7, 1fr);
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.week-day-header {
  padding: 1rem 0.5rem;
  text-align: center;
  border-right: 1px solid rgba(255, 255, 255, 0.2);
}

.week-day-header.today {
  background-color: rgba(255, 255, 255, 0.2);
}

.day-name {
  font-size: 0.875rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.day-number {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0.25rem 0;
}

.day-date {
  font-size: 0.75rem;
  opacity: 0.9;
}

.week-grid {
  display: grid;
  grid-template-columns: 80px repeat(7, 1fr);
  max-height: 600px;
  overflow-y: auto;
}

.time-column {
  background-color: #f8fafc;
  border-right: 2px solid #e2e8f0;
}

.time-slot {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 500;
  color: #64748b;
  border-bottom: 1px solid #e2e8f0;
}

.week-day-column {
  border-right: 1px solid #e2e8f0;
  cursor: pointer;
  position: relative;
}

.week-time-slot {
  height: 60px;
  border-bottom: 1px solid #f1f5f9;
  position: relative;
  padding: 2px;
}

.week-time-slot:hover {
  background-color: #f8fafc;
}

.week-time-slot.current-hour {
  background-color: #eff6ff;
  border-left: 3px solid #3b82f6;
}

.week-event {
  position: absolute;
  left: 2px;
  right: 2px;
  top: 2px;
  bottom: 2px;
  border-radius: 4px;
  padding: 4px 6px;
  color: white;
  font-size: 0.75rem;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}

.week-event:hover {
  transform: scale(1.02);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
}

.week-event .event-title {
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.week-event .event-time {
  font-size: 0.7rem;
  opacity: 0.9;
}

/* Day View Styles */
.day-view {
  background: white;
  border-radius: 1rem;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  border: 1px solid #f1f5f9;
}

.day-view-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.day-view-header h4 {
  margin: 0;
  font-weight: 700;
}

.day-summary .badge {
  font-size: 0.8rem;
}

.day-view-content {
  max-height: 700px;
  overflow-y: auto;
}

.day-time-grid {
  display: flex;
  flex-direction: column;
}

.day-time-slot {
  display: grid;
  grid-template-columns: 100px 1fr;
  min-height: 80px;
  border-bottom: 1px solid #f1f5f9;
  cursor: pointer;
}

.day-time-slot:hover {
  background-color: #f8fafc;
}

.day-time-slot.current-hour {
  background-color: #eff6ff;
  border-left: 4px solid #3b82f6;
}

.time-label {
  padding: 1rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: #64748b;
  background-color: #f8fafc;
  border-right: 2px solid #e2e8f0;
  display: flex;
  align-items: flex-start;
  justify-content: center;
}

.time-content {
  padding: 0.5rem;
  position: relative;
}

.day-event {
  background-color: #3b82f6;
  color: white;
  border-radius: 6px;
  padding: 0.75rem;
  margin-bottom: 0.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.day-event:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.day-event.all-day-event {
  border-left: 4px solid rgba(255, 255, 255, 0.8);
}

.day-event .event-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.day-event .event-title {
  font-weight: 600;
  font-size: 0.95rem;
}

.day-event .event-time {
  font-size: 0.8rem;
  opacity: 0.9;
}

.day-event .event-description {
  font-size: 0.85rem;
  opacity: 0.9;
  margin-bottom: 0.25rem;
}

.day-event .event-location {
  font-size: 0.8rem;
  opacity: 0.8;
}
</style>
