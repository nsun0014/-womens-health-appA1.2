<template>
  <div class="container mt-4">
    <div class="card mb-3">
      <div class="card-header">
        <h4><i class="fas fa-map-marked-alt me-2"></i>Find Women's Health Clinics Near You</h4>
        <p class="mb-0 text-muted">Locate nearby health facilities and get directions</p>
      </div>
      <div class="card-body">
        <!-- Search Controls -->
        <div class="row mb-3">
          <div class="col-md-8 mb-2">
            <div class="input-group">
              <span class="input-group-text">
                <i class="fas fa-search"></i>
              </span>
              <input
                type="text"
                class="form-control"
                v-model="searchQuery"
                placeholder="Search: women's clinic, hospital, maternity center..."
                @keyup.enter="searchHealthFacilities"
              />
              <button
                class="btn btn-primary"
                @click="searchHealthFacilities"
                :disabled="isSearching"
              >
                <span v-if="isSearching" class="spinner-border spinner-border-sm me-1"></span>
                <i v-else class="fas fa-search me-1"></i>
                Search
              </button>
            </div>
          </div>
          <div class="col-md-4 mb-2">
            <select class="form-select" v-model="searchType">
              <option value="clinic">Women's Clinics</option>
              <option value="hospital">Hospitals</option>
              <option value="maternity">Maternity Centers</option>
              <option value="pharmacy">Pharmacies</option>
            </select>
          </div>
        </div>

        <!-- Quick Search Buttons -->
        <div class="mb-3 d-flex flex-wrap gap-2">
          <button class="btn btn-sm btn-outline-primary" @click="quickSearch('women clinic')">
            <i class="fas fa-clinic-medical me-1"></i>Women's Clinics
          </button>
          <button class="btn btn-sm btn-outline-danger" @click="quickSearch('hospital')">
            <i class="fas fa-hospital me-1"></i>Hospitals
          </button>
          <button class="btn btn-sm btn-outline-success" @click="quickSearch('maternity')">
            <i class="fas fa-baby me-1"></i>Maternity
          </button>
          <button class="btn btn-sm btn-outline-info" @click="quickSearch('pharmacy')">
            <i class="fas fa-pills me-1"></i>Pharmacies
          </button>
        </div>

        <!-- Map Container -->
        <div ref="mapContainer" class="map-container"></div>

        <!-- Location Info -->
        <div v-if="userLocation" class="alert alert-info mt-3 mb-0">
          <div class="d-flex justify-content-between align-items-center">
            <div>
              <i class="fas fa-map-marker-alt me-2"></i>
              <strong>Your Location:</strong> {{ userLocation.lat.toFixed(4) }},
              {{ userLocation.lng.toFixed(4) }}
            </div>
            <button class="btn btn-sm btn-outline-primary" @click="recenterMap">
              <i class="fas fa-crosshairs me-1"></i>Re-center
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Search Results -->
    <div v-if="searchResults.length > 0" class="card">
      <div class="card-header d-flex justify-content-between align-items-center">
        <h5>
          <i class="fas fa-list me-2"></i>Nearby Health Facilities ({{ searchResults.length }})
        </h5>
        <button class="btn btn-sm btn-outline-secondary" @click="clearResults">
          <i class="fas fa-times me-1"></i>Clear All
        </button>
      </div>
      <div class="card-body">
        <div class="list-group">
          <div
            v-for="(result, index) in searchResults"
            :key="index"
            class="list-group-item list-group-item-action"
            :class="{ 'border-primary border-3': selectedResult === index }"
            @click="selectLocation(result, index)"
            style="cursor: pointer"
          >
            <div class="d-flex justify-content-between align-items-start">
              <div class="flex-grow-1">
                <h6 class="mb-1">
                  <i class="fas fa-hospital text-primary me-2"></i>
                  {{ result.name }}
                </h6>
                <p class="mb-2 text-muted small">
                  <i class="fas fa-map-marker-alt me-1"></i>{{ result.address }}
                </p>
                <div class="d-flex gap-2 flex-wrap">
                  <span class="badge bg-info">
                    <i class="fas fa-route me-1"></i>{{ result.distance }} km away
                  </span>
                  <span v-if="result.type" class="badge bg-secondary">
                    {{ result.type }}
                  </span>
                </div>
              </div>
              <div class="text-end ms-3">
                <button
                  class="btn btn-sm btn-outline-primary mb-1 w-100"
                  @click.stop="getDirections(result, index)"
                  :disabled="isLoadingRoute && selectedResult === index"
                >
                  <span
                    v-if="isLoadingRoute && selectedResult === index"
                    class="spinner-border spinner-border-sm me-1"
                  ></span>
                  <i v-else class="fas fa-directions me-1"></i>
                  Route
                </button>
                <button
                  class="btn btn-sm btn-outline-success w-100"
                  @click.stop="centerOnLocation(result)"
                >
                  <i class="fas fa-crosshairs me-1"></i>View
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Route Info -->
    <div v-if="currentRoute" class="card mt-3">
      <div class="card-header bg-success text-white">
        <div class="d-flex justify-content-between align-items-center">
          <h5 class="mb-0"><i class="fas fa-route me-2"></i>Route Information</h5>
          <button class="btn btn-sm btn-outline-light" @click="clearRoute">
            <i class="fas fa-times me-1"></i>Clear Route
          </button>
        </div>
      </div>
      <div class="card-body">
        <div class="row text-center">
          <div class="col-md-4 mb-3">
            <div class="p-3 bg-light rounded">
              <i class="fas fa-road fa-2x text-primary mb-2"></i>
              <h4 class="mb-0">{{ currentRoute.distance }} km</h4>
              <small class="text-muted">Total Distance</small>
            </div>
          </div>
          <div class="col-md-4 mb-3">
            <div class="p-3 bg-light rounded">
              <i class="fas fa-clock fa-2x text-success mb-2"></i>
              <h4 class="mb-0">~{{ currentRoute.duration }} min</h4>
              <small class="text-muted">Estimated Time</small>
            </div>
          </div>
          <div class="col-md-4 mb-3">
            <div class="p-3 bg-light rounded">
              <i class="fas fa-car fa-2x text-info mb-2"></i>
              <h4 class="mb-0">Driving</h4>
              <small class="text-muted">Travel Mode</small>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- No Results Message -->
    <div
      v-if="searched && searchResults.length === 0 && !isSearching"
      class="alert alert-warning mt-3"
    >
      <i class="fas fa-info-circle me-2"></i>
      No health facilities found nearby. Try adjusting your search terms or expanding your search
      area.
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css'
import 'leaflet-routing-machine'

