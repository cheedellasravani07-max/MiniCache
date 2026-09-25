const API_URL = "https://minicache-api.onrender.com";


// ======================================================
// AUTHENTICATION
// ======================================================

function getAuthHeaders() {

    const token = localStorage.getItem("minicacheToken");

    return {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + token
    };
}


// ======================================================
// REFRESH ACCESS TOKEN
// ======================================================

async function refreshAccessToken() {

    const refreshToken =
        localStorage.getItem("minicacheRefreshToken");

    if (!refreshToken) {
        console.log("No refresh token available.");
        return false;
    }

    try {

        const response = await fetch(
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

            console.error(
                "Refresh request failed:",
                response.status
            );

            return false;
        }

        const data = await response.json();

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

            console.log(
                "Access token refreshed successfully."
            );

            return true;
        }

        return false;

    } catch (error) {

        console.error(
            "Token refresh failed:",
            error
        );

        return false;
    }
}


// ======================================================
// LOGOUT / SESSION EXPIRED
// ======================================================

function showLoginPage(messageText = "") {

    localStorage.removeItem("minicacheToken");
    localStorage.removeItem("minicacheRefreshToken");
    localStorage.removeItem("minicacheUsername");

    const dashboard =
        document.getElementById("dashboardSection");

    const loginSection =
        document.getElementById("loginSection");

    const message =
        document.getElementById("loginMessage");

    if (dashboard) {
        dashboard.style.display = "none";
    }

    if (loginSection) {
        loginSection.style.display = "block";
    }

    if (message) {
        message.textContent = messageText;
    }
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
        localStorage.getItem("minicacheToken");

    options.headers = {
        "Content-Type": "application/json",
        ...(options.headers || {})
    };

    if (token) {

        options.headers["Authorization"] =
            "Bearer " + token;
    }

    let response;

    try {

        response = await fetch(url, options);

    } catch (error) {

        console.error(
            "Network error:",
            error
        );

        throw error;
    }


    // --------------------------------------------------
    // TOKEN EXPIRED
    // --------------------------------------------------

    if (
        (response.status === 401 ||
            response.status === 403) &&
        retry
    ) {

        console.log(
            "Access token expired/invalid. Refreshing..."
        );

        const refreshed =
            await refreshAccessToken();

        if (refreshed) {

            console.log(
                "Retrying original request..."
            );

            const newToken =
                localStorage.getItem("minicacheToken");

            options.headers = {
                "Content-Type": "application/json",
                ...(options.headers || {}),
                "Authorization":
                    "Bearer " + newToken
            };

            return authenticatedFetch(
                url,
                options,
                false
            );
        }

        console.log(
            "Refresh token failed. Login required."
        );

        showLoginPage(
            "Session expired. Please login again."
        );
    }

    return response;
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
        document.getElementById("cacheActivity");

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


// ======================================================
// BACKEND STATUS
// ======================================================

async function checkBackendStatus() {

    const statusElement =
        document.getElementById("backendStatus");

    if (!statusElement) {
        return;
    }

    try {

        const response =
            await authenticatedFetch(
                `${API_URL}/cache/stats`
            );

        if (response.ok) {

            statusElement.textContent =
                "🟢 Online";

            statusElement.style.color =
                "green";

        } else {

            statusElement.textContent =
                "🔴 Offline";

            statusElement.style.color =
                "red";
        }

    } catch (error) {

        statusElement.textContent =
            "🔴 Offline";

        statusElement.style.color =
            "red";

        console.error(
            "Backend status check failed:",
            error
        );
    }
}


// ======================================================
// SET / UPDATE CACHE
// ======================================================

async function setCache() {

    const key =
        document.getElementById("key").value.trim();

    const value =
        document.getElementById("value").value;

    const ttl =
        document.getElementById("ttl").value;

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
                    body: JSON.stringify(data)
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

        console.error(error);
    }
}


