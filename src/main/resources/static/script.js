const API_URL = "https://minicache-api.onrender.com";


// ======================================================
// AUTHENTICATION
// ======================================================

function getToken() {
    return localStorage.getItem("minicacheToken");
}


async function refreshAccessToken() {

    const refreshToken =
        localStorage.getItem("minicacheRefreshToken");

    if (!refreshToken) {
        return false;
    }

    try {

        const response =
            await fetch(
                `${API_URL}/auth/refresh`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        refreshToken: refreshToken
                    })
                }
            );

        if (!response.ok) {
            return false;
        }

        const data =
            await response.json();

        if (data.success && data.token) {

            localStorage.setItem(
                "minicacheToken",
                data.token
            );

            if (data.refreshToken) {

                localStorage.setItem(
                    "minicacheRefreshToken",
                    data.refreshToken
                );
            }

            return true;
        }

        return false;

    } catch (error) {

        console.error(
            "Token refresh error:",
            error
        );

        return false;
    }
}


// ======================================================
// SESSION EXPIRED
// ======================================================

function showLoginPage(message = "") {

    localStorage.removeItem("minicacheToken");
    localStorage.removeItem("minicacheRefreshToken");
    localStorage.removeItem("minicacheUsername");
    localStorage.removeItem("minicacheRole");

    console.log(
        "Session expired. Redirecting to login."
    );

    window.location.href =
        "login.html";
}


// ======================================================
// AUTHENTICATED FETCH
// ======================================================

async function authenticatedFetch(
    url,
    options = {},
    retry = true
) {

    const token =
        getToken();

    options.headers = {
        "Content-Type": "application/json",
        ...(options.headers || {})
    };

    if (token) {

        options.headers["Authorization"] =
            "Bearer " + token;
    }

    try {

        const response =
            await fetch(
                url,
                options
            );


        if (
            (response.status === 401 ||
                response.status === 403) &&
            retry
        ) {

            const refreshed =
                await refreshAccessToken();

            if (refreshed) {

                const newToken =
                    getToken();

                options.headers["Authorization"] =
                    "Bearer " + newToken;

                return authenticatedFetch(
                    url,
                    options,
                    false
                );
            }

            showLoginPage(
                "Session expired. Please login again."
            );

            return response;
        }

        return response;

    } catch (error) {

        console.error(
            "Network error:",
            error
        );

        throw error;
    }
}


// ======================================================
// ACTIVITY
// ======================================================

let activityLog = [];


function addActivity(
    operation,
    key,
    status
) {

    const activityTable =
        document.getElementById(
            "cacheActivity"
        );

    if (!activityTable) {
        return;
    }

    activityLog.unshift({
        time:
            new Date().toLocaleTimeString(),

        operation:
        operation,

        key:
        key,

        status:
        status
    });


    if (activityLog.length > 20) {

        activityLog.pop();
    }


    activityTable.innerHTML = "";


    activityLog.forEach(
        activity => {

            const row =
                document.createElement("tr");

            row.innerHTML = `
                <td>${activity.time}</td>
                <td>${activity.operation}</td>
                <td>${activity.key}</td>
                <td>${activity.status}</td>
            `;

            activityTable.appendChild(row);
        }
    );
}


// ======================================================
// SET / UPDATE CACHE
// ======================================================

async function setCache() {

    const keyElement =
        document.getElementById("key");

    const valueElement =
        document.getElementById("value");

    const ttlElement =
        document.getElementById("ttl");


    if (!keyElement || !valueElement) {
        return;
    }


    const key =
        keyElement.value.trim();

    const value =
        valueElement.value;

    const ttl =
        ttlElement
            ? ttlElement.value
            : "";


    if (!key || !value) {

        alert(
            "Please enter both key and value."
        );

        return;
    }


    const data = {
        value: value
    };


    if (ttl) {

        data.ttl =
            Number(ttl);
    }


    try {

        const response =
            await authenticatedFetch(
                `${API_URL}/cache/key/${encodeURIComponent(key)}`,
                {
                    method: "POST",

                    body:
                        JSON.stringify(data)
                }
            );


        const result =
            await response.text();


        if (response.ok) {

            alert(result);

            addActivity(
                "SET",
                key,
                "Success"
            );

        } else {

            alert(
                "Failed: " + result
            );

            addActivity(
                "SET",
                key,
                "Failed"
            );
        }


        await loadStatistics();
        await loadEntries();
        await loadLRUOrder();

    } catch (error) {

        alert(
            "Unable to connect to backend."
        );

        console.error(
            "SET error:",
            error
        );
    }
}


// ======================================================
// GET CACHE
// ======================================================

async function getCache() {

    const keyElement =
        document.getElementById(
            "getKey"
        );

    const resultElement =
        document.getElementById(
            "getResult"
        );


    if (!keyElement || !resultElement) {
        return;
    }


    const key =
        keyElement.value.trim();


    if (!key) {

        resultElement.textContent =
            "Please enter a key.";

        return;
    }


    try {

        const response =
            await authenticatedFetch(
                `${API_URL}/cache/key/${encodeURIComponent(key)}`
            );


        if (response.ok) {

            const value =
                await response.text();

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


        await loadStatistics();

    } catch (error) {

        resultElement.textContent =
            "Unable to connect to backend.";

        console.error(
            "GET error:",
            error
        );
    }
}


// ======================================================
// DELETE CACHE ENTRY
// ======================================================

async function deleteCache() {

    const keyElement =
        document.getElementById(
            "deleteKey"
        );

    const resultElement =
        document.getElementById(
            "deleteResult"
        );


    if (!keyElement || !resultElement) {
        return;
    }


    const key =
        keyElement.value.trim();


    if (!key) {

        resultElement.textContent =
            "Please enter a key.";

        return;
    }


    try {

        const response =
            await authenticatedFetch(
                `${API_URL}/cache/key/${encodeURIComponent(key)}`,
                {
                    method: "DELETE"
                }
            );


        const result =
            await response.text();


        resultElement.textContent =
            result;


        addActivity(
            "DELETE",
            key,
            response.ok
                ? "Success"
                : "Not Found"
        );


        await loadStatistics();
        await loadEntries();
        await loadLRUOrder();

    } catch (error) {

        resultElement.textContent =
            "Unable to connect to backend.";

        console.error(
            "DELETE error:",
            error
        );
    }
}


// ======================================================
// CLEAR CACHE
// ======================================================

async function clearCache() {

    const resultElement =
        document.getElementById(
            "clearResult"
        );


    if (!resultElement) {
        return;
    }


    try {

        const response =
            await authenticatedFetch(
                `${API_URL}/cache`,
                {
                    method: "DELETE"
                }
            );


        const result =
            await response.text();


        resultElement.textContent =
            result;


        addActivity(
            "CLEAR",
            "ALL",
            response.ok
                ? "Success"
                : "Failed"
        );


        await loadStatistics();
        await loadEntries();
        await loadLRUOrder();

    } catch (error) {

        resultElement.textContent =
            "Unable to connect to backend.";

        console.error(
            "CLEAR error:",
            error
        );
    }
}


// ======================================================
// STATISTICS
// ======================================================

async function loadStatistics() {

    try {

        const response =
            await authenticatedFetch(
                `${API_URL}/cache/stats`
            );


        if (!response.ok) {
            return;
        }


        const statistics =
            await response.json();


        const size =
            Number(statistics.size || 0);

        const capacity =
            Number(statistics.capacity || 0);

        const hits =
            Number(statistics.hits || 0);

        const misses =
            Number(statistics.misses || 0);

        const evictions =
            Number(statistics.evictions || 0);

        const hitRate =
            Number(statistics.hitRate || 0);


        // BASIC STATISTICS

        const cacheSize =
            document.getElementById(
                "cacheSize"
            );

        const capacityElement =
            document.getElementById(
                "capacity"
            );

        const hitsElement =
            document.getElementById(
                "hits"
            );

        const missesElement =
            document.getElementById(
                "misses"
            );

        const hitRateElement =
            document.getElementById(
                "hitRate"
            );

        const evictionsElement =
            document.getElementById(
                "evictions"
            );


        if (cacheSize)
            cacheSize.textContent =
                size;

        if (capacityElement)
            capacityElement.textContent =
                capacity;

        if (hitsElement)
            hitsElement.textContent =
                hits;

        if (missesElement)
            missesElement.textContent =
                misses;

        if (hitRateElement)
            hitRateElement.textContent =
                hitRate.toFixed(2) + "%";

        if (evictionsElement)
            evictionsElement.textContent =
                evictions;


        // PERFORMANCE

        const totalRequests =
            hits + misses;


        const missRate =
            totalRequests === 0
                ? 0
                : (misses * 100) /
                totalRequests;


        const cacheUsage =
            capacity === 0
                ? 0
                : (size * 100) /
                capacity;


        const totalRequestsElement =
            document.getElementById(
                "totalRequests"
            );

        const performanceHitRate =
            document.getElementById(
                "performanceHitRate"
            );

        const missRateElement =
            document.getElementById(
                "missRate"
            );

        const cacheUsageElement =
            document.getElementById(
                "cacheUsage"
            );

        const performanceEvictions =
            document.getElementById(
                "performanceEvictions"
            );


        if (totalRequestsElement)
            totalRequestsElement.textContent =
                totalRequests;

        if (performanceHitRate)
            performanceHitRate.textContent =
                hitRate.toFixed(2) + "%";

        if (missRateElement)
            missRateElement.textContent =
                missRate.toFixed(2) + "%";

        if (cacheUsageElement)
            cacheUsageElement.textContent =
                cacheUsage.toFixed(2) + "%";

        if (performanceEvictions)
            performanceEvictions.textContent =
                evictions;


        // PERFORMANCE MESSAGE

        const performanceMessage =
            document.getElementById(
                "performanceMessage"
            );


        if (performanceMessage) {

            if (totalRequests === 0) {

                performanceMessage.textContent =
                    "Waiting for cache activity...";

            } else if (hitRate >= 80) {

                performanceMessage.textContent =
                    "Cache is serving requests efficiently.";

            } else if (hitRate >= 50) {

                performanceMessage.textContent =
                    "Cache performance is moderate.";

            } else {

                performanceMessage.textContent =
                    "Cache has a high miss rate.";
            }
        }


        // CACHE HEALTH

        const healthElement =
            document.getElementById(
                "cacheHealth"
            );


        if (healthElement) {

            if (totalRequests === 0) {

                healthElement.textContent =
                    "⚪ No Activity";

            } else if (hitRate >= 80) {

                healthElement.textContent =
                    "🟢 Healthy";

            } else if (hitRate >= 50) {

                healthElement.textContent =
                    "🟡 Moderate";

            } else {

                healthElement.textContent =
                    "🔴 High Miss Rate";
            }
        }


        // LAST UPDATED

        const lastUpdated =
            document.getElementById(
                "lastUpdated"
            );


        if (lastUpdated) {

            lastUpdated.textContent =
                new Date()
                    .toLocaleTimeString();
        }


        // CHART

        updateMetricsChart(
            hitRate,
            cacheUsage
        );


    } catch (error) {

        console.error(
            "Statistics error:",
            error
        );
    }
}


// ======================================================
// CACHE ENTRIES
// ======================================================

async function loadEntries() {

    try {

        const response =
            await authenticatedFetch(
                `${API_URL}/cache/entries`
            );


        if (!response.ok) {
            return;
        }


        const entries =
            await response.json();


        const tableBody =
            document.getElementById(
                "cacheEntries"
            );


        if (!tableBody) {
            return;
        }


        tableBody.innerHTML = "";


        const keys =
            Object.keys(entries);


        if (keys.length === 0) {

            tableBody.innerHTML = `
                <tr>
                    <td colspan="2">
                        No cache entries
                    </td>
                </tr>
            `;

            return;
        }


        keys.forEach(
            key => {

                const row =
                    document.createElement(
                        "tr"
                    );

                row.innerHTML = `
                    <td>${key}</td>
                    <td>${entries[key]}</td>
                `;

                tableBody.appendChild(row);
            }
        );


    } catch (error) {

        console.error(
            "Cache entries error:",
            error
        );
    }
}


// ======================================================
// CACHE ACTIVITY
// ======================================================

async function loadActivity() {

    try {

        const response =
            await authenticatedFetch(
                `${API_URL}/cache/activity`
            );


        if (!response.ok) {
            return;
        }


        const activities =
            await response.json();


        const tableBody =
            document.getElementById(
                "cacheActivity"
            );


        if (!tableBody) {
            return;
        }


        tableBody.innerHTML = "";


        if (
            !Array.isArray(activities) ||
            activities.length === 0
        ) {

            tableBody.innerHTML = `
                <tr>
                    <td colspan="4">
                        No activity yet
                    </td>
                </tr>
            `;

            return;
        }


        activities.forEach(
            activity => {

                const row =
                    document.createElement(
                        "tr"
                    );

                row.innerHTML = `
                    <td>${activity.time || "-"}</td>
                    <td>${activity.operation || "-"}</td>
                    <td>${activity.key || "-"}</td>
                    <td>${activity.status || "-"}</td>
                `;

                tableBody.appendChild(row);
            }
        );


    } catch (error) {

        console.error(
            "Activity loading error:",
            error
        );
    }
}


// ======================================================
// LRU ORDER
// ======================================================

async function loadLRUOrder() {

    const lruElement =
        document.getElementById(
            "lruOrder"
        );


    if (!lruElement) {
        return;
    }


    try {

        lruElement.textContent =
            "Loading LRU order...";


        const response =
            await authenticatedFetch(
                `${API_URL}/cache/lru`
            );


        console.log(
            "LRU API status:",
            response.status
        );


        if (!response.ok) {

            const errorText =
                await response.text();

            console.error(
                "LRU API error:",
                response.status,
                errorText
            );


            lruElement.textContent =
                `Unable to load LRU order (${response.status})`;

            return;
        }


        const lruKeys =
            await response.json();


        console.log(
            "LRU data:",
            lruKeys
        );


        if (
            !Array.isArray(lruKeys) ||
            lruKeys.length === 0
        ) {

            lruElement.innerHTML = `
                <div class="lru-empty">

                    <i class="fa-solid fa-box-open"></i>

                    <span>
                        Cache is empty.
                    </span>

                </div>
            `;

            return;
        }


        lruElement.innerHTML =
            lruKeys
                .map(
                    (key, index) => {

                        const label =
                            index === 0
                                ? "MRU"
                                : index ===
                                lruKeys.length - 1
                                    ? "LRU"
                                    : "";


                        return `
                            <div class="lru-item">

                                <span>
                                    ${label}
                                </span>

                                <strong>
                                    ${key}
                                </strong>

                            </div>
                        `;
                    }
                )
                .join("");


    } catch (error) {

        console.error(
            "LRU loading error:",
            error
        );


        lruElement.textContent =
            "Unable to load LRU order.";
    }
}

// ======================================================
// BACKEND STATUS
// ======================================================
async function checkBackendStatus() {

    const statusElement =
        document.getElementById("backendStatus");

    const healthStatusElement =
        document.getElementById("backendStatusHealth");

    if (!statusElement && !healthStatusElement) {
        return;
    }

    try {

        const response =
            await fetch(
                `${API_URL}/cache/health`
            );

        let statusText;
        let statusColor;

        if (response.ok) {

            const data =
                await response.text();

            if (data.trim() === "UP") {

                statusText = "🟢 Online";
                statusColor = "green";

            } else {

                statusText = "🔴 Offline";
                statusColor = "red";
            }

        } else {

            statusText = "🔴 Offline";
            statusColor = "red";
        }

        // Top bar
        if (statusElement) {

            statusElement.textContent =
                statusText;

            statusElement.style.color =
                statusColor;
        }

        // Performance section
        if (healthStatusElement) {

            healthStatusElement.textContent =
                statusText;

            healthStatusElement.style.color =
                statusColor;
        }

    } catch (error) {

        console.error(
            "Backend status error:",
            error
        );

        if (statusElement) {

            statusElement.textContent =
                "🔴 Offline";

            statusElement.style.color =
                "red";
        }

        if (healthStatusElement) {

            healthStatusElement.textContent =
                "🔴 Offline";

            healthStatusElement.style.color =
                "red";
        }
    }
}
// ======================================================
// CACHE HEALTH
// ======================================================

async function checkCacheHealth() {

    const healthElement =
        document.getElementById(
            "cacheHealth"
        );


    if (!healthElement) {
        return;
    }


    try {

        const response =
            await authenticatedFetch(
                `${API_URL}/cache/health`
            );


        if (!response.ok) {

            healthElement.textContent =
                "🔴 Down";

            return;
        }


        const data =
            await response.text();


        if (data.trim() === "UP") {

            healthElement.textContent =
                "🟢 Healthy";

        } else {

            healthElement.textContent =
                "🔴 Down";
        }


    } catch (error) {

        healthElement.textContent =
            "🔴 Backend Offline";
    }
}


// ======================================================
// BULK CACHE
// ======================================================

async function bulkSetCache() {

    const inputElement =
        document.getElementById(
            "bulkEntries"
        );

    const resultElement =
        document.getElementById(
            "bulkResult"
        );


    if (!inputElement || !resultElement) {
        return;
    }


    const input =
        inputElement.value;


    if (!input.trim()) {

        resultElement.textContent =
            "Please enter cache entries.";

        return;
    }


    try {

        const entries =
            JSON.parse(input);


        const response =
            await authenticatedFetch(
                `${API_URL}/cache/bulk`,
                {
                    method: "POST",

                    body:
                        JSON.stringify(entries)
                }
            );


        const result =
            await response.text();


        resultElement.textContent =
            response.ok
                ? result
                : "Bulk operation failed: " +
                result;


        await loadStatistics();
        await loadEntries();
        await loadLRUOrder();


    } catch (error) {

        resultElement.textContent =
            "Invalid JSON format.";

        console.error(
            "Bulk operation error:",
            error
        );
    }
}


// ======================================================
// LRU DEMO
// ======================================================

async function runLRUDemo() {

    const resultElement =
        document.getElementById(
            "lruDemoResult"
        );


    if (!resultElement) {
        return;
    }


    resultElement.textContent =
        "Running LRU demonstration...";


    try {

        // Clear cache

        const clearResponse =
            await authenticatedFetch(
                `${API_URL}/cache`,
                {
                    method: "DELETE"
                }
            );


        if (!clearResponse.ok) {

            throw new Error(
                "Unable to clear cache."
            );
        }


        // Fill cache

        for (
            let i = 1;
            i <= 100;
            i++
        ) {

            const response =
                await authenticatedFetch(
                    `${API_URL}/cache/key/demo-${i}`,
                    {
                        method: "POST",

                        body:
                            JSON.stringify({
                                value:
                                    `Demo Value ${i}`
                            })
                    }
                );


            if (!response.ok) {

                throw new Error(
                    `Failed to add demo-${i}`
                );
            }
        }


        // Access demo-1

        await authenticatedFetch(
            `${API_URL}/cache/key/demo-1`
        );


        // Add demo-101

        await authenticatedFetch(
            `${API_URL}/cache/key/demo-101`,
            {
                method: "POST",

                body:
                    JSON.stringify({
                        value:
                            "Demo Value 101"
                    })
            }
        );


        const response =
            await authenticatedFetch(
                `${API_URL}/cache/stats`
            );


        const statistics =
            await response.json();


        resultElement.textContent =
            `LRU Demo completed! ` +
            `Cache Size: ${statistics.size}, ` +
            `Evictions: ${statistics.evictions}`;


        await loadEntries();
        await loadLRUOrder();
        await loadStatistics();


    } catch (error) {

        resultElement.textContent =
            "Unable to run LRU demonstration.";

        console.error(
            "LRU Demo Error:",
            error
        );
    }
}


// ======================================================
// TTL DEMO
// ======================================================

async function runTTLDemo() {

    const ttlInput =
        document.getElementById(
            "ttlDemoInput"
        );

    const resultElement =
        document.getElementById(
            "ttlDemoResult"
        );


    if (!ttlInput || !resultElement) {
        return;
    }


    const ttl =
        Number(ttlInput.value);


    if (!ttl || ttl < 1000) {

        resultElement.textContent =
            "Please enter a TTL of at least 1000 milliseconds.";

        return;
    }


    const demoKey =
        "ttl-demo-" +
        Date.now();


    try {

        resultElement.textContent =
            `Creating cache entry with TTL of ${ttl} ms...`;


        const setResponse =
            await authenticatedFetch(
                `${API_URL}/cache/key/${encodeURIComponent(demoKey)}`,
                {
                    method: "POST",

                    body:
                        JSON.stringify({
                            value:
                                "TTL Demo Value",

                            ttl:
                            ttl
                        })
                }
            );


        if (!setResponse.ok) {

            throw new Error(
                "Failed to create TTL demo entry."
            );
        }


        const beforeResponse =
            await authenticatedFetch(
                `${API_URL}/cache/key/${encodeURIComponent(demoKey)}`
            );


        if (!beforeResponse.ok) {

            resultElement.textContent =
                "Unable to verify TTL entry.";

            return;
        }


        resultElement.textContent =
            `Entry created successfully. ` +
            `Waiting ${ttl / 1000} seconds for expiration...`;


        await new Promise(
            resolve =>
                setTimeout(
                    resolve,
                    ttl + 500
                )
        );


        const afterResponse =
            await authenticatedFetch(
                `${API_URL}/cache/key/${encodeURIComponent(demoKey)}`
            );


        if (!afterResponse.ok) {

            resultElement.textContent =
                `TTL Demo completed successfully! ` +
                `The key expired after ${ttl / 1000} seconds.`;

        } else {

            resultElement.textContent =
                "TTL expiration did not occur as expected.";
        }


        await loadStatistics();
        await loadEntries();


    } catch (error) {

        resultElement.textContent =
            "Unable to run TTL demonstration.";

        console.error(
            "TTL Demo Error:",
            error
        );
    }
}


// ======================================================
// CONCURRENCY BENCHMARK
// ======================================================

async function runConcurrencyBenchmark() {

    const requestsInput =
        document.getElementById(
            "benchmarkRequests"
        );

    const resultElement =
        document.getElementById(
            "benchmarkResult"
        );


    if (!requestsInput || !resultElement) {
        return;
    }


    const requests =
        requestsInput.value.trim();


    if (
        !requests ||
        Number(requests) <= 0
    ) {

        resultElement.textContent =
            "Please enter a valid number of requests.";

        return;
    }


    resultElement.textContent =
        "Running benchmark...";


    try {

        const response =
            await authenticatedFetch(
                `${API_URL}/cache/benchmark/concurrency?requests=${encodeURIComponent(requests)}`
            );


        const data =
            await response.json();


        if (!response.ok) {

            resultElement.textContent =
                data.error ||
                "Benchmark failed.";

            return;
        }


        resultElement.innerHTML = `
            <div class="benchmark-results">

                <p>
                    <strong>Requests:</strong>
                    ${data.requests}
                </p>

                <p>
                    <strong>Execution Time:</strong>
                    ${data.durationMs} ms
                </p>

                <p>
                    <strong>Requests/Second:</strong>
                    ${data.requestsPerSecond}
                </p>

            </div>
        `;


    } catch (error) {

        resultElement.textContent =
            "Unable to connect to backend.";

        console.error(
            "Benchmark error:",
            error
        );
    }
}


// ======================================================
// CLEAR ACTIVITY
// ======================================================
async function clearActivity() {

    const activityTable =
        document.getElementById(
            "cacheActivity"
        );

    if (!activityTable) {
        return;
    }

    try {

        const response =
            await authenticatedFetch(
                `${API_URL}/cache/activity`,
                {
                    method: "DELETE"
                }
            );

        if (!response.ok) {

            throw new Error(
                "Failed to clear activity."
            );
        }

        activityTable.innerHTML = `
            <tr>
                <td colspan="4">
                    No activity yet
                </td>
            </tr>
        `;

        activityLog = [];

    } catch (error) {

        console.error(
            "Clear activity error:",
            error
        );

        alert(
            "Unable to clear activity."
        );
    }
}

// ======================================================
// CHART
// ======================================================

const metricsLabels = [];
const hitRateData = [];
const cacheUsageData = [];

let metricsChart = null;


function initializeMetricsChart() {

    const canvas =
        document.getElementById(
            "metricsChart"
        );


    if (!canvas) {
        return;
    }


    if (typeof Chart === "undefined") {

        console.error(
            "Chart.js is not loaded."
        );

        return;
    }


    if (metricsChart) {

        try {
            metricsChart.destroy();
        } catch (error) {
            console.error(error);
        }

        metricsChart = null;
    }


    metricsChart =
        new Chart(
            canvas,
            {
                type: "line",

                data: {

                    labels:
                    metricsLabels,

                    datasets: [

                        {
                            label:
                                "Hit Rate (%)",

                            data:
                            hitRateData,

                            tension:
                                0.3
                        },

                        {
                            label:
                                "Cache Usage (%)",

                            data:
                            cacheUsageData,

                            tension:
                                0.3
                        }

                    ]
                },

                options: {

                    responsive:
                        true,

                    maintainAspectRatio:
                        false,

                    scales: {

                        y: {

                            beginAtZero:
                                true,

                            max:
                                100
                        }
                    }
                }
            }
        );
}


function updateMetricsChart(
    hitRate,
    cacheUsage
) {

    if (!metricsChart) {
        return;
    }


    metricsLabels.push(
        new Date()
            .toLocaleTimeString()
    );


    hitRateData.push(
        hitRate
    );


    cacheUsageData.push(
        Number(
            cacheUsage.toFixed(2)
        )
    );


    if (
        metricsLabels.length >
        10
    ) {

        metricsLabels.shift();
        hitRateData.shift();
        cacheUsageData.shift();
    }


    metricsChart.update(
        "none"
    );
}


// ======================================================
// PERSISTENCE
// ======================================================

async function showPersistenceStatus() {

    const status =
        document.getElementById(
            "persistenceStatus"
        );


    if (!status) {
        return;
    }


    const token =
        getToken();


    if (!token) {

        status.textContent =
            "Login required";

        return;
    }


    try {

        const response =
            await authenticatedFetch(
                `${API_URL}/cache/persistence/status`
            );


        if (!response.ok) {

            status.textContent =
                "Unavailable";

            return;
        }


        const data =
            await response.json();


        status.textContent =
            data.enabled
                ? "Enabled"
                : "Disabled";


    } catch (error) {

        console.error(
            "Persistence status error:",
            error
        );

        status.textContent =
            "Unavailable";
    }
}


// ======================================================
// JWT ROLE
// ======================================================

function getUserRoleFromToken() {

    const token =
        getToken();


    if (!token) {
        return null;
    }


    try {

        const payload =
            JSON.parse(
                atob(
                    token
                        .split(".")[1]
                        .replace(/-/g, "+")
                        .replace(/_/g, "/")
                )
            );


        return payload.role ||
            null;


    } catch (error) {

        console.error(
            "JWT role error:",
            error
        );

        return null;
    }
}


// ======================================================
// DISPLAY USER ROLE
// ======================================================

function displayUserRole() {

    const role =
        getUserRoleFromToken();


    if (role) {

        localStorage.setItem(
            "minicacheRole",
            role
        );
    }


    const username =
        localStorage.getItem(
            "minicacheUsername"
        ) || "User";


    const finalRole =
        role ||
        localStorage.getItem(
            "minicacheRole"
        ) ||
        "USER";


    const dashboardUsername =
        document.getElementById(
            "dashboardUsername"
        );

    const sidebarUsername =
        document.getElementById(
            "sidebarUsername"
        );

    const sidebarRole =
        document.getElementById(
            "sidebarRole"
        );

    const userRole =
        document.getElementById(
            "userRole"
        );


    if (dashboardUsername) {

        dashboardUsername.textContent =
            username;
    }


    if (sidebarUsername) {

        sidebarUsername.textContent =
            username;
    }


    if (sidebarRole) {

        sidebarRole.textContent =
            finalRole;
    }


    if (userRole) {

        userRole.textContent =
            finalRole;
    }


    return finalRole;
}


// ======================================================
// ADMIN PANEL
// ======================================================

function showAdminPanel() {

    const role =
        localStorage.getItem(
            "minicacheRole"
        );


    const adminPanel =
        document.getElementById(
            "adminPanel"
        );


    const adminNavItem =
        document.getElementById(
            "adminNavItem"
        );


    if (role === "ADMIN") {

        if (adminPanel) {

            adminPanel.style.display =
                "block";
        }


        if (adminNavItem) {

            adminNavItem.style.display =
                "flex";
        }


        loadAdminStats();
        loadAdminUsers();


    } else {

        if (adminPanel) {

            adminPanel.style.display =
                "none";
        }


        if (adminNavItem) {

            adminNavItem.style.display =
                "none";
        }
    }
}


// ======================================================
// ADMIN STATISTICS
// ======================================================

async function loadAdminStats() {

    const role =
        localStorage.getItem(
            "minicacheRole"
        );


    if (role !== "ADMIN") {
        return;
    }


    try {

        const response =
            await authenticatedFetch(
                `${API_URL}/admin/stats`
            );


        if (!response.ok) {

            console.error(
                "Admin statistics failed:",
                response.status
            );

            return;
        }


        const data =
            await response.json();


        const fields = {

            adminTotalUsers:
            data.totalUsers,

            adminTotalAdmins:
            data.totalAdmins,

            adminTotalNormalUsers:
            data.totalNormalUsers,

            adminVerifiedUsers:
            data.verifiedUsers,

            adminUnverifiedUsers:
            data.unverifiedUsers,

            adminCacheSize:
            data.cacheSize,

            adminCacheCapacity:
            data.cacheCapacity,

            adminCacheHits:
            data.cacheHits,

            adminCacheMisses:
            data.cacheMisses,

            adminCacheHitRate:
                Number(
                    data.cacheHitRate || 0
                ).toFixed(2) + "%",

            adminCacheEvictions:
            data.cacheEvictions
        };


        Object.entries(fields)
            .forEach(
                ([id, value]) => {

                    const element =
                        document.getElementById(id);

                    if (element) {

                        element.textContent =
                            value;
                    }
                }
            );


    } catch (error) {

        console.error(
            "Admin statistics error:",
            error
        );
    }
}


// ======================================================
// ADMIN USER LIST
// ======================================================

async function loadAdminUsers() {

    const role =
        localStorage.getItem(
            "minicacheRole"
        );


    if (role !== "ADMIN") {
        return;
    }


    try {

        const response =
            await authenticatedFetch(
                `${API_URL}/admin/users`
            );


        if (!response.ok) {

            console.error(
                "Admin users failed:",
                response.status
            );

            return;
        }


        const users =
            await response.json();


        const tableBody =
            document.getElementById(
                "adminUsersTableBody"
            );


        if (!tableBody) {
            return;
        }


        tableBody.innerHTML = "";


        users.forEach(
            user => {

                const row =
                    document.createElement(
                        "tr"
                    );


                row.innerHTML = `

                    <td>
                        ${user.id}
                    </td>

                    <td>
                        ${user.username}
                    </td>

                    <td>
                        ${user.email}
                    </td>

                    <td>

                        <span class="role-badge ${String(user.role).toLowerCase()}">
                            ${user.role}
                        </span>

                    </td>

                    <td>

                        ${
                    user.emailVerified
                        ? `
                                    <span class="status-badge verified">
                                        ✓ VERIFIED
                                    </span>
                                  `
                        : `
                                    <span class="status-badge unverified">
                                        ✕ UNVERIFIED
                                    </span>
                                  `
                }

                    </td>

                    <td>

                        ${
                    user.role === "USER"
                        ? `
                                    <button
                                        onclick="changeUserRole(${user.id}, 'ADMIN')">
                                        Make Admin
                                    </button>
                                  `
                        : `
                                    <button
                                        onclick="changeUserRole(${user.id}, 'USER')">
                                        Make User
                                    </button>
                                  `
                }

                        ${
                    user.role === "USER"
                        ? `
                                    <button
                                        onclick="deleteUser(${user.id})">
                                        Delete
                                    </button>
                                  `
                        : ""
                }

                    </td>
                `;


                tableBody.appendChild(
                    row
                );
            }
        );


    } catch (error) {

        console.error(
            "Admin users error:",
            error
        );
    }
}


// ======================================================
// CHANGE USER ROLE
// ======================================================

async function changeUserRole(
    userId,
    newRole
) {

    const confirmed =
        confirm(
            `Change this user's role to ${newRole}?`
        );


    if (!confirmed) {
        return;
    }


    try {

        const response =
            await authenticatedFetch(
                `${API_URL}/admin/users/${userId}/role?role=${newRole}`,
                {
                    method: "PUT"
                }
            );


        const data =
            await response.json();


        if (response.ok) {

            alert(
                data.message ||
                "Role updated successfully."
            );


            await loadAdminUsers();
            await loadAdminStats();


        } else {

            alert(
                data.message ||
                "Unable to change user role."
            );
        }


    } catch (error) {

        console.error(
            "Change role error:",
            error
        );


        alert(
            "Unable to connect to backend."
        );
    }
}


// ======================================================
// DELETE USER
// ======================================================

async function deleteUser(
    userId
) {

    const confirmed =
        confirm(
            "Are you sure you want to delete this user?"
        );


    if (!confirmed) {
        return;
    }


    try {

        const response =
            await authenticatedFetch(
                `${API_URL}/admin/users/${userId}`,
                {
                    method: "DELETE"
                }
            );


        const data =
            await response.json();


        if (response.ok) {

            alert(
                data.message ||
                "User deleted successfully."
            );


            await loadAdminUsers();
            await loadAdminStats();


        } else {

            alert(
                data.message ||
                "Unable to delete user."
            );
        }


    } catch (error) {

        console.error(
            "Delete user error:",
            error
        );


        alert(
            "Unable to connect to backend."
        );
    }
}


// ======================================================
// TEST ADMIN ACCESS
// ======================================================

async function testAdminAccess() {

    const result =
        document.getElementById(
            "adminTestResult"
        );


    if (!result) {
        return;
    }


    result.textContent =
        "Checking admin authorization...";


    try {

        const response =
            await authenticatedFetch(
                `${API_URL}/admin/test`
            );


        const data =
            await response.text();


        if (response.ok) {

            result.textContent =
                "✅ Admin authorization successful: " +
                data;

        } else {

            result.textContent =
                "❌ Admin authorization failed. Status: " +
                response.status;
        }


    } catch (error) {

        console.error(
            "Admin test error:",
            error
        );


        result.textContent =
            "Unable to connect to backend.";
    }
}


// ======================================================
// LOGOUT
// ======================================================

function logout() {

    localStorage.removeItem(
        "minicacheToken"
    );

    localStorage.removeItem(
        "minicacheRefreshToken"
    );

    localStorage.removeItem(
        "minicacheUsername"
    );

    localStorage.removeItem(
        "minicacheRole"
    );


    window.location.href =
        "login.html";
}


// ======================================================
// SIDEBAR NAVIGATION
// ======================================================

function initializeSidebarNavigation() {

    const navItems =
        document.querySelectorAll(
            ".sidebar-nav .nav-item[href^='#']"
        );


    const sections =
        document.querySelectorAll(
            ".dashboard-section"
        );


    if (
        !navItems.length ||
        !sections.length
    ) {
        return;
    }


    navItems.forEach(
        item => {

            item.addEventListener(
                "click",
                () => {

                    navItems.forEach(
                        nav =>
                            nav.classList.remove(
                                "active"
                            )
                    );


                    item.classList.add(
                        "active"
                    );
                }
            );
        }
    );


    const observer =
        new IntersectionObserver(
            entries => {

                entries.forEach(
                    entry => {

                        if (
                            !entry.isIntersecting
                        ) {
                            return;
                        }


                        const sectionId =
                            entry.target.id;


                        navItems.forEach(
                            nav => {

                                if (
                                    nav.getAttribute(
                                        "href"
                                    ) ===
                                    `#${sectionId}`
                                ) {

                                    navItems.forEach(
                                        item =>
                                            item.classList.remove(
                                                "active"
                                            )
                                    );


                                    nav.classList.add(
                                        "active"
                                    );
                                }
                            }
                        );
                    }
                );
            },
            {
                root: null,

                rootMargin:
                    "-20% 0px -65% 0px",

                threshold: 0
            }
        );


    sections.forEach(
        section =>
            observer.observe(
                section
            )
    );
}


// ======================================================
// DASHBOARD INITIALIZATION
// ======================================================

document.addEventListener(
    "DOMContentLoaded",
    async () => {

        console.log(
            "MiniCache Dashboard JavaScript loaded."
        );


        const token =
            getToken();


        // No login -> login page

        if (!token) {

            window.location.href =
                "login.html";

            return;
        }


        // User information


// User information

        displayUserRole();

        const dashboardSection =
            document.getElementById(
                "dashboardSection"
            );

        if (dashboardSection) {
            dashboardSection.style.display = "flex";
        }

        showAdminPanel();

        // Chart

        initializeMetricsChart();


        // Dashboard data

        await loadStatistics();

        await loadEntries();

        await loadActivity();

        await loadLRUOrder();

        await checkBackendStatus();

        await checkCacheHealth();

        await showPersistenceStatus();


        // Sidebar

        initializeSidebarNavigation();


        console.log(
            "MiniCache Dashboard initialized successfully."
        );


        // ==================================================
        // AUTO REFRESH
        // ==================================================

        setInterval(
            async () => {

                if (!getToken()) {
                    return;
                }


                await loadStatistics();

                await loadEntries();

                await loadActivity();

                await showPersistenceStatus();


                if (
                    localStorage.getItem(
                        "minicacheRole"
                    ) === "ADMIN"
                ) {

                    await loadAdminStats();

                    await loadAdminUsers();
                }

            },
            2000
        );


        // ==================================================
        // BACKEND / HEALTH REFRESH
        // ==================================================

        setInterval(
            async () => {

                if (!getToken()) {
                    return;
                }


                await checkBackendStatus();

                await checkCacheHealth();

            },
            10000
        );
    }
);