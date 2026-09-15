const params = new URLSearchParams(window.location.search);

const codigo = params.get("code");
const nombreParam = params.get("name");

const nombre = nombreParam || "Territorio";


const territoryName =
    document.getElementById("territoryName");

const breadcrumbTerritory =
    document.getElementById("breadcrumbTerritory");

const territoryLevel =
    document.getElementById("territoryLevel");


function crearUrl(pagina) {
    return `${pagina}?code=${encodeURIComponent(codigo || "")}&name=${encodeURIComponent(nombre)}`;
}


function limpiarTexto(valor) {

    if (
        valor === undefined ||
        valor === null ||
        String(valor).trim() === ""
    ) {
        return "—";
    }

    return String(valor).trim();
}


function mostrarPaginaVacia() {

    const emptyState =
        document.getElementById("emptyState");

    const institutionContent =
        document.getElementById("institutionContent");

    if (emptyState) {
        emptyState.style.display = "block";
    }

    if (institutionContent) {
        institutionContent.style.display = "none";
    }
}


function mostrarContenido() {

    const emptyState =
        document.getElementById("emptyState");

    const institutionContent =
        document.getElementById("institutionContent");

    if (emptyState) {
        emptyState.style.display = "none";
    }

    if (institutionContent) {
        institutionContent.style.display = "block";
    }
}


if (territoryName) {
    territoryName.textContent = nombre;
}

if (breadcrumbTerritory) {
    breadcrumbTerritory.textContent = nombre;
}

if (territoryLevel) {
    territoryLevel.textContent = codigo
        ? "MUNICIPIO"
        : "INSTITUCIONES";
}


document.title =
    `${nombre} | Instituciones | Retorika`;


const summaryLink =
    document.getElementById("summaryLink");

const demographyLink =
    document.getElementById("demographyLink");

const economyLink =
    document.getElementById("economyLink");

const electionsLink =
    document.getElementById("electionsLink");

const institutionsSidebarLink =
    document.getElementById("institutionsSidebarLink");

const compareLink =
    document.getElementById("compareLink");

const reportsLink =
    document.getElementById("reportsLink");


if (summaryLink) {
    summaryLink.href =
        crearUrl("territorio.html");
}

if (demographyLink) {
    demographyLink.href =
        `${crearUrl("territorio.html")}#demografia`;
}

if (economyLink) {
    economyLink.href =
        crearUrl("economia.html");
}

if (electionsLink) {
    electionsLink.href =
        crearUrl("elecciones.html");
}

if (institutionsSidebarLink) {
    institutionsSidebarLink.href =
        crearUrl("instituciones.html");
}

if (compareLink) {
    compareLink.href =
        crearUrl("comparar.html");
}

if (reportsLink) {
    reportsLink.href =
        crearUrl("informes.html");
}


const summaryTab =
    document.getElementById("summaryTab");

const demographyTab =
    document.getElementById("demographyTab");

const economyTab =
    document.getElementById("economyTab");

const electionsTab =
    document.getElementById("electionsTab");


if (summaryTab) {
    summaryTab.href =
        crearUrl("territorio.html");
}

if (demographyTab) {
    demographyTab.href =
        `${crearUrl("territorio.html")}#demografia`;
}

if (economyTab) {
    economyTab.href =
        crearUrl("economia.html");
}

if (electionsTab) {
    electionsTab.href =
        crearUrl("elecciones.html");
}


async function cargarInstituciones() {

    if (!codigo) {
        mostrarPaginaVacia();
        return;
    }


    try {

        const [
            institucionesData,
            ayuntamientosData,
            entidadesData
        ] = await Promise.all([

            fetch("../data/instituciones.json")
                .then(response => response.json()),

            fetch("../data/ayuntamientos.json")
                .then(response => response.json()),

            fetch("../data/entidades_locales.json")
                .then(response => response.json())

        ]);


        const instituciones =
            institucionesData[codigo];

        const ayuntamiento =
            ayuntamientosData[codigo];

        const entidades =
            entidadesData.porMunicipio &&
            entidadesData.porMunicipio[codigo]
                ? entidadesData.porMunicipio[codigo]
                : [];


        if (!instituciones) {
            mostrarPaginaVacia();
            return;
        }


        mostrarContenido();


        const alcalde =
            instituciones.alcalde || null;

        const representantes =
            Array.isArray(instituciones.representantes)
                ? instituciones.representantes
                : [];


        const partidos =
            new Set(
                representantes
                    .map(representante =>
                        limpiarTexto(representante.partido)
                    )
                    .filter(partido => partido !== "—")
            );


        const mayorName =
            document.getElementById("mayorName");

        const mayorParty =
            document.getElementById("mayorParty");

        const mayorFullName =
            document.getElementById("mayorFullName");

        const mayorFullParty =
            document.getElementById("mayorFullParty");

        const mayorDate =
            document.getElementById("mayorDate");


        const representativeCount =
            document.getElementById("representativeCount");

        const partyCount =
            document.getElementById("partyCount");

        const entityCount =
            document.getElementById("entityCount");


        const townHallAddress =
            document.getElementById("townHallAddress");

        const townHallPhone =
            document.getElementById("townHallPhone");

        const townHallEmail =
            document.getElementById("townHallEmail");

        const townHallWeb =
            document.getElementById("townHallWeb");


        if (mayorName) {
            mayorName.textContent =
                alcalde
                    ? limpiarTexto(alcalde.nombre)
                    : "No disponible";
        }


        if (mayorParty) {
            mayorParty.textContent =
                alcalde
                    ? limpiarTexto(alcalde.partido)
                    : "—";
        }


        if (mayorFullName) {
            mayorFullName.textContent =
                alcalde
                    ? limpiarTexto(alcalde.nombre)
                    : "No disponible";
        }


        if (mayorFullParty) {
            mayorFullParty.textContent =
                alcalde
                    ? limpiarTexto(alcalde.partido)
                    : "—";
        }


        if (mayorDate) {
            mayorDate.textContent =
                alcalde
                    ? limpiarTexto(alcalde.fechaPosesion)
                    : "—";
        }


        if (representativeCount) {
            representativeCount.textContent =
                representantes.length;
        }


        if (partyCount) {
            partyCount.textContent =
                partidos.size;
        }


        if (entityCount) {
            entityCount.textContent =
                entidades.length;
        }


        if (townHallAddress) {
            townHallAddress.textContent =
                ayuntamiento
                    ? limpiarTexto(ayuntamiento.direccion)
                    : "No disponible";
        }


        if (townHallPhone) {
            townHallPhone.textContent =
                ayuntamiento
                    ? limpiarTexto(ayuntamiento.telefono)
                    : "No disponible";
        }


        if (townHallEmail) {
            townHallEmail.textContent =
                ayuntamiento
                    ? limpiarTexto(ayuntamiento.email)
                    : "No disponible";
        }


        if (townHallWeb) {

            const web =
                ayuntamiento
                    ? limpiarTexto(ayuntamiento.web)
                    : "No disponible";


            townHallWeb.textContent = web;


            if (web !== "No disponible") {

                let url = web;

                if (!/^https?:\/\//i.test(url)) {
                    url = `https://${url}`;
                }

                townHallWeb.href = url;
                townHallWeb.target = "_blank";
                townHallWeb.rel =
                    "noopener noreferrer";

            } else {

                townHallWeb.removeAttribute("href");

            }
        }


        renderRepresentantes(representantes);

        renderEntidades(entidades);

    } catch (error) {

        console.error(
            "Error cargando las instituciones:",
            error
        );

        mostrarPaginaVacia();
    }
}


function renderRepresentantes(representantes) {

    const container =
        document.getElementById("representativesTable");

    if (!container) {
        return;
    }


    if (!representantes.length) {

        container.innerHTML = `
            <div class="empty-state">
                No hay información disponible sobre los representantes.
            </div>
        `;

        return;
    }


    container.innerHTML = `

        <div class="table-wrapper">

            <table class="data-table">

                <thead>

                    <tr>
                        <th>Nombre</th>
                        <th>Cargo</th>
                        <th>Partido</th>
                        <th>Fecha de posesión</th>
                    </tr>

                </thead>

                <tbody>

                    ${representantes.map(representante => `

                        <tr>

                            <td>
                                ${limpiarTexto(representante.nombre)}
                            </td>

                            <td>
                                ${limpiarTexto(representante.cargo)}
                            </td>

                            <td>
                                ${limpiarTexto(representante.partido)}
                            </td>

                            <td>
                                ${limpiarTexto(representante.fechaPosesion)}
                            </td>

                        </tr>

                    `).join("")}

                </tbody>

            </table>

        </div>
    `;
}


function renderEntidades(entidades) {

    const container =
        document.getElementById("entitiesList");

    if (!container) {
        return;
    }


    if (!entidades.length) {

        container.innerHTML = `
            <div class="empty-state">
                No hay entidades locales registradas para este municipio.
            </div>
        `;

        return;
    }


    container.innerHTML = entidades.map(entidad => `

        <div class="institution-entity">

            <div>

                <strong>
                    ${limpiarTexto(entidad.nombre)}
                </strong>

                <span>
                    ${limpiarTexto(
                        entidad.tipologia ||
                        entidad.tipo ||
                        entidad.tipoEntidad
                    )}
                </span>

            </div>

            <div class="institution-entity-meta">

                <span>
                    Registro:
                    ${limpiarTexto(
                        entidad.numeroRegistro ||
                        entidad.registro
                    )}
                </span>

                <span>
                    ${limpiarTexto(
                        entidad.direccion
                    )}
                </span>

            </div>

        </div>

    `).join("");
}


cargarInstituciones();