<template>
  <div class="network-override-widget">
    <!-- Debug info (remove in production) -->
    <div class="debug-info" v-if="showDebug">
      Widget State: {{ isMinimized ? 'MINIMIZED' : 'EXPANDED' }}
    </div>

    <!-- Floating Icon (when minimized) -->
    <div
      v-if="isMinimized"
      @click="expand"
      class="floating-icon"
      :class="{ 'has-activity': hasRecentActivity }"
    >
      <div class="icon-content">
        <span class="icon">🌐</span>
        <div v-if="activeOverrides > 0" class="override-badge">{{ activeOverrides }}</div>
        <div v-if="hasRecentActivity" class="activity-pulse"></div>
      </div>
      <div class="tooltip">Network Override Tool - Click to Open</div>
    </div>

    <!-- Fullscreen Modal (when expanded) -->
    <Teleport to="body">
      <div v-if="!isMinimized" class="fullscreen-modal">
        <div class="modal-backdrop" @click="minimize"></div>
        <div class="modal-content">
          <div class="modal-header">
            <h2>🌐 Network Override Tool</h2>
            <div class="modal-controls">
              <button @click="minimize" class="minimize-btn">📝 Minimize</button>
              <button @click="close" class="close-btn">✕</button>
            </div>
          </div>
          <div class="modal-body">
            <SimpleNetworkOverride
              :external-requests="capturedRequests"
              @activity="handleActivity"
              @overrides-changed="handleOverridesChanged"
            />
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick, watch } from 'vue'
import SimpleNetworkOverride from './SimpleNetworkOverride.vue'

// Widget state - explicitly initialized
const isMinimized = ref(true)
const hasRecentActivity = ref(false)
const activeOverrides = ref(0)
const showDebug = ref(false) // Set to false in production

// Global network interception variables
let originalFetch = null
const capturedRequests = ref([])

// Watch for unexpected state changes
watch(
  isMinimized,
  (newValue, oldValue) => {
    console.log(`🔄 Widget state changed: ${oldValue} → ${newValue}`)
  },
  { immediate: true },
)

// Setup global network interception
const setupGlobalInterception = () => {
  console.log('🌐 Setting up global network interception...')

  // Intercept fetch requests
  if (!originalFetch) {
    originalFetch = window.fetch

    window.fetch = async (url, options = {}) => {
      const startTime = Date.now()
      console.log('🌐 Global intercepted fetch request to:', url)

      try {
        const response = await originalFetch(url, options)
        console.log(
          '📡 Global fetch response for:',
          url,
          'Status:',
          response.status,
          'Content-Type:',
          response.headers.get('content-type'),
        )

        // Log successful JSON responses
        if (response.ok && response.headers.get('content-type')?.includes('application/json')) {
          const responseClone = response.clone()
          const data = await responseClone.json()
          console.log('✅ Global logging JSON response for:', url)

          // Add to captured requests
          const request = {
            id: Date.now() + Math.random(),
            url: url,
            method: options.method || 'GET',
            status: response.status,
            statusText: response.statusText,
            timestamp: new Date().toLocaleTimeString(),
            duration: Date.now() - startTime,
            originalResponse: data,
            isOverridden: false,
          }

          capturedRequests.value.unshift(request)
          if (capturedRequests.value.length > 10) {
            capturedRequests.value = capturedRequests.value.slice(0, 10)
          }

          // Trigger activity
          handleActivity()
          console.log('📡 Global network request captured:', url, '- Activity triggered')
        }

        return response
      } catch (error) {
        console.error('Global fetch request failed:', error)
        throw error
      }
    }
  }
}

// Widget controls
const expand = () => {
  console.log('🔄 Widget: Expanding from minimized state...')
  console.log('🔄 Before expand - isMinimized:', isMinimized.value)
  isMinimized.value = false
  hasRecentActivity.value = false
  console.log('🔄 After expand - isMinimized:', isMinimized.value)
}

const minimize = () => {
  console.log('📝 Widget: Minimizing to floating icon...')
  console.log('📝 Before minimize - isMinimized:', isMinimized.value)
  isMinimized.value = true
  console.log('📝 After minimize - isMinimized:', isMinimized.value)
}

const close = () => {
  console.log('❌ Widget: Closing to floating icon...')
  console.log('❌ Before close - isMinimized:', isMinimized.value)
  isMinimized.value = true
  console.log('❌ After close - isMinimized:', isMinimized.value)
}

// Handle activity from the main component or global interception
const handleActivity = () => {
  console.log('📡 Widget: Network activity detected')
  hasRecentActivity.value = true
  setTimeout(() => {
    if (isMinimized.value) {
      hasRecentActivity.value = false
      console.log('📡 Widget: Activity indicator cleared')
    }
  }, 3000)
}

// Handle override count changes
const handleOverridesChanged = (count) => {
  console.log('🏷️ Widget: Override count updated:', count)
  activeOverrides.value = count
}

