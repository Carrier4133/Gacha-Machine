document.addEventListener("DOMContentLoaded", () => {
  const dbg = document.getElementById("debug");
  if (dbg) dbg.textContent = "Script ran.";
});

document.addEventListener("DOMContentLoaded", () => {
  const dbg = document.getElementById("debug");
  if (dbg) dbg.textContent += "Top-level debug hook triggered.\n";
});

// // Refactored Gacha Machine JavaScript with Set-based discovery tracking

const discoveredItems = {}; // Tracks discovery for each item by id
let items = []; // This will be filled via fetch from JSON

function initializeDiscovery(item) {
  if (!discoveredItems[item.id]) {
    discoveredItems[item.id] = item.parts.map(() => new Set());
  }
}

function addToDiscovered(itemId, partIndex, field) {
  discoveredItems[itemId][partIndex].add(field);
}

function isFieldDiscovered(itemId, partIndex, field) {
  return discoveredItems[itemId]?.[partIndex]?.has(field);
}

function displayItemPulled(item) {
  initializeDiscovery(item);

  let isFirstDiscovery = !document.getElementById(`collection-${item.id}`);

  const container = document.getElementById("random-item");
  const categories = Array.isArray(item.categories) ? item.categories.join(", ") : item.category || "Misc";
  container.innerHTML = `<h2>${item.label}</h2><p><em>Categories: ${categories}</em></p><div class="item-parts"></div>`;
  const partsContainer = container.querySelector(".item-parts");

  item.parts.forEach((part, index) => {
    const discovered = discoveredItems[item.id][index];

    // Ensure at least one of each type is revealed on first pull
    if (isFirstDiscovery) {
      ["name", "image", "description"].forEach(field => discovered.add(field));
    } else {
      const fields = ["name", "image", "description"];
      const pulledField = fields[Math.floor(Math.random() * fields.length)];
      addToDiscovered(item.id, index, pulledField);
    }

    const discovered = discoveredItems[item.id][index];

    const partDiv = document.createElement("div");
    partDiv.classList.add("part");

    const name = discovered.has("name") ? part.name : "???";
    const desc = discovered.has("description") ? part.description : "???";
    const imgTag = discovered.has("image")
      ? `<img src="${part.image}" alt="${part.name}">`
      : `<img class="hidden" src="" alt="Hidden">`;

    partDiv.innerHTML = `
      ${imgTag}
      <div>${name}</div>
      <div>${desc}</div>
    `;

    partsContainer.appendChild(partDiv);
  });

    if (isFirstDiscovery) {
    const historyList = document.getElementById("history-list");
    const newEntry = document.createElement("li");
    newEntry.textContent = `New item discovered: ${item.label}!`;
    newEntry.style.fontWeight = "bold";
    historyList.appendChild(newEntry);
  }

  updateCollection(item);
}

function updateCollection(item) {
  const collection = document.querySelector(".collection ul");
  const entryId = `collection-${item.id}`;
  let existingEntry = document.getElementById(entryId);

  if (!existingEntry) {
    existingEntry = document.createElement("li");
    existingEntry.id = entryId;
    collection.appendChild(existingEntry);
  }

  const nameSection = [];
  const imageSection = [];
  const descSection = [];

  item.parts.forEach((part, index) => {
    const discovered = discoveredItems[item.id][index];

    if (discovered.has("name")) {
      nameSection.push(`<div>${part.name}</div>`);
    }
    if (discovered.has("image")) {
      imageSection.push(`<img src="${part.image}" alt="${part.name}">`);
    }
    if (discovered.has("description")) {
      descSection.push(`<div>${part.description}</div>`);
    }
  });

  const categories = Array.isArray(item.categories) ? item.categories.join(", ") : item.category || "Misc";
  const html = `
    <h3>${item.label}</h3>
    <p><em>Categories: ${categories}</em></p>
    <div class="part-group names"><strong>Names:</strong> ${nameSection.join(" ")}</div>
    <div class="part-group images"><strong>Images:</strong> ${imageSection.join(" ")}</div>
    <div class="part-group descriptions"><strong>Descriptions:</strong> ${descSection.join(" ")}</div>
  `;

  existingEntry.innerHTML = html;

  // Update collection count
  document.getElementById("collection-count").textContent = document.querySelectorAll(".collection ul li").length;
}

// === Fetch items from JSON and setup ===
logDebug("Script loaded and waiting for DOM...");
document.addEventListener("DOMContentLoaded", () => {
  const debug = document.getElementById("debug");
  function logDebug(message) {
    if (debug) debug.textContent += message + "";
  }
  logDebug("DOMContentLoaded fired");
  fetch("data/items.json")
    .then((response) => response.json())
    .then((data) => {
      items = data.map((entry, i) => {
        const parts = [];
        const maxLen = Math.max(
          entry.elements?.names?.length || 0,
          entry.elements?.images?.length || 0,
          entry.elements?.descriptions?.length || 0
        );

        for (let j = 0; j < maxLen; j++) {
          parts.push({
            name: entry.elements?.names?.[j] || "",
            image: entry.elements?.images?.[j] || "",
            description: entry.elements?.descriptions?.[j] || ""
          });
        }

        return {
          id: entry.id || `item${i + 1}`,
          label: entry.label || entry.elements?.names?.[0] || `Item ${i + 1}`,
          parts,
          categories: Array.isArray(entry.categories) ? entry.categories : [entry.category || "Misc"]
        };
      });
      logDebug("Items loaded: " + items.length);
    })
    .catch((err) => {
      logDebug("Failed to load items.json: " + err);
    });

  document.getElementById("pull-button").addEventListener("click", () => {
    if (items.length === 0) {
      alert("No items available to pull.");
      return;
    }
    const randomIndex = Math.floor(Math.random() * items.length);
    displayItemPulled(items[randomIndex]);
  });

  document.getElementById("multi-pull-button").addEventListener("click", () => {
    if (items.length === 0) {
      alert("No items available to pull.");
      return;
    }
    const count = parseInt(document.getElementById("multi-pull-count").value, 10) || 1;
    for (let i = 0; i < count; i++) {
      const randomIndex = Math.floor(Math.random() * items.length);
      displayItemPulled(items[randomIndex]);
    }
  });
});
;
