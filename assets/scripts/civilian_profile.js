const PROFILE_API_BASE_URL = "http://127.0.0.1:8000";
const profileMessage = document.querySelector("#profile-message");
const contactModal = document.querySelector("#change-details-modal");
const contactForm = document.querySelector("#civilian-contact-form");
const openContactModalButton = document.querySelector("#open-contact-modal");
const closeContactModalButton = document.querySelector("#close-contact-modal");

const profileFields = {
    firstName: document.querySelector("#civilian-first-name"),
    lastName: document.querySelector("#civilian-last-name"),
    licenceNumber: document.querySelector("#civilian-licence-number"),
    stateIssue: document.querySelector("#civilian-state-issue"),
    phoneNumber: document.querySelector("#civilian-phone-number"),
    email: document.querySelector("#civilian-email")
};

function setProfileMessage(message, isError = false) {
    if (!profileMessage) {
        return;
    }

    profileMessage.textContent = message;
    profileMessage.style.color = isError ? "crimson" : "green";
}

function getCivilianToken() {
    return localStorage.getItem("civilian_access_token");
}

function requireCivilianToken() {
    const token = getCivilianToken();

    if (!token) {
        window.location.href = "civ_login.html";
        return null;
    }

    return token;
}

function openContactModal() {
    if (!contactModal) {
        return;
    }

    contactModal.hidden = false;
}

function closeContactModal() {
    if (!contactModal) {
        return;
    }

    contactModal.hidden = true;
}

function fillCivilianProfile(profile) {
    profileFields.firstName.value = profile.first_name || "";
    profileFields.lastName.value = profile.last_name || "";
    profileFields.licenceNumber.value = profile.licence_number || "";
    profileFields.stateIssue.value = profile.state_issue || "";
    profileFields.phoneNumber.value = profile.phone_number || "";
    profileFields.email.value = profile.email || "";

    if (contactForm) {
        contactForm.elements.phone_number.value = profile.phone_number || "";
        contactForm.elements.email.value = profile.email || "";
    }
}

async function requestCivilianProfile(path, options = {}) {
    const token = requireCivilianToken();

    if (!token) {
        return null;
    }

    const response = await fetch(`${PROFILE_API_BASE_URL}${path}`, {
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

async function loadCivilianProfile() {
    setProfileMessage("Loading profile...");

    try {
        const profile = await requestCivilianProfile("/token/civilian/me");

        if (!profile) {
            return;
        }

        fillCivilianProfile(profile);
        setProfileMessage("");
    } catch (error) {
        setProfileMessage(error.message, true);
    }
}

async function updateCivilianContact(event) {
    event.preventDefault();
    setProfileMessage("");

    const data = Object.fromEntries(new FormData(contactForm).entries());

    try {
        const profile = await requestCivilianProfile("/token/civilian/me", {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        });

        if (!profile) {
            return;
        }

        fillCivilianProfile(profile);
        closeContactModal();
        setProfileMessage("Contact details updated.");
    } catch (error) {
        setProfileMessage(error.message, true);
    }
}

if (openContactModalButton) {
    openContactModalButton.addEventListener("click", openContactModal);
}

if (closeContactModalButton) {
    closeContactModalButton.addEventListener("click", closeContactModal);
}

if (contactForm) {
    contactForm.addEventListener("submit", updateCivilianContact);
    loadCivilianProfile();
}