// Initialize widget
onMounted(async () => {
  console.log('🚀 Widget mounting...')

  // Setup global network interception first
  setupGlobalInterception()

  // Force initial state BEFORE any DOM updates
  isMinimized.value = true
  hasRecentActivity.value = false
  activeOverrides.value = 0

  console.log('📍 State set - isMinimized:', isMinimized.value)

  await nextTick()

  console.log('🚀 Network Override Widget initialized')
  console.log('📍 Final state - isMinimized:', isMinimized.value)
  console.log('📍 Final state - hasActivity:', hasRecentActivity.value)
  console.log('📍 Final state - activeOverrides:', activeOverrides.value)
  console.log('👆 Widget ready! Look for floating 🌐 icon in bottom-right corner!')

  // Periodic state check for debugging
  const interval = setInterval(() => {
    console.log(
      '🔍 Periodic check - isMinimized:',
      isMinimized.value,
      'captured:',
      capturedRequests.value.length,
    )
    if (!isMinimized.value) {
      console.warn('⚠️ Widget is expanded - this should only happen after user clicks!')
    }
  }, 5000)

  // Clean up interval after 30 seconds
  setTimeout(() => clearInterval(interval), 30000)
})
</script>

<style scoped>
.network-override-widget {
  position: fixed;
  z-index: 999999;
}

/* Debug info */
.debug-info {
  position: fixed;
  top: 10px;
  right: 10px;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-family: monospace;
  z-index: 1000001;
  border: 1px solid #333;
}

/* Floating Icon Styles */
.floating-icon {
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow:
    0 8px 25px rgba(0, 0, 0, 0.15),
    0 0 0 3px rgba(102, 126, 234, 0.2);
  transition: all 0.3s ease;
  z-index: 1000000;
  animation: gentle-pulse 2s ease-in-out infinite;
  border: 2px solid rgba(255, 255, 255, 0.3);
}

.floating-icon:hover {
  transform: scale(1.15);
  box-shadow:
    0 12px 35px rgba(0, 0, 0, 0.3),
    0 0 0 5px rgba(102, 126, 234, 0.4);
  animation: none;
}

.floating-icon.has-activity {
  animation:
    bounce 0.6s ease-in-out,
    gentle-pulse 2s ease-in-out infinite 0.6s;
}

.icon-content {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon {
  font-size: 24px;
  color: white;
}

.override-badge {
  position: absolute;
  top: -8px;
  right: -8px;
  background: #dc2626;
  color: white;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  font-size: 12px;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid white;
}

.activity-pulse {
  position: absolute;
  top: -5px;
  right: -5px;
  width: 12px;
  height: 12px;
  background: #10b981;
  border-radius: 50%;
  animation: pulse 2s infinite;
}

.tooltip {
  position: absolute;
  bottom: 70px;
  right: 0;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 14px;
  white-space: nowrap;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.3s ease;
}

.floating-icon:hover .tooltip {
  opacity: 1;
}

/* Fullscreen Modal Styles */
.fullscreen-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 1000000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-backdrop {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
}

.modal-content {
  position: relative;
  width: 95vw;
  height: 95vh;
  max-width: 1400px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.modal-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 20px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-shrink: 0;
}

.modal-header h2 {
  margin: 0;
  font-size: 24px;
  font-weight: 700;
}

.modal-controls {
  display: flex;
  gap: 12px;
}

.minimize-btn,
.close-btn {
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s ease;
}

.minimize-btn:hover,
.close-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-1px);
}

.close-btn {
  padding: 8px 12px;
  font-size: 16px;
}

.modal-body {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  padding: 0;
  display: flex;
  flex-direction: column;
}

/* Smooth scrollbar styling */
.modal-body::-webkit-scrollbar {
  width: 8px;
}

.modal-body::-webkit-scrollbar-track {
  background: rgba(241, 245, 249, 0.5);
  border-radius: 4px;
}

.modal-body::-webkit-scrollbar-thumb {
  background: rgba(203, 213, 225, 0.8);
  border-radius: 4px;
}

.modal-body::-webkit-scrollbar-thumb:hover {
  background: rgba(148, 163, 184, 0.9);
}

/* Animations */
@keyframes gentle-pulse {
  0%,
  100% {
    transform: scale(1);
    box-shadow:
      0 8px 25px rgba(0, 0, 0, 0.15),
      0 0 0 3px rgba(102, 126, 234, 0.2);
  }
  50% {
    transform: scale(1.1);
    box-shadow:
      0 12px 35px rgba(0, 0, 0, 0.25),
      0 0 0 8px rgba(102, 126, 234, 0.4);
  }
}

@keyframes bounce {
  0%,
  20%,
  60%,
  100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-10px);
  }
  80% {
    transform: translateY(-5px);
  }
}

@keyframes pulse {
  0% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7);
  }
  70% {
    transform: scale(1);
    box-shadow: 0 0 0 10px rgba(16, 185, 129, 0);
  }
  100% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 rgba(16, 185, 129, 0);
  }
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .modal-content {
    width: 98vw;
    height: 98vh;
  }

  .floating-icon {
    bottom: 15px;
    right: 15px;
    width: 50px;
    height: 50px;
  }

  .icon {
    font-size: 20px;
  }

  .modal-header {
    padding: 16px 20px;
  }

  .modal-header h2 {
    font-size: 20px;
  }

  .modal-body {
    padding: 16px;
  }
}
</style>
