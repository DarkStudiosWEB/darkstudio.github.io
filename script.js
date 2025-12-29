document.addEventListener('DOMContentLoaded', () => {
    
    // ===================================================
    // 0. SISTEMA DE MANTENIMIENTO Y ADMIN
    // ===================================================
    
    const maintenanceScreen = document.getElementById('maintenanceScreen');
    let isMaintenanceMode = false;
    let isAdminMode = false;
    
    // Verificar si es modo admin desde la URL
    const urlParams = new URLSearchParams(window.location.search);
    const adminKey = urlParams.get('admin');
    
    if (adminKey === 'darkstudio_admin_2025') {
        isAdminMode = true;
        sessionStorage.setItem('adminMode', 'true');
        console.log('🔑 Modo Administrador Activado');
        
        // Limpiar URL para no mostrar la clave
        window.history.replaceState({}, document.title, window.location.pathname);
    } else if (sessionStorage.getItem('adminMode') === 'true') {
        isAdminMode = true;
    }
    
    // Verificar si hay un parámetro especial para activar/desactivar mantenimiento (solo admins)
    const maintenanceControl = urlParams.get('maintenance');
    if (isAdminMode && maintenanceControl !== null) {
        if (maintenanceControl === 'on') {
            localStorage.setItem('maintenanceMode', 'true');
            console.log('🔧 Modo Mantenimiento ACTIVADO');
        } else if (maintenanceControl === 'off') {
            localStorage.setItem('maintenanceMode', 'false');
            console.log('✅ Modo Mantenimiento DESACTIVADO');
        }
        // Limpiar URL
        window.history.replaceState({}, document.title, window.location.pathname);
    }
    
    // Función para verificar mantenimiento
    const checkMaintenanceMode = () => {
        // Leer del localStorage
        const maintenanceStatus = localStorage.getItem('maintenanceMode');
        
        // Si está en mantenimiento y NO es admin
        if (maintenanceStatus === 'true' && !isAdminMode) {
            return true;
        }
        return false;
    };
    
    // ===================================================
    // 1. GESTIÓN DEL PRELOADER
    // ===================================================

    const preloader = document.getElementById('preloader');
    const mainContent = document.getElementById('mainContent');
    const progressBar = document.getElementById('progressBar');
    const loadingText = document.querySelector('.loading-text');

    const MIN_LOAD_TIME = 3000;
    const INTERVAL_MS = 50;
    let isLoaded = false;
    let progress = 0;
    
    const getUserLoadTime = () => {
        const savedTime = localStorage.getItem('userLoadTime');
        return savedTime ? parseInt(savedTime) * 1000 : 3000;
    };
    
    const loadTime = getUserLoadTime();

    const progressInterval = setInterval(() => {
        if (progress < 90) {
            progress += 1; 
            progressBar.style.width = progress + '%';
            loadingText.textContent = `Cargando... ${Math.floor(progress)}%`;
        }
    }, INTERVAL_MS);

    const finishLoading = () => {
        if (isLoaded) return;

        isLoaded = true;
        clearInterval(progressInterval);
        
        progressBar.style.width = '100%';
        loadingText.textContent = `Carga completa.`;

        // Verificar mantenimiento antes de mostrar contenido
        const inMaintenance = checkMaintenanceMode();

        setTimeout(() => {
            preloader.classList.add('fade-out');
            
            preloader.addEventListener('transitionend', () => {
                preloader.classList.add('hidden');
                
                if (inMaintenance) {
                    // Mostrar pantalla de mantenimiento
                    maintenanceScreen.classList.remove('hidden');
                    console.log('🔧 Mostrando pantalla de mantenimiento');
                } else {
                    // Mostrar contenido normal
                    mainContent.classList.remove('hidden');
                    showSection('home-content');
                }
                
            }, { once: true });
            
        }, 500);
    };

    setTimeout(() => {
        finishLoading();
    }, loadTime);
    
    // Mostrar badge de admin si está en modo admin
    if (isAdminMode) {
        setTimeout(() => {
            const adminBadge = document.getElementById('adminBadge');
            if (adminBadge) {
                adminBadge.classList.remove('hidden');
            }
            
            // Mostrar toast informativo
            setTimeout(() => {
                showToast(
                    '👑 Modo Admin Activado',
                    'Tienes acceso completo. Para activar mantenimiento: añade ?maintenance=on a la URL',
                    'info'
                );
            }, 1500);
        }, 1000);
    }


    // ===================================================
    // 2. NAVEGACIÓN Y SIDEBAR
    // ===================================================
    
    const sidebar = document.getElementById('sidebar');
    const menuToggle = document.getElementById('menuToggle');
    const closeSidebar = document.getElementById('closeSidebar');
    const navLinks = document.querySelectorAll('.nav-link');
    const contentSections = document.querySelectorAll('.content-section');
    const blogContent = document.getElementById('blog-content');
    const articleView = document.getElementById('article-view');
    const backToBlogButton = document.getElementById('backToBlog');
    const serverLogo = document.getElementById('serverLogo'); 

    const showSection = (sectionId) => {
        contentSections.forEach(section => {
            section.classList.add('hidden-content');
            section.classList.remove('show-content');
        });
        
        const targetSection = document.getElementById(sectionId);
        if (targetSection) {
            targetSection.classList.remove('hidden-content');
            targetSection.classList.add('show-content');
        }
        
        if (sectionId !== 'article-view') { 
            articleView.classList.add('hidden-content');
            articleView.classList.remove('show-content');
        }
    };

    const closeSidebarPanel = () => {
        sidebar.classList.remove('show');
        setTimeout(() => {
            sidebar.classList.add('hidden-sidebar');
        }, 400); 
    };
    
    menuToggle.addEventListener('click', () => {
        sidebar.classList.add('show');
        sidebar.classList.remove('hidden-sidebar');
    });

    closeSidebar.addEventListener('click', closeSidebarPanel);
    
    serverLogo.addEventListener('click', () => {
        showSection('home-content');
        closeSidebarPanel();
    });

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const href = e.currentTarget.getAttribute('href');
            const targetId = (href === '#home') ? 'home-content' : href.substring(1) + '-content';
            
            showSection(targetId);
            
            closeSidebarPanel();
        });
    });

    // ===================================================
    // FUNCIÓN AUXILIAR: Convertir markdown a HTML
    // ===================================================
    const convertMarkdownToHTML = (text) => {
        text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        text = text.replace(/\*(.*?)\*/g, '<em>$1</em>');
        return text;
    };

    // ===================================================
    // 3. LÓGICA DEL BLOG Y VISTA DE ARTÍCULO
    // ===================================================

    const blogGridContainer = document.getElementById('blogGridContainer');
    const blogCardTemplate = document.getElementById('blogCardTemplate');

    const loadBlogArticles = () => {
        if (typeof articles !== 'undefined' && blogGridContainer && blogCardTemplate) {
            blogGridContainer.innerHTML = ''; 
            
            let sortedArticles = [...articles];
            
            sortedArticles.sort((a, b) => {
                if (a.isPinned && !b.isPinned) return -1;
                if (!a.isPinned && b.isPinned) return 1;
                return 0; 
            });


            sortedArticles.forEach(article => {
                const clone = blogCardTemplate.content.cloneNode(true);
                const card = clone.querySelector('.blog-card');
                
                card.dataset.articleId = article.id;
                
                if (article.isPinned) {
                    clone.querySelector('.card-title').innerHTML = `📌 ${article.title}`;
                } else {
                    clone.querySelector('.card-title').textContent = article.title;
                }
                
                const icon = article.icon || '';
                clone.querySelector('.card-subtitle').textContent = `${icon} ${article.subtitle}`;
                
                const description = article.description.length > 100 
                                  ? article.description.substring(0, 100) + '...'
                                  : article.description;
                clone.querySelector('.card-description').textContent = description;

                card.addEventListener('click', (e) => {
                    if (!e.target.closest('.fa-bookmark')) {
                        displayArticle(article);
                    }
                });

                const bookmarkIcon = clone.querySelector('.fa-bookmark');
                const savedArticles = getSavedArticles();
                
                if (savedArticles.includes(article.id)) {
                    bookmarkIcon.classList.add('saved');
                    bookmarkIcon.title = 'Guardado - Clic para quitar';
                }
                
                bookmarkIcon.addEventListener('click', (e) => {
                    e.stopPropagation();
                    toggleSaveArticle(article.id, bookmarkIcon);
                });

                blogGridContainer.appendChild(clone);
            });
        }
    };

    // ===================================================
    // FUNCIONES PARA GESTIÓN DE ARTÍCULOS GUARDADOS
    // ===================================================
    
    let currentToast = null;
    
    const showToast = (title, message, type = 'bookmark') => {
        const toastContainer = document.getElementById('toastContainer');
        
        if (currentToast && currentToast.parentNode) {
            currentToast.parentNode.removeChild(currentToast);
            currentToast = null;
        }
        
        const toast = document.createElement('div');
        
        if (type === 'suggestion-success') {
            toast.className = 'toast toast-suggestion';
        } else if (type === 'suggestion-error') {
            toast.className = 'toast toast-error';
        } else if (type === 'bookmark-remove') {
            toast.className = 'toast toast-remove';
        } else if (type === 'info') {
            toast.className = 'toast toast-info';
        } else {
            toast.className = 'toast';
        }
        
        let icon;
        if (type === 'suggestion-success') {
            icon = 'fa-check-circle';
        } else if (type === 'suggestion-error') {
            icon = 'fa-exclamation-circle';
        } else if (type === 'bookmark-remove') {
            icon = 'fa-bookmark-slash';
        } else if (type === 'info') {
            icon = 'fa-info-circle';
        } else {
            icon = 'fa-bookmark';
        }
        
        toast.innerHTML = `
            <i class="fas ${icon} toast-icon"></i>
            <div class="toast-content">
                <p class="toast-title">${title}</p>
                <p class="toast-message">${message}</p>
            </div>
            <button class="toast-close" aria-label="Cerrar">×</button>
        `;
        
        toastContainer.appendChild(toast);
        
        currentToast = toast;
        
        setTimeout(() => {
            toast.classList.add('show');
        }, 10);
        
        const closeButton = toast.querySelector('.toast-close');
        closeButton.addEventListener('click', () => {
            removeToast(toast);
        });
        
        setTimeout(() => {
            removeToast(toast);
        }, 4000);
    };
    
    const removeToast = (toast) => {
        if (!toast || !toast.parentNode) return;
        
        toast.classList.remove('show');
        toast.classList.add('hide');
        
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
            if (currentToast === toast) {
                currentToast = null;
            }
        }, 400);
    };
    
    const getSavedArticles = () => {
        const userEmail = localStorage.getItem('userEmail');
        if (!userEmail) return [];
        
        const saved = localStorage.getItem(`savedArticles_${userEmail}`);
        return saved ? JSON.parse(saved) : [];
    };
    
    const setSavedArticles = (articleIds) => {
        const userEmail = localStorage.getItem('userEmail');
        if (!userEmail) return;
        
        localStorage.setItem(`savedArticles_${userEmail}`, JSON.stringify(articleIds));
    };
    
    const toggleSaveArticle = (articleId, iconElement) => {
        const userEmail = localStorage.getItem('userEmail');
        if (!userEmail) {
            showToast(
                '🔒 Inicio de sesión requerido',
                'Debes iniciar sesión con Google para guardar artículos.',
                'info'
            );
            return;
        }
        
        let savedArticles = getSavedArticles();
        
        const article = articles.find(a => a.id === articleId);
        const articleTitle = article ? article.title : 'Artículo';
        
        if (savedArticles.includes(articleId)) {
            savedArticles = savedArticles.filter(id => id !== articleId);
            iconElement.classList.remove('saved');
            iconElement.title = 'Guardar para después';
            
            showToast(
                '📋 Artículo eliminado',
                `"${articleTitle}" fue removido de tus guardados.`,
                'bookmark-remove'
            );
        } else {
            savedArticles.push(articleId);
            iconElement.classList.add('saved');
            iconElement.title = 'Guardado - Clic para quitar';
            
            showToast(
                '✨ Artículo guardado',
                `"${articleTitle}" está ahora en tus favoritos.`,
                'bookmark'
            );
        }
        
        setSavedArticles(savedArticles);
    };
    
    // ===================================================
    // NUEVA FUNCIÓN: Mostrar previsualización del artículo
    // ===================================================
    
    const previewModal = document.getElementById('previewModal');
    const closePreviewModal = document.getElementById('closePreviewModal');
    const goToFullArticle = document.getElementById('goToFullArticle');
    let currentPreviewArticle = null;
    
    const showArticlePreview = (article) => {
        currentPreviewArticle = article;
        
        document.getElementById('preview-title').textContent = article.title;
        document.getElementById('preview-subtitle').textContent = article.subtitle;
        
        const contentWithFormatting = convertMarkdownToHTML(article.content);
        document.getElementById('preview-body').innerHTML = contentWithFormatting;
        
        previewModal.classList.remove('hidden-modal');
    };
    
    const closePreviewModalFunc = () => {
        previewModal.classList.add('hidden-modal');
        currentPreviewArticle = null;
    };
    
    closePreviewModal.addEventListener('click', closePreviewModalFunc);
    
    previewModal.addEventListener('click', (e) => {
        if (e.target === previewModal) {
            closePreviewModalFunc();
        }
    });
    
    goToFullArticle.addEventListener('click', () => {
        if (currentPreviewArticle) {
            closePreviewModalFunc();
            showSection('blog-content');
            displayArticle(currentPreviewArticle);
            closeSidebarPanel();
        }
    });
    
    // ===================================================
    // CARGAR ARTÍCULOS GUARDADOS (MODIFICADO PARA PREVIEW)
    // ===================================================
    
    const loadSavedArticles = () => {
        const savedArticlesContainer = document.getElementById('savedArticlesContainer');
        const noSavedMessage = document.getElementById('noSavedArticles');
        const savedArticleIds = getSavedArticles();
        
        savedArticlesContainer.innerHTML = '';
        
        if (savedArticleIds.length === 0) {
            noSavedMessage.style.display = 'block';
            return;
        }
        
        noSavedMessage.style.display = 'none';
        
        const savedArticlesData = articles.filter(article => savedArticleIds.includes(article.id));
        
        savedArticlesData.forEach(article => {
            const clone = blogCardTemplate.content.cloneNode(true);
            const card = clone.querySelector('.blog-card');
            
            card.dataset.articleId = article.id;
            
            clone.querySelector('.card-title').textContent = article.title;
            
            const icon = article.icon || '';
            clone.querySelector('.card-subtitle').textContent = `${icon} ${article.subtitle}`;
            
            const description = article.description.length > 100 
                              ? article.description.substring(0, 100) + '...'
                              : article.description;
            clone.querySelector('.card-description').textContent = description;

            // CAMBIO CLAVE: En lugar de abrir el artículo completo, mostrar previsualización
            card.addEventListener('click', (e) => {
                if (!e.target.closest('.fa-bookmark')) {
                    showArticlePreview(article);
                }
            });

            const bookmarkIcon = clone.querySelector('.fa-bookmark');
            bookmarkIcon.classList.add('saved');
            bookmarkIcon.title = 'Guardado - Clic para quitar';
            
            bookmarkIcon.addEventListener('click', (e) => {
                e.stopPropagation();
                toggleSaveArticle(article.id, bookmarkIcon);
                setTimeout(() => loadSavedArticles(), 100);
            });

            savedArticlesContainer.appendChild(clone);
        });
    };

    // Función para mostrar el contenido de un artículo (desde FAQ)
    const displayArticle = (article) => {
        document.getElementById('article-title').textContent = article.title;
        document.getElementById('article-subtitle').textContent = article.subtitle;
        
        const contentWithFormatting = convertMarkdownToHTML(article.content);
        document.getElementById('article-body').innerHTML = contentWithFormatting;
        
        blogContent.classList.remove('show-content');
        blogContent.classList.add('hidden-content'); 

        articleView.classList.remove('hidden-content');
        articleView.classList.add('show-content');
        
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    backToBlogButton.addEventListener('click', () => {
        articleView.classList.remove('show-content');
        articleView.classList.add('hidden-content');

        blogContent.classList.remove('hidden-content');
        blogContent.classList.add('show-content');
        
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    
    loadBlogArticles(); 

    // ===================================================
    // 4. LÓGICA DE SUGERENCIAS (Requiere Login)
    // ===================================================

    const suggestionForm = document.getElementById('suggestionForm');
    const suggestionInput = document.getElementById('suggestionInput');
    const suggestionButton = suggestionForm.querySelector('.suggestion-button');
    const loginRequiredMessage = document.getElementById('loginRequiredMessage');

    suggestionForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        if (!suggestionInput.value.trim() || suggestionInput.value.length < 10) {
            showToast(
                '⚠️ Error en sugerencia',
                'La sugerencia debe tener al menos 10 caracteres.',
                'suggestion-error'
            );
            return;
        }

        const userEmail = localStorage.getItem('userEmail');
        const userName = localStorage.getItem('userName');
        const suggestionText = suggestionInput.value.trim();
        
        suggestionButton.disabled = true;
        suggestionButton.textContent = 'Enviando...';
        
        try {
            const response = await fetch('https://darkbots-production.up.railway.app/sugerencia', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    text: suggestionText,
                    userEmail: userEmail || 'Anónimo'
                })
            });
            
            const data = await response.json();
            
            if (data.status === 'success') {
                showToast(
                    '✅ Sugerencia enviada',
                    `¡Gracias, ${userName || 'Usuario'}! La revisaremos pronto.`,
                    'suggestion-success'
                );
                suggestionInput.value = ''; 
            } else {
                showToast(
                    '❌ Error al enviar',
                    data.message || 'No se pudo enviar la sugerencia.',
                    'suggestion-error'
                );
            }
            
        } catch (error) {
            console.error('Error al enviar sugerencia:', error);
            showToast(
                '❌ Error de conexión',
                'No se pudo conectar con el servidor. Intenta nuevamente.',
                'suggestion-error'
            );
        } finally {
            suggestionButton.disabled = false;
            suggestionButton.textContent = 'Solicitar Artículo';
        }
    });
    
    const updateSuggestionFormState = (isLoggedIn) => {
        if (isLoggedIn) {
            suggestionInput.disabled = false;
            suggestionButton.disabled = false;
            loginRequiredMessage.style.display = 'none';
        } else {
            suggestionInput.disabled = true;
            suggestionButton.disabled = true;
            loginRequiredMessage.style.display = 'block';
        }
    };


    // ===================================================
    // 5. GESTIÓN DE SESIÓN DE GOOGLE
    // ===================================================

    const googleSignInButton = document.getElementById('googleSignInButton');
    const userProfileContainer = document.getElementById('userProfile');
    const profileImage = document.getElementById('profileImage');
    const dropdownMenu = document.getElementById('dropdownMenu');
    const dropdownName = document.getElementById('dropdownName');
    const signOutButton = document.getElementById('signOutButton');
    const settingsButton = document.getElementById('settingsButton');
    const savedArticlesButton = document.getElementById('savedArticlesButton');

    userProfileContainer.addEventListener('click', (e) => {
        e.stopPropagation(); 
        dropdownMenu.classList.toggle('hidden');
    });

    document.addEventListener('click', (e) => {
        if (!userProfileContainer.contains(e.target) && !dropdownMenu.contains(e.target)) {
            dropdownMenu.classList.add('hidden');
        }
    });

    signOutButton.addEventListener('click', () => {
        if (typeof google !== 'undefined' && google.accounts.id) {
            google.accounts.id.disableAutoSelect(); 
        }

        localStorage.removeItem('userName');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('userPicture');
        localStorage.removeItem('userLoadTime');

        updateAuthUI(false);
    });
    
    settingsButton.addEventListener('click', () => {
        openSettingsModal();
        dropdownMenu.classList.add('hidden');
    });
    
    savedArticlesButton.addEventListener('click', () => {
        showSection('saved-articles-content');
        loadSavedArticles();
        dropdownMenu.classList.add('hidden');
        closeSidebarPanel();
    });


    window.handleCredentialResponse = (response) => {
        if (response.credential) {
            const token = response.credential;
            const payload = JSON.parse(atob(token.split('.')[1]));

            localStorage.setItem('userName', payload.name);
            localStorage.setItem('userEmail', payload.email);
            localStorage.setItem('userPicture', payload.picture);
            
            updateAuthUI(true, payload.name, payload.picture);
        }
    };

    const updateAuthUI = (isLoggedIn, name = '', picture = '') => {
        if (isLoggedIn) {
            googleSignInButton.style.display = 'none';
            userProfileContainer.classList.remove('hidden-profile');
            
            name = name || localStorage.getItem('userName');
            picture = picture || localStorage.getItem('userPicture');
            
            profileImage.src = picture;
            dropdownName.textContent = name;
        } else {
            googleSignInButton.style.display = 'block';
            userProfileContainer.classList.add('hidden-profile');
            
            dropdownMenu.classList.add('hidden');
        }
        
        updateSuggestionFormState(isLoggedIn);
        updateDarkflashButton(); // Actualizar DarkFlash cuando cambie el login
    };

    const checkUserSession = () => {
        const userName = localStorage.getItem('userName');
        const userPicture = localStorage.getItem('userPicture');

        if (userName && userPicture) {
            updateAuthUI(true, userName, userPicture);
        } else {
            updateAuthUI(false);
        }
    };
    
    // ===================================================
    // 6. LÓGICA DE COOKIES Y MODAL DE TÉRMINOS
    // ===================================================

    const cookieBanner = document.getElementById('cookieBanner');
    const acceptCookiesButton = document.getElementById('acceptCookies');
    const openTermsModalButton = document.getElementById('openTermsModal');
    const termsModal = document.getElementById('termsModal');
    const closeModalButton = document.getElementById('closeModal');
    const acceptTermsFinalButton = document.getElementById('acceptTermsFinal');
    const termsScrollArea = document.querySelector('.terms-scroll-area');

    const setCookiePreference = (status) => {
        localStorage.setItem('cookiesAccepted', status);
        cookieBanner.classList.add('hidden-cookie');
    };

    const checkCookiePreference = () => {
        const accepted = localStorage.getItem('cookiesAccepted');
        if (accepted === 'true') {
            cookieBanner.classList.add('hidden-cookie');
        } else {
            cookieBanner.classList.remove('hidden-cookie');
        }
    };

    const openModal = () => {
        termsModal.classList.remove('hidden-modal');
        termsScrollArea.scrollTop = 0;
        acceptTermsFinalButton.disabled = true;
    };

    const closeModal = () => {
        termsModal.classList.add('hidden-modal');
    };

    const checkScroll = () => {
        const isScrolledToBottom = termsScrollArea.scrollTop + termsScrollArea.clientHeight >= termsScrollArea.scrollHeight - 20; 
        acceptTermsFinalButton.disabled = !isScrolledToBottom;
    };

    acceptCookiesButton.addEventListener('click', () => {
        setCookiePreference('true');
    });

    openTermsModalButton.addEventListener('click', openModal);
    closeModalButton.addEventListener('click', closeModal);
    termsScrollArea.addEventListener('scroll', checkScroll);

    acceptTermsFinalButton.addEventListener('click', () => {
        if (!acceptTermsFinalButton.disabled) {
            setCookiePreference('true');
            closeModal();
        }
    });

    termsModal.addEventListener('click', (e) => {
        if (e.target === termsModal) {
            closeModal();
        }
    });
    
    // ===================================================
    // 7. MODAL DE CONFIGURACIÓN
    // ===================================================
    
    const settingsModal = document.getElementById('settingsModal');
    const closeSettingsModal = document.getElementById('closeSettingsModal');
    const loadTimeSlider = document.getElementById('loadTimeSlider');
    const loadTimeValue = document.getElementById('loadTimeValue');
    const saveSettings = document.getElementById('saveSettings');
    
    const openSettingsModal = () => {
        settingsModal.classList.remove('hidden-modal');
        
        const savedTime = localStorage.getItem('userLoadTime') || '3';
        loadTimeSlider.value = savedTime;
        loadTimeValue.textContent = savedTime;
    };
    
    const closeSettingsModalFunc = () => {
        settingsModal.classList.add('hidden-modal');
    };
    
    loadTimeSlider.addEventListener('input', (e) => {
        loadTimeValue.textContent = e.target.value;
    });
    
    saveSettings.addEventListener('click', () => {
        const selectedTime = loadTimeSlider.value;
        localStorage.setItem('userLoadTime', selectedTime);
        
        const originalText = saveSettings.innerHTML;
        saveSettings.innerHTML = '<i class="fas fa-check"></i> ¡Guardado!';
        saveSettings.style.backgroundColor = '#2ecc71';
        
        setTimeout(() => {
            saveSettings.innerHTML = originalText;
            saveSettings.style.backgroundColor = '#ffffff';
            closeSettingsModalFunc();
        }, 1500);
    });
    
    closeSettingsModal.addEventListener('click', closeSettingsModalFunc);
    
    settingsModal.addEventListener('click', (e) => {
        if (e.target === settingsModal) {
            closeSettingsModalFunc();
        }
    });
    
    
    // ===================================================
    // 9. DARKFLASH ASSISTANT
    // ===================================================
    
    const darkflashButton = document.getElementById('darkflashButton');
    const darkflashPanel = document.getElementById('darkflashPanel');
    const closeDarkflash = document.getElementById('closeDarkflash');
    
    // Secciones
    const darkflashMenu = document.getElementById('darkflashMenu');
    const darkflashGame = document.getElementById('darkflashGame');
    const darkflashFAQ = document.getElementById('darkflashFAQ');
    const darkflashSupport = document.getElementById('darkflashSupport');
    const darkflashRating = document.getElementById('darkflashRating');
    
    // Estado del asistente
    let darkflashActive = false;
    let currentSection = 'menu';
    let supportSessionId = null;
    let selectedRating = 0;
    
    // Verificar estado de login
    const updateDarkflashButton = () => {
        const isLoggedIn = localStorage.getItem('userEmail') !== null;
        if (isLoggedIn) {
            darkflashButton.classList.remove('disabled');
        } else {
            darkflashButton.classList.add('disabled');
        }
    };
    
    // Click en botón principal
    darkflashButton.addEventListener('click', () => {
        const isLoggedIn = localStorage.getItem('userEmail') !== null;
        
        if (!isLoggedIn) {
            showToast(
                '🔒 Inicio de sesión requerido',
                'Debes iniciar sesión con Google para usar DarkFlash.',
                'info'
            );
            return;
        }
        
        darkflashActive = !darkflashActive;
        if (darkflashActive) {
            darkflashPanel.classList.remove('hidden');
            showDarkflashSection('menu');
        } else {
            darkflashPanel.classList.add('hidden');
        }
    });
    
    closeDarkflash.addEventListener('click', () => {
        darkflashPanel.classList.add('hidden');
        darkflashActive = false;
    });
    
    // Función para cambiar secciones
    const showDarkflashSection = (section) => {
        // Ocultar todas
        [darkflashMenu, darkflashGame, darkflashFAQ, darkflashSupport, darkflashRating].forEach(sec => {
            sec.classList.add('hidden');
        });
        
        // Mostrar la seleccionada
        switch(section) {
            case 'menu':
                darkflashMenu.classList.remove('hidden');
                break;
            case 'game':
                darkflashGame.classList.remove('hidden');
                initGame();
                break;
            case 'faq':
                darkflashFAQ.classList.remove('hidden');
                break;
            case 'support':
                darkflashSupport.classList.remove('hidden');
                initSupport();
                break;
            case 'rating':
                darkflashRating.classList.remove('hidden');
                break;
        }
        
        currentSection = section;
    };
    
    // Opciones del menú principal
    document.querySelectorAll('.darkflash-option').forEach(option => {
        option.addEventListener('click', (e) => {
            const selected = e.currentTarget.dataset.option;
            showDarkflashSection(selected);
        });
    });
    
    // Botones de volver
    document.querySelectorAll('.darkflash-back').forEach(btn => {
        btn.addEventListener('click', () => {
            showDarkflashSection('menu');
        });
    });
    
    // ===================================================
    // MINIJUEGO: BRICK BREAKER
    // ===================================================
    
    let gameCanvas, gameCtx, gameRunning, gameScore;
    let paddle, ball, bricks;
    
    const initGame = () => {
        gameCanvas = document.getElementById('gameCanvas');
        gameCtx = gameCanvas.getContext('2d');
        gameScore = 0;
        gameRunning = false;
        
        // Reset elementos del juego
        paddle = { x: 125, y: 370, width: 50, height: 10, speed: 7 };
        ball = { x: 150, y: 350, radius: 5, dx: 3, dy: -3 };
        bricks = [];
        
        // Crear bricks
        for (let row = 0; row < 5; row++) {
            for (let col = 0; col < 6; col++) {
                bricks.push({
                    x: col * 48 + 6,
                    y: row * 20 + 30,
                    width: 42,
                    height: 15,
                    status: 1
                });
            }
        }
        
        drawGame();
    };
    
    const drawGame = () => {
        if (!gameCtx) return;
        
        // Limpiar canvas
        gameCtx.fillStyle = '#000';
        gameCtx.fillRect(0, 0, 300, 400);
        
        // Dibujar paddle
        gameCtx.fillStyle = '#667eea';
        gameCtx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
        
        // Dibujar ball
        gameCtx.fillStyle = '#fff';
        gameCtx.beginPath();
        gameCtx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
        gameCtx.fill();
        
        // Dibujar bricks
        bricks.forEach(brick => {
            if (brick.status === 1) {
                gameCtx.fillStyle = '#f39c12';
                gameCtx.fillRect(brick.x, brick.y, brick.width, brick.height);
            }
        });
    };
    
    const updateGame = () => {
        if (!gameRunning) return;
        
        // Mover ball
        ball.x += ball.dx;
        ball.y += ball.dy;
        
        // Colisión con paredes
        if (ball.x + ball.radius > 300 || ball.x - ball.radius < 0) {
            ball.dx = -ball.dx;
        }
        if (ball.y - ball.radius < 0) {
            ball.dy = -ball.dy;
        }
        
        // Colisión con paddle
        if (ball.y + ball.radius > paddle.y && ball.x > paddle.x && ball.x < paddle.x + paddle.width) {
            ball.dy = -ball.dy;
        }
        
        // Colisión con bricks
        bricks.forEach(brick => {
            if (brick.status === 1) {
                if (ball.x > brick.x && ball.x < brick.x + brick.width &&
                    ball.y > brick.y && ball.y < brick.y + brick.height) {
                    ball.dy = -ball.dy;
                    brick.status = 0;
                    gameScore += 10;
                    document.getElementById('gameScore').textContent = gameScore;
                }
            }
        });
        
        // Game over
        if (ball.y + ball.radius > 400) {
            gameRunning = false;
            alert(`¡Juego terminado! Puntuación: ${gameScore}`);
            initGame();
        }
        
        // Victoria
        if (bricks.every(brick => brick.status === 0)) {
            gameRunning = false;
            alert(`¡Ganaste! Puntuación final: ${gameScore}`);
            initGame();
        }
        
        drawGame();
        if (gameRunning) {
            requestAnimationFrame(updateGame);
        }
    };
    
    // Control del paddle
    let paddleLeft = false, paddleRight = false;
    
    document.addEventListener('keydown', (e) => {
        if (!gameRunning) return;
        if (e.key === 'ArrowLeft') paddleLeft = true;
        if (e.key === 'ArrowRight') paddleRight = true;
    });
    
    document.addEventListener('keyup', (e) => {
        if (e.key === 'ArrowLeft') paddleLeft = false;
        if (e.key === 'ArrowRight') paddleRight = false;
    });
    
    setInterval(() => {
        if (!gameRunning) return;
        if (paddleLeft && paddle.x > 0) paddle.x -= paddle.speed;
        if (paddleRight && paddle.x < 300 - paddle.width) paddle.x += paddle.speed;
    }, 1000 / 60);
    
    document.getElementById('gameStart').addEventListener('click', () => {
        if (gameRunning) return;
        gameRunning = true;
        document.getElementById('gameScore').textContent = '0';
        updateGame();
    });
    
    // ===================================================
    // FAQ BOT
    // ===================================================
    
    const faqData = {
        discord: {
            title: 'Discord',
            content: 'Únete a nuestro servidor de Discord para conectar con la comunidad. Encontrarás canales de anuncios, eventos, soporte y más. ¡No olvides activar todos los canales desde "Explorar Canales"!'
        },
        events: {
            title: 'Eventos',
            content: 'Dark Studio organiza eventos semanales como torneos, minijuegos y construcciones colaborativas. Mantente atento al canal #anuncios en Discord y a esta web para no perderte ninguno.'
        },
        rules: {
            title: 'Reglas',
            content: 'Respeta a todos los miembros, evita el spam, mantén contenido apropiado, usa los canales correctos, respeta la privacidad de otros y sigue las indicaciones del staff. El incumplimiento puede resultar en sanciones.'
        },
        launcher: {
            title: 'Dark Launcher',
            content: 'Descarga nuestro launcher oficial desde el canal #dark-launcher en Discord. Incluye todas las texturas, mods y configuraciones necesarias para jugar en nuestros eventos. Instalación sencilla y actualizaciones automáticas.'
        }
    };
    
    document.querySelectorAll('.faq-topic').forEach(topic => {
        topic.addEventListener('click', (e) => {
            const selected = e.currentTarget.dataset.topic;
            const data = faqData[selected];
            const response = document.getElementById('faqResponse');
            
            response.innerHTML = `
                <h4 style="color: #667eea; margin-top: 0;">${data.title}</h4>
                <p style="margin: 0;">${data.content}</p>
            `;
            response.classList.add('show');
        });
    });
    
    // ===================================================
    // SOPORTE EN VIVO
    // ===================================================
    
    const initSupport = () => {
        const userEmail = localStorage.getItem('userEmail');
        supportSessionId = Date.now() + '_' + userEmail;
        
        const messagesDiv = document.getElementById('supportMessages');
        messagesDiv.innerHTML = '<div class="support-message system">Conectando con el equipo de soporte...</div>';
        
        document.getElementById('supportStatusText').textContent = 'Esperando conexión...';
        document.getElementById('supportInput').disabled = false;
        document.getElementById('supportSend').disabled = false;
        document.getElementById('supportEnd').classList.remove('hidden');
        
        // Simular mensaje de bienvenida
        setTimeout(() => {
            addSupportMessage('system', '¡Hola! Un miembro del equipo estará contigo pronto. ¿En qué podemos ayudarte?');
            document.getElementById('supportStatusText').textContent = 'En espera';
            document.querySelector('.support-status').classList.add('waiting');
        }, 1500);
    };
    
    const addSupportMessage = (type, text) => {
        const messagesDiv = document.getElementById('supportMessages');
        const messageEl = document.createElement('div');
        messageEl.className = `support-message ${type}`;
        messageEl.textContent = text;
        messagesDiv.appendChild(messageEl);
        messagesDiv.scrollTop = messagesDiv.scrollHeight;
    };
    
    document.getElementById('supportSend').addEventListener('click', () => {
        const input = document.getElementById('supportInput');
        const message = input.value.trim();
        
        if (message) {
            addSupportMessage('user', message);
            input.value = '';
            
            // Aquí se enviaría al servidor real
            // Por ahora simulamos respuesta automática
            setTimeout(() => {
                addSupportMessage('system', 'Tu mensaje ha sido enviado. El equipo responderá pronto.');
            }, 500);
        }
    });
    
    document.getElementById('supportInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            document.getElementById('supportSend').click();
        }
    });
    
    document.getElementById('supportEnd').addEventListener('click', () => {
        showDarkflashSection('rating');
    });
    
    // ===================================================
    // CALIFICACIÓN
    // ===================================================
    
    document.querySelectorAll('.rating-stars i').forEach(star => {
        star.addEventListener('click', (e) => {
            selectedRating = parseInt(e.target.dataset.rating);
            
            document.querySelectorAll('.rating-stars i').forEach((s, idx) => {
                if (idx < selectedRating) {
                    s.classList.add('active');
                } else {
                    s.classList.remove('active');
                }
            });
            
            document.getElementById('ratingSubmit').disabled = false;
        });
    });
    
    document.getElementById('ratingSubmit').addEventListener('click', () => {
        const comment = document.getElementById('ratingComment').value.trim();
        
        // Aquí se enviaría al servidor
        console.log('Rating:', selectedRating, 'Comment:', comment);
        
        showToast(
            '✅ Gracias por tu feedback',
            'Tu calificación ha sido registrada.',
            'suggestion-success'
        );
        
        showDarkflashSection('menu');
        selectedRating = 0;
        document.getElementById('ratingComment').value = '';
        document.querySelectorAll('.rating-stars i').forEach(s => s.classList.remove('active'));
    });
    
    document.getElementById('ratingSkip').addEventListener('click', () => {
        showDarkflashSection('menu');
    });
    
    // ===================================================
    // 10. LÓGICA DE GUÍAS EXPANDIBLES
    // ===================================================
    
    const guideCards = document.querySelectorAll('.guide-card');
    
    guideCards.forEach(card => {
        const header = card.querySelector('.guide-header');
        const toggle = card.querySelector('.guide-toggle');
        
        header.addEventListener('click', () => {
            // Cerrar otras guías abiertas
            guideCards.forEach(otherCard => {
                if (otherCard !== card && otherCard.classList.contains('active')) {
                    otherCard.classList.remove('active');
                }
            });
            
            // Toggle la guía actual
            card.classList.toggle('active');
        });
    });
    
    // Lógica para secciones expandibles de canales
    const channelSectionToggles = document.querySelectorAll('.channel-section-toggle');
    
    channelSectionToggles.forEach(toggle => {
        toggle.addEventListener('click', () => {
            const section = toggle.parentElement;
            section.classList.toggle('active');
        });
    });
    
    // ===================================================
    // 11. INICIALIZACIÓN
    // ===================================================
    
    checkCookiePreference();
    checkUserSession();
    updateDarkflashButton(); // Inicializar DarkFlash
});
