const fs = require("fs");
const path = require("path");

const fuentes = path.join(__dirname, "data", "fuentes");
const salida = path.join(__dirname, "data", "economia.json");
const municipiosPath = path.join(__dirname, "data", "municipios.json");
const poblacionPath = path.join(__dirname, "data", "poblacion_historica.json");

const municipiosBase = JSON.parse(
    fs.readFileSync(municipiosPath, "utf8")
);

const poblacionHistorica = JSON.parse(
    fs.readFileSync(poblacionPath, "utf8")
);

const codigosValidos = new Set(
    Object.keys(municipiosBase)
);

function leerCSV(nombre) {
    const contenido = fs.readFileSync(
        path.join(fuentes, nombre),
        "utf8"
    );

    return contenido
        .replace(/^\uFEFF/, "")
        .split(/\r?\n/)
        .map(linea =>
            linea.split(";").map(valor =>
                valor.replace(/^"|"$/g, "").trim()
            )
        );
}

function numero(valor) {
    if (
        valor === undefined ||
        valor === null ||
        valor === "" ||
        valor === "-"
    ) {
        return null;
    }

    return Number(
        valor
            .replace(/\./g, "")
            .replace(",", ".")
    );
}

function extraerCodigoNombre(valor) {
    const match = valor.match(/^(\d+)\s+(.+)$/);

    if (!match) {
        return {
            codigo: null,
            nombre: valor
        };
    }

    return {
        codigo: match[1],
        nombre: match[2]
    };
}

function obtenerPoblacion(codigo, año) {
    const municipio = poblacionHistorica[codigo];

    if (!municipio || !Array.isArray(municipio.serie)) {
        return null;
    }

    const registro = municipio.serie.find(
        dato => dato.anio === Number(año)
    );

    return registro ? registro.poblacion : null;
}

function crearMunicipio(economia, codigo, nombre) {
    if (!codigosValidos.has(codigo)) return;

    if (!economia.municipios[codigo]) {
        economia.municipios[codigo] = {
            nombre,
            renta: {},
            pib: {},
            unidadesLocales: {},
            paro: {}
        };
    }
}

function procesarRenta(economia) {
    const filas = leerCSV("renta.csv");
    let añoActual = null;

    for (const fila of filas) {
        if (!fila[0]) continue;

        if (/^\d{4}$/.test(fila[0])) {
            añoActual = fila[0];
            continue;
        }

        const territorio = extraerCodigoNombre(fila[0]);

        if (!territorio.codigo || !añoActual) continue;
        if (!codigosValidos.has(territorio.codigo)) continue;

        const rentaMilesEuros = numero(fila[1]);

        crearMunicipio(
            economia,
            territorio.codigo,
            territorio.nombre
        );

        const poblacion = obtenerPoblacion(
            territorio.codigo,
            añoActual
        );

        economia.municipios[territorio.codigo].renta[añoActual] = {
            milesEuros: rentaMilesEuros,
            porHabitante: (
                rentaMilesEuros !== null &&
                poblacion
            )
                ? Math.round(
                    (rentaMilesEuros * 1000) / poblacion
                )
                : null
        };
    }
}

function procesarPIB(economia) {
    const filas = leerCSV("pib.csv");
    let añoActual = null;

    for (const fila of filas) {
        if (!fila[0]) continue;

        if (/^\d{4}$/.test(fila[0])) {
            añoActual = fila[0];
            continue;
        }

        const territorio = extraerCodigoNombre(fila[0]);

        if (!territorio.codigo || !añoActual) continue;
        if (!codigosValidos.has(territorio.codigo)) continue;

        crearMunicipio(
            economia,
            territorio.codigo,
            territorio.nombre
        );

        economia.municipios[territorio.codigo].pib[añoActual] = {
            total: numero(fila[1]),
            porHabitante: numero(fila[2])
        };
    }
}

function procesarEmpresas(economia) {
    const filas = leerCSV("empresas.csv");
    let añoActual = null;

    for (const fila of filas) {
        if (!fila[0] && !fila[1]) continue;

        if (fila[1] && /^\d{4}$/.test(fila[1])) {
            añoActual = fila[1];
            continue;
        }

        const territorio = extraerCodigoNombre(fila[0]);

        if (!territorio.codigo || !añoActual) continue;
        if (!codigosValidos.has(territorio.codigo)) continue;

        crearMunicipio(
            economia,
            territorio.codigo,
            territorio.nombre
        );

        economia.municipios[territorio.codigo]
            .unidadesLocales[añoActual] = numero(fila[1]);
    }
}

function procesarParo(economia) {
    const contenido = fs.readFileSync(
        path.join(fuentes, "paro.json"),
        "utf8"
    );

    const datos = JSON.parse(contenido);

    for (const fila of datos.datos) {
        const año = fila[0];
        const sexo = fila[2];
        const actividad = fila[3];
        const codigo = fila[4];
        const nombre = fila[5];
        const paro = fila[6];

        if (sexo !== "Total") continue;
        if (actividad !== "Total") continue;
        if (!/^\d{4}$/.test(año)) continue;
        if (!codigosValidos.has(codigo)) continue;

        crearMunicipio(
            economia,
            codigo,
            nombre
        );

        economia.municipios[codigo].paro[año] =
            numero(paro);
    }
}

const economia = {
    fuente: "Instituto Galego de Estatística (IGE)",
    municipios: {}
};

procesarRenta(economia);
procesarPIB(economia);
procesarEmpresas(economia);
procesarParo(economia);

for (const codigo of codigosValidos) {
    if (!economia.municipios[codigo]) {
        const municipio = municipiosBase[codigo];

        economia.municipios[codigo] = {
            nombre: municipio.nombre,
            renta: {},
            pib: {},
            unidadesLocales: {},
            paro: {}
        };
    }
}

fs.writeFileSync(
    salida,
    JSON.stringify(economia, null, 2),
    "utf8"
);

console.log(
    `economia.json generado correctamente: ${Object.keys(economia.municipios).length} municipios`
);