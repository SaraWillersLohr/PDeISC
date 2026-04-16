export function getMenu() {
  return `
        <nav class="navbar navbar-expand-lg navbar-dark bg-dark sticky-top shadow-lg py-3">
            <div class="container">
                <a class="navbar-brand d-flex align-items-center" href="/">
                    <span class="fs-4 fw-bold ls-1 text-primary">PORTFOLIO</span>
                    <span class="ms-2 badge bg-primary small">NJS2</span>
                </a>
                <button class="navbar-toggler border-0" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                    <span class="navbar-toggler-icon"></span>
                </button>
                <div class="collapse navbar-collapse" id="navbarNav">
                    <ul class="navbar-nav ms-auto fw-semibold">
                        <li class="nav-item"><a class="nav-link px-3" href="/">Inicio</a></li>
                        <li class="nav-item"><a class="nav-link px-3" href="/ej1">Ejercicio 1</a></li>
                        <li class="nav-item"><a class="nav-link px-3" href="/ej2">Ejercicio 2</a></li>
                        <li class="nav-item"><a class="nav-link px-3" href="/ej3">Ejercicio 3</a></li>
                        <li class="nav-item"><a class="nav-link px-3" href="/ej4">Ejercicio 4</a></li>
                        <li class="nav-item"><a class="nav-link px-3" href="/acerca">Acerca de</a></li>
                    </ul>
                </div>
            </div>
        </nav>
    `;
}
