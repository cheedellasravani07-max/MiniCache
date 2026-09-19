const API_URL = "https://minicache-api.onrender.com";

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

        } else {

            resultElement.textContent =
                "Key not found.";
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

// Load entries when page opens
loadEntries();

// Automatically refresh entries every 2 seconds
setInterval(loadEntries, 2000);
// Check backend status every 5 seconds
setInterval(checkBackendStatus, 10000);