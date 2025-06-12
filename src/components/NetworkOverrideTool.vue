<template>
  <div class="network-override-tool" :class="{ embedded: isEmbedded }">
    <!-- Tool Header -->
    <div class="tool-header" v-if="!hideHeader">
      <h2>🌐 Network Override Tool</h2>
      <p>Monitor & override network requests from any application</p>
      <button @click="toggleTool" class="toggle-btn" v-if="isEmbedded">
        {{ isOpen ? '🔽 Minimize' : '🔼 Open Network Tool' }}
      </button>
    </div>

    <!-- Main Tool Content -->
    <div class="tool-content" v-if="!isEmbedded || isOpen">
      <!-- Active Overrides Status -->
      <div v-if="overrideCount > 0" class="status-bar">
        <span class="status-indicator"
          >🔄 {{ overrideCount }} Active Override{{ overrideCount > 1 ? 's' : '' }}</span
        >
        <button @click="clearAllOverrides" class="quick-clear">Clear All</button>
      </div>

      <!-- Network Requests Monitor -->
      <div class="monitor-section">
        <h3>📡 Network Requests ({{ requests.length }})</h3>

        <div v-if="requests.length === 0" class="empty-state">
          <p>Monitoring network requests... Make API calls in your application to see them here.</p>
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
      <div v-if="selectedRequest" class="override-section">
        <h3>✏️ Override Response for: {{ getShortUrl(selectedRequest.url) }}</h3>

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
            <button @click="saveOverride" class="save-btn" :disabled="!isValidJson">
              💾 Save Override
            </button>
            <button @click="removeOverride" class="remove-btn">🗑️ Remove Override</button>
          </div>

          <div class="json-status">
            <span :class="['status', isValidJson ? 'valid' : 'invalid']">
              {{ isValidJson ? '✅ Valid JSON' : '❌ Invalid JSON' }}
            </span>
          </div>
        </div>
      </div>

      <!-- Saved Overrides -->
      <div v-if="savedOverrides.length > 0" class="saved-section">
        <h3>💾 Saved Overrides ({{ savedOverrides.length }})</h3>
        <div class="saved-overrides-list">
          <div v-for="override in savedOverrides" :key="override.url" class="saved-item">
            <div class="saved-info">
              <span class="saved-url">{{ getShortUrl(override.url) }}</span>
              <span class="saved-filename">{{ override.filename }}</span>
            </div>
            <span class="saved-status">🔄 Active</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

// Props for customization
const props = defineProps({
  isEmbedded: {
    type: Boolean,
    default: false,
  },
  hideHeader: {
    type: Boolean,
    default: false,
  },
  autoStart: {
    type: Boolean,
    default: true,
  },
})

// State
const requests = ref([])
const selectedRequest = ref(null)
const activeTab = ref('original')
const overrideText = ref('')
const savedOverrides = ref([])
const isOpen = ref(true)

// Override map and original functions
const overrides = new Map()
let originalFetch = null
let originalXHR = null

// Computed properties
const isValidJson = computed(() => {
  try {
    JSON.parse(overrideText.value)
    return true
  } catch {
    return false
  }
})

const overrideCount = computed(() => overrides.size)

// Utility functions
const getShortUrl = (url) => {
  try {
    const urlObj = new URL(url)
    return urlObj.pathname + urlObj.search
  } catch {
    return url.length > 50 ? url.substring(0, 50) + '...' : url
  }
}

const generateFileName = (url) => {
  const urlObj = new URL(url)
  const pathParts = urlObj.pathname.split('/').filter(Boolean)
  const domain = urlObj.hostname.replace(/[^a-zA-Z0-9]/g, '_')
  const path = pathParts.join('_') || 'root'
  const timestamp = new Date().toISOString().slice(0, 19).replace(/[:-]/g, '')
  return `override_${domain}_${path}_${timestamp}.json`
}

