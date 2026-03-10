// DOM references
const setupScreen = document.getElementById("setupScreen");
const wheelScreen = document.getElementById("wheelScreen");
const itemsContainer = document.getElementById("itemsContainer");
const addItemBtn = document.getElementById("addItemBtn");
const nextBtn = document.getElementById("nextBtn");
const startOverBtn = document.getElementById("startOverBtn");

// Load saved list if exists
window.onload = () => {
    const saved = JSON.parse(localStorage.getItem("wheelItems") || "[]");
    if (saved.length > 0) {
        saved.forEach(addItem);
    } else {
        addItem("");
    }
};

function addItem(value = "") {
    const input = document.createElement("input");
    input.type = "text";
    input.value = value;
    input.placeholder = "Enter item";
    input.className =
        "w-full border px-3 py-2 rounded";
    itemsContainer.appendChild(input);
}

addItemBtn.onclick = () => addItem("");

nextBtn.onclick = () => {
    const items = [...itemsContainer.querySelectorAll("input")]
        .map(i => i.value.trim())
        .filter(v => v.length > 0);

    if (items.length < 2) {
        alert("Enter at least 2 items.");
        return;
    }

    localStorage.setItem("wheelItems", JSON.stringify(items));

    setupScreen.classList.add("hidden");
    wheelScreen.classList.remove("hidden");

    initWheel(items);
};

startOverBtn.onclick = () => {
    localStorage.removeItem("wheelItems");
    location.reload();
};