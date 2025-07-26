import { ref, reactive, computed } from 'vue'
import api from '@/services/api'

// Default theme configurations
const themes = {
  light: {
    name: 'Light',
    primary: '#4338ca',
    secondary: '#64748b',
    background: '#ffffff',
    surface: '#f8fafc',
    text: '#1e293b',
    accent: '#3b82f6'
  },
  dark: {
    name: 'Dark',
    primary: '#6366f1',
    secondary: '#94a3b8',
    background: '#0f172a',
    surface: '#1e293b',
    text: '#f1f5f9',
    accent: '#60a5fa'
  },
  corporate: {
    name: 'Corporate',
    primary: '#1f2937',
    secondary: '#6b7280',
    background: '#ffffff',
    surface: '#f9fafb',
    text: '#111827',
    accent: '#059669'
  },
  modern: {
    name: 'Modern',
    primary: '#7c3aed',
    secondary: '#a78bfa',
    background: '#fafafa',
    surface: '#ffffff',
    text: '#18181b',
    accent: '#f59e0b'
  }
}

// Widget size configurations
const widgetSizes = {
  small: { width: 1, height: 1, class: 'widget-small' },
  medium: { width: 2, height: 1, class: 'widget-medium' },
  large: { width: 3, height: 2, class: 'widget-large' }
}

// Layout configurations
const layouts = {
  grid: { name: 'Grid Layout', columns: 12, gap: '1rem' },
  list: { name: 'List Layout', columns: 1, gap: '0.5rem' },
  compact: { name: 'Compact Layout', columns: 6, gap: '0.25rem' },
  minimal: { name: 'Minimal Layout', columns: 2, gap: '2rem' }
}

// State
const dashboardSettings = ref({
  layout_type: 'grid',
  theme: 'light',
  primary_color: '#4338ca',
  secondary_color: '#64748b',
  show_goals: true,
  show_stats: true,
  show_schedule: true,
  show_recent_work: true,
  show_expenses: true,
  widget_order: ['goals', 'stats', 'schedule', 'work', 'expenses'],
  goals_widget_size: 'large',
  stats_widget_size: 'medium',
  schedule_widget_size: 'medium',
  work_widget_size: 'medium',
  expenses_widget_size: 'small'
})

const customFields = ref([])
const userPreferences = ref({})
const dashboardWidgets = ref([])
const loading = ref(false)

// Computed
const currentTheme = computed(() => {
  const themeName = dashboardSettings.value.theme
  return {
    ...themes[themeName],
    primary: dashboardSettings.value.primary_color || themes[themeName].primary,
    secondary: dashboardSettings.value.secondary_color || themes[themeName].secondary
  }
})

const visibleWidgets = computed(() => {
  const settings = dashboardSettings.value
  const widgets = []
  
  if (settings.show_goals) {
    widgets.push({
      type: 'goals',
      size: settings.goals_widget_size,
      order: settings.widget_order.indexOf('goals')
    })
  }
  
  if (settings.show_stats) {
    widgets.push({
      type: 'stats',
      size: settings.stats_widget_size,
      order: settings.widget_order.indexOf('stats')
    })
  }
  
  if (settings.show_schedule) {
    widgets.push({
      type: 'schedule',
      size: settings.schedule_widget_size,
      order: settings.widget_order.indexOf('schedule')
    })
  }
  
  if (settings.show_recent_work) {
    widgets.push({
      type: 'work',
      size: settings.work_widget_size,
      order: settings.widget_order.indexOf('work')
    })
  }
  
  if (settings.show_expenses) {
    widgets.push({
      type: 'expenses',
      size: settings.expenses_widget_size,
      order: settings.widget_order.indexOf('expenses')
    })
  }
  
  return widgets.sort((a, b) => a.order - b.order)
})

const currentLayout = computed(() => layouts[dashboardSettings.value.layout_type])

// Methods
const loadDashboardSettings = async () => {
  loading.value = true
  try {
    const response = await api.get('/customization/dashboard-settings')
    dashboardSettings.value = {
      ...dashboardSettings.value,
      ...response.data
    }
    
    // Parse widget_order if it's a string
    if (typeof dashboardSettings.value.widget_order === 'string') {
      dashboardSettings.value.widget_order = JSON.parse(dashboardSettings.value.widget_order)
    }
  } catch (error) {
    console.error('Error loading dashboard settings:', error)
  } finally {
    loading.value = false
  }
}

