// Slot Machine Mode
// This mode allows players to spin a slot machine and win items on matches

window.initSlots = function(container) {
	const div = document.createElement("div");
	div.innerHTML = `
		<h3>🎰 Slot Machine Mode</h3>
		<div id="slots-reel" style="font-size: 2rem; margin: 10px 0;">⬜ ⬜ ⬜</div>
		<button id="slots-spin-button">Spin!</button>
		<p id="slots-result"></p>
	`;
	container.appendChild(div);

	const symbols = ["🍒", "⭐", "💎", "🍀", "🔥", "💣"];
	const spinBtn = document.getElementById("slots-spin-button");
	const reel = document.getElementById("slots-reel");
	const result = document.getElementById("slots-result");

	spinBtn.addEventListener("click", () => {
		const spin = [
			symbols[Math.floor(Math.random() * symbols.length)],
			symbols[Math.floor(Math.random() * symbols.length)],
			symbols[Math.floor(Math.random() * symbols.length)],
		];

		reel.textContent = spin.join(" ");
		if (spin[0] === spin[1] && spin[1] === spin[2]) {
			result.textContent = `🎉 You matched 3 ${spin[0]}! You win an item!`;
			// Optional: pull a random item
			const randomIndex = Math.floor(Math.random() * items.length);
			const item = items[randomIndex];
			const indices = initializeDiscovery(item);
			displayItem(item, indices);
			updateHistory(item, indices);
			updateCollection(item);
		} else {
			result.textContent = "🙁 No match. Try again!";
		}
	});
}; 