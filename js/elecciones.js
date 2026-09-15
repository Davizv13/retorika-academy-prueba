const params = new URLSearchParams(window.location.search);

const territoryCode = params.get("code");
const territoryName = params.get("name");

if (territoryCode) {
    document.body.classList.add("municipal-view");
}

function formatNumber(value) {
    return Number(value).toLocaleString("es-ES");
}

function calculatePercentage(value, total) {
    if (!total) return 0;

    return Number(((value / total) * 100).toFixed(2));
}

async function loadElection() {

    if (!territoryCode) {
        updateTerritoryHeader(false);
        showEmptyState();
        return;
    }

    try {

        const response = await fetch("../data/elecciones.json");

        if (!response.ok) {
            throw new Error("No se pudo cargar elecciones.json");
        }

        const elections = await response.json();
        const municipality = elections[territoryCode];

        if (!municipality) {
            updateTerritoryHeader(false);
            showEmptyState();
            return;
        }

        const parties = Object.entries(municipality.candidaturas)
            .map(([name, votes]) => ({
                name,
                votes,
                percentage: calculatePercentage(
                    votes,
                    municipality.validos
                ),
                seats: 0
            }))
            .sort((a, b) => b.votes - a.votes)
            .slice(0, 8);

        const currentElection = {

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

        updateTerritoryHeader(true);
        updateKpis(currentElection);
        createResultsChart(currentElection);
        createSeatsChart(currentElection);
        createEvolutionChart(currentElection);
        createParticipationChart(currentElection);
        renderPartyResults(currentElection);

    } catch (error) {

        console.error("Error cargando elecciones:", error);

        updateTerritoryHeader(false);
        showEmptyState();
    }
}

function showEmptyState() {

    document.getElementById("participation").textContent = "—";
    document.getElementById("abstention").textContent = "—";
    document.getElementById("validVotes").textContent = "—";

    const containers = [
        "resultsChart",
        "seatsChart",
        "evolutionChart",
        "participationChart"
    ];

    containers.forEach(id => {

        const canvas = document.getElementById(id);

        if (!canvas) return;

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
                para consultar sus datos electorales.
            </div>
        `;
    });

    const table = document.getElementById("partyResults");

    if (table) {

        table.innerHTML = `
            <tr>
                <td colspan="4" style="
                    text-align:center;
                    color:#98a2b3;
                    padding:30px;
                ">
                    Selecciona un municipio en el mapa para consultar sus datos electorales.
                </td>
            </tr>
        `;
    }

    const source = document.getElementById("resultsSource");
    const partySource = document.getElementById("partyResultsSource");

    if (source) {
        source.textContent = "Sin territorio seleccionado";
    }

    if (partySource) {
        partySource.textContent = "Sin territorio seleccionado";
    }
}

function updateTerritoryHeader(isMunicipality) {

    const title = document.querySelector(".territory-header h1");
    const subtitle = document.querySelector(".territory-header p");
    const eyebrow = document.querySelector(".territory-header .eyebrow");
    const resultsSource = document.getElementById("resultsSource");
    const partyResultsSource =
        document.getElementById("partyResultsSource");

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

        if (resultsSource) {
            resultsSource.textContent =
                `${territoryName} · 2024`;
        }

        if (partyResultsSource) {
            partyResultsSource.textContent =
                `${territoryName} · 2024`;
        }

        document.title =
            `Elecciones · ${territoryName} | Retorika`;

    } else {

        if (title) {
            title.textContent = "Elecciones";
        }

        if (subtitle) {
            subtitle.textContent =
                "Selecciona un municipio en el mapa para consultar sus datos electorales.";
        }

        if (eyebrow) {
            eyebrow.textContent =
                "SIN TERRITORIO SELECCIONADO";
        }

        if (resultsSource) {
            resultsSource.textContent =
                "Sin territorio seleccionado";
        }

        if (partyResultsSource) {
            partyResultsSource.textContent =
                "Sin territorio seleccionado";
        }

        document.title =
            "Elecciones | Retorika";
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

    const container = canvas.parentElement;

    container.innerHTML = `
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
}

function createEvolutionChart(election) {

    const canvas = document.getElementById("evolutionChart");

    if (!canvas) return;

    const container = canvas.parentElement;

    container.innerHTML = `
        <div class="municipal-evolution">
            <div class="municipal-evolution-chart">

                <div class="evolution-point">
                    <div class="evolution-point-marker"></div>

                    <div class="evolution-point-label">
                        <strong>
                            ${election.parties[0]?.name || "—"}
                        </strong>

                        <span>
                            ${formatNumber(
                                election.parties[0]?.votes || 0
                            )} votos
                        </span>
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

                <strong>
                    Elecciones al Parlamento de Galicia · 2024
                </strong>
            </div>
        </div>
    `;
}

function createParticipationChart(election) {

    const canvas = document.getElementById("participationChart");

    if (!canvas) return;

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
                La serie histórica municipal no está incluida
                en el conjunto de datos actual.
            </small>

        </div>
    `;
}

function renderPartyResults(election) {

    const container = document.getElementById("partyResults");

    if (!container) return;

    const sorted = [...election.parties]
        .sort((a, b) => b.votes - a.votes);

    container.innerHTML = sorted.map((party, index) => `
        <tr>

            <td>
                <span class="position-number">
                    ${index + 1}
                </span>
            </td>

            <td>
                <strong>${party.name}</strong>
            </td>

            <td>
                ${formatNumber(party.votes)}
            </td>

            <td>
                ${party.percentage.toLocaleString("es-ES")}%
            </td>

        </tr>
    `).join("");
}

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
            link.href = `territorio.html${query}#instituciones`;
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
loadElection();