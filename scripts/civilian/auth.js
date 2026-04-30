const API_BASE_URL = "http://127.0.0.1:8000";
const loginForm = document.querySelector("#civilian-login-form");
const registerForm = document.querySelector("#civilian-register-form");
const messageBox = document.querySelector("#auth-message");

function showMessage(message, isError = false) {
    if (!messageBox) {
        return;
    }

    messageBox.textContent = message;
    messageBox.style.color = isError ? "var(--danger)" : "var(--accent)";
}

function formDataToObject(form) {
    return Object.fromEntries(new FormData(form).entries());
}

function passwordMeetsRequirements(password) {
    return /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).+$/.test(password);
}

async function postJson(path, body) {
    const response = await fetch(`${API_BASE_URL}${path}`, {
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

function saveCivilianSession(payload) {
    localStorage.setItem("civilian_access_token", payload.access_token);
    localStorage.setItem("civilian_driver_id", payload.driver_id);
}

if (loginForm) {
    loginForm.addEventListener("submit", async (event) => {
        event.preventDefault();
        showMessage("");

        const data = formDataToObject(loginForm);

        try {
            const payload = await postJson("/token/civilian/login", {
                username: data.username,
                password: data.password
            });

            saveCivilianSession(payload);
            window.location.href = "dashboard.html";
        } catch (error) {
            showMessage(error.message, true);
        }
    });
}

if (registerForm) {
    registerForm.addEventListener("submit", async (event) => {
        event.preventDefault();
        showMessage("");

        const data = formDataToObject(registerForm);

        if (data.password !== data.confirm_password) {
            showMessage("Passwords do not match", true);
            return;
        }

        if (!passwordMeetsRequirements(data.password)) {
            showMessage("Password must contain at least one capital letter, one number, and one special symbol", true);
            return;
        }

        const payload = {
            address: {
                zip_code: data.zip_code,
                state: data.state,
                city: data.city,
                street: data.street,
                house: data.house
            },
            email: data.email,
            username: data.username,
            password: data.password,
            phone_number: data.phone_number,
            licence_number: data.licence_number,
            state_issue: data.state_issue,
            last_name: data.last_name,
            first_name: data.first_name,
            dob: data.dob,
            height_inches: Number(data.height_inches),
            weight_pounds: Number(data.weight_pounds),
            eyes_colour: data.eyes_colour
        };

        try {
            await postJson("/token/civilian/register", payload);
            window.location.href = "login.html";
        } catch (error) {
            showMessage(error.message, true);
        }
    });
}
