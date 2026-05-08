/**
 * acá meto toda la lógica de World Wide News
 * manejo el menú, el scroll, los formularios y los indicadores
 */

document.addEventListener('DOMContentLoaded', () => {
    
    // defino las variables que voy a usar en todo el script
    const body = document.body;
    const header = document.querySelector('.header');
    const navbarCollapse = document.getElementById('navbarNav');
    const iconMenu = document.getElementById('iconMenu');
    const btnMenuMobile = document.getElementById('btnMenuMobile');
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('section[id]');

    // aca manejo la hamburguesa usando los eventos de bootstrap
    if (navbarCollapse) {
        navbarCollapse.addEventListener('show.bs.collapse', () => {
            // cambio el icono a una X cuando se abre
            if (iconMenu) iconMenu.classList.replace('bi-list', 'bi-x-lg');
            body.classList.add('menu-open');
        });

        navbarCollapse.addEventListener('hide.bs.collapse', () => {
            // vuelvo al icono de lista cuando se cierra
            if (iconMenu) iconMenu.classList.replace('bi-x-lg', 'bi-list');
            body.classList.remove('menu-open');
        });

        // hago que el menu se cierre solo cuando clickeo una seccion en mobile
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                if (window.innerWidth < 768) {
                    const bsCollapse = bootstrap.Collapse.getInstance(navbarCollapse);
                    if (bsCollapse) bsCollapse.hide();
                }
            });
        });
    }

    // aca manejo el scroll para que caiga justo donde empieza la seccion
    const handleSmoothScroll = (e) => {
        const link = e.currentTarget;
        const href = link.getAttribute('href');

        // me fijo si el link es para ir a una parte de la pagina
        if (href && (href.startsWith('#') || href.includes('index.html#'))) {
            const targetId = href.split('#')[1];
            const targetElement = document.getElementById(targetId);

            if (targetElement) {
                e.preventDefault();
                
                // calculo la altura del header pero me aseguro de que sea la altura "cerrada"
                // si el menu esta abierto, no quiero que esa altura me rompa el calculo
                let headerHeight = header ? header.offsetHeight : 0;
                
                // si el menu esta abierto (en mobile), le resto la altura del colapsable
                const isMenuOpen = navbarCollapse && navbarCollapse.classList.contains('show');
                if (isMenuOpen && window.innerWidth < 768) {
                    headerHeight -= navbarCollapse.offsetHeight;
                }

                // le saco el buffer o lo dejo muy chiquito para que no se pase
                const buffer = 5;
                const elementPosition = targetElement.getBoundingClientRect().top + window.scrollY;
                const offsetPosition = elementPosition - headerHeight - buffer;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });

                // cambio la url sin que se refresque la pagina
                history.pushState(null, null, `#${targetId}`);
            }
        }
    };

    // le aplico el scroll suave a todos los links que encuentre
    navLinks.forEach(link => {
        if (link.getAttribute('href').startsWith('#')) {
            link.addEventListener('click', handleSmoothScroll);
        }
    });

    // aca marco en el menu cual es la seccion que estoy viendo
    const observerOptions = {
        rootMargin: `-${header ? header.offsetHeight : 100}px 0px -60% 0px`,
        threshold: 0
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute('id');
                navLinks.forEach(link => {
                    link.classList.toggle('active', link.getAttribute('href') === '#' + id);
                });
            }
        });
    }, observerOptions);

    sections.forEach(seccion => observer.observe(seccion));

    // aca le pongo una sombra al header cuando bajo un poco
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // aca manejo todo lo del formulario de contacto
    const contactoForm = document.getElementById('contactoForm');
    if (contactoForm) {
        const asuntoSelect = document.getElementById('asunto');
        const dynamicContainer = document.getElementById('dynamicContainer');
        const dynamicLabel = document.getElementById('dynamicLabel');
        const dynamicSelect = document.getElementById('dynamicSelect');
        const fileContainer = document.getElementById('fileContainer');
        const fileInput = document.getElementById('archivo');
        const btnRemoveFile = document.getElementById('btnRemoveFile');

        // estas son las opciones que van cambiando segun el asunto
        const opcionesDinamicas = {
            publicidad: {
                label: "Seleccioná el tipo de propuesta",
                options: ["Banner en portada", "Nota patrocinada", "Publicidad lateral", "Campaña semanal", "Colaboración comercial"]
            },
            tip: {
                label: "¿Qué tipo de noticia desea compartir?",
                options: ["Política", "Deportes", "Tecnología", "Economía", "Espectáculos", "Suceso local", "Evento importante"]
            },
            correccion: {
                label: "¿Qué desea corregir?",
                options: ["Error ortográfico", "Información incorrecta", "Fecha equivocada", "Imagen incorrecta", "Link roto", "Autor incorrecto"]
            },
            consulta: {
                label: "¿Sobre qué tema es la consulta?",
                options: ["Suscripciones", "Cuenta de usuario", "Contacto comercial", "Problemas técnicos", "Navegación del sitio", "Información institucional"]
            }
        };

        // cada vez que eligen un asunto les cambio las opciones de abajo
        asuntoSelect.addEventListener('change', (e) => {
            const categoria = e.target.value;
            const data = opcionesDinamicas[categoria];

            if (data) {
                dynamicLabel.textContent = data.label;
                dynamicSelect.innerHTML = '<option value="" disabled selected>Seleccioná una opción</option>';
                data.options.forEach(opt => {
                    const el = document.createElement('option');
                    el.value = opt.toLowerCase().replace(/\s+/g, '-');
                    el.textContent = opt;
                    dynamicSelect.appendChild(el);
                });

                dynamicContainer.classList.remove('d-none');
                fileContainer.classList.remove('d-none');
            }
        });

        // manejo cuando suben un archivo
        if (fileInput) {
            fileInput.addEventListener('change', function() {
                if (this.files && this.files.length > 0) {
                    btnRemoveFile.classList.remove('d-none');
                } else {
                    btnRemoveFile.classList.add('d-none');
                }
            });
        }

        // boton para borrar el archivo que subieron
        if (btnRemoveFile) {
            btnRemoveFile.addEventListener('click', () => {
                fileInput.value = "";
                btnRemoveFile.classList.add('d-none');
            });
        }

        // aca valido que los datos esten bien antes de mandar
        contactoForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const fields = {
                nombre: { val: document.getElementById('nombre').value.trim(), errorId: 'errorNombre' },
                email: { val: document.getElementById('email').value.trim(), errorId: 'errorEmail' },
                asunto: { val: asuntoSelect.value, errorId: 'errorAsunto' },
                subAsunto: { val: dynamicSelect.value, errorId: 'errorDynamic' }
            };

            // limpio todos los cartelitos de error
            Object.values(fields).forEach(f => {
                const el = document.getElementById(f.errorId);
                if (el) { el.textContent = ''; el.style.display = 'none'; }
            });

            let hasErrors = false;

            // valido que el nombre sea real y no cualquier cosa
            const nombreVal = fields.nombre.val;
            
            // esta funcion detecta si estan poniendo letras al azar tipo "aaaa"
            const esTextoInvalido = (str) => {
                const s = str.toLowerCase().replace(/\s+/g, '');
                if (s.length < 3) return true;
                
                // si repite mas de 3 veces la misma letra
                if (/(.)\1\1/.test(s)) return true; 
                
                // palabras tipicas de teclado
                const patterns = ['asdf', 'qwerty', 'zxcv', 'jkl', 'abcd', '123'];
                if (patterns.some(p => s.includes(p))) return true;
                
                // me fijo que tenga vocales
                const vowels = s.match(/[aeiouáéíóú]/g);
                if (!vowels || vowels.length < 1) return true;
                if (s.length > 4 && vowels.length < 2) return true;

                // repeticion de silabas raras
                if (s.length >= 6) {
                    const chunk2 = s.substring(0, 2);
                    const chunk3 = s.substring(0, 3);
                    if (s.split(chunk2).length > 3 || s.split(chunk3).length > 2) return true;
                }

                return false;
            };

            if (nombreVal.length < 3) {
                showError('errorNombre', 'El nombre es demasiado corto.');
                hasErrors = true;
            } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(nombreVal)) {
                showError('errorNombre', 'Solo se permiten letras y espacios.');
                hasErrors = true;
            } else if (esTextoInvalido(nombreVal)) {
                showError('errorNombre', 'Por favor, ingresá un nombre real válido.');
                hasErrors = true;
            }

            // valido el email
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email.val)) {
                showError('errorEmail', 'Ingresá un email válido.');
                hasErrors = true;
            }

            // valido que hayan elegido las opciones de los dropdowns
            if (!fields.asunto.val) { showError('errorAsunto', 'Seleccioná un asunto.'); hasErrors = true; }
            if (fields.asunto.val && !fields.subAsunto.val) { showError('errorDynamic', 'Seleccioná una opción.'); hasErrors = true; }

            if (hasErrors) return;

            // si esta todo ok limpio el formulario y aviso que se mando
            contactoForm.reset();
            dynamicContainer.classList.add('d-none');
            fileContainer.classList.add('d-none');
            btnRemoveFile.classList.add('d-none');
            
            const successMsg = document.getElementById('successMsg');
            if (successMsg) {
                successMsg.classList.remove('d-none');
                setTimeout(() => successMsg.classList.add('d-none'), 6000);
            }
        });
    }

    // funcion simple para mostrar errores abajo de los campos
    function showError(id, msg) {
        const el = document.getElementById(id);
        if (el) {
            el.textContent = msg;
            el.style.display = 'block';
        }
    }

    // boton para subir rapido
    const btnScrollTop = document.getElementById('btnScrollTop');
    if (btnScrollTop) {
        window.addEventListener('scroll', () => {
            btnScrollTop.classList.toggle('show', window.scrollY > 400);
        });

        btnScrollTop.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // traigo los precios del dolar en vivo
    async function cargarIndicadores() {
        const contenedor = document.getElementById('economicos-data');
        if (!contenedor) return;
        try {
            const response = await fetch('https://dolarapi.com/v1/dolares');
            if (!response.ok) throw new Error('API Error');
            const data = await response.json();
            
            const oficial = data.find(d => d.casa === 'oficial');
            const blue = data.find(d => d.casa === 'blue');
            const bolsa = data.find(d => d.casa === 'bolsa');

            if (oficial && blue) {
                contenedor.innerHTML = `
                    USD Oficial: $${oficial.compra} | 
                    Blue: $${blue.compra} | 
                    Bolsa: $${bolsa ? bolsa.compra : 'N/D'}
                `;
            }
        } catch (error) {
            contenedor.innerHTML = 'Dólar no disponible';
        }
    }
    cargarIndicadores();

    // aca roto las noticias del ahora para que se muevan solas
    const tickerText = document.getElementById('ticker-text');
    if (tickerText) {
        const noticiasTicker = [
            "Tensión energética: Irán pone en la mira refinerías clave.",
            "EE.UU. niega envío de tropas en medio de la crisis.",
            "Avanza el 'London Eye' porteño en Puerto Madero.",
            "Mercados expectantes: Sube el dólar blue en la apertura.",
            "Nueva cumbre climática: Líderes mundiales se reúnen en París."
        ];
        let noticiaActual = 0;
        tickerText.textContent = noticiasTicker[0];

        setInterval(() => {
            // saco la noticia vieja con efecto
            tickerText.classList.remove('fade-in');
            tickerText.classList.add('fade-out');
            
            setTimeout(() => {
                noticiaActual = (noticiaActual + 1) % noticiasTicker.length;
                tickerText.textContent = noticiasTicker[noticiaActual];
                
                // pongo la noticia nueva con efecto
                tickerText.classList.remove('fade-out');
                tickerText.classList.add('fade-in');
            }, 600); 
        }, 6000); 
    }

    // aca me fijo si la pagina cargo con un # en la url para scrollear bien de entrada
    if (window.location.hash) {
        setTimeout(() => {
            const target = document.getElementById(window.location.hash.substring(1));
            if (target) {
                const headerHeight = header ? header.offsetHeight : 130;
                window.scrollTo({
                    top: target.getBoundingClientRect().top + window.scrollY - headerHeight - 10,
                    behavior: 'smooth'
                });
            }
        }, 500); // espero un poquito a que cargue todo el layout
    }
});
