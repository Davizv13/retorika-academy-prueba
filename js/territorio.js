const params = new URLSearchParams(window.location.search);

const name = params.get("name");
const code = params.get("code");

const territoryName = document.getElementById("territoryName");
const breadcrumbTerritory = document.getElementById("breadcrumbTerritory");
const territoryLevel = document.getElementById("territoryLevel");

const population = document.getElementById("population");
const area = document.getElementById("area");
const density = document.getElementById("density");
const ineCode = document.getElementById("ineCode");

const averageAge = document.getElementById("averageAge");
const foreignPopulation = document.getElementById("foreignPopulation");
const foreignPercentage = document.getElementById("foreignPercentage");

const youngPopulation = document.getElementById("youngPopulation");
const workingPopulation = document.getElementById("workingPopulation");
const oldPopulation = document.getElementById("oldPopulation");

let populationChart;
let ageChart;
let genderChart;
let electionChart;

const formatNumber = value => {
    if (value === undefined || value === null) return "—";

    return Number(value).toLocaleString("es-ES");
};

const formatDecimal = value => {
    if (value === undefined || value === null) return "—";

    return Number(value).toLocaleString("es-ES", {
        minimumFractionDigits: 1,
        maximumFractionDigits: 1
    });
};

Promise.all([
    fetch("../data/municipios.json").then(response => response.json()),
    fetch("../data/poblacion_historica.json").then(response => response.json()),
    fetch("../data/elecciones.json").then(response => response.json())
])
    .then(([municipios, historica, elecciones]) => {

        const territory = municipios[code];

        if (!territory) {
            territoryName.textContent = name || "Territorio";
            breadcrumbTerritory.textContent = name || "Territorio";
            ineCode.textContent = code || "—";
            return;
        }

        territoryName.textContent = territory.nombre;
        breadcrumbTerritory.textContent = territory.nombre;

        territoryLevel.textContent =
            `MUNICIPIO · ${territory.provincia.toUpperCase()} · ${territory.comunidad.toUpperCase()}`;

        document.title = `${territory.nombre} | Retorika`;

        population.textContent = formatNumber(territory.poblacion);

        area.textContent = territory.superficie
            ? `${formatDecimal(territory.superficie)} km²`
            : "—";

        density.textContent = formatDecimal(territory.densidad);

        ineCode.textContent = code || "—";

        averageAge.textContent = territory.edadMedia
            ? formatDecimal(territory.edadMedia)
            : "—";

        foreignPopulation.textContent =
            territory.extranjeros !== undefined
                ? formatNumber(territory.extranjeros)
                : "—";

        if (territory.extranjeros !== undefined && territory.poblacion) {
            const percentage =
                territory.extranjeros / territory.poblacion * 100;

            foreignPercentage.textContent =
                `${percentage.toLocaleString("es-ES", {
                    minimumFractionDigits: 1,
                    maximumFractionDigits: 1
                })}% de la población`;
        }

        youngPopulation.textContent =
            territory.menores15 !== undefined
                ? formatNumber(territory.menores15)
                : "—";

        workingPopulation.textContent =
            territory.edad15_64 !== undefined
                ? formatNumber(territory.edad15_64)
                : "—";

        oldPopulation.textContent =
            territory.mayores65 !== undefined
                ? formatNumber(territory.mayores65)
                : "—";

        const history = historica[code];

        if (history) {
            createPopulationChart(history);
        }

        const election = elecciones[code];

        if (election) {
            const electionCensus = document.getElementById("electionCensus");
            const electionParticipation = document.getElementById("electionParticipation");
            const electionAbstention = document.getElementById("electionAbstention");
            const electionWinner = document.getElementById("electionWinner");

            if (electionCensus) {
                electionCensus.textContent = formatNumber(election.censo);
            }

            if (electionParticipation) {
                const participation =
                    election.votos / election.censo * 100;

                electionParticipation.textContent =
                    `${participation.toLocaleString("es-ES", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                    })}%`;
            }

            if (electionAbstention) {
                const abstention =
                    election.abstencion / election.censo * 100;

                electionAbstention.textContent =
                    `${abstention.toLocaleString("es-ES", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                    })}%`;
            }

            if (electionWinner) {
                electionWinner.textContent = election.ganador || "—";
            }

            createElectionChart(election);
        }

        createAgeChart(territory);
        createGenderChart(territory);

    })
    .catch(error => {
        console.error("Error cargando datos:", error);
    });

