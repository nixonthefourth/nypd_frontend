const CITATIONS_API_BASE_URL = "http://127.0.0.1:8000";
const citationsTableBody = document.querySelector("#citations-table-body");
const citationMessage = document.querySelector("#citation-message");
const createModal = document.querySelector("#create-citation-modal");
const viewModal = document.querySelector("#view-citation-modal");
const editModal = document.querySelector("#edit-citation-modal");
const deleteModal = document.querySelector("#delete-citation-modal");
const createForm = document.querySelector("#create-citation-form");
const editForm = document.querySelector("#edit-citation-form");
const deleteNoticeId = document.querySelector("#delete-notice-id");

let citations = [];
let selectedNoticeId = null;

function setCitationMessage(message) {
    citationMessage.textContent = message;
}

function getAdminToken() {
    const stored = localStorage.getItem("admin_session");

    if (!stored) {
        return null;
    }

    try {
        const session = JSON.parse(stored);
        return session.accessToken;
    } catch {
        localStorage.removeItem("admin_session");
        return null;
    }
}

function openModal(modal) {
    modal.hidden = false;
}

function closeModal(modal) {
    modal.hidden = true;
}

function appendCell(row, value) {
    const cell = document.createElement("td");
    cell.textContent = value ?? "";
    row.appendChild(cell);
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

function toDateInput(value) {
    if (!value) {
        return "";
    }

    return String(value).slice(0, 10);
}

function toDateTimeInput(value) {
    if (!value) {
        return "";
    }

    return String(value).slice(0, 16);
}

function findCitation(noticeId) {
    return citations.find((citation) => citation.notice_id === noticeId);
}

async function requestJson(path, options = {}) {
    const token = getAdminToken();

    if (!token) {
        window.location.href = "admin_login.html";
        return null;
    }

    const response = await fetch(`${CITATIONS_API_BASE_URL}${path}`, {
        ...options,
        headers: {
            "Authorization": `Bearer ${token}`,
            ...(options.headers || {})
        }
    });

    const payload = await response.json().catch(() => ({}));

    if (!response.ok) {
        throw new Error(payload.detail || "Request failed");
    }

    return payload;
}

function formToNoticePayload(form) {
    const data = Object.fromEntries(new FormData(form).entries());

    return {
        notice_id: data.notice_id,
        car_id: Number(data.car_id),
        violation_date_time: data.violation_date_time,
        detachment: data.detachment,
        violation_severity: data.violation_severity,
        notice_status: data.notice_status,
        notification_sent: form.elements.notification_sent.checked,
        entry_date: data.entry_date,
        expiry_date: data.expiry_date,
        violation_description: data.violation_description,
        violation_zip: {
            zip_code: data.zip_code,
            state: data.state,
            city: data.city,
            district: data.district
        },
        violation_address: {
            street: data.street
        }
    };
}

function renderCitations() {
    citationsTableBody.replaceChildren();

    if (citations.length === 0) {
        const row = document.createElement("tr");
        appendCell(row, "no citations found");
        appendCell(row, "");
        appendCell(row, "");
        appendCell(row, "");
        appendCell(row, "");
        appendCell(row, "");
        appendCell(row, "");
        appendCell(row, "");
        appendCell(row, "");
        appendCell(row, "");
        citationsTableBody.appendChild(row);
        return;
    }

    citations.forEach((citation) => {
        const row = document.createElement("tr");
        appendCell(row, citation.notice_id);
        appendCell(row, citation.driver);
        appendCell(row, citation.car);
        appendCell(row, citation.address);
        appendCell(row, formatDateTime(citation.violation_date_time));
        appendCell(row, citation.violation_description);
        appendCell(row, citation.violation_severity);
        appendCell(row, citation.notice_status);
        appendCell(row, citation.officer || citation.badge_number || "");

        const actionsCell = document.createElement("td");

        const viewButton = document.createElement("button");
        viewButton.type = "button";
        viewButton.textContent = "VIEW";
        viewButton.addEventListener("click", () => showCitation(citation.notice_id));
        actionsCell.appendChild(viewButton);

        const editButton = document.createElement("button");
        editButton.type = "button";
        editButton.textContent = "EDIT";
        editButton.addEventListener("click", () => editCitation(citation.notice_id));
        actionsCell.appendChild(editButton);

        const deleteButton = document.createElement("button");
        deleteButton.type = "button";
        deleteButton.textContent = "DELETE";
        deleteButton.addEventListener("click", () => confirmDeleteCitation(citation.notice_id));
        actionsCell.appendChild(deleteButton);

        row.appendChild(actionsCell);
        citationsTableBody.appendChild(row);
    });
}

function showCitation(noticeId) {
    const citation = findCitation(noticeId);

    if (!citation) {
        return;
    }

    document.querySelector("#v-notice-id").value = citation.notice_id;
    document.querySelector("#v-driver").value = citation.driver;
    document.querySelector("#v-licence-number").value = citation.licence_number;
    document.querySelector("#v-car").value = citation.car;
    document.querySelector("#v-vin").value = citation.vin;
    document.querySelector("#v-licence-plate").value = citation.licence_plate;
    document.querySelector("#v-description").value = citation.violation_description;
    document.querySelector("#v-severity").value = citation.violation_severity;
    document.querySelector("#v-status").value = citation.notice_status;
    document.querySelector("#v-date").value = formatDateTime(citation.violation_date_time);
    document.querySelector("#v-address").value = citation.address;
    document.querySelector("#v-district").value = citation.district;
    document.querySelector("#v-officer").value = citation.officer || citation.badge_number || "";
    document.querySelector("#v-entry-date").value = formatDate(citation.entry_date);
    document.querySelector("#v-expiry-date").value = formatDate(citation.expiry_date);

    openModal(viewModal);
}

function editCitation(noticeId) {
    const citation = findCitation(noticeId);

    if (!citation) {
        return;
    }

    selectedNoticeId = noticeId;
    editForm.elements.notice_id.value = citation.notice_id;
    editForm.elements.car_id.value = citation.car_id;
    editForm.elements.violation_date_time.value = toDateTimeInput(citation.violation_date_time);
    editForm.elements.detachment.value = citation.detachment;
    editForm.elements.violation_severity.value = citation.violation_severity;
    editForm.elements.notice_status.value = citation.notice_status;
    editForm.elements.notification_sent.checked = Boolean(citation.notification_sent);
    editForm.elements.entry_date.value = toDateInput(citation.entry_date);
    editForm.elements.expiry_date.value = toDateInput(citation.expiry_date);
    editForm.elements.violation_description.value = citation.violation_description;
    editForm.elements.street.value = citation.street || "";
    editForm.elements.city.value = citation.city || "";
    editForm.elements.state.value = citation.state || "";
    editForm.elements.district.value = citation.district;
    editForm.elements.zip_code.value = citation.zip_code || "";

    openModal(editModal);
}

function confirmDeleteCitation(noticeId) {
    selectedNoticeId = noticeId;
    deleteNoticeId.textContent = noticeId;
    openModal(deleteModal);
}

async function loadCitations() {
    setCitationMessage("Loading citations...");

    try {
        citations = await requestJson("/notices/admin");

        if (!citations) {
            return;
        }

        renderCitations();
        setCitationMessage("");
    } catch (error) {
        setCitationMessage(error.message);
    }
}

async function createCitation(event) {
    event.preventDefault();

    try {
        await requestJson("/notices", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(formToNoticePayload(createForm))
        });

        createForm.reset();
        closeModal(createModal);
        await loadCitations();
        setCitationMessage("Citation created.");
    } catch (error) {
        setCitationMessage(error.message);
    }
}

