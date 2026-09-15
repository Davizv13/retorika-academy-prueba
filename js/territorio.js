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

let populationChart = null;
let ageChart = null;
let genderChart = null;
let electionChart = null;


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


function formatPercentage(value) {

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
    }) + "%";
}


function showEmptyState() {

    if (territoryName) {
        territoryName.textContent = "Resumen";
    }

    if (breadcrumbTerritory) {
        breadcrumbTerritory.textContent = "Sin territorio";
    }

    if (territoryLevel) {
        territoryLevel.textContent =
            "SELECCIONA UN MUNICIPIO EN EL MAPA";
    }

    document.title = "Resumen | Retorika";


    const elements = [
        population,
        area,
        density,
        ineCode,
        averageAge,
        foreignPopulation,
        foreignPercentage,
        youngPopulation,
        workingPopulation,
        oldPopulation
    ];

    elements.forEach(element => {

        if (element) {
            element.textContent = "—";
        }

    });


    const chartMessages = [
        "populationChart",
        "ageChart",
        "genderChart",
        "electionChart"
    ];


    chartMessages.forEach(id => {

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
                para consultar sus datos.
            </div>
        `;

    });


    const electionCensus =
        document.getElementById("electionCensus");

    const electionParticipation =
        document.getElementById("electionParticipation");

    const electionAbstention =
        document.getElementById("electionAbstention");

    const electionWinner =
        document.getElementById("electionWinner");


    if (electionCensus) {
        electionCensus.textContent = "—";
    }

    if (electionParticipation) {
        electionParticipation.textContent = "—";
    }

    if (electionAbstention) {
        electionAbstention.textContent = "—";
    }

    if (electionWinner) {
        electionWinner.textContent = "—";
    }


    updateLinks(null, null);
}


if (!code) {

    showEmptyState();

} else {

    Promise.all([
        fetch("../data/municipios.json").then(response => response.json()),
        fetch("../data/poblacion_historica.json").then(response => response.json()),
        fetch("../data/elecciones.json").then(response => response.json())
    ])
        .then(([municipios, historica, elecciones]) => {

            const territory = municipios[code];

            if (!territory) {

                showEmptyState();

                return;
            }


            if (territoryName) {
                territoryName.textContent = territory.nombre;
            }

            if (breadcrumbTerritory) {
                breadcrumbTerritory.textContent = territory.nombre;
            }

            if (territoryLevel) {
                territoryLevel.textContent =
                    `MUNICIPIO · ${territory.provincia.toUpperCase()} · ${territory.comunidad.toUpperCase()}`;
            }

            document.title =
                `${territory.nombre} | Retorika`;


            if (population) {
                population.textContent =
                    formatNumber(territory.poblacion);
            }

            if (area) {
                area.textContent =
                    territory.superficie !== undefined
                        ? `${formatDecimal(territory.superficie)} km²`
                        : "—";
            }

            if (density) {
                density.textContent =
                    territory.densidad !== undefined
                        ? `${formatDecimal(territory.densidad)} hab/km²`
                        : "—";
            }

            if (ineCode) {
                ineCode.textContent = code;
            }


            if (averageAge) {
                averageAge.textContent =
                    territory.edadMedia !== undefined
                        ? `${formatDecimal(territory.edadMedia)} años`
                        : "—";
            }

            if (foreignPopulation) {
                foreignPopulation.textContent =
                    territory.extranjeros !== undefined
                        ? formatNumber(territory.extranjeros)
                        : "—";
            }

            if (foreignPercentage) {
                foreignPercentage.textContent =
                    territory.porcentajeExtranjeros !== undefined
                        ? `${formatPercentage(territory.porcentajeExtranjeros)} de la población`
                        : "—";
            }


            if (youngPopulation) {
                youngPopulation.textContent =
                    territory.menores15 !== undefined
                        ? formatNumber(territory.menores15)
                        : "—";
            }

            if (workingPopulation) {
                workingPopulation.textContent =
                    territory.edad15_64 !== undefined
                        ? formatNumber(territory.edad15_64)
                        : "—";
            }

            if (oldPopulation) {
                oldPopulation.textContent =
                    territory.mayores65 !== undefined
                        ? formatNumber(territory.mayores65)
                        : "—";
            }


            const history = historica[code];

            if (history && history.serie) {
                createPopulationChart(history);
            } else {
                showChartEmptyState("populationChart");
            }


            const election = elecciones[code];

            if (election) {
                createElectionChart(election);
            } else {
                showChartEmptyState("electionChart");
            }


            createAgeChart(territory);
            createGenderChart(territory);


            updateLinks(code, territory.nombre);

        })
        .catch(error => {

            console.error(
                "Error cargando los datos del territorio:",
                error
            );

            showEmptyState();

        });
}


function showChartEmptyState(id) {

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
            Datos no disponibles
        </div>
    `;
}


function createPopulationChart(data) {

    const canvas =
        document.getElementById("populationChart");

    if (!canvas || !data || !data.serie) {
        return;
    }

    const labels =
        data.serie.map(item => item.anio);

    const values =
        data.serie.map(item => item.poblacion);


    if (populationChart) {
        populationChart.destroy();
    }


    populationChart = new Chart(canvas, {

        type: "line",

        data: {

            labels: labels,

            datasets: [

                {
                    label: "Población",

                    data: values,

                    borderWidth: 2,

                    tension: 0.35,

                    pointRadius: 2,

                    pointHoverRadius: 5,

                    fill: false
                }

            ]
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

                        label: function (context) {

                            return `${context.parsed.y.toLocaleString("es-ES")} habitantes`;

                        }

                    }

                }

            },

            scales: {

                y: {

                    ticks: {

                        callback: function (value) {

                            return Number(value).toLocaleString("es-ES");

                        }

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

    const canvas =
        document.getElementById("ageChart");

    if (!canvas) {
        return;
    }


    if (ageChart) {
        ageChart.destroy();
    }


    ageChart = new Chart(canvas, {

        type: "doughnut",

        data: {

            labels: [
                "0–14 años",
                "15–64 años",
                "65 años o más"
            ],

            datasets: [

                {
                    data: [

                        territory.menores15 || 0,

                        territory.edad15_64 || 0,

                        territory.mayores65 || 0

                    ],

                    borderWidth: 0

                }

            ]

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

    const canvas =
        document.getElementById("genderChart");

    if (!canvas) {
        return;
    }


    if (genderChart) {
        genderChart.destroy();
    }


    genderChart = new Chart(canvas, {

        type: "bar",

        data: {

            labels: [
                "Hombres",
                "Mujeres"
            ],

            datasets: [

                {
                    data: [

                        territory.hombres || 0,

                        territory.mujeres || 0

                    ],

                    borderWidth: 0,

                    borderRadius: 4

                }

            ]

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

                        callback: function (value) {

                            return Number(value).toLocaleString("es-ES");

                        }

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

    const canvas =
        document.getElementById("electionChart");

    if (!canvas || !election || !election.candidaturas) {
        return;
    }


    const results =
        Object.entries(election.candidaturas)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 6);


    if (electionChart) {
        electionChart.destroy();
    }


    electionChart = new Chart(canvas, {

        type: "bar",

        data: {

            labels:
                results.map(item => item[0]),

            datasets: [

                {
                    label: "Votos",

                    data:
                        results.map(item => item[1]),

                    borderWidth: 0,

                    borderRadius: 4

                }

            ]

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

                        label: function (context) {

                            return `${context.parsed.x.toLocaleString("es-ES")} votos`;

                        }

                    }

                }

            },

            scales: {

                x: {

                    beginAtZero: true,

                    ticks: {

                        callback: function (value) {

                            return Number(value).toLocaleString("es-ES");

                        }

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


    const census =
        document.getElementById("electionCensus");

    const participation =
        document.getElementById("electionParticipation");

    const abstention =
        document.getElementById("electionAbstention");

    const winner =
        document.getElementById("electionWinner");


    if (census) {
        census.textContent =
            formatNumber(election.censo);
    }


    if (participation && election.censo) {

        participation.textContent =
            `${((election.votos / election.censo) * 100).toLocaleString("es-ES", {
                minimumFractionDigits: 1,
                maximumFractionDigits: 1
            })}%`;

    }


    if (abstention && election.censo) {

        abstention.textContent =
            `${((election.abstencion / election.censo) * 100).toLocaleString("es-ES", {
                minimumFractionDigits: 1,
                maximumFractionDigits: 1
            })}%`;

    }


    if (winner) {
        winner.textContent =
            election.ganador || "—";
    }

}


function updateLinks(code, name) {

    if (!code) {
        return;
    }

    const query =
        `?code=${encodeURIComponent(code)}&name=${encodeURIComponent(name || "")}`;

    const economyLink =
        document.getElementById("economyLink");

    if (economyLink) {
        economyLink.href =
            `economia.html${query}`;
    }

    const electionsLink =
        document.getElementById("electionsLink");

    if (electionsLink) {
        electionsLink.href =
            `elecciones.html${query}`;
    }

    const institutionsLink =
        document.getElementById("institutionsLink");

    if (institutionsLink) {
        institutionsLink.href =
            `instituciones.html${query}`;
    }

    const reportsLink =
        document.getElementById("reportsLink");

    if (reportsLink) {
        reportsLink.href =
            `informes.html${query}`;
    }

    const sidebarLinks =
        document.querySelectorAll(".sidebar-link");

    sidebarLinks.forEach(link => {

        const text =
            link.textContent
                .replace(/\s+/g, " ")
                .trim();

        if (text.includes("Economía")) {
            link.href =
                `economia.html${query}`;
        }

        if (text.includes("Elecciones")) {
            link.href =
                `elecciones.html${query}`;
        }

        if (text.includes("Resumen")) {
            link.href =
                `territorio.html${query}`;
        }

        if (text.includes("Demografía")) {
            link.href =
                `territorio.html${query}#demografia`;
        }

        if (text.includes("Instituciones")) {
            link.href =
                `instituciones.html${query}`;
        }

        if (text.includes("Informes")) {
            link.href =
                `informes.html${query}`;
        }

        if (text.includes("Comparar")) {
            link.href =
                `comparar.html${query}`;
        }

    });
}