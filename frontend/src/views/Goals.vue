<template>
  <div class="goals-page">
    <!-- Header with Create Goal Button -->
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h1 class="h3 mb-0">My Goals</h1>
        <p class="text-muted mb-0">Track your financial objectives and milestones</p>
      </div>
      <button class="btn btn-primary" @click="showCreateModal = true">
        <i class="bi bi-plus-circle me-2"></i>Create Goal
      </button>
    </div>

    <!-- Category Filter -->
    <div class="goal-category-filter mb-4">
      <button 
        v-for="category in goalCategories" 
        :key="category.value"
        class="category-filter-btn"
        :class="{ active: selectedCategory === category.value }"
        @click="selectedCategory = category.value"
      >
        <i :class="category.icon" class="me-2"></i>
        {{ category.label }}
      </button>
    </div>

    <!-- Goal Statistics -->
    <div class="row mb-4">
      <div class="col-md-3">
        <div class="card stats-card info">
          <div class="card-body text-center">
            <div class="stats-value">{{ goalStats.total_goals || 0 }}</div>
            <div class="stats-label">Total Goals</div>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card stats-card success">
          <div class="card-body text-center">
            <div class="stats-value">{{ goalStats.completed_goals || 0 }}</div>
            <div class="stats-label">Completed</div>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card stats-card warning">
          <div class="card-body text-center">
            <div class="stats-value">€{{ formatEuroAmount(goalStats.total_target || 0) }}</div>
            <div class="stats-label">Total Target</div>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card stats-card">
          <div class="card-body text-center">
            <div class="stats-value">{{ Math.round(goalStats.avg_progress || 0) }}%</div>
            <div class="stats-label">Avg Progress</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Goals Grid -->
    <div class="row">
      <div v-for="goal in filteredGoals" :key="goal.id" class="col-lg-6 mb-4">
        <div class="card goal-card" :style="{ borderColor: goal.color }">
          <div class="card-header d-flex justify-content-between align-items-center">
            <div>
              <h5 class="mb-1">{{ goal.title }}</h5>
              <div class="d-flex gap-2">
                <span class="badge" :class="getCategoryClass(goal.category)">{{ goal.category }}</span>
                <span class="badge" :class="getTypeClass(goal.goal_type)">{{ goal.goal_type }}</span>
                <span class="badge" :class="getPriorityClass(goal.priority)">{{ goal.priority }}</span>
              </div>
            </div>
            <div class="dropdown">
              <button class="btn btn-sm btn-outline-secondary dropdown-toggle" data-bs-toggle="dropdown">
                <i class="bi bi-three-dots"></i>
              </button>
              <ul class="dropdown-menu">
                <li><a class="dropdown-item" href="#" @click="editGoal(goal)">Edit</a></li>
                <li><a class="dropdown-item" href="#" @click="viewGoalDetails(goal)">View Details</a></li>
                <li><hr class="dropdown-divider"></li>
                <li><a class="dropdown-item text-danger" href="#" @click="deleteGoal(goal.id)">Delete</a></li>
              </ul>
            </div>
          </div>
          <div class="card-body">
            <div class="mb-3">
              <div class="d-flex justify-content-between mb-2">
                <span class="fw-bold">€{{ formatEuroAmount(goal.current_amount) }}</span>
                <span class="text-muted">€{{ formatEuroAmount(goal.target_amount) }}</span>
              </div>
              <div class="progress" style="height: 12px;">
                <div class="progress-bar" :style="{ width: getProgressPercent(goal) + '%', backgroundColor: goal.color }">
                  {{ getProgressPercent(goal) }}%
                </div>
              </div>
            </div>
            
            <div class="row text-center">
              <div class="col-4">
                <small class="text-muted d-block">Days Left</small>
                <strong>{{ getDaysLeft(goal.target_date) }}</strong>
              </div>
              <div class="col-4">
                <small class="text-muted d-block">Milestones</small>
                <strong>{{ goal.achieved_milestones }}/{{ goal.milestone_count }}</strong>
              </div>
              <div class="col-4">
                <small class="text-muted d-block">Progress</small>
                <strong>{{ getProgressPercent(goal) }}%</strong>
              </div>
            </div>

            <!-- Milestone Timeline (when collapsed) -->
            <div v-if="goal.milestones && goal.milestones.length > 0" class="mt-3">
              <small class="text-muted">Upcoming Milestones:</small>
              <div class="milestone-preview mt-1">
                <div v-for="milestone in goal.milestones.slice(0, 2)" :key="milestone.id" 
                     class="milestone-item-small" 
                     :class="{ achieved: milestone.achieved_at }">
                  <div class="milestone-marker" :style="{ backgroundColor: milestone.achieved_at ? goal.color : 'var(--gray-300)' }"></div>
                  <span class="milestone-title">{{ milestone.title }}</span>
                  <span class="milestone-amount">€{{ formatEuroAmount(milestone.target_amount) }}</span>
                </div>
                <div v-if="goal.milestones.length > 2" class="text-muted small">
                  +{{ goal.milestones.length - 2 }} more milestones
                </div>
              </div>
            </div>

            <div class="mt-3 d-flex gap-2">
              <form @submit.prevent="addProgress(goal.id)" class="flex-grow-1 d-flex gap-2">
                <input v-model.number="progressAmounts[goal.id]" type="number" min="1" step="0.01" class="form-control form-control-sm" placeholder="Add €" required />
                <button class="btn btn-success btn-sm" :disabled="loadingProgress[goal.id]">
                  <span v-if="loadingProgress[goal.id]" class="spinner-border spinner-border-sm"></span>
                  <span v-else>Add</span>
                </button>
              </form>
              <button class="btn btn-outline-primary btn-sm" @click="viewGoalDetails(goal)">
                <i class="bi bi-eye"></i>
              </button>
              <button class="btn btn-outline-secondary btn-sm" @click="shareGoal(goal)">
                <i class="bi bi-share"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Goal Details Modal -->
    <div class="modal fade" tabindex="-1" :class="{ show: showDetailsModal }" style="display: block;" v-if="showDetailsModal">
      <div class="modal-dialog modal-xl">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ selectedGoal?.title }} - Details</h5>
            <button type="button" class="btn-close" @click="closeDetailsModal"></button>
          </div>
          <div class="modal-body" v-if="selectedGoal">
            <div class="row">
              <!-- Left Column: Progress Chart and Milestones -->
              <div class="col-md-8">
                <!-- Progress Chart -->
                <div class="card mb-4">
                  <div class="card-header">
                    <h6 class="mb-0">Progress Timeline</h6>
                  </div>
                  <div class="card-body">
                    <GoalProgressChart 
                      :data="selectedGoal.progressHistory || []" 
                      :target-amount="selectedGoal.target_amount"
                      :color="selectedGoal.color"
                      :width="400" 
                      :height="200" 
                    />
                  </div>
                </div>

                <!-- Milestones Management -->
                <div class="card">
                  <div class="card-header d-flex justify-content-between align-items-center">
                    <h6 class="mb-0">Milestones</h6>
                    <button class="btn btn-sm btn-primary" @click="showAddMilestone = true">
                      <i class="bi bi-plus"></i> Add Milestone
                    </button>
                  </div>
                  <div class="card-body">
                    <!-- Milestone Timeline -->
                    <div class="milestone-timeline">
                      <div v-for="(milestone, index) in selectedGoalMilestones" :key="milestone.id" 
                           class="milestone-item" 
                           :class="{ achieved: milestone.achieved_at }">
                        <div class="milestone-connector" v-if="index > 0"></div>
                        <div class="milestone-marker" :style="{ backgroundColor: milestone.achieved_at ? selectedGoal.color : 'var(--gray-300)' }">
                          <i v-if="milestone.achieved_at" class="bi bi-check text-white"></i>
                          <span v-else class="text-white">{{ index + 1 }}</span>
                        </div>
                        <div class="milestone-content">
                          <div class="milestone-header">
                            <h6 class="mb-1">{{ milestone.title }}</h6>
                            <div class="d-flex gap-2">
                              <span class="badge badge-primary">€{{ formatEuroAmount(milestone.target_amount) }}</span>
                              <span v-if="milestone.achieved_at" class="badge badge-success">
                                <i class="bi bi-check"></i> Achieved
                              </span>
                              <button class="btn btn-sm btn-outline-danger" @click="deleteMilestone(milestone.id)">
                                <i class="bi bi-trash"></i>
                              </button>
                            </div>
                          </div>
                          <p v-if="milestone.reward_description" class="mb-1 text-muted">
                            <i class="bi bi-gift"></i> Reward: {{ milestone.reward_description }}
                          </p>
                          <small v-if="milestone.achieved_at" class="text-success">
                            Achieved on {{ formatDate(milestone.achieved_at) }}
                          </small>
                        </div>
                      </div>
                    </div>

                    <!-- Add Milestone Form -->
                    <div v-if="showAddMilestone" class="mt-4 p-3 bg-light rounded">
                      <h6>Add New Milestone</h6>
                      <form @submit.prevent="addMilestone">
                        <div class="row">
                          <div class="col-md-6 mb-3">
                            <label class="form-label">Title</label>
                            <input v-model="milestoneForm.title" type="text" class="form-control" required />
                          </div>
                          <div class="col-md-6 mb-3">
                            <label class="form-label">Target Amount (€)</label>
                            <input v-model.number="milestoneForm.target_amount" type="number" min="1" step="0.01" class="form-control" required />
                          </div>
                        </div>
                        <div class="mb-3">
                          <label class="form-label">Reward Description (Optional)</label>
                          <input v-model="milestoneForm.reward_description" type="text" class="form-control" placeholder="Treat yourself to..." />
                        </div>
                        <div class="d-flex gap-2">
                          <button type="submit" class="btn btn-primary btn-sm">Add Milestone</button>
                          <button type="button" class="btn btn-secondary btn-sm" @click="showAddMilestone = false">Cancel</button>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Right Column: Stats and Sharing -->
              <div class="col-md-4">
                <!-- Goal Stats -->
                <div class="card mb-4">
                  <div class="card-header">
                    <h6 class="mb-0">Goal Statistics</h6>
                  </div>
                  <div class="card-body">
                    <div class="stat-item">
                      <span class="stat-label">Progress</span>
                      <span class="stat-value">{{ getProgressPercent(selectedGoal) }}%</span>
                    </div>
                    <div class="stat-item">
                      <span class="stat-label">Amount Saved</span>
                      <span class="stat-value">€{{ formatEuroAmount(selectedGoal.current_amount) }}</span>
                    </div>
                    <div class="stat-item">
                      <span class="stat-label">Remaining</span>
                      <span class="stat-value">€{{ formatEuroAmount(selectedGoal.target_amount - selectedGoal.current_amount) }}</span>
                    </div>
                    <div class="stat-item">
                      <span class="stat-label">Days Left</span>
                      <span class="stat-value">{{ getDaysLeft(selectedGoal.target_date) }}</span>
                    </div>
                    <div class="stat-item">
                      <span class="stat-label">Daily Target</span>
                      <span class="stat-value">€{{ calculateDailyTarget(selectedGoal) }}</span>
                    </div>
                  </div>
                </div>

                <!-- Goal Sharing -->
                <div class="card">
                  <div class="card-header">
                    <h6 class="mb-0">Share & Collaborate</h6>
                  </div>
                  <div class="card-body">
                    <div class="d-grid gap-2">
                      <button class="btn btn-outline-primary btn-sm" @click="shareToSocial('facebook')">
                        <i class="bi bi-facebook"></i> Share to Facebook
                      </button>
                      <button class="btn btn-outline-info btn-sm" @click="shareToSocial('twitter')">
                        <i class="bi bi-twitter"></i> Share to Twitter
                      </button>
                      <button class="btn btn-outline-success btn-sm" @click="shareToSocial('whatsapp')">
                        <i class="bi bi-whatsapp"></i> Share to WhatsApp
                      </button>
                      <button class="btn btn-outline-secondary btn-sm" @click="copyShareLink">
                        <i class="bi bi-link"></i> Copy Share Link
                      </button>
                    </div>
                    
                    <hr>
                    
                    <!-- Invite Family/Friends -->
                    <div>
                      <h6 class="small">Invite Family & Friends</h6>
                      <form @submit.prevent="inviteCollaborator" class="d-flex gap-2">
                        <input v-model="inviteEmail" type="email" class="form-control form-control-sm" placeholder="Email address" />
                        <button type="submit" class="btn btn-primary btn-sm">Invite</button>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Create/Edit Goal Modal -->
    <div class="modal fade" tabindex="-1" :class="{ show: showCreateModal }" style="display: block;" v-if="showCreateModal">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ editingGoal ? 'Edit Goal' : 'Create New Goal' }}</h5>
            <button type="button" class="btn-close" @click="closeModal"></button>
          </div>
          <form @submit.prevent="saveGoal">
            <div class="modal-body">
              <div class="row">
                <div class="col-md-6 mb-3">
                  <label class="form-label">Title</label>
                  <input v-model="goalForm.title" type="text" class="form-control" required />
                </div>
                <div class="col-md-6 mb-3">
                  <label class="form-label">Category</label>
                  <select v-model="goalForm.category" class="form-select" required>
                    <option value="savings">Savings</option>
                    <option value="equipment">Equipment</option>
                    <option value="vacation">Vacation</option>
                    <option value="emergency">Emergency Fund</option>
                    <option value="investment">Investment</option>
                    <option value="debt">Debt Payoff</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
              
              <div class="row">
                <div class="col-md-6 mb-3">
                  <label class="form-label">Type</label>
                  <select v-model="goalForm.goal_type" class="form-select" required>
                    <option value="short-term">Short-term</option>
                    <option value="long-term">Long-term</option>
                  </select>
                </div>
                <div class="col-md-6 mb-3">
                  <label class="form-label">Priority</label>
                  <select v-model="goalForm.priority" class="form-select" required>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>

              <div class="row">
                <div class="col-md-6 mb-3">
                  <label class="form-label">Target Amount (€)</label>
                  <input v-model.number="goalForm.target_amount" type="number" min="1" step="0.01" class="form-control" required />
                </div>
                <div class="col-md-6 mb-3">
                  <label class="form-label">Target Date</label>
                  <input v-model="goalForm.target_date" type="date" class="form-control" required />
                </div>
              </div>

              <div class="row">
                <div class="col-md-6 mb-3">
                  <label class="form-label">Color</label>
                  <input v-model="goalForm.color" type="color" class="form-control form-control-color" />
                </div>
              </div>

              <div class="mb-3">
                <label class="form-label">Description</label>
                <textarea v-model="goalForm.description" class="form-control" rows="3"></textarea>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" @click="closeModal">Cancel</button>
              <button type="submit" class="btn btn-primary" :disabled="goalSaving">
                <span v-if="goalSaving" class="spinner-border spinner-border-sm"></span>
                <span v-else>{{ editingGoal ? 'Update' : 'Create' }}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Goal Achievement Celebration -->
    <GoalAchievementCelebration 
      :show="showCelebration"
      :title="celebrationTitle"
      :message="celebrationMessage"
      @close="closeCelebration"
      @share="shareCelebration"
    />
  </div>
