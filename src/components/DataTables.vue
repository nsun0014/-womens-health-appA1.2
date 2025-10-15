<template>
  <div class="container mt-4">
    <h2 class="mb-4"><i class="fas fa-table me-2"></i>Interactive Data Tables</h2>

    <!-- Health Profiles Table -->
    <div class="mb-5">
      <h3 class="mb-3"><i class="fas fa-user-md me-2 text-primary"></i>Health Profiles</h3>
      <InteractiveTable :data="healthProfiles" :columns="healthColumns" />
    </div>

    <!-- Platform Ratings Table -->
    <div class="mb-5">
      <h3 class="mb-3"><i class="fas fa-star me-2 text-warning"></i>Platform Ratings</h3>
      <InteractiveTable :data="ratings" :columns="ratingColumns" />
    </div>
  </div>
</template>

<script>
import InteractiveTable from './InteractiveTable.vue'
import { mockHealthProfiles } from '../data/mockHealthProfiles.js'
import { mockRatings } from '../data/mockRatings.js'

export default {
  name: 'DataTables',
  components: {
    InteractiveTable,
  },
  data() {
    return {
      healthProfiles: mockHealthProfiles,
      ratings: mockRatings,
      healthColumns: [
        { key: 'id', label: 'ID' },
        { key: 'patient_name', label: 'Patient Name' },
        { key: 'age', label: 'Age' },
        { key: 'gender', label: 'Gender' },
        { key: 'blood_type', label: 'Blood Type' },
        { key: 'weight', label: 'Weight (kg)' },
        { key: 'height', label: 'Height (cm)' },
        { key: 'last_visit', label: 'Last Visit' },
        { key: 'condition', label: 'Condition' },
        { key: 'doctor', label: 'Doctor' },
      ],
      ratingColumns: [
        { key: 'id', label: 'ID' },
        { key: 'user_name', label: 'User Name' },
        { key: 'email', label: 'Email' },
        { key: 'rating', label: 'Rating' },
        { key: 'category', label: 'Category' },
        { key: 'comment', label: 'Comment' },
        { key: 'date', label: 'Date' },
        { key: 'status', label: 'Status' },
      ],
    }
  },
}
</script>

<style scoped>
h2 {
  color: #0d6efd;
}

h3 {
  font-size: 1.5rem;
  font-weight: 600;
}
</style>
