// Dark-Mode.js
let isDarkMode = localStorage.getItem('isDarkMode') === 'true';
let currentImage = parseInt(localStorage.getItem('currentImage')) || 1;

document.addEventListener('DOMContentLoaded', () => {
    applyDarkMode();
    applyCurrentImage();
});

function applyDarkMode() {
    document.body.classList.toggle('dark-mode', isDarkMode);
}

function applyCurrentImage() {
    const imageSwitch = document.getElementById('imageSwitch');
    const newImageSrc = `../Icon/Dark-Mode-${currentImage}.png`;

    imageSwitch.style.opacity = '0';
    setTimeout(() => {
        imageSwitch.src = newImageSrc;
        imageSwitch.style.opacity = '1';
    }, 500);
}

function toggleMode() {
    isDarkMode = !isDarkMode;
    localStorage.setItem('isDarkMode', isDarkMode);
    applyDarkMode();
}

function toggleImage() {
    currentImage = (currentImage === 1) ? 2 : 1;
    localStorage.setItem('currentImage', currentImage);
    applyCurrentImage();
}

function toggleModeAndImage() {
    toggleMode();
    toggleImage();
}
