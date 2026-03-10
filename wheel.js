const canvas = document.getElementById("wheelCanvas");
const ctx = canvas.getContext("2d");
const spinBtn = document.getElementById("spinBtn");
const tickSound = document.getElementById("tickSound");
const winnerModal = document.getElementById("winnerModal");
const winnerText = document.getElementById("winnerText");
const closeModalBtn = document.getElementById("closeModalBtn");

let items = [];
let colors = [];
let angle = 0;
let velocity = 0;
let arc = 0;
let spinning = false;
let lastTickIndex = -1;

function bright() {
    const r = 150 + Math.random() * 100;
    const g = 150 + Math.random() * 100;
    const b = 150 + Math.random() * 100;
    return `rgb(${r},${g},${b})`;
}

function initWheel(list) {
    items = list;
    arc = (2 * Math.PI) / items.length;
    colors = items.map(() => bright());
    drawWheel();
}

function drawWheel() {
    const radius = canvas.width / 2;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    items.forEach((item, i) => {
        const start = angle + i * arc;

        const grad = ctx.createRadialGradient(
            radius, radius, radius * 0.2,
            radius, radius, radius
        );
        grad.addColorStop(0, "#fff");
        grad.addColorStop(1, colors[i]);

        ctx.beginPath();
        ctx.moveTo(radius, radius);
        ctx.fillStyle = grad;
        ctx.arc(radius, radius, radius, start, start + arc);
        ctx.fill();

        ctx.save();
        ctx.translate(radius, radius);
        ctx.rotate(start + arc / 2);
        ctx.fillStyle = "#000";
        ctx.font = "20px sans-serif";
        ctx.textAlign = "right";
        ctx.fillText(item, radius - 20, 8);
        ctx.restore();
    });

    // Outer ring
    ctx.beginPath();
    ctx.arc(radius, radius, radius, 0, 2 * Math.PI);
    ctx.lineWidth = 8;
    ctx.strokeStyle = "#333";
    ctx.stroke();
}

function physicsStep() {
    if (!spinning) return;

    angle += velocity;
    velocity *= 0.985;

    const currentIndex = Math.floor(((2 * Math.PI - (angle % (2 * Math.PI))) % (2 * Math.PI)) / arc);

    if (currentIndex !== lastTickIndex) {
        tickSound.currentTime = 0;
        tickSound.play();
        lastTickIndex = currentIndex;
    }

    drawWheel();

    if (Math.abs(velocity) < 0.002) {
        spinning = false;
        finalizeWinner();
        return;
    }

    requestAnimationFrame(physicsStep);
}

function spin() {
    if (spinning) return;

    spinning = true;
    velocity = 0.25 + Math.random() * 0.25;
    physicsStep();
}

function finalizeWinner() {
    const norm = (angle % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI);
    const index = Math.floor(((2 * Math.PI - norm) % (2 * Math.PI)) / arc);

    winnerText.textContent = items[index];
    winnerModal.classList.remove("hidden");
}

spinBtn.onclick = spin;
closeModalBtn.onclick = () => winnerModal.classList.add("hidden");

// SWIPE (mobile)
let startY = null;
