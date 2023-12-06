// Globale Initialisierung
async function initialize() {
  await initializeSettings();
  setupEventListeners();
  await loadMenuItems();
  setVariableMenuItemContent('informationen');
}

// Initialisierung der Einstellungen
async function initializeSettings() {
  await initializeFullScreenSettings();
  await initializeXWikiServerSettings();
}

// Initialisierung der Vollbild-Einstellungen
async function initializeFullScreenSettings() {
  const fullscreenCheckbox = document.getElementById('fullscreenCheckbox');
  if (fullscreenCheckbox) {
    const fullscreenSetting = await window.electronAPI.getFullscreenSetting();
    fullscreenCheckbox.checked = fullscreenSetting;
  }
}

// Initialisierung der XWiki-Server-Einstellungen
async function initializeXWikiServerSettings() {
  const xwikiServerInput = document.getElementById('xwikiServerUrl');
  if (xwikiServerInput) {
    const startUrl = await window.electronAPI.getStartUrl();
    xwikiServerInput.value = startUrl || '';
  }
}

// Event Listener einrichten
function setupEventListeners() {
  document.getElementById('closeSettings').addEventListener('click', () => {
    window.electronAPI.closeSettingsWindow();
  });

  document.body.addEventListener('change', (event) => {
    if (event.target.matches('#fullscreenCheckbox')) {
      window.electronAPI.setFullscreen(event.target.checked);
    }
  });

  // Event-Listener für den Speichern-Button (falls vorhanden)
  const xwikiSaveButton = document.getElementById('saveXWikiServer');
  if (xwikiSaveButton) {
    xwikiSaveButton.addEventListener('click', async () => {
      const url = document.getElementById('xwikiServerUrl').value;
      if (isValidUrl(url)) {
        await window.electronAPI.setStartUrl(url);
      } else {
        console.error('Ungültige URL:', url);
      }
    });
  }
}

// Überprüfen, ob es sich um eine gültige URL handelt
function isValidUrl(str) {
  const pattern = new RegExp(
    '^(https?:\\/\\/)' + // protocol
    '([\\w\\d\\.-]+)\\.' + // subdomain
    '([a-z\\.]{2,6})' + // domain name
    '(:\\d+)?(\\/\\S*)?$', // port and path
    'i'
  );

  return pattern.test(str);
}

// Laden der Menüpunkte im Einstellungsfenster
async function loadMenuItems() {
  const sidebar = document.querySelector('.sidebar ul');
  try {
    const menuItems = await window.menuAPI.getMenuItems();
    menuItems.forEach(item => {
      const li = document.createElement('li');
      li.textContent = item.charAt(0).toUpperCase() + item.slice(1);
      li.addEventListener('click', () => setVariableMenuItemContent(item));
      sidebar.appendChild(li);
    });
  } catch (error) {
    console.error('Fehler beim Laden der Menüelemente: ' + error.message);
  }
}

// Laden des Inhalts der Menüpunkte
async function setVariableMenuItemContent(item) {
  const content = document.querySelector('.content');
  try {
    const html = await window.menuAPI.getMenuItemContent(item);
    content.innerHTML = html;
    if (item === 'anzeige' || item === 'mein xwiki') {
      await initializeSettings();
    }
  } catch (error) {
    console.error('Fehler beim Laden des Menüpunkts: ' + error.message);
  }
}

// Beim Laden des DOM
document.addEventListener('DOMContentLoaded', initialize);