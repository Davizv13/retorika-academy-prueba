const params = new URLSearchParams(window.location.search);

const initialCode = params.get("code");
const territoryCode = params.get("code");
const territoryName = params.get("name");

let municipiosData = {};

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

        const municipiosResponse =
            await fetch(
                "http://localhost:3000/api/municipios"
            );

        if (!municipiosResponse.ok) {
            throw new Error(
                "No se pudieron cargar los municipios"
            );
        }

        const municipios = await municipiosResponse.json();

        municipiosData = Object.fromEntries(
            municipios.map(municipio => [
                municipio.codigo_ine,
                municipio
            ])
        );


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


async function compareTerritories() {

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

    try {

        const [
            municipalityAResponse,
            municipalityBResponse,
            populationAResponse,
            populationBResponse,
            economyAResponse,
            economyBResponse
        ] = await Promise.all([

            fetch(
                `http://localhost:3000/api/municipios/${codeA}`
            ),

            fetch(
                `http://localhost:3000/api/municipios/${codeB}`
            ),

            fetch(
                `http://localhost:3000/api/municipios/${codeA}/poblacion`
            ),

            fetch(
                `http://localhost:3000/api/municipios/${codeB}/poblacion`
            ),

            fetch(
                `http://localhost:3000/api/municipios/${codeA}/economia`
            ),

            fetch(
                `http://localhost:3000/api/municipios/${codeB}/economia`
            )

        ]);


        if (
            !municipalityAResponse.ok ||
            !municipalityBResponse.ok
        ) {
            throw new Error(
                "No se pudieron cargar los municipios"
            );
        }


        const municipalityA =
            await municipalityAResponse.json();

        const municipalityB =
            await municipalityBResponse.json();


        const populationA =
            populationAResponse.ok
                ? await populationAResponse.json()
                : [];

        const populationB =
            populationBResponse.ok
                ? await populationBResponse.json()
                : [];


        const economyA =
            economyAResponse.ok
                ? await economyAResponse.json()
                : null;

        const economyB =
            economyBResponse.ok
                ? await economyBResponse.json()
                : null;


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
            economyA
        );


        fillIndicators(
            "B",
            municipalityB,
            economyB
        );


        createPopulationComparison(
            populationA,
            populationB,
            municipalityA,
            municipalityB
        );


        window.history.replaceState(
            {},
            "",
            `comparar.html?code=${encodeURIComponent(codeA)}&name=${encodeURIComponent(territoryName || municipalityA.nombre)}`
        );


    } catch (error) {

        console.error(
            "Error comparando los territorios:",
            error
        );

        comparisonContent.classList.add("hidden");
    }
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
        municipality.extranjeros !== undefined
            ? `${formatNumber(municipality.extranjeros)} · ${formatPercentage(municipality.porcentaje_extranjeros)}`
            : "—";


    const latestIncome =
        economy &&
        economy.renta &&
        economy.renta.length
            ? economy.renta[economy.renta.length - 1]
            : null;


    document.getElementById(`income${prefix}`)
        .textContent =
        latestIncome &&
        latestIncome.por_habitante !== null
            ? formatEuro(latestIncome.por_habitante)
            : "—";


    const latestGdp =
        economy &&
        economy.pib &&
        economy.pib.length
            ? economy.pib[economy.pib.length - 1]
            : null;


    document.getElementById(`gdp${prefix}`)
        .textContent =
        latestGdp &&
        latestGdp.por_habitante !== null
            ? formatEuro(latestGdp.por_habitante)
            : "—";


    const latestUnemployment =
        economy &&
        economy.paro &&
        economy.paro.length
            ? economy.paro[economy.paro.length - 1]
            : null;


    document.getElementById(`unemployment${prefix}`)
        .textContent =
        latestUnemployment &&
        latestUnemployment.personas !== null
            ? formatNumber(latestUnemployment.personas)
            : "—";
}

function createPopulationComparison(
    populationA,
    populationB,
    municipalityA,
    municipalityB
) {

    if (!populationA.length || !populationB.length) {
        return;
    }

    const years = populationA.map(
        item => item.anio
    );

    const populationValuesA = populationA.map(
        item => item.poblacion
    );

    const populationValuesB = populationB.map(
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
                        data: populationValuesA,
                        borderWidth: 2,
                        tension: 0.25,
                        pointRadius: 0
                    },

                    {
                        label: municipalityB.nombre,
                        data: populationValuesB,
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