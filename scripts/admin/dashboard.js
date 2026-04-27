const DASHBOARD_API_BASE_URL = "http://127.0.0.1:8000";
const filterForm = document.querySelector("#dashboard-filter-form");
const districtFilter = document.querySelector("#district-filter");
const statsMessage = document.querySelector("#dashboard-stats-message");
const violationsTableBody = document.querySelector("#violations-table-body");
const districtsTableBody = document.querySelector("#districts-table-body");
const detachmentsTableBody = document.querySelector("#detachments-table-body");
const dashboardNoticesBody = document.querySelector("#dashboard-notices-body");

const dashboardStats = {
    total: document.querySelector("#stat-total"),
    active: document.querySelector("#stat-active"),
    month: document.querySelector("#stat-month"),
    drivers: document.querySelector("#stat-drivers"),
    officerMonth: document.querySelector("#stat-officer-month")
};

function setStatsMessage(message) {
    if (!statsMessage) {
        return;
    }

    statsMessage.textContent = message;
}

function getDashboardAdminSession() {
    const stored = localStorage.getItem("admin_session");

    if (!stored) {
        return null;
    }

    try {
        return JSON.parse(stored);
    } catch {
        localStorage.removeItem("admin_session");
        return null;
    }
}

function appendCell(row, value) {
    const cell = document.createElement("td");
    cell.textContent = value ?? "";
    row.appendChild(cell);
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

function renderCountRows(tableBody, rows, emptyLabel) {
    tableBody.replaceChildren();

    if (!rows || rows.length === 0) {
        const row = document.createElement("tr");
        appendCell(row, emptyLabel);
        appendCell(row, "0");
        tableBody.appendChild(row);
        return;
    }

    rows.forEach((item) => {
        const row = document.createElement("tr");
        appendCell(row, item.label);
        appendCell(row, item.count);
        tableBody.appendChild(row);
    });
}

function renderDistrictOptions(districtCounts) {
    const selectedDistrict = districtFilter.value;
    districtFilter.replaceChildren();

    const allOption = document.createElement("option");
    allOption.value = "";
    allOption.textContent = "all districts";
    districtFilter.appendChild(allOption);

    districtCounts.forEach((item) => {
        const option = document.createElement("option");
        option.value = item.label;
        option.textContent = item.label;
        districtFilter.appendChild(option);
    });

    districtFilter.value = selectedDistrict;
}

function renderNoticeRows(notices) {
    dashboardNoticesBody.replaceChildren();

    if (!notices || notices.length === 0) {
        const row = document.createElement("tr");
        appendCell(row, "no notices found");
        appendCell(row, "");
        appendCell(row, "");
        appendCell(row, "");
        appendCell(row, "");
        appendCell(row, "");
        appendCell(row, "");
        dashboardNoticesBody.appendChild(row);
        return;
    }

    notices.forEach((notice) => {
        const row = document.createElement("tr");
        appendCell(row, notice.notice_id);
        appendCell(row, formatDateTime(notice.violation_date_time));
        appendCell(row, notice.detachment);
        appendCell(row, notice.district);
        appendCell(row, notice.violation_severity);
        appendCell(row, notice.notice_status);
        appendCell(row, notice.violation_description);
        dashboardNoticesBody.appendChild(row);
    });
}

function renderDashboard(payload) {
    dashboardStats.total.textContent = payload.overview.total_citations;
    dashboardStats.active.textContent = payload.overview.active_citations;
    dashboardStats.month.textContent = payload.overview.citations_this_month;
    dashboardStats.drivers.textContent = payload.overview.total_drivers;
    dashboardStats.officerMonth.textContent = payload.overview.officer_notices_past_month;

    renderDistrictOptions(payload.district_counts);
    renderCountRows(violationsTableBody, payload.violation_counts, "no violations");
    renderCountRows(districtsTableBody, payload.district_counts, "no districts");
    renderCountRows(detachmentsTableBody, payload.detachment_counts, "no detachment notices");
    renderNoticeRows(payload.notices);
}

async function loadDashboardStats() {
    const session = getDashboardAdminSession();

    if (!session || !session.accessToken) {
        window.location.href = "login.html";
        return;
    }

    const formData = new FormData(filterForm);
    const params = new URLSearchParams();

    if (formData.get("district")) {
        params.set("district", formData.get("district"));
    }

    params.set("sort_order", formData.get("sort_order") || "desc");
    setStatsMessage("Loading dashboard statistics...");

    try {
        const response = await fetch(`${DASHBOARD_API_BASE_URL}/notices/admin/dashboard?${params.toString()}`, {
            headers: {
                "Authorization": `Bearer ${session.accessToken}`
            }
        });

        const payload = await response.json().catch(() => ({}));

        if (!response.ok) {
            throw new Error(payload.detail || "Could not load dashboard statistics");
        }

        renderDashboard(payload);
        setStatsMessage("");
    } catch (error) {
        setStatsMessage(error.message);
    }
}

if (filterForm) {
    filterForm.addEventListener("submit", (event) => {
        event.preventDefault();
        loadDashboardStats();
    });

    loadDashboardStats();
}
