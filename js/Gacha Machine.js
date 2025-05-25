let items = [];
let collection = new Set();
let history = [];

function logDebug(message) {
	const debug = document.getElementById("debug");
	if (debug) debug.textContent = message;
}

function initializeDiscovery(item) {
	const names = item.elements.names;
	const images = item.elements.images;
	const descriptions = item.elements.descriptions;

	return {
		nameIndex: Math.floor(Math.random() * names.length),
		imageIndex: Math.floor(Math.random() * images.length),
		descIndex: Math.floor(Math.random() * descriptions.length),
	};
}

function displayItem(item, indices) {
  console.log("Displaying item with indices:", indices);
  const container = document.getElementById("item-container");
  container.innerHTML = "";

  const mediaUrl = item.elements.images[indices.imageIndex];
  let mediaElement;

  if (/youtube\.com|youtu\.be/.test(mediaUrl)) {
    // Extract YouTube video ID from URL
    const match = mediaUrl.match(/(?:v=|\.be\/)([a-zA-Z0-9_-]+)/);
    if (match && match[1]) {
      const videoId = match[1];
      mediaElement = document.createElement("iframe");
      mediaElement.width = "300";
      mediaElement.height = "170";
      mediaElement.src = `https://www.youtube.com/embed/${videoId}`;
      mediaElement.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
      mediaElement.allowFullscreen = true;
    }
  } else if (mediaUrl.match(/\.(mp4|webm|ogg)$/i)) {
    mediaElement = document.createElement("video");
    mediaElement.src = mediaUrl;
    mediaElement.controls = true;
    mediaElement.autoplay = true;
    mediaElement.loop = true;
    mediaElement.style.maxWidth = "300px";
  } else {
    mediaElement = document.createElement("img");
    mediaElement.src = mediaUrl;
    mediaElement.alt = item.elements.names[indices.nameIndex];
    mediaElement.style.maxWidth = "300px";
    mediaElement.onerror = () => {
      console.error("Failed to load image:", mediaElement.src);
      mediaElement.src = "https://via.placeholder.com/300x300?text=Not+Found";
    };
  }

  const name = document.createElement("p");
  name.textContent = item.elements.names[indices.nameIndex];

  const desc = document.createElement("p");
  const description = Array.isArray(item.elements.descriptions)
    ? item.elements.descriptions[indices.descIndex]
    : item.elements.descriptions;
  desc.textContent = description;

  container.appendChild(mediaElement);
  container.appendChild(name);
  container.appendChild(desc);
}


function updateHistory(item, indices) {
	console.log("Updating history with:", item);
	const historyItem = {
		name: item.elements.names[indices.nameIndex],
		image: item.elements.images[indices.imageIndex],
		description: item.elements.descriptions[indices.descIndex],
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
		img.src = item.elements.images[0];
		img.alt = item.elements.names[0];
		img.style.maxWidth = "100px";

		const name = document.createElement("div");
		name.textContent = item.elements.names[0];

		const desc = document.createElement("div");
		const description = Array.isArray(item.elements.descriptions)
			? item.elements.descriptions[0]
			: item.elements.descriptions;
		desc.textContent = description;

		li.appendChild(img);
		li.appendChild(name);
		li.appendChild(desc);
		collectionList.appendChild(li);

		document.getElementById("collection-count").textContent =
			collection.size;
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

	fetch(
		"https://raw.githubusercontent.com/Carrier4133/Gacha-Machine/refs/heads/main/data/items.json",
	)
		.then((response) => {
			console.log("Fetching items.json...");
			return response.json();
		})
		.then((data) => {
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
					const count =
						parseInt(
							document.getElementById("multi-pull-count").value,
						) || 1;
					console.log(`Multi-pull for ${count} items`);
					for (let i = 0; i < count; i++) {
						pullItem();
					}
				});
			} else {
				console.error("Multi-pull button not found!");
			}
		})
		.catch((error) => {
			console.error("Fetch error:", error);
			logDebug("Error loading items: " + error);
		});

	const darkModeToggle = document.getElementById("toggle-dark-mode");
	const darkModeKey = "gacha-dark-mode";

	// Load saved mode
	if (localStorage.getItem(darkModeKey) === "true") {
		document.body.classList.add("dark-mode");
		darkModeToggle.checked = true;
	}

	darkModeToggle.addEventListener("change", () => {
		if (darkModeToggle.checked) {
			document.body.classList.add("dark-mode");
			localStorage.setItem(darkModeKey, "true");
		} else {
			document.body.classList.remove("dark-mode");
			localStorage.setItem(darkModeKey, "false");
		}
	});

	document.getElementById("debug").textContent =
		"Script loaded and waiting for items...";
});
