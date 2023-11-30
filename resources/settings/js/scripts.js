document.addEventListener('DOMContentLoaded', () => {

  const sidebar = document.querySelector('.sidebar ul');
  loadMenuItems(sidebar);

  document.body.addEventListener('change', (event) => {
    if (event.target.matches('#fullscreenCheckbox')) {
      window.electronAPI.setFullscreen(event.target.checked);
    }
  });

  document.getElementById('closeSettings').addEventListener('click', () => {
    window.electronAPI.closeSettingsWindow();
  });

});

function initializeSettings() {
  const fullscreenCheckbox = document.getElementById('fullscreenCheckbox');
  if (fullscreenCheckbox) {
    window.electronAPI.getFullscreenSetting((value) => {
      fullscreenCheckbox.checked = value;
    });
  }
}

function loadMenuItem(item) {
  const content = document.querySelector('.content');
  fetch(`../items/${item}.html`)
    .then(response => response.text())
    .then(html => {
      content.innerHTML = html;
      if (item === 'anzeige') {
        initializeSettings();
      }
    });
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