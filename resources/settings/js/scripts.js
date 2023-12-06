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


// Setup des Event-Listeners für den "Speichern"-Button im "Mein XWiki"-Menü
function setupXWikiServerSaveButtonListener() {
  const xwikiSaveButton = document.getElementById('saveXWikiServer');
  const xwikiServerInput = document.getElementById('xwikiServerUrl');
  const feedbackElement = document.getElementById('urlFeedback');
  if (xwikiSaveButton) {
    xwikiServerInput.addEventListener('input', () => {
      if (isValidUrl(xwikiServerInput.value)) {
        feedbackElement.textContent = '';
      } else {
        feedbackElement.textContent = 'Bitte geben Sie eine gültige Serveradresse ein.';
      }
    });
    xwikiSaveButton.addEventListener('click', async () => {
      const urlInput = document.getElementById('xwikiServerUrl');
      if (isValidUrl(urlInput.value)) {
        await window.electronAPI.setStartUrl(urlInput.value);
        feedbackElement.textContent = '';
      } else {
        feedbackElement.textContent = 'Bitte geben Sie eine gültige Serveradresse ein.';
      }
    });
  }
}

// Laden der Menüpunkte im Einstellungsfenster
async function loadMenuItems() {
  const sidebar = document.querySelector('.sidebar ul');
  try {
    const menuItems = await window.menuAPI.getMenuItems();
    menuItems.forEach(item => {
      const li = document.createElement('li');
      const displayName = item.replace('xwiki', 'XWiki');
      li.textContent = displayName.charAt(0).toUpperCase() + displayName.slice(1);
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
    if (item === 'anzeige') {
      await initializeFullScreenSettings();
    } else if (item === 'mein xwiki') {
      await initializeXWikiServerSettings();
      setupXWikiServerSaveButtonListener();
    }
  } catch (error) {
    console.error('Fehler beim Laden des Menüpunkts: ' + error.message);
  }
}

// Beim Laden des DOM
document.addEventListener('DOMContentLoaded', initialize);