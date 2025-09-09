// SettingsModal.js - Plain JavaScript version without JSX
// This avoids MIME type issues in Electron

const SettingsModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  // Create modal overlay
  const overlay = document.createElement('div');
  overlay.className = 'edex-modal-overlay';
  overlay.addEventListener('click', onClose);

  // Create modal container
  const container = document.createElement('div');
  container.className = 'edex-modal-container';
  container.addEventListener('click', (e) => e.stopPropagation());

  // Add grid background
  const gridBg = document.createElement('div');
  gridBg.className = 'edex-grid-bg';
  container.appendChild(gridBg);

  // Create header
  const header = document.createElement('div');
  header.className = 'edex-modal-header';

  const titleContainer = document.createElement('div');
  const title = document.createElement('h2');
  title.className = 'edex-modal-title';
  title.textContent = 'SYSTEM CONFIGURATION';
  titleContainer.appendChild(title);

  const subtitle = document.createElement('p');
  subtitle.className = 'edex-modal-subtitle';
  subtitle.textContent = 'eDEX-UI Settings Panel';
  titleContainer.appendChild(subtitle);

  header.appendChild(titleContainer);

  // Create close button
  const closeBtn = document.createElement('button');
  closeBtn.className = 'edex-close-btn';
  closeBtn.setAttribute('aria-label', 'Close settings');
  closeBtn.innerHTML = '✕';
  closeBtn.addEventListener('click', onClose);
  header.appendChild(closeBtn);

  container.appendChild(header);

  // Create body
  const body = document.createElement('div');
  body.className = 'edex-modal-body';

  // Create navigation rail
  const navRail = document.createElement('div');
  navRail.className = 'edex-nav-rail';

  const navHeader = document.createElement('h3');
  navHeader.className = 'edex-nav-header';
  navHeader.textContent = 'NAVIGATION';
  navRail.appendChild(navHeader);

  const nav = document.createElement('nav');
  nav.className = 'edex-nav';

  const categories = [
    { id: 'general', name: 'General', icon: '⚙' },
    { id: 'chat', name: 'Chat Experience', icon: '💬' },
    { id: 'appearance', name: 'Appearance', icon: '🎨' },
    { id: 'behavior', name: 'AI Behavior', icon: '🤖' },
    { id: 'advanced', name: 'Advanced', icon: '⚡' }
  ];

  let activeCategory = 'general';

  categories.forEach(category => {
    const navItem = document.createElement('button');
    navItem.className = 'edex-nav-item';
    if (category.id === activeCategory) {
      navItem.classList.add('active');
    }
    navItem.dataset.category = category.id;

    const icon = document.createElement('span');
    icon.className = 'edex-nav-icon';
    icon.textContent = category.icon;

    const name = document.createElement('span');
    name.textContent = category.name;

    navItem.appendChild(icon);
    navItem.appendChild(name);

    navItem.addEventListener('click', () => {
      // Remove active class from all items
      nav.querySelectorAll('.edex-nav-item').forEach(item => {
        item.classList.remove('active');
      });
      // Add active class to clicked item
      navItem.classList.add('active');
      activeCategory = category.id;
      // Update content (simplified for this example)
      updateContent(activeCategory);
    });

    nav.appendChild(navItem);
  });

  navRail.appendChild(nav);
  body.appendChild(navRail);

  // Create content panel
  const contentPanel = document.createElement('div');
  contentPanel.className = 'edex-content-panel';

  const contentWrapper = document.createElement('div');
  contentWrapper.className = 'edex-content-wrapper';
  contentWrapper.id = 'settings-content';

  contentPanel.appendChild(contentWrapper);
  body.appendChild(contentPanel);

  container.appendChild(body);
  overlay.appendChild(container);

  // Simple content update function
  function updateContent(category) {
    const content = document.getElementById('settings-content');
    if (!content) return;

    content.innerHTML = '';

    const sectionTitle = document.createElement('h3');
    sectionTitle.className = 'edex-section-title';
    sectionTitle.textContent = category.toUpperCase() + ' SETTINGS';
    content.appendChild(sectionTitle);

    const settingsGroup = document.createElement('div');
    settingsGroup.className = 'edex-settings-group';

    const settingRow = document.createElement('div');
    settingRow.className = 'edex-setting-row';

    const settingLabel = document.createElement('label');
    settingLabel.className = 'edex-setting-label';
    settingLabel.textContent = 'Setting Option';
    settingRow.appendChild(settingLabel);

    const toggleSwitch = document.createElement('div');
    toggleSwitch.className = 'edex-toggle-switch';
    toggleSwitch.innerHTML = '<div class="edex-toggle-slider"></div>';
    toggleSwitch.addEventListener('click', function() {
      this.classList.toggle('active');
    });
    settingRow.appendChild(toggleSwitch);

    settingsGroup.appendChild(settingRow);
    content.appendChild(settingsGroup);
  }

  // Initialize with default content
  updateContent(activeCategory);

  return overlay;
};

// Export for global use
export default SettingsModal;