document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('openSettings').addEventListener('click', (event) => {
        event.preventDefault();
        window.electronAPI.openSettingsWindow();
    });
});