async function updateCitation(event) {
    event.preventDefault();

    try {
        await requestJson(`/notices/${selectedNoticeId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(formToNoticePayload(editForm))
        });

        closeModal(editModal);
        await loadCitations();
        setCitationMessage("Citation updated.");
    } catch (error) {
        setCitationMessage(error.message);
    }
}

async function deleteCitation() {
    if (!selectedNoticeId) {
        return;
    }

    try {
        await requestJson(`/notices/${selectedNoticeId}`, {
            method: "DELETE"
        });

        closeModal(deleteModal);
        selectedNoticeId = null;
        await loadCitations();
        setCitationMessage("Citation deleted.");
    } catch (error) {
        setCitationMessage(error.message);
    }
}

document.querySelector("#open-create-citation-modal").addEventListener("click", () => openModal(createModal));
document.querySelector("#close-create-citation-modal").addEventListener("click", () => closeModal(createModal));
document.querySelector("#close-view-citation-modal").addEventListener("click", () => closeModal(viewModal));
document.querySelector("#close-edit-citation-modal").addEventListener("click", () => closeModal(editModal));
document.querySelector("#close-delete-citation-modal").addEventListener("click", () => closeModal(deleteModal));
document.querySelector("#confirm-delete-citation").addEventListener("click", deleteCitation);
createForm.addEventListener("submit", createCitation);
editForm.addEventListener("submit", updateCitation);

loadCitations();