// Fix Leaflet default icon issue
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

const mapContainer = ref(null)
const map = ref(null)
const userLocation = ref(null)
const searchQuery = ref('')
const searchType = ref('clinic')
const searchResults = ref([])
const selectedResult = ref(null)
const currentRoute = ref(null)
const isSearching = ref(false)
const isLoadingRoute = ref(false)
const searched = ref(false)

const markers = ref([])
const userMarker = ref(null)
const routingControl = ref(null)

// Melbourne, Australia default center
const DEFAULT_CENTER = [-37.8136, 144.9631]
const DEFAULT_ZOOM = 13

// Custom icon creator
const createCustomIcon = (color) => {
  return L.icon({
    iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  })
}

// Initialize map
const initializeMap = () => {
  map.value = L.map(mapContainer.value).setView(DEFAULT_CENTER, DEFAULT_ZOOM)

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19,
  }).addTo(map.value)

  getUserLocation()
}

// Get user location
const getUserLocation = () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        userLocation.value = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        }

        userMarker.value = L.marker([userLocation.value.lat, userLocation.value.lng], {
          icon: createCustomIcon('blue'),
        })
          .addTo(map.value)
          .bindPopup('<strong>📍 Your Location</strong>')
          .openPopup()

        map.value.setView([userLocation.value.lat, userLocation.value.lng], 14)
      },
      (error) => {
        console.warn('Geolocation error:', error)
        userLocation.value = {
          lat: DEFAULT_CENTER[0],
          lng: DEFAULT_CENTER[1],
        }

        userMarker.value = L.marker([DEFAULT_CENTER[0], DEFAULT_CENTER[1]], {
          icon: createCustomIcon('blue'),
        })
          .addTo(map.value)
          .bindPopup('<strong>📍 Default Location (Melbourne)</strong>')
      },
    )
  }
}

