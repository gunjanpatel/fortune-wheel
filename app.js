const setupScreen = document.getElementById("setupScreen");
const wheelScreen = document.getElementById("wheelScreen");
const itemsContainer = document.getElementById("itemsContainer");
const addItemBtn = document.getElementById("addItemBtn");
const toggleBulkBtn = document.getElementById("toggleBulkBtn");
const bulkEntryPanel = document.getElementById("bulkEntryPanel");
const bulkItemsInput = document.getElementById("bulkItemsInput");
const cancelBulkBtn = document.getElementById("cancelBulkBtn");
const nextBtn = document.getElementById("nextBtn");
const startOverBtn = document.getElementById("startOverBtn");

const BULK_MODE_OFF_LABEL = "Bulk Paste";
const BULK_MODE_ON_LABEL = "Single Entry";

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
    input.className = "w-full rounded-xl border border-slate-600 bg-slate-900/85 px-4 py-3 text-base text-slate-100 placeholder:text-slate-400 outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-500/25";
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