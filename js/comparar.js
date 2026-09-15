const params = new URLSearchParams(window.location.search);

const initialCode = params.get("code");
const territoryCode = params.get("code");
const territoryName = params.get("name");

let municipiosData = {};
let historicaData = {};
let economiaData = {};

let populationComparisonChart = null;


const territoryA = document.getElementById("territoryA");
const territoryB = document.getElementById("territoryB");

const compareButton = document.getElementById("compareButton");
const comparisonContent = document.getElementById("comparisonContent");


function formatNumber(value) {
    if (
        value === undefined ||
        value === null ||
        value === "" ||
        !Number.isFinite(Number(value))
    ) {
        return "—";
    }

    return Number(value).toLocaleString("es-ES");
}


function formatDecimal(value) {
    if (
        value === undefined ||
        value === null ||
        value === "" ||
        !Number.isFinite(Number(value))
    ) {
        return "—";
    }

    return Number(value).toLocaleString("es-ES", {
        minimumFractionDigits: 1,
        maximumFractionDigits: 2
    });
}


function formatEuro(value) {
    if (
        value === undefined ||
        value === null ||
        value === "" ||
        !Number.isFinite(Number(value))
    ) {
        return "—";
    }

    return `${Number(value).toLocaleString("es-ES")} €`;
}


function formatPercentage(value) {
    if (
        value === undefined ||
        value === null ||
        value === "" ||
        !Number.isFinite(Number(value))
    ) {
        return "—";
    }

    return `${Number(value).toLocaleString("es-ES", {
        minimumFractionDigits: 1,
        maximumFractionDigits: 1
    })}%`;
}


async function loadData() {

    try {

        const [
            municipiosResponse,
            historicaResponse,
            economiaResponse
        ] = await Promise.all([

            fetch("../data/municipios.json"),
            fetch("../data/poblacion_historica.json"),
            fetch("../data/economia.json")

        ]);


        municipiosData = await municipiosResponse.json();
        historicaData = await historicaResponse.json();
        economiaData = await economiaResponse.json();


        populateTerritories();


    } catch (error) {

        console.error(
            "Error cargando los datos de comparación:",
            error
        );

    }

}


function populateTerritories() {

    const municipalities = Object.entries(municipiosData)
        .sort((a, b) =>
            a[1].nombre.localeCompare(
                b[1].nombre,
                "es"
            )
        );


    municipalities.forEach(([code, municipality]) => {

        const optionA = document.createElement("option");

        optionA.value = code;
        optionA.textContent =
            `${municipality.nombre} · ${municipality.provincia}`;

        territoryA.appendChild(optionA);


        const optionB = document.createElement("option");

        optionB.value = code;
        optionB.textContent =
            `${municipality.nombre} · ${municipality.provincia}`;

        territoryB.appendChild(optionB);

    });


    if (initialCode && municipiosData[initialCode]) {

        territoryA.value = initialCode;

        const firstOther =
            Object.keys(municipiosData)
                .find(code => code !== initialCode);

        if (firstOther) {
            territoryB.value = firstOther;
        }

    } else {

        const defaultCodes =
            Object.keys(municipiosData);

        if (defaultCodes.length >= 2) {

            territoryA.value = defaultCodes[0];
            territoryB.value = defaultCodes[1];

        }

    }


    if (
        territoryA.value &&
        territoryB.value
    ) {
        compareTerritories();
    }

}


function compareTerritories() {

    const codeA = territoryA.value;
    const codeB = territoryB.value;


    if (!codeA || !codeB) {

        comparisonContent.classList.add("hidden");

        return;

    }


    if (codeA === codeB) {

        alert(
            "Selecciona dos territorios diferentes para compararlos."
        );

        return;

    }


    const municipalityA = municipiosData[codeA];
    const municipalityB = municipiosData[codeB];


    if (!municipalityA || !municipalityB) {
        return;
    }


    comparisonContent.classList.remove("hidden");


    document.getElementById("territoryAName").textContent =
        municipalityA.nombre;

    document.getElementById("territoryBName").textContent =
        municipalityB.nombre;


    document.getElementById("tableNameA").textContent =
        municipalityA.nombre;

    document.getElementById("tableNameB").textContent =
        municipalityB.nombre;


    fillIndicators(
        "A",
        municipalityA,
        economiaData.municipios
            ? economiaData.municipios[codeA]
            : null
    );


    fillIndicators(
        "B",
        municipalityB,
        economiaData.municipios
            ? economiaData.municipios[codeB]
            : null
    );


    createPopulationComparison(
        codeA,
        codeB,
        municipalityA,
        municipalityB
    );


    window.history.replaceState(
        {},
        "",
        `comparar.html?code=${encodeURIComponent(codeA)}&name=${encodeURIComponent(territoryName || municipalityA.nombre)}`
    );

}


