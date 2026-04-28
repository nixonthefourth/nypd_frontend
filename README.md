# Frontend README

## Overview

This frontend is a vanilla HTML, CSS, and JavaScript interface for the NYPD Traffic Patrol System. It has separate civilian and admin flows, shared styling tokens, responsive page layouts, and simple fetch-based integration with the backend API.

No frontend framework or build step is required.

## Tech Stack

- HTML for page structure
- CSS for layout, responsive styling, and page themes
- JavaScript for authentication, API calls, profile updates, dashboard loading, and citation actions
- Montserrat loaded from Google Fonts in `styles/base.css`

## Project Structure

```text
assignment_3/
├── index.html
├── assets/
│   └── Landing/
├── pages/
│   ├── admin/
│   │   ├── citations.html
│   │   ├── dashboard.html
│   │   ├── login.html
│   │   └── profile.html
│   └── civilian/
│       ├── dashboard.html
│       ├── login.html
│       ├── profile.html
│       └── reg.html
├── scripts/
│   ├── admin/
│   └── civilian/
└── styles/
    ├── base.css
    ├── style_landing.css
    ├── style_login.css
    ├── style_registration.css
    ├── civ_dashboard.css
    ├── civ_profile.css
    ├── admin_dashboard.css
    ├── admin_citations.css
    └── admin_profile.css
```

## Pages

### Public

- `index.html`  
  Landing page with links into the civilian and admin flows.

### Civilian

- `pages/civilian/reg.html`  
  Civilian registration form.

- `pages/civilian/login.html`  
  Civilian login page.

- `pages/civilian/dashboard.html`  
  Displays the logged-in civilian's notices.

- `pages/civilian/profile.html`  
  Displays civilian profile details and allows contact detail updates.

### Admin

- `pages/admin/login.html`  
  Admin login page.

- `pages/admin/dashboard.html`  
  Shows system overview statistics, filters, grouped citation counts, and filtered notices.

- `pages/admin/citations.html`  
  Citation management page for viewing, creating, editing, and deleting citations.

- `pages/admin/profile.html`  
  Displays admin profile details and a contact details modal.

## Stylesheets

The frontend uses page-specific stylesheets that import shared variables and base rules from `styles/base.css`.

- `base.css`  
  Shared font, colors, spacing variables, navigation, footer, form defaults, buttons, and responsive root spacing.

- `style_landing.css`  
  Landing page layout and image-led sections.

- `style_login.css`  
  Shared civilian/admin login page styling.

- `style_registration.css`  
  Civilian registration form layout.

- `civ_dashboard.css`  
  Civilian notice table with responsive mobile card layout.

- `civ_profile.css`  
  Civilian profile grid, readonly fields, contact update button, and modal styling.

- `admin_dashboard.css`  
  Admin overview cards, filters, grouped tables, and filtered notice table.

- `admin_citations.css`  
  Admin citation management table, generated action buttons, citation modals, forms, checkbox, textarea, and delete confirmation styling.

- `admin_profile.css`  
  Admin profile grid, readonly fields, nav highlight, and contact modal styling.

## JavaScript

The JavaScript is split by user type.

### Civilian Scripts

- `scripts/civilian/auth.js`  
  Handles civilian registration and login.

- `scripts/civilian/dashboard.js`  
  Loads and renders civilian notices.

- `scripts/civilian/profile.js`  
  Loads civilian profile data and updates phone/email details.

### Admin Scripts

- `scripts/admin/auth.js`  
  Handles admin login/session protection.

- `scripts/admin/dashboard.js`  
  Loads dashboard statistics, filter options, grouped counts, and filtered notices.

- `scripts/admin/citations.js`  
  Loads citations and handles create, view, edit, and delete modal actions.

## Backend API

The frontend currently expects the backend to run at:

```text
http://127.0.0.1:8000
```

This base URL appears in the JavaScript files as constants such as:

```js
const DASHBOARD_API_BASE_URL = "http://127.0.0.1:8000";
```

If the backend runs on a different host or port, update the relevant constants in the files under `scripts/`.

## Running the Frontend

Because this is vanilla HTML, CSS, and JavaScript, there is no install step.

You can open `index.html` directly in a browser. If browser restrictions affect local API requests, serve the folder with a simple local server from the `assignment_3` directory:

```bash
python3 -m http.server 5500
```

Then visit:

```text
http://localhost:5500
```

Make sure the backend API is also running at `http://127.0.0.1:8000`.

## Design Notes

- The visual style uses bold uppercase headings, hard black borders, simple grid layouts, and the shared accent color from `base.css`.
- Pages use responsive spacing and layout rules for desktop, tablet, and mobile.
- Admin and civilian pages share the same design language but use separate page CSS files for clearer ownership.
- The frontend intentionally stays framework-free for the assignment requirement.