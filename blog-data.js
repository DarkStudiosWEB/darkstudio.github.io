/**
 * blog-data.js
 * * Este archivo contiene la estructura de datos para todos los artículos del blog.
 * Para añadir un nuevo artículo, simplemente agrega un nuevo objeto a este array.
 * * PROPIEDADES NUEVAS:
 * - isPinned: true si el artículo debe aparecer primero en la lista (fijado).
 * * * CONVENCIONES DE FORMATO:
 * - Para poner texto en negrita dentro del 'content', usa **Texto**.
 * - El 'content' acepta etiquetas HTML básicas como <h2>, <p>, <ul> y <li>.
 */

const articles = [
    {
        id: 'studio-mission',
        icon: '🚀',
        title: 'Dark Studios: ¿Qué somos? y ¿Qué hacemos?',
        subtitle: 'Conoce en que nos especializamos y el alcance de nuestra comunidad creativa.',
        isPinned: true, // ESTE ARTÍCULO ESTARÁ FIJADO ARRIBA
        description: 'Dark Studios es un colectivo especializado en llevar las experiencias del videojuego de minecraft a nuevas espectativas. Fusionamos programación de vanguardia, un buen diseño y una comunidad activa para crear eventos memorables...',
        content: `
            <h2>¿Qué es Dark Studios y cuál es su Misión?</h2>
            <p>Dark Studios no es simplemente una comunidad; es un creador de **nuevas experiencias** donde la creatividad y la innovación no fallan. Nuestra misión principal es llevar las ideas de nuestros eventos al límite, creando contenidos interactivos y que cautivan a nuestros usuarios.</p>
            
            <h2>Especialización</h2>
            <p>Nos especializamos en el desarrollo de eventos para **Minecraft Java Edition**. Nuestro sello distintivo es la calidad, lograda a través de una programación avanzada que garantiza funcionalidad impecable y el desarrollo de mapas espectaculares y altamente detallados, diseñados para optimizar la inmersión del jugador.</p>
            
            <h2>Nuestra Comunidad Activa</h2>
            <p>Contamos con una comunidad vibrante y comprometida, con eventos programados todas las semanas. Esta actividad constante incluye tanto repeticiones de eventos exitosos adquiridos, como lanzamientos originales diseñados y desarrollados íntegramente por nuestro equipo.</p>
        `
    },
    {
        id: 'event-types',
        icon: '🗓️',
        title: 'Tipos de Eventos: La Innovación en Dark Studios',
        subtitle: 'Descubre las modalidades de juego que ofrecemos y nuestros proyectos destacados.',
        isPinned: true,
        description: 'En Dark Studios, la variedad es clave. Creamos eventos innovadores para Minecraft Java, enfocados en experiencias inmersivas, destacando actualmente nuestro proyecto principal: Dark Games...',
        content: `
            <h2>¿Qué Tipos de Eventos Ofrecemos como Dark Studios?</h2>
            <p>Nuestra programación semanal está diseñada para mantener a nuestra comunidad siempre activa y comprometida. Los eventos en Dark Studios se centran en ofrecer experiencias divertidas y altamente pulidas con la creación de **Eventos Varios**, exclusivas para Minecraft Java.</p>
            
            <h2>Proyectos Principales y Enfoque</h2>
            <p>Nuestro proyecto principal actual es **Dark Games**, una recreación altamente innovadora del concepto *Squid Game* dentro de Minecraft. Este proyecto no solo incluye los minijuegos clásicos, sino también mecánicas innovadoras y personalizadas. Además, la comunidad disfruta de juegos temáticos de la serie *SquidCraftGame* (SCG3 o SCG4), que aportan variedad y frescura.</p>
            
            <h2>Variedad Semanal</h2>
            <p>Complementamos esto con una rotación de eventos semanales que pueden incluir:</p>
            <ul>
                <li>Eventos de **Aventura** Inmersivos.</li>
                <li>Batallas de **Creación** y Retos de Construcción.</li>
                <li>Retos de **Supervivencia** Únicos.</li>
                <li>Diversion y Variedad de **Minijuegos** Entretenidos.</li>
                <li>Repetición de eventos comprados que han sido optimizados por nuestro equipo o de eventos propios.</li>
            </ul>
        `
    },
    {
        id: 'prueba',
        icon: '🗓️',
        title: 'Prueba-añadir',
        subtitle: 'Descubre las modalidades de juego que ofrecemos y nuestros proyectos destacados.',
        isPinned: false,
        description: 'En Dark Studios, la variedad es clave. Creamos eventos innovadores para Minecraft Java, enfocados en experiencias inmersivas, destacando actualmente nuestro proyecto principal: Dark Games...',
        content: `
            <h2>¿Qué Tipos de Eventos Ofrecemos como Dark Studios?</h2>
            <p>Nuestra programación semanal está diseñada para mantener a nuestra comunidad siempre activa y comprometida. Los eventos en Dark Studios se centran en ofrecer experiencias divertidas y altamente pulidas con la creación de **Eventos Varios**, exclusivas para Minecraft Java.</p>
            
            <h2>Proyectos Principales y Enfoque</h2>
            <p>Nuestro proyecto principal actual es **Dark Games**, una recreación altamente innovadora del concepto *Squid Game* dentro de Minecraft. Este proyecto no solo incluye los minijuegos clásicos, sino también mecánicas innovadoras y personalizadas. Además, la comunidad disfruta de juegos temáticos de la serie *SquidCraftGame* (SCG3 o SCG4), que aportan variedad y frescura.</p>
            
            <h2>Variedad Semanal</h2>
            <p>Complementamos esto con una rotación de eventos semanales que pueden incluir:</p>
            <ul>
                <li>Eventos de **Aventura** Inmersivos.</li>
                <li>Batallas de **Creación** y Retos de Construcción.</li>
                <li>Retos de **Supervivencia** Únicos.</li>
                <li>Diversion y Variedad de **Minijuegos** Entretenidos.</li>
                <li>Repetición de eventos comprados que han sido optimizados por nuestro equipo o de eventos propios.</li>
            </ul>
        `
    },
    {
        id: 'support-channels',
        icon: '📞',
        title: 'Soporte Directo: Nuestros Canales de Atención al Usuario',
        subtitle: 'Conoce los medios oficiales para obtener ayuda, reportar problemas o hacer sugerencias.',
        isPinned: true,
        description: 'Ofrecemos varios canales de soporte, incluyendo el sistema de tickets de Discord, correo electrónico especializado para reportes y foros de comunidad para preguntas generales...',
        content: `
            <h2>Cómo Contactar a Nuestro Equipo</h2>
            <p>Para asegurar una respuesta rápida y organizada, ofrecemos diferentes canales según el tipo de necesidad:</p>
            
            <h2>Canales de Soporte Primarios</h2>
            <p>El medio más eficiente para la asistencia directa y reportes es nuestro sistema de tickets en **Discord**. Asegurandote de que al momento de que abras el ticket, describas tu solicitud y esperes pacientemente la ayuda con:</p>
            <ul>
                <li>**Asistencia Técnica:** Problemas con el launcher o conexión.</li>
                <li>**Reportes de Jugadores:** Detección de conductas inapropiadas.</li>
                <li>**Soporte General:** Dudas sobre el servidor o la comunidad.</li>
            </ul>
            
            <h2>Otros Medios Oficiales</h2>
            <p>También puedes usar:</p>
            <ul>
                <li>**Correo Electrónico:** Para diferentes temas de ayuda, patrocinios, o recomendaciones, pero principalmente recomendamos **Discord**.</li>
                <li>**Canal de Dudas-Publicas en DISCORD:** Para preguntas generales y discusiones abiertas con otros miembros.</li>
                <li>**Canal de Sugerencias en DISCORD:** Para recomendaciones que quieras o veas necesarias que se implementen.</li>
            </ul>
        `
    }
];


