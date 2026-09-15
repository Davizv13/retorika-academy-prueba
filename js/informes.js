const params = new URLSearchParams(window.location.search);

const territoryCode = params.get("code");
const territoryName = params.get("name");

let municipiosData = null;
let economiaData = null;


function formatNumber(value) {

    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {
        return "—";
    }

    return Number(value).toLocaleString("es-ES");
}


function showEmptyState() {

    document.title = "Informes | Retorika";


    const breadcrumbTerritory =
        document.getElementById("breadcrumbTerritory");

    const reportTitle =
        document.getElementById("reportTitle");

    const reportDescription =
        document.getElementById("reportDescription");

    const reportLevel =
        document.getElementById("reportLevel");


    if (breadcrumbTerritory) {
        breadcrumbTerritory.textContent =
            "Sin territorio";
    }

    if (reportTitle) {
        reportTitle.textContent =
            "Informe territorial";
    }

    if (reportDescription) {
        reportDescription.textContent =
            "Selecciona un municipio en el mapa para consultar su informe territorial.";
    }

    if (reportLevel) {
        reportLevel.textContent =
            "SIN TERRITORIO SELECCIONADO";
    }


    const elements = [
        "population",
        "income",
        "gdp",
        "unemployment",
        "summaryName",
        "summaryProvince",
        "summaryCommunity",
        "summaryArea",
        "summaryDensity",
        "averageAge",
        "youngPopulation",
        "workingPopulation",
        "oldPopulation",
        "foreignPopulation"
    ];


    elements.forEach(id => {

        const element =
            document.getElementById(id);

        if (element) {
            element.textContent = "—";
        }

    });
}


async function loadReport() {

    if (!territoryCode) {
        showEmptyState();
        return;
    }


    try {

        const [
            municipiosResponse,
            economiaResponse
        ] = await Promise.all([

            fetch("../data/municipios.json"),

            fetch("../data/economia.json")

        ]);


        if (
            !municipiosResponse.ok ||
            !economiaResponse.ok
        ) {
            throw new Error(
                "No se pudieron cargar los datos del informe."
            );
        }


        municipiosData =
            await municipiosResponse.json();

        economiaData =
            await economiaResponse.json();


        renderReport();


    } catch (error) {

        console.error(
            "Error cargando el informe:",
            error
        );

        showEmptyState();

    }
}