</template>

<script>
import { ref, onMounted, reactive, nextTick, computed } from 'vue'
import { useToast } from 'vue-toastification'
import api from '@/services/api'
import { formatEuroAmount } from '@/utils/currency'
import { differenceInDays, parseISO, format } from 'date-fns'
import GoalProgressChart from '@/components/GoalProgressChart.vue'
import GoalAchievementCelebration from '@/components/GoalAchievementCelebration.vue'

export default {
  name: 'Goals',
  components: {
    GoalProgressChart,
    GoalAchievementCelebration
  },
  setup() {
    const toast = useToast()
    
    const goals = ref([])
    const goalStats = ref({})
    const loading = ref(true)
    const showCreateModal = ref(false)
    const showDetailsModal = ref(false)
    const selectedGoal = ref(null)
    const selectedGoalMilestones = ref([])
    const editingGoal = ref(null)
    const goalSaving = ref(false)
    const progressAmounts = reactive({})
    const loadingProgress = reactive({})
    const showAddMilestone = ref(false)
    const inviteEmail = ref('')
    const selectedCategory = ref('all')
    const showCelebration = ref(false)
    const celebrationTitle = ref('')
    const celebrationMessage = ref('')
    
    const goalCategories = ref([
      { value: 'all', label: 'All Goals', icon: 'bi-grid' },
      { value: 'savings', label: 'Savings', icon: 'bi-piggy-bank' },
      { value: 'equipment', label: 'Equipment', icon: 'bi-laptop' },
      { value: 'vacation', label: 'Vacation', icon: 'bi-airplane' },
      { value: 'emergency', label: 'Emergency', icon: 'bi-shield-check' },
      { value: 'investment', label: 'Investment', icon: 'bi-graph-up' },
      { value: 'debt', label: 'Debt Payoff', icon: 'bi-credit-card' },
      { value: 'other', label: 'Other', icon: 'bi-three-dots' }
    ])

    const filteredGoals = computed(() => {
      if (selectedCategory.value === 'all') {
        return goals.value
      }
      return goals.value.filter(goal => goal.category === selectedCategory.value)
    })
    
    const goalForm = reactive({
      title: '',
      description: '',
      category: 'savings',
      goal_type: 'short-term',
      target_amount: '',
      target_date: '',
      priority: 'medium',
      color: '#4338ca'
    })

    const milestoneForm = reactive({
      title: '',
      target_amount: '',
      reward_description: ''
    })

    const fetchGoals = async () => {
      loading.value = true
      try {
        const [goalsRes, statsRes] = await Promise.all([
          api.get('/goals'),
          api.get('/goals/stats/overview')
        ])
        
        // Fetch milestones for each goal
        for (const goal of goalsRes.data) {
          try {
            const milestoneRes = await api.get(`/goals/${goal.id}`)
            goal.milestones = milestoneRes.data.milestones || []
          } catch (e) {
            goal.milestones = []
          }
        }
        
        goals.value = goalsRes.data
        goalStats.value = statsRes.data
      } catch (e) {
        toast.error('Failed to load goals')
      } finally {
        loading.value = false
      }
    }

    const viewGoalDetails = async (goal) => {
      selectedGoal.value = goal
      try {
        const res = await api.get(`/goals/${goal.id}`)
        selectedGoalMilestones.value = res.data.milestones || []
        selectedGoal.value.progressHistory = res.data.progress || []
        showDetailsModal.value = true
      } catch (e) {
        toast.error('Failed to load goal details')
      }
    }

    const closeDetailsModal = () => {
      showDetailsModal.value = false
      selectedGoal.value = null
      selectedGoalMilestones.value = []
      showAddMilestone.value = false
    }

    const addMilestone = async () => {
      try {
        await api.post(`/goals/${selectedGoal.value.id}/milestones`, milestoneForm)
        toast.success('Milestone added successfully!')
        showAddMilestone.value = false
        Object.assign(milestoneForm, { title: '', target_amount: '', reward_description: '' })
        await viewGoalDetails(selectedGoal.value) // Refresh details
      } catch (e) {
        toast.error('Failed to add milestone')
      }
    }

    const deleteMilestone = async (milestoneId) => {
      if (confirm('Are you sure you want to delete this milestone?')) {
        try {
          await api.delete(`/goals/milestones/${milestoneId}`)
          toast.success('Milestone deleted successfully!')
          await viewGoalDetails(selectedGoal.value) // Refresh details
        } catch (e) {
          toast.error('Failed to delete milestone')
        }
      }
    }

    const shareGoal = (goal) => {
      selectedGoal.value = goal
      viewGoalDetails(goal)
    }

    const shareToSocial = (platform) => {
      const goal = selectedGoal.value
      const progress = getProgressPercent(goal)
      const text = `I'm ${progress}% of the way to my goal: ${goal.title}! Target: €${formatEuroAmount(goal.target_amount)} 💪`
      
      const urls = {
        facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}&quote=${encodeURIComponent(text)}`,
        twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`,
        whatsapp: `https://wa.me/?text=${encodeURIComponent(text)}`
      }
      
      if (urls[platform]) {
        window.open(urls[platform], '_blank', 'width=600,height=400')
      }
    }

    const copyShareLink = async () => {
      try {
        const shareText = `Check out my savings goal: ${selectedGoal.value.title} - ${getProgressPercent(selectedGoal.value)}% complete!`
        await navigator.clipboard.writeText(shareText)
        toast.success('Share text copied to clipboard!')
      } catch (e) {
        toast.error('Failed to copy share link')
      }
    }

    const inviteCollaborator = async () => {
      try {
        // This would typically send an email invitation
        // For now, we'll just show a success message
        toast.success(`Invitation sent to ${inviteEmail.value}!`)
        inviteEmail.value = ''
      } catch (e) {
        toast.error('Failed to send invitation')
      }
    }

    const calculateDailyTarget = (goal) => {
      if (!goal || !goal.target_date) return '0'
      try {
        const remaining = goal.target_amount - goal.current_amount
        const targetDate = parseISO(goal.target_date)
        if (isNaN(targetDate.getTime())) return '0'
        const daysLeft = differenceInDays(targetDate, new Date())
        return daysLeft > 0 ? formatEuroAmount(remaining / daysLeft) : '0'
      } catch (error) {
        console.error('Daily target calculation error:', error)
        return '0'
      }
    }

    const formatDate = (dateString) => {
      if (!dateString) return 'N/A'
      try {
        const date = parseISO(dateString)
        if (isNaN(date.getTime())) return 'Invalid Date'
        return format(date, 'MMM dd, yyyy')
      } catch (error) {
        console.error('Date formatting error:', error)
        return 'Invalid Date'
      }
    }

    const closeCelebration = () => {
      showCelebration.value = false
    }

    const shareCelebration = () => {
      const text = `🎉 ${celebrationTitle.value} ${celebrationMessage.value}`
      if (navigator.share) {
        navigator.share({
          title: 'Goal Achievement',
          text: text
        })
      } else {
        navigator.clipboard.writeText(text)
        toast.success('Achievement copied to clipboard!')
      }
      closeCelebration()
    }

    const getProgressPercent = (goal) => {
      const percent = (parseFloat(goal.current_amount || 0) / parseFloat(goal.target_amount || 1)) * 100
      return Math.min(100, Math.round(percent))
    }

    const getDaysLeft = (targetDate) => {
      if (!targetDate) return 'No date set'
      try {
        const date = parseISO(targetDate)
        if (isNaN(date.getTime())) return 'Invalid date'
        const days = differenceInDays(date, new Date())
        return days > 0 ? days : 'Overdue'
      } catch (error) {
        console.error('Date calculation error:', error)
        return 'Invalid date'
      }
    }

    const getCategoryClass = (category) => {
      const classes = {
        savings: 'badge-success',
        equipment: 'badge-info',
        vacation: 'badge-warning',
        emergency: 'badge-danger',
        investment: 'badge-primary',
        debt: 'badge-secondary',
        other: 'badge-secondary'
      }
      return classes[category] || 'badge-secondary'
    }

    const getTypeClass = (type) => {
      return type === 'short-term' ? 'badge-info' : 'badge-primary'
    }

    const getPriorityClass = (priority) => {
      const classes = {
        low: 'badge-secondary',
        medium: 'badge-warning',
        high: 'badge-danger'
      }
      return classes[priority] || 'badge-secondary'
    }

    const saveGoal = async () => {
      goalSaving.value = true
      try {
        if (editingGoal.value) {
          await api.put(`/goals/${editingGoal.value.id}`, goalForm)
          toast.success('Goal updated successfully!')
        } else {
          await api.post('/goals', goalForm)
          toast.success('Goal created successfully!')
        }
        closeModal()
        await fetchGoals()
      } catch (e) {
        toast.error('Failed to save goal')
      } finally {
        goalSaving.value = false
      }
    }

    const editGoal = (goal) => {
      editingGoal.value = goal
      Object.assign(goalForm, {
        title: goal.title,
        description: goal.description,
        category: goal.category,
        goal_type: goal.goal_type,
        target_amount: goal.target_amount,
        target_date: goal.target_date,
        priority: goal.priority,
        color: goal.color
      })
      showCreateModal.value = true
    }

    const deleteGoal = async (goalId) => {
      if (confirm('Are you sure you want to delete this goal?')) {
        try {
          await api.delete(`/goals/${goalId}`)
          toast.success('Goal deleted successfully!')
          await fetchGoals()
        } catch (e) {
          toast.error('Failed to delete goal')
        }
      }
    }

    const addProgress = async (goalId) => {
      const amount = progressAmounts[goalId]
      if (!amount) return
      
      loadingProgress[goalId] = true
      try {
        const res = await api.post(`/goals/${goalId}/progress`, { amount })
        toast.success('Progress added!')
        if (res.data.achievedMilestones > 0) {
          showCelebration.value = true
          celebrationTitle.value = 'Milestone Achieved! 🎉'
          celebrationMessage.value = `Congratulations! You've achieved ${res.data.achievedMilestones} milestone(s) for this goal!`
        }
        progressAmounts[goalId] = ''
        await fetchGoals()
      } catch (e) {
        toast.error('Failed to add progress')
      } finally {
        loadingProgress[goalId] = false
      }
    }

    const closeModal = () => {
      showCreateModal.value = false
      editingGoal.value = null
      Object.assign(goalForm, {
        title: '',
        description: '',
        category: 'savings',
        goal_type: 'short-term',
        target_amount: '',
        target_date: '',
        priority: 'medium',
        color: '#4338ca'
      })
    }

    onMounted(() => {
      fetchGoals()
    })

    return {
      goals,
      goalStats,
      loading,
      showCreateModal,
      showDetailsModal,
      selectedGoal,
      selectedGoalMilestones,
      editingGoal,
      goalSaving,
      goalForm,
      milestoneForm,
      progressAmounts,
      loadingProgress,
      showAddMilestone,
      inviteEmail,
      selectedCategory,
      goalCategories,
      filteredGoals,
      showCelebration,
      celebrationTitle,
      celebrationMessage,
      formatEuroAmount,
      getProgressPercent,
      getDaysLeft,
      getCategoryClass,
      getTypeClass,
      getPriorityClass,
      saveGoal,
      editGoal,
      deleteGoal,
      addProgress,
      closeModal,
      viewGoalDetails,
      closeDetailsModal,
      addMilestone,
      deleteMilestone,
      shareGoal,
      shareToSocial,
      copyShareLink,
      inviteCollaborator,
      calculateDailyTarget,
      formatDate,
      closeCelebration,
      shareCelebration
    }
  }
}
</script>

