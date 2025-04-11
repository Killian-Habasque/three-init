import { App } from "./App";

document.addEventListener('DOMContentLoaded', () => {
    const startButton = document.getElementById('start-button');
    const landingPage = document.getElementById('landing-page');
    const gameContainer = document.getElementById('game-container');
    
    if (startButton && landingPage && gameContainer) {
        startButton.addEventListener('click', () => {
            landingPage.style.display = 'none';
            gameContainer.style.display = 'block';
            const app = new App();
        });
    }
});