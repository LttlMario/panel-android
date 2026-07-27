// js/permissions.js

const Roles = {
    MECANIC: 1,
    SEF_MECANIC: 2,
    LA_FAMILIA: 3,
    MANAGER: 4,
    ADMIN: 5
};

const PagePermissions = {
    "index.html": 1,
    "pontaj.html": 1,
    "cereri.html": 1,
    "rapoarte.html": 4,
    "contracte.html": 4,
    "admin.html": 5,
    "calculatorilegal.html": 3,
    "craftmecanics.html": 1,
    "locatiiilegale.html": 3,
    "marketplace.html": 1,
    "marketplace-ilegal.html": 3
};

// Am actualizat cheia de stocare la 'discord_user' pentru a se potrivi cu restul paginilor tale
const STORAGE_KEY = "discord_user";

/**
 * Funcții reutilizabile pentru starea utilizatorului și permisiuni
 */
function isLogged() {
    return getUser() !== null;
}

function getUser() {
    try {
        const userData = localStorage.getItem(STORAGE_KEY);
        return userData ? JSON.parse(userData) : null;
    } catch (e) {
        console.error("Erore la citirea utilizatorului din localStorage:", e);
        return null;
    }
}

function getRole() {
    const user = getUser();
    if (!user) {
        return 0;
    }
    
    // Extrage rolul indiferent dacă este salvat ca număr sau text (ex: "Mecanic", "Admin", etc.)
    const roleValue = user.role || user.default_role;
    
    if (typeof roleValue === 'number') {
        return roleValue;
    }
    
    // Fallback dacă rolul este salvat sub formă de text în baza de date
    if (typeof roleValue === 'string') {
        const lower = roleValue.toLowerCase();
        if (lower.includes('admin') || lower.includes('owner')) return 5;
        if (lower.includes('manager')) return 4;
        if (lower.includes('familia')) return 3;
        if (lower.includes('sef') || lower.includes('șef')) return 2;
        return 1; // Mecanic / Default
    }

    return 0;
}

function hasRole(requiredRole) {
    return getRole() >= requiredRole;
}

function logout() {
    localStorage.clear();
    window.location.href = "login.html";
}

/**
 * Motorul automat de verificare și protecție (Middleware Frontend)
 */
(function initSecurityMiddleware() {
    // 1. Detectare pagină curentă
    const pathSegments = window.location.pathname.split("/");
    const currentPage = pathSegments.pop() || "index.html";

    // Paginile care nu necesită verificare obligatorie (ex: login, 403)
    const publicPages = ["login.html", "403.html"];
    if (publicPages.includes(currentPage)) {
        return;
    }

    // 2. Verificare sesiune / autentificare
    if (!isLogged()) {
        window.location.href = "login.html";
        return;
    }

    // 3. Verificare rol necesar pentru pagina curentă
    const userRole = getRole();
    const requiredRole = PagePermissions[currentPage];

    // Dacă pagina are o restricție configurată și utilizatorul nu are nivelul necesar -> 403
    if (requiredRole !== undefined && userRole < requiredRole) {
        window.location.href = "403.html";
        return;
    }

    // 4. Aplicare automată a vizibilității elementelor bazate pe data-role
    document.addEventListener("DOMContentLoaded", () => {
        applyRoleBasedVisibility(userRole);
    });
})();

/**
 * Ascunde sau afișează automat elementele în funcție de data-role
 */
function applyRoleBasedVisibility(userRole) {
    const elements = document.querySelectorAll("[data-role]");
    
    elements.forEach(element => {
        const minRoleRequired = parseInt(element.getAttribute("data-role"), 10);
        
        if (!isNaN(minRoleRequired)) {
            if (userRole < minRoleRequired) {
                // Ascundere element dacă rolul utilizatorului este insuficient
                element.style.display = "none";
            } else {
                // Asigură vizibilitatea dacă are drepturi egale sau superioare
                element.style.removeProperty("display");
            }
        }
    });
}