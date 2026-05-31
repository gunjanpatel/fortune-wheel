// ─── Element refs ─────────────────────────────────────────────────────────────
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
const savePresetBtn = document.getElementById("savePresetBtn");
const nextBtn = document.getElementById("nextBtn");
const startOverBtn = document.getElementById("startOverBtn");

// ─── Constants ────────────────────────────────────────────────────────────────
const STORAGE_ITEMS_KEY = "wheelItems";
const STORAGE_PRESETS_KEY = "wheelCustomPresets";

// ─── Built-in presets ─────────────────────────────────────────────────────────
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

// ─── Storage helpers ──────────────────────────────────────────────────────────
function getCustomPresets() {
    try { return JSON.parse(localStorage.getItem(STORAGE_PRESETS_KEY) || "{}"); }
    catch { return {}; }
}

function saveCustomPresets(presets) {
    localStorage.setItem(STORAGE_PRESETS_KEY, JSON.stringify(presets));
}

function autoSaveItems() {
    const items = isBulkMode() ? getBulkItems() : getInputItems();
    localStorage.setItem(STORAGE_ITEMS_KEY, JSON.stringify(items));
}

// ─── Preset dropdown ──────────────────────────────────────────────────────────
function populatePresetDropdown() {
    // Remove all previously injected custom options
    presetSelect.querySelectorAll("option[data-custom]").forEach(o => o.remove());

    const custom = getCustomPresets();
    const keys = Object.keys(custom);
    if (!keys.length) return;

    const divider = document.createElement("option");
    divider.textContent = "── My Presets ──";
    divider.disabled = true;
    divider.dataset.custom = "divider";
    presetSelect.appendChild(divider);

    keys.forEach(name => {
        const opt = document.createElement("option");
        opt.value = `custom:${name}`;
        opt.textContent = name;
        opt.dataset.custom = "true";
        presetSelect.appendChild(opt);
    });
}

// ─── Item rows ────────────────────────────────────────────────────────────────
function addItem(value = "") {
    const row = document.createElement("div");
    row.className = "flex gap-2 items-center";

    const input = document.createElement("input");
    input.type = "text";
    input.value = value;
    input.placeholder = "Enter item";
    input.className = "wheel-item-input flex-1";
    input.addEventListener("input", autoSaveItems);

    const del = document.createElement("button");
    del.type = "button";
    del.className = "shrink-0 w-8 h-8 flex items-center justify-center rounded-lg text-[rgba(235,235,245,0.40)] hover:text-red-400 hover:bg-red-400/10 transition-colors";
    del.setAttribute("aria-label", "Remove item");
    del.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="none"
        viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
        <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
    </svg>`;
    del.addEventListener("click", () => {
        // Keep at least one input row
        if (itemsContainer.querySelectorAll(".flex.gap-2").length > 1) {
            row.remove();
            autoSaveItems();
        } else {
            input.value = "";
            input.focus();
            autoSaveItems();
        }
    });

    row.appendChild(input);
    row.appendChild(del);
    itemsContainer.appendChild(row);
    return input;
}

function getInputItems() {
    return [...itemsContainer.querySelectorAll("input")]
        .map(x => x.value.trim())
        .filter(Boolean);
}

function setInputItems(list) {
    itemsContainer.innerHTML = "";
    if (!list.length) { addItem(""); return; }
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

// ─── Boot ─────────────────────────────────────────────────────────────────────
window.onload = () => {
    populatePresetDropdown();
    try {
        const saved = JSON.parse(localStorage.getItem(STORAGE_ITEMS_KEY) || "[]");
        if (saved.length) saved.forEach(v => addItem(v));
        else addItem("");
    } catch {
        addItem("");
    }
};

// ─── Add / bulk toggle ────────────────────────────────────────────────────────
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
        toggleBulkBtn.textContent = "Bulk Paste";
    } else {
        bulkItemsInput.value = getInputItems().join("\n");
        bulkEntryPanel.classList.remove("hidden");
        itemsContainer.classList.add("hidden");
        addItemBtn.classList.add("hidden");
        toggleBulkBtn.textContent = "Single Entry";
        bulkItemsInput.focus();
    }
};

cancelBulkBtn.onclick = () => {
    bulkEntryPanel.classList.add("hidden");
    itemsContainer.classList.remove("hidden");
    addItemBtn.classList.remove("hidden");
    toggleBulkBtn.textContent = "Bulk Paste";
};

bulkItemsInput.addEventListener("input", autoSaveItems);

// ─── Presets ──────────────────────────────────────────────────────────────────
applyPresetBtn.onclick = () => {
    const key = presetSelect.value;
    if (!key) return;

    const items = key.startsWith("custom:")
        ? getCustomPresets()[key.slice(7)]
        : PRESETS[key];
    if (!items) return;

    if (isBulkMode()) {
        bulkItemsInput.value = items.join("\n");
        autoSaveItems();
        bulkItemsInput.focus();
        return;
    }

    setInputItems(items);
    autoSaveItems();
    itemsContainer.querySelector("input")?.focus();
};

savePresetBtn.onclick = () => {
    const items = isBulkMode() ? getBulkItems() : getInputItems();
    if (items.length < 2) {
        alert("Add at least 2 items before saving a preset.");
        return;
    }
    const name = prompt("Name your preset:")?.trim();
    if (!name) return;

    const presets = getCustomPresets();
    presets[name] = items;
    saveCustomPresets(presets);
    populatePresetDropdown();
    presetSelect.value = `custom:${name}`;

    // Flash the label (inner span only, keeps the icon intact)
    const label = savePresetBtn.querySelector(".save-label");
    if (label) {
        const orig = label.textContent;
        label.textContent = "Saved!";
        setTimeout(() => (label.textContent = orig), 1800);
    }
};

// Per-preset delete: only shown when a custom preset is selected
presetSelect.addEventListener("change", () => {
    const key = presetSelect.value;
    const delBtn = document.getElementById("deletePresetBtn");
    if (!delBtn) return;
    if (key.startsWith("custom:")) {
        delBtn.classList.remove("hidden");
    } else {
        delBtn.classList.add("hidden");
    }
});

document.getElementById("deletePresetBtn")?.addEventListener("click", () => {
    const key = presetSelect.value;
    if (!key.startsWith("custom:")) return;
    const name = key.slice(7);
    if (!confirm(`Delete preset "${name}"?`)) return;

    const presets = getCustomPresets();
    delete presets[name];
    saveCustomPresets(presets);
    presetSelect.value = "";
    document.getElementById("deletePresetBtn").classList.add("hidden");
    populatePresetDropdown();
});

// ─── Enter key adds a new row ─────────────────────────────────────────────────
itemsContainer.addEventListener("keydown", e => {
    if (e.key !== "Enter") return;
    if (!(e.target instanceof HTMLInputElement)) return;
    e.preventDefault();
    addItem("").focus();
});

// ─── Next / Start over ────────────────────────────────────────────────────────
nextBtn.onclick = () => {
    const items = isBulkMode() ? getBulkItems() : getInputItems();
    if (items.length < 3) return alert("Enter at least 3 items.");

    localStorage.setItem(STORAGE_ITEMS_KEY, JSON.stringify(items));
    setupScreen.classList.add("hidden");
    wheelScreen.classList.remove("hidden");
    initWheel(items);
};

startOverBtn.onclick = () => {
    localStorage.removeItem(STORAGE_ITEMS_KEY); // custom presets are kept
    location.reload();
};