function fillIndicators(
    prefix,
    municipality,
    economy
) {

    document.getElementById(`population${prefix}`)
        .textContent =
        formatNumber(municipality.poblacion);


    document.getElementById(`age${prefix}`)
        .textContent =
        municipality.edadMedia !== undefined
            ? `${formatDecimal(municipality.edadMedia)} años`
            : "—";


    document.getElementById(`density${prefix}`)
        .textContent =
        municipality.densidad !== undefined
            ? `${formatDecimal(municipality.densidad)} hab./km²`
            : "—";


    document.getElementById(`area${prefix}`)
        .textContent =
        municipality.superficie !== undefined
            ? `${formatDecimal(municipality.superficie)} km²`
            : "—";


    document.getElementById(`foreign${prefix}`)
        .textContent =
        municipality.porcentajeExtranjeros !== undefined
            ? `${formatNumber(municipality.extranjeros)} · ${formatPercentage(municipality.porcentajeExtranjeros)}`
            : "—";


    const income =
        economy &&
        economy.renta &&
        economy.renta["2023"];


    document.getElementById(`income${prefix}`)
        .textContent =
        income &&
            income.porHabitante !== null
            ? formatEuro(income.porHabitante)
            : "—";


    const gdp =
        economy &&
        economy.pib &&
        economy.pib["2020"];


    document.getElementById(`gdp${prefix}`)
        .textContent =
        gdp &&
            gdp.porHabitante !== null
            ? formatEuro(gdp.porHabitante)
            : "—";


    const unemployment =
        economy &&
        economy.paro &&
        economy.paro["2025"];


    document.getElementById(`unemployment${prefix}`)
        .textContent =
        unemployment !== undefined &&
            unemployment !== null
            ? formatNumber(unemployment)
            : "—";

}


function createPopulationComparison(
    codeA,
    codeB,
    municipalityA,
    municipalityB
) {

    const historyA =
        historicaData[codeA];

    const historyB =
        historicaData[codeB];


    if (
        !historyA ||
        !historyB ||
        !historyA.serie ||
        !historyB.serie
    ) {
        return;
    }


    const years = historyA.serie.map(
        item => item.anio
    );


    const populationA =
        historyA.serie.map(
            item => item.poblacion
        );


    const populationB =
        historyB.serie.map(
            item => item.poblacion
        );


    const canvas =
        document.getElementById(
            "populationComparisonChart"
        );


    if (populationComparisonChart) {
        populationComparisonChart.destroy();
    }


    populationComparisonChart =
        new Chart(canvas, {

            type: "line",

            data: {

                labels: years,

                datasets: [

                    {
                        label: municipalityA.nombre,
                        data: populationA,
                        borderWidth: 2,
                        tension: 0.25,
                        pointRadius: 0
                    },

                    {
                        label: municipalityB.nombre,
                        data: populationB,
                        borderWidth: 2,
                        tension: 0.25,
                        pointRadius: 0
                    }

                ]

            },

            options: {

                responsive: true,

                maintainAspectRatio: false,

                interaction: {
                    mode: "index",
                    intersect: false
                },

                plugins: {

                    legend: {
                        display: true,
                        position: "top"
                    }

                },

                scales: {

                    x: {
                        grid: {
                            display: false
                        }
                    },

                    y: {

                        beginAtZero: false,

                        ticks: {
                            callback: value =>
                                Number(value).toLocaleString(
                                    "es-ES"
                                )
                        }

                    }

                }

            }

        });

}


compareButton.addEventListener(
    "click",
    compareTerritories
);

function updateSidebarLinks() {

    if (!territoryCode) {
        return;
    }

    const query =
        `?code=${encodeURIComponent(territoryCode)}&name=${encodeURIComponent(territoryName || "")}`;

    document.querySelectorAll(".sidebar-link").forEach(link => {

        const text = link.textContent
            .replace(/\s+/g, " ")
            .trim();

        if (text.includes("Resumen")) {
            link.href = `territorio.html${query}`;
        }

        if (text.includes("Demografía")) {
            link.href = `territorio.html${query}#demografia`;
        }

        if (text.includes("Economía")) {
            link.href = `economia.html${query}`;
        }

        if (text.includes("Elecciones")) {
            link.href = `elecciones.html${query}`;
        }

        if (text.includes("Instituciones")) {
            link.href = `instituciones.html${query}`;
        }

        if (text.includes("Comparar")) {
            link.href = `comparar.html${query}`;
        }

        if (text.includes("Informes")) {
            link.href = `informes.html${query}`;
        }

    });
}

updateSidebarLinks();
loadData();