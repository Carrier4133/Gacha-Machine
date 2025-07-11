let items = [];
let collection = new Set();
let history = [];
let discoveredItems = {}; // maps item IDs to discovered indices
let pullCount = parseInt(localStorage.getItem("gacha-pull-count")) || 0;

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

	const mediaUrls = item.elements.images;
	const nameText = item.elements.names[indices.nameIndex];
	const descText = Array.isArray(item.elements.descriptions)
		? item.elements.descriptions[indices.descIndex]
		: item.elements.descriptions;

	// Loop through each media item
	mediaUrls.forEach((url) => {
		let mediaElement;

		if (url.includes("youtu")) {
			if (url.includes("youtu")) {
				// Extract YouTube video ID and form embed URL
				let videoId = "";

				if (url.includes("youtu.be/")) {
					videoId = url.split("youtu.be/")[1];
				} else if (url.includes("watch?v=")) {
					videoId = url.split("watch?v=")[1];
				}

				if (videoId.includes("&")) videoId = videoId.split("&")[0];

				const embedUrl = `https://www.youtube.com/embed/${videoId}`;
				mediaElement = document.createElement("iframe");
				mediaElement.src = embedUrl;
				mediaElement.width = "300";
				mediaElement.height = "169";
				mediaElement.frameBorder = "0";
				mediaElement.allow =
					"accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
				mediaElement.allowFullscreen = true;
			}
		} else {
			mediaElement = document.createElement("img");
			mediaElement.src = url;
			mediaElement.alt = nameText;
			mediaElement.style.maxWidth = "300px";
			mediaElement.onerror = () => {
				console.error("Failed to load image:", mediaElement.src);
				mediaElement.src =
					"https://via.placeholder.com/300x300?text=Image+Not+Found";
			};
		}

		container.appendChild(mediaElement);
	});

	// Add name and description
	const name = document.createElement("p");
	name.textContent = nameText;

	const desc = document.createElement("div");

	if (typeof descText === "string" && descText.includes("youtu")) {
		// Handle YouTube links
		let videoId = "";
		if (descText.includes("youtu.be/")) {
			videoId = descText.split("youtu.be/")[1];
		} else if (descText.includes("watch?v=")) {
			videoId = descText.split("watch?v=")[1];
		}
		if (videoId.includes("&")) videoId = videoId.split("&")[0];

		const embedUrl = `https://www.youtube.com/embed/${videoId}`;
		const iframe = document.createElement("iframe");
		iframe.src = embedUrl;
		iframe.width = "300";
		iframe.height = "169";
		iframe.frameBorder = "0";
		iframe.allow =
			"accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
		iframe.allowFullscreen = true;

		desc.appendChild(iframe);
	} else if (descText.endsWith(".mp4")) {
		// Handle direct .mp4 video files
		const video = document.createElement("video");
		video.src = descText;
		video.controls = true;
		video.style.maxWidth = "300px";
		desc.appendChild(video);
	} else {
		// Fallback: normal text description
		desc.textContent = descText;
	}

	container.appendChild(desc);
	container.appendChild(name);
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

function updateCollection(item, forceRender = false) {
	if (!collection.has(item.id)) {
		collection.add(item.id);
		saveCollection(); // Optional: update localStorage
	} else if (!forceRender) {
		return; // Don't re-render unless explicitly asked
	}

	const collectionList = document.getElementById("collection-list");
	const li = document.createElement("li");
	li.dataset.itemId = item.id; // needed for filtering

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

	document.getElementById("collection-count").textContent = collection.size;
	console.log("🧩 Rendering item to collection:", item.id);
	console.log(
		"🔄 Updated collection-list HTML:",
		document.getElementById("collection-list").innerHTML,
	);
}

function saveCollection() {
	localStorage.setItem("gacha-collection", JSON.stringify([...collection]));
}

function pullItem() {
	console.log("pullItem() called");

	if (items.length === 0) {
		console.warn("No items to pull!");
		return;
	}

	const randomIndex = Math.floor(Math.random() * items.length);
	const item = items[randomIndex];
	const itemId = item.id;

	const indices = initializeDiscovery(item);

	// 🧠 Track discovered indices
	if (!discoveredItems[itemId]) {
		discoveredItems[itemId] = {
			names: [],
			images: [],
			descriptions: [],
		};
	}

	const track = discoveredItems[itemId];

	if (!track.names.includes(indices.nameIndex)) {
		track.names.push(indices.nameIndex);
	}
	if (!track.images.includes(indices.imageIndex)) {
		track.images.push(indices.imageIndex);
	}
	if (!track.descriptions.includes(indices.descIndex)) {
		track.descriptions.push(indices.descIndex);
	}

	console.log("📥 Updated discovery:", discoveredItems);

	displayItem(item, indices);
	updateHistory(item, indices);
	updateCollection(item);
	localStorage.setItem("gacha-discovery", JSON.stringify(discoveredItems));

	pullCount++;
	updatePullCountUI();
}

