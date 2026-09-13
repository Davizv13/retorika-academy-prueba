const params = new URLSearchParams(window.location.search);

const territoryCode = params.get("code");
const territoryName = params.get("name");

let economiaData = null;
let incomeChartInstance = null;
let unemploymentChartInstance = null;

function formatNumber(value) {
    if (value === null || value === undefined) {
        return "—";
    }

    return Number(value).toLocaleString("es-ES");
}

function getMunicipalityData() {
    if (
        territoryCode &&
        economiaData &&
        economiaData.municipios &&
        economiaData.municipios[territoryCode]
    ) {
        return economiaData.municipios[territoryCode];
    }

    return null;
}

function updateTerritoryHeader(data) {
    const nameElement = document.getElementById("territoryName");
    const descriptionElement = document.getElementById("territoryDescription");
    const eyebrowElement = document.getElementById("territoryEyebrow");

    if (territoryName && data) {
        if (nameElement) {
            nameElement.textContent =
                `Economía · ${territoryName}`;
        }

        if (descriptionElement) {
            descriptionElement.textContent =
                `Indicadores económicos de ${territoryName}.`;
        }

        if (eyebrowElement) {
            eyebrowElement.textContent =
                `MUNICIPIO · ${territoryName.toUpperCase()} · ECONOMÍA`;
        }

        document.title =
            `Economía · ${territoryName} | Retorika`;
    }
}

function updatePage(data) {
    if (!data) {
        return;
    }

    const incomeYears = Object.keys(data.renta || {})
        .sort((a, b) => Number(a) - Number(b));

    const latestIncomeYear =
        incomeYears.length
            ? incomeYears[incomeYears.length - 1]
            : null;

    const latestIncome =
        latestIncomeYear
            ? data.renta[latestIncomeYear].porHabitante
            : null;

    const pibYears = Object.keys(data.pib || {})
        .sort((a, b) => Number(a) - Number(b));

    const latestPibYear =
        pibYears.length
            ? pibYears[pibYears.length - 1]
            : null;

    const latestPib =
        latestPibYear
            ? data.pib[latestPibYear].porHabitante
            : null;

    const paroYears = Object.keys(data.paro || {})
        .sort((a, b) => Number(a) - Number(b));

    const latestParoYear =
        paroYears.length
            ? paroYears[paroYears.length - 1]
            : null;

    const latestParo =
        latestParoYear
            ? data.paro[latestParoYear]
            : null;

    const unidadesYears = Object.keys(data.unidadesLocales || {})
        .sort((a, b) => Number(a) - Number(b));

    const latestUnidadesYear =
        unidadesYears.length
            ? unidadesYears[unidadesYears.length - 1]
            : null;

    const latestUnidades =
        latestUnidadesYear
            ? data.unidadesLocales[latestUnidadesYear]
            : null;

    const incomeElement = document.getElementById("income");
    const gdpElement = document.getElementById("gdp");
    const unemploymentElement = document.getElementById("unemployment");
    const companiesElement = document.getElementById("companies");
    const gdpHighlight = document.getElementById("gdpHighlight");

    if (incomeElement) {
        incomeElement.textContent =
            latestIncome !== null
                ? `${formatNumber(latestIncome)} €`
                : "—";
    }

    if (gdpElement) {
        gdpElement.textContent =
            latestPib !== null
                ? `${formatNumber(latestPib)} €`
                : "—";
    }

    if (unemploymentElement) {
        unemploymentElement.textContent =
            latestParo !== null
                ? formatNumber(latestParo)
                : "—";
    }

    if (companiesElement) {
        companiesElement.textContent =
            latestUnidades !== null
                ? formatNumber(latestUnidades)
                : "—";
    }

    const incomeDetail = document.getElementById("incomeDetail");
    const gdpDetail = document.getElementById("gdpDetail");
    const unemploymentDetail = document.getElementById("unemploymentDetail");
    const companiesDetail = document.getElementById("companiesDetail");

    if (incomeDetail) {
        incomeDetail.textContent =
            latestIncome !== null
                ? `${formatNumber(latestIncome)} € · ${latestIncomeYear}`
                : "Dato no disponible";
    }

    if (gdpHighlight) {
        gdpHighlight.textContent =
            latestPib !== null
                ? `${formatNumber(latestPib)} €`
                : "—";
    }

    if (gdpDetail) {
        gdpDetail.textContent =
            latestPib !== null
                ? `${formatNumber(latestPib)} € · ${latestPibYear}`
                : "Dato no disponible";
    }

    if (unemploymentDetail) {
        unemploymentDetail.textContent =
            latestParo !== null
                ? `${formatNumber(latestParo)} personas · ${latestParoYear}`
                : "Dato no disponible";
    }

    if (companiesDetail) {
        companiesDetail.textContent =
            latestUnidades !== null
                ? `${formatNumber(latestUnidades)} unidades · ${latestUnidadesYear}`
                : "Dato no disponible";
    }

    updateTerritoryHeader(data);
}

