// script.js

const NO_MESSAGES = ['No', 'Sei sicura?', 'Davvero?', 'Per favore?', 'Ti stai impegnando eh? 😒', 'Ultima possibilità'];
const RUNAWAY_THRESHOLD = 100;
const RUNAWAY_DISTANCE = 50;
const RUNAWAY_COOLDOWN_MS = 135;
const REDUCED_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Rettangolo invisibile al centro (il No può muoversi solo qui): larghezza e altezza in frazione del viewport
const BOUNDS_WIDTH_RATIO = 0.5;
const BOUNDS_HEIGHT_RATIO = 0.5;

let noClickCount = 0;
let noMessageIndex = 0;
let noButtonX = 0;
let noButtonY = 0;
let noButtonScale = 1;
let lastRunawayTime = 0;

// Preload images on page load
const catHeartPreload = new Image();
catHeartPreload.src = 'cat-heart.gif';
const disappointedPreload = new Image();
disappointedPreload.src = 'disappointed.gif';
const sadCatPreload = new Image();
sadCatPreload.src = 'sad-cat.jpg';
const sadCatSmallPreload = new Image();
sadCatSmallPreload.src = 'sad-cat-smal.jpg';
const sadCatFacePreload = new Image();
sadCatFacePreload.src = 'sad-cat-face.jpg';

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
        const now = Date.now();

        if (dist < RUNAWAY_THRESHOLD && now - lastRunawayTime >= RUNAWAY_COOLDOWN_MS) {
            lastRunawayTime = now;
            const angle = Math.atan2(mouseY - centerY, mouseX - centerX);
            noButtonX -= Math.cos(angle) * RUNAWAY_DISTANCE;
            noButtonY -= Math.sin(angle) * RUNAWAY_DISTANCE;

            const boxW = window.innerWidth * BOUNDS_WIDTH_RATIO;
            const boxH = window.innerHeight * BOUNDS_HEIGHT_RATIO;
            const boxLeft = (window.innerWidth - boxW) / 2;
            const boxTop = (window.innerHeight - boxH) / 2;
            const baseLeft = rect.left - noButtonX;
            const baseTop = rect.top - noButtonY;

            noButtonX = Math.max(boxLeft - baseLeft, Math.min(boxLeft + boxW - rect.width - baseLeft, noButtonX));
            noButtonY = Math.max(boxTop - baseTop, Math.min(boxTop + boxH - rect.height - baseTop, noButtonY));
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
        
        updateImageOnNo();
    } else {
        alert('Opzione non valida!');
    }
}

function onYesComplete() {
    document.getElementById('title').style.display = 'none';
    document.getElementById('question').style.display = 'none';
    displayCatHeart();
    showSuccessMessage();
    if (!REDUCED_MOTION) {
        triggerConfettiHearts();
    }
}

function showSuccessMessage() {
    const successEl = document.getElementById('success-message');
    successEl.textContent = 'Siii evvivaaaaaaa 🧡💛';
    successEl.style.display = 'block';
    
    const dateEl = document.getElementById('date-message');
    dateEl.textContent = 'Ci vediamo il 14 🥰';
    dateEl.style.display = 'block';
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

// Function to display the cat-rose.gif initially
function displayCat() {
    const imageContainer = document.getElementById('image-container');
    const catImage = new Image();
    catImage.src = 'cat-rose.gif';
    catImage.alt = 'Cat with rose';
    catImage.onload = () => imageContainer.appendChild(catImage);
}

// Function to update image when "No" is clicked
function updateImageOnNo() {
    const imageContainer = document.getElementById('image-container');
    imageContainer.innerHTML = '';
    const newImage = new Image();
    
    if (noClickCount === 1) {
        newImage.src = 'disappointed.gif';
        newImage.alt = 'Disappointed cat';
    } else if (noClickCount === 2) {
        newImage.src = 'sad-cat.jpg';
        newImage.alt = 'Sad cat';
    } else if (noClickCount === 3) {
        newImage.src = 'sad-cat-smal.jpg';
        newImage.alt = 'Sad cat small';
    } else if (noClickCount >= 4) {
        newImage.src = 'sad-cat-face.jpg';
        newImage.alt = 'Sad cat face';
    }
    
    newImage.onload = () => imageContainer.appendChild(newImage);
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

// Display the cat-rose.gif initially
displayCat();
initRunawayNoButton();