// Network interception setup
const setupInterception = () => {
  if (originalFetch && originalXHR) return

  // Intercept fetch requests
  if (!originalFetch) {
    originalFetch = window.fetch

    window.fetch = async (url, options = {}) => {
      const startTime = Date.now()

      // Check if this URL has an override
      if (overrides.has(url)) {
        const overrideData = overrides.get(url)
        console.log('🔄 Using fetch override for:', url)

        const overrideResponse = new Response(JSON.stringify(overrideData), {
          status: 200,
          statusText: 'OK (Overridden)',
          headers: {
            'Content-Type': 'application/json',
            'X-Override': 'true',
          },
        })

        logRequest(url, options, overrideResponse, startTime, overrideData, true)
        return overrideResponse
      }

      // Make the original request
      try {
        const response = await originalFetch(url, options)

        if (response.ok && response.headers.get('content-type')?.includes('application/json')) {
          const responseClone = response.clone()
          const data = await responseClone.json()
          logRequest(url, options, response, startTime, data, false)
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
    originalXHR = window.XMLHttpRequest

    window.XMLHttpRequest = function () {
      const xhr = new originalXHR()
      const startTime = Date.now()
      let method = 'GET'
      let url = ''

      const originalOpen = xhr.open
      xhr.open = function (httpMethod, httpUrl, ...args) {
        method = httpMethod
        url = httpUrl
        return originalOpen.call(this, httpMethod, httpUrl, ...args)
      }

      const originalSend = xhr.send
      xhr.send = function (data) {
        if (overrides.has(url)) {
          const overrideData = overrides.get(url)
          console.log('🔄 Using XHR override for:', url)

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

          const originalGetResponseHeader = xhr.getResponseHeader
          xhr.getResponseHeader = function (name) {
            if (name.toLowerCase() === 'content-type') return 'application/json'
            if (name.toLowerCase() === 'x-override') return 'true'
            return originalGetResponseHeader.call(this, name)
          }

          const fakeResponse = {
            status: 200,
            statusText: 'OK (Overridden)',
            headers: { get: (name) => (name === 'content-type' ? 'application/json' : null) },
          }
          logRequest(url, { method }, fakeResponse, startTime, overrideData, true)

          setTimeout(() => {
            if (xhr.onreadystatechange) xhr.onreadystatechange()
            if (xhr.onload) xhr.onload()
          }, 10)

          return
        }

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

  requests.value.unshift(request)

  // Keep only last 20 requests for embedded mode
  const maxRequests = props.isEmbedded ? 20 : 10
  if (requests.value.length > maxRequests) {
    requests.value = requests.value.slice(0, maxRequests)
  }
}

// Save override functions
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
}

const saveOverridesToStorage = () => {
  const overrideArray = Array.from(overrides.entries()).map(([url, data]) => ({
    url,
    data,
    timestamp: new Date().toISOString(),
  }))
  localStorage.setItem('networkOverrides', JSON.stringify(overrideArray))
}

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

// UI actions
const toggleTool = () => {
  isOpen.value = !isOpen.value
}

const toggleOverride = (request) => {
  selectedRequest.value = request
  activeTab.value = 'override'

  if (request.isOverridden) {
    overrideText.value = JSON.stringify(overrides.get(request.url), null, 2)
  } else {
    overrideText.value = JSON.stringify(request.originalResponse, null, 2)
  }
}

const saveOverride = () => {
  if (!selectedRequest.value || !isValidJson.value) return

  try {
    const overrideData = JSON.parse(overrideText.value)
    const url = selectedRequest.value.url

    overrides.set(url, overrideData)
    saveOverridesToStorage()

    const filename = generateFileName(url)
    downloadOverrideFile(url, overrideData, filename)

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

    selectedRequest.value.isOverridden = true

    console.log('✅ Override saved for:', url)
    alert(`Override saved! File downloaded as: ${filename}`)
  } catch {
    alert('Invalid JSON format')
  }
}

const removeOverride = () => {
  if (!selectedRequest.value) return

  const url = selectedRequest.value.url
  overrides.delete(url)
  saveOverridesToStorage()

  const index = savedOverrides.value.findIndex((item) => item.url === url)
  if (index >= 0) {
    savedOverrides.value.splice(index, 1)
  }

  selectedRequest.value.isOverridden = false
  console.log('🗑️ Override removed for:', url)
  alert('Override removed!')
}

const clearAllOverrides = () => {
  overrides.clear()
  savedOverrides.value = []
  localStorage.removeItem('networkOverrides')

  requests.value.forEach((request) => {
    request.isOverridden = false
  })

  console.log('🗑️ All overrides cleared')
  alert('All overrides cleared!')
}

// Lifecycle
onMounted(() => {
  if (props.autoStart) {
    setupInterception()
    loadOverridesFromStorage()
    console.log('🚀 Network override tool started (embedded mode)')
  }
})

onUnmounted(() => {
  removeInterception()
  console.log('🛑 Network override tool stopped')
})

// Expose methods for programmatic control
defineExpose({
  start: setupInterception,
  stop: removeInterception,
  clear: clearAllOverrides,
  getOverrides: () => Array.from(overrides.entries()),
  setOverride: (url, data) => {
    overrides.set(url, data)
    saveOverridesToStorage()
  },
})
</script>

<style scoped>
.network-override-tool {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  margin: 0 auto;
}

.network-override-tool.embedded {
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: 400px;
  max-height: 80vh;
  overflow-y: auto;
  z-index: 10000;
  border: 2px solid #0ea5e9;
}

.tool-header {
  background: #0ea5e9;
  color: white;
  padding: 16px;
  border-radius: 8px 8px 0 0;
}

.tool-header h2 {
  margin: 0 0 8px 0;
  font-size: 18px;
}

.tool-header p {
  margin: 0;
  opacity: 0.9;
  font-size: 14px;
}

.toggle-btn {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: none;
  padding: 8px 12px;
  border-radius: 4px;
  cursor: pointer;
  margin-top: 12px;
  width: 100%;
}

.toggle-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

.tool-content {
  padding: 20px;
}

.status-bar {
  background: #fee2e2;
  border: 1px solid #fecaca;
  border-radius: 6px;
  padding: 12px;
  margin-bottom: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.status-indicator {
  color: #dc2626;
  font-weight: bold;
  font-size: 14px;
}

.quick-clear {
  background: #dc2626;
  color: white;
  border: none;
  padding: 4px 8px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
}

.monitor-section {
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
}

.monitor-section h3 {
  margin: 0 0 16px 0;
  color: #111827;
  font-size: 16px;
}

.empty-state {
  text-align: center;
  padding: 30px;
  color: #6b7280;
}

.requests-list {
  max-height: 200px;
  overflow-y: auto;
}

.request-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  margin-bottom: 4px;
  font-size: 12px;
}

.request-info {
  display: flex;
  gap: 8px;
  align-items: center;
  flex: 1;
}

.method {
  background: #1d4ed8;
  color: white;
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 10px;
  font-weight: bold;
}

.url {
  font-family: monospace;
  color: #374151;
  font-size: 11px;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.status {
  background: #10b981;
  color: white;
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 10px;
}

.timestamp {
  color: #6b7280;
  font-size: 10px;
  min-width: 60px;
}

.override-btn {
  background: #059669;
  color: white;
  border: none;
  padding: 4px 8px;
  border-radius: 3px;
  cursor: pointer;
  font-size: 10px;
}

.override-btn.active {
  background: #dc2626;
}

.override-section {
  background: #fefefe;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
}

.override-section h3 {
  margin: 0 0 16px 0;
  color: #111827;
  font-size: 16px;
}

.tabs {
  display: flex;
  margin-bottom: 20px;
  border-bottom: 1px solid #e5e7eb;
}

.tabs button {
  padding: 8px 16px;
  border: none;
  background: transparent;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  font-size: 14px;
}

.tabs button.active {
  border-bottom-color: #0ea5e9;
  color: #0ea5e9;
  font-weight: bold;
}

.section-header h4 {
  margin: 0 0 4px 0;
  color: #111827;
  font-size: 14px;
  font-weight: bold;
}

.section-subtitle {
  margin: 0 0 12px 0;
  color: #6b7280;
  font-size: 12px;
  font-style: italic;
}

.json-display {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  padding: 12px;
  font-size: 12px;
  font-family: 'Monaco', 'Menlo', 'Consolas', monospace;
  color: #000000;
  line-height: 1.4;
  overflow-x: auto;
  max-height: 200px;
  overflow-y: auto;
  margin: 0;
}

.override-textarea {
  width: 100%;
  min-height: 120px;
  padding: 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-family: 'Monaco', 'Menlo', 'Consolas', monospace;
  font-size: 12px;
  color: #000000;
  line-height: 1.4;
  resize: vertical;
  background: #ffffff;
}

.override-textarea:focus {
  outline: none;
  border-color: #0ea5e9;
  box-shadow: 0 0 0 2px rgba(14, 165, 233, 0.1);
}

.override-actions {
  margin-top: 12px;
  display: flex;
  gap: 8px;
}

.save-btn {
  background: #059669;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
}

.save-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.remove-btn {
  background: #dc2626;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
}

.json-status {
  margin-top: 8px;
}

.json-status .status.valid {
  color: #059669;
  font-weight: bold;
  font-size: 12px;
}

.json-status .status.invalid {
  color: #dc2626;
  font-weight: bold;
  font-size: 12px;
}

.saved-section {
  background: #f0fdf4;
  border: 1px solid #10b981;
  border-radius: 8px;
  padding: 16px;
}

.saved-section h3 {
  margin: 0 0 12px 0;
  color: #111827;
  font-size: 16px;
}

.saved-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px;
  background: #ecfdf5;
  border: 1px solid #10b981;
  border-radius: 4px;
  margin-bottom: 4px;
}

.saved-info {
  flex: 1;
}

.saved-url {
  font-family: monospace;
  color: #047857;
  font-size: 12px;
  font-weight: bold;
  display: block;
}

.saved-filename {
  font-size: 10px;
  color: #6b7280;
  font-family: monospace;
}

.saved-status {
  background: #10b981;
  color: white;
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 10px;
  font-weight: bold;
}
</style>
