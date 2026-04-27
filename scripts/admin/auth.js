const ADMIN_API_BASE_URL = "http://127.0.0.1:8000";
const adminLoginForm = document.querySelector("#admin-login-form");
const adminMessageBox = document.querySelector("#admin-auth-message");
const adminProfileFields = {
    username: document.querySelector("#admin-profile-username"),
    badgeNumber: document.querySelector("#admin-profile-badge"),
    firstName: document.querySelector("#admin-profile-first-name"),
    lastName: document.querySelector("#admin-profile-last-name")
};

function showAdminMessage(message, isError = false) {
    if (!adminMessageBox) {
        return;
    }

    adminMessageBox.textContent = message;
    adminMessageBox.style.color = isError ? "crimson" : "green";
}

function getAdminSession() {
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

function saveAdminSession(payload) {
    localStorage.setItem("admin_session", JSON.stringify({
        accessToken: payload.access_token,
        tokenType: payload.token_type,
        role: payload.role,
        username: payload.username,
        badgeNumber: payload.badge_number,
        firstName: payload.first_name,
        lastName: payload.last_name
    }));
}

function requireAdminSession() {
    const session = getAdminSession();

    if (!session || !session.accessToken || session.role !== "admin") {
        window.location.href = "login.html";
        return null;
    }

    return session;
}

async function postAdminJson(path, body) {
    const response = await fetch(`${ADMIN_API_BASE_URL}${path}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
    });

    const payload = await response.json().catch(() => ({}));

    if (!response.ok) {
        throw new Error(payload.detail || "Request failed");
    }

    return payload;
}

function fillAdminProfile(session) {
    if (!adminProfileFields.username) {
        return;
    }

    adminProfileFields.username.value = session.username || "";
    adminProfileFields.badgeNumber.value = session.badgeNumber || "";
    adminProfileFields.firstName.value = session.firstName || "";
    adminProfileFields.lastName.value = session.lastName || "";
}

if (adminLoginForm) {
    adminLoginForm.addEventListener("submit", async (event) => {
        event.preventDefault();
        showAdminMessage("");

        const data = Object.fromEntries(new FormData(adminLoginForm).entries());

        try {
            const payload = await postAdminJson("/token/admin/login", data);
            saveAdminSession(payload);
            window.location.href = "dashboard.html";
        } catch (error) {
            showAdminMessage(error.message, true);
        }
    });
}

if (document.body.dataset.adminProtected === "true") {
    const session = requireAdminSession();

    if (session) {
        fillAdminProfile(session);
    }
}