function createPopulationChart(data) {

    const canvas = document.getElementById("populationChart");

    if (!canvas) return;

    populationChart = new Chart(canvas, {
        type: "line",
        data: {
            labels: data.años,
            datasets: [{
                label: "Población",
                data: data.poblacion,
                borderWidth: 2,
                tension: 0.35,
                pointRadius: 3,
                pointHoverRadius: 5,
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
                            `${context.parsed.y.toLocaleString("es-ES")} habitantes`
                    }
                }
            },
            scales: {
                y: {
                    ticks: {
                        callback: value =>
                            Number(value).toLocaleString("es-ES")
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

function createAgeChart(territory) {

    const canvas = document.getElementById("ageChart");

    if (!canvas) return;

    ageChart = new Chart(canvas, {
        type: "doughnut",
        data: {
            labels: [
                "0–14 años",
                "15–64 años",
                "65 años o más"
            ],
            datasets: [{
                data: [
                    territory.menores15 || 0,
                    territory.edad15_64 || 0,
                    territory.mayores65 || 0
                ],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: "68%",
            plugins: {
                legend: {
                    position: "bottom"
                }
            }
        }
    });
}

function createGenderChart(territory) {

    const canvas = document.getElementById("genderChart");

    if (!canvas) return;

    genderChart = new Chart(canvas, {
        type: "bar",
        data: {
            labels: ["Hombres", "Mujeres"],
            datasets: [{
                data: [
                    territory.hombres || 0,
                    territory.mujeres || 0
                ],
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
                }
            },
            scales: {
                x: {
                    ticks: {
                        callback: value =>
                            Number(value).toLocaleString("es-ES")
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

function createElectionChart(election) {

    const canvas = document.getElementById("electionChart");

    if (!canvas || !election.candidaturas) return;

    const results = Object.entries(election.candidaturas)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 8);

    electionChart = new Chart(canvas, {
        type: "bar",
        data: {
            labels: results.map(item => item[0]),
            datasets: [{
                label: "Votos",
                data: results.map(item => item[1]),
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
                            `${context.parsed.x.toLocaleString("es-ES")} votos`
                    }
                }
            },
            scales: {
                x: {
                    beginAtZero: true,
                    ticks: {
                        callback: value =>
                            Number(value).toLocaleString("es-ES")
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

    const census = document.getElementById("electionCensus");
    const participation = document.getElementById("electionParticipation");
    const abstention = document.getElementById("electionAbstention");
    const winner = document.getElementById("electionWinner");

    if (census) {
        census.textContent = formatNumber(election.censo);
    }

    if (participation) {
        participation.textContent =
            `${((election.votos / election.censo) * 100).toLocaleString("es-ES", {
                minimumFractionDigits: 1,
                maximumFractionDigits: 1
            })}%`;
    }

    if (abstention) {
        abstention.textContent =
            `${((election.abstencion / election.censo) * 100).toLocaleString("es-ES", {
                minimumFractionDigits: 1,
                maximumFractionDigits: 1
            })}%`;
    }

    if (winner) {
        winner.textContent = election.ganador || "—";
    }
}

if (code) {
    const query = `?code=${encodeURIComponent(code)}&name=${encodeURIComponent(name || "")}`;

const economyLink = document.getElementById("economyLink");

if (economyLink && code) {
    economyLink.href =
        `economia.html?code=${encodeURIComponent(code)}&name=${encodeURIComponent(name || "")}`;
}

    document.querySelectorAll(".sidebar-link").forEach(link => {
        const text = link.textContent.trim();

        if (text === "Economía") {
            link.href = `economia.html${query}`;
        }

        if (text === "Elecciones") {
            link.href = `elecciones.html${query}`;
        }

        if (text === "Resumen") {
            link.href = `territorio.html${query}`;
        }

        if (text === "Demografía") {
            link.href = `territorio.html${query}#demografia`;
        }

        if (text === "Instituciones") {
            link.href = `territorio.html${query}#instituciones`;
        }
    });
}

if (code) {
    const query = `?code=${encodeURIComponent(code)}&name=${encodeURIComponent(name || "")}`;

    document.querySelectorAll(".sidebar-link").forEach(link => {
        const text = link.textContent.trim();

        if (text === "Economía") {
            link.href = `economia.html${query}`;
        }

        if (text === "Elecciones") {
            link.href = `elecciones.html${query}`;
        }

        if (text === "Resumen") {
            link.href = `territorio.html${query}`;
        }

        if (text === "Demografía") {
            link.href = `territorio.html${query}#demografia`;
        }

        if (text === "Instituciones") {
            link.href = `territorio.html${query}#instituciones`;
        }
    });
}

function createElectionChart(election) {
    const canvas = document.getElementById("electionChart");

    if (!canvas) return;

    const parties = Object.entries(election.candidaturas)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 6);

    new Chart(canvas, {
        type: "bar",
        data: {
            labels: parties.map(party => party[0]),
            datasets: [{
                data: parties.map(party => party[1]),
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
                            `${context.parsed.x.toLocaleString("es-ES")} votos`
                    }
                }
            },
            scales: {
                x: {
                    ticks: {
                        callback: value =>
                            Number(value).toLocaleString("es-ES")
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