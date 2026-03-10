const setupScreen = document.getElementById("setupScreen");
const wheelScreen = document.getElementById("wheelScreen");
const itemsContainer = document.getElementById("itemsContainer");
const addItemBtn = document.getElementById("addItemBtn");
const nextBtn = document.getElementById("nextBtn");
const startOverBtn = document.getElementById("startOverBtn");

window.onload = () => {
    const saved = JSON.parse(localStorage.getItem("wheelItems") || "[]");
    if (saved.length) saved.forEach(addItem);
    else addItem("");
};

function addItem(value = "") {
    const input = document.createElement("input");
    input.type = "text";
    input.value = value;
    input.placeholder = "Enter item";
    input.className = "wheel-item-input";
    itemsContainer.appendChild(input);
}

addItemBtn.onclick = () => addItem("");

nextBtn.onclick = () => {
    const items = [...itemsContainer.querySelectorAll("input")]
        .map(x => x.value.trim())
        .filter(Boolean);

    if (items.length < 3) return alert("Enter at least 3 items.");

    localStorage.setItem("wheelItems", JSON.stringify(items));

    setupScreen.classList.add("hidden");
    wheelScreen.classList.remove("hidden");

    initWheel(items);
};

startOverBtn.onclick = () => {
    localStorage.removeItem("wheelItems");
    location.reload();
};