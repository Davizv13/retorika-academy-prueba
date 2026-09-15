const fs = require("fs");
const path = require("path");
const XLSX = require("xlsx");
const iconv = require("iconv-lite");

const BASE_DIR = __dirname;
const DATA_DIR = path.join(BASE_DIR, "data");

const CSV_FILE = path.join(
    DATA_DIR,
    "fuentes",
    "RexistroEntidadesLocaisGalicia.csv"
);

const MUNICIPIOS_FILE = path.join(
    DATA_DIR,
    "municipios.json"
);

const SALIDA_FILE = path.join(
    DATA_DIR,
    "entidades_locales.json"
);

function normalizar(texto) {
    if (texto === undefined || texto === null) {
        return "";
    }

    return String(texto)
        .trim()
        .toUpperCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/\s+/g, " ");
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
        municipios.set(
            normalizar(municipio.nombre) + "|" +
            normalizar(municipio.provincia),
            codigo
        );
    }

    return municipios;
}

function leerCSV() {
    console.log(`Leyendo: ${path.basename(CSV_FILE)}`);

    const buffer = fs.readFileSync(CSV_FILE);

    const contenido = iconv.decode(buffer, "latin1");

    const workbook = XLSX.read(contenido, {
        type: "string",
        FS: ";",
        raw: false
    });

    const hoja = workbook.Sheets[workbook.SheetNames[0]];

    return XLSX.utils.sheet_to_json(hoja, {
        defval: "",
        raw: false
    });
}

function buscarCampo(fila, nombre) {
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

    const porMunicipio = {};
    const sinMunicipio = [];
    let vinculadas = 0;
    let sinVincular = 0;

    for (const fila of filas) {
        const codigoMunicipio = buscarCampo(
            fila,
            "CÓDIGO INE DO CONCELLO"
        );

        const entidad = {
            tipo: buscarCampo(
                fila,
                "TIPOLOXÍA DA ENTIDADE"
            ),
            codigoTipo: buscarCampo(
                fila,
                "CÓDIGO DA TIPOLOXÍA DE ENTIDADE"
            ),
            registro: buscarCampo(
                fila,
                "NÚMERO DE REXISTRO"
            ),
            nombre: buscarCampo(
                fila,
                "NOME"
            ),
            direccion: buscarCampo(
                fila,
                "ENDEREZO"
            ),
            capitalSede: buscarCampo(
                fila,
                "CAPITAL OU SEDE DA ENTIDADE"
            ),
            codigoPostal: buscarCampo(
                fila,
                "CÓDIGO POSTAL"
            ),
            provincia: buscarCampo(
                fila,
                "PROVINCIA"
            ),
            codigoMunicipio,
            municipio: buscarCampo(
                fila,
                "CONCELLO"
            ),
            fechaInscripcion: buscarCampo(
                fila,
                "DATA DE INSCRICIÓN NO REXISTRO"
            ),
            superficie: buscarCampo(
                fila,
                "SUPERFICIE"
            )
        };

        if (!codigoMunicipio) {
            sinMunicipio.push(entidad);
            sinVincular++;
            continue;
        }

        const codigoApp = Object.prototype.hasOwnProperty.call(
            JSON.parse(fs.readFileSync(MUNICIPIOS_FILE, "utf8")),
            codigoMunicipio
        )
            ? codigoMunicipio
            : null;

        if (!codigoApp) {
            const nombreMunicipio = normalizar(entidad.municipio);
            const provincia = normalizar(entidad.provincia);

            const clave = `${nombreMunicipio}|${provincia}`;

            const encontrado = municipios.get(clave);

            if (!encontrado) {
                sinMunicipio.push(entidad);
                sinVincular++;
                continue;
            }

            entidad.codigoMunicipio = encontrado;

            if (!porMunicipio[encontrado]) {
                porMunicipio[encontrado] = [];
            }

            porMunicipio[encontrado].push(entidad);
            vinculadas++;

            continue;
        }

        if (!porMunicipio[codigoApp]) {
            porMunicipio[codigoApp] = [];
        }

        entidad.codigoMunicipio = codigoApp;

        porMunicipio[codigoApp].push(entidad);

        vinculadas++;
    }

    const resultado = {
        porMunicipio,
        sinMunicipio
    };

    fs.writeFileSync(
        SALIDA_FILE,
        JSON.stringify(resultado, null, 4),
        "utf8"
    );

    console.log("\n--------------------------------");
    console.log("GENERACIÓN COMPLETADA");
    console.log("--------------------------------");
    console.log(`Registros encontrados: ${filas.length}`);
    console.log(`Entidades vinculadas: ${vinculadas}`);
    console.log(`Entidades sin municipio: ${sinVincular}`);
    console.log(`Archivo generado: ${SALIDA_FILE}`);
}

generar();