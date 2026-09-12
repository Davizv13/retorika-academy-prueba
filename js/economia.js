const params = new URLSearchParams(window.location.search);

const territoryCode = params.get("code");
const territoryName = params.get("name");

const galiciaEconomy = {
    income: 2830,
    gdp: 31829,
    unemployment: 8.3,
    companies: 229457,
    incomeHistory: {
        years: [2023, 2024],
        values: [2698, 2830]
    },
    unemploymentHistory: {
        years: [2022, 2023, 2024, 2025],
        values: [11.0, 9.7, 9.4, 8.3]
    },
    sectors: {
        labels: ["Servicios", "Comercio", "Industria", "Construcción", "Agricultura"],
        values: [0, 0, 0, 0, 0]
    }
};

const municipalityEconomy = {
    "36057": {
        name: "Vigo",
        income: 3064,
        gdp: 33147,
        unemployment: null,
        companies: null,
        incomeHistory: {
            years: [2024],
            values: [3064]
        },
        unemploymentHistory: {
            years: [],
            values: []
        },
        sectors: {
            labels: [],
            values: []
        }
    }
};

function formatNumber(value) {
    if (value === null || value === undefined) {
        return "—";
    }

    return Number(value).toLocaleString("es-ES");
}

function formatPercent(value) {
    if (value === null || value === undefined) {
        return "—";
    }

    return `${Number(value).toLocaleString("es-ES", {
        minimumFractionDigits: 1,
        maximumFractionDigits: 1
    })}%`;
}

function updatePage(data) {

    document.getElementById("income").textContent =
        data.income !== null && data.income !== undefined
            ? `${formatNumber(data.income)} €`
            : "—";

    document.getElementById("gdp").textContent =
        data.gdp !== null && data.gdp !== undefined
            ? `${formatNumber(data.gdp)} €`
            : "—";

    document.getElementById("unemployment").textContent =
        formatPercent(data.unemployment);

    document.getElementById("companies").textContent =
        formatNumber(data.companies);

    document.getElementById("incomeDetail").textContent =
        data.income !== null && data.income !== undefined
            ? `${formatNumber(data.income)} €`
            : "—";

    document.getElementById("gdpDetail").textContent =
        data.gdp !== null && data.gdp !== undefined
            ? `${formatNumber(data.gdp)} €`
            : "—";

    document.getElementById("unemploymentDetail").textContent =
        formatPercent(data.unemployment);

    document.getElementById("companiesDetail").textContent =
        formatNumber(data.companies);

    if (territoryName) {

        document.getElementById("territoryName").textContent =
            `Economía · ${territoryName}`;

        document.getElementById("territoryDescription").textContent =
            `Indicadores económicos de ${territoryName}.`;

        document.getElementById("territoryEyebrow").textContent =
            `MUNICIPIO · ${territoryName.toUpperCase()} · ECONOMÍA`;

        document.title =
            `Economía · ${territoryName} | Retorika`;
    }
}

function createIncomeChart(data) {

    const canvas = document.getElementById("incomeChart");

    if (!canvas || !data.incomeHistory.years.length) {
        return;
    }

    new Chart(canvas, {
        type: "line",
        data: {
            labels: data.incomeHistory.years,
            datasets: [{
                label: "Ingreso medio mensual",
                data: data.incomeHistory.values,
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
                            `${formatNumber(context.parsed.y)} €`
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

    if (!data.unemploymentHistory.years.length) {
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
                Dato municipal no disponible
            </div>
        `;

        return;
    }

    new Chart(canvas, {
        type: "line",
        data: {
            labels: data.unemploymentHistory.years,
            datasets: [{
                label: "Desempleo",
                data: data.unemploymentHistory.values,
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
                }
            },
            scales: {
                y: {
                    ticks: {
                        callback: value => `${value}%`
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

function createSectorChart(data) {

    const canvas = document.getElementById("sectorChart");

    if (!canvas) {
        return;
    }

    if (!data.sectors.labels.length) {
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
                Datos sectoriales municipales<br>
                no disponibles en el conjunto actual
            </div>
        `;

        return;
    }

    new Chart(canvas, {
        type: "bar",
        data: {
            labels: data.sectors.labels,
            datasets: [{
                data: data.sectors.values,
                borderWidth: 0,
                borderRadius: 4
            }]
        },
        options: {
            indexAxis: "y",
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: context =>
                            `${formatNumber(context.parsed.x)} empresas`
                    }
                }
            },
            scales: {
                x: {
                    beginAtZero: true,
                    ticks: {
                        callback: value =>
                            formatNumber(value)
                    },
                    grid: {
                        color: "#eef1f4"
                    }
                },
                y: {
                    grid: {
                        display: false
                    }
                }
            }
        }
    });
}

const data =
    territoryCode && municipalityEconomy[territoryCode]
        ? municipalityEconomy[territoryCode]
        : galiciaEconomy;

updatePage(data);
createIncomeChart(data);
createUnemploymentChart(data);
createSectorChart(data);