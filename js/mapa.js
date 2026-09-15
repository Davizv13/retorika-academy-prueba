const map = L.map("map", {
    zoomControl: true,
    attributionControl: true
}).setView([40.2, -3.7], 5.5);

const spainBounds = [
    [35.8, -9.5],
    [43.9, 4.5]
];

let currentLayer = null;
let currentLevel = "comunidades";
let selectedCommunity = null;
let selectedProvince = null;
let electionData = {};



const layerIds = {
    comunidades: 17,
    provincias: 16,
    municipios: 15
};

const communityProvinces = {
    "01": ["04", "11", "14", "18", "21", "23", "29", "41"],
    "02": ["22", "44", "50"],
    "03": ["33"],
    "04": ["07"],
    "05": ["35", "38"],
    "06": ["39"],
    "07": ["05", "09", "24", "34", "37", "40", "42", "47", "49"],
    "08": ["02", "13", "16", "19", "45"],
    "09": ["08", "17", "25", "43"],
    "10": ["03", "12", "46"],
    "11": ["06", "10"],
    "12": ["15", "27", "32", "36"],
    "13": ["28"],
    "14": ["30"],
    "15": ["31"],
    "16": ["01", "20", "48"],
    "17": ["26"]
};

const styles = {
    default: {
        color: "#163A5F",
        weight: 1,
        fillColor: "#DCE8F2",
        fillOpacity: 0.85
    },
    hover: {
        color: "#0B5CAD",
        weight: 2,
        fillColor: "#B8D4EA",
        fillOpacity: 1
    }
};


function getElectionColor(code) {

    const election = electionData[code];

    if (!election || !election.ganador) {
        return {
            color: "#CBD5E1",
            fillColor: "#E2E8F0",
            fillOpacity: 0.85
        };
    }

    const winner = election.ganador;

    if (winner === "PP") {
        return {
            color: "#163A5F",
            fillColor: "#2563EB",
            fillOpacity: 0.85
        };
    }

    if (winner === "PSdeG-PSOE" || winner === "PSOE") {
        return {
            color: "#991B1B",
            fillColor: "#EF4444",
            fillOpacity: 0.85
        };
    }

    if (winner === "BNG") {
        return {
            color: "#166534",
            fillColor: "#22C55E",
            fillOpacity: 0.85
        };
    }

    return {
        color: "#64748B",
        fillColor: "#CBD5E1",
        fillOpacity: 0.85
    };
}


function getName(properties) {
    return (
        properties.nameunit ||
        properties.NAMEUNIT ||
        properties.NameUnit ||
        properties.nombre ||
        properties.NOMBRE ||
        properties.name ||
        properties.NAME ||
        "Territorio"
    );
}

function createQueryUrl(layerId, where) {
    return (
        `https://certiserviciosgis.ign.es/servicios/rest/services/signa/Unidades_Administrativas/MapServer/${layerId}/query` +
        `?where=${encodeURIComponent(where)}` +
        "&outFields=*" +
        "&returnGeometry=true" +
        "&f=geojson"
    );
}

function loadLevel(level, where = "1=1") {
    currentLevel = level;

    const url = createQueryUrl(layerIds[level], where);

    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error("No se pudo cargar el mapa");
            }

            return response.json();
        })
        .then(data => {
            if (!data.features) {
                console.error("Respuesta del IGN:", data);
                throw new Error("El IGN no devolvió un GeoJSON válido");
            }

            if (currentLayer) {
                map.removeLayer(currentLayer);
            }

            currentLayer = L.geoJSON(data, {
                style: feature => {
                    const properties = feature.properties || {};
                    const code = String(properties.codine || "");

                    if (currentLevel === "municipios") {
                        return getElectionColor(code);
                    }

                    return styles.default;
                },

                onEachFeature: (feature, layer) => {
                    const properties = feature.properties || {};
                    const name = getName(properties);

                    layer.bindTooltip(name, {
                        sticky: true
                    });

                    layer.on({
                        mouseover: event => {
                            event.target.setStyle(styles.hover);
                        },

                        mouseout: event => {
                            currentLayer.resetStyle(event.target);
                        },

                        click: () => {
                            handleTerritoryClick(properties);
                        }
                    });
                }
            }).addTo(map);

            if (currentLayer.getLayers().length) {
                map.fitBounds(currentLayer.getBounds(), {
                    padding: [20, 20]
                });

                const countElement = document.getElementById("territoryCount");

                if (countElement) {
                    if (currentLevel === "comunidades") {
                        countElement.textContent = "17 comunidades";
                    }

                    if (currentLevel === "provincias") {
                        countElement.textContent = `${currentLayer.getLayers().length} provincias`;
                    }

                    if (currentLevel === "municipios") {
                        countElement.textContent = `${currentLayer.getLayers().length} municipios`;
                    }
                }
            }
        })
        .catch(error => {
            console.error("Error cargando territorio:", error);
        });
}

