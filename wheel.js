const wheelRoot = document.getElementById("fortuneWheel");
const wheelList = document.getElementById("wheelItems");
const spinBtn = document.getElementById("spinBtn");
const tickSound = document.getElementById("tickSound");

let items = [];
let spinning = false;
let spinAnimation = null;
let previousEndDegree = 0;
let tickRaf = null;
let lastTickIndex = -1;

function normalizeDegrees(value) {
    return ((value % 360) + 360) % 360;
}

function indexFromDegree(degree) {
    if (!items.length) return 0;
    const normalized = normalizeDegrees(degree);
    const adjusted = (360 - normalized) % 360;
    const segment = 360 / items.length;
    return Math.floor(adjusted / segment) % items.length;
}

function getRenderedRotationDeg() {
    const transform = getComputedStyle(wheelList).transform;
    if (!transform || transform === "none") {
        return previousEndDegree;
    }

    const matrix = new DOMMatrixReadOnly(transform);
    return (Math.atan2(matrix.b, matrix.a) * 180) / Math.PI;
}

function playTick() {
    if (!tickSound) return;
    tickSound.currentTime = 0;
    tickSound.play().catch(() => {
        // Ignore autoplay restrictions; interaction is user-driven.
    });
}

function monitorTicks() {
    if (!spinning) return;

    const currentIndex = indexFromDegree(getRenderedRotationDeg());
    if (currentIndex !== lastTickIndex) {
        playTick();
        lastTickIndex = currentIndex;
    }

    tickRaf = requestAnimationFrame(monitorTicks);
}

function initWheel(list) {
    items = list.slice();
    wheelRoot.style.setProperty("--_items", items.length);
    wheelList.innerHTML = "";

    items.forEach((item, i) => {
        const li = document.createElement("li");
        li.style.setProperty("--_idx", i + 1);
        li.textContent = item;
        wheelList.appendChild(li);
    });

    if (spinAnimation) {
        spinAnimation.cancel();
        spinAnimation = null;
    }

    if (tickRaf) {
        cancelAnimationFrame(tickRaf);
        tickRaf = null;
    }

    spinning = false;
    previousEndDegree = 0;
    lastTickIndex = -1;
    wheelList.style.transform = "rotate(0deg)";
    spinBtn.disabled = false;
}

function spin() {
    if (spinning || items.length < 2) return;

    spinning = true;
    spinBtn.disabled = true;
    lastTickIndex = indexFromDegree(previousEndDegree);

    if (spinAnimation) {
        spinAnimation.cancel();
    }

    const spinDegrees = 1800 + Math.random() * 1440;
    const newEndDegree = previousEndDegree + spinDegrees;

    spinAnimation = wheelList.animate(
        [
            { transform: `rotate(${previousEndDegree}deg)` },
            { transform: `rotate(${newEndDegree}deg)` }
        ],
        {
            duration: 4200,
            easing: "cubic-bezier(0.22, 1, 0.36, 1)",
            fill: "forwards",
            iterations: 1
        }
    );

    monitorTicks();

    spinAnimation.onfinish = () => {
        if (tickRaf) {
            cancelAnimationFrame(tickRaf);
            tickRaf = null;
        }

        spinning = false;
        previousEndDegree = newEndDegree;
        spinBtn.disabled = false;
    };

    spinAnimation.oncancel = () => {
        if (tickRaf) {
            cancelAnimationFrame(tickRaf);
            tickRaf = null;
        }

        spinning = false;
        spinBtn.disabled = false;
    };
}

spinBtn.onclick = spin;
