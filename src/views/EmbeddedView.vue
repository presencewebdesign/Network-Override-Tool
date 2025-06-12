<template>
  <div class="embedded-demo">
    <h2>🎯 Embedded Network Override Tool Demo</h2>
    <p>
      This shows how the tool can be embedded in any application to monitor and override its network
      requests.
    </p>

    <!-- Sample Application -->
    <div class="sample-app">
      <h3>📱 Sample Application</h3>
      <p>
        This simulates a real application making API calls. The network tool monitors and can
        override them.
      </p>

      <div class="app-content">
        <div class="api-controls">
          <button @click="loadUserProfile" class="app-btn" :disabled="loading">
            {{ loading ? 'Loading...' : '👤 Load User Profile' }}
          </button>
          <button @click="loadPosts" class="app-btn" :disabled="loading">
            {{ loading ? 'Loading...' : '📝 Load Posts' }}
          </button>
          <button @click="loadComments" class="app-btn" :disabled="loading">
            {{ loading ? 'Loading...' : '💬 Load Comments' }}
          </button>
        </div>

        <!-- Data Display -->
        <div v-if="currentData" class="data-display">
          <div class="data-header">
            <h4>{{ dataTitle }}</h4>
            <span v-if="isOverridden" class="override-badge">🔄 OVERRIDDEN</span>
            <span v-else class="original-badge">📡 ORIGINAL</span>
          </div>
          <div class="data-content">
            <div v-if="isOverridden" class="override-notice">
              🎭 This data has been overridden by your custom response!
            </div>
            <pre>{{ JSON.stringify(currentData, null, 2) }}</pre>
          </div>
        </div>
      </div>
    </div>

    <!-- Instructions -->
    <div class="instructions">
      <h3>🔧 How to Use</h3>
      <ol>
        <li><strong>Make API Calls:</strong> Click the buttons above to make real API requests</li>
        <li>
          <strong>Monitor Requests:</strong> Watch the network tool (bottom right) capture them
        </li>
        <li>
          <strong>Override Responses:</strong> Click "Override" on any request to customize the
          response
        </li>
        <li><strong>See Changes:</strong> Make the same API call again to see your custom data!</li>
        <li>
          <strong>Save Overrides:</strong> Downloads are saved locally and persist across page
          reloads
        </li>
      </ol>
    </div>

    <!-- Embed Instructions -->
    <div class="embed-instructions">
      <h3>🛠️ Embedding in Your App</h3>
      <div class="code-block">
        <h4>1. Import the component:</h4>
        <pre><code>import NetworkOverrideTool from './components/NetworkOverrideTool.vue'</code></pre>

        <h4>2. Add to your template:</h4>
        <pre><code>&lt;NetworkOverrideTool :isEmbedded="true" /&gt;</code></pre>

        <h4>3. Props available:</h4>
        <ul>
          <li><code>:isEmbedded="true"</code> - Shows as floating panel</li>
          <li><code>:hideHeader="true"</code> - Hides the header</li>
          <li><code>:autoStart="false"</code> - Manual start/stop control</li>
        </ul>
      </div>
    </div>

    <!-- Embedded Network Tool -->
    <NetworkOverrideTool :isEmbedded="true" />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import NetworkOverrideTool from '../components/NetworkOverrideTool.vue'

const loading = ref(false)
const currentData = ref(null)
const dataTitle = ref('')
const lastRequestUrl = ref('')
const isOverridden = ref(false)

const loadUserProfile = async () => {
  loading.value = true
  dataTitle.value = '👤 User Profile'
  const url = 'https://jsonplaceholder.typicode.com/users/1'
  lastRequestUrl.value = url

  try {
    const response = await fetch(url)
    currentData.value = await response.json()
    // Check if response was overridden
    isOverridden.value = response.headers.get('X-Override') === 'true'
  } catch (error) {
    console.error('Failed to load user profile:', error)
  } finally {
    loading.value = false
  }
}

