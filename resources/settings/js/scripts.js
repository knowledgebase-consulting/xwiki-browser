// Funktionen
async function initializeSettings() {
  await initializeFullScreenSettings();
  await initializeXWikiServerSettings();
}

// Initialisieren der Vollbildschirm-Einstellungen
async function initializeFullScreenSettings() {
  const fullscreenCheckbox = document.getElementById('fullscreenCheckbox');
  if (fullscreenCheckbox) {
    const fullscreenSetting = await window.electronAPI.getFullscreenSetting();
    fullscreenCheckbox.checked = fullscreenSetting;
  }
}

// Initialisieren der XWiki-Server-Einstellungen
async function initializeXWikiServerSettings() {
  const xwikiServerInput = document.getElementById('xwikiServerUrl');
  if (xwikiServerInput) {
    try {
      const startUrl = await window.electronAPI.getStartUrl();
      if (startUrl) {
        xwikiServerInput.value = startUrl;
      }
    } catch (error) {
      console.error('Fehler beim Laden der Start-URL:', error);
    }
  }
}

function isValidUrl(url) {
  try {
    const parsedUrl = new URL(url);
    // Überprüfen, ob das Protokoll 'http' oder 'https' ist
    const isValidProtocol = parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:';
    // Überprüfen, ob die URL eine Domainendung besitzt (z.B. .de)
    const hasValidTLD = /\.[a-z]{2,}$/.test(parsedUrl.hostname);

    return isValidProtocol && hasValidTLD;
  } catch (error) {
    // Ungültige URL
    return false;
  }
}


// Event-Listener für den Speichern-Button
async function setupSaveButtonListener() {
  const xwikiSaveButton = await document.getElementById('saveXWikiServer');
    xwikiSaveButton.addEventListener('click', async () => {
      const url = document.getElementById('xwikiServerUrl').value;
      if (isValidUrl(url)) {
        const result = await window.electronAPI.setStartUrl(url);
      } else {
        console.error('Ungültige URL:', url);
      }
    });
}

// Laden der Menüpunkte im Einstellungsfenster
async function loadMenuItems(sidebar) {
  try {
    const menuItems = await window.menuAPI.getMenuItems();
    menuItems.forEach(item => {
      const li = document.createElement('li');
      li.textContent = item.charAt(0).toUpperCase() + item.slice(1);
      li.addEventListener('click', () => setVariableMenuItemContent(item));
      sidebar.appendChild(li);
    });
  } catch (error) {
    throw new Error('Fehler beim Abrufen der Menüelemente: ' + error.message);
  }
}

//Laden des Variablen Inhalte der einzlenen Menüpunkte im Einstellungsfenster
async function setVariableMenuItemContent(item) {
  const content = document.querySelector('.content');
  try {
    const html = await window.menuAPI.getMenuItemContent(item);
    content.innerHTML = html;
    if (item === 'Anzeige' || item === 'Mein XWiki') {
      initializeSettings();
      if (item === 'Mein XWiki') {
        setupSaveButtonListener();
      }
    }
  } catch (error) {
    console.error('Fehler beim Laden des Menüpunkts:' + error.message);
  }
}

// Beim zeichnen des DOM
document.addEventListener('DOMContentLoaded', async () => {

  // Handler for closing settings window
  document.getElementById('closeSettings').addEventListener('click', () => {
    window.electronAPI.closeSettingsWindow();
  });

  // Load menu items
  const sidebar = document.querySelector('.sidebar ul');
  try {
    await loadMenuItems(sidebar);
    setVariableMenuItemContent('Informationen'); 
  } catch (error) {
    console.error('Fehler beim Laden der Menüelemente:' + error.message);
  }

  // Handler for fullscreen setting
  document.body.addEventListener('change', (event) => {
    if (event.target.matches('#fullscreenCheckbox')) {
      window.electronAPI.setFullscreen(event.target.checked);
    }
  });
});