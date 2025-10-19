<template>
  <div class="accessibility-helper">
    <!-- Skip to main content link -->
    <a href="#main-content" class="skip-link"> Skip to main content </a>

    <!-- Accessibility toolbar -->
    <div class="accessibility-toolbar" :class="{ 'toolbar-visible': showToolbar }">
      <button
        @click="showToolbar = !showToolbar"
        class="toolbar-toggle"
        aria-label="Toggle accessibility toolbar"
        aria-expanded="showToolbar"
      >
        <i class="fas fa-universal-access" aria-hidden="true"></i>
        <span class="sr-only">Accessibility Options</span>
      </button>

      <div v-if="showToolbar" class="toolbar-content">
        <h2 class="toolbar-title">Accessibility Options</h2>

        <!-- Font size controls -->
        <div class="toolbar-section">
          <label for="font-size-control">Font Size:</label>
          <div class="control-group" role="group" aria-label="Font size controls">
            <button
              @click="decreaseFontSize"
              class="btn btn-sm btn-outline-secondary"
              aria-label="Decrease font size"
              :disabled="fontSize <= 14"
            >
              <i class="fas fa-minus" aria-hidden="true"></i> A
            </button>
            <span class="font-size-display" aria-live="polite">{{ fontSize }}px</span>
            <button
              @click="increaseFontSize"
              class="btn btn-sm btn-outline-secondary"
              aria-label="Increase font size"
              :disabled="fontSize >= 24"
            >
              <i class="fas fa-plus" aria-hidden="true"></i> A
            </button>
            <button
              @click="resetFontSize"
              class="btn btn-sm btn-outline-primary"
              aria-label="Reset font size to default"
            >
              Reset
            </button>
          </div>
        </div>

        <!-- Contrast controls -->
        <div class="toolbar-section">
          <label>Contrast Mode:</label>
          <div class="control-group" role="group" aria-label="Contrast mode controls">
            <button
              @click="setContrast('normal')"
              class="btn btn-sm"
              :class="contrast === 'normal' ? 'btn-primary' : 'btn-outline-secondary'"
              aria-pressed="contrast === 'normal'"
            >
              Normal
            </button>
            <button
              @click="setContrast('high')"
              class="btn btn-sm"
              :class="contrast === 'high' ? 'btn-primary' : 'btn-outline-secondary'"
              aria-pressed="contrast === 'high'"
            >
              High Contrast
            </button>
          </div>
        </div>

        <!-- Screen reader announcements -->
        <div class="toolbar-section">
          <label>
            <input
              type="checkbox"
              v-model="announcements"
              @change="toggleAnnouncements"
              aria-describedby="announcements-help"
            />
            Enable screen reader announcements
          </label>
          <small id="announcements-help" class="form-text text-muted">
            Get audio feedback for important actions
          </small>
        </div>

        <!-- Keyboard shortcuts help -->
        <div class="toolbar-section">
          <button
            @click="showKeyboardShortcuts = !showKeyboardShortcuts"
            class="btn btn-sm btn-info w-100"
            aria-expanded="showKeyboardShortcuts"
          >
            <i class="fas fa-keyboard" aria-hidden="true"></i>
            Keyboard Shortcuts
          </button>

          <div
            v-if="showKeyboardShortcuts"
            class="shortcuts-panel"
            role="region"
            aria-label="Keyboard shortcuts"
          >
            <ul class="list-unstyled">
              <li><kbd>Tab</kbd> - Navigate forward</li>
              <li><kbd>Shift + Tab</kbd> - Navigate backward</li>
              <li><kbd>Enter</kbd> or <kbd>Space</kbd> - Activate button/link</li>
              <li><kbd>Esc</kbd> - Close dialog/menu</li>
              <li><kbd>Arrow keys</kbd> - Navigate in menus</li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <!-- Live region for announcements -->
    <div class="sr-only" role="status" aria-live="polite" aria-atomic="true" ref="liveRegion">
      {{ currentAnnouncement }}
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'

const showToolbar = ref(false)
const showKeyboardShortcuts = ref(false)
const fontSize = ref(16)
const contrast = ref('normal')
const announcements = ref(true)
const currentAnnouncement = ref('')

// Font size controls
const increaseFontSize = () => {
  if (fontSize.value < 24) {
    fontSize.value += 2
    applyFontSize()
    announce(`Font size increased to ${fontSize.value} pixels`)
  }
}

const decreaseFontSize = () => {
  if (fontSize.value > 14) {
    fontSize.value -= 2
    applyFontSize()
    announce(`Font size decreased to ${fontSize.value} pixels`)
  }
}

const resetFontSize = () => {
  fontSize.value = 16
  applyFontSize()
  announce('Font size reset to default')
}