// ======================================================
// GET CACHE
// ======================================================

async function getCache() {

    const key =
        document.getElementById("getKey").value.trim();

    const resultElement =
        document.getElementById("getResult");

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

        console.error(error);
    }
}


// ======================================================
// DELETE CACHE ENTRY
// ======================================================

async function deleteCache() {

    const key =
        document.getElementById("deleteKey").value.trim();

    const resultElement =
        document.getElementById("deleteResult");

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

        console.error(error);
    }
}


// ======================================================
// CLEAR ENTIRE CACHE
// ======================================================

async function clearCache() {

    const resultElement =
        document.getElementById("clearResult");

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

        await loadStatistics();
        await loadEntries();
        await loadLRUOrder();

    } catch (error) {

        resultElement.textContent =
            "Unable to connect to backend.";

        console.error(error);
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


        // Basic statistics

        const cacheSize =
            document.getElementById("cacheSize");

        const capacity =
            document.getElementById("capacity");

        const hits =
            document.getElementById("hits");

        const misses =
            document.getElementById("misses");

        const hitRate =
            document.getElementById("hitRate");

        const evictions =
            document.getElementById("evictions");


        if (cacheSize)
            cacheSize.textContent =
                statistics.size;

        if (capacity)
            capacity.textContent =
                statistics.capacity;

        if (hits)
            hits.textContent =
                statistics.hits;

        if (misses)
            misses.textContent =
                statistics.misses;

        if (hitRate)
            hitRate.textContent =
                Number(statistics.hitRate || 0)
                    .toFixed(2) + "%";

        if (evictions)
            evictions.textContent =
                statistics.evictions;


        // Performance

        const totalRequests =
            statistics.hits +
            statistics.misses;

        const missRate =
            totalRequests === 0
                ? 0
                : (
                    statistics.misses *
                    100 /
                    totalRequests
                );

        const cacheUsage =
            statistics.capacity === 0
                ? 0
                : (
                    statistics.size *
                    100 /
                    statistics.capacity
                );


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
                Number(statistics.hitRate || 0)
                    .toFixed(2) + "%";

        if (missRateElement)
            missRateElement.textContent =
                missRate.toFixed(2) + "%";

        if (cacheUsageElement)
            cacheUsageElement.textContent =
                cacheUsage.toFixed(2) + "%";

        if (performanceEvictions)
            performanceEvictions.textContent =
                statistics.evictions;


        // Performance message

        const performanceMessage =
            document.getElementById(
                "performanceMessage"
            );

        if (performanceMessage) {

            if (totalRequests === 0) {

                performanceMessage.textContent =
                    "Waiting for cache activity...";

            } else if (
                statistics.hitRate >= 80
            ) {

                performanceMessage.textContent =
                    "Cache is serving requests efficiently.";

            } else if (
                statistics.hitRate >= 50
            ) {

                performanceMessage.textContent =
                    "Cache performance is moderate.";

            } else {

                performanceMessage.textContent =
                    "Cache has a high miss rate.";
            }
        }


        // Cache health

        const healthElement =
            document.getElementById(
                "cacheHealth"
            );

        if (healthElement) {

            if (totalRequests === 0) {

                healthElement.textContent =
                    "⚪ No Activity";

            } else if (
                statistics.hitRate >= 80
            ) {

                healthElement.textContent =
                    "🟢 Healthy";

            } else if (
                statistics.hitRate >= 50
            ) {

                healthElement.textContent =
                    "🟡 Moderate";

            } else {

                healthElement.textContent =
                    "🔴 High Miss Rate";
            }
        }


        // Last updated

        const lastUpdated =
            document.getElementById(
                "lastUpdated"
            );

        if (lastUpdated) {

            lastUpdated.textContent =
                new Date()
                    .toLocaleTimeString();
        }


        // Chart

        updateMetricsChart(
            Number(statistics.hitRate || 0),
            cacheUsage
        );

    } catch (error) {

        console.error(
            "Unable to load statistics:",
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

        for (const key in entries) {

            const row =
                document.createElement("tr");

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

        activities.forEach(activity => {

            const row =
                document.createElement("tr");

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


        // Add 100 entries

        for (
            let i = 1;
            i <= 100;
            i++
        ) {

            await authenticatedFetch(
                `${API_URL}/cache/key/demo-${i}`,
                {
                    method: "POST",
                    body: JSON.stringify({
                        value:
                            `Demo Value ${i}`
                    })
                }
            );
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
                body: JSON.stringify({
                    value:
                        "Demo Value 101"
                })
            }
        );


        // Get statistics

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
        "ttl-demo-" + Date.now();


    try {

        resultElement.textContent =
            `Creating cache entry with TTL of ${ttl} ms...`;


        // Create entry

        const setResponse =
            await authenticatedFetch(
                `${API_URL}/cache/key/${encodeURIComponent(demoKey)}`,
                {
                    method: "POST",
                    body: JSON.stringify({
                        value:
                            "TTL Demo Value",
                        ttl: ttl
                    })
                }
            );


        if (!setResponse.ok) {

            throw new Error(
                "Failed to create TTL demo entry."
            );
        }


        // Verify entry

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


        // Wait

        await new Promise(
            resolve =>
                setTimeout(
                    resolve,
                    ttl + 500
                )
        );


        // Check again

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
        console.log(
            "metricsChart canvas not found."
        );
        return;
    }

    if (
        typeof Chart ===
        "undefined"
    ) {

        console.error(
            "Chart.js is not loaded."
        );

        return;
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

    const now =
        new Date()
            .toLocaleTimeString();

    metricsLabels.push(now);

    hitRateData.push(hitRate);

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


    metricsChart.update();
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

    activityTable.innerHTML = `
        <tr>
            <td colspan="4">
                No activity yet
            </td>
        </tr>
    `;

    activityLog = [];
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

        const response =
            await authenticatedFetch(
                `${API_URL}/cache/lru`
            );

        if (!response.ok) {
            return;
        }

        const lruKeys =
            await response.json();


        if (
            !Array.isArray(lruKeys) ||
            lruKeys.length === 0
        ) {

            lruElement.textContent =
                "Cache is empty.";

            return;
        }


        lruElement.innerHTML =
            lruKeys
                .map(
                    (key, index) => {

                        const label =
                            index === 0
                                ? "🟢 MRU"
                                : index ===
                                lruKeys.length - 1
                                    ? "🔴 LRU"
                                    : "";

                        return `
                            <div class="lru-item">
                                <span>${label}</span>
                                <strong>${key}</strong>
                            </div>
                        `;
                    }
                )
                .join("");

    } catch (error) {

        console.error(
            "Unable to load LRU order:",
            error
        );

        lruElement.textContent =
            "Unable to load LRU order.";
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

        if (data === "UP") {

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

    const input =
        document.getElementById(
            "bulkEntries"
        ).value;

    const resultElement =
        document.getElementById(
            "bulkResult"
        );

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
                    body: JSON.stringify(entries)
                }
            );


        const result =
            await response.text();


        if (response.ok) {

            resultElement.textContent =
                result;

        } else {

            resultElement.textContent =
                "Bulk operation failed: " +
                result;
        }


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
            "Concurrency benchmark error:",
            error
        );
    }
}


// ======================================================
// LOGIN
// ======================================================

async function login() {

    const usernameElement =
        document.getElementById(
            "username"
        );

    const passwordElement =
        document.getElementById(
            "password"
        );

    const message =
        document.getElementById(
            "loginMessage"
        );


    const username =
        usernameElement.value.trim();

    const password =
        passwordElement.value;


    if (!username || !password) {

        message.textContent =
            "Please enter username and password.";

        return;
    }


    message.textContent =
        "Signing in...";


    try {

        const response =
            await fetch(
                `${API_URL}/auth/login`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify({
                            username:
                            username,

                            password:
                            password
                        })
                }
            );


        const data =
            await response.json();


        console.log(
            "Login response:",
            data
        );


        if (
            response.ok &&
            data.success &&
            data.token
        ) {

            // ------------------------------------------
            // SAVE ACCESS TOKEN
            // ------------------------------------------

            localStorage.setItem(
                "minicacheToken",
                data.token
            );


            // ------------------------------------------
            // SAVE REFRESH TOKEN
            // ------------------------------------------

            if (data.refreshToken) {

                localStorage.setItem(
                    "minicacheRefreshToken",
                    data.refreshToken
                );
            }


            // ------------------------------------------
            // SAVE USERNAME
            // ------------------------------------------

            localStorage.setItem(
                "minicacheUsername",
                data.username ||
                username
            );


            // ------------------------------------------
            // HIDE LOGIN
            // ------------------------------------------

            const loginSection =
                document.getElementById(
                    "loginSection"
                );

            const dashboardSection =
                document.getElementById(
                    "dashboardSection"
                );


            if (loginSection) {

                loginSection.style.display =
                    "none";
            }


            if (dashboardSection) {

                dashboardSection.style.display =
                    "block";
            }


            message.textContent = "";


            // ------------------------------------------
            // INITIALIZE CHART
            // ------------------------------------------

            initializeMetricsChart();


            // ------------------------------------------
            // LOAD DASHBOARD
            // ------------------------------------------

            await loadStatistics();

            await loadEntries();

            await loadActivity();

            await loadLRUOrder();

            await checkBackendStatus();

            await checkCacheHealth();


            console.log(
                "Login successful. Dashboard loaded."
            );


        } else {

            message.textContent =
                data.message ||
                "Login failed.";

            console.error(
                "Login failed:",
                data
            );
        }


    } catch (error) {

        console.error(
            "Login error:",
            error
        );

        message.textContent =
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


    const dashboard =
        document.getElementById(
            "dashboardSection"
        );

    const loginSection =
        document.getElementById(
            "loginSection"
        );


    if (dashboard) {

        dashboard.style.display =
            "none";
    }


    if (loginSection) {

        loginSection.style.display =
            "block";
    }


    const username =
        document.getElementById(
            "username"
        );

    const password =
        document.getElementById(
            "password"
        );

    const message =
        document.getElementById(
            "loginMessage"
        );


    if (username)
        username.value = "";

    if (password)
        password.value = "";

    if (message)
        message.textContent = "";


    console.log(
        "User logged out successfully."
    );
}


// ======================================================
// PAGE INITIALIZATION
// ======================================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        console.log(
            "MiniCache JavaScript loaded successfully."
        );


        // Initialize chart if dashboard
        // is already visible

        const dashboard =
            document.getElementById(
                "dashboardSection"
            );

        if (
            dashboard &&
            dashboard.style.display !== "none"
        ) {

            initializeMetricsChart();
        }


        // ------------------------------------------------
        // Check existing login
        // ------------------------------------------------

        const token =
            localStorage.getItem(
                "minicacheToken"
            );

        if (token) {

            const loginSection =
                document.getElementById(
                    "loginSection"
                );

            const dashboardSection =
                document.getElementById(
                    "dashboardSection"
                );


            if (loginSection) {

                loginSection.style.display =
                    "none";
            }


            if (dashboardSection) {

                dashboardSection.style.display =
                    "block";
            }


            initializeMetricsChart();

            loadStatistics();
            loadEntries();
            loadActivity();
            loadLRUOrder();
            checkBackendStatus();
            checkCacheHealth();
        }


        // ------------------------------------------------
        // Automatic refresh
        // ------------------------------------------------

        setInterval(
            () => {

                if (
                    localStorage.getItem(
                        "minicacheToken"
                    )
                ) {

                    loadStatistics();
                    loadEntries();
                    loadActivity();
                    loadLRUOrder();
                }

            },
            2000
        );


        setInterval(
            () => {

                if (
                    localStorage.getItem(
                        "minicacheToken"
                    )
                ) {

                    checkBackendStatus();
                    checkCacheHealth();
                }

            },
            10000
        );
    }
);
// =========================
// FORGOT PASSWORD UI
// =========================

