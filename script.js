const API_URL = "https://minicache-api.onrender.com";
// ===============================
// Cache Activity Monitor
// ===============================

let activityLog = [];
async function loadActivity() {
    try {
        const response = await fetch(`${API_URL}/cache/activity`);

        if (!response.ok) {
            throw new Error("Failed to load activity");
        }

        const activities = await response.json();

        const activityTable = document.getElementById("activityLog");

        if (!activityTable) {
            return;
        }

        activityTable.innerHTML = "";

        if (activities.length === 0) {
            activityTable.innerHTML = `
                <tr>
                    <td colspan="4">No activity yet</td>
                </tr>
            `;
            return;
        }

        activities.forEach(activity => {
            const row = document.createElement("tr");

            row.innerHTML = `
                <td>${activity.time}</td>
                <td>${activity.operation}</td>
                <td>${activity.key}</td>
                <td>${activity.status}</td>
            `;

            activityTable.appendChild(row);
        });

    } catch (error) {
        console.error("Activity loading error:", error);
    }
}
function addActivity(operation, key, status) {

    const activityTable =
        document.getElementById("activityLog");

    if (!activityTable) {
        return;
    }

    const time =
        new Date().toLocaleTimeString();

    activityLog.unshift({
        time: time,
        operation: operation,
        key: key,
        status: status
    });

    // Keep only the latest 20 activities
    if (activityLog.length > 20) {
        activityLog.pop();
    }

    activityTable.innerHTML = "";

    activityLog.forEach(activity => {

        const row =
            document.createElement("tr");

        row.innerHTML = `
            <td>${activity.time}</td>
            <td>${activity.operation}</td>
            <td>${activity.key}</td>
            <td>${activity.status}</td>
        `;

        activityTable.appendChild(row);
    });
}
// Check backend status
async function checkBackendStatus() {

    const statusElement =
        document.getElementById("backendStatus");

    try {

        const response = await fetch(
            `${API_URL}/cache/stats`
        );

        if (response.ok) {

            statusElement.textContent = "🟢 Online";
            statusElement.style.color = "green";

        } else {

            statusElement.textContent = "🔴 Offline";
            statusElement.style.color = "red";
        }

    } catch (error) {

        statusElement.textContent = "🔴 Offline";
        statusElement.style.color = "red";

        console.error(
            "Backend status check failed:",
            error
        );
    }
}
// Add / Update cache entry
async function setCache() {

    const key = document.getElementById("key").value;
    const value = document.getElementById("value").value;
    const ttl = document.getElementById("ttl").value;

    if (!key || !value) {
        alert("Please enter both key and value.");
        return;
    }

    const data = {
        value: value
    };

    if (ttl) {
        data.ttl = Number(ttl);
    }

    try {

        const response = await fetch(
            `${API_URL}/cache/key/${encodeURIComponent(key)}`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(data)
            }
        );

        const result = await response.text();

        alert(result);
        addActivity(
            "SET",
            key,
            response.ok ? "Success" : "Failed"
        );
        loadStatistics();

    } catch (error) {

        alert("Unable to connect to the backend.");

        console.error(error);
    }
}


// Get cache entry
async function getCache() {

    const key = document.getElementById("getKey").value;
    const resultElement = document.getElementById("getResult");

    if (!key) {
        resultElement.textContent = "Please enter a key.";
        return;
    }

    try {

        const response = await fetch(
            `${API_URL}/cache/key/${encodeURIComponent(key)}`
        );

        if (response.ok) {

            const value = await response.text();

            resultElement.textContent =
                "Value: " + value;

            addActivity(
                "GET",
                key,
                "HIT"
            );

        } else {

            resultElement.textContent =
                "Key not found.";

            addActivity(
                "GET",
                key,
                "MISS"
            );
        }

        loadStatistics();

    } catch (error) {

        resultElement.textContent =
            "Unable to connect to the backend.";

        console.error(error);
    }
}


// Delete cache entry
async function deleteCache() {

    const key = document.getElementById("deleteKey").value;
    const resultElement = document.getElementById("deleteResult");

    if (!key) {
        resultElement.textContent = "Please enter a key.";
        return;
    }

    try {

        const response = await fetch(
            `${API_URL}/cache/key/${encodeURIComponent(key)}`,
            {
                method: "DELETE"
            }
        );

        const result = await response.text();

        resultElement.textContent = result;
        addActivity(
            "DELETE",
            key,
            response.ok ? "Success" : "Not Found"
        );
        loadStatistics();

    } catch (error) {

        resultElement.textContent =
            "Unable to connect to the backend.";

        console.error(error);
    }
}


// Clear entire cache
async function clearCache() {

    const resultElement = document.getElementById("clearResult");

    try {

        const response = await fetch(
            `${API_URL}/cache`,
            {
                method: "DELETE"
            }
        );

        const result = await response.text();

        resultElement.textContent = result;

        loadStatistics();

    } catch (error) {

        resultElement.textContent =
            "Unable to connect to the backend.";

        console.error(error);
    }
}