function handleTerritoryClick(properties) {
    const name = getName(properties);
    const code = String(properties.codine || "");

    console.log("Territorio seleccionado:", name);
    console.log("Código INE:", code);

    if (currentLevel === "comunidades") {
        selectedCommunity = code;
        localStorage.setItem("territoryContext", JSON.stringify({
            level: "comunidad",
            code: code,
            name: name
        }));

        const provinces = communityProvinces[code];

        if (!provinces) {
            console.error("No existe una relación de provincias para:", code);
            return;
        }

        const provinceQuery = `codine IN (${provinces
            .map(code => `'${code}'`)
            .join(",")})`;

        updateMapDescription("Provincias de " + name, provinces.length);

        loadLevel("provincias", provinceQuery);
        return;
    }

    if (currentLevel === "provincias") {
        selectedProvince = code;

        const provinceCode = code.padStart(2, "0").substring(0, 2);

        localStorage.setItem("territoryContext", JSON.stringify({
            level: "provincia",
            code: provinceCode,
            name: name
        }));

        const municipalityQuery = `codine LIKE '${provinceCode}%'`;

        console.log("Provincia:", name);
        console.log("Código provincia:", provinceCode);
        console.log("Consulta municipios:", municipalityQuery);

        updateMapDescription("Municipios de " + name, null);

        loadLevel("municipios", municipalityQuery);
        return;
    }

    if (currentLevel === "municipios") {
        localStorage.setItem("territoryContext", JSON.stringify({
            level: "municipio",
            code: code,
            name: name
        }));

        window.location.href =
            `territorio.html?name=${encodeURIComponent(name)}&code=${encodeURIComponent(code)}`;
    }
}

function updateMapDescription(description, count, label = "provincias") {
    const descriptionElement =
        document.getElementById("mapDescription");

    const countElement =
        document.getElementById("territoryCount");

    if (descriptionElement) {
        descriptionElement.textContent = description;
    }

    if (countElement && count !== null) {
        countElement.textContent = `${count} ${label}`;
    }
}

document.querySelectorAll(".level-button").forEach(button => {
    button.addEventListener("click", () => {
        document.querySelectorAll(".level-button").forEach(item => {
            item.classList.remove("active");
        });

        button.classList.add("active");

        const level = button.dataset.level;

        const descriptions = {
            comunidades: "Comunidades autónomas",
            provincias: "Provincias",
            municipios: "Municipios"
        };

        const countLabels = {
            comunidades: "17 comunidades",
            provincias: "50 provincias",
            municipios: "8.000+ municipios"
        };

        document.getElementById("mapDescription").textContent =
            descriptions[level];

        document.getElementById("territoryCount").textContent =
            countLabels[level];

        if (level === "comunidades") {
            loadLevel("comunidades");
        }

        if (level === "provincias") {
            loadLevel("provincias");
        }

        if (level === "municipios") {
            loadLevel("municipios");
        }
    });
});

document.getElementById("resetMap")?.addEventListener("click", () => {
    selectedCommunity = null;
    selectedProvince = null;
    localStorage.removeItem("territoryContext");

    document.querySelectorAll(".level-button").forEach(item => {
        item.classList.remove("active");
    });

    document
        .querySelector('.level-button[data-level="comunidades"]')
        ?.classList.add("active");

    document.getElementById("mapDescription").textContent =
        "Comunidades autónomas";

    document.getElementById("territoryCount").textContent =
        "17 comunidades";

    loadLevel("comunidades");
    map.fitBounds(spainBounds);
});

const searchInput = document.getElementById("territorySearch");

searchInput?.addEventListener("input", event => {
    const search = event.target.value.toLowerCase().trim();

    document.querySelectorAll(".territory-item").forEach(item => {
        const name =
            item.querySelector("strong")?.textContent.toLowerCase() || "";

        item.style.display = name.includes(search) ? "flex" : "none";
    });
});

document.getElementById("sortButton")?.addEventListener("click", () => {
    const container = document.getElementById("territoryItems");
    const items = [...container.querySelectorAll(".territory-item")];

    items
        .sort((a, b) => {
            const nameA = a.querySelector("strong").textContent;
            const nameB = b.querySelector("strong").textContent;

            return nameA.localeCompare(nameB, "es");
        })
        .forEach(item => container.appendChild(item));
});

fetch("../data/elecciones.json")
    .then(response => response.json())
    .then(data => {
        electionData = data;
        loadLevel("comunidades");
    })
    .catch(error => {
        console.error("Error cargando elecciones:", error);
        loadLevel("comunidades");
    });