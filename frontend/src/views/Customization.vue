<template>
  <div class="customization-page">
    <!-- Header -->
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h1 class="h3 mb-0">Dashboard Customization</h1>
        <p class="text-muted mb-0">Personalize your workspace to fit your needs</p>
      </div>
      <div class="d-flex gap-2">
        <button class="btn btn-outline-secondary" @click="resetToDefaults"
                title="Reset all customization settings to their default values">
          <i class="bi bi-arrow-clockwise me-2"></i>Reset to Defaults
        </button>
        <button class="btn btn-primary" @click="saveSettings" :disabled="saving"
                title="Save your current customization settings">
          <span v-if="saving" class="spinner-border spinner-border-sm me-2"></span>
          <i v-else class="bi bi-check-circle me-2"></i>
          {{ saving ? 'Saving...' : 'Save Changes' }}
        </button>
      </div>
    </div>

    <!-- Customization Tabs -->
    <div class="card">
      <div class="card-header">
        <ul class="nav nav-tabs card-header-tabs" role="tablist">
          <li class="nav-item">
            <button class="nav-link" :class="{ active: activeTab === 'appearance' }" 
                    @click="activeTab = 'appearance'">
              <i class="bi bi-palette me-2"></i>Appearance
            </button>
          </li>
          <li class="nav-item">
            <button class="nav-link" :class="{ active: activeTab === 'layout' }" 
                    @click="activeTab = 'layout'">
              <i class="bi bi-grid me-2"></i>Layout
            </button>
          </li>
          <li class="nav-item">
            <button class="nav-link" :class="{ active: activeTab === 'widgets' }" 
                    @click="activeTab = 'widgets'">
              <i class="bi bi-window me-2"></i>Widgets
            </button>
          </li>
          <li class="nav-item">
            <button class="nav-link" :class="{ active: activeTab === 'fields' }" 
                    @click="activeTab = 'fields'">
              <i class="bi bi-plus-square me-2"></i>Custom Fields
            </button>
          </li>
        </ul>
      </div>
      
      <div class="card-body">
        <!-- Appearance Tab -->
        <div v-show="activeTab === 'appearance'" class="tab-content">
          <h5 class="mb-3">Theme & Colors</h5>
          
          <!-- Theme Selection -->
          <div class="row mb-4">
            <div class="col-md-6">
              <label class="form-label">Theme</label>
              <div class="theme-selector">
                <div v-for="(theme, key) in themes" :key="key" 
                     class="theme-option" 
                     :class="{ active: settings.theme === key }"
                     @click="settings.theme = key">
                  <div class="theme-preview" :style="{ 
                    backgroundColor: theme.background,
                    color: theme.text,
                    borderColor: theme.primary
                  }">
                    <div class="theme-header" :style="{ backgroundColor: theme.primary }"></div>
                    <div class="theme-content">
                      <div class="theme-accent" :style="{ backgroundColor: theme.accent }"></div>
                    </div>
                  </div>
                  <span class="theme-name">{{ theme.name }}</span>
                </div>
              </div>
            </div>
            
            <div class="col-md-6">
              <label class="form-label">Custom Colors</label>
              <div class="row">
                <div class="col-6">
                  <label class="form-label small">Primary Color</label>
                  <input v-model="settings.primary_color" type="color" class="form-control form-control-color">
                </div>
                <div class="col-6">
                  <label class="form-label small">Secondary Color</label>
                  <input v-model="settings.secondary_color" type="color" class="form-control form-control-color">
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Layout Tab -->
        <div v-show="activeTab === 'layout'" class="tab-content">
          <h5 class="mb-3">Dashboard Layout</h5>
          
          <div class="row mb-4">
            <div class="col-md-8">
              <label class="form-label">Layout Type</label>
              <div class="layout-selector">
                <div v-for="(layout, key) in layouts" :key="key"
                     class="layout-option"
                     :class="{ active: settings.layout_type === key }"
                     @click="settings.layout_type = key">
                  <div class="layout-preview" :class="`layout-${key}`">
                    <div class="layout-grid" 
                         :style="{ gridTemplateColumns: `repeat(${Math.min(layout.columns, 4)}, 1fr)` }">
                      <div v-for="i in Math.min(layout.columns, 8)" :key="i" class="layout-cell"></div>
                    </div>
                  </div>
                  <span class="layout-name">{{ layout.name }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Widgets Tab -->
        <div v-show="activeTab === 'widgets'" class="tab-content">
          <h5 class="mb-3">Widget Configuration</h5>
          
          <!-- Widget Visibility -->
          <div class="mb-4">
            <h6>Widget Visibility</h6>
            <div class="row">
              <div class="col-md-6">
                <div class="form-check form-switch mb-2">
                  <input v-model="settings.show_goals" class="form-check-input" type="checkbox" id="showGoals">
                  <label class="form-check-label" for="showGoals">
                    <i class="bi bi-flag me-2"></i>Goals Widget
                  </label>
                </div>
                <div class="form-check form-switch mb-2">
                  <input v-model="settings.show_stats" class="form-check-input" type="checkbox" id="showStats">
                  <label class="form-check-label" for="showStats">
                    <i class="bi bi-graph-up me-2"></i>Statistics Widget
                  </label>
                </div>
                <div class="form-check form-switch mb-2">
                  <input v-model="settings.show_schedule" class="form-check-input" type="checkbox" id="showSchedule">
                  <label class="form-check-label" for="showSchedule">
                    <i class="bi bi-calendar me-2"></i>Schedule Widget
                  </label>
                </div>
              </div>
              <div class="col-md-6">
                <div class="form-check form-switch mb-2">
                  <input v-model="settings.show_recent_work" class="form-check-input" type="checkbox" id="showWork">
                  <label class="form-check-label" for="showWork">
                    <i class="bi bi-briefcase me-2"></i>Recent Work Widget
                  </label>
                </div>
                <div class="form-check form-switch mb-2">
                  <input v-model="settings.show_expenses" class="form-check-input" type="checkbox" id="showExpenses">
                  <label class="form-check-label" for="showExpenses">
                    <i class="bi bi-receipt me-2"></i>Expenses Widget
                  </label>
                </div>
              </div>
            </div>
          </div>

          <!-- Widget Sizes -->
          <div class="mb-4">
            <h6>Widget Sizes</h6>
            <div class="row">
              <div class="col-md-6">
                <div v-if="settings.show_goals" class="mb-3">
                  <label class="form-label">Goals Widget Size</label>
                  <select v-model="settings.goals_widget_size" class="form-select">
                    <option value="small">Small</option>
                    <option value="medium">Medium</option>
                    <option value="large">Large</option>
                  </select>
                </div>
                <div v-if="settings.show_stats" class="mb-3">
                  <label class="form-label">Statistics Widget Size</label>
                  <select v-model="settings.stats_widget_size" class="form-select">
                    <option value="small">Small</option>
                    <option value="medium">Medium</option>
                    <option value="large">Large</option>
                  </select>
                </div>
                <div v-if="settings.show_schedule" class="mb-3">
                  <label class="form-label">Schedule Widget Size</label>
                  <select v-model="settings.schedule_widget_size" class="form-select">
                    <option value="small">Small</option>
                    <option value="medium">Medium</option>
                    <option value="large">Large</option>
                  </select>
                </div>
              </div>
              <div class="col-md-6">
                <div v-if="settings.show_recent_work" class="mb-3">
                  <label class="form-label">Recent Work Widget Size</label>
                  <select v-model="settings.work_widget_size" class="form-select">
                    <option value="small">Small</option>
                    <option value="medium">Medium</option>
                    <option value="large">Large</option>
                  </select>
                </div>
                <div v-if="settings.show_expenses" class="mb-3">
                  <label class="form-label">Expenses Widget Size</label>
                  <select v-model="settings.expenses_widget_size" class="form-select">
                    <option value="small">Small</option>
                    <option value="medium">Medium</option>
                    <option value="large">Large</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <!-- Widget Order -->
          <div class="mb-4">
            <h6>Widget Order</h6>
            <p class="text-muted small">Drag to reorder widgets on your dashboard</p>
            <div class="widget-order-list">
              <draggable v-model="settings.widget_order" 
                        :animation="200" 
                        ghost-class="sortable-ghost"
                        class="sortable-list">
                <template #item="{ element }">
                  <div class="widget-order-item">
                    <i class="bi bi-grip-vertical handle me-2"></i>
                    <i :class="getWidgetIcon(element)" class="me-2"></i>
                    {{ getWidgetName(element) }}
                  </div>
                </template>
              </draggable>
            </div>
          </div>
        </div>

        <!-- Custom Fields Tab -->
        <div v-show="activeTab === 'fields'" class="tab-content">
          <div class="d-flex justify-content-between align-items-center mb-3">
            <h5 class="mb-0">Custom Fields</h5>
            <button class="btn btn-primary btn-sm" @click="showAddFieldModal = true">
              <i class="bi bi-plus me-2"></i>Add Field
            </button>
          </div>

          <!-- Custom Fields List -->
          <div v-if="customFields.length === 0" class="text-center py-4">
            <i class="bi bi-plus-square-dotted display-4 text-muted"></i>
            <p class="text-muted mt-2">No custom fields created yet</p>
            <button class="btn btn-outline-primary" @click="showAddFieldModal = true">
              Create Your First Custom Field
            </button>
          </div>

          <div v-else class="custom-fields-list">
            <div v-for="field in customFields" :key="field.id" class="custom-field-item">
              <div class="d-flex justify-content-between align-items-center">
                <div>
                  <h6 class="mb-1">{{ field.field_label }}</h6>
                  <div class="d-flex gap-2">
                    <span class="badge badge-secondary">{{ field.field_type }}</span>
                    <span class="badge badge-outline">{{ field.applies_to }}</span>
                    <span v-if="field.is_required" class="badge badge-warning">Required</span>
                  </div>
                </div>
                <div class="dropdown">
                  <button class="btn btn-sm btn-outline-secondary dropdown-toggle" data-bs-toggle="dropdown">
                    <i class="bi bi-three-dots"></i>
                  </button>
                  <ul class="dropdown-menu">
                    <li><a class="dropdown-item" href="#" @click="editCustomField(field)">Edit</a></li>
                    <li><a class="dropdown-item text-danger" href="#" @click="deleteField(field.id)">Delete</a></li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Add/Edit Custom Field Modal -->
    <div class="modal fade" tabindex="-1" :class="{ show: showAddFieldModal }" style="display: block;" v-if="showAddFieldModal">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ editingField ? 'Edit' : 'Add' }} Custom Field</h5>
            <button type="button" class="btn-close" @click="closeFieldModal"></button>
          </div>
          <form @submit.prevent="saveCustomField">
            <div class="modal-body">
              <div class="mb-3">
                <label class="form-label">Field Name</label>
                <input v-model="fieldForm.field_name" type="text" class="form-control" required>
                <div class="form-text">Internal name (no spaces, lowercase)</div>
              </div>
              
              <div class="mb-3">
                <label class="form-label">Display Label</label>
                <input v-model="fieldForm.field_label" type="text" class="form-control" required>
              </div>

              <div class="mb-3">
                <label class="form-label">Field Type</label>
                <select v-model="fieldForm.field_type" class="form-select" required>
                  <option value="text">Text</option>
                  <option value="number">Number</option>
                  <option value="date">Date</option>
                  <option value="select">Select Dropdown</option>
                  <option value="textarea">Text Area</option>
                  <option value="checkbox">Checkbox</option>
                  <option value="url">URL</option>
                  <option value="email">Email</option>
                </select>
              </div>

              <div v-if="fieldForm.field_type === 'select'" class="mb-3">
                <label class="form-label">Options</label>
                <div v-for="(option, index) in fieldForm.field_options" :key="index" class="d-flex mb-2">
                  <input v-model="fieldForm.field_options[index]" type="text" class="form-control me-2" placeholder="Option">
                  <button type="button" class="btn btn-outline-danger btn-sm" @click="removeOption(index)">
                    <i class="bi bi-trash"></i>
                  </button>
                </div>
                <button type="button" class="btn btn-outline-primary btn-sm" @click="addOption">
                  <i class="bi bi-plus me-1"></i>Add Option
                </button>
              </div>

              <div class="mb-3">
                <label class="form-label">Applies To</label>
                <select v-model="fieldForm.applies_to" class="form-select" required>
                  <option value="work">Work Entries</option>
                  <option value="expense">Expenses</option>
                  <option value="goal">Goals</option>
                </select>
              </div>

              <div class="form-check">
                <input v-model="fieldForm.is_required" class="form-check-input" type="checkbox" id="fieldRequired">
                <label class="form-check-label" for="fieldRequired">
                  Required field
                </label>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" @click="closeFieldModal">Cancel</button>
              <button type="submit" class="btn btn-primary" :disabled="fieldSaving">
                <span v-if="fieldSaving" class="spinner-border spinner-border-sm me-2"></span>
                {{ fieldSaving ? 'Saving...' : (editingField ? 'Update' : 'Create') }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, onMounted, watch } from 'vue'
