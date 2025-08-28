/* Enhanced Compact Analytics Table Styles */
.compact-analytics-card {
  border-radius: 12px;
  box-shadow: 0 2px 12px 0 rgba(60, 72, 88, 0.08);
  border: none;
}
.compact-analytics-table {
  font-size: 0.95rem;
  border-radius: 8px;
  background: #fff;
  box-shadow: 0 1px 4px 0 rgba(60, 72, 88, 0.06);
  overflow: hidden;
}
.compact-analytics-table th,
.compact-analytics-table td {
  padding: 0.55rem 0.7rem;
  vertical-align: middle;
  border: none;
}
.compact-analytics-table th {
  background: linear-gradient(90deg, #e9f0fa 80%, #f8fafc 100%);
  font-weight: 700;
  color: #2d3a4a;
  border-bottom: 2px solid #dee2e6;
  letter-spacing: 0.5px;
  font-size: 1.05rem;
}
.compact-analytics-table tr {
  transition: background 0.18s;
}
.compact-analytics-table tbody tr:hover {
  background: #f5faff;
}
.compact-analytics-table .metric-col {
  width: 28%;
  min-width: 120px;
}
.compact-analytics-table .actual-col,
.compact-analytics-table .pending-col,
.compact-analytics-table .total-col,
.compact-analytics-table .perf-col {
  width: 18%;
  min-width: 80px;
}
.compact-analytics-table .badge {
  font-size: 0.88rem;
  padding: 0.38rem 0.8rem;
  border-radius: 8px;
  font-weight: 600;
  box-shadow: 0 1px 2px 0 rgba(60, 72, 88, 0.04);
}
.compact-analytics-table .table-info td {
  background: linear-gradient(90deg, #f3f8ff 80%, #e9f0fa 100%);
  font-weight: 700;
  border-left: 4px solid #6c5ce7;
}
.compact-analytics-table td:first-child {
  font-weight: 600;
  color: #3a3a3a;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  border-left: 4px solid #e9ecef;
}
.compact-analytics-table tr.table-info td:first-child {
  border-left: 4px solid #6c5ce7;
}
.compact-analytics-table i.bi {
  font-size: 1.15rem;
  opacity: 0.85;
  filter: drop-shadow(0 1px 0 #fff);
}
.compact-analytics-table .text-success {
  color: #28a745 !important;
}
.compact-analytics-table .text-warning {
  color: #ffc107 !important;
}
.compact-analytics-table .text-primary {
  color: #007bff !important;
}
.compact-analytics-table .text-info {
  color: #17a2b8 !important;
}
.compact-progress {
  background: #e9ecef;
  border-radius: 8px;
  height: 6px;
  overflow: hidden;
}
.compact-progress .progress-bar {
  border-radius: 8px;
  transition: width 0.5s;
}
@media (max-width: 900px) {
  .compact-analytics-table {
    font-size: 0.87rem;
  }
  .compact-analytics-table th,
  .compact-analytics-table td {
    padding: 0.32rem 0.3rem;
  }
}
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

    <!-- Navigation Controls -->
    <div class="calendar-navigation mb-4">
      <div class="d-flex justify-content-between align-items-center">
        <div class="d-flex gap-2 align-items-center">
          <button class="btn btn-outline-secondary" @click="navigatePrevious">
            <i class="bi bi-chevron-left"></i>
          </button>
          <h4 class="mb-0">{{ currentMonthDisplay }}</h4>
          <button class="btn btn-outline-secondary" @click="navigateNext">
            <i class="bi bi-chevron-right"></i>
          </button>
        </div>
        <div class="d-flex gap-2">
          <select class="form-select" v-model="selectedMonth" @change="fetchCalendarData" style="width: auto;">
            <option v-for="month in months" :key="month.value" :value="month.value">
              {{ month.label }}
            </option>
          </select>
          <select class="form-select" v-model="selectedYear" @change="fetchCalendarData" style="width: auto;">
            <option v-for="year in years" :key="year" :value="year">{{ year }}</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Monthly Summary -->
    <div class="monthly-summary-section mb-4">
      <div class="card">
        <div class="card-header">
          <div class="d-flex justify-content-between align-items-center">
            <h5 class="mb-0">
              <i class="bi bi-calendar-month me-2 text-info"></i>Monthly Overview
            </h5>
            <span class="badge bg-info">{{ currentMonthDisplay }}</span>
          </div>
        </div>
        <div class="card-body">
          <div class="row g-3">
            <div class="col-md-3">
              <div class="monthly-stat-card worked">
                <div class="stat-icon">
                  <i class="bi bi-check-circle-fill"></i>
                </div>
                <div class="stat-content">
                  <div class="stat-label">Worked Hours</div>
                  <div class="stat-value">{{ monthlyStats.totalWorkedHours.toFixed(1) }}h</div>
                  <div class="stat-sublabel">Completed</div>
                </div>
              </div>
            </div>
            <div class="col-md-3">
              <div class="monthly-stat-card scheduled">
                <div class="stat-icon">
                  <i class="bi bi-calendar-check"></i>
                </div>
                <div class="stat-content">
                  <div class="stat-label">Scheduled Hours</div>
                  <div class="stat-value">{{ monthlyStats.totalScheduledHours.toFixed(1) }}h</div>
                  <div class="stat-sublabel">Remaining</div>
                </div>
              </div>
            </div>
            <div class="col-md-3">
              <div class="monthly-stat-card earnings">
                <div class="stat-icon">
                  <i class="bi bi-currency-dollar"></i>
                </div>
                <div class="stat-content">
                  <div class="stat-label">Earned + Tips</div>
                  <div class="stat-value">${{ (monthlyStats.actualEarnings + monthlyStats.tips).toFixed(2) }}</div>
                  <div class="stat-sublabel">Actual</div>
                </div>
              </div>
            </div>
            <div class="col-md-3">
              <div class="monthly-stat-card total">
                <div class="stat-icon">
                  <i class="bi bi-calculator"></i>
                </div>
                <div class="stat-content">
                  <div class="stat-label">Total Estimated</div>
                  <div class="stat-value">${{ monthlyStats.totalEstimatedEarnings.toFixed(2) }}</div>
                  <div class="stat-sublabel">Base pay only (no tips)</div>
                </div>
              </div>
            </div>
          </div>
          <div class="row mt-3">
            <div class="col-12">
              <div class="progress-summary">
                <div class="d-flex justify-content-between align-items-center mb-2">
                  <span class="progress-label">Monthly Progress</span>
                  <span class="progress-percentage">
                    {{ monthlyStats.totalWorkedHours + monthlyStats.totalScheduledHours > 0 ? 
                        Math.round((monthlyStats.totalWorkedHours / (monthlyStats.totalWorkedHours + monthlyStats.totalScheduledHours)) * 100) : 0 }}%
                  </span>
                </div>
                <div class="progress" style="height: 8px;">
                  <div class="progress-bar bg-success" 
                       :style="{ width: (monthlyStats.totalWorkedHours + monthlyStats.totalScheduledHours > 0 ? 
                                        (monthlyStats.totalWorkedHours / (monthlyStats.totalWorkedHours + monthlyStats.totalScheduledHours)) * 100 : 0) + '%' }"
                       :title="`${monthlyStats.totalWorkedHours.toFixed(1)}h worked out of ${(monthlyStats.totalWorkedHours + monthlyStats.totalScheduledHours).toFixed(1)}h total planned`">
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Enhanced Analytics Table -->
    <div class="analytics-table-section mb-4">
      <div class="card weekly-earnings-section">
        <div class="card-header">
          <div class="d-flex justify-content-between align-items-center">
            <h5 class="mb-0">
              <i class="bi bi-graph-up me-2 text-success"></i>Detailed Analytics
            </h5>
            <span class="badge bg-info">{{ currentMonthDisplay }}</span>
          </div>
        </div>
        <div class="card-body p-0">
          <div class="table-responsive">
            <table class="table table-hover weekly-table mb-0">
              <thead class="table-primary">
                <tr>
                  <th scope="col" class="week-column"><i class="bi bi-bar-chart me-1"></i>Metric</th>
                  <th scope="col" class="hours-column text-center"><i class="bi bi-clock me-1"></i>Worked</th>
                  <th scope="col" class="hours-column text-center"><i class="bi bi-calendar-check me-1"></i>Scheduled</th>
                  <th scope="col" class="earnings-column text-center"><i class="bi bi-currency-dollar me-1"></i>Earned</th>
                  <th scope="col" class="tips-column text-center"><i class="bi bi-star me-1"></i>Tips</th>
                  <th scope="col" class="total-column text-center"><i class="bi bi-cash-stack me-1"></i>Total</th>
                  <th scope="col" class="progress-column text-center"><i class="bi bi-graph-up me-1"></i>Progress</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td class="week-number"><div class="week-badge"><span class="week-label">Hours</span></div></td>
                  <td class="worked-hours text-center"><div class="metric-value worked"><span class="value">{{ safeToFixed(monthlyStats.totalWorkedHours, 1) }}h</span><small class="label">Worked</small></div></td>
                  <td class="scheduled-hours text-center"><div class="metric-value scheduled"><span class="value">{{ safeToFixed(monthlyStats.totalScheduledHours, 1) }}h</span><small class="label">Scheduled</small></div></td>
                  <td class="base-earnings text-center"><div class="metric-value earnings"><span class="value">${{ safeToFixed(monthlyStats.actualEarnings, 2) }}</span><small class="label">Base</small></div></td>
                  <td class="tips-earned text-center"><div class="metric-value tips"><span class="value">${{ safeToFixed(monthlyStats.tips, 2) }}</span><small class="label">Tips</small></div></td>
                  <td class="total-earned text-center"><div class="metric-value total"><span class="value total-highlight">${{ safeToFixed(monthlyStats.actualEarnings + monthlyStats.tips, 2) }}</span><small class="label">Total</small></div></td>
                  <td class="completion-progress text-center"><div class="progress-container"><div class="progress weekly-progress mb-1"><div class="progress-bar bg-success" :style="{ width: monthlyStats.completionPercentage + '%' }" :title="`${monthlyStats.completionPercentage}% of planned hours completed`"></div></div><div class="progress-details"><span class="progress-percentage">{{ safeToFixed(monthlyStats.completionPercentage, 1) }}%</span><small class="progress-label">Complete</small></div></div></td>
                </tr>
                <tr>
                  <td class="week-number"><div class="week-badge"><span class="week-label">Days</span></div></td>
                  <td class="worked-hours text-center"><div class="metric-value worked"><span class="value">{{ monthlyStats.workedDaysCount }}</span><small class="label">Worked</small></div></td>
                  <td class="scheduled-hours text-center"><div class="metric-value scheduled"><span class="value">{{ monthlyStats.scheduledDaysCount }}</span><small class="label">Scheduled</small></div></td>
                  <td colspan="4"></td>
                </tr>
                <tr>
                  <td class="week-number"><div class="week-badge"><span class="week-label">Hourly Rate</span></div></td>
                  <td class="worked-hours text-center"><div class="metric-value worked"><span class="value">${{ safeToFixed(monthlyStats.averageEarningsPerHour, 2) }}</span><small class="label">Actual</small></div></td>
                  <td class="scheduled-hours text-center"><div class="metric-value scheduled"><span class="value">${{ safeToFixed(hourlyRate.value, 2) }}</span><small class="label">Target</small></div></td>
                  <td colspan="2"></td>
                  <td class="total-earned text-center"><div class="metric-value total"><span class="value">{{ monthlyStats.averageEarningsPerHour >= hourlyRate.value ? 'Above' : 'Below' }}</span><small class="label">Target</small></div></td>
                  <td class="completion-progress text-center"><div class="progress-container"><div class="progress weekly-progress mb-1"><div class="progress-bar" :class="monthlyStats.averageEarningsPerHour >= hourlyRate.value ? 'bg-success' : 'bg-danger'" :style="{ width: Math.min(100, Math.round((monthlyStats.averageEarningsPerHour / hourlyRate.value) * 100)) + '%' }" :title="`${safeToFixed((monthlyStats.averageEarningsPerHour / hourlyRate.value) * 100, 1)}% of target`"></div></div><div class="progress-details"><span class="progress-percentage">{{ safeToFixed((monthlyStats.averageEarningsPerHour / hourlyRate.value) * 100, 1) }}%</span><small class="progress-label">of Target</small></div></div></td>
                </tr>
              </tbody>
              <tfoot class="table-light">
                <tr class="summary-row">
                  <td colspan="2" class="summary-label"><strong><i class="bi bi-calculator me-2"></i>Totals</strong></td>
                  <td class="text-center"><div class="summary-value scheduled"><strong>{{ safeToFixed(monthlyStats.totalPlannedHours, 1) }}h</strong></div></td>
                  <td class="text-center"><div class="summary-value earnings"><strong>${{ safeToFixed(monthlyStats.totalEstimatedEarnings, 2) }}</strong></div></td>
                  <td class="text-center"><div class="summary-value tips"><strong>${{ safeToFixed(monthlyStats.projectedTotalTips, 2) }}</strong></div></td>
                  <td class="text-center"><div class="summary-value total-highlight"><strong>${{ safeToFixed(monthlyStats.totalPotentialEarnings, 2) }}</strong></div></td>
                  <td class="text-center"><div class="summary-progress"><span class="badge bg-primary">{{ safeToFixed(monthlyStats.completionPercentage, 1) }}% Overall</span></div></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- Weekly Earnings Table -->
    <div class="weekly-earnings-section mb-4">
      <div class="card">
        <div class="card-header">
          <div class="d-flex justify-content-between align-items-center">
            <h5 class="mb-0">
              <i class="bi bi-calendar-week me-2 text-primary"></i>Weekly Earnings Breakdown
            </h5>
            <span class="badge bg-primary">{{ currentMonthDisplay }}</span>
          </div>
        </div>
        <div class="card-body p-0">
          <div class="table-responsive">
            <table class="table table-hover weekly-table mb-0">
              <thead class="table-primary">
                <tr>
                  <th scope="col" class="week-column">
                    <i class="bi bi-calendar-week me-1"></i>Week
                  </th>
                  <th scope="col" class="date-range-column">Date Range</th>
                  <th scope="col" class="hours-column text-center">
                    <i class="bi bi-clock me-1"></i>Worked Hours
                  </th>
                  <th scope="col" class="hours-column text-center">
                    <i class="bi bi-calendar-check me-1"></i>Scheduled Hours
                  </th>
                  <th scope="col" class="earnings-column text-center">
                    <i class="bi bi-currency-dollar me-1"></i>Base Earnings
                  </th>
                  <th scope="col" class="tips-column text-center">
                    <i class="bi bi-star me-1"></i>Tips
                  </th>
                  <th scope="col" class="total-column text-center">
                    <i class="bi bi-cash-stack me-1"></i>Total
                  </th>
                  <th scope="col" class="progress-column text-center">
                    <i class="bi bi-graph-up me-1"></i>Progress
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(week, index) in weeklyBreakdown" :key="index" class="weekly-row">
                  <td class="week-number">
                    <div class="week-badge">
                      <span class="week-label">Week {{ index + 1 }}</span>
                    </div>
                  </td>
                  <td class="date-range">
                    <span class="date-text">{{ week.dateRange }}</span>
                  </td>
                  <td class="worked-hours text-center">
                    <div class="metric-value worked">
                      <span class="value">{{ week.actualHours }}h</span>
                      <small class="label">Completed</small>
                    </div>
                  </td>
                  <td class="scheduled-hours text-center">
                    <div class="metric-value scheduled">
                      <span class="value">{{ week.scheduledHours }}h</span>
                      <small class="label">Remaining</small>
                    </div>
                  </td>
                  <td class="base-earnings text-center">
                    <div class="metric-value earnings">
                      <span class="value">${{ safeToFixed(week.actualEarnings, 2) }}</span>
                      <small class="label">Base Pay</small>
                    </div>
                  </td>
                  <td class="tips-earned text-center">
                    <div class="metric-value tips">
                      <span class="value">${{ safeToFixed(week.tips, 2) }}</span>
                      <small class="label">Tips</small>
                    </div>
                  </td>
                  <td class="total-earned text-center">
                    <div class="metric-value total">
                      <span class="value total-highlight">${{ safeToFixed(week.actualEarnings + week.tips, 2) }}</span>
                      <small class="label">Total Earned</small>
                    </div>
                  </td>
                  <td class="completion-progress text-center">
                    <div class="progress-container">
                      <div class="progress weekly-progress mb-1">
                        <div class="progress-bar bg-success" 
                             :style="{ width: week.completionRate + '%' }"
                             :title="`${week.completionRate}% of planned hours completed`">
                        </div>
                      </div>
                      <div class="progress-details">
                        <span class="progress-percentage">{{ week.completionRate }}%</span>
                        <small class="progress-label">Complete</small>
                      </div>
                    </div>
                  </td>
                </tr>
              </tbody>
              <tfoot class="table-light">
                <tr class="summary-row">
                  <td colspan="2" class="summary-label">
                    <strong><i class="bi bi-calculator me-2"></i>Monthly Totals</strong>
                  </td>
                  <td class="text-center">
                    <div class="summary-value worked">
                      <strong>{{ safeToFixed(weeklyBreakdown.reduce((sum, week) => sum + parseFloat(week.actualHours), 0), 1) }}h</strong>
                    </div>
                  </td>
                  <td class="text-center">
                    <div class="summary-value scheduled">
                      <strong>{{ safeToFixed(weeklyBreakdown.reduce((sum, week) => sum + parseFloat(week.scheduledHours), 0), 1) }}h</strong>
                    </div>
                  </td>
                  <td class="text-center">
                    <div class="summary-value earnings">
                      <strong>${{ safeToFixed(weeklyBreakdown.reduce((sum, week) => sum + week.actualEarnings, 0), 2) }}</strong>
                    </div>
                  </td>
                  <td class="text-center">
                    <div class="summary-value tips">
                      <strong>${{ safeToFixed(weeklyBreakdown.reduce((sum, week) => sum + week.tips, 0), 2) }}</strong>
                    </div>
                  </td>
                  <td class="text-center">
                    <div class="summary-value total-highlight">
                      <strong>${{ safeToFixed(weeklyBreakdown.reduce((sum, week) => sum + week.actualEarnings + week.tips, 0), 2) }}</strong>
                    </div>
                  </td>
                  <td class="text-center">
                    <div class="summary-progress">
                      <span class="badge bg-primary">
                        {{ safeToFixed(monthlyStats.completionPercentage, 1) }}% Overall
                      </span>
                    </div>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- Calendar Grid -->
    <div class="calendar-section">
      <div class="card">
        <div class="card-header">
          <div class="d-flex justify-content-between align-items-center">
            <h5 class="mb-0">
              <i class="bi bi-calendar-week me-2"></i>Schedule Calendar
            </h5>
            <div class="legend d-flex gap-3">
              <div class="legend-item">
                <div class="legend-dot worked"></div>
                <span>Worked</span>
              </div>
              <div class="legend-item">
                <div class="legend-dot scheduled"></div>
                <span>Scheduled</span>
              </div>
              <div class="legend-item">
                <div class="legend-dot skipped"></div>
                <span>Skipped</span>
              </div>
              <div class="legend-item">
                <div class="legend-dot day-off"></div>
                <span>Day Off</span>
              </div>
            </div>
          </div>
        </div>
        <div class="card-body">
          <div v-if="loading" class="text-center py-5">
            <div class="spinner-border text-primary" role="status"></div>
            <p class="mt-2">Loading calendar...</p>
          </div>
          <div v-else class="calendar-grid">
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
                  'worked': day && day.status === 'worked',
                  'scheduled': day && day.status === 'scheduled',
                  'skipped': day && day.status === 'skipped',
                  'day-off': day && day.status === 'day_off'
                }"
                @click="openDayModal(day)"
              >
                <div class="day-number">{{ day?.day }}</div>
                <div v-if="day && day.currentMonth" class="day-content">
                  <!-- Work status indicator -->
                  <div v-if="day.status === 'worked'" class="work-info">
                    <div class="hours">{{ day.hours_worked }}h</div>
                    <div class="earnings">${{ (day.calculated_payment + (day.tips_amount || 0)).toFixed(0) }}</div>
                  </div>
                  <div v-else-if="day.status === 'scheduled'" class="scheduled-info">
                    <div class="scheduled-hours">{{ day.scheduled_hours }}h</div>
                    <div class="scheduled-text">Scheduled</div>
                  </div>
                  <div v-else-if="day.status === 'skipped'" class="skipped-info">
                    <div class="skipped-text">Skipped</div>
                  </div>
                  <div v-else-if="day.status === 'day_off'" class="day-off-info">
                    <div class="day-off-text">Day Off</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Day Detail Modal -->
    <div class="modal fade" tabindex="-1" :class="{ show: showDayModal }" style="display: block;" v-if="showDayModal">
      <div class="modal-dialog">
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
                  <strong>Total:</strong> ${{ (selectedDay.calculated_payment + (selectedDay.tips_amount || 0)).toFixed(2) }}
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
                      {{ day.is_work_day ? `$${safeToFixed(day.default_hours * hourlyRate.value, 2)}` : 'Day Off' }}
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
    const monthlyStats = ref({
      totalWorkedHours: 0,
      totalScheduledHours: 0,
      actualEarnings: 0,
      estimatedEarnings: 0,
      totalEstimatedEarnings: 0,
      tips: 0,
      totalPlannedHours: 0,
      completionPercentage: 0,
      averageHoursPerDay: 0,
      averageEarningsPerHour: 0,
      averageTipsPerDay: 0,
      averageTipsPerHour: 0,
      projectedTotalTips: 0,
      totalPotentialEarnings: 0,
      workedDaysCount: 0,
      scheduledDaysCount: 0
    })
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

        generateCalendarDays(response.data)
        calculateWeeklyBreakdown(response.data)
        calculateMonthlyStats(response.data)
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
        
        // Find all entries for this date and prioritize: worked > skipped > scheduled
        const dayEntries = data.filter(d => d.work_date === dateStr)
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
      const monthData = data.filter(d => d && d.work_date && d.work_date.startsWith(`${selectedYear.value}-${String(selectedMonth.value).padStart(2, '0')}`))
      
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
        
        // Calculate actual worked hours and earnings (only from worked days)
        const workedDays = weekData.filter(d => d.status === 'worked')
        const actualHours = workedDays.reduce((sum, d) => sum + Number(d.hours || 0), 0)
        const actualEarnings = workedDays.reduce((sum, d) => sum + Number(d.calculated_payment || 0), 0)
        const tips = workedDays.reduce((sum, d) => sum + Number(d.tips_amount || 0), 0)
        
        // Calculate scheduled hours (only from still-scheduled days, not worked days)
        const scheduledDays = weekData.filter(d => d.status === 'scheduled')
        const scheduledHours = scheduledDays.reduce((sum, d) => sum + Number(d.hours || 0), 0)
        
        // Total planned hours = worked hours + remaining scheduled hours
        const totalPlannedHours = actualHours + scheduledHours
        
        weeks.push({
          dateRange: `${format(currentWeekStart, 'MMM d')} - ${format(weekEnd, 'MMM d')}`,
          actualHours: actualHours.toFixed(1),
          scheduledHours: scheduledHours.toFixed(1),
          actualEarnings,
          tips,
          estimatedEarnings: (scheduledHours) * hourlyRate.value,
          completionRate: totalPlannedHours > 0 ? Math.round((actualHours / totalPlannedHours) * 100) : 0
        })
        
        currentWeekStart = new Date(currentWeekStart.getTime() + 7 * 24 * 60 * 60 * 1000)
        weekIndex++
      }
      
      weeklyBreakdown.value = weeks
    }
    
    // Calculate monthly statistics
    const calculateMonthlyStats = (data) => {
      const monthData = data.filter(d => d && d.work_date && d.work_date.startsWith(`${selectedYear.value}-${String(selectedMonth.value).padStart(2, '0')}`))
      
      // Calculate worked day totals
      const workedDays = monthData.filter(d => d.status === 'worked')
      const totalWorkedHours = workedDays.reduce((sum, d) => sum + Number(d.hours || 0), 0)
      const actualEarnings = workedDays.reduce((sum, d) => sum + Number(d.calculated_payment || 0), 0)
      const tips = workedDays.reduce((sum, d) => sum + Number(d.tips_amount || 0), 0)
      
      // Calculate scheduled day totals (remaining unworked)
      const scheduledDays = monthData.filter(d => d.status === 'scheduled')
      const totalScheduledHours = scheduledDays.reduce((sum, d) => sum + Number(d.hours || 0), 0)
      const estimatedEarnings = totalScheduledHours * hourlyRate.value
      
      // Total estimated earnings = actual base earnings + potential earnings from scheduled days (NO TIPS)
      const totalEstimatedEarnings = actualEarnings + estimatedEarnings
      
      // Calculate additional analytics
      const totalPlannedHours = totalWorkedHours + totalScheduledHours
      const completionPercentage = totalPlannedHours > 0 ? (totalWorkedHours / totalPlannedHours) * 100 : 0
      const averageHoursPerDay = workedDays.length > 0 ? totalWorkedHours / workedDays.length : 0
      const averageEarningsPerHour = totalWorkedHours > 0 ? actualEarnings / totalWorkedHours : hourlyRate.value
      const averageTipsPerDay = workedDays.length > 0 ? tips / workedDays.length : 0
      const averageTipsPerHour = totalWorkedHours > 0 ? tips / totalWorkedHours : 0
      const projectedTotalTips = totalPlannedHours > 0 && totalWorkedHours > 0 ? (tips / totalWorkedHours) * totalPlannedHours : 0
      const totalPotentialEarnings = totalEstimatedEarnings + projectedTotalTips
      
      // Ensure all values are numbers and not NaN
      monthlyStats.value = {
        totalWorkedHours: Number(totalWorkedHours) || 0,
        totalScheduledHours: Number(totalScheduledHours) || 0,
        actualEarnings: Number(actualEarnings) || 0,
        estimatedEarnings: Number(estimatedEarnings) || 0,
        totalEstimatedEarnings: Number(totalEstimatedEarnings) || 0,
        tips: Number(tips) || 0,
        totalPlannedHours: Number(totalPlannedHours) || 0,
        completionPercentage: Number(completionPercentage) || 0,
        averageHoursPerDay: Number(averageHoursPerDay) || 0,
        averageEarningsPerHour: Number(averageEarningsPerHour) || 0,
        averageTipsPerDay: Number(averageTipsPerDay) || 0,
        averageTipsPerHour: Number(averageTipsPerHour) || 0,
        projectedTotalTips: Number(projectedTotalTips) || 0,
        totalPotentialEarnings: Number(totalPotentialEarnings) || 0,
        workedDaysCount: Number(workedDays.length) || 0,
        scheduledDaysCount: Number(scheduledDays.length) || 0
      }
    }

    // Helper function for safe number formatting
    const safeToFixed = (value, decimals = 2) => {
      const num = Number(value)
      return isNaN(num) ? '0.00' : num.toFixed(decimals)
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
      monthlyStats,
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
      getStatusLabel,
      safeToFixed
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

/* Monthly Summary Cards */
.monthly-stat-card {
  background: linear-gradient(135deg, #ffffff, #f8fafc);
  border-radius: 0.75rem;
  padding: 1.25rem;
  border: 1px solid #e2e8f0;
  transition: all 0.3s ease;
  height: 100%;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.monthly-stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.1);
}

.monthly-stat-card.worked {
  border-left: 4px solid #10b981;
}

.monthly-stat-card.worked .stat-icon {
  color: #10b981;
}

.monthly-stat-card.scheduled {
  border-left: 4px solid #3b82f6;
}

.monthly-stat-card.scheduled .stat-icon {
  color: #3b82f6;
}

.monthly-stat-card.earnings {
  border-left: 4px solid #f59e0b;
}

.monthly-stat-card.earnings .stat-icon {
  color: #f59e0b;
}

.monthly-stat-card.total {
  border-left: 4px solid #8b5cf6;
}

.monthly-stat-card.total .stat-icon {
  color: #8b5cf6;
}

.stat-icon {
  font-size: 2rem;
  opacity: 0.8;
}

.stat-content {
  flex: 1;
}

.stat-label {
  font-size: 0.875rem;
  color: #6b7280;
  font-weight: 500;
  margin-bottom: 0.25rem;
}

.stat-value {
  font-size: 1.75rem;
  font-weight: 700;
  color: #1f2937;
  line-height: 1;
  margin-bottom: 0.25rem;
}

.stat-sublabel {
  font-size: 0.75rem;
  color: #9ca3af;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.progress-summary {
  background: #f8fafc;
  border-radius: 0.5rem;
  padding: 1rem;
  border: 1px solid #e2e8f0;
}

.progress-label {
  font-weight: 600;
  color: #374151;
}

.progress-percentage {
  font-weight: 700;
  color: #10b981;
  font-size: 1.1rem;
}

/* Enhanced Analytics Table */
.analytics-table-section {
  animation: fadeInUp 0.8s ease-out;
}

.analytics-table {
  margin-bottom: 0;
  font-size: 0.9rem;
}

.analytics-table th {
  font-weight: 600;
  color: #374151;
  border-bottom: 2px solid #e5e7eb;
  padding: 1rem 0.75rem;
}

.analytics-table td {
  padding: 0.875rem 0.75rem;
  vertical-align: middle;
  border-bottom: 1px solid #f3f4f6;
}

.metric-column {
  width: 25%;
  min-width: 200px;
}

.value-column, .pending-column, .total-column {
  width: 18%;
  text-align: center;
}

.performance-column {
  width: 21%;
  text-align: center;
}

.category-divider {
  background-color: #f8fafc;
}

.category-header {
  font-size: 0.875rem;
  font-weight: 700;
  color: #4b5563;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 0.75rem !important;
  border-top: 2px solid #e5e7eb;
  background: linear-gradient(135deg, #f8fafc, #f1f5f9);
}

.metric-name {
  font-weight: 500;
  color: #374151;
}

.current-value {
  font-weight: 600;
  color: #059669;
  font-size: 1rem;
}

.pending-value {
  font-weight: 500;
  color: #2563eb;
}

.total-value {
  font-weight: 600;
  color: #7c3aed;
}

.total-highlight {
  background: linear-gradient(135deg, #fef3c7, #fde68a);
  font-size: 1.1rem;
}

.performance-value {
  font-size: 0.875rem;
}

.highlight-row {
  background-color: #fffbeb;
  border-left: 4px solid #f59e0b;
}

.highlight-row td {
  padding: 1rem 0.75rem;
}

.progress-indicator {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  align-items: center;
}

.completion-indicator .progress {
  width: 100%;
  max-width: 100px;
}

.badge.bg-outline-warning {
  background-color: transparent !important;
  border: 1px solid #f59e0b;
  color: #f59e0b;
}

/* Responsive table */
@media (max-width: 768px) {
  .analytics-table {
    font-size: 0.8rem;
  }
  
  .analytics-table th,
  .analytics-table td {
    padding: 0.5rem 0.375rem;
  }
  
  .metric-column {
    min-width: 150px;
  }
  
  .badge {
    font-size: 0.7rem;
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.week-header {
  margin-bottom: 0.75rem;
  text-align: center;
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

/* Weekly Table Styles */
.weekly-earnings-section .weekly-table {
  font-size: 0.95rem;
}

.weekly-table thead th {
  border-bottom: 2px solid #dee2e6;
  vertical-align: middle;
  font-weight: 600;
  color: #495057;
  padding: 1rem 0.75rem;
}

.weekly-table .week-column {
  width: 10%;
  min-width: 80px;
}

.weekly-table .date-range-column {
  width: 15%;
  min-width: 120px;
}

.weekly-table .hours-column {
  width: 12%;
  min-width: 100px;
}

.weekly-table .earnings-column,
.weekly-table .tips-column {
  width: 12%;
  min-width: 110px;
}

.weekly-table .total-column {
  width: 14%;
  min-width: 120px;
}

.weekly-table .progress-column {
  width: 15%;
  min-width: 130px;
}

.weekly-row:hover {
  background-color: #f8f9fa;
}

.week-badge {
  display: inline-flex;
  align-items: center;
  padding: 0.4rem 0.8rem;
  background: linear-gradient(135deg, #6c5ce7, #a29bfe);
  color: white;
  border-radius: 25px;
  font-size: 0.85rem;
  font-weight: 600;
  box-shadow: 0 2px 4px rgba(108, 92, 231, 0.2);
}

.week-label {
  white-space: nowrap;
}

.date-text {
  color: #6c757d;
  font-weight: 500;
}

.metric-value {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.2rem;
}

.metric-value .value {
  font-weight: 600;
  font-size: 1rem;
  color: #2c3e50;
}

.metric-value .label {
  font-size: 0.75rem;
  color: #6c757d;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.metric-value.worked .value {
  color: #28a745;
}

.metric-value.scheduled .value {
  color: #17a2b8;
}

.metric-value.earnings .value {
  color: #007bff;
}

.metric-value.tips .value {
  color: #ffc107;
}

.metric-value.total .value {
  color: #6f42c1;
  font-size: 1.1rem;
}

.total-highlight {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-weight: 700;
}

.progress-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.3rem;
}

.weekly-progress {
  width: 100%;
  max-width: 100px;
  height: 8px;
  border-radius: 10px;
  overflow: hidden;
  background-color: #e9ecef;
}

.weekly-progress .progress-bar {
  border-radius: 10px;
  transition: width 0.6s ease;
}

.progress-details {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.1rem;
}

.progress-percentage {
  font-weight: 600;
  color: #28a745;
  font-size: 0.9rem;
}

.progress-label {
  font-size: 0.7rem;
  color: #6c757d;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.summary-row {
  background-color: #f8f9fa !important;
  border-top: 2px solid #dee2e6;
}

.summary-row td {
  padding: 1rem 0.75rem;
  font-weight: 600;
}

.summary-label {
  color: #495057;
  font-size: 1rem;
}

.summary-value {
  font-size: 1.1rem;
  color: #2c3e50;
}

.summary-value.worked {
  color: #28a745;
}

.summary-value.scheduled {
  color: #17a2b8;
}

.summary-value.earnings {
  color: #007bff;
}

.summary-value.tips {
  color: #ffc107;
}

.summary-progress .badge {
  font-size: 0.85rem;
  padding: 0.5rem 0.8rem;
}

/* Responsive adjustments for weekly table */
@media (max-width: 1200px) {
  .weekly-table {
    font-size: 0.85rem;
  }
  
  .metric-value .value {
    font-size: 0.9rem;
  }
  
  .metric-value .label {
    font-size: 0.7rem;
  }
}

@media (max-width: 768px) {
  .weekly-table thead th {
    padding: 0.75rem 0.5rem;
    font-size: 0.8rem;
  }
  
  .weekly-table td {
    padding: 0.75rem 0.5rem;
  }
  
  .week-badge {
    padding: 0.3rem 0.6rem;
    font-size: 0.75rem;
  }
  
  .metric-value .value {
    font-size: 0.8rem;
  }
  
  .metric-value .label {
    font-size: 0.65rem;
  }
  
  .weekly-progress {
    max-width: 80px;
    height: 6px;
  }
  
  .progress-percentage {
    font-size: 0.8rem;
  }
}
/* Compact Analytics Table Styles */
.compact-analytics-card {
  border-radius: 12px;
}
.compact-analytics-table {
  font-size: 0.92rem;
  border-radius: 8px;
  background: #fff;
}
.compact-analytics-table th,
.compact-analytics-table td {
  padding: 0.45rem 0.5rem;
  vertical-align: middle;
}
.compact-analytics-table th {
  background: #e9f0fa;
  font-weight: 600;
  color: #495057;
  border-bottom: 2px solid #dee2e6;
}
.compact-analytics-table .metric-col {
  width: 28%;
  min-width: 120px;
}
.compact-analytics-table .actual-col,
.compact-analytics-table .pending-col,
.compact-analytics-table .total-col,
.compact-analytics-table .perf-col {
  width: 18%;
  min-width: 80px;
}
.compact-analytics-table .badge {
  font-size: 0.85rem;
  padding: 0.35rem 0.7rem;
}
.compact-analytics-table .table-info td {
  background: #f3f8ff;
  font-weight: 600;
}
.compact-progress {
  background: #e9ecef;
  border-radius: 8px;
  height: 6px;
  overflow: hidden;
}
.compact-progress .progress-bar {
  border-radius: 8px;
  transition: width 0.5s;
}
@media (max-width: 900px) {
  .compact-analytics-table {
    font-size: 0.85rem;
  }
  .compact-analytics-table th,
  .compact-analytics-table td {
    padding: 0.3rem 0.3rem;
  }
}
</style>