function createIncomeChart(data) {
    const canvas = document.getElementById("incomeChart");

    if (!canvas) {
        return;
    }

    const years = Object.keys(data.renta || {})
        .sort((a, b) => Number(a) - Number(b));

    if (!years.length) {
        return;
    }

    const values = years.map(
        year => data.renta[year].porHabitante
    );

    if (incomeChartInstance) {
        incomeChartInstance.destroy();
    }

    incomeChartInstance = new Chart(canvas, {
        type: "line",
        data: {
            labels: years,
            datasets: [{
                label: "Renta disponible por habitante",
                data: values,
                borderWidth: 2,
                tension: 0.3,
                fill: false
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: context =>
                            `${formatNumber(context.parsed.y)} € / habitante`
                    }
                }
            },
            scales: {
                y: {
                    ticks: {
                        callback: value =>
                            `${formatNumber(value)} €`
                    },
                    grid: {
                        color: "#eef1f4"
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            }
        }
    });
}

function createUnemploymentChart(data) {
    const canvas = document.getElementById("unemploymentChart");

    if (!canvas) {
        return;
    }

    const years = Object.keys(data.paro || {})
        .sort((a, b) => Number(a) - Number(b));

    if (!years.length) {
        canvas.parentElement.innerHTML = `
            <div style="
                height:100%;
                display:flex;
                align-items:center;
                justify-content:center;
                color:#98a2b3;
                font-size:13px;
                text-align:center;
            ">
                Datos de paro no disponibles
            </div>
        `;

        return;
    }

    const values = years.map(
        year => data.paro[year]
    );

    if (unemploymentChartInstance) {
        unemploymentChartInstance.destroy();
    }

    unemploymentChartInstance = new Chart(canvas, {
        type: "line",
        data: {
            labels: years,
            datasets: [{
                label: "Paro registrado",
                data: values,
                borderWidth: 2,
                tension: 0.3,
                fill: false
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: context =>
                            `${formatNumber(context.parsed.y)} personas`
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: value =>
                            formatNumber(value)
                    },
                    grid: {
                        color: "#eef1f4"
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            }
        }
    });
}

async function loadEconomy() {
    try {
        const response = await fetch("../data/economia.json");

        if (!response.ok) {
            throw new Error("No se pudo cargar economia.json");
        }

        economiaData = await response.json();

        const data = getMunicipalityData();

        if (!data) {
            console.error("No hay datos económicos para el territorio seleccionado.");
            return;
        }

        updatePage(data);
        createIncomeChart(data);
        createUnemploymentChart(data);

    } catch (error) {
        console.error("Error cargando datos económicos:", error);
    }
}

function updateSidebar() {
    if (!territoryCode) {
        return;
    }

    const query =
        `?code=${encodeURIComponent(territoryCode)}&name=${encodeURIComponent(territoryName || "")}`;

    const resumen = document.getElementById("sidebarResumen");
    const demografia = document.getElementById("sidebarDemografia");
    const economia = document.getElementById("sidebarEconomia");
    const elecciones = document.getElementById("sidebarElecciones");
    const instituciones = document.getElementById("sidebarInstituciones");

    if (resumen) {
        resumen.href = `territorio.html${query}`;
    }

    if (demografia) {
        demografia.href = `territorio.html${query}#demografia`;
    }

    if (economia) {
        economia.href = `economia.html${query}`;
    }

    if (elecciones) {
        elecciones.href = `elecciones.html${query}`;
    }

    if (instituciones) {
        instituciones.href = `territorio.html${query}#instituciones`;
    }
}

updateSidebar();
loadEconomy();