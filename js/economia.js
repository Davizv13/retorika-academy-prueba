const params = new URLSearchParams(window.location.search);

const territoryCode = params.get("code");
const territoryName = params.get("name");

let incomeChartInstance = null;
let unemploymentChartInstance = null;

function formatNumber(value) {
    if (value === null || value === undefined) {
        return "—";
    }

    return Number(value).toLocaleString("es-ES");
}

function updateTerritoryHeader(data) {

    const nameElement = document.getElementById("territoryName");
    const descriptionElement =
        document.getElementById("territoryDescription");
    const eyebrowElement =
        document.getElementById("territoryEyebrow");

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

    } else {

        if (nameElement) {
            nameElement.textContent = "Economía";
        }

        if (descriptionElement) {
            descriptionElement.textContent =
                "Selecciona un municipio en el mapa para consultar sus indicadores económicos.";
        }

        if (eyebrowElement) {
            eyebrowElement.textContent =
                "SIN TERRITORIO SELECCIONADO";
        }

        document.title = "Economía | Retorika";
    }
}

function showEmptyState() {

    updateTerritoryHeader(null);

    const elements = [
        "income",
        "gdp",
        "unemployment",
        "companies",
        "gdpHighlight"
    ];

    elements.forEach(id => {

        const element = document.getElementById(id);

        if (element) {
            element.textContent = "—";
        }
    });

    const detailElements = [
        "incomeDetail",
        "gdpDetail",
        "unemploymentDetail",
        "companiesDetail"
    ];

    detailElements.forEach(id => {

        const element = document.getElementById(id);

        if (element) {
            element.textContent =
                "Selecciona un municipio para consultar este dato.";
        }
    });

    const charts = [
        "incomeChart",
        "unemploymentChart"
    ];

    charts.forEach(id => {

        const canvas = document.getElementById(id);

        if (!canvas) {
            return;
        }

        canvas.parentElement.innerHTML = `
            <div style="
                height:100%;
                min-height:180px;
                display:flex;
                align-items:center;
                justify-content:center;
                color:#98a2b3;
                font-size:13px;
                text-align:center;
                line-height:1.5;
                padding:20px;
                box-sizing:border-box;
            ">
                Selecciona un municipio en el mapa<br>
                para consultar sus datos económicos.
            </div>
        `;
    });
}

function updatePage(data) {

    if (!data) {
        showEmptyState();
        return;
    }

    const latestIncome =
        data.renta && data.renta.length
            ? data.renta[data.renta.length - 1]
            : null;

    const latestPib =
        data.pib && data.pib.length
            ? data.pib[data.pib.length - 1]
            : null;

    const latestParo =
        data.paro && data.paro.length
            ? data.paro[data.paro.length - 1]
            : null;

    const latestUnidades =
        data.unidadesLocales && data.unidadesLocales.length
            ? data.unidadesLocales[data.unidadesLocales.length - 1]
            : null;


    const incomeElement =
        document.getElementById("income");

    const gdpElement =
        document.getElementById("gdp");

    const unemploymentElement =
        document.getElementById("unemployment");

    const companiesElement =
        document.getElementById("companies");

    const gdpHighlight =
        document.getElementById("gdpHighlight");


    if (incomeElement) {
        incomeElement.textContent =
            latestIncome && latestIncome.por_habitante !== null
                ? `${formatNumber(latestIncome.por_habitante)} €`
                : "—";
    }


    if (gdpElement) {
        gdpElement.textContent =
            latestPib && latestPib.por_habitante !== null
                ? `${formatNumber(latestPib.por_habitante)} €`
                : "—";
    }


    if (unemploymentElement) {
        unemploymentElement.textContent =
            latestParo && latestParo.personas !== null
                ? formatNumber(latestParo.personas)
                : "—";
    }


    if (companiesElement) {
        companiesElement.textContent =
            latestUnidades && latestUnidades.unidades !== null
                ? formatNumber(latestUnidades.unidades)
                : "—";
    }


    const incomeDetail =
        document.getElementById("incomeDetail");

    const gdpDetail =
        document.getElementById("gdpDetail");

    const unemploymentDetail =
        document.getElementById("unemploymentDetail");

    const companiesDetail =
        document.getElementById("companiesDetail");


    if (incomeDetail) {
        incomeDetail.textContent =
            latestIncome && latestIncome.por_habitante !== null
                ? `${formatNumber(latestIncome.por_habitante)} € · ${latestIncome.anio}`
                : "Dato no disponible";
    }


    if (gdpHighlight) {
        gdpHighlight.textContent =
            latestPib && latestPib.por_habitante !== null
                ? `${formatNumber(latestPib.por_habitante)} €`
                : "—";
    }


    if (gdpDetail) {
        gdpDetail.textContent =
            latestPib && latestPib.por_habitante !== null
                ? `${formatNumber(latestPib.por_habitante)} € · ${latestPib.anio}`
                : "Dato no disponible";
    }


    if (unemploymentDetail) {
        unemploymentDetail.textContent =
            latestParo && latestParo.personas !== null
                ? `${formatNumber(latestParo.personas)} personas · ${latestParo.anio}`
                : "Dato no disponible";
    }


    if (companiesDetail) {
        companiesDetail.textContent =
            latestUnidades && latestUnidades.unidades !== null
                ? `${formatNumber(latestUnidades.unidades)} unidades · ${latestUnidades.anio}`
                : "Dato no disponible";
    }


    updateTerritoryHeader(data);
}

