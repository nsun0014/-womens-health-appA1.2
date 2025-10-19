<template>
  <div class="chart-container">
    <canvas ref="chartCanvas"></canvas>
  </div>
</template>

<script>
import { Chart, registerables } from 'chart.js'

Chart.register(...registerables)

export default {
  name: 'StatsChart',
  props: {
    chartData: {
      type: Object,
      required: true,
    },
    chartType: {
      type: String,
      default: 'bar',
    },
    chartTitle: {
      type: String,
      default: 'Statistics',
    },
  },
  data() {
    return {
      chart: null,
    }
  },
  mounted() {
    this.createChart()
  },
  beforeUnmount() {
    if (this.chart) {
      this.chart.destroy()
    }
  },
  watch: {
    chartData: {
      deep: true,
      handler() {
        if (this.chart) {
          this.chart.destroy()
        }
        this.createChart()
      },
    },
  },
  methods: {
    createChart() {
      const ctx = this.$refs.chartCanvas.getContext('2d')

      this.chart = new Chart(ctx, {
        type: this.chartType,
        data: this.chartData,
        options: {
          responsive: true,
          maintainAspectRatio: true,
          plugins: {
            legend: {
              display: true,
              position: 'top',
            },
            title: {
              display: true,
              text: this.chartTitle,
              font: {
                size: 16,
                weight: 'bold',
              },
            },
          },
          scales:
            this.chartType !== 'pie' && this.chartType !== 'doughnut'
              ? {
                  y: {
                    beginAtZero: true,
                    ticks: {
                      precision: 0,
                    },
                  },
                }
              : {},
        },
      })
    },
  },
}
</script>

<style scoped>
.chart-container {
  position: relative;
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
}
</style>
