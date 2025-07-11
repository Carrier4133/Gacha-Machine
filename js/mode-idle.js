window.initIdle = function(container) {
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