// Load cache statistics
async function loadStatistics() {

    try {

        const response = await fetch(
            `${API_URL}/cache/stats`
        );

        const statistics = await response.json();

        document.getElementById("cacheSize").textContent =
            statistics.size;

        document.getElementById("capacity").textContent =
            statistics.capacity;

        document.getElementById("hits").textContent =
            statistics.hits;

        document.getElementById("misses").textContent =
            statistics.misses;

        document.getElementById("hitRate").textContent =
            statistics.hitRate.toFixed(2) + "%";

        document.getElementById("evictions").textContent =
            statistics.evictions;
        // Update performance summary

        const totalRequests =
            statistics.hits + statistics.misses;

        const missRate =
            totalRequests === 0
                ? 0
                : (statistics.misses * 100) / totalRequests;

        const cacheUsage =
            statistics.capacity === 0
                ? 0
                : (statistics.size * 100) / statistics.capacity;

        document.getElementById("totalRequests").textContent =
            totalRequests;

        document.getElementById("performanceHitRate").textContent =
            statistics.hitRate.toFixed(2) + "%";

        document.getElementById("missRate").textContent =
            missRate.toFixed(2) + "%";

        document.getElementById("cacheUsage").textContent =
            cacheUsage.toFixed(2) + "%";

        document.getElementById("performanceEvictions").textContent =
            statistics.evictions;


// Performance message

        const performanceMessage =
            document.getElementById("performanceMessage");

        if (totalRequests === 0) {

            performanceMessage.textContent =
                "Waiting for cache activity...";

        } else if (statistics.hitRate >= 80) {

            performanceMessage.textContent =
                "Cache is serving requests efficiently.";

        } else if (statistics.hitRate >= 50) {

            performanceMessage.textContent =
                "Cache performance is moderate.";

        } else {

            performanceMessage.textContent =
                "Cache has a high miss rate.";
        }
        // Update Cache Health

        const healthElement =
            document.getElementById("cacheHealth");

        if (healthElement) {

            if (totalRequests === 0) {

                healthElement.textContent =
                    "⚪ No Activity";

            } else if (statistics.hitRate >= 80) {

                healthElement.textContent =
                    "🟢 Healthy";

            } else if (statistics.hitRate >= 50) {

                healthElement.textContent =
                    "🟡 Moderate";

            } else {

                healthElement.textContent =
                    "🔴 High Miss Rate";
            }
        }
        const now = new Date();

        document.getElementById("lastUpdated").textContent =
            now.toLocaleTimeString();

    } catch (error) {

        console.error(
            "Unable to load statistics:",
            error
        );
    }
}



// Load statistics when page opens
loadStatistics();
checkBackendStatus();


// Automatically refresh statistics every 2 seconds
setInterval(loadStatistics, 2000);
// Load current cache entries
async function loadEntries() {

    try {

        const response = await fetch(
            `${API_URL}/cache/entries`
        );

        const entries = await response.json();

        const tableBody =
            document.getElementById("cacheEntries");

        tableBody.innerHTML = "";

        for (const key in entries) {

            const row = document.createElement("tr");

            row.innerHTML = `
                <td>${key}</td>
                <td>${entries[key]}</td>
            `;

            tableBody.appendChild(row);
        }

    } catch (error) {

        console.error(
            "Unable to load cache entries:",
            error
        );
    }
}
// Load real cache activity from backend
async function loadActivity() {

    try {

        const response = await fetch(
            `${API_URL}/cache/activity`
        );

        if (!response.ok) {
            throw new Error("Failed to load activity");
        }

        const activities = await response.json();

        const tableBody =
            document.getElementById("cacheActivity");

        if (!tableBody) {
            console.error("cacheActivity element not found");
            return;
        }

        tableBody.innerHTML = "";

        activities.forEach(activity => {

            const row = document.createElement("tr");

            row.innerHTML = `
                <td>${activity.time}</td>
                <td>${activity.operation}</td>
                <td>${activity.key}</td>
                <td>${activity.status}</td>
            `;

            tableBody.appendChild(row);
        });

    } catch (error) {

        console.error(
            "Unable to load cache activity:",
            error
        );
    }
}
// Load entries when page opens
loadEntries();
// Load cache activity when page opens
loadActivity();

// Automatically refresh entries every 2 seconds
setInterval(loadEntries, 2000);
// Automatically refresh activity every 2 seconds
setInterval(loadActivity, 2000);
// Check backend status every 5 seconds
setInterval(checkBackendStatus, 10000);


