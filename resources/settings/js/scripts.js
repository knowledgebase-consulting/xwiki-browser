document.addEventListener('DOMContentLoaded', async () => {
  // Handler for closing settings window
  document.getElementById('closeSettings').addEventListener('click', () => {
    window.electronAPI.closeSettingsWindow();
  });

  // Load menu items
  const sidebar = document.querySelector('.sidebar ul');
  try {
    await loadMenuItems(sidebar);
    loadMenuItem('information'); 
  } catch (error) {
    console.error('Fehler beim Laden der Menüelemente:', error);
  }

  // Handler for fullscreen setting
  document.body.addEventListener('change', (event) => {
    if (event.target.matches('#fullscreenCheckbox')) {
      window.electronAPI.setFullscreen(event.target.checked);
    }
  });

  // Load app version
  const version = await window.electronAPI.getAppVersion();
  document.getElementById('appVersion').textContent = version;

  // Initialize settings
  initializeSettings();
});

async function loadMenuItems(sidebar) {
  try {
    const menuItems = await window.menuAPI.getMenuItems();
    menuItems.forEach(item => {
      const li = document.createElement('li');
      li.textContent = item.charAt(0).toUpperCase() + item.slice(1);
      li.addEventListener('click', () => loadMenuItem(item));
      sidebar.appendChild(li);
    });
  } catch (error) {
    throw new Error('Fehler beim Abrufen der Menüelemente: ' + error.message);
  }
}

async function loadMenuItem(item) {
  const content = document.querySelector('.content');
  try {
    const html = await window.menuAPI.getMenuItemContent(item);
    content.innerHTML = html;
  } catch (error) {
    console.error('Fehler beim Laden des Menüpunkts:', error);
  }
}

