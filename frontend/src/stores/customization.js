import { ref, watch } from 'vue'

// Storage helpers
const load = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch (_) {
    return fallback
  }
}
const save = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (_) {
    // no-op
  }
}

// Defaults
const defaultTheme = {
  primary: '#4338ca',
  accent: '#3b82f6',
  background: '#0f172a',
  surface: '#111827',
  text: '#e5e7eb',
  success: '#22c55e',
  warning: '#f59e0b',
  danger: '#ef4444'
}

const defaultLayout = {
  name: 'Grid',
  columns: 12,
  gutter: 16
}

const defaultDashboardSettings = {
  layout_type: 'grid',
  // widget visibility
  show_goals: true,
  show_stats: true,
  show_schedule: true,
  show_recent_work: true,
  show_expenses: true,
  // widget sizes
  goals_widget_size: 'large',
  stats_widget_size: 'medium',
  schedule_widget_size: 'medium',
  work_widget_size: 'medium',
  expenses_widget_size: 'small'
}

// Singleton refs (shared across app like a simple store)
const currentTheme = ref(load('customization:theme', defaultTheme))
const currentLayout = ref(load('customization:layout', defaultLayout))
const dashboardSettings = ref(load('customization:dashboardSettings', defaultDashboardSettings))

// Persist on change
watch(currentTheme, (v) => save('customization:theme', v), { deep: true })
watch(currentLayout, (v) => save('customization:layout', v), { deep: true })
watch(dashboardSettings, (v) => save('customization:dashboardSettings', v), { deep: true })

export function customizationStore () {
  const setTheme = (theme) => {
    currentTheme.value = { ...currentTheme.value, ...theme }
  }

  const setLayout = (layout) => {
    currentLayout.value = { ...currentLayout.value, ...layout }
  }

  const updateDashboardSettings = (partial) => {
    dashboardSettings.value = { ...dashboardSettings.value, ...partial }
  }

  const resetCustomization = () => {
    currentTheme.value = { ...defaultTheme }
    currentLayout.value = { ...defaultLayout }
    dashboardSettings.value = { ...defaultDashboardSettings }
  }

  return {
    // Refs used directly in templates as `.value`
    currentTheme,
    currentLayout,
    dashboardSettings,
    // actions
    setTheme,
    setLayout,
    updateDashboardSettings,
    resetCustomization
  }
}
