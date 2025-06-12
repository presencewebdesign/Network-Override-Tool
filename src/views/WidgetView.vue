<script setup>
import NetworkOverrideWidget from '../components/NetworkOverrideWidget.vue'
</script>

<template>
  <main class="widget-demo">
    <div class="demo-content">
      <h1>🚀 Network Override Widget Demo</h1>
      <p>This page demonstrates the floating widget that can be embedded on any website.</p>

      <div class="demo-sections">
        <section class="demo-section">
          <h2>📋 Features</h2>
          <ul>
            <li>🌐 <strong>Floating Icon</strong> - Minimized to bottom-right corner</li>
            <li>
              📱 <strong>Fullscreen Modal</strong> - Expand to full network override interface
            </li>
            <li>
              🔴 <strong>Activity Indicator</strong> - Shows when network requests are intercepted
            </li>
            <li>🏷️ <strong>Override Badge</strong> - Displays count of active overrides</li>
            <li>
              📝 <strong>Easy Installation</strong> - Just drop the widget component into any site
            </li>
          </ul>
        </section>

        <section class="demo-section">
          <h2>💻 Installation</h2>
          <div class="code-block">
            <h3>1. Import the widget:</h3>
            <pre><code>import NetworkOverrideWidget from './NetworkOverrideWidget.vue'</code></pre>
          </div>

          <div class="code-block">
            <h3>2. Add to your template:</h3>
            <pre><code>&lt;NetworkOverrideWidget /&gt;</code></pre>
          </div>

          <div class="code-block">
            <h3>3. That's it! 🎉</h3>
            <p>The widget will automatically start intercepting network requests on your site.</p>
          </div>
        </section>

        <section class="demo-section">
          <h2>🎯 Try It Out</h2>

          <div class="instructions">
            <h3>How to use the widget:</h3>
            <ol>
              <li>
                <strong>🌐 Floating Icon</strong> - Look for the gently pulsing icon in the
                bottom-right corner
              </li>
              <li>
                <strong>👆 Click to Expand</strong> - Click the icon to open the fullscreen
                interface
              </li>
              <li>
                <strong>📝 Minimize Button</strong> - Use "📝 Minimize" in the top-right to go back
                to icon
              </li>
              <li><strong>✕ Close Button</strong> - Use "✕" to close completely</li>
            </ol>
          </div>

          <div class="test-area">
            <h3>Test Network Requests</h3>
            <p>Make test API calls to see the widget capture and display network activity.</p>
            <button @click="makeTestRequest" class="test-button">🧪 Make Test Request</button>
            <p class="test-note">📝 Check browser console for widget activity logs!</p>

            <div class="debug-section">
              <h4>🔧 Debug Tools</h4>
              <p>If you can't see the floating widget icon, check these steps:</p>
              <ol>
                <li>📱 Scroll to bottom-right corner of your screen</li>
                <li>🔍 Look for a gently pulsing purple circular icon with 🌐</li>
                <li>🖱️ Try hovering in the bottom-right area and look for a tooltip</li>
                <li>📺 Check browser console for widget initialization logs</li>
                <li>🔄 Refresh the page if needed</li>
              </ol>
              <button @click="forceRefresh" class="debug-button">🔄 Force Page Refresh</button>
            </div>
          </div>
        </section>
      </div>
    </div>

    <!-- The actual widget -->
    <NetworkOverrideWidget />
  </main>
</template>

<script>
export default {
  methods: {
    async makeTestRequest() {
      try {
        const response = await fetch('https://jsonplaceholder.typicode.com/users/1')
        const data = await response.json()
        console.log('Test request completed:', data)
      } catch (error) {
        console.error('Test request failed:', error)
      }
    },
    forceRefresh() {
      console.log('🔄 Force refreshing page...')
      window.location.reload()
    },
  },
}
</script>

<style scoped>
.widget-demo {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 40px 20px;
}

.demo-content {
  max-width: 1000px;
  margin: 0 auto;
  background: white;
  border-radius: 16px;
  padding: 40px;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.15);
}

.demo-content h1 {
  text-align: center;
  color: #1e293b;
  margin-bottom: 16px;
  font-size: 36px;
}

.demo-content > p {
  text-align: center;
  color: #64748b;
  font-size: 18px;
  margin-bottom: 40px;
}

.demo-sections {
  display: grid;
  gap: 32px;
}

.demo-section {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 24px;
}

.demo-section h2 {
  color: #1e293b;
  margin: 0 0 16px 0;
  font-size: 24px;
}

.demo-section ul {
  margin: 0;
  padding-left: 20px;
}

.demo-section li {
  margin-bottom: 8px;
  color: #475569;
  line-height: 1.6;
}

.code-block {
  background: #1e293b;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
}

.code-block h3 {
  color: #e2e8f0;
  margin: 0 0 8px 0;
  font-size: 16px;
}

.code-block pre {
  margin: 0;
  color: #10b981;
  font-family: 'Monaco', 'Menlo', 'Consolas', monospace;
  font-size: 14px;
}

.code-block p {
  color: #94a3b8;
  margin: 8px 0 0 0;
  font-style: italic;
}

.test-area {
  background: linear-gradient(135deg, #eff6ff 0%, #f0f9ff 100%);
  border: 1px solid #bfdbfe;
  border-radius: 8px;
  padding: 20px;
  text-align: center;
}

.test-area h3 {
  color: #1e40af;
  margin: 0 0 8px 0;
}

.test-area p {
  color: #3730a3;
  margin: 0 0 16px 0;
}

.test-button {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.test-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 8px -1px rgba(0, 0, 0, 0.15);
}

.instructions {
  background: #f1f5f9;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 24px;
}

.instructions h3 {
  color: #1e293b;
  margin: 0 0 12px 0;
}

.instructions ol {
  margin: 0;
  padding-left: 20px;
}

.instructions li {
  margin-bottom: 8px;
  color: #475569;
  line-height: 1.5;
}

.test-note {
  color: #64748b;
  font-size: 14px;
  font-style: italic;
  margin-top: 12px;
}

.debug-section {
  background: #f1f5f9;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  padding: 20px;
  margin-top: 24px;
}

.debug-section h4 {
  color: #1e293b;
  margin: 0 0 12px 0;
}

.debug-section p {
  color: #475569;
  margin: 0 0 16px 0;
}

.debug-section ol {
  margin: 0;
  padding-left: 20px;
}

.debug-section li {
  margin-bottom: 8px;
  color: #475569;
  line-height: 1.5;
}

.debug-button {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.debug-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 8px -1px rgba(0, 0, 0, 0.15);
}

@media (max-width: 768px) {
  .widget-demo {
    padding: 20px 16px;
  }

  .demo-content {
    padding: 24px;
  }

  .demo-content h1 {
    font-size: 28px;
  }
}
</style>
