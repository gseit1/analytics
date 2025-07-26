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
          <select class="form-select" v-model="selectedMonth" @change="fetchCalendarData">
            <option v-for="month in months" :key="month.value" :value="month.value">
              {{ month.label }}
            </option>
          </select>
          <select class="form-select" v-model="selectedYear" @change="fetchCalendarData">
            <option v-for="year in years" :key="year" :value="year">{{ year }}</option>
          </select>
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
      <div class="calendar-grid">
        <!-- Calendar Header -->
        <div class="calendar-header-row">
          <div class="day-header">Sun</div>
          <div class="day-header">Mon</div>
          <div class="day-header">Tue</div>
          <div class="day-header">Wed</div>
          <div class="day-header">Thu</div>
          <div class="day-header">Fri</div>
          <div class="day-header">Sat</div>
        </div>

        <!-- Calendar Days -->
        <div class="calendar-days">
          <div 
            v-for="day in calendarDays" 
            :key="day.date"
            class="calendar-day"
            :class="{
              'other-month': !day.currentMonth,
              'today': day.isToday,
              'has-events': day.events.length > 0
            }"
            @click="openDayModal(day)"
          >
            <div class="day-number">{{ day.day }}</div>
            <div class="day-events">
              <div 
                v-for="event in day.events.slice(0, 3)" 
                :key="event.id"
                class="event-dot"
                :class="`event-${event.event_type}`"
                :style="{ backgroundColor: event.color }"
                :title="event.title"
              ></div>
              <div v-if="day.events.length > 3" class="more-events">
                +{{ day.events.length - 3 }}
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
            <div v-if="selectedDay && selectedDay.events.length === 0" class="text-center py-4">
              <i class="bi bi-calendar-x fs-1 text-muted"></i>
              <p class="mt-2 text-muted">No events scheduled for this day</p>
              <button class="btn btn-primary" @click="addEventForDay(selectedDay.date)">
                <i class="bi bi-plus-circle me-2"></i>Add Event
              </button>
            </div>
            <div v-else-if="selectedDay" class="event-list">
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
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, getDay } from 'date-fns'

export default {
  name: 'Calendar',
  setup () {
    const toast = useToast()

    const loading = ref(false)
    const events = ref([])
    const selectedMonth = ref(new Date().getMonth() + 1)
    const selectedYear = ref(new Date().getFullYear())
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
      color: '#3B82F6'
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

    const todayEvents = computed(() => {
      const today = format(new Date(), 'yyyy-MM-dd')
      return events.value.filter(event => event.start_date === today)
        .sort((a, b) => {
          if (!a.start_time && !b.start_time) return 0
          if (!a.start_time) return 1
          if (!b.start_time) return -1
          return a.start_time.localeCompare(b.start_time)
        })
    })

    const meetingCount = computed(() => {
      return events.value.filter(event => event.event_type === 'meeting').length
    })

    const calendarDays = computed(() => {
      const currentDate = new Date(selectedYear.value, selectedMonth.value - 1)
      const start = startOfMonth(currentDate)
      const end = endOfMonth(currentDate)
      
      // Get all days in month
      const daysInMonth = eachDayOfInterval({ start, end })
      
      // Add days from previous month to fill the grid
      const startDay = getDay(start)
      const prevMonthDays = []
      for (let i = startDay - 1; i >= 0; i--) {
        const day = new Date(start)
        day.setDate(day.getDate() - (i + 1))
        prevMonthDays.push(day)
      }
      
      // Add days from next month to fill the grid
      const endDay = getDay(end)
      const nextMonthDays = []
      for (let i = 1; i <= (6 - endDay); i++) {
        const day = new Date(end)
        day.setDate(day.getDate() + i)
        nextMonthDays.push(day)
      }
      
      const allDays = [...prevMonthDays, ...daysInMonth, ...nextMonthDays]
      
      return allDays.map(day => {
        const dateStr = format(day, 'yyyy-MM-dd')
        const dayEvents = events.value.filter(event => event.start_date === dateStr)
        
        return {
          date: dateStr,
          day: day.getDate(),
          currentMonth: day.getMonth() === currentDate.getMonth(),
          isToday: isToday(day),
          events: dayEvents
        }
      })
    })

    const fetchCalendarData = async () => {
      loading.value = true
      try {
        const [eventsResponse, statsResponse] = await Promise.all([
          api.get('/calendar/events', {
            params: { month: selectedMonth.value, year: selectedYear.value }
          }),
          api.get('/calendar/stats', {
            params: { month: selectedMonth.value, year: selectedYear.value }
          })
        ])
        
        events.value = eventsResponse.data.events
        calendarStats.value = statsResponse.data.summary
      } catch (error) {
        console.error('Error fetching calendar data:', error)
        toast.error('Failed to load calendar data')
      } finally {
        loading.value = false
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
        appointment: 'bi-calendar-check'
      }
      return icons[eventType] || 'bi-calendar-event'
    }

    const showAddEventModal = () => {
      editingEvent.value = null
      resetEventForm()
      const modal = new window.Modal(document.getElementById('eventModal'))
      modal.show()
    }

    const addEventForDay = (date) => {
      editingEvent.value = null
      resetEventForm()
      eventForm.value.start_date = date
      
      // Close day modal if open
      const dayModal = window.Modal.getInstance(document.getElementById('dayModal'))
      if (dayModal) dayModal.hide()
      
      // Open event modal
      const modal = new window.Modal(document.getElementById('eventModal'))
      modal.show()
    }

    const editEvent = (event) => {
      editingEvent.value = event
      eventForm.value = {
        title: event.title,
        description: event.description || '',
        event_type: event.event_type,
        start_date: event.start_date,
        end_date: event.end_date || '',
        start_time: event.start_time || '',
        end_time: event.end_time || '',
        is_all_day: event.is_all_day,
        priority: event.priority,
        status: event.status,
        reminder_minutes: event.reminder_minutes || '',
        location: event.location || '',
        color: event.color
      }
      
      // Close any open modals
      const dayModal = window.Modal.getInstance(document.getElementById('dayModal'))
      if (dayModal) dayModal.hide()
      
      const modal = new window.Modal(document.getElementById('eventModal'))
      modal.show()
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
      const modal = new window.Modal(document.getElementById('dayModal'))
      modal.show()
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
        color: '#3B82F6'
      }
    }

    onMounted(() => {
      fetchCalendarData()
    })

    return {
      loading,
      events,
      selectedMonth,
      selectedYear,
      calendarStats,
      editingEvent,
      savingEvent,
      selectedDay,
      eventForm,
      months,
      years,
      timeOptions,
      todayEvents,
      meetingCount,
      calendarDays,
      fetchCalendarData,
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
      resetEventForm
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
}

.header-actions .form-select {
  min-width: 120px;
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

.event-dot {
  height: 4px;
  border-radius: 2px;
  margin-bottom: 2px;
}

.more-events {
  font-size: 0.75rem;
  color: #6b7280;
  font-weight: 500;
  margin-top: 0.25rem;
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
    justify-content: space-between;
  }
  
  .header-actions .form-select {
    min-width: 100px;
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
}

/* Event type specific colors */
.event-todo .event-indicator { background-color: #f59e0b !important; }
.event-meeting .event-indicator { background-color: #ef4444 !important; }
.event-reminder .event-indicator { background-color: #8b5cf6 !important; }
.event-work .event-indicator { background-color: #3b82f6 !important; }
.event-personal .event-indicator { background-color: #10b981 !important; }
.event-appointment .event-indicator { background-color: #06b6d4 !important; }
</style>
