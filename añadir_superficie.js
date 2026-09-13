const fs = require("fs");

const municipiosFile = "./data/municipios_generado.json";
const superficieFile = "./data/t77.csv";
const outputFile = "./data/municipios_completo.json";

const municipios = JSON.parse(
    fs.readFileSync(municipiosFile, "utf8")
);

const csv = fs.readFileSync(superficieFile, "utf8");

const lineas = csv
    .split(/\r?\n/)
    .map(linea => linea.trim())
    .filter(Boolean);

const superficies = {};

for (const linea of lineas) {
    const match = linea.match(/^"([^"]+)";"([^"]*)"$/);

    if (!match) {
        continue;
    }

    const espacio = match[1];
    const valor = match[2];

    const codigoMatch = espacio.match(/^(\d{5})\s+/);

    if (!codigoMatch) {
        continue;
    }

    const codigo = codigoMatch[1];

    if (valor === "-" || valor === "") {
        continue;
    }

    const superficie = Number(
        valor.replace(",", ".")
    );

    if (!Number.isFinite(superficie)) {
        continue;
    }

    superficies[codigo] = superficie;
}

const provincias = {
    "15": "A Coruña",
    "27": "Lugo",
    "32": "Ourense",
    "36": "Pontevedra"
};

for (const codigo of Object.keys(municipios)) {
    const municipio = municipios[codigo];

    const codigoProvincia = codigo.substring(0, 2);

    municipio.provincia =
        provincias[codigoProvincia] || "";

    municipio.comunidad = "Galicia";

    municipio.superficie =
        superficies[codigo] || 0;

    municipio.densidad =
        municipio.superficie > 0
            ? Number(
                (municipio.poblacion / municipio.superficie)
                    .toFixed(2)
            )
            : 0;
}

fs.writeFileSync(
    outputFile,
    JSON.stringify(municipios, null, 2),
    "utf8"
);

console.log(
    `Municipios procesados: ${Object.keys(municipios).length}`
);

const sinSuperficie = Object.entries(municipios)
    .filter(([codigo, municipio]) => municipio.superficie === 0)
    .map(([codigo, municipio]) => `${codigo} - ${municipio.nombre}`);

if (sinSuperficie.length > 0) {
    console.log("\nMunicipios sin superficie:");

    for (const municipio of sinSuperficie) {
        console.log(municipio);
    }
}

console.log(`\nArchivo creado: ${outputFile}`);