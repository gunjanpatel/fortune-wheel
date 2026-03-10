const setupScreen = document.getElementById("setupScreen");
const wheelScreen = document.getElementById("wheelScreen");
const itemsContainer = document.getElementById("itemsContainer");
const addItemBtn = document.getElementById("addItemBtn");
const toggleBulkBtn = document.getElementById("toggleBulkBtn");
const bulkEntryPanel = document.getElementById("bulkEntryPanel");
const bulkItemsInput = document.getElementById("bulkItemsInput");
const cancelBulkBtn = document.getElementById("cancelBulkBtn");
const presetSelect = document.getElementById("presetSelect");
const applyPresetBtn = document.getElementById("applyPresetBtn");
const nextBtn = document.getElementById("nextBtn");
const startOverBtn = document.getElementById("startOverBtn");

const BULK_MODE_OFF_LABEL = "Bulk Paste";
const BULK_MODE_ON_LABEL = "Single Entry";

const PRESETS = {
    "birthday-questions": [
        "Favorite birthday memory?",
        "Dream birthday gift?",
        "Best party song?",
        "Cake or ice cream?",
        "Favorite party game?",
        "Who makes you laugh most?",
        "One wish for this year?",
        "Best photo pose?",
        "Favorite snack at parties?",
        "Dance move challenge"
    ],
    "kids-play": [
        "Hop like a bunny",
        "Roar like a lion",
        "Do 5 jumping jacks",
        "Sing a cartoon song",
        "Tell a funny face joke",
        "Spin in place 3 times",
        "Balance on one foot",
        "Act like a superhero",
        "Name 3 animals",
        "Clap a rhythm"
    ],
    "icebreaker-questions": [
        "If you had a superpower?",
        "Favorite movie ever?",
        "A food you love most?",
        "Dream place to travel?",
        "Morning or night person?",
        "Tea or coffee?",
        "One hidden talent?",
        "Favorite hobby right now?",
        "What makes you smile fast?",
        "Two truths and a lie"
    ]
};

window.onload = () => {
    const saved = JSON.parse(localStorage.getItem("wheelItems") || "[]");
    if (saved.length) saved.forEach(addItem);
    else addItem("");
};

function getInputItems() {
    return [...itemsContainer.querySelectorAll("input")]
        .map(x => x.value.trim())
        .filter(Boolean);
}

function setInputItems(list) {
    itemsContainer.innerHTML = "";
    if (!list.length) {
        addItem("");
        return;
    }
    list.forEach(addItem);
}

function getBulkItems() {
    return bulkItemsInput.value
        .split(/\r?\n/)
        .map(x => x.trim())
        .filter(Boolean);
}

function isBulkMode() {
    return !bulkEntryPanel.classList.contains("hidden");
}

function addItem(value = "") {
    const input = document.createElement("input");
    input.type = "text";
    input.value = value;
    input.placeholder = "Enter item";
    input.className = "wheel-item-input";
    itemsContainer.appendChild(input);
    return input;
}

addItemBtn.onclick = () => {
    const input = addItem("");
    input.focus();
};

toggleBulkBtn.onclick = () => {
    if (isBulkMode()) {
        const lines = getBulkItems();
        setInputItems(lines);
        bulkEntryPanel.classList.add("hidden");
        itemsContainer.classList.remove("hidden");
        addItemBtn.classList.remove("hidden");
        toggleBulkBtn.textContent = BULK_MODE_OFF_LABEL;
    } else {
        bulkItemsInput.value = getInputItems().join("\n");
        bulkEntryPanel.classList.remove("hidden");
        itemsContainer.classList.add("hidden");
        addItemBtn.classList.add("hidden");
        toggleBulkBtn.textContent = BULK_MODE_ON_LABEL;
        bulkItemsInput.focus();
    }
};

cancelBulkBtn.onclick = () => {
    bulkEntryPanel.classList.add("hidden");
    itemsContainer.classList.remove("hidden");
    addItemBtn.classList.remove("hidden");
    toggleBulkBtn.textContent = BULK_MODE_OFF_LABEL;
};

applyPresetBtn.onclick = () => {
    const presetKey = presetSelect.value;
    if (!presetKey || !PRESETS[presetKey]) return;

    const presetItems = PRESETS[presetKey];

    if (isBulkMode()) {
        bulkItemsInput.value = presetItems.join("\n");
        bulkItemsInput.focus();
        return;
    }

    setInputItems(presetItems);
    const first = itemsContainer.querySelector("input");
    first?.focus();
};

itemsContainer.addEventListener("keydown", (event) => {
    if (event.key !== "Enter") return;

    const target = event.target;
    if (!(target instanceof HTMLInputElement)) return;

    event.preventDefault();
    const input = addItem("");
    input.focus();
});

nextBtn.onclick = () => {
    const items = isBulkMode() ? getBulkItems() : getInputItems();

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