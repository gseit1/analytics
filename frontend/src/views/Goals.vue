<template>
  <div class="container py-4">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h1 class="h3 mb-0">Goals</h1>
      <button class="btn btn-primary" @click="startAdd">Add Goal</button>
    </div>

    <div class="card">
      <div class="card-body">
        <div v-if="goals.length === 0" class="text-center py-4 text-muted">
          <i class="bi bi-flag" style="font-size: 2rem;"></i>
          <p class="mb-0 mt-2">No goals yet. Add your first goal.</p>
        </div>
        <ul v-else class="list-group list-group-flush">
          <li v-for="g in goals" :key="g.id" class="list-group-item d-flex justify-content-between align-items-center">
            <div>
              <strong>{{ g.title }}</strong>
              <div class="text-muted small">{{ g.description }}</div>
            </div>
            <span :class="['badge', g.status === 'done' ? 'bg-success' : 'bg-secondary']">{{ g.status }}</span>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'

export default {
  name: 'Goals',
  setup () {
    // Placeholder local state; can be replaced with API when backend route is ready
    const goals = ref([])
    const startAdd = () => {
      const title = prompt('Goal title:')
      if (!title) return
      goals.value.push({ id: Date.now(), title, description: 'Personal goal', status: 'active' })
    }
    return { goals, startAdd }
  }
}
</script>
