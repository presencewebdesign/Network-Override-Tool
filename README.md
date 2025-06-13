# Network Override Widget

A powerful Vue 3 network request override tool that replaces manual DevTools "Override content" functionality with a user-friendly widget that can be embedded on any website.

## 🚀 Features

### Core Functionality

- **🌐 Network Interception**: Automatically captures and overrides fetch() and XMLHttpRequest calls
- **📡 Real-time Monitoring**: Live network request monitoring with activity indicators
- **🎯 JSON Override Editor**: Built-in JSON editor with validation and syntax highlighting
- **💾 File Downloads**: Organized file downloads with structured naming
- **🔄 Auto-refresh**: Automatic profile reloading after override changes
- **💽 Persistent Storage**: localStorage-based override persistence across sessions

### Widget Interface

- **🌐 Floating Icon**: Unobtrusive floating widget with activity pulse animation
- **📊 Activity Indicators**: Green pulse for network activity, red badge for active overrides
- **🔍 Hover Tooltips**: "Network Override Tool" tooltip on hover
- **📱 Fullscreen Modal**: Expandable modal with backdrop blur and scrollable content
- **⚡ Easy Embedding**: Simple `<NetworkOverrideWidget />` component integration

### User Experience

- **🎭 Visual Status**: Clear "LIVE API DATA" vs "OVERRIDDEN DATA" indicators
- **🔄 Instant Updates**: Save override → automatically see changes applied
- **🗑️ Smart Cleanup**: Remove override → automatically restore original data
- **📁 Organized Downloads**: Files saved with domain/path structure for easy management

## 🛠️ Setup

### Installation

```sh
npm install
```

### Development Server

```sh
npm run dev
```

The widget will be available at: `http://localhost:5173/widget` (port may vary)

### Requirements

- Node.js 16.x or higher
- npm 7.x or higher

### Environment Variables

Create a `.env` file in the root directory with the following variables (if needed):

```env
VITE_API_BASE_URL=your_api_base_url
```

### Testing

```sh
# Run unit tests
npm run test

# Run tests with coverage
npm run test:coverage
```

### Production Build

```sh
npm run build
```

## 📋 Usage

### Basic Widget Integration

Add the widget to any website:

```vue
<template>
  <div>
    <!-- Your existing website content -->
    <h1>My Website</h1>

    <!-- Add the network override widget -->
    <NetworkOverrideWidget />
  </div>
</template>

<script setup>
import NetworkOverrideWidget from './components/NetworkOverrideWidget.vue'
</script>
```

### Standalone Demo

Visit `/widget` route for a complete demo with:

- User profile display (left panel)
- Override tools (right panel)
- Real API integration with jsonplaceholder.typicode.com

## 🎯 How to Use

### 1. Load Test Data

- Click "👤 Load User Profile" to make a real API call
- See live data displayed in the left panel
- Watch network requests appear in the monitor

### 2. Create Overrides

- Click "⚡ Override" on any captured request
- Edit the JSON response in the built-in editor
- Use "Use Example Override" for quick testing
- Save your changes

### 3. See Instant Results

- **Auto-reload**: Profile automatically refreshes with your override data
- **Visual feedback**: Status changes from "📡 LIVE API DATA" to "🔄 OVERRIDDEN DATA"
- **File download**: Organized backup file is automatically downloaded

### 4. Manage Overrides

- **View active**: See all saved overrides with timestamps
- **Remove single**: Click "🗑️ Remove Override" → auto-restore original data
- **Clear all**: Click "🗑️ Clear All Overrides" → auto-refresh original data

## 📂 Project Structure

```
src/
├── components/
│   ├── NetworkOverrideWidget.vue    # Main floating widget
│   ├── NetworkOverrideTool.vue      # Core override tool implementation
│   └── SimpleNetworkOverride.vue    # Core override functionality
├── views/
│   ├── HomeView.vue                 # Standard app view
│   └── WidgetView.vue              # Widget demo page
├── router/
│   └── index.js                    # Routes (/widget as root)
├── styles/                         # Global styles and theme configuration
├── assets/                         # Static assets
└── main.js                         # Application entry point
```

## 🔧 Technical Details

### Network Interception

- **Global scope**: Intercepts all page network requests
- **Fetch API**: Overrides `window.fetch` for modern requests
- **XMLHttpRequest**: Overrides `XMLHttpRequest` for legacy requests
- **JSON filtering**: Only captures JSON responses for override

### Override Storage

- **Memory**: Active overrides stored in Map for instant access
- **localStorage**: Persistent storage across browser sessions
- **File backup**: Downloaded files serve as external backup/sharing

### Widget Architecture

- **High z-index**: Ensures widget appears above all page content
- **Teleport rendering**: Uses Vue Teleport for proper DOM placement
- **Event system**: Parent-child communication via emit/props
- **State management**: Centralized state with reactive updates

## 🎨 Styling Features

### Visual Design

- **Modern UI**: Clean, professional interface with gradients and shadows
- **Responsive**: Works on desktop and mobile devices
- **Custom scrollbars**: Styled webkit scrollbars for better UX
- **Activity animations**: Smooth pulse animations for visual feedback

### Status Indicators

- **Green badge**: "📡 LIVE API DATA" for original responses
- **Purple badge**: "🔄 OVERRIDDEN DATA" for custom responses (with pulse)
- **Activity pulse**: Green animation when network requests detected
- **Override count**: Red badge showing number of active overrides

## 🚀 Example Workflow

1. **Start**: Load widget at `http://localhost:5174/widget`
2. **Load**: Click "👤 Load User Profile" → see real API data
3. **Override**: Click "⚡ Override" → edit JSON
4. **Save**: Click "💾 Save Override" → watch profile automatically update
5. **Download**: Override file automatically downloaded with organized naming
6. **Remove**: Click "🗑️ Remove Override" → watch original data automatically restore

## 🌟 Key Improvements

### Automatic Data Refresh

- **Save override**: Automatically reloads profile to show override in action
- **Remove override**: Automatically fetches fresh original data
- **Clear all**: Smart refresh of displayed data when applicable

### Enhanced File Management

- **Structured naming**: `domain.com/path/segments/override_timestamp.json`
- **Simple downloads**: Browser-native download (no ZIP complexity)
- **Preview display**: Shows exact filename before saving

### Robust Error Handling

- **Network failures**: Graceful fallbacks with helpful messages
- **API errors**: Smart error handling with user guidance
- **State consistency**: Maintains UI state even during failures

## 📄 License

MIT License - feel free to use this tool in your projects!

## 🤝 Contributing

Contributions welcome! This tool demonstrates advanced Vue 3 patterns:

- Composition API with reactive state management
- Network interception and override techniques
- Widget/modal architecture with Teleport
- Real-time UI updates and activity monitoring
