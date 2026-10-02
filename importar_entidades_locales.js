const fs = require("fs");
const { Client } = require("pg");

const datos = JSON.parse(
    fs.readFileSync("./data/entidades_locales.json", "utf8")
);

const client = new Client({
    host: "localhost",
    port: 5432,
    user: "postgres",
    password: "Retorika1234",
    database: "Retorika"
});

function convertirFecha(fecha) {
    if (!fecha) return null;

    const partes = fecha.split("/");

    if (partes.length !== 3) return null;

    let dia = parseInt(partes[0]);
    let mes = parseInt(partes[1]);
    let anio = parseInt(partes[2]);

    if (anio < 100) {
        anio += anio >= 50 ? 1900 : 2000;
    }

    if (
        !Number.isInteger(dia) ||
        !Number.isInteger(mes) ||
        !Number.isInteger(anio) ||
        mes < 1 ||
        mes > 12 ||
        dia < 1 ||
        dia > 31
    ) {
        return null;
    }

    return `${anio}-${String(mes).padStart(2, "0")}-${String(dia).padStart(2, "0")}`;
}

function convertirSuperficie(superficie) {
    if (!superficie) return null;

    return parseFloat(
        superficie
            .replace(/\./g, "")
            .replace(",", ".")
    );
}

async function importar() {
    await client.connect();

    for (const [codigoMunicipio, entidades] of Object.entries(datos.porMunicipio)) {
        for (const entidad of entidades) {
            await client.query(
                `
                INSERT INTO entidades_locales (
                    codigo_ine,
                    tipo,
                    codigo_tipo,
                    registro,
                    nombre,
                    direccion,
                    capital_sede,
                    codigo_postal,
                    provincia,
                    fecha_inscripcion,
                    superficie
                )
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
                `,
                [
                    codigoMunicipio,
                    entidad.tipo,
                    entidad.codigoTipo,
                    entidad.registro,
                    entidad.nombre,
                    entidad.direccion,
                    entidad.capitalSede,
                    entidad.codigoPostal,
                    entidad.provincia,
                    convertirFecha(entidad.fechaInscripcion),
                    convertirSuperficie(entidad.superficie)
                ]
            );
        }
    }

    for (const entidad of datos.sinMunicipio) {
        await client.query(
            `
            INSERT INTO entidades_locales (
                codigo_ine,
                tipo,
                codigo_tipo,
                registro,
                nombre,
                direccion,
                capital_sede,
                codigo_postal,
                provincia,
                fecha_inscripcion,
                superficie
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
            `,
            [
                null,
                entidad.tipo,
                entidad.codigoTipo,
                entidad.registro,
                entidad.nombre,
                entidad.direccion,
                entidad.capitalSede,
                entidad.codigoPostal,
                entidad.provincia,
                convertirFecha(entidad.fechaInscripcion),
                convertirSuperficie(entidad.superficie)
            ]
        );
    }

    console.log("Entidades locales importadas correctamente.");

    await client.end();
}

importar().catch(error => {
    console.error("Error:", error);
    client.end();
});