<style scoped>
.goal-card {
  border-left: 4px solid !important;
  transition: all 0.3s ease;
}

.goal-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.progress {
  border-radius: 10px;
  overflow: hidden;
}

.badge {
  font-size: 0.7rem;
}

/* Milestone Timeline Styles */
.milestone-timeline {
  position: relative;
  padding: 20px 0;
}

.milestone-item {
  display: flex;
  align-items: flex-start;
  margin-bottom: 30px;
  position: relative;
}

.milestone-item.achieved .milestone-content {
  opacity: 0.9;
}

.milestone-connector {
  position: absolute;
  left: 20px;
  top: -15px;
  width: 2px;
  height: 30px;
  background: var(--gray-300);
}

.milestone-marker {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 15px;
  flex-shrink: 0;
  font-weight: bold;
  font-size: 14px;
  border: 3px solid white;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.milestone-content {
  flex: 1;
  padding: 10px 0;
}

.milestone-header {
  display: flex;
  justify-content: between;
  align-items: flex-start;
  margin-bottom: 8px;
}

.milestone-header h6 {
  margin: 0;
  flex: 1;
}

/* Milestone Preview (in goal cards) */
.milestone-preview {
  max-height: 80px;
  overflow: hidden;
}

.milestone-item-small {
  display: flex;
  align-items: center;
  padding: 4px 0;
  font-size: 0.85rem;
}

.milestone-item-small .milestone-marker {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  margin-right: 8px;
  flex-shrink: 0;
}

.milestone-item-small .milestone-title {
  flex: 1;
  margin-right: 8px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.milestone-item-small .milestone-amount {
  font-weight: 600;
  color: var(--primary-600);
}

.milestone-item-small.achieved {
  opacity: 0.7;
}

.milestone-item-small.achieved .milestone-title {
  text-decoration: line-through;
}

/* Goal Details Modal Styles */
.modal-xl {
  max-width: 1200px;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid var(--gray-200);
}

.stat-item:last-child {
  border-bottom: none;
}

.stat-label {
  font-weight: 500;
  color: var(--gray-600);
}

.stat-value {
  font-weight: 600;
  color: var(--gray-900);
}

/* Badge Color Classes */
.badge-primary {
  background-color: var(--primary-500);
  color: white;
}

.badge-success {
  background-color: var(--success-500);
  color: white;
}

.badge-info {
  background-color: var(--info-500);
  color: white;
}

.badge-warning {
  background-color: var(--warning-500);
  color: white;
}

.badge-danger {
  background-color: var(--danger-500);
  color: white;
}

.badge-secondary {
  background-color: var(--gray-500);
  color: white;
}

/* Progress Chart */
canvas {
  width: 100%;
  height: 200px;
  border-radius: 8px;
}

/* Social Share Buttons */
.btn-outline-primary:hover {
  background-color: #1877f2;
  border-color: #1877f2;
}

.btn-outline-info:hover {
  background-color: #1da1f2;
  border-color: #1da1f2;
}

.btn-outline-success:hover {
  background-color: #25d366;
  border-color: #25d366;
}

/* Modal backdrop */
.modal {
  background-color: rgba(0, 0, 0, 0.5);
}

.modal.show {
  display: block !important;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .milestone-item {
    margin-bottom: 20px;
  }
  
  .milestone-marker {
    width: 30px;
    height: 30px;
    font-size: 12px;
  }
  
  .milestone-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .milestone-header .d-flex {
    margin-top: 8px;
  }
}

/* Animation for milestone achievement */
@keyframes milestone-achievement {
  0% { transform: scale(1); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
}

.milestone-item.achieved .milestone-marker {
  animation: milestone-achievement 0.6s ease-in-out;
}
</style>