document.getElementById("forgotPasswordLink").addEventListener("click", function (event) {
    event.preventDefault();

    document.getElementById("loginSection").style.display = "none";
    document.getElementById("forgotPasswordSection").style.display = "block";
});

document.getElementById("backToLogin").addEventListener("click", function (event) {
    event.preventDefault();

    document.getElementById("forgotPasswordSection").style.display = "none";
    document.getElementById("loginSection").style.display = "block";
});
// =========================
// FORGOT PASSWORD API
// =========================

async function requestPasswordReset() {

    const username =
        document.getElementById("forgotUsername").value.trim();

    const message =
        document.getElementById("forgotPasswordMessage");

    if (!username) {
        message.textContent = "Please enter your username.";
        return;
    }

    try {

        const response = await fetch(
            "https://minicache-api.onrender.com/auth/forgot-password",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    username: username
                })
            }
        );

        const data = await response.json();
        if (response.ok) {

            message.textContent =
                "Password reset request sent successfully.";

            console.log("Forgot password response:", data);

            document.getElementById("forgotPasswordSection").style.display = "none";

            document.getElementById("resetPasswordSection").style.display = "block";
        }
        else {

            message.textContent =
                data.message || "Password reset request failed.";
        }

    } catch (error) {

        console.error("Forgot password error:", error);

        message.textContent =
            "Unable to connect to the server.";
    }
}
// =========================
// RESET PASSWORD
// =========================

