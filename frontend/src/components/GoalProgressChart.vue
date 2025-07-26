<template>
  <div class="goal-chart-container">
    <canvas ref="chartCanvas" :width="width" :height="height"></canvas>
  </div>
</template>

<script>
import { ref, onMounted, watch } from 'vue'

export default {
  name: 'GoalProgressChart',
  props: {
    data: {
      type: Array,
      default: () => []
    },
    width: {
      type: Number,
      default: 400
    },
    height: {
      type: Number,
      default: 200
    },
    color: {
      type: String,
      default: '#4338ca'
    },
    targetAmount: {
      type: Number,
      default: 0
    }
  },
  setup(props) {
    const chartCanvas = ref(null)

    const drawChart = () => {
      if (!chartCanvas.value || !props.data.length) return

      const canvas = chartCanvas.value
      const ctx = canvas.getContext('2d')
      
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      
      const padding = 40
      const chartWidth = canvas.width - padding * 2
      const chartHeight = canvas.height - padding * 2
      
      // Calculate data points
      const dataPoints = props.data.map((item, index) => ({
        x: padding + (index / (props.data.length - 1)) * chartWidth,
        y: canvas.height - padding - ((item.running_total || item.amount) / props.targetAmount) * chartHeight,
        amount: item.running_total || item.amount,
        date: item.created_at
      }))
      
      // Draw grid lines
      ctx.strokeStyle = '#f3f4f6'
      ctx.lineWidth = 1
      for (let i = 0; i <= 5; i++) {
        const y = padding + (i / 5) * chartHeight
        ctx.beginPath()
        ctx.moveTo(padding, y)
        ctx.lineTo(canvas.width - padding, y)
        ctx.stroke()
      }
      
      // Draw axes
      ctx.strokeStyle = '#e5e7eb'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(padding, padding)
      ctx.lineTo(padding, canvas.height - padding)
      ctx.lineTo(canvas.width - padding, canvas.height - padding)
      ctx.stroke()
      
      // Draw target line
      const targetY = canvas.height - padding - chartHeight
      ctx.strokeStyle = '#ef4444'
      ctx.lineWidth = 2
      ctx.setLineDash([5, 5])
      ctx.beginPath()
      ctx.moveTo(padding, targetY)
      ctx.lineTo(canvas.width - padding, targetY)
      ctx.stroke()
      ctx.setLineDash([])
      
      // Draw progress area
      if (dataPoints.length > 1) {
        // Area fill
        const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height)
        gradient.addColorStop(0, props.color + '20')
        gradient.addColorStop(1, props.color + '05')
        
        ctx.fillStyle = gradient
        ctx.beginPath()
        ctx.moveTo(dataPoints[0].x, canvas.height - padding)
        dataPoints.forEach(point => ctx.lineTo(point.x, point.y))
        ctx.lineTo(dataPoints[dataPoints.length - 1].x, canvas.height - padding)
        ctx.closePath()
        ctx.fill()
        
        // Progress line
        ctx.strokeStyle = props.color
        ctx.lineWidth = 3
        ctx.beginPath()
        dataPoints.forEach((point, index) => {
          if (index === 0) ctx.moveTo(point.x, point.y)
          else ctx.lineTo(point.x, point.y)
        })
        ctx.stroke()
      }
      
      // Draw data points
      ctx.fillStyle = props.color
      dataPoints.forEach(point => {
        ctx.beginPath()
        ctx.arc(point.x, point.y, 4, 0, 2 * Math.PI)
        ctx.fill()
        
        // White border
        ctx.strokeStyle = '#ffffff'
        ctx.lineWidth = 2
        ctx.stroke()
      })
      
      // Draw labels
      ctx.fillStyle = '#6b7280'
      ctx.font = '12px Arial'
      ctx.textAlign = 'center'
      
      // Y-axis labels (amounts)
      for (let i = 0; i <= 5; i++) {
        const amount = (props.targetAmount / 5) * i
        const y = canvas.height - padding - (i / 5) * chartHeight
        ctx.textAlign = 'right'
        ctx.fillText(`€${Math.round(amount)}`, padding - 10, y + 4)
      }
      
      // Target label
      ctx.fillStyle = '#ef4444'
      ctx.textAlign = 'right'
      ctx.fillText('Target', padding - 10, targetY + 4)
    }

    onMounted(() => {
      drawChart()
    })

    watch(() => props.data, () => {
      drawChart()
    }, { deep: true })

    watch(() => props.targetAmount, () => {
      drawChart()
    })

    return {
      chartCanvas
    }
  }
}
</script>

<style scoped>
.goal-chart-container {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

canvas {
  border-radius: var(--border-radius);
  background: white;
}
</style>