const loadPosts = async () => {
  loading.value = true
  dataTitle.value = '📝 Posts'
  const url = 'https://jsonplaceholder.typicode.com/posts?_limit=3'
  lastRequestUrl.value = url

  try {
    const response = await fetch(url)
    currentData.value = await response.json()
    // Check if response was overridden
    isOverridden.value = response.headers.get('X-Override') === 'true'
  } catch (error) {
    console.error('Failed to load posts:', error)
  } finally {
    loading.value = false
  }
}

const loadComments = async () => {
  loading.value = true
  dataTitle.value = '💬 Comments'
  const url = 'https://jsonplaceholder.typicode.com/comments?_limit=2'
  lastRequestUrl.value = url

  try {
    // Using XHR to demonstrate XHR monitoring
    const xhr = new XMLHttpRequest()
    xhr.open('GET', url)

    xhr.onload = function () {
      if (xhr.status === 200) {
        currentData.value = JSON.parse(xhr.responseText)
        // Check if response was overridden
        isOverridden.value = xhr.getResponseHeader('X-Override') === 'true'
      }
      loading.value = false
    }

    xhr.onerror = function () {
      console.error('XHR request failed')
      loading.value = false
    }

    xhr.send()
  } catch (error) {
    console.error('Failed to load comments:', error)
    loading.value = false
  }
}
</script>

<style scoped>
.embedded-demo {
  margin: 0 auto;
  padding: 20px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.sample-app {
  background: #f8fafc;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  padding: 24px;
  margin: 24px 0;
}

.sample-app h3 {
  margin: 0 0 12px 0;
  color: #1e293b;
}

.app-content {
  background: white;
  border-radius: 6px;
  padding: 20px;
  margin-top: 16px;
}

.api-controls {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.app-btn {
  background: #3b82f6;
  color: white;
  border: none;
  padding: 12px 20px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.2s;
}

.app-btn:hover:not(:disabled) {
  background: #2563eb;
}

.app-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.data-display {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  padding: 16px;
}

.data-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.data-header h4 {
  margin: 0;
  color: #1e293b;
}

.override-badge {
  background: #dc2626;
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: bold;
  animation: pulse 2s infinite;
}

.original-badge {
  background: #10b981;
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: bold;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}

.override-notice {
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 4px;
  padding: 8px 12px;
  margin-bottom: 12px;
  color: #dc2626;
  font-size: 14px;
  font-weight: 500;
}

.data-content {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  padding: 12px;
  max-height: 300px;
  overflow-y: auto;
}

.data-content pre {
  margin: 0;
  font-family: 'Monaco', 'Menlo', 'Consolas', monospace;
  font-size: 12px;
  line-height: 1.5;
  color: #374151;
}

.instructions {
  background: #f0f9ff;
  border: 2px solid #0ea5e9;
  border-radius: 8px;
  padding: 24px;
  margin: 24px 0;
}

.instructions h3 {
  margin: 0 0 16px 0;
  color: #0c4a6e;
}

.instructions ol {
  margin: 0;
  padding-left: 20px;
}

.instructions li {
  margin-bottom: 8px;
  color: #1e293b;
}

.embed-instructions {
  background: #fefce8;
  border: 2px solid #eab308;
  border-radius: 8px;
  padding: 24px;
  margin: 24px 0;
}

.embed-instructions h3 {
  margin: 0 0 16px 0;
  color: #92400e;
}

.code-block {
  background: white;
  border-radius: 6px;
  padding: 16px;
  margin: 12px 0;
}

.code-block h4 {
  margin: 0 0 8px 0;
  color: #374151;
  font-size: 14px;
}

.code-block pre {
  background: #f3f4f6;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  padding: 12px;
  margin: 8px 0;
  overflow-x: auto;
}

.code-block code {
  font-family: 'Monaco', 'Menlo', 'Consolas', monospace;
  font-size: 12px;
  color: #374151;
}

.code-block ul {
  margin: 8px 0;
  padding-left: 20px;
}

.code-block li {
  margin-bottom: 4px;
  color: #6b7280;
  font-size: 14px;
}

.code-block li code {
  background: #f3f4f6;
  padding: 2px 4px;
  border-radius: 2px;
  color: #dc2626;
}
</style>
