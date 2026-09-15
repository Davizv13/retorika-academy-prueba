const fs = require("fs");
const path = require("path");
const XLSX = require("xlsx");

const BASE_DIR = __dirname;
const FUENTES_DIR = path.join(BASE_DIR, "data", "fuentes");
const DATA_DIR = path.join(BASE_DIR, "data");

const MUNICIPIOS_FILE = path.join(DATA_DIR, "municipios.json");
const SALIDA_FILE = path.join(DATA_DIR, "instituciones.json");


function normalizar(texto) {
    if (texto === undefined || texto === null) {
        return "";
    }

    const valor = String(texto)
        .trim()
        .toUpperCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/\s+/g, " ");

    const equivalencias = {
        "CORUNA, A": "A CORUNA",
        "A CORUNA": "A CORUNA"
    };

    return equivalencias[valor] || valor;
}


function limpiar(valor) {
    if (valor === undefined || valor === null) {
        return "";
    }

    return String(valor).trim();
}


function cargarMunicipios() {
    const datos = JSON.parse(
        fs.readFileSync(MUNICIPIOS_FILE, "utf8")
    );

    const municipios = new Map();

    for (const [codigo, municipio] of Object.entries(datos)) {
        const nombre = normalizar(municipio.nombre);
        const provincia = normalizar(municipio.provincia);

        const clave = `${nombre}|${provincia}`;

        municipios.set(clave, codigo);
    }

    return municipios;
}


function leerExcel(archivo) {
    console.log(`Leyendo: ${path.basename(archivo)}`);

    const workbook = XLSX.readFile(archivo);

    const hoja = workbook.Sheets[workbook.SheetNames[0]];

    const filas = XLSX.utils.sheet_to_json(hoja, {
        range: 5,
        defval: ""
    });

    return filas;
}


function generar() {

    if (!fs.existsSync(FUENTES_DIR)) {
        console.error(`No existe la carpeta: ${FUENTES_DIR}`);
        console.error("Crea una carpeta llamada 'fuentes' y mete dentro los 4 Excel.");
        return;
    }

    if (!fs.existsSync(MUNICIPIOS_FILE)) {
        console.error(`No existe: ${MUNICIPIOS_FILE}`);
        return;
    }

    const archivos = fs.readdirSync(FUENTES_DIR)
        .filter(archivo => archivo.toLowerCase().endsWith(".xlsx"))
        .map(archivo => path.join(FUENTES_DIR, archivo));

    if (archivos.length !== 4) {
        console.error(
            `ERROR: se esperaban 4 archivos .xlsx y se encontraron ${archivos.length}.`
        );

        for (const archivo of archivos) {
            console.error(` - ${path.basename(archivo)}`);
        }

        return;
    }

    console.log("Cargando municipios de la aplicación...");

    const municipios = cargarMunicipios();

    let registros = [];

    for (const archivo of archivos) {
        const filas = leerExcel(archivo);
        registros = registros.concat(filas);
    }

    console.log(`\nTotal de registros encontrados: ${registros.length}`);

    const instituciones = {};
    const noEncontrados = [];

    for (const fila of registros) {

        const municipio = limpiar(fila["Municipio"]);
        const provincia = limpiar(fila["Provincia"]);

        const clave = `${normalizar(municipio)}|${normalizar(provincia)}`;

        const codigoApp = municipios.get(clave);

        if (!codigoApp) {
            noEncontrados.push({
                municipio,
                provincia,
                codigoExcel: limpiar(fila["Código INE"])
            });

            continue;
        }

        const nombre = limpiar(fila["Nombre"]);
        const apellido1 = limpiar(fila["1er Apellido"]);
        const apellido2 = limpiar(fila["2º Apellido"]);

        const nombreCompleto = [
            nombre,
            apellido1,
            apellido2
        ]
            .filter(Boolean)
            .join(" ");

        const cargo = limpiar(fila["Cargo"]);
        const partido = limpiar(fila["Partido"]);
        const fechaPosesion = limpiar(fila["Fecha de Posesión"]);

        if (!instituciones[codigoApp]) {
            instituciones[codigoApp] = {
                nombre: municipio,
                provincia,
                comunidad: limpiar(fila["Comunidad Autónoma"]),
                alcalde: null,
                representantes: []
            };
        }

        const representante = {
            nombre: nombreCompleto,
            cargo,
            partido,
            fechaPosesion
        };

        if (normalizar(cargo) === "ALCALDE") {

            instituciones[codigoApp].alcalde = {
                nombre: nombreCompleto,
                partido,
                fechaPosesion
            };

        } else {

            instituciones[codigoApp].representantes.push(
                representante
            );
        }
    }

    fs.mkdirSync(DATA_DIR, {
        recursive: true
    });

    fs.writeFileSync(
        SALIDA_FILE,
        JSON.stringify(instituciones, null, 4),
        "utf8"
    );

    console.log("\n--------------------------------");
    console.log("GENERACIÓN COMPLETADA");
    console.log("--------------------------------");
    console.log(`Municipios procesados: ${Object.keys(instituciones).length}`);
    console.log(`Registros procesados: ${registros.length - noEncontrados.length}`);
    console.log(`Registros sin coincidencia: ${noEncontrados.length}`);
    console.log(`Archivo generado: ${SALIDA_FILE}`);

    if (noEncontrados.length > 0) {

        console.log("\nNO ENCONTRADOS:");

        const vistos = new Set();

        for (const item of noEncontrados) {

            const clave = `${item.municipio}|${item.provincia}`;

            if (!vistos.has(clave)) {

                vistos.add(clave);

                console.log(
                    ` - ${item.municipio} (${item.provincia}) [Excel: ${item.codigoExcel}]`
                );
            }
        }
    }
}


generar();