document
	.getElementById("collection-search")
	.addEventListener("input", (event) => {
		const query = event.target.value.toLowerCase();
		const items = document.querySelectorAll("#collection-list li");

		items.forEach((li) => {
			const text = li.textContent.toLowerCase();
			const matches = text.includes(query);
			li.style.display = matches ? "block" : "none";
		});
	});

function applyCollectionFilters() {
	const query = document
		.getElementById("collection-search")
		.value.toLowerCase();
	const selectedCategory = document
		.getElementById("collection-category-filter")
		.value.toLowerCase();

	const items = document.querySelectorAll("#collection-list li");
	items.forEach((li) => {
		const text = li.textContent.toLowerCase();
		const categories = li.getAttribute("data-categories") || "";

		const matchesText = text.includes(query);
		const matchesCategory =
			!selectedCategory || categories.includes(selectedCategory);

		li.style.display = matchesText && matchesCategory ? "block" : "none";
	});
}

function setTheme(themeName) {
	document.body.className = `theme-${themeName}`;
	localStorage.setItem("gacha-theme", themeName);
}

function updatePullCountUI() {
	localStorage.setItem("gacha-pull-count", pullCount);
	const countDisplay = document.getElementById("pull-count");
	if (countDisplay) countDisplay.textContent = pullCount;
}

function runNekoScript() {
	if (document.getElementById("nl")) return; // Already added

	window.NekoType = "white"; // Set global variable before script loads

	const container = document.createElement("h1");
	container.id = "nl";

	const script = document.createElement("script");
	script.src = "https://webneko.net/n20171213.js";

	const link = document.createElement("a");
	link.href = "https://webneko.net";
	link.textContent = "Neko";

	container.appendChild(script);
	container.appendChild(link);
	document.body.appendChild(container);
}

// Remove Neko script
function removeNekoScript() {
	const container = document.getElementById("nl");
	if (container) container.remove();
}

function applyDynamicCategoryFilters() {
	const filters = document.querySelectorAll("#category-filters select");
	const keyword = document
		.getElementById("category-search-keyword")
		.value.toLowerCase();

	const activeFilters = {};

	filters.forEach((select) => {
		const categoryType = select.dataset.categoryType;
		const value = select.value;
		if (value) activeFilters[categoryType] = value;
	});

	const collectionItems = document.querySelectorAll("#collection-list li");
	collectionItems.forEach((li) => {
		const itemId = li.dataset.itemId;
		const item = items.find((i) => i.id === itemId);
		if (!item) return;

		const categories = item.categories || {};
		let matches = true;

		// Match category filters
		for (const [type, value] of Object.entries(activeFilters)) {
			const legacyValues = Array.isArray(item.categories)
				? item.categories
				: [];

			const structuredValues = item.categories?.[type] || [];

			// Matches if either format includes the value
			if (
				!structuredValues.includes(value) &&
				!(type === "legacy" && legacyValues.includes(value))
			) {
				matches = false;
				break;
			}
		}

		// Match keyword
		if (matches && keyword) {
			const allValues = Object.values(categories)
				.flat()
				.join(" ")
				.toLowerCase();
			if (!allValues.includes(keyword)) matches = false;
		}

		li.style.display = matches ? "block" : "none";
	});
}

