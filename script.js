// script.js

const NO_MESSAGES = ['No', 'Sei sicura?', 'Davvero?', 'Per favore?', 'Per piacere?', 'Mi dispiace...', 'Ultima possibilità!', 'Va bene...'];
const RUNAWAY_THRESHOLD = 120;
const RUNAWAY_DISTANCE = 80;
const REDUCED_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

let noClickCount = 0;
let noMessageIndex = 0;
let noButtonX = 0;
let noButtonY = 0;
let noButtonScale = 1;

// Preload cat-heart.gif on page load
const catHeartPreload = new Image();
catHeartPreload.src = 'cat-heart.gif';

// Initialize runaway "No" button (skip if reduced motion)
function initRunawayNoButton() {
    if (REDUCED_MOTION) return;

    const noButton = document.getElementById('no-button');
    const optionsContainer = document.getElementById('options');

    if (!noButton || !optionsContainer) return;

    function applyNoButtonTransform() {
        noButton.style.transform = `translate(${noButtonX}px, ${noButtonY}px) scale(${noButtonScale})`;
    }

    function updateNoButtonPosition(e) {
        const rect = noButton.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const mouseX = e.clientX ?? (e.touches?.[0]?.clientX ?? 0);
        const mouseY = e.clientY ?? (e.touches?.[0]?.clientY ?? 0);
        const dist = Math.hypot(mouseX - centerX, mouseY - centerY);

        if (dist < RUNAWAY_THRESHOLD) {
            const angle = Math.atan2(mouseY - centerY, mouseX - centerX);
            noButtonX -= Math.cos(angle) * RUNAWAY_DISTANCE;
            noButtonY -= Math.sin(angle) * RUNAWAY_DISTANCE;
            const maxOffset = 100;
            noButtonX = Math.max(-maxOffset, Math.min(maxOffset, noButtonX));
            noButtonY = Math.max(-maxOffset, Math.min(maxOffset, noButtonY));
            applyNoButtonTransform();
        }
    }

    document.addEventListener('mousemove', updateNoButtonPosition);
    document.addEventListener('touchmove', updateNoButtonPosition, { passive: true });
}

// Function to handle button click events
function selectOption(option) {
    if (option === 'yes') {
        if (REDUCED_MOTION) {
            onYesComplete();
        } else {
            flashRainbowColors(() => onYesComplete());
        }
    } else if (option === 'no') {
        noClickCount++;
        const noButton = document.getElementById('no-button');
        const yesButton = document.getElementById('yes-button');

        noMessageIndex = Math.min(noMessageIndex + 1, NO_MESSAGES.length - 1);
        noButton.innerText = NO_MESSAGES[noMessageIndex];

        const currentFontSize = parseFloat(window.getComputedStyle(yesButton).getPropertyValue('font-size'));
        yesButton.style.fontSize = currentFontSize * 2 + 'px';

        noButtonScale = Math.max(0.5, noButtonScale * 0.85);
        noButton.style.transform = REDUCED_MOTION
            ? `scale(${noButtonScale})`
            : `translate(${noButtonX}px, ${noButtonY}px) scale(${noButtonScale})`;
    } else {
        alert('Opzione non valida!');
    }
}

function onYesComplete() {
    document.getElementById('question').style.display = 'none';
    displayCatHeart();
    showSuccessMessage();
    if (!REDUCED_MOTION) {
        triggerConfettiHearts();
    }
}

function showSuccessMessage() {
    const successEl = document.getElementById('success-message');
    successEl.textContent = 'Siii evvivaaaaaaa';
    successEl.style.display = 'block';
}

function triggerConfettiHearts() {
    const container = document.getElementById('confetti-container');
    const heartChars = ['♥', '❤', '💕', '💗', '💖', '💘'];
    const colors = ['#ff6b9d', '#ff0000', '#ff69b4', '#fb607f', '#ff1493', '#ff1744'];

    for (let i = 0; i < 40; i++) {
        const heart = document.createElement('span');
        heart.className = 'confetti-heart';
        heart.textContent = heartChars[Math.floor(Math.random() * heartChars.length)];
        heart.style.left = Math.random() * 100 + 'vw';
        heart.style.animationDelay = Math.random() * 0.5 + 's';
        heart.style.animationDuration = 2 + Math.random() * 2 + 's';
        heart.style.color = colors[Math.floor(Math.random() * colors.length)];
        heart.style.setProperty('--drift', (Math.random() - 0.5) * 100 + 'px');
        container.appendChild(heart);

        setTimeout(() => heart.remove(), 4000);
    }
}

// Function to flash rainbow colors and then execute a callback function
function flashRainbowColors(callback) {
    const colors = ['#ff0000', '#ff7f00', '#ffff00', '#00ff00', '#0000ff', '#4b0082', '#9400d3'];
    let i = 0;
    const interval = setInterval(() => {
        document.body.style.backgroundColor = colors[i];
        i = (i + 1) % colors.length;
    }, 200);
    setTimeout(() => {
        clearInterval(interval);
        document.body.style.backgroundColor = '';
        if (callback) callback();
    }, 1500);
}

// Function to display the cat.gif initially
function displayCat() {
    const imageContainer = document.getElementById('image-container');
    const catImage = new Image();
    catImage.src = 'cat.gif';
    catImage.alt = 'Cat';
    catImage.onload = () => imageContainer.appendChild(catImage);
}

// Function to display the cat-heart.gif
function displayCatHeart() {
    const imageContainer = document.getElementById('image-container');
    imageContainer.innerHTML = '';
    const catHeartImage = new Image();
    catHeartImage.src = 'cat-heart.gif';
    catHeartImage.alt = 'Cat Heart';
    catHeartImage.className = 'cat-heart-fade-in';
    catHeartImage.onload = () => {
        imageContainer.appendChild(catHeartImage);
        document.getElementById('options').style.display = 'none';
    };
}

// Display the cat.gif initially
displayCat();
initRunawayNoButton();
