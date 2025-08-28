<template>
  <div class="container py-4">
    <h1 class="h3 mb-4">Customization</h1>

    <div class="row g-4">
      <div class="col-lg-6">
        <div class="card">
          <div class="card-header"><strong>Theme</strong></div>
          <div class="card-body">
            <div class="row g-3">
              <div class="col-6" v-for="(val, key) in currentTheme" :key="key">
                <label class="form-label text-capitalize">{{ key }}</label>
                <input type="color" class="form-control form-control-color w-100" :value="val" @input="onThemeChange(key, $event.target.value)">
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="col-lg-6">
        <div class="card">
          <div class="card-header"><strong>Dashboard Layout</strong></div>
          <div class="card-body">
            <div class="mb-3">
              <label class="form-label">Layout Type</label>
              <select class="form-select" :value="currentLayout.name" @change="onLayoutChange({ name: $event.target.value })">
                <option>Grid</option>
                <option>Masonry</option>
              </select>
            </div>
            <div class="row g-3">
              <div class="col-6">
                <label class="form-label">Columns</label>
                <input type="number" min="1" max="24" class="form-control" :value="currentLayout.columns" @input="onLayoutChange({ columns: +$event.target.value })">
              </div>
              <div class="col-6">
                <label class="form-label">Gutter (px)</label>
                <input type="number" min="0" max="64" class="form-control" :value="currentLayout.gutter" @input="onLayoutChange({ gutter: +$event.target.value })">
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="col-12">
        <div class="card">
          <div class="card-header"><strong>Dashboard Widgets</strong></div>
          <div class="card-body">
            <div class="row g-3">
              <div class="col-md-3" v-for="(val, key) in widgetToggles" :key="key">
                <div class="form-check form-switch">
                  <input class="form-check-input" type="checkbox" :checked="val" @change="onWidgetToggle(key, $event.target.checked)">
                  <label class="form-check-label text-capitalize">{{ key.replace('show_', '').replace('_', ' ') }}</label>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  
</template><script>
import { customizationStore } from '@/stores/customization'

export default {
  name: 'Customization',
  setup () {
    const { currentTheme, currentLayout, dashboardSettings, setTheme, setLayout, updateDashboardSettings } = customizationStore()

    const onThemeChange = (key, value) => setTheme({ [key]: value })
    const onLayoutChange = (partial) => setLayout(partial)
    const onWidgetToggle = (key, value) => updateDashboardSettings({ [key]: value })

    const widgetToggles = {
      show_goals: dashboardSettings.value.show_goals,
      show_stats: dashboardSettings.value.show_stats,
      show_schedule: dashboardSettings.value.show_schedule,
      show_recent_work: dashboardSettings.value.show_recent_work,
      show_expenses: dashboardSettings.value.show_expenses
    }

    return { currentTheme, currentLayout, dashboardSettings, onThemeChange, onLayoutChange, onWidgetToggle, widgetToggles }
  }
}
</script>