function createIncomeChart(data) {

    const canvas =
        document.getElementById("incomeChart");

    if (!canvas) {
        return;
    }

    const years = (data.renta || []).map(item => item.anio);

    if (!years.length) {
        return;
    }

    const values = (data.renta || []).map(
        item => item.por_habitante
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

    const canvas =
        document.getElementById("unemploymentChart");

    if (!canvas) {
        return;
    }

    const years = (data.paro || []).map(item => item.anio);

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

    const values = (data.paro || []).map(
        item => item.personas
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

    if (!territoryCode) {
        showEmptyState();
        return;
    }

    try {

        const response =
            await fetch(
                `http://localhost:3000/api/municipios/${territoryCode}/economia`
            );

        if (!response.ok) {
            throw new Error(
                "No se pudieron cargar los datos económicos"
            );
        }

        const data = await response.json();

        updatePage(data);
        createIncomeChart(data);
        createUnemploymentChart(data);

    } catch (error) {

        console.error(
            "Error cargando datos económicos:",
            error
        );

        showEmptyState();
    }
}

function updateSidebar() {

    if (!territoryCode) {
        return;
    }

    const query =
        `?code=${encodeURIComponent(territoryCode)}&name=${encodeURIComponent(territoryName || "")}`;

    const resumen =
        document.getElementById("sidebarResumen");

    const demografia =
        document.getElementById("sidebarDemografia");

    const economia =
        document.getElementById("sidebarEconomia");

    const elecciones =
        document.getElementById("sidebarElecciones");

    const instituciones =
        document.getElementById("sidebarInstituciones");

    const comparar =
        document.getElementById("sidebarComparar");

    const informes =
        document.getElementById("sidebarInformes");

    if (resumen) {
        resumen.href =
            `territorio.html${query}`;
    }

    if (demografia) {
        demografia.href =
            `territorio.html${query}#demografia`;
    }

    if (economia) {
        economia.href =
            `economia.html${query}`;
    }

    if (elecciones) {
        elecciones.href =
            `elecciones.html${query}`;
    }

    if (instituciones) {
        instituciones.href =
            `instituciones.html${query}`;
    }

    if (comparar) {
        comparar.href =
            `comparar.html${query}`;
    }

    if (informes) {
        informes.href =
            `informes.html${query}`;
    }


}

updateSidebar();
loadEconomy();