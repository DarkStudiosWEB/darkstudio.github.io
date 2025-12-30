// ============================================
// CONFIGURACIÓN DE ADMINISTRADORES
// ============================================

const ADMIN_CONFIG = {
    // OPERADOR PRINCIPAL (Puede gestionar admins)
    OPERATOR: "escalanteortizsergio9@gmail.com",
    
    // ADMINISTRADORES (Pueden activar mantenimiento y responder chats)
    ADMINS: [
        "escalanteortizsergio9@gmail.com",
        // Agrega más correos aquí
        // "otroadmin@gmail.com",
    ],
    
    // Clave de acceso para el modo admin (cambiar periódicamente)
    ADMIN_KEY: "darkstudio_admin_2025"
};

// Función para verificar si un email es operador
function isOperator(email) {
    return email && email.toLowerCase() === ADMIN_CONFIG.OPERATOR.toLowerCase();
}

// Función para verificar si un email es admin
function isAdmin(email) {
    if (!email) return false;
    const lowerEmail = email.toLowerCase();
    return ADMIN_CONFIG.ADMINS.some(admin => admin.toLowerCase() === lowerEmail);
}

// Función para agregar un nuevo admin (solo operador)
function addAdmin(newAdminEmail, operatorEmail) {
    if (!isOperator(operatorEmail)) {
        return { success: false, message: "Solo el operador puede agregar administradores" };
    }
    
    if (isAdmin(newAdminEmail)) {
        return { success: false, message: "Este email ya es administrador" };
    }
    
    ADMIN_CONFIG.ADMINS.push(newAdminEmail);
    // Guardar en localStorage
    localStorage.setItem('customAdmins', JSON.stringify(ADMIN_CONFIG.ADMINS));
    
    return { success: true, message: "Administrador agregado exitosamente" };
}

// Función para remover un admin (solo operador)
function removeAdmin(adminEmail, operatorEmail) {
    if (!isOperator(operatorEmail)) {
        return { success: false, message: "Solo el operador puede remover administradores" };
    }
    
    if (adminEmail.toLowerCase() === ADMIN_CONFIG.OPERATOR.toLowerCase()) {
        return { success: false, message: "No puedes remover al operador principal" };
    }
    
    const index = ADMIN_CONFIG.ADMINS.findIndex(email => email.toLowerCase() === adminEmail.toLowerCase());
    if (index === -1) {
        return { success: false, message: "Este email no es administrador" };
    }
    
    ADMIN_CONFIG.ADMINS.splice(index, 1);
    // Guardar en localStorage
    localStorage.setItem('customAdmins', JSON.stringify(ADMIN_CONFIG.ADMINS));
    
    return { success: true, message: "Administrador removido exitosamente" };
}

// Cargar admins personalizados desde localStorage al inicio
(function loadCustomAdmins() {
    const customAdmins = localStorage.getItem('customAdmins');
    if (customAdmins) {
        try {
            const parsed = JSON.parse(customAdmins);
            ADMIN_CONFIG.ADMINS = [...new Set([ADMIN_CONFIG.OPERATOR, ...parsed])]; // Asegurar que el operador siempre esté
        } catch (e) {
            console.error('Error loading custom admins:', e);
        }
    }
})();
