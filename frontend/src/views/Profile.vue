<template>
  <div class="page-content profile-page">
    <h1 class="h3 mb-4">Profile Settings</h1>
    <div class="profile-main-row">
      <div class="profile-main-col">
        <div class="card">
          <div class="card-header">
            <h5 class="mb-0">User Information</h5>
          </div>
          <div class="card-body">
            <form @submit.prevent="updateProfile">
              <div class="profile-form-row">
                <div class="profile-form-col">
                  <label class="form-label">Username</label>
                  <input
                    type="text"
                    class="form-control"
                    v-model="profileForm.username"
                    readonly
                  >
                  <small class="text-muted">Username cannot be changed</small>
                </div>
                <div class="profile-form-col">
                  <label class="form-label">Email</label>
                  <input
                    type="email"
                    class="form-control"
                    v-model="profileForm.email"
                    readonly
                  >
                  <small class="text-muted">Email cannot be changed</small>
                </div>
              </div>
              <div class="profile-form-row">
                <div class="profile-form-col">
                  <label class="form-label">Hourly Rate ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    class="form-control"
                    v-model="profileForm.hourlyRate"
                    required
                  >
                  <small class="text-muted">Your current hourly wage</small>
                </div>
                <div class="profile-form-col">
                  <label class="form-label">Member Since</label>
                  <input
                    type="text"
                    class="form-control"
                    :value="formatDate(user?.created_at)"
                    readonly
                  >
                </div>
              </div>
              <div class="text-end">
                <button type="submit" class="btn btn-primary" :disabled="updating">
                  <span v-if="updating" class="loading me-2"></span>
                  {{ updating ? 'Updating...' : 'Update Profile' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      <div class="profile-side-col">
        <div class="card">
          <div class="card-header">
            <h5 class="mb-0">Account Summary</h5>
          </div>
          <div class="card-body">
            <div class="text-center mb-4">
              <div class="bg-primary rounded-circle d-inline-flex align-items-center justify-content-center"
                   style="width: 80px; height: 80px;">
                <i class="bi bi-person-circle text-white" style="font-size: 3rem;"></i>
              </div>
              <h5 class="mt-3 mb-1">{{ user?.username }}</h5>
              <p class="text-muted mb-0">{{ user?.email }}</p>
            </div>
            <div class="mb-3">
              <div class="d-flex justify-content-between">
                <span>Current Hourly Rate:</span>
                <strong class="text-success">${{ user?.hourlyRate }}</strong>
              </div>
            </div>
            <div class="mb-3">
              <div class="d-flex justify-content-between">
                <span>Total Work Days:</span>
                <strong>{{ stats.totalWorkDays }}</strong>
              </div>
            </div>
            <div class="mb-3">
              <div class="d-flex justify-content-between">
                <span>Total Hours Worked:</span>
                <strong>{{ stats.totalHours }}h</strong>
              </div>
            </div>
            <div class="mb-0">
              <div class="d-flex justify-content-between">
                <span>Total Earnings:</span>
                <strong class="text-success">${{ stats.totalEarnings }}</strong>
              </div>
            </div>
          </div>
        </div>
        <div class="card mt-4">
          <div class="card-header">
            <h5 class="mb-0">Quick Actions</h5>
          </div>
          <div class="card-body">
            <div class="d-grid gap-2">
              <router-link to="/work" class="btn btn-outline-primary">
                <i class="bi bi-clock me-2"></i>Log Work Day
              </router-link>
              <router-link to="/expenses" class="btn btn-outline-primary">
                <i class="bi bi-wallet2 me-2"></i>Add Expense
              </router-link>
              <router-link to="/schedule" class="btn btn-outline-primary">
                <i class="bi bi-calendar-week me-2"></i>Update Schedule
              </router-link>
              <router-link to="/statistics" class="btn btn-outline-primary">
                <i class="bi bi-bar-chart me-2"></i>View Statistics
              </router-link>
            </div>
          </div>
        </div>

        <div class="card mt-4">
          <div class="card-header">
            <h5 class="mb-0">Data Export</h5>
          </div>
          <div class="card-body">
            <p class="text-muted small mb-3">
              Export your data for backup or analysis purposes.
            </p>
            <div class="d-grid gap-2">
              <button class="btn btn-outline-secondary" @click="exportData('work')" :disabled="exporting">
                <i class="bi bi-download me-2"></i>Export Work Data
              </button>
              <button class="btn btn-outline-secondary" @click="exportData('expenses')" :disabled="exporting">
                <i class="bi bi-download me-2"></i>Export Expense Data
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useToast } from 'vue-toastification'
import { authStore } from '@/stores/auth'
import api from '@/services/api'
import { format } from 'date-fns'

export default {
  name: 'Profile',
  setup () {
    const toast = useToast()
    const { user, updateHourlyRate } = authStore()

    const updating = ref(false)
    const exporting = ref(false)
    const stats = ref({
      totalWorkDays: 0,
      totalHours: 0,
      totalEarnings: 0
    })

    const profileForm = ref({
      username: '',
      email: '',
      hourlyRate: 0
    })

    const formatDate = (dateString) => {
      if (!dateString) return 'N/A'
      return format(new Date(dateString), 'MMM dd, yyyy')
    }

    const fetchUserStats = async () => {
      try {
        // Fetch current year overview
        const response = await api.get('/dashboard/year-overview', {
          params: { year: new Date().getFullYear() }
        })

        if (response.data.monthlyData) {
          stats.value = {
            totalWorkDays: response.data.monthlyData.reduce((sum, month) => sum + month.days_worked, 0),
            totalHours: response.data.monthlyData.reduce((sum, month) => sum + month.total_hours, 0).toFixed(2),
            totalEarnings: response.data.monthlyData.reduce((sum, month) => sum + month.work_earnings, 0).toFixed(2)
          }
        }
      } catch (error) {
        console.error('Error fetching user stats:', error)
      }
    }

    const updateProfile = async () => {
      updating.value = true
      try {
        const result = await updateHourlyRate(profileForm.value.hourlyRate)
        if (result.success) {
          toast.success('Profile updated successfully')
        } else {
          toast.error(result.message)
        }
      } catch (error) {
        toast.error('Failed to update profile')
      } finally {
        updating.value = false
      }
    }

    const exportData = async (type) => {
      exporting.value = true
      try {
        let endpoint = ''
        let filename = ''

        if (type === 'work') {
          endpoint = '/work/days'
          filename = `work-data-${new Date().toISOString().split('T')[0]}.json`
        } else if (type === 'expenses') {
          endpoint = '/expenses'
          filename = `expense-data-${new Date().toISOString().split('T')[0]}.json`
        }

        const response = await api.get(endpoint, {
          params: { limit: 1000 } // Get all data
        })

        const dataStr = JSON.stringify(response.data, null, 2)
        const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr)

        const exportFileDefaultName = filename
        const linkElement = document.createElement('a')
        linkElement.setAttribute('href', dataUri)
        linkElement.setAttribute('download', exportFileDefaultName)
        linkElement.click()

        toast.success(`${type} data exported successfully`)
      } catch (error) {
        console.error('Error exporting data:', error)
        toast.error('Failed to export data')
      } finally {
        exporting.value = false
      }
    }

    onMounted(() => {
      if (user.value) {
        profileForm.value = {
          username: user.value.username,
          email: user.value.email,
          hourlyRate: user.value.hourlyRate
        }
      }
      fetchUserStats()
    })

    return {
      user,
      updating,
      exporting,
      stats,
      profileForm,
      formatDate,
      updateProfile,
      exportData
    }
  }
}
</script>