const applyFontSize = () => {
  document.documentElement.style.setProperty('--base-font-size', `${fontSize.value}px`)
}

// Contrast controls
const setContrast = (mode) => {
  contrast.value = mode
  document.documentElement.classList.remove('high-contrast')

  if (mode === 'high') {
    document.documentElement.classList.add('high-contrast')
    announce('High contrast mode enabled')
  } else {
    announce('Normal contrast mode enabled')
  }

  const setContrast = (mode) => {
    contrast.value = mode
    document.documentElement.classList.remove('high-contrast')

    if (mode === 'high') {
      document.documentElement.classList.add('high-contrast')
      announce('high-contrast is launched')
    } else {
      announce('regular-contrast is launched')
    }
  }
}

// Announcements
const toggleAnnouncements = () => {
  announce(
    announcements.value
      ? 'Screen reader announcements enabled'
      : 'Screen reader announcements disabled',
  )
}

const announce = (message) => {
  if (announcements.value) {
    currentAnnouncement.value = message
    setTimeout(() => {
      currentAnnouncement.value = ''
    }, 1000)
  }
}

// Keyboard navigation
const handleKeyboard = (e) => {
  // ESC to close toolbar
  if (e.key === 'Escape' && showToolbar.value) {
    showToolbar.value = false
    announce('Accessibility toolbar closed')
  }
}

// Load saved preferences
onMounted(() => {
  document.addEventListener('keydown', handleKeyboard)
})
</script>

<style scoped>
.skip-link {
  position: absolute;
  top: -40px;
  left: 0;
  background: #0d6efd;
  color: white;
  padding: 8px 16px;
  text-decoration: none;
  z-index: 10000;
  border-radius: 0 0 4px 0;
}

.skip-link:focus {
  top: 0;
  outline: 3px solid #ffc107;
  outline-offset: 2px;
}

/* Accessibility toolbar */
.accessibility-toolbar {
  position: fixed;
  right: 20px;
  top: 100px;
  z-index: 9999;
}

.toolbar-toggle {
  background: #0d6efd;
  color: white;
  border: none;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  font-size: 24px;
  cursor: pointer;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
}

.toolbar-toggle:hover,
.toolbar-toggle:focus {
  background: #0b5ed7;
  transform: scale(1.1);
  outline: 3px solid #ffc107;
  outline-offset: 2px;
}

.toolbar-content {
  position: absolute;
  right: 60px;
  top: 0;
  background: white;
  border: 2px solid #dee2e6;
  border-radius: 8px;
  padding: 20px;
  min-width: 300px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  animation: slideIn 0.3s ease;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.toolbar-title {
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 15px 0;
  color: #212529;
}

.toolbar-section {
  margin-bottom: 15px;
  padding-bottom: 15px;
  border-bottom: 1px solid #dee2e6;
}

.toolbar-section:last-child {
  border-bottom: none;
  margin-bottom: 0;
  padding-bottom: 0;
}

.toolbar-section label {
  display: block;
  font-weight: 600;
  margin-bottom: 8px;
  color: #495057;
}

.control-group {
  display: flex;
  gap: 8px;
  align-items: center;
}

.font-size-display {
  min-width: 50px;
  text-align: center;
  font-weight: 600;
  color: #0d6efd;
}

.shortcuts-panel {
  margin-top: 10px;
  padding: 10px;
  background: #f8f9fa;
  border-radius: 4px;
}

.shortcuts-panel ul {
  margin: 0;
  font-size: 14px;
}

.shortcuts-panel li {
  margin-bottom: 8px;
}

kbd {
  background: #e9ecef;
  border: 1px solid #adb5bd;
  border-radius: 3px;
  padding: 2px 6px;
  font-family: monospace;
  font-size: 12px;
}

/* Screen reader only content */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

/* High contrast mode styles */
:global(.high-contrast) {
  filter: contrast(1.5);
}

:global(.high-contrast) .toolbar-content {
  border: 3px solid #000;
  background: #fff;
}

:global(.high-contrast) button {
  border: 2px solid #000 !important;
}

/* Focus styles */
button:focus,
a:focus,
input:focus,
select:focus,
textarea:focus {
  outline: 3px solid #ffc107;
  outline-offset: 2px;
}

/* Responsive */
@media (max-width: 768px) {
  .accessibility-toolbar {
    right: 10px;
    top: 80px;
  }

  .toolbar-toggle {
    width: 40px;
    height: 40px;
    font-size: 20px;
  }

  .toolbar-content {
    right: 0;
    left: auto;
    transform: translateX(calc(100% - 50px));
    min-width: 280px;
  }
}
</style>
