const params = new URLSearchParams(window.location.search);

const territoryCode = params.get("code");
const territoryName = params.get("name");

if (territoryCode) {
    document.body.classList.add("municipal-view");
}

const galiciaElection = {
    participation: 67.31,
    abstention: 32.69,
    validVotes: 1498287,

    parties: [
        { name: "PP", votes: 700491, percentage: 47.36, seats: 40 },
        { name: "BNG", votes: 467074, percentage: 31.57, seats: 25 },
        { name: "PSdeG-PSOE", votes: 207691, percentage: 14.04, seats: 9 },
        { name: "DO", votes: 15312, percentage: 1.03, seats: 1 },
        { name: "VOX", votes: 32493, percentage: 2.19, seats: 0 },
        { name: "SUMAR", votes: 28171, percentage: 1.90, seats: 0 }
    ],

    historical: {
        years: [2001, 2005, 2009, 2012, 2016, 2020, 2024],
        PP: [791885, 756562, 789427, 661281, 682150, 627762, 700491],
        BNG: [346423, 311954, 270712, 146027, 119446, 311340, 467074],
        PSOE: [334819, 555603, 524488, 297584, 256381, 253750, 207691],
        participation: [60.15, 64.20, 64.41, 54.94, 53.62, 49.01, 67.31]
    }
};

function formatNumber(value) {
    return Number(value).toLocaleString("es-ES");
}

function calculatePercentage(value, total) {
    if (!total) return 0;

    return Number(((value / total) * 100).toFixed(2));
}

async function loadElection() {

    let currentElection = galiciaElection;
    let isMunicipality = false;

    if (territoryCode) {

        try {

            const response = await fetch("../data/elecciones.json");

            if (!response.ok) {
                throw new Error("No se pudo cargar elecciones.json");
            }

            const elections = await response.json();

            const municipality = elections[territoryCode];

            if (municipality) {

                isMunicipality = true;

                const parties = Object.entries(municipality.candidaturas)
                    .map(([name, votes]) => ({
                        name,
                        votes,
                        percentage: calculatePercentage(votes, municipality.validos),
                        seats: 0
                    }))
                    .sort((a, b) => b.votes - a.votes)
                    .slice(0, 8);

                currentElection = {
                    participation: calculatePercentage(
                        municipality.votos,
                        municipality.censo
                    ),

                    abstention: calculatePercentage(
                        municipality.abstencion,
                        municipality.censo
                    ),

                    validVotes: municipality.validos,

                    parties,

                    historical: null
                };
            }

        } catch (error) {
            console.error("Error cargando elecciones:", error);
        }
    }

    updateTerritoryHeader(isMunicipality);
    updateKpis(currentElection);
    createResultsChart(currentElection);
    createSeatsChart(currentElection);
    createEvolutionChart(currentElection);
    createParticipationChart(currentElection);
    renderPartyResults(currentElection);
}

function updateTerritoryHeader(isMunicipality) {

    const title = document.querySelector(".territory-header h1");
    const subtitle = document.querySelector(".territory-header p");
    const eyebrow = document.querySelector(".territory-header .eyebrow");

    if (isMunicipality && territoryName) {

        if (title) {
            title.textContent = `Elecciones · ${territoryName}`;
        }

        if (subtitle) {
            subtitle.textContent =
                `Resultados electorales de ${territoryName}.`;
        }

        if (eyebrow) {
            eyebrow.textContent =
                `MUNICIPIO · ${territoryName.toUpperCase()} · 18 FEBRERO 2024`;
        }

        document.title = `Elecciones · ${territoryName} | Retorika`;

    } else {

        if (title) {
            title.textContent = "Elecciones autonómicas";
        }

        if (subtitle) {
            subtitle.textContent =
                "Resultados electorales y participación territorial.";
        }

        if (eyebrow) {
            eyebrow.textContent =
                "GALICIA · 18 FEBRERO 2024";
        }
    }
}

function updateKpis(election) {
    document.getElementById("participation").textContent =
        `${election.participation.toLocaleString("es-ES")}%`;

    document.getElementById("abstention").textContent =
        `${election.abstention.toLocaleString("es-ES")}%`;

    document.getElementById("validVotes").textContent =
        formatNumber(election.validVotes);
}

