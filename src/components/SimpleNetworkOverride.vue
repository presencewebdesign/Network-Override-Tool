<template>
  <div class="simple-network-override">
    <div class="tool-layout">
      <!-- Left Column: User Profile Display -->
      <div class="left-column">
        <div v-if="userProfileData" class="profile-display">
          <div class="profile-header">
            <h3>👤 User Profile Display</h3>
            <span
              :class="['profile-status', userProfileData.isOverridden ? 'overridden' : 'original']"
            >
              {{ userProfileData.isOverridden ? '🔄 OVERRIDDEN DATA' : '📡 LIVE API DATA' }}
            </span>
          </div>

          <div class="profile-card">
            <div class="profile-main">
              <div class="profile-avatar">
                {{ userProfileData.name ? userProfileData.name.charAt(0) : '?' }}
              </div>
              <div class="profile-info">
                <h4 class="profile-name">{{ userProfileData.name || 'Unknown User' }}</h4>
                <p class="profile-username">@{{ userProfileData.username || 'unknown' }}</p>
                <p class="profile-email">📧 {{ userProfileData.email || 'No email' }}</p>
                <p class="profile-phone">📞 {{ userProfileData.phone || 'No phone' }}</p>
                <p class="profile-website">🌐 {{ userProfileData.website || 'No website' }}</p>
              </div>
            </div>

            <div class="profile-details">
              <div class="profile-section">
                <h5>🏠 Address</h5>
                <p v-if="userProfileData.address">
                  {{ userProfileData.address.street
                  }}{{ userProfileData.address.suite ? ', ' + userProfileData.address.suite : ''
                  }}<br />
                  {{ userProfileData.address.city }}, {{ userProfileData.address.zipcode }}
                </p>
                <p v-else>No address available</p>
              </div>

              <div class="profile-section">
                <h5>🏢 Company</h5>
                <p v-if="userProfileData.company">
                  <strong>{{ userProfileData.company.name }}</strong
                  ><br />
                  <em>"{{ userProfileData.company.catchPhrase }}"</em><br />
                  <small>{{ userProfileData.company.bs }}</small>
                </p>
                <p v-else>No company information</p>
              </div>
            </div>
          </div>

          <div class="profile-actions">
            <p class="profile-hint">
              {{
                userProfileData.isOverridden
                  ? '🎭 This profile is showing your custom override data!'
                  : '📡 This profile is showing live API data. Override it to see custom data!'
              }}
            </p>
          </div>
        </div>

        <div v-else class="profile-placeholder">
          <div class="placeholder-content">
            <div class="placeholder-icon">👤</div>
            <h3>User Profile Display</h3>
            <p>Click "👤 Load User Profile" to see the profile data appear here</p>
          </div>
        </div>
      </div>

      <!-- Right Column: Network Override Tools -->
      <div class="right-column">
        <!-- Test API Section -->
        <div class="test-section">
          <h3 class="section-header">🧪 Make Test API Calls</h3>
          <div class="test-buttons">
            <button @click="makeDummyApiCall" class="test-btn" :disabled="loading">
              {{ loading ? 'Loading...' : '👤 Load User Profile' }}
            </button>
          </div>
          <p class="section-hint">
            💡 Click to make real API calls - watch the response below change when you override
            them!
          </p>
        </div>

        <!-- API Response Display -->
        <div v-if="lastApiResponse" class="response-display test-section">
          <h3 class="section-header">🎯 Latest API Response</h3>
          <div class="response-info">
            <div class="response-header">
              <span class="response-method">{{ lastApiResponse.method }}</span>
              <span class="response-url">{{ lastApiResponse.url }}</span>
              <span class="response-time">{{ lastApiResponse.timestamp }}</span>
              <span
                :class="[
                  'response-status',
                  lastApiResponse.isOverridden ? 'overridden' : 'original',
                ]"
              >
                {{ lastApiResponse.isOverridden ? '🔄 OVERRIDDEN' : '📡 ORIGINAL' }}
              </span>
            </div>
            <div class="response-data">
              <h4>
                {{ lastApiResponse.isOverridden ? '🎭 Your Custom Response:' : '📋 API Response:' }}
              </h4>
              <pre class="response-json">{{ JSON.stringify(lastApiResponse.data, null, 2) }}</pre>
            </div>
          </div>
        </div>

        <!-- Saved Overrides Section -->
        <div v-if="savedOverrides.length > 0" class="saved-section">
          <h3 class="section-header">💾 Saved Overrides ({{ savedOverrides.length }})</h3>
          <div class="saved-overrides-list">
            <div v-for="override in savedOverrides" :key="override.url" class="saved-item">
              <div class="saved-info">
                <span class="saved-url">{{ override.url }}</span>
                <span class="saved-filename">{{ override.filename }}</span>
                <span class="saved-timestamp">{{
                  new Date(override.timestamp).toLocaleString()
                }}</span>
              </div>
              <span class="saved-status">🔄 Active</span>
            </div>
          </div>
          <button v-if="hasSavedOverride" @click="clearAllOverrides" class="clear-btn">
            Clear All Overrides
          </button>
        </div>

        <!-- Network Requests Monitor -->
        <div class="monitor-section test-section">
          <h3 class="section-header">📡 Network Requests ({{ requests.length }})</h3>

          <div v-if="requests.length === 0" class="empty-state">
            <p>No requests captured yet. Click "👤 Load User Profile" to test.</p>
          </div>

          <div v-else class="requests-list">
            <div v-for="request in requests" :key="request.id" class="request-item">
              <div class="request-info">
                <span class="method">{{ request.method }}</span>
                <span class="url">{{ request.url }}</span>
                <span class="status">{{ request.status }}</span>
                <span class="timestamp">{{ request.timestamp }}</span>
              </div>

              <div class="request-actions">
                <button
                  @click="toggleOverride(request)"
                  :class="['override-btn', { active: request.isOverridden }]"
                >
                  {{ request.isOverridden ? '🔄 Overridden' : '⚡ Override' }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Override Editor -->
        <div v-if="selectedRequest" class="override-section test-section">
          <h3 class="section-header">✏️ Override Response for: {{ selectedRequest.url }}</h3>

          <div class="tabs">
            <button @click="activeTab = 'original'" :class="{ active: activeTab === 'original' }">
              Original Response
            </button>
            <button @click="activeTab = 'override'" :class="{ active: activeTab === 'override' }">
              Override Response
            </button>
          </div>

          <div v-if="activeTab === 'original'" class="tab-content">
            <div class="section-header">
              <h4>📋 Original API Response</h4>
              <p class="section-subtitle">This is what the API actually returned</p>
            </div>
            <pre class="json-display">{{
              JSON.stringify(selectedRequest.originalResponse, null, 2)
            }}</pre>
          </div>

          <div v-if="activeTab === 'override'" class="tab-content">
            <div class="section-header">
              <h4>🎯 Your Override Response</h4>
              <p class="section-subtitle">Edit this JSON to override the API response</p>
            </div>
            <textarea
              v-model="overrideText"
              class="override-textarea"
              placeholder="Enter your JSON response here..."
            ></textarea>

            <div class="override-actions">
              <button @click="useExampleOverride" class="template-btn example-btn">
                Use Example Override
              </button>
              <button @click="saveOverride" class="save-btn" :disabled="!isValidJson">
                💾 Save Override
              </button>
              <button @click="removeOverride" class="remove-btn">🗑️ Remove Override</button>
            </div>

            <div class="file-preview" v-if="selectedRequest">
              <h5>📁 File will be saved as:</h5>
              <div class="file-path">{{ generateFileName(selectedRequest.url) }}</div>
              <p class="file-note">💡 Files are organized by domain and path for easy management</p>
            </div>

            <div class="json-status">
              <span :class="['status', isValidJson ? 'valid' : 'invalid']">
                {{ isValidJson ? '✅ Valid JSON' : '❌ Invalid JSON' }}
              </span>
            </div>
          </div>
        </div>
      </div>
      <!-- End right-column -->
    </div>
    <!-- End tool-layout -->
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'

// Define props for external requests from widget
const props = defineProps({
  externalRequests: {
    type: Array,
    default: () => [],
  },
})

// Define emits for parent communication
const emit = defineEmits(['activity', 'overrides-changed'])

// State
const requests = ref([])
const selectedRequest = ref(null)
const activeTab = ref('original')
const overrideText = ref('')
const loading = ref(false)
const savedOverrides = ref([]) // Track saved override files
const lastApiResponse = ref(null) // Track the last API response to show in UI
const userProfileData = ref(null) // Track user profile data for UI display
const hasSavedOverride = ref(false) // Track if an override has been saved

// Watch for external requests and merge them
watch(
  () => props.externalRequests,
  (newExternalRequests) => {
    console.log('📡 SimpleNetworkOverride: Received external requests:', newExternalRequests.length)

    // Merge external requests with internal ones, avoiding duplicates
    newExternalRequests.forEach((externalRequest) => {
      const exists = requests.value.find((req) => req.id === externalRequest.id)
      if (!exists) {
        requests.value.unshift(externalRequest)
        console.log('➕ Added external request to display:', externalRequest.url)
      }
    })

    // Keep only last 10 requests
    if (requests.value.length > 10) {
      requests.value = requests.value.slice(0, 10)
    }
  },
  { immediate: true, deep: true },
)

// Removed yourTemplate - no longer needed

// Example API - Real user data that shows clear differences
const exampleApiUrl = 'https://jsonplaceholder.typicode.com/users/1'
const exampleOverride = {
  id: 1,
  name: 'Custom User Name',
  username: 'override_user',
  email: 'override@example.com',
  phone: '555-OVERRIDE',
  website: 'custom-override.dev',
  company: {
    name: 'Override Technologies Inc.',
    catchPhrase: 'Intercepting requests since 2024',
    bs: 'override network responses',
  },
  address: {
    street: '123 Override Street',
    city: 'Mock City',
    zipcode: '12345',
  },
}

// Override map to store active overrides
const overrides = new Map()
let originalFetch = null
let originalXHR = null

// Check if override text is valid JSON
const isValidJson = computed(() => {
  try {
    JSON.parse(overrideText.value)
    return true
  } catch {
    return false
  }
})

// Generate filename with folder structure from URL
const generateFileName = (url) => {
  const urlObj = new URL(url)
  const pathParts = urlObj.pathname.split('/').filter(Boolean)
  const domain = urlObj.hostname.replace(/[^a-zA-Z0-9.-]/g, '_')
  const timestamp = new Date().toISOString().slice(0, 19).replace(/[:-]/g, '')

  // Create folder structure: domain/path/segments/override_timestamp.json
  let folderPath = domain
  if (pathParts.length > 0) {
    const cleanPathParts = pathParts.map((part) => part.replace(/[^a-zA-Z0-9.-]/g, '_'))
    folderPath = `${domain}/${cleanPathParts.join('/')}`
  }

  return `${folderPath}/override_${timestamp}.json`
}

// Save override to file with folder structure and localStorage
const downloadOverrideFile = (url, data, filename) => {
  const jsonString = JSON.stringify(data, null, 2)
  const blob = new Blob([jsonString], { type: 'application/json' })
  const downloadUrl = URL.createObjectURL(blob)

  const link = document.createElement('a')
  link.href = downloadUrl
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(downloadUrl)

  console.log('📁 Override saved with folder structure:', filename)
}

// Save overrides to localStorage
const saveOverridesToStorage = () => {
  const overrideArray = Array.from(overrides.entries()).map(([url, data]) => ({
    url,
    data,
    timestamp: new Date().toISOString(),
  }))
  localStorage.setItem('networkOverrides', JSON.stringify(overrideArray))
}

// Load overrides from localStorage
const loadOverridesFromStorage = () => {
  try {
    const stored = localStorage.getItem('networkOverrides')
    if (stored) {
      const overrideArray = JSON.parse(stored)
      overrideArray.forEach((item) => {
        overrides.set(item.url, item.data)
        savedOverrides.value.push({
          url: item.url,
          filename: generateFileName(item.url),
          timestamp: item.timestamp,
        })
      })
      console.log('✅ Loaded', overrideArray.length, 'saved overrides')
    }
  } catch (error) {
    console.error('Failed to load overrides from storage:', error)
  }
}

// Clear all overrides
const clearAllOverrides = async () => {
  overrides.clear()
  savedOverrides.value = []
  localStorage.removeItem('networkOverrides')
  hasSavedOverride.value = false // Reset to false when all overrides are cleared

  // Update all requests to show they're no longer overridden
  requests.value.forEach((request) => {
    request.isOverridden = false
  })

  console.log('🗑️ All overrides cleared')
  emit('overrides-changed', 0)
  emit('activity')

  // Automatically refresh the user profile data if it exists
  if (userProfileData.value) {
    try {
      console.log('🔄 Fetching fresh user profile data after clearing all overrides...')
      loading.value = true

      const response = await fetch(exampleApiUrl)
      if (response.ok && response.headers.get('content-type')?.includes('application/json')) {
        const originalData = await response.json()

        // Update the user profile display with fresh original data
        userProfileData.value = {
          ...originalData,
          isOverridden: false,
        }

        // Update the last API response if it matches
        if (lastApiResponse.value && lastApiResponse.value.url === exampleApiUrl) {
          lastApiResponse.value = {
            method: 'GET',
            url: exampleApiUrl,
            timestamp: new Date().toLocaleTimeString(),
            data: originalData,
            isOverridden: false,
          }
        }

        console.log('✅ Fresh user profile data loaded after clearing all overrides')
        alert(
          'All overrides cleared! User profile has been automatically refreshed with original data.',
        )
      } else {
        throw new Error('Failed to fetch original data')
      }
    } catch (error) {
      console.error('Failed to refresh user profile data:', error)
      alert(
        'All overrides cleared! Please click "👤 Load User Profile" to see the original data again.',
      )
    } finally {
      loading.value = false
    }
  } else {
    alert('All overrides have been cleared!')
  }
}

// Setup network interception
const setupInterception = () => {
  console.log('🔧 Setting up network interception...')
  if (originalFetch && originalXHR) {
    console.log('⚠️ Interception already set up, skipping')
    return
  }

  // Intercept fetch requests
  if (!originalFetch) {
    console.log('🌐 Setting up fetch interception...')
    originalFetch = window.fetch

    window.fetch = async (url, options = {}) => {
      const startTime = Date.now()
      console.log('🌐 Intercepted fetch request to:', url)

      // Check if this URL has an override
      if (overrides.has(url)) {
        const overrideData = overrides.get(url)
        console.log('🔄 Using fetch override for:', url)

        // Create a fake response
        const overrideResponse = new Response(JSON.stringify(overrideData), {
          status: 200,
          statusText: 'OK (Overridden)',
          headers: {
            'Content-Type': 'application/json',
            'X-Override': 'true',
          },
        })

        // Log the overridden request
        logRequest(url, options, overrideResponse, startTime, overrideData, true)

        return overrideResponse
      }

      // Make the original request
      try {
        const response = await originalFetch(url, options)
        console.log(
          '📡 Original fetch response for:',
          url,
          'Status:',
          response.status,
          'Content-Type:',
          response.headers.get('content-type'),
        )

        // Only log successful JSON responses
        if (response.ok && response.headers.get('content-type')?.includes('application/json')) {
          const responseClone = response.clone()
          const data = await responseClone.json()
          console.log('✅ Logging JSON response for:', url)
          logRequest(url, options, response, startTime, data, false)
        } else {
          console.log('⏭️ Skipping non-JSON or failed response for:', url)
        }

        return response
      } catch (error) {
        console.error('Request failed:', error)
        throw error
      }
    }
  }

  // Intercept XMLHttpRequest
  if (!originalXHR) {
    console.log('📡 Setting up XHR interception...')
    originalXHR = window.XMLHttpRequest

    window.XMLHttpRequest = function () {
      const xhr = new originalXHR()
      const startTime = Date.now()
      let method = 'GET'
      let url = ''

      // Override open method to capture method and URL
      const originalOpen = xhr.open
      xhr.open = function (httpMethod, httpUrl, ...args) {
        method = httpMethod
        url = httpUrl
        return originalOpen.call(this, httpMethod, httpUrl, ...args)
      }

      // Override send method to handle overrides and logging
      const originalSend = xhr.send
      xhr.send = function (data) {
        // Check if this URL has an override
        if (overrides.has(url)) {
          const overrideData = overrides.get(url)
          console.log('🔄 Using XHR override for:', url)

          // Simulate a successful response
          Object.defineProperty(xhr, 'status', { value: 200, writable: false })
          Object.defineProperty(xhr, 'statusText', { value: 'OK (Overridden)', writable: false })
          Object.defineProperty(xhr, 'responseText', {
            value: JSON.stringify(overrideData),
            writable: false,
          })
          Object.defineProperty(xhr, 'response', {
            value: JSON.stringify(overrideData),
            writable: false,
          })
          Object.defineProperty(xhr, 'readyState', { value: 4, writable: false })

          // Set response headers
          const originalGetResponseHeader = xhr.getResponseHeader
          xhr.getResponseHeader = function (name) {
            if (name.toLowerCase() === 'content-type') return 'application/json'
            if (name.toLowerCase() === 'x-override') return 'true'
            return originalGetResponseHeader.call(this, name)
          }

          // Log the overridden request
          const fakeResponse = {
            status: 200,
            statusText: 'OK (Overridden)',
            headers: { get: (name) => (name === 'content-type' ? 'application/json' : null) },
          }
          logRequest(url, { method }, fakeResponse, startTime, overrideData, true)

          // Trigger events
          setTimeout(() => {
            if (xhr.onreadystatechange) xhr.onreadystatechange()
            if (xhr.onload) xhr.onload()
          }, 10)

          return
        }

        // Setup response handler for original requests
        const originalOnReadyStateChange = xhr.onreadystatechange
        xhr.onreadystatechange = function () {
          if (xhr.readyState === 4 && xhr.status === 200) {
            try {
              const contentType = xhr.getResponseHeader('content-type')
              if (contentType && contentType.includes('application/json')) {
                const data = JSON.parse(xhr.responseText)
                const fakeResponse = {
                  status: xhr.status,
                  statusText: xhr.statusText,
                  headers: { get: (name) => xhr.getResponseHeader(name) },
                }
                logRequest(url, { method }, fakeResponse, startTime, data, false)
              }
            } catch {
              // Not JSON or parse error, ignore
            }
          }
          if (originalOnReadyStateChange) originalOnReadyStateChange.call(this)
        }

        return originalSend.call(this, data)
      }

      return xhr
    }
  }

  console.log('✅ Network interception setup complete!')
}

// Log network request
const logRequest = (url, options, response, startTime, data, isOverridden) => {
  const request = {
    id: Date.now() + Math.random(),
    url: url,
    method: options.method || 'GET',
    status: response.status,
    statusText: response.statusText,
    timestamp: new Date().toLocaleTimeString(),
    duration: Date.now() - startTime,
    originalResponse: data,
    isOverridden: isOverridden,
  }

  // Add to the beginning of the list
  requests.value.unshift(request)

  // Keep only last 10 requests
  if (requests.value.length > 10) {
    requests.value = requests.value.slice(0, 10)
  }

  // Emit activity event to notify widget of network activity
  emit('activity')
  console.log('📡 Network request captured:', url, '- Activity emitted to widget')
}

// Remove interception
const removeInterception = () => {
  if (originalFetch) {
    window.fetch = originalFetch
    originalFetch = null
  }
  if (originalXHR) {
    window.XMLHttpRequest = originalXHR
    originalXHR = null
  }
}

// Make a dummy API call for testing
const makeDummyApiCall = async () => {
  loading.value = true

  try {
    const response = await fetch(exampleApiUrl)
    const data = await response.json()

    // Update last API response
    lastApiResponse.value = {
      url: exampleApiUrl,
      method: 'GET',
      data: data,
      isOverridden: overrides.has(exampleApiUrl),
      timestamp: new Date().toLocaleTimeString(),
    }

    // Update user profile display
    userProfileData.value = {
      ...data,
      isOverridden: overrides.has(exampleApiUrl),
    }

    console.log('✅ Dummy fetch API call completed:', data)
  } catch (error) {
    console.error('❌ Dummy fetch API call failed:', error)
  } finally {
    loading.value = false
  }
}

// Removed makeDummyXhrCall function - no longer needed (button removed)

// Toggle override for a request
const toggleOverride = (request) => {
  selectedRequest.value = request
  activeTab.value = 'override'

  if (request.isOverridden) {
    // Load existing override
    overrideText.value = JSON.stringify(overrides.get(request.url), null, 2)
  } else {
    // Start with original response
    overrideText.value = JSON.stringify(request.originalResponse, null, 2)
  }
}

// Removed useYourTemplate function - no longer needed

// Use example override JSON
const useExampleOverride = () => {
  overrideText.value = JSON.stringify(exampleOverride, null, 2)
}

// Save override
const saveOverride = async () => {
  if (!selectedRequest.value || !isValidJson.value) return

  try {
    const overrideData = JSON.parse(overrideText.value)
    const url = selectedRequest.value.url

    // Save to memory
    overrides.set(url, overrideData)

    // Save to localStorage
    saveOverridesToStorage()

    // Download file
    const filename = generateFileName(url)
    downloadOverrideFile(url, overrideData, filename)

    // Track saved override
    const existingIndex = savedOverrides.value.findIndex((item) => item.url === url)
    const overrideInfo = {
      url,
      filename,
      timestamp: new Date().toISOString(),
    }

    if (existingIndex >= 0) {
      savedOverrides.value[existingIndex] = overrideInfo
    } else {
      savedOverrides.value.push(overrideInfo)
    }

    // Mark request as overridden
    selectedRequest.value.isOverridden = true
    hasSavedOverride.value = true // Set to true when an override is saved

    console.log('✅ Override saved for:', url)
    emit('overrides-changed', savedOverrides.value.length)
    emit('activity')

    // Automatically reload the profile to show the override in action
    if (url === exampleApiUrl) {
      try {
        console.log('🔄 Automatically reloading profile to show override in action...')
        loading.value = true

        // Make a fresh API call which will now use our override
        const response = await fetch(url)
        if (response.ok && response.headers.get('content-type')?.includes('application/json')) {
          const responseData = await response.json()

          // Update displays with the overridden data
          lastApiResponse.value = {
            method: 'GET',
            url: url,
            timestamp: new Date().toLocaleTimeString(),
            data: responseData,
            isOverridden: true,
          }

          userProfileData.value = {
            ...responseData,
            isOverridden: true,
          }

          console.log('✅ Profile automatically reloaded with override data')
          alert(
            `Override saved and applied! File downloaded as: ${filename}\nProfile has been automatically refreshed to show your custom data.`,
          )
        } else {
          throw new Error('Failed to reload profile')
        }
      } catch (error) {
        console.error('Failed to auto-reload profile:', error)
        // Fallback to manual update
        lastApiResponse.value = {
          method: 'GET',
          url: url,
          timestamp: new Date().toLocaleTimeString(),
          data: overrideData,
          isOverridden: true,
        }

        userProfileData.value = {
          ...overrideData,
          isOverridden: true,
        }

        alert(
          `Override saved! File downloaded as: ${filename}\nProfile updated with your custom data.`,
        )
      } finally {
        loading.value = false
      }
    } else {
      // For non-profile URLs, just update manually
      if (lastApiResponse.value && lastApiResponse.value.url === url) {
        lastApiResponse.value.isOverridden = true
        lastApiResponse.value.data = overrideData
      }

      alert(
        `Override saved! File downloaded as: ${filename}\nNext request to this URL will use your custom response.`,
      )
    }
  } catch {
    alert('Invalid JSON format')
  }
}

// Remove override
const removeOverride = async () => {
  if (!selectedRequest.value) return

  const url = selectedRequest.value.url
  overrides.delete(url)

  // Update localStorage
  saveOverridesToStorage()

  // Remove from saved overrides list
  const index = savedOverrides.value.findIndex((item) => item.url === url)
  if (index >= 0) {
    savedOverrides.value.splice(index, 1)
  }

  selectedRequest.value.isOverridden = false

  console.log('🗑️ Override removed for:', url)
  emit('overrides-changed', savedOverrides.value.length)
  emit('activity')

  // Automatically refresh the data by making a fresh API call
  try {
    console.log('🔄 Fetching fresh data after override removal...')
    loading.value = true

    const response = await fetch(url)
    if (response.ok && response.headers.get('content-type')?.includes('application/json')) {
      const originalData = await response.json()

      // Update the last API response with fresh original data
      lastApiResponse.value = {
        method: 'GET',
        url: url,
        timestamp: new Date().toLocaleTimeString(),
        data: originalData,
        isOverridden: false,
      }

      // Update user profile display if it matches this URL
      if (url === exampleApiUrl) {
        userProfileData.value = {
          ...originalData,
          isOverridden: false,
        }
      }

      // Update the selected request's original response
      selectedRequest.value.originalResponse = originalData

      console.log('✅ Fresh original data loaded after override removal')
      alert('Override removed! Original data has been automatically refreshed.')
    } else {
      throw new Error('Failed to fetch original data')
    }
  } catch (error) {
    console.error('Failed to refresh original data:', error)
    alert(
      'Override removed! Please click "👤 Load User Profile" to see the original response again.',
    )
  } finally {
    loading.value = false
  }
}

// Setup on mount
onMounted(() => {
  console.log('🚀 SimpleNetworkOverride: onMounted called')
  setupInterception()
  loadOverridesFromStorage()
  console.log('🚀 Network override tool started and interception active')
})

// Cleanup on unmount
onUnmounted(() => {
  removeInterception()
  console.log('🛑 Network override tool stopped')
})
</script>

<style lang="scss" scoped>
@import '../styles/colors';
@import '../styles/mixins';

// Variables
$primary-color: #0ea5e9;

.simple-network-override {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  font-family:
    -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
  background: $color-white;
  border-radius: 16px;
  box-shadow:
    0 20px 25px -5px rgba(0, 0, 0, 0.1),
    0 10px 10px -5px rgba(0, 0, 0, 0.04);
  overflow: hidden;

  .tool-layout {
    display: flex;
    flex: 1;
    min-height: 0;
  }

  .left-column {
    background: $color-slate-50;
    border-right: 1px solid $color-slate-200;
    width: 400px;
    flex-shrink: 0;
    overflow-y: auto;
    max-height: 100%;
  }

  .right-column {
    padding: 24px;
    background: $color-white;
    flex: 1;
    overflow-y: auto;
    max-height: 100%;
  }

  .profile-placeholder {
    background: $color-slate-100;
    border: 2px dashed $color-slate-300;
    border-radius: 12px;
    padding: 32px 24px;
    margin: 24px;
    text-align: center;
    color: $color-slate-500;

    .placeholder-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;

      .placeholder-icon {
        font-size: 40px;
        opacity: 0.4;
      }

      h3 {
        margin: 0;
        color: $color-slate-900;
        font-size: 16px;
        font-weight: 600;
      }

      p {
        margin: 0;
        font-size: 13px;
        line-height: 1.4;
        opacity: 0.8;
      }
    }
  }

  .profile-display {
    background: $color-white;
    margin: 24px;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  }

  .profile-header {
    background: linear-gradient(135deg, $color-purple-500 0%, $color-purple-600 100%);
    color: $color-white;
    padding: 20px 24px;
    display: flex;
    justify-content: space-between;
    align-items: center;

    h3 {
      margin: 0;
      font-size: 18px;
      font-weight: 600;
    }
  }

  .profile-status {
    &.original {
      background: linear-gradient(135deg, $color-green-500 0%, $color-green-600 100%);
      color: $color-white;
      border: 1px solid $color-green-600;
      padding: 8px 16px;
      border-radius: 8px;
      font-size: 12px;
      font-weight: 700;
      letter-spacing: 0.05em;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
      text-transform: uppercase;
    }

    &.overridden {
      background: linear-gradient(135deg, $color-purple-500 0%, $color-purple-600 100%);
      color: $color-white;
      border: 1px solid $color-purple-600;
      padding: 8px 16px;
      border-radius: 8px;
      font-size: 12px;
      font-weight: 700;
      letter-spacing: 0.05em;
      animation: pulse 2s infinite;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
      text-transform: uppercase;
    }
  }

  .profile-card {
    padding: 24px;
  }

  .profile-main {
    display: flex;
    gap: 16px;
    align-items: flex-start;
    margin-bottom: 20px;
    padding-bottom: 20px;
    border-bottom: 1px solid $color-slate-200;
  }

  .profile-avatar {
    width: 60px;
    height: 60px;
    background: linear-gradient(135deg, $color-purple-500 0%, $color-purple-600 100%);
    color: $color-white;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
    font-weight: bold;
    flex-shrink: 0;
  }

  .profile-info {
    flex: 1;

    .profile-name {
      margin: 0 0 8px 0;
      color: $color-slate-900;
      font-size: 24px;
      font-weight: bold;
    }

    .profile-username {
      margin: 0 0 12px 0;
      color: $color-slate-600;
      font-size: 16px;
      font-style: italic;
    }

    .profile-email,
    .profile-phone,
    .profile-website {
      margin: 0 0 6px 0;
      color: $color-slate-700;
      font-size: 14px;
    }
  }

  .profile-details {
    display: flex;
    flex-direction: column;
    gap: 16px;

    .profile-section {
      h5 {
        margin: 0 0 8px 0;
        color: $color-slate-900;
        font-size: 16px;
        font-weight: bold;
      }

      p {
        margin: 0;
        color: $color-slate-700;
        font-size: 14px;
        line-height: 1.5;
      }

      strong {
        color: $color-slate-900;
      }

      em {
        color: $color-slate-600;
      }

      small {
        color: $color-slate-400;
      }
    }
  }

  .profile-actions {
    background: linear-gradient(135deg, $color-slate-100 0%, $color-slate-200 100%);
    border: 1px solid $color-slate-300;
    border-radius: 8px;
    padding: 16px;
    margin: 16px 24px 24px 24px;
    text-align: center;

    .profile-hint {
      margin: 0;
      color: $color-slate-900;
      font-size: 13px;
      font-weight: 500;
    }
  }

  .test-section {
    background: $color-white;
    border: 1px solid $color-slate-200;
    border-radius: 12px;
    padding: 24px;
    margin-bottom: 24px;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  }

  .test-buttons {
    display: flex;
    gap: 12px;
    margin-bottom: 20px;
  }

  .test-btn {
    background: linear-gradient(135deg, $color-blue-500 0%, $color-purple-500 100%);
    color: $color-white;
    border: none;
    padding: 14px 20px;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 600;
    font-size: 14px;
    flex: 1;
    transition: all 0.2s ease;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);

    &:hover:not(:disabled) {
      transform: translateY(-1px);
      box-shadow: 0 6px 8px -1px rgba(0, 0, 0, 0.15);
    }

    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      transform: none;
    }
  }

  .response-info {
    background: $color-white;
    border-radius: 6px;
    padding: 16px;
    border: 1px solid $color-slate-200;
  }

  .response-header {
    display: flex;
    gap: 12px;
    align-items: center;
    margin-bottom: 16px;
    flex-wrap: wrap;
  }

  .response-method {
    background: $color-blue-700;
    color: $color-white;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 12px;
    font-weight: bold;
  }

  .response-url {
    font-family: monospace;
    color: $color-slate-900;
    font-size: 14px;
    flex: 1;
    min-width: 200px;
  }

  .response-time {
    color: $color-slate-600;
    font-size: 12px;
  }

  .response-status {
    &.original {
      background: linear-gradient(135deg, $color-green-500 0%, $color-green-600 100%);
      color: $color-white;
      padding: 6px 12px;
      border-radius: 6px;
      font-size: 13px;
      font-weight: 700;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    &.overridden {
      background: linear-gradient(135deg, $color-purple-500 0%, $color-purple-600 100%);
      color: $color-white;
      padding: 6px 12px;
      border-radius: 6px;
      font-size: 13px;
      font-weight: 700;
      animation: pulse 2s infinite;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
  }

  .response-data {
    h4 {
      margin: 0 0 12px 0;
      color: $color-slate-900;
      font-size: 16px;
    }
  }

  .response-json {
    background: $color-slate-100;
    border: 1px solid $color-slate-200;
    border-radius: 6px;
    padding: 16px;
    font-size: 14px;
    font-family: 'Monaco', 'Menlo', 'Consolas', monospace;
    color: $color-slate-900;
    line-height: 1.5;
    overflow-x: auto;
    max-height: 300px;
    overflow-y: auto;
    margin: 0;
  }

  .monitor-section {
    background: $color-white;
    border: 2px solid $color-slate-200;
    border-radius: 8px;
    padding: 20px;
    margin-bottom: 20px;
  }

  .empty-state {
    text-align: center;
    padding: 40px;
    color: $color-slate-600;
  }

  .requests-list {
    space-y: 12px;
    max-height: 400px;
    overflow-y: auto;
    padding-right: 8px;

    &::-webkit-scrollbar {
      width: 6px;
    }

    &::-webkit-scrollbar-track {
      background: $color-slate-100;
      border-radius: 3px;
    }

    &::-webkit-scrollbar-thumb {
      background: $color-slate-300;
      border-radius: 3px;

      &:hover {
        background: $color-slate-400;
      }
    }
  }

  .request-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px;
    background: $color-slate-100;
    border: 1px solid $color-slate-200;
    border-radius: 6px;
    margin-bottom: 8px;
  }

  .request-info {
    display: flex;
    gap: 12px;
    align-items: center;
  }

  .method {
    background: $color-blue-700;
    color: $color-white;
    padding: 2px 8px;
    border-radius: 4px;
    font-size: 12px;
    font-weight: bold;
  }

  .url {
    font-family: monospace;
    color: $color-slate-900;
    font-size: 14px;
  }

  .status {
    background: $color-green-600;
    color: $color-white;
    padding: 2px 8px;
    border-radius: 4px;
    font-size: 12px;
  }

  .timestamp {
    color: $color-slate-600;
    font-size: 12px;
  }

  .override-btn {
    @include button-base;
    background: $success-color;
    padding: 6px 12px;
    font-size: 13px;
    font-weight: 600;
    border-radius: 6px;
    display: flex;
    align-items: center;
    gap: 6px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    transition: all 0.2s ease;

    &:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      opacity: 1;
    }

    &:active {
      transform: translateY(0);
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
    }

    &.active {
      background: $danger-color;
      animation: pulse 2s infinite;

      &:hover {
        background: darken($danger-color, 5%);
      }
    }
  }

  .override-section {
    background: $color-fe;
    border: 2px solid $color-slate-200;
    border-radius: 8px;
    padding: 20px;
  }

  .tabs {
    display: flex;
    margin-bottom: 20px;
    border-bottom: 1px solid $color-slate-200;

    button {
      padding: 12px 24px;
      border: none;
      background: transparent;
      cursor: pointer;
      border-bottom: 2px solid transparent;

      &.active {
        border-bottom-color: $color-blue-light;
        color: $color-blue-light;
        font-weight: bold;
      }
    }
  }

  .json-display {
    background: $color-white;
    border: 2px solid $color-slate-200;
    border-radius: 6px;
    padding: 20px;
    font-size: 14px;
    font-family: 'Monaco', 'Menlo', 'Consolas', monospace;
    color: $color-black;
    line-height: 1.5;
    overflow-x: auto;
    max-height: 400px;
    overflow-y: auto;
    box-shadow: inset 0 2px 4px 0 rgba(0, 0, 0, 0.06);
  }

  .section-header {
    margin-bottom: 16px;
    color: $color-slate-900;
    font-size: 16px;
    font-weight: 600;
  }

  .section-subtitle {
    margin: 0;
    color: $color-slate-500;
    font-size: 14px;
    font-style: italic;
  }

  .override-textarea {
    width: 100%;
    min-height: 200px;
    padding: 16px;
    border: 2px solid $color-slate-300;
    border-radius: 6px;
    font-family: 'Monaco', 'Menlo', 'Consolas', monospace;
    font-size: 14px;
    color: $color-black;
    line-height: 1.5;
    resize: vertical;
    background: $color-white;

    &:focus {
      outline: none;
      border-color: $color-blue-light;
      box-shadow: 0 0 0 3px rgba(14, 165, 233, 0.1);
    }
  }

  .override-actions {
    margin-top: 16px;
    display: flex;
    gap: 12px;
  }

  .template-btn {
    background: $color-purple-500;
    color: $color-white;
    border: none;
    padding: 8px 16px;
    border-radius: 4px;
    cursor: pointer;

    &.example-btn {
      background: $color-orange-500;

      &:hover {
        background: $color-orange-600;
      }
    }
  }

  .save-btn {
    background: $color-green-600;
    color: $color-white;
    border: none;
    padding: 8px 16px;
    border-radius: 4px;
    cursor: pointer;

    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  }

  .remove-btn {
    background: $color-red-600;
    color: $color-white;
    border: none;
    padding: 8px 16px;
    border-radius: 4px;
    cursor: pointer;
  }

  .json-status {
    margin-top: 8px;

    .status {
      &.valid {
        color: #ffffff;
        font-weight: bold;
      }

      &.invalid {
        color: #ffffff;
        font-weight: bold;
      }
    }
  }

  .file-preview {
    margin-top: 16px;
    padding: 16px;
    background: linear-gradient(135deg, $color-slate-100 0%, $color-slate-200 100%);
    border: 1px solid $color-slate-300;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);

    h5 {
      margin: 0 0 8px 0;
      color: $color-blue-800;
      font-size: 14px;
      font-weight: 600;
    }

    .file-path {
      font-family: 'Monaco', 'Menlo', 'Consolas', monospace;
      color: $color-slate-800;
      font-size: 13px;
      font-weight: 600;
      background: $color-white;
      padding: 8px 12px;
      border-radius: 4px;
      border: 1px solid $color-slate-300;
      word-break: break-all;
    }

    .file-note {
      margin: 12px 0 0 0;
      color: $color-slate-600;
      font-size: 12px;
      font-style: italic;
    }
  }

  .section-hint {
    margin: 0;
    color: $color-slate-900;
    font-size: 13px;
    font-weight: 500;
    line-height: 1.4;
  }

  .clear-btn {
    @include button-base;
    background: $danger-color;
    padding: 10px 16px;
    font-size: 14px;
    font-weight: 600;
    width: 100%;
    margin-top: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    border-radius: 6px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    transition: all 0.2s ease;

    &:hover {
      background: darken($danger-color, 5%);
      transform: translateY(-1px);
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }

    &:active {
      transform: translateY(0);
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
    }

    &::before {
      content: '🗑️';
      font-size: 16px;
    }
  }
}

@media (max-width: 1024px) {
  .simple-network-override {
    .tool-layout {
      flex-direction: column;
    }

    .left-column {
      position: static;
      max-height: none;
      width: 100%;
    }

    .right-column {
      padding: 20px;
    }

    .profile-placeholder {
      margin: 20px;
    }
  }
}

@media (max-width: 768px) {
  .simple-network-override {
    .profile-main {
      flex-direction: column;
      text-align: center;
    }

    .profile-header {
      flex-direction: column;
      gap: 12px;
      text-align: center;
    }
  }
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba($danger-color, 0.4);
  }
  70% {
    box-shadow: 0 0 0 6px rgba($danger-color, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba($danger-color, 0);
  }
}
</style>