function renderReport() {

    if (
        !territoryCode ||
        !municipiosData ||
        !municipiosData[territoryCode]
    ) {

        showEmptyState();

        return;
    }


    const municipio =
        municipiosData[territoryCode];


    const economia =
        economiaData &&
            economiaData.municipios
            ? economiaData.municipios[territoryCode]
            : null;


    const nombre =
        municipio.nombre;


    document.title =
        `Informe · ${nombre} | Retorika`;


    const breadcrumbTerritory =
        document.getElementById(
            "breadcrumbTerritory"
        );

    const reportTitle =
        document.getElementById(
            "reportTitle"
        );

    const reportDescription =
        document.getElementById(
            "reportDescription"
        );

    const reportLevel =
        document.getElementById(
            "reportLevel"
        );


    if (breadcrumbTerritory) {
        breadcrumbTerritory.textContent =
            nombre;
    }


    if (reportTitle) {
        reportTitle.textContent =
            `Informe territorial · ${nombre}`;
    }


    if (reportDescription) {
        reportDescription.textContent =
            `Síntesis de los principales indicadores territoriales de ${nombre}.`;
    }


    if (reportLevel) {
        reportLevel.textContent =
            `INFORME · ${nombre.toUpperCase()}`;
    }


    const population =
        document.getElementById(
            "population"
        );

    if (population) {
        population.textContent =
            formatNumber(municipio.poblacion);
    }


    const renta =
        economia &&
        economia.renta &&
        economia.renta["2023"];


    const income =
        document.getElementById(
            "income"
        );


    if (income) {

        income.textContent =
            renta &&
                renta.porHabitante !== null
                ? `${formatNumber(renta.porHabitante)} €`
                : "—";

    }


    const pib =
        economia &&
        economia.pib &&
        economia.pib["2020"];


    const gdp =
        document.getElementById(
            "gdp"
        );


    if (gdp) {

        gdp.textContent =
            pib &&
                pib.porHabitante !== null
                ? `${formatNumber(pib.porHabitante)} €`
                : "—";

    }


    const paro =
        economia &&
        economia.paro &&
        economia.paro["2025"];


    const unemployment =
        document.getElementById(
            "unemployment"
        );


    if (unemployment) {

        unemployment.textContent =
            paro !== undefined &&
                paro !== null
                ? formatNumber(paro)
                : "—";

    }


    const summaryName =
        document.getElementById(
            "summaryName"
        );

    const summaryProvince =
        document.getElementById(
            "summaryProvince"
        );

    const summaryCommunity =
        document.getElementById(
            "summaryCommunity"
        );

    const summaryArea =
        document.getElementById(
            "summaryArea"
        );

    const summaryDensity =
        document.getElementById(
            "summaryDensity"
        );

    const averageAge =
        document.getElementById(
            "averageAge"
        );

    const youngPopulation =
        document.getElementById(
            "youngPopulation"
        );

    const workingPopulation =
        document.getElementById(
            "workingPopulation"
        );

    const oldPopulation =
        document.getElementById(
            "oldPopulation"
        );

    const foreignPopulation =
        document.getElementById(
            "foreignPopulation"
        );


    if (summaryName) {
        summaryName.textContent =
            municipio.nombre || "—";
    }


    if (summaryProvince) {
        summaryProvince.textContent =
            municipio.provincia || "—";
    }


    if (summaryCommunity) {
        summaryCommunity.textContent =
            municipio.comunidad || "—";
    }


    if (summaryArea) {
        summaryArea.textContent =
            municipio.superficie !== undefined
                ? `${formatNumber(municipio.superficie)} km²`
                : "—";
    }


    if (summaryDensity) {
        summaryDensity.textContent =
            municipio.densidad !== undefined
                ? `${formatNumber(municipio.densidad)} hab./km²`
                : "—";
    }


    if (averageAge) {
        averageAge.textContent =
            municipio.edadMedia !== undefined
                ? `${formatNumber(municipio.edadMedia)} años`
                : "—";
    }


    if (youngPopulation) {
        youngPopulation.textContent =
            municipio.menores15 !== undefined
                ? formatNumber(municipio.menores15)
                : "—";
    }


    if (workingPopulation) {
        workingPopulation.textContent =
            municipio.edad15_64 !== undefined
                ? formatNumber(municipio.edad15_64)
                : "—";
    }


    if (oldPopulation) {
        oldPopulation.textContent =
            municipio.mayores65 !== undefined
                ? formatNumber(municipio.mayores65)
                : "—";
    }


    if (foreignPopulation) {

        foreignPopulation.textContent =
            municipio.porcentajeExtranjeros !== undefined
                ? `${formatNumber(municipio.extranjeros)} · ${formatNumber(municipio.porcentajeExtranjeros)}%`
                : "—";

    }
}


function updateSidebarLinks() {

    if (!territoryCode) {
        return;
    }


    const query =
        `?code=${encodeURIComponent(territoryCode)}&name=${encodeURIComponent(territoryName || "")}`;


    document
        .querySelectorAll(".sidebar-link")
        .forEach(link => {

            const text =
                link.textContent
                    .replace(/\s+/g, " ")
                    .trim();


            if (text.includes("Resumen")) {
                link.href =
                    `territorio.html${query}`;
            }


            if (text.includes("Demografía")) {
                link.href =
                    `territorio.html${query}#demografia`;
            }


            if (text.includes("Economía")) {
                link.href =
                    `economia.html${query}`;
            }


            if (text.includes("Elecciones")) {
                link.href =
                    `elecciones.html${query}`;
            }


            if (text.includes("Instituciones")) {
                link.href = `instituciones.html${query}`;
            }


            if (text.includes("Comparar")) {
                link.href =
                    `comparar.html${query}`;
            }


            if (text.includes("Informes")) {
                link.href =
                    `informes.html${query}`;
            }

        });
}


updateSidebarLinks();
loadReport();