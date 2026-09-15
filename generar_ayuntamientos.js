const fs = require("fs");
const path = require("path");
const XLSX = require("xlsx");
const iconv = require("iconv-lite");

const BASE_DIR = __dirname;
const DATA_DIR = path.join(BASE_DIR, "data");

const CSV_FILE = path.join(
    DATA_DIR,
    "fuentes",
    "Exportacion_Eidolocal.csv"
);

const MUNICIPIOS_FILE = path.join(
    DATA_DIR,
    "municipios.json"
);

const SALIDA_FILE = path.join(
    DATA_DIR,
    "ayuntamientos.json"
);

function normalizar(texto) {
    if (texto === undefined || texto === null) {
        return "";
    }

    let valor = String(texto)
        .trim()
        .toUpperCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/\s+/g, " ");

    valor = valor.replace(/^A\s+(.+)$/, "$1, A");
    valor = valor.replace(/^AS\s+(.+)$/, "$1, AS");
    valor = valor.replace(/^O\s+(.+)$/, "$1, O");
    valor = valor.replace(/^OS\s+(.+)$/, "$1, OS");

    const equivalencias = {
        "CORUNA, A": "A CORUNA"
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

        const nombreSinArticulo = nombre.replace(
            /^(A|AS|O|OS)\s+/,
            ""
        );

        if (nombreSinArticulo !== nombre) {
            const claveAlternativa =
                `${nombreSinArticulo}|${provincia}`;

            municipios.set(claveAlternativa, codigo);
        }
    }

    return municipios;
}

function leerCSV() {
    console.log(`Leyendo: ${path.basename(CSV_FILE)}`);

    const buffer = fs.readFileSync(CSV_FILE);

    const contenido = iconv.decode(buffer, "latin1");

    const workbook = XLSX.read(contenido, {
        type: "string",
        FS: ",",
        raw: false
    });

    const hoja = workbook.Sheets[workbook.SheetNames[0]];

    return XLSX.utils.sheet_to_json(hoja, {
        defval: "",
        raw: false
    });
}

function buscarCampo(fila, nombre) {
    if (Object.prototype.hasOwnProperty.call(fila, nombre)) {
        return limpiar(fila[nombre]);
    }

    const clave = Object.keys(fila).find(
        key => normalizar(key) === normalizar(nombre)
    );

    if (clave) {
        return limpiar(fila[clave]);
    }

    return "";
}

function generar() {
    if (!fs.existsSync(CSV_FILE)) {
        console.error(`No existe el archivo: ${CSV_FILE}`);
        return;
    }

    if (!fs.existsSync(MUNICIPIOS_FILE)) {
        console.error(`No existe el archivo: ${MUNICIPIOS_FILE}`);
        return;
    }

    console.log("Cargando municipios de la aplicación...");

    const municipios = cargarMunicipios();

    const filas = leerCSV();

    console.log(`Total de registros encontrados: ${filas.length}`);

    if (filas.length > 0) {
        console.log("Columnas detectadas:");
        console.log(Object.keys(filas[0]));
    }

    const ayuntamientos = {};
    const noEncontrados = [];

    for (const fila of filas) {
        const nombre = buscarCampo(fila, "CONCELLO");
        const provincia = buscarCampo(fila, "PROVINCIA");

        if (!nombre) {
            continue;
        }

const nombreNormalizado = normalizar(nombre);
const provinciaNormalizada = normalizar(provincia);

const clave = `${nombreNormalizado}|${provinciaNormalizada}`;

let codigoApp = municipios.get(clave);

if (!codigoApp) {
    const nombreSinArticulo = nombreNormalizado.replace(
        /^(A|AS|O|OS)\s+/,
        ""
    );

    const claveAlternativa =
        `${nombreSinArticulo}|${provinciaNormalizada}`;

    codigoApp = municipios.get(claveAlternativa);
}

        if (!codigoApp) {
            noEncontrados.push({
                nombre,
                provincia
            });
            continue;
        }

        ayuntamientos[codigoApp] = {
            nombre,
            provincia,
            direccion: buscarCampo(fila, "ENDEREZO"),
            codigoPostal: buscarCampo(fila, "CÓDIGO POSTAL"),
            telefono: buscarCampo(fila, "TELÉFONO"),
            fax: buscarCampo(fila, "FAX"),
            email: buscarCampo(fila, "CORREO ELECTRÓNICO"),
            web: buscarCampo(fila, "PORTAL WEB"),
            latitud: buscarCampo(fila, "LATITUD"),
            longitud: buscarCampo(fila, "LONGITUD")
        };
    }

    fs.writeFileSync(
        SALIDA_FILE,
        JSON.stringify(ayuntamientos, null, 4),
        "utf8"
    );

    console.log("\n--------------------------------");
    console.log("GENERACIÓN COMPLETADA");
    console.log("--------------------------------");
    console.log(`Ayuntamientos procesados: ${Object.keys(ayuntamientos).length}`);
    console.log(`Registros sin coincidencia: ${noEncontrados.length}`);
    console.log(`Archivo generado: ${SALIDA_FILE}`);

    if (noEncontrados.length > 0) {
        console.log("\nNO ENCONTRADOS:");

        const vistos = new Set();

        for (const item of noEncontrados) {
            const clave = `${item.nombre}|${item.provincia}`;

            if (vistos.has(clave)) {
                continue;
            }

            vistos.add(clave);

            console.log(` - ${item.nombre} (${item.provincia})`);
        }
    }
}

generar();