// Search health facilities
const searchHealthFacilities = async () => {
  if (!userLocation.value) {
    alert('Please wait for location to load')
    return
  }

  isSearching.value = true
  searched.value = true
  clearMarkers()

  try {
    const searchTerms = {
      clinic: 'women clinic',
      hospital: 'hospital',
      maternity: 'maternity center',
      pharmacy: 'pharmacy',
    }

    const query = searchQuery.value || searchTerms[searchType.value]

    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?` +
        `q=${encodeURIComponent(query)}&` +
        `format=json&` +
        `limit=10&` +
        `lat=${userLocation.value.lat}&` +
        `lon=${userLocation.value.lng}&` +
        `bounded=1&` +
        `viewbox=${userLocation.value.lng - 0.1},${userLocation.value.lat - 0.1},${userLocation.value.lng + 0.1},${userLocation.value.lat + 0.1}`,
      {
        headers: {
          'User-Agent': 'WomenCare Health App',
        },
      },
    )

    const data = await response.json()

    if (data && data.length > 0) {
      searchResults.value = data
        .map((place) => {
          const distance = calculateDistance(
            userLocation.value.lat,
            userLocation.value.lng,
            parseFloat(place.lat),
            parseFloat(place.lon),
          )

          return {
            name: place.display_name.split(',')[0] || place.display_name,
            address: place.display_name,
            lat: parseFloat(place.lat),
            lng: parseFloat(place.lon),
            distance: distance.toFixed(2),
            type: place.type || searchType.value,
          }
        })
        .sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance))

      searchResults.value.forEach((result, index) => {
        const marker = L.marker([result.lat, result.lng], {
          icon: createCustomIcon('red'),
        })
          .addTo(map.value)
          .bindPopup(
            `<strong>${result.name}</strong><br>` +
              `<small>${result.address}</small><br>` +
              `<span style="background: #17a2b8; color: white; padding: 2px 6px; border-radius: 3px; font-size: 11px;">` +
              `📍 ${result.distance} km away</span>`,
          )

        marker.on('click', () => {
          selectedResult.value = index
        })

        markers.value.push(marker)
      })

      if (searchResults.value.length > 0) {
        const bounds = L.latLngBounds([
          [userLocation.value.lat, userLocation.value.lng],
          ...searchResults.value.map((r) => [r.lat, r.lng]),
        ])
        map.value.fitBounds(bounds, { padding: [50, 50] })
      }
    } else {
      searchResults.value = []
    }
  } catch (error) {
    console.error('Search error:', error)
    alert('Failed to search facilities. Please try again.')
  } finally {
    isSearching.value = false
  }
}

// Quick search
const quickSearch = (term) => {
  searchQuery.value = term
  searchHealthFacilities()
}

// Calculate distance using Haversine formula
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

// Get directions
const getDirections = (destination, index) => {
  if (!userLocation.value) return

  selectedResult.value = index
  isLoadingRoute.value = true
  clearRoute()

  try {
    routingControl.value = L.Routing.control({
      waypoints: [
        L.latLng(userLocation.value.lat, userLocation.value.lng),
        L.latLng(destination.lat, destination.lng),
      ],
      router: L.Routing.osrmv1({
        serviceUrl: 'https://router.project-osrm.org/route/v1',
      }),
      lineOptions: {
        styles: [{ color: '#0d6efd', weight: 5, opacity: 0.7 }],
      },
      show: false,
      addWaypoints: false,
      routeWhileDragging: false,
      fitSelectedRoutes: true,
      showAlternatives: false,
    }).addTo(map.value)

    routingControl.value.on('routesfound', (e) => {
      const route = e.routes[0]
      currentRoute.value = {
        distance: (route.summary.totalDistance / 1000).toFixed(2),
        duration: Math.round(route.summary.totalTime / 60),
      }
      isLoadingRoute.value = false
    })

    routingControl.value.on('routingerror', (e) => {
      console.error('Routing error:', e)
      alert('Could not calculate route. Please try again.')
      isLoadingRoute.value = false
    })
  } catch (error) {
    console.error('Directions error:', error)
    alert('Failed to get directions. Please try again.')
    isLoadingRoute.value = false
  }
}

// Select location
const selectLocation = (result, index) => {
  selectedResult.value = index
  centerOnLocation(result)
}

// Center on location
const centerOnLocation = (result) => {
  map.value.setView([result.lat, result.lng], 16)

  const marker = markers.value.find((m) => {
    const lngLat = m.getLatLng()
    return lngLat.lat === result.lat && lngLat.lng === result.lng
  })

  if (marker) {
    marker.openPopup()
  }
}

// Re-center map
const recenterMap = () => {
  if (userLocation.value) {
    map.value.setView([userLocation.value.lat, userLocation.value.lng], 14)
  }
}

// Clear markers
const clearMarkers = () => {
  markers.value.forEach((marker) => marker.remove())
  markers.value = []
}

// Clear route
const clearRoute = () => {
  if (routingControl.value) {
    map.value.removeControl(routingControl.value)
    routingControl.value = null
  }
  currentRoute.value = null
}

// Clear results
const clearResults = () => {
  searchResults.value = []
  selectedResult.value = null
  searched.value = false
  clearMarkers()
  clearRoute()
}

onMounted(() => {
  initializeMap()
})

onUnmounted(() => {
  if (map.value) {
    map.value.remove()
  }
})
</script>

<style scoped>
.map-container {
  height: 500px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.card {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: none;
}

.list-group-item {
  transition: all 0.2s ease;
}

.list-group-item:hover {
  background-color: #f8f9fa;
}

.list-group-item.border-primary {
  border-left-width: 4px !important;
}

@media (max-width: 768px) {
  .map-container {
    height: 400px;
  }
}
</style>
