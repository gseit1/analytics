<template>
  <div v-if="show" class="goal-achievement-overlay">
    <div class="goal-achievement-celebration">
      <div class="celebration-icon">🎉</div>
      <h3 class="mb-3">{{ title }}</h3>
      <p class="text-muted mb-4">{{ message }}</p>
      <div class="d-flex gap-2 justify-content-center">
        <button class="btn btn-primary" @click="shareAchievement">Share</button>
        <button class="btn btn-outline-secondary" @click="close">Close</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'GoalAchievementCelebration',
  props: {
    show: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      default: 'Congratulations!'
    },
    message: {
      type: String,
      default: 'You\'ve achieved a milestone!'
    }
  },
  emits: ['close', 'share'],
  methods: {
    close() {
      this.$emit('close')
    },
    shareAchievement() {
      this.$emit('share')
    }
  }
}
</script>

<style scoped>
.goal-achievement-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  animation: overlayFadeIn 0.3s ease-out;
}

.goal-achievement-celebration {
  background: white;
  border-radius: var(--border-radius-xl);
  padding: var(--space-2xl);
  box-shadow: var(--shadow-2xl);
  text-align: center;
  max-width: 400px;
  animation: celebrationEntry 0.6s ease-out;
}

.celebration-icon {
  font-size: 4rem;
  margin-bottom: var(--space-lg);
  animation: celebrationPulse 1s ease-in-out infinite alternate;
}

@keyframes overlayFadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes celebrationEntry {
  0% {
    opacity: 0;
    transform: scale(0.8) translateY(20px);
  }
  100% {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

@keyframes celebrationPulse {
  0% { transform: scale(1); }
  100% { transform: scale(1.1); }
}
</style>
