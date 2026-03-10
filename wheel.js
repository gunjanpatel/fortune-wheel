const canvas = document.getElementById("wheelCanvas");
const ctx = canvas.getContext("2d");

const winnerModal = document.getElementById("winnerModal");
const winnerText = document.getElementById("winnerText");
const closeModalBtn = document.getElementById("closeModalBtn");

const spinBtn = document.getElementById("spinBtn");

let items = [];
let arc = 0;
let angle = 0;
let spinning = false;
let spinVelocity = 0;

// Bright random color helper
function brightColor() {
    const r = Math.floor(150 + Math.random() * 100);
    const g = Math.floor(150 + Math.random() * 100);
    const b = Math.floor(150 + Math.random() * 100);
    return `rgb(${r},${g},${b})`;
}

function initWheel(list) {
    items = list;
    arc = (2 * Math.PI) / items.length;
    draw();
}

function draw() {
    const radius = canvas.width / 2;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    items.forEach((item, i) => {
        const start = angle + i * arc;

        ctx.beginPath();
        ctx.fillStyle = brightColor();
        ctx.moveTo(radius, radius);
        ctx.arc(radius, radius, radius, start, start + arc);
        ctx.fill();

        // Text
        ctx.save();
        ctx.translate(radius, radius);
        ctx.rotate(start + arc / 2);
        ctx.textAlign = "right";
        ctx.fillStyle = "#000";
        ctx.font = "16px sans-serif";
        ctx.fillText(item, radius - 10, 5);
        ctx.restore();
    });
}

function animate() {
    if (!spinning) return;

    angle += spinVelocity;
    spinVelocity *= 0.985; // easing
    if (spinVelocity < 0.002) {
        spinning = false;
        pickWinner();
        return;
    }

    draw();
    requestAnimationFrame(animate);
}

function spin() {
    if (spinning) return;
    spinning = true;

    spinVelocity = 0.25 + Math.random() * 0.25; // random strength
    animate();
}

function pickWinner() {
    const totalAngle = (angle % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI);
    const index = Math.floor((items.length - (totalAngle / arc)) % items.length);

    winnerText.textContent = items[index];
    winnerModal.classList.remove("hidden");
}

spinBtn.onclick = spin;
closeModalBtn.onclick = () => winnerModal.classList.add("hidden");

// Swipe to spin
let startY = null;
canvas.addEventListener("touchstart", e => {
    startY = e.touches[0].clientY;
});
canvas.addEventListener("touchend", e => {
    if (!startY) return;
    const endY = e.changedTouches[0].clientY;
    const diff = startY - endY;
    if (Math.abs(diff) > 30) spin();
    startY = null;
});