const saveDashboardSettings = async (settings) => {
  try {
    await api.put('/customization/dashboard-settings', settings)
    dashboardSettings.value = { ...dashboardSettings.value, ...settings }
    applyTheme()
    return { success: true }
  } catch (error) {
    console.error('Error saving dashboard settings:', error)
    return { success: false, error: error.message }
  }
}

const loadCustomFields = async (appliesTo = 'work') => {
  try {
    const response = await api.get(`/customization/custom-fields?applies_to=${appliesTo}`)
    customFields.value = response.data
  } catch (error) {
    console.error('Error loading custom fields:', error)
  }
}

const saveCustomField = async (field) => {
  try {
    if (field.id) {
      await api.put(`/customization/custom-fields/${field.id}`, field)
    } else {
      const response = await api.post('/customization/custom-fields', field)
      field.id = response.data.id
    }
    await loadCustomFields(field.applies_to)
    return { success: true }
  } catch (error) {
    console.error('Error saving custom field:', error)
    return { success: false, error: error.message }
  }
}

const deleteCustomField = async (fieldId) => {
  try {
    await api.delete(`/customization/custom-fields/${fieldId}`)
    customFields.value = customFields.value.filter(f => f.id !== fieldId)
    return { success: true }
  } catch (error) {
    console.error('Error deleting custom field:', error)
    return { success: false, error: error.message }
  }
}

const loadUserPreferences = async () => {
  try {
    const response = await api.get('/customization/preferences')
    userPreferences.value = response.data
  } catch (error) {
    console.error('Error loading user preferences:', error)
  }
}

const saveUserPreference = async (key, value) => {
  try {
    await api.post('/customization/preferences', {
      preference_key: key,
      preference_value: value
    })
    userPreferences.value[key] = value
    return { success: true }
  } catch (error) {
    console.error('Error saving user preference:', error)
    return { success: false, error: error.message }
  }
}

const applyTheme = () => {
  const theme = currentTheme.value
  const root = document.documentElement
  
  // Apply CSS custom properties
  root.style.setProperty('--theme-primary', theme.primary)
  root.style.setProperty('--theme-secondary', theme.secondary)
  root.style.setProperty('--theme-background', theme.background)
  root.style.setProperty('--theme-surface', theme.surface)
  root.style.setProperty('--theme-text', theme.text)
  root.style.setProperty('--theme-accent', theme.accent)
  
  // Apply body class for theme
  document.body.className = document.body.className.replace(/theme-\w+/g, '')
  document.body.classList.add(`theme-${dashboardSettings.value.theme}`)
}

const resetToDefaults = async () => {
  const defaultSettings = {
    layout_type: 'grid',
    theme: 'light',
    primary_color: '#4338ca',
    secondary_color: '#64748b',
    show_goals: true,
    show_stats: true,
    show_schedule: true,
    show_recent_work: true,
    show_expenses: true,
    widget_order: ['goals', 'stats', 'schedule', 'work', 'expenses'],
    goals_widget_size: 'large',
    stats_widget_size: 'medium',
    schedule_widget_size: 'medium',
    work_widget_size: 'medium',
    expenses_widget_size: 'small'
  }
  
  return await saveDashboardSettings(defaultSettings)
}

// Initialize
const init = async () => {
  await Promise.all([
    loadDashboardSettings(),
    loadCustomFields(),
    loadUserPreferences()
  ])
  applyTheme()
}

export const customizationStore = () => {
  return {
    // State
    dashboardSettings,
    customFields,
    userPreferences,
    dashboardWidgets,
    loading,
    
    // Computed
    currentTheme,
    visibleWidgets,
    currentLayout,
    
    // Constants
    themes,
    widgetSizes,
    layouts,
    
    // Methods
    loadDashboardSettings,
    saveDashboardSettings,
    loadCustomFields,
    saveCustomField,
    deleteCustomField,
    loadUserPreferences,
    saveUserPreference,
    applyTheme,
    resetToDefaults,
    init
  }
}