// Run LRU eviction demonstration
async function runLRUDemo() {

    const resultElement =
        document.getElementById("lruDemoResult");

    resultElement.textContent =
        "Running LRU demonstration...";

    try {

        // Step 1: Clear the cache
        await fetch(`${API_URL}/cache`, {
            method: "DELETE"
        });

        // Step 2: Add 100 entries
        for (let i = 1; i <= 100; i++) {

            await fetch(
                `${API_URL}/cache/key/demo-${i}`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        value: `Demo Value ${i}`
                    })
                }
            );
        }

        // Step 3: Access demo-1
        // This makes demo-1 the most recently used entry.
        await fetch(
            `${API_URL}/cache/key/demo-1`
        );

        // Step 4: Add one more entry
        // This should evict the least recently used entry.
        await fetch(
            `${API_URL}/cache/key/demo-101`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    value: "Demo Value 101"
                })
            }
        );

        // Step 5: Get updated statistics
        const response =
            await fetch(`${API_URL}/cache/stats`);

        const statistics =
            await response.json();

        resultElement.textContent =
            `LRU Demo completed! ` +
            `Cache Size: ${statistics.size}, ` +
            `Evictions: ${statistics.evictions}`;

        // Refresh dashboard
        loadStatistics();
        loadEntries();

    } catch (error) {

        resultElement.textContent =
            "Unable to run LRU demonstration.";

        console.error(
            "LRU Demo Error:",
            error
        );
    }
}
// Run TTL expiry demonstration
async function runTTLDemo() {

    const ttlInput =
        document.getElementById("ttlDemoInput");

    const resultElement =
        document.getElementById("ttlDemoResult");

    const ttl = Number(ttlInput.value);

    if (!ttl || ttl < 1000) {

        resultElement.textContent =
            "Please enter a TTL of at least 1000 milliseconds.";

        return;
    }

    const demoKey =
        "ttl-demo-" + Date.now();

    try {

        // Step 1: Create a cache entry with TTL
        resultElement.textContent =
            `Creating cache entry with TTL of ${ttl} ms...`;

        const setResponse = await fetch(
            `${API_URL}/cache/key/${encodeURIComponent(demoKey)}`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    value: "TTL Demo Value",
                    ttl: ttl
                })
            }
        );

        if (!setResponse.ok) {
            throw new Error("Failed to create TTL demo entry.");
        }

        // Refresh dashboard
        loadStatistics();
        loadEntries();

        // Step 2: Confirm that the key exists
        const beforeResponse = await fetch(
            `${API_URL}/cache/key/${encodeURIComponent(demoKey)}`
        );

        if (beforeResponse.ok) {

            resultElement.textContent =
                `Entry created successfully. ` +
                `Waiting ${ttl / 1000} seconds for expiration...`;

        } else {

            resultElement.textContent =
                "Unable to verify TTL entry.";

            return;
        }

        // Step 3: Wait until TTL expires
        await new Promise(resolve =>
            setTimeout(resolve, ttl + 500)
        );

        // Step 4: Try to get the expired entry
        const afterResponse = await fetch(
            `${API_URL}/cache/key/${encodeURIComponent(demoKey)}`
        );

        // Refresh dashboard
        loadStatistics();
        loadEntries();

        if (!afterResponse.ok) {

            resultElement.textContent =
                `TTL Demo completed successfully! ` +
                `The key expired after ${ttl / 1000} seconds.`;

        } else {

            resultElement.textContent =
                "TTL expiration did not occur as expected.";
        }

    } catch (error) {

        resultElement.textContent =
            "Unable to run TTL demonstration.";

        console.error(
            "TTL Demo Error:",
            error
        );
    }
}
// Clear cache activity log
async function clearActivity() {

    const activityLog =
        document.getElementById("activityLog");

    activityLog.innerHTML = `
        <tr>
            <td colspan="4">
                No activity yet
            </td>
        </tr>
    `;
}
loadActivity();
// Load current LRU order
async function loadLRUOrder() {

    const lruElement =
        document.getElementById("lruOrder");

    if (!lruElement) {
        return;
    }

    try {

        const response =
            await fetch(`${API_URL}/cache/lru`);

        if (!response.ok) {
            throw new Error("Failed to load LRU order");
        }

        const lruKeys =
            await response.json();

        if (lruKeys.length === 0) {

            lruElement.textContent =
                "Cache is empty.";

            return;
        }

        lruElement.innerHTML =
            lruKeys.map((key, index) => {

                const label =
                    index === 0
                        ? "🟢 MRU"
                        : index === lruKeys.length - 1
                            ? "🔴 LRU"
                            : "";

                return `
                    <div class="lru-item">
                        <span>${label}</span>
                        <strong>${key}</strong>
                    </div>
                `;

            }).join("");

    } catch (error) {

        console.error(
            "Unable to load LRU order:",
            error
        );

        lruElement.textContent =
            "Unable to load LRU order.";
    }
}
loadLRUOrder();
setInterval(loadLRUOrder, 2000);