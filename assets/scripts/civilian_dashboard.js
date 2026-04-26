const API_BASE_URL = "http://127.0.0.1:8000";
const noticesBody = document.querySelector("#civilian-notices-body");
const dashboardMessage = document.querySelector("#dashboard-message");

function setDashboardMessage(message, isError = false) {
    if (!dashboardMessage) {
        return;
    }

    dashboardMessage.textContent = message;
    dashboardMessage.style.color = isError ? "crimson" : "inherit";
}

function formatDate(value) {
    if (!value) {
        return "";
    }

    return new Intl.DateTimeFormat("en-GB").format(new Date(value));
}

function formatDateTime(value) {
    if (!value) {
        return "";
    }

    return new Intl.DateTimeFormat("en-GB", {
        dateStyle: "short",
        timeStyle: "short"
    }).format(new Date(value));
}

function appendCell(row, value) {
    const cell = document.createElement("td");
    cell.textContent = value ?? "";
    row.appendChild(cell);
}

function renderNotices(notices) {
    noticesBody.replaceChildren();

    if (notices.length === 0) {
        setDashboardMessage("No notices found.");
        return;
    }

    setDashboardMessage("");

    notices.forEach((notice) => {
        const row = document.createElement("tr");

        appendCell(row, notice.notice_id);
        appendCell(row, notice.car);
        appendCell(row, notice.address);
        appendCell(row, formatDateTime(notice.violation_date_time));
        appendCell(row, notice.violation_severity);
        appendCell(row, notice.notice_status);
        appendCell(row, notice.notification_sent ? "true" : "false");
        appendCell(row, formatDate(notice.entry_date));
        appendCell(row, formatDate(notice.expiry_date));
        appendCell(row, notice.violation_description);

        noticesBody.appendChild(row);
    });
}

async function loadCivilianNotices() {
    const token = localStorage.getItem("civilian_access_token");
    const driverId = localStorage.getItem("civilian_driver_id");

    if (!token || !driverId) {
        window.location.href = "civ_login.html";
        return;
    }

    setDashboardMessage("Loading notices...");

    try {
        const response = await fetch(`${API_BASE_URL}/notices/${driverId}`, {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        const payload = await response.json().catch(() => ({}));

        if (!response.ok) {
            throw new Error(payload.detail || "Could not load notices");
        }

        renderNotices(payload);
    } catch (error) {
        noticesBody.replaceChildren();
        setDashboardMessage(error.message, true);
    }
}

if (noticesBody) {
    loadCivilianNotices();
}
