let items = [];
let collection = new Set();
let history = [];

function logDebug(message) {
  const debug = document.getElementById("debug");
  if (debug) debug.textContent = message;
}

function initializeDiscovery(item) {
  const names = item.elements[0].names;
  const images = item.elements[0].images;
  const descriptions = item.elements[0].descriptions;

  return {
    nameIndex: Math.floor(Math.random() * names.length),
    imageIndex: Math.floor(Math.random() * images.length),
    descIndex: Math.floor(Math.random() * descriptions.length)
  };
}

function displayItem(item, indices) {
  console.log("Displaying item with indices:", indices);
  const container = document.getElementById("item-container");
  container.innerHTML = '';

  const img = document.createElement("img");
  img.src = item.elements[0].images[indices.imageIndex];
  img.alt = item.elements[0].names[indices.nameIndex];
  img.style.maxWidth = "300px";
  img.onerror = () => {
    console.error("Failed to load image:", img.src);
    img.src = "https://via.placeholder.com/300x300?text=Image+Not+Found";
  };

  const name = document.createElement("p");
  name.textContent = item.elements[0].names[indices.nameIndex];

  const desc = document.createElement("p");
  const description = Array.isArray(item.elements[0].descriptions)
    ? item.elements[0].descriptions[indices.descIndex]
    : item.elements[0].descriptions;
  desc.textContent = description;

  container.appendChild(img);
  container.appendChild(name);
  container.appendChild(desc);
}

function updateHistory(item, indices) {
  console.log("Updating history with:", item);
  const historyItem = {
    name: item.elements[0].names[indices.nameIndex],
    image: item.elements[0].images[indices.imageIndex],
    description: item.elements[0].descriptions[indices.descIndex]
  };

  history.unshift(historyItem);

  const historyList = document.getElementById("history-list");
  const li = document.createElement("li");

  const img = document.createElement("img");
  img.src = historyItem.image;
  img.alt = historyItem.name;
  img.style.maxWidth = "100px";

  const text = document.createElement("div");
  text.textContent = `${historyItem.name}: ${historyItem.description}`;

  li.appendChild(img);
  li.appendChild(text);
  historyList.insertBefore(li, historyList.firstChild);
}

function updateCollection(item) {
  if (!collection.has(item.id)) {
    console.log("Adding item to collection:", item.id);
    collection.add(item.id);

    const collectionList = document.getElementById("collection-list");
    const li = document.createElement("li");

    const img = document.createElement("img");
    img.src = item.elements[0].images[0];
    img.alt = item.elements[0].names[0];
    img.style.maxWidth = "100px";

    const text = document.createElement("div");
    text.textContent = item.elements[0].names[0];

    li.appendChild(img);
    li.appendChild(text);
    collectionList.appendChild(li);

    document.getElementById("collection-count").textContent = collection.size;
  }
}

function pullItem() {
  console.log("pullItem() called");

  if (items.length === 0) {
    console.warn("No items to pull!");
    return;
  }

  const randomIndex = Math.floor(Math.random() * items.length);
  const item = items[randomIndex];
  const indices = initializeDiscovery(item);

  console.log("Pulled item:", item);
  displayItem(item, indices);
  updateHistory(item, indices);
  updateCollection(item);
}

document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM fully loaded");
  logDebug("DOM fully loaded. Starting fetch...");

  fetch("https://raw.githubusercontent.com/Carrier4133/Gacha-Machine/refs/heads/main/data/items.json")
    .then(response => {
      console.log("Fetching items.json...");
      return response.json();
    })
    .then(data => {
      items = data;
      console.log("Items loaded:", items);
      logDebug("Items loaded successfully!");

      const pullBtn = document.getElementById("pull-button");
      const multiPullBtn = document.getElementById("multi-pull-button");

      console.log("pullBtn:", pullBtn);
      console.log("multiPullBtn:", multiPullBtn);

      if (pullBtn) {
        pullBtn.addEventListener("click", () => {
          console.log("Pull button clicked");
          pullItem();
        });
      } else {
        console.error("Pull button not found!");
      }

      if (multiPullBtn) {
        multiPullBtn.addEventListener("click", () => {
          const count = parseInt(document.getElementById("multi-pull-count").value) || 1;
          console.log(`Multi-pull for ${count} items`);
          for (let i = 0; i < count; i++) {
            pullItem();
          }
        });
      } else {
        console.error("Multi-pull button not found!");
      }
    })
    .catch(error => {
      console.error("Fetch error:", error);
      logDebug("Error loading items: " + error);
    });

  document.getElementById("debug").textContent = "Script loaded and waiting for items...";
});