function createResultsChart(election) {

    const canvas = document.getElementById("resultsChart");

    if (!canvas) return;

    const sorted = [...election.parties]
        .sort((a, b) => b.votes - a.votes);

    new Chart(canvas, {
        type: "bar",

        data: {
            labels: sorted.map(p => p.name),

            datasets: [{
                data: sorted.map(p => p.votes),
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
                            `${formatNumber(context.parsed.x)} votos`
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

function createSeatsChart(election) {

    const canvas = document.getElementById("seatsChart");

    if (!canvas) return;

    const parties = election.parties
        .filter(p => p.seats > 0);

    if (!parties.length) {

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
                Los escaños solo se muestran<br>
                en la vista autonómica.
            </div>
        `;

        return;
    }

    new Chart(canvas, {
        type: "doughnut",

        data: {
            labels: parties.map(p => p.name),

            datasets: [{
                data: parties.map(p => p.seats),
                borderWidth: 0
            }]
        },

        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: "65%",

            plugins: {
                legend: {
                    position: "bottom"
                }
            }
        }
    });
}

function createEvolutionChart(election) {
    const canvas = document.getElementById("evolutionChart");

    if (!canvas) return;

    if (!election.historical) {
        const container = canvas.parentElement;

        container.innerHTML = `
            <div class="municipal-evolution">
                <div class="municipal-evolution-chart">
                    

                    <div class="evolution-point">
                        <div class="evolution-point-marker"></div>
                        <div class="evolution-point-label">
                            <strong>${election.parties[0]?.name || "—"}</strong>
                            <span>${formatNumber(election.parties[0]?.votes || 0)} votos</span>
                        </div>
                    </div>

                    <div class="evolution-line"></div>

                    <div class="evolution-secondary">
                        ${election.parties.slice(1, 4).map(party => `
                            <div class="evolution-secondary-item">
                                <span>${party.name}</span>
                                <strong>${formatNumber(party.votes)}</strong>
                            </div>
                        `).join("")}
                    </div>
                </div>

                <div class="evolution-footer">
                    <span>Última elección disponible</span>
                    <strong>Elecciones al Parlamento de Galicia · 2024</strong>
                </div>
            </div>
        `;

        return;
    }

    const historical = election.historical;

    new Chart(canvas, {
        type: "line",

        data: {
            labels: historical.years,

            datasets: [
                {
                    label: "PP",
                    data: historical.PP,
                    borderWidth: 2,
                    tension: 0.3
                },
                {
                    label: "BNG",
                    data: historical.BNG,
                    borderWidth: 2,
                    tension: 0.3
                },
                {
                    label: "PSdeG",
                    data: historical.PSOE,
                    borderWidth: 2,
                    tension: 0.3
                }
            ]
        },

        options: {
            responsive: true,
            maintainAspectRatio: false,

            plugins: {
                legend: {
                    position: "bottom"
                }
            },

            scales: {
                y: {
                    ticks: {
                        callback: value => formatNumber(value)
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

function createParticipationChart(election) {
    const canvas = document.getElementById("participationChart");

    if (!canvas) return;

    if (!election.historical) {
        const container = canvas.parentElement;

        container.innerHTML = `
            <div class="municipal-participation">
                <div class="municipal-participation-value">
                    ${election.participation.toLocaleString("es-ES")}%
                </div>

                <span>Participación en 2024</span>

                <div class="municipal-participation-bar">
                    <div style="width:${election.participation}%"></div>
                </div>

                <small>
                    La serie histórica municipal no está incluida en el conjunto de datos actual.
                </small>
            </div>
        `;

        return;
    }

    const historical = election.historical;

    new Chart(canvas, {
        type: "line",

        data: {
            labels: historical.years,

            datasets: [{
                label: "Participación",
                data: historical.participation,
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
                    min: 40,
                    max: 75,

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

function renderPartyResults(election) {

    const container = document.getElementById("partyResults");

    if (!container) return;

    const sorted = [...election.parties]
        .sort((a, b) => b.votes - a.votes);

    container.innerHTML = sorted.map(party => `
        <div class="election-party-row">

            <div>
                <strong>${party.name}</strong>
                <span>
                    ${formatNumber(party.votes)} votos
                </span>
            </div>

            <div class="election-party-percentage">
                <strong>${party.percentage.toLocaleString("es-ES")}%</strong>
                <span>
                    ${territoryCode ? "—" : `${party.seats} escaños`}
                </span>
            </div>

        </div>
    `).join("");
}

loadElection();