import { useToast } from 'vue-toastification'
import { customizationStore } from '@/stores/customization'
import draggable from 'vuedraggable'

export default {
  name: 'Customization',
  components: {
    draggable
  },
  setup() {
    const toast = useToast()
    const store = customizationStore()
    
    const activeTab = ref('appearance')
    const saving = ref(false)
    const showAddFieldModal = ref(false)
    const editingField = ref(null)
    const fieldSaving = ref(false)
    
    // Local copy of settings for editing
    const settings = reactive({
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

    const fieldForm = reactive({
      field_name: '',
      field_label: '',
      field_type: 'text',
      field_options: [],
      applies_to: 'work',
      is_required: false
    })

    // Copy store settings to local settings
    watch(() => store.dashboardSettings.value, (newSettings) => {
      Object.assign(settings, newSettings)
    }, { immediate: true, deep: true })

    const saveSettings = async () => {
      saving.value = true
      try {
        const result = await store.saveDashboardSettings(settings)
        if (result.success) {
          toast.success('Settings saved successfully!')
        } else {
          toast.error('Failed to save settings')
        }
      } catch (error) {
        toast.error('Failed to save settings')
      } finally {
        saving.value = false
      }
    }

    const resetToDefaults = async () => {
      if (confirm('Are you sure you want to reset all settings to defaults?')) {
        const result = await store.resetToDefaults()
        if (result.success) {
          toast.success('Settings reset to defaults')
        } else {
          toast.error('Failed to reset settings')
        }
      }
    }

    const getWidgetIcon = (widget) => {
      const icons = {
        goals: 'bi-flag',
        stats: 'bi-graph-up',
        schedule: 'bi-calendar',
        work: 'bi-briefcase',
        expenses: 'bi-receipt'
      }
      return icons[widget] || 'bi-window'
    }

    const getWidgetName = (widget) => {
      const names = {
        goals: 'Goals',
        stats: 'Statistics',
        schedule: 'Schedule',
        work: 'Recent Work',
        expenses: 'Expenses'
      }
      return names[widget] || widget
    }

    const editCustomField = (field) => {
      editingField.value = field
      Object.assign(fieldForm, {
        ...field,
        field_options: field.field_options ? JSON.parse(field.field_options) : []
      })
      showAddFieldModal.value = true
    }

    const closeFieldModal = () => {
      showAddFieldModal.value = false
      editingField.value = null
      Object.assign(fieldForm, {
        field_name: '',
        field_label: '',
        field_type: 'text',
        field_options: [],
        applies_to: 'work',
        is_required: false
      })
    }

    const addOption = () => {
      fieldForm.field_options.push('')
    }

    const removeOption = (index) => {
      fieldForm.field_options.splice(index, 1)
    }

    const saveCustomField = async () => {
      fieldSaving.value = true
      try {
        const fieldData = { ...fieldForm }
        if (editingField.value) {
          fieldData.id = editingField.value.id
        }
        
        const result = await store.saveCustomField(fieldData)
        if (result.success) {
          toast.success('Custom field saved successfully!')
          closeFieldModal()
        } else {
          toast.error('Failed to save custom field')
        }
      } catch (error) {
        toast.error('Failed to save custom field')
      } finally {
        fieldSaving.value = false
      }
    }

    const deleteField = async (fieldId) => {
      if (confirm('Are you sure you want to delete this custom field?')) {
        const result = await store.deleteCustomField(fieldId)
        if (result.success) {
          toast.success('Custom field deleted successfully!')
        } else {
          toast.error('Failed to delete custom field')
        }
      }
    }

    onMounted(() => {
      store.init()
    })

    return {
      activeTab,
      saving,
      settings,
      showAddFieldModal,
      editingField,
      fieldForm,
      fieldSaving,
      
      // Store
      themes: store.themes,
      layouts: store.layouts,
      customFields: store.customFields,
      
      // Methods
      saveSettings,
      resetToDefaults,
      getWidgetIcon,
      getWidgetName,
      editCustomField,
      closeFieldModal,
      addOption,
      removeOption,
      saveCustomField,
      deleteField
    }
  }
}
</script>

<style scoped>
/* Theme selector styles */
.theme-selector {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 1rem;
}

.theme-option {
  cursor: pointer;
  text-align: center;
  transition: transform 0.2s;
}

.theme-option:hover {
  transform: translateY(-2px);
}

.theme-option.active .theme-preview {
  border-width: 3px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.theme-preview {
  width: 100%;
  height: 80px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  overflow: hidden;
  position: relative;
}

.theme-header {
  height: 20px;
  width: 100%;
}

.theme-content {
  padding: 8px;
  height: 60px;
  position: relative;
}

.theme-accent {
  width: 30px;
  height: 8px;
  border-radius: 4px;
}

.theme-name {
  display: block;
  margin-top: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  color: #000000;
}

/* Layout selector styles */
.layout-selector {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 1rem;
}

.layout-option {
  cursor: pointer;
  text-align: center;
  transition: transform 0.2s;
}

.layout-option:hover {
  transform: translateY(-2px);
}

.layout-option.active .layout-preview {
  border-color: var(--bs-primary);
  border-width: 3px;
}

.layout-preview {
  width: 100%;
  height: 80px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  padding: 8px;
  background: #f8fafc;
}

.layout-grid {
  display: grid;
  gap: 4px;
  height: 100%;
}

.layout-cell {
  background: #cbd5e1;
  border-radius: 2px;
  min-height: 8px;
}

.layout-name {
  display: block;
  margin-top: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  color: #000000;
}

/* Widget order styles */
.widget-order-list {
  max-width: 400px;
}

.sortable-list {
  list-style: none;
  padding: 0;
}

.widget-order-item {
  display: flex;
  align-items: center;
  padding: 12px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  margin-bottom: 8px;
  cursor: move;
  transition: all 0.2s;
}

.widget-order-item:hover {
  background: #f1f5f9;
  border-color: #cbd5e1;
}

.sortable-ghost {
  opacity: 0.5;
  background: #e2e8f0;
}

.handle {
  color: #000000;
  cursor: grab;
}

.handle:active {
  cursor: grabbing;
}

/* Navigation tabs */
.nav-link {
  color: #000000 !important;
}

.nav-link.active {
  color: #000000 !important;
}

/* Form labels */
.form-label,
.form-check-label {
  color: #000000 !important;
}

/* Form inputs and selects */
.form-select,
.form-select option {
  color: #000000 !important;
}

/* Tab content headings */
.tab-content h5,
.tab-content h6 {
  color: #000000 !important;
}

/* Modal labels and text */
.modal-body .form-label,
.modal-title {
  color: #000000 !important;
}

/* Dropdown items */
.dropdown-item {
  color: #000000 !important;
}

/* Button text */
.btn {
  color: #000000 !important;
}

.btn-primary {
  color: #ffffff !important;
}

/* Widget order item text */
.widget-order-item {
  color: #000000 !important;
}

/* Custom fields styles */
.custom-fields-list {
  max-width: 600px;
}

.custom-field-item {
  padding: 16px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  margin-bottom: 12px;
  background: #ffffff;
}

.custom-field-item:hover {
  border-color: #cbd5e1;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

/* Badge styles */
.badge-outline {
  border: 1px solid #cbd5e1;
  background: transparent;
  color: #000000;
}

/* Modal backdrop */
.modal {
  background-color: rgba(0, 0, 0, 0.5);
}

.modal.show {
  display: block !important;
}

/* Responsive */
@media (max-width: 768px) {
  .theme-selector,
  .layout-selector {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .widget-order-list {
    max-width: 100%;
  }
}
</style>
