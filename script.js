document.addEventListener('DOMContentLoaded', () => {
    
    // ===================================================
    // 1. GESTIÓN DEL PRELOADER (Ajustado para forzar los 3 segundos)
    // ===================================================

    const preloader = document.getElementById('preloader');
    const mainContent = document.getElementById('mainContent');
    const progressBar = document.getElementById('progressBar');
    const loadingText = document.querySelector('.loading-text');

    const MIN_LOAD_TIME = 3000; // Mínimo 3 segundos (será configurable)
    const INTERVAL_MS = 50;     // Intervalo de actualización de la barra
    let isLoaded = false;
    let progress = 0;
    
    // Obtener tiempo de carga configurado por el usuario (si está logueado)
    const getUserLoadTime = () => {
        const savedTime = localStorage.getItem('userLoadTime');
        return savedTime ? parseInt(savedTime) * 1000 : 3000; // Por defecto 3 segundos
    };
    
    const loadTime = getUserLoadTime();

    // Simulación de progreso de carga (hasta el 90%)
    const progressInterval = setInterval(() => {
        if (progress < 90) {
            progress += 1; 
            progressBar.style.width = progress + '%';
            loadingText.textContent = `Cargando... ${Math.floor(progress)}%`;
        }
    }, INTERVAL_MS);

    // Función que se llama cuando el tiempo mínimo ha pasado
    const finishLoading = () => {
        if (isLoaded) return; // Evitar llamadas dobles

        isLoaded = true;
        clearInterval(progressInterval);
        
        // Completar la barra de progreso
        progressBar.style.width = '100%';
        loadingText.textContent = `Carga completa.`;

        // Ocultar preloader con fade-out
        setTimeout(() => {
            preloader.classList.add('fade-out');
            
            preloader.addEventListener('transitionend', () => {
                preloader.classList.add('hidden');
                mainContent.classList.remove('hidden');
                
                // Muestra la sección HOME después de la carga
                showSection('home-content');
                
            }, { once: true });
            
        }, 500); // 0.5s de pausa final
    };

    // Forzar el tiempo configurado por el usuario
    setTimeout(() => {
        finishLoading();
    }, loadTime);


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

    // Función principal para mostrar/ocultar secciones de nivel superior
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
        
        // CORRECCIÓN CLAVE: Asegurar que el article-view siempre se oculte, 
        // a menos que sea la sección de article-view (lo cual solo pasa al hacer clic en un artículo)
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
    
    // Manejar la apertura/cierre del Sidebar
    menuToggle.addEventListener('click', () => {
        sidebar.classList.add('show');
        sidebar.classList.remove('hidden-sidebar');
    });

    closeSidebar.addEventListener('click', closeSidebarPanel);
    
    // Clic en el logo para ir al Home
    serverLogo.addEventListener('click', () => {
        showSection('home-content');
        closeSidebarPanel();
    });

    // Manejar la navegación por enlaces
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const href = e.currentTarget.getAttribute('href');
            const targetId = (href === '#home') ? 'home-content' : href.substring(1) + '-content';
            
            showSection(targetId);
            
            // Cerrar sidebar tras navegar
            closeSidebarPanel();
        });
    });

    // ===================================================
    // FUNCIÓN AUXILIAR: Convertir markdown a HTML
    // ===================================================
    const convertMarkdownToHTML = (text) => {
        // Primero convertir **texto** a <strong>texto</strong> (negrilla)
        text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        // Luego convertir *texto* a <em>texto</em> (cursiva/itálica)
        text = text.replace(/\*(.*?)\*/g, '<em>$1</em>');
        return text;
    };

    // ===================================================
    // 3. LÓGICA DEL BLOG Y VISTA DE ARTÍCULO (CORREGIDA)
    // ===================================================

    const blogGridContainer = document.getElementById('blogGridContainer');
    const blogCardTemplate = document.getElementById('blogCardTemplate');

    const loadBlogArticles = () => {
        if (typeof articles !== 'undefined' && blogGridContainer && blogCardTemplate) {
            blogGridContainer.innerHTML = ''; 
            
            let sortedArticles = [...articles];
            
            // Lógica de ordenamiento: Los 'isPinned: true' van primero
            sortedArticles.sort((a, b) => {
                if (a.isPinned && !b.isPinned) return -1;
                if (!a.isPinned && b.isPinned) return 1;
                return 0; 
            });


            sortedArticles.forEach(article => {
                const clone = blogCardTemplate.content.cloneNode(true);
                const card = clone.querySelector('.blog-card');
                
                card.dataset.articleId = article.id;
                
                // Si está fijado, añadir un icono visual
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

                // Evento de clic para mostrar el artículo completo
                card.addEventListener('click', (e) => {
                    // Evitar que el clic en el botón de guardar active el artículo
                    if (!e.target.closest('.fa-bookmark')) {
                        displayArticle(article);
                    }
                });

                // Configurar el botón de guardado
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
    
    // Sistema de notificaciones toast
    const showToast = (title, message, isRemove = false) => {
        const toastContainer = document.getElementById('toastContainer');
        
        const toast = document.createElement('div');
        toast.className = `toast ${isRemove ? 'toast-remove' : ''}`;
        
        const icon = isRemove ? 'fa-bookmark-slash' : 'fa-bookmark';
        
        toast.innerHTML = `
            <i class="fas ${icon} toast-icon"></i>
            <div class="toast-content">
                <p class="toast-title">${title}</p>
                <p class="toast-message">${message}</p>
            </div>
            <button class="toast-close" aria-label="Cerrar">×</button>
        `;
        
        toastContainer.appendChild(toast);
        
        // Mostrar con animación
        setTimeout(() => {
            toast.classList.add('show');
        }, 10);
        
        // Configurar botón de cerrar
        const closeButton = toast.querySelector('.toast-close');
        closeButton.addEventListener('click', () => {
            removeToast(toast);
        });
        
        // Auto-ocultar después de 4 segundos
        setTimeout(() => {
            removeToast(toast);
        }, 4000);
    };
    
    const removeToast = (toast) => {
        toast.classList.remove('show');
        toast.classList.add('hide');
        
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
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
            alert('Debes iniciar sesión para guardar artículos');
            return;
        }
        
        let savedArticles = getSavedArticles();
        
        // Buscar el título del artículo para mostrarlo en la notificación
        const article = articles.find(a => a.id === articleId);
        const articleTitle = article ? article.title : 'Artículo';
        
        if (savedArticles.includes(articleId)) {
            // Quitar de guardados
            savedArticles = savedArticles.filter(id => id !== articleId);
            iconElement.classList.remove('saved');
            iconElement.title = 'Guardar para después';
            
            // Mostrar notificación de eliminación
            showToast(
                '📋 Artículo eliminado',
                `"${articleTitle}" fue removido de tus guardados.`,
                true
            );
        } else {
            // Agregar a guardados
            savedArticles.push(articleId);
            iconElement.classList.add('saved');
            iconElement.title = 'Guardado - Clic para quitar';
            
            // Mostrar notificación de guardado
            showToast(
                '✨ Artículo guardado',
                `"${articleTitle}" está ahora en tus favoritos.`,
                false
            );
        }
        
        setSavedArticles(savedArticles);
    };
    
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
        
        // Filtrar los artículos guardados
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

            // Evento de clic para mostrar el artículo completo
            card.addEventListener('click', (e) => {
                if (!e.target.closest('.fa-bookmark')) {
                    displayArticle(article);
                }
            });

            // Configurar el botón de guardado (siempre estará marcado aquí)
            const bookmarkIcon = clone.querySelector('.fa-bookmark');
            bookmarkIcon.classList.add('saved');
            bookmarkIcon.title = 'Guardado - Clic para quitar';
            
            bookmarkIcon.addEventListener('click', (e) => {
                e.stopPropagation();
                toggleSaveArticle(article.id, bookmarkIcon);
                // Recargar la lista después de quitar
                setTimeout(() => loadSavedArticles(), 100);
            });

            savedArticlesContainer.appendChild(clone);
        });
    };

    // Función para mostrar el contenido de un artículo
    const displayArticle = (article) => {
        document.getElementById('article-title').textContent = article.title;
        document.getElementById('article-subtitle').textContent = article.subtitle;
        
        // CORRECCIÓN: Convertir markdown a HTML antes de mostrar
        const contentWithFormatting = convertMarkdownToHTML(article.content);
        document.getElementById('article-body').innerHTML = contentWithFormatting;
        
        // Transición: Ocultar Blog y mostrar Artículo (Mutuamente excluyente)
        blogContent.classList.remove('show-content');
        blogContent.classList.add('hidden-content'); 

        articleView.classList.remove('hidden-content');
        articleView.classList.add('show-content');
        
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Botón de regresar del artículo
    backToBlogButton.addEventListener('click', () => {
        // Transición: Ocultar Artículo y mostrar Blog (Mutuamente excluyente)
        articleView.classList.remove('show-content');
        articleView.classList.add('hidden-content');

        blogContent.classList.remove('hidden-content');
        blogContent.classList.add('show-content');
        
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    
    // Cargar los artículos al inicio
    loadBlogArticles(); 

    // ===================================================
    // 4. LÓGICA DE SUGERENCIAS (Requiere Login)
    // ===================================================

    const suggestionForm = document.getElementById('suggestionForm');
    const suggestionInput = document.getElementById('suggestionInput');
    const suggestionButton = suggestionForm.querySelector('.suggestion-button');
    const suggestionMessage = document.getElementById('suggestionMessage');
    const loginRequiredMessage = document.getElementById('loginRequiredMessage');

    suggestionForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        if (!suggestionInput.value.trim() || suggestionInput.value.length < 10) {
            suggestionMessage.textContent = "Error: La sugerencia debe tener al menos 10 caracteres.";
            suggestionMessage.style.color = '#e74c3c';
            return;
        }

        const userEmail = localStorage.getItem('userEmail');
        const suggestionText = suggestionInput.value.trim();
        
        // Deshabilitar el botón mientras se envía
        suggestionButton.disabled = true;
        suggestionButton.textContent = 'Enviando...';
        
        try {
            // IMPORTANTE: Cambia esta URL por tu URL de Railway
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
                suggestionMessage.textContent = `¡Sugerencia enviada! Gracias, ${userEmail || 'Usuario'}. La revisaremos pronto.`;
                suggestionMessage.style.color = '#2ecc71';
                suggestionInput.value = ''; 
            } else {
                suggestionMessage.textContent = `Error: ${data.message}`;
                suggestionMessage.style.color = '#e74c3c';
            }
            
        } catch (error) {
            console.error('Error al enviar sugerencia:', error);
            suggestionMessage.textContent = 'Error de conexión. Intenta nuevamente.';
            suggestionMessage.style.color = '#e74c3c';
        } finally {
            // Rehabilitar el botón
            suggestionButton.disabled = false;
            suggestionButton.textContent = 'Solicitar Artículo';
            
            setTimeout(() => {
                suggestionMessage.textContent = '';
            }, 5000);
        }
    });
    
    // Función para actualizar el estado del formulario de sugerencias
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

    // Muestra/Oculta el menú desplegable del perfil
    userProfileContainer.addEventListener('click', (e) => {
        e.stopPropagation(); 
        dropdownMenu.classList.toggle('hidden');
    });

    // Cierra el menú cuando se hace clic fuera
    document.addEventListener('click', (e) => {
        if (!userProfileContainer.contains(e.target) && !dropdownMenu.contains(e.target)) {
            dropdownMenu.classList.add('hidden');
        }
    });

    // Lógica para cerrar sesión (Google y Local Storage)
    signOutButton.addEventListener('click', () => {
        if (typeof google !== 'undefined' && google.accounts.id) {
            google.accounts.id.disableAutoSelect(); 
        }

        // Nota: NO borramos savedArticles al cerrar sesión, se mantienen por usuario
        localStorage.removeItem('userName');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('userPicture');
        localStorage.removeItem('userLoadTime'); // Limpiar configuración

        updateAuthUI(false);
    });
    
    // Abrir modal de configuración
    settingsButton.addEventListener('click', () => {
        openSettingsModal();
        dropdownMenu.classList.add('hidden'); // Cerrar dropdown
    });
    
    // Abrir sección de artículos guardados
    savedArticlesButton.addEventListener('click', () => {
        showSection('saved-articles-content');
        loadSavedArticles();
        dropdownMenu.classList.add('hidden'); // Cerrar dropdown
        closeSidebarPanel();
    });


    // Función global llamada por el SDK de Google
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

    // Función para actualizar la Interfaz de Usuario de Autenticación
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
    };

    // Verificar el estado de la sesión al cargar la página
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

    // 6.1. Funciones de Cookies
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

    // 6.2. Funciones del Modal
    const openModal = () => {
        termsModal.classList.remove('hidden-modal');
        termsScrollArea.scrollTop = 0;
        acceptTermsFinalButton.disabled = true;
    };

    const closeModal = () => {
        termsModal.classList.add('hidden-modal');
    };

    const checkScroll = () => {
        // Habilita el botón solo cuando se ha llegado al final del scroll
        const isScrolledToBottom = termsScrollArea.scrollTop + termsScrollArea.clientHeight >= termsScrollArea.scrollHeight - 20; 
        acceptTermsFinalButton.disabled = !isScrolledToBottom;
    };

    // 6.3. Eventos de Cookies y Modal
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
        
        // Cargar el valor guardado
        const savedTime = localStorage.getItem('userLoadTime') || '3';
        loadTimeSlider.value = savedTime;
        loadTimeValue.textContent = savedTime;
    };
    
    const closeSettingsModalFunc = () => {
        settingsModal.classList.add('hidden-modal');
    };
    
    // Actualizar valor mostrado al mover el slider
    loadTimeSlider.addEventListener('input', (e) => {
        loadTimeValue.textContent = e.target.value;
    });
    
    // Guardar configuración
    saveSettings.addEventListener('click', () => {
        const selectedTime = loadTimeSlider.value;
        localStorage.setItem('userLoadTime', selectedTime);
        
        // Mostrar mensaje de éxito
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
    // 8. INICIALIZACIÓN
    // ===================================================
    
    checkCookiePreference();
    checkUserSession(); 
});
