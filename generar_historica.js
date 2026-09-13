const fs = require("fs");

const input = "./data/poblacion_historica.csv";
const output = "./data/poblacion_historica.json";

const csv = fs.readFileSync(input, "utf8");

const lineas = csv
    .split(/\r?\n/)
    .map(linea => linea.trim())
    .filter(Boolean);

if (lineas.length < 5) {
    throw new Error("El CSV no tiene el formato esperado.");
}

const cabecera = lineas[4]
    .split(";")
    .map(valor => valor.replace(/^"|"$/g, ""));

const anios = cabecera
    .slice(1)
    .map(Number)
    .filter(Number.isFinite);

const historica = {};

for (const linea of lineas.slice(5)) {
    const columnas = linea
        .split(";")
        .map(valor => valor.replace(/^"|"$/g, ""));

    if (columnas.length < 2) {
        continue;
    }

    const espacio = columnas[0];

    const codigoMatch = espacio.match(/^(\d{5})\s+/);

    if (!codigoMatch) {
        continue;
    }

    const codigo = codigoMatch[1];
    const nombre = espacio.replace(/^\d{5}\s+/, "");

    if (["15026", "15063", "36011", "36012"].includes(codigo)) {
        continue;
    }

    const serie = [];

    for (let i = 0; i < anios.length; i++) {
        const valorTexto = columnas[i + 1];

        if (!valorTexto || valorTexto === "-") {
            continue;
        }

        const poblacion = Number(
            valorTexto.replace(/\./g, "").replace(",", ".")
        );

        if (!Number.isFinite(poblacion)) {
            continue;
        }

        serie.push({
            anio: anios[i],
            poblacion
        });
    }

    historica[codigo] = {
        nombre,
        serie
    };
}

fs.writeFileSync(
    output,
    JSON.stringify(historica, null, 2),
    "utf8"
);

console.log(
    `Municipios generados: ${Object.keys(historica).length}`
);

console.log(
    `Años: ${anios[0]} - ${anios[anios.length - 1]}`
);

console.log(`Archivo creado: ${output}`);

if (historica["36057"]) {
    console.log("\nVigo:");
    console.log(historica["36057"]);
}