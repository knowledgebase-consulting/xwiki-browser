document.addEventListener('DOMContentLoaded', () => {

  document.getElementById('closeSettings').addEventListener('click', () => {
    window.electronAPI.closeSettingsWindow();
  });

  const sidebar = document.querySelector('.sidebar ul');
  loadMenuItems(sidebar);

  document.body.addEventListener('change', (event) => {
    if (event.target.matches('#fullscreenCheckbox')) {
      window.electronAPI.setFullscreen(event.target.checked);
    }
  });

});

document.addEventListener('DOMContentLoaded', async () => {
  const version = await window.electronAPI.getAppVersion();
  document.getElementById('appVersion').textContent = version;
});

function initializeSettings() {
  const fullscreenCheckbox = document.getElementById('fullscreenCheckbox');
  if (fullscreenCheckbox) {
    window.electronAPI.getFullscreenSetting((value) => {
      fullscreenCheckbox.checked = value;
    });
  }
}

async function loadMenuItems(sidebar) {
  const menuItems = await window.menuAPI.getMenuItems();
    
  menuItems.forEach(item => {
    const li = document.createElement('li');
    li.textContent = item.charAt(0).toUpperCase() + item.slice(1);
    li.addEventListener('click', () => loadMenuItem(item));
    sidebar.appendChild(li);
  });
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

