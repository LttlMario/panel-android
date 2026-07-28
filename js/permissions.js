// Permisiuni comune pentru toate paginile panelului.

const Roles = {
    EL_MECANICO: 1,
    MECANIC: 1,
    SEF_MECANIC: 2,
    LA_FAMILIA: 3,
    MANAGER: 4,
    COLIDER: 5,
    LIDER: 6,
    COORDONATOR: 7
};

const PagePermissions = {
    'index.html': [1,2,3,4,5,6,7],
    'asistent.html': [1,2,3,4,5,6,7],
    'pontaj.html': [1,2,3,4,5,6,7],
    'cereri.html': [1,2,3,4,5,6,7],

    'rapoarte.html': [4,5,6,7],
    'contracte.html': [4,5,6,7],

    'calculatorilegal.html': [3,5,6,7],
    'locatiiilegale.html': [3,5,6,7],
    'marketplace-ilegal.html': [3,5,6,7],

    'craftmecanics.html': [1,2,3,4,5,6,7],
    'marketplace.html': [1,2,3,4,5,6,7],

    'logs.html': [7],
    'admin.html': [7],
    'edit.html': [7]
};

const STORAGE_KEY = 'discord_user';

function isLogged() {
    return getUser() !== null;
}

function getUser() {
    try {
        const userData = localStorage.getItem(STORAGE_KEY);
        return userData ? JSON.parse(userData) : null;
    } catch (error) {
        console.error('Eroare la citirea utilizatorului:', error);
        return null;
    }
}

function getRole() {
    const user = getUser();
    if (!user) return 0;

    const roleValue = user.role || user.default_role;

    if (typeof roleValue === 'number') {
        return roleValue;
    }

    if (typeof roleValue !== 'string') {
        return 0;
    }

    const role = roleValue.toLocaleLowerCase('ro-RO');

    // Coordonator
    if (role.includes('coordonator')) {
        return Roles.COORDONATOR;
    }

    // Co-Lider
    if (role.includes('co-lider') || role.includes('colider')) {
        return Roles.COLIDER;
    }

    // Lider
    if (role.includes('lider')) {
        return Roles.LIDER;
    }

    // Manager
    if (role.includes('manager')) {
        return Roles.MANAGER;
    }

    // La Familia
    if (role.includes('familia')) {
        return Roles.LA_FAMILIA;
    }

    // Șef Mecanic
    if (role.includes('sef') || role.includes('șef')) {
        return Roles.SEF_MECANIC;
    }

    // Mecanic / El Mecanico
    return Roles.MECANIC;
}

function hasRole(...roles) {
    return roles.includes(getRole());
}

function logout() {
    localStorage.clear();
    window.location.href = 'login.html';
}

(function initSecurityMiddleware() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';

    if (['login.html', '403.html'].includes(currentPage)) {
        return;
    }

    if (!isLogged()) {
        window.location.href = 'login.html';
        return;
    }

    const allowedRoles = PagePermissions[currentPage];

    if (allowedRoles && !allowedRoles.includes(getRole())) {
        window.location.href = '403.html';
        return;
    }

    document.addEventListener('DOMContentLoaded', () => {
        applyRoleBasedVisibility(getRole());
    });
})();

function applyRoleBasedVisibility(userRole) {
    document.querySelectorAll('[data-role]').forEach((element) => {

        const allowedRoles = element
            .getAttribute('data-role')
            .split(',')
            .map(role => Number(role.trim()));

        element.style.display = allowedRoles.includes(userRole)
            ? ''
            : 'none';
    });
}