document.addEventListener("DOMContentLoaded", () => {
	console.log("DOM fully loaded");
	logDebug("DOM fully loaded. Starting fetch...");

	// Download collection
	document
		.getElementById("download-collection")
		.addEventListener("click", () => {
			const collectionArray = [...collection];
			const blob = new Blob([JSON.stringify(collectionArray, null, 2)], {
				type: "application/json",
			});
			const url = URL.createObjectURL(blob);

			const a = document.createElement("a");
			a.href = url;
			a.download = "gacha-collection.json";
			a.click();

			URL.revokeObjectURL(url);
		});

	// Unified theme selector logic
	const themeSelector = document.getElementById("theme-selector");
	const themeKey = "gacha-theme";
	const savedTheme = localStorage.getItem(themeKey) || "fantasy";
	setTheme(savedTheme);
	if (themeSelector) {
		themeSelector.value = savedTheme;
		themeSelector.addEventListener("change", () => {
			const newTheme = themeSelector.value;
			setTheme(newTheme);
		});
	}

	// Upload collection
	document
		.getElementById("upload-collection")
		.addEventListener("change", (event) => {
			const file = event.target.files[0];
			if (!file) return;

			const reader = new FileReader();
			reader.onload = (e) => {
				try {
					const loadedData = JSON.parse(e.target.result);
					if (Array.isArray(loadedData)) {
						collection = new Set(loadedData);
						localStorage.setItem(
							"gacha-collection",
							JSON.stringify(loadedData),
						);
						alert("Collection imported! Reloading...");
						location.reload();
					} else {
						alert("Invalid file format.");
					}
				} catch (err) {
					alert("Error parsing the file.");
					console.error(err);
				}
			};
			reader.readAsText(file);
		});

	updatePullCountUI(); // show pull count on page load

	fetch(
		"https://raw.githubusercontent.com/Carrier4133/Gacha-Machine/refs/heads/main/data/items.json",
	)
		.then((response) => {
			console.log("Fetching items.json...");
			return response.json();
		})
		.then((data) => {
			items = data;

// 🐾 Patch: Assign "Misc." to missing or empty category arrays
items.forEach(item => {
    if (!item.categories) item.categories = {};
    ['origin', 'type', 'theme', 'rarity'].forEach(key => {
        if (!Array.isArray(item.categories[key]) || item.categories[key].length === 0) {
            item.categories[key] = ['Misc.'];
        }
    });
});

			console.log("Items loaded:", items);
			logDebug("Items loaded successfully!");
			buildCategoryFilters(items);

			const savedDiscovery = localStorage.getItem("gacha-discovery");
			if (savedDiscovery) {
				discoveredItems = JSON.parse(savedDiscovery);
			}

			// Restore collection from localStorage
			const savedCollection = localStorage.getItem("gacha-collection");
			if (savedCollection) {
				collection = new Set(JSON.parse(savedCollection));
				console.log("Restored collection:", [...collection]);

				// Re-render saved collection
				for (const id of collection) {
					const item = items.find((itm) => itm.id === id);
					if (item) {
						updateCollection(item, true);
					} else {
						console.warn(" Could not find item with ID:", id);
					}
				}

				// 🐱 Neko Activation - Only if neko.exe is in collection
				if (collection.has("neko.exe")) {
					const nekoToggleContainer = document.getElementById("neko-toggle-container");
					const nekoToggle = document.getElementById("neko-toggle");

					// Show toggle
					if (nekoToggleContainer && nekoToggle) {
						nekoToggleContainer.style.display = "block";

						// Load preference from localStorage
						const enabled = localStorage.getItem("gacha-neko-enabled") === "true";
						nekoToggle.checked = enabled;

						if (enabled) runNekoScript();

						nekoToggle.addEventListener("change", () => {
							const checked = nekoToggle.checked;
							localStorage.setItem("gacha-neko-enabled", checked);
							if (checked) {
								runNekoScript();
							} else {
								removeNekoScript();
							}
						});
					}
				}

				// ✅ Log final HTML of collection list after rendering all items
				console.log("📦 Final rendered collection-list DOM:");
				console.log(
					document.getElementById("collection-list").innerHTML,
				);
			}

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

			const clearBtn = document.getElementById("clear-collection-button");
			console.log("Clear button element:", clearBtn); // Diagnostic

			if (clearBtn) {
				clearBtn.addEventListener("click", () => {
					console.log("Clear button clicked");

					const confirmed = confirm(
						"Are you sure you want to clear your collection?",
					);
					if (confirmed) {
						// Clear saved data
						localStorage.removeItem("gacha-collection");
						collection.clear();

						// Clear the DOM
						const list = document.getElementById("collection-list");
						if (list) list.innerHTML = "";

						const countDisplay =
							document.getElementById("collection-count");
						if (countDisplay) countDisplay.textContent = "0";

						console.log("Collection successfully cleared.");
					} else {
						console.log("Clear cancelled by user.");
					}
				});
			} else {
				console.warn("Clear collection button not found.");
			}
			const resetEverythingBtn = document.getElementById(
				"reset-everything-button",
			);

			if (resetEverythingBtn) {
				resetEverythingBtn.addEventListener("click", () => {
					const confirmed = confirm(
						"This will reset your entire collection and all-time pull count. Are you sure?",
					);
					if (!confirmed) return;

					// Clear collection
					localStorage.removeItem("gacha-collection");
					collection.clear();
					const list = document.getElementById("collection-list");
					if (list) list.innerHTML = "";
					const countDisplay =
						document.getElementById("collection-count");
					if (countDisplay) countDisplay.textContent = "0";

					// Clear pull count
					localStorage.removeItem("gacha-pull-count");
					pullCount = 0; // Reset the pullCount variable
					if (typeof updatePullCountUI === "function")
						updatePullCountUI();
					else console.warn("updatePullCountUI() not defined");

					// Clear discovery data
					localStorage.removeItem("gacha-discovery");
					discoveredItems = {};

					// Remove neko if it was active
					removeNekoScript();

					console.log("✅ Everything has been reset.");
				});
			} else {
				console.warn("Reset Everything button not found.");
			}
		})
		.catch((error) => {
			console.error("Fetch error:", error);
			logDebug("Error loading items: " + error);
		});

	function buildCategoryFilters(items) {
		const filtersContainer = document.getElementById("category-filters");
		if (!filtersContainer) return;

		const categoryTypes = ["origin", "type", "theme", "rarity", "legacy"];
		const categoryValues = {};

		// ✅ Corrected: only one forEach loop
		items.forEach((item) => {
			const cat = item.categories;

			if (Array.isArray(cat)) {
				// 🔧 Old format - push all to "legacy" category
				if (!categoryValues["legacy"])
					categoryValues["legacy"] = new Set();
				cat.forEach((v) => categoryValues["legacy"].add(v));
			} else {
				// ✅ New structured format
				categoryTypes.forEach((type) => {
					const values = cat?.[type] || [];
					if (!categoryValues[type]) categoryValues[type] = new Set();
					values.forEach((v) => categoryValues[type].add(v));
				});
			}
		});

		// Create a <select> for each category type
		categoryTypes.forEach((type) => {
			const label = document.createElement("label");
			label.textContent =
				type.charAt(0).toUpperCase() + type.slice(1) + ": ";

			const select = document.createElement("select");
			select.dataset.categoryType = type;
			select.innerHTML = `<option value="">All</option>`;

			// 🛠️ Safely handle undefined sets
			const values = categoryValues[type] || new Set();
			[...values].sort().forEach((value) => {
				const option = document.createElement("option");
				option.value = value;
				option.textContent = value;
				select.appendChild(option);
			});

			select.addEventListener("change", applyDynamicCategoryFilters);
			filtersContainer.appendChild(label);
			filtersContainer.appendChild(select);
		});
	}

	const searchInput = document.getElementById("collection-search");
	const categorySelect = document.getElementById(
		"collection-category-filter",
	);

	// Handle mode loading
	document.querySelectorAll("[data-mode]").forEach((btn) => {
		btn.addEventListener("click", () => {
			const mode = btn.dataset.mode;
			loadGameMode(mode);
		});
	});

	function loadGameMode(mode) {
		const container = document.getElementById("game-mode-container");
		container.innerHTML = ""; // Clear previous mode

		switch (mode) {
			case "roguelike":
				initRoguelike(container);
				break;
			case "slots":
				// Dynamically load slots mode
				if (!window.initSlots) {
					const script = document.createElement("script");
					script.src = "js/mode-slots.js";
					script.onload = () => window.initSlots(container);
					document.body.appendChild(script);
				} else {
					window.initSlots(container);
				}
				break;
			case "idle":
				initIdle(container);
				break;
			default:
				container.textContent = "Unknown mode.";
		}
	}

	function initRoguelike(container) {
		const div = document.createElement("div");
		div.innerHTML = `<h3>🧭 Roguelike Mode (WIP)</h3><p>You will fight using pulled items in turn-based battles.</p>`;
		container.appendChild(div);
	}



	function initIdle(container) {
		const div = document.createElement("div");
		div.innerHTML = `
		<h3>⏳ Idle Mode</h3>
		<p>Items will be pulled automatically every <strong><span id="idle-interval">5</span></strong> seconds.</p>
		<button id="idle-toggle-button">Start Idle Pulling</button>
		<p id="idle-status" style="margin-top:10px;">Status: <strong>Stopped</strong></p>
	`;
		container.appendChild(div);

		let idleInterval = null;
		const intervalSeconds = 5;
		const toggleBtn = document.getElementById("idle-toggle-button");
		const status = document.getElementById("idle-status");

		function startIdlePulling() {
			if (idleInterval) return;

			idleInterval = setInterval(() => {
				const item = items[Math.floor(Math.random() * items.length)];
				const indices = initializeDiscovery(item);
				displayItem(item, indices);
				updateHistory(item, indices);
				updateCollection(item);
			}, intervalSeconds * 1000);

			status.innerHTML = "Status: <strong>Running</strong>";
			toggleBtn.textContent = "Stop Idle Pulling";
		}

		function stopIdlePulling() {
			clearInterval(idleInterval);
			idleInterval = null;
			status.innerHTML = "Status: <strong>Stopped</strong>";
			toggleBtn.textContent = "Start Idle Pulling";
		}

		toggleBtn.addEventListener("click", () => {
			if (idleInterval) {
				stopIdlePulling();
			} else {
				startIdlePulling();
			}
		});
	}

	if (searchInput && categorySelect) {
		searchInput.addEventListener("input", applyCollectionFilters);
		categorySelect.addEventListener("change", applyCollectionFilters);
	} else {
		console.warn("Search or category filter input not found.");
	}
});

document
	.getElementById("category-search-keyword")
	.addEventListener("input", applyDynamicCategoryFilters);
