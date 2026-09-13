const fs = require("fs");

const municipiosFile = "./data/municipios_completo.json";
const extranjerosFile = "./data/extranjeros.csv";
const outputFile = "./data/municipios.json";

const municipios = JSON.parse(
    fs.readFileSync(municipiosFile, "utf8")
);

const csv = fs.readFileSync(extranjerosFile, "utf8");

const lineas = csv
    .split(/\r?\n/)
    .map(linea => linea.trim())
    .filter(Boolean);

const porcentajes = {};

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

    const porcentaje = Number(
        valor.replace(",", ".")
    );

    if (!Number.isFinite(porcentaje)) {
        continue;
    }

    porcentajes[codigo] = porcentaje;
}

for (const codigo of Object.keys(municipios)) {
    const municipio = municipios[codigo];

    const porcentaje = porcentajes[codigo] || 0;

    municipio.porcentajeExtranjeros = porcentaje;

    municipio.extranjeros = Math.round(
        municipio.poblacion * porcentaje / 100
    );
}

fs.writeFileSync(
    outputFile,
    JSON.stringify(municipios, null, 2),
    "utf8"
);

console.log(
    `Municipios procesados: ${Object.keys(municipios).length}`
);

const sinDato = Object.entries(municipios)
    .filter(([codigo]) => !porcentajes[codigo])
    .map(([codigo, municipio]) => `${codigo} - ${municipio.nombre}`);

if (sinDato.length > 0) {
    console.log("\nMunicipios sin dato de población extranjera:");

    for (const municipio of sinDato) {
        console.log(municipio);
    }
}

console.log(`\nArchivo creado: ${outputFile}`);