async function resetPassword() {

    const token =
        document.getElementById("resetToken").value.trim();

    const newPassword =
        document.getElementById("newPassword").value;

    const confirmPassword =
        document.getElementById("confirmPassword").value;

    const message =
        document.getElementById("resetPasswordMessage");

    // Validate token
    if (!token) {
        message.textContent = "Please enter the reset token.";
        return;
    }

    // Validate password
    if (!newPassword) {
        message.textContent = "Please enter a new password.";
        return;
    }
    if (newPassword.length < 8) {
        message.textContent =
            "Password must be at least 8 characters.";
        return;
    }
    // Confirm password
    if (newPassword !== confirmPassword) {
        message.textContent = "Passwords do not match.";
        return;
    }

    try {

        const response = await fetch(
            `${API_URL}/auth/reset-password`,
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    token: token,
                    newPassword: newPassword
                })
            }
        );

        const data = await response.json();

        console.log("Reset password response:", data);

        if (response.ok && data.success) {

            message.textContent =
                "Password reset successfully. You can now login.";

            // Clear fields
            document.getElementById("resetToken").value = "";
            document.getElementById("newPassword").value = "";
            document.getElementById("confirmPassword").value = "";

        } else {

            message.textContent =
                data.message || "Password reset failed.";
        }

    } catch (error) {

        console.error(
            "Reset password error:",
            error
        );

        message.textContent =
            "Unable to connect to the server.";
    }
}
// =========================
// RESET PASSWORD - BACK TO LOGIN
// =========================

document.getElementById("resetBackToLogin").addEventListener(
    "click",
    function (event) {

        event.preventDefault();

        document.getElementById("resetPasswordSection").style.display = "none";

        document.getElementById("loginSection").style.display = "block";

        document.getElementById("resetPasswordMessage").textContent = "";

        document.getElementById("resetToken").value = "";
        document.getElementById("newPassword").value = "";
        document.getElementById("confirmPassword").value = "";
    }
);

