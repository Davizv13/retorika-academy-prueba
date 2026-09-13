const params = new URLSearchParams(window.location.search);

const territoryCode = params.get("code");

let municipiosData = null;
let economiaData = null;

function formatNumber(value) {
    if (value === null || value === undefined) {
        return "—";
    }

    return Number(value).toLocaleString("es-ES");
}

async function loadReport() {

    try {

        const [municipiosResponse, economiaResponse] =
            await Promise.all([
                fetch("../data/municipios.json"),
                fetch("../data/economia.json")
            ]);

        municipiosData = await municipiosResponse.json();
        economiaData = await economiaResponse.json();

        renderReport();

    } catch (error) {

        console.error(
            "Error cargando el informe:",
            error
        );

    }
}

function renderReport() {

    if (
        !territoryCode ||
        !municipiosData ||
        !municipiosData[territoryCode]
    ) {
        return;
    }

    const municipio =
        municipiosData[territoryCode];

    const economia =
        economiaData &&
        economiaData.municipios
            ? economiaData.municipios[territoryCode]
            : null;

    const nombre = municipio.nombre;

    document.title =
        `Informe · ${nombre} | Retorika`;

    document.getElementById(
        "breadcrumbTerritory"
    ).textContent = nombre;

    document.getElementById(
        "reportTitle"
    ).textContent =
        `Informe territorial · ${nombre}`;

    document.getElementById(
        "reportDescription"
    ).textContent =
        `Síntesis de los principales indicadores territoriales de ${nombre}.`;

    document.getElementById(
        "reportLevel"
    ).textContent =
        `INFORME · ${nombre.toUpperCase()}`;


    document.getElementById(
        "population"
    ).textContent =
        formatNumber(municipio.poblacion);


    const renta =
        economia &&
        economia.renta &&
        economia.renta["2023"];

    document.getElementById(
        "income"
    ).textContent =
        renta && renta.porHabitante !== null
            ? `${formatNumber(renta.porHabitante)} €`
            : "—";


    const pib =
        economia &&
        economia.pib &&
        economia.pib["2020"];

    document.getElementById(
        "gdp"
    ).textContent =
        pib && pib.porHabitante !== null
            ? `${formatNumber(pib.porHabitante)} €`
            : "—";


    const paro =
        economia &&
        economia.paro &&
        economia.paro["2025"];

    document.getElementById(
        "unemployment"
    ).textContent =
        paro !== undefined && paro !== null
            ? formatNumber(paro)
            : "—";


    document.getElementById(
        "summaryName"
    ).textContent =
        municipio.nombre || "—";

    document.getElementById(
        "summaryProvince"
    ).textContent =
        municipio.provincia || "—";

    document.getElementById(
        "summaryCommunity"
    ).textContent =
        municipio.comunidad || "—";

    document.getElementById(
        "summaryArea"
    ).textContent =
        municipio.superficie !== undefined
            ? `${formatNumber(municipio.superficie)} km²`
            : "—";

    document.getElementById(
        "summaryDensity"
    ).textContent =
        municipio.densidad !== undefined
            ? `${formatNumber(municipio.densidad)} hab./km²`
            : "—";

    document.getElementById(
        "averageAge"
    ).textContent =
        municipio.edadMedia !== undefined
            ? `${formatNumber(municipio.edadMedia)} años`
            : "—";

    document.getElementById(
        "youngPopulation"
    ).textContent =
        municipio.menores15 !== undefined
            ? formatNumber(municipio.menores15)
            : "—";

    document.getElementById(
        "workingPopulation"
    ).textContent =
        municipio.edad15_64 !== undefined
            ? formatNumber(municipio.edad15_64)
            : "—";

    document.getElementById(
        "oldPopulation"
    ).textContent =
        municipio.mayores65 !== undefined
            ? formatNumber(municipio.mayores65)
            : "—";

    document.getElementById(
        "foreignPopulation"
    ).textContent =
        municipio.porcentajeExtranjeros !== undefined
            ? `${formatNumber(municipio.extranjeros)} · ${formatNumber(municipio.porcentajeExtranjeros)}%`
            : "—";
}

loadReport();