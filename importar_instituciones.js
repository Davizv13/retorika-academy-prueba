const fs = require("fs");
const { Client } = require("pg");

const datos = JSON.parse(
    fs.readFileSync("./data/instituciones.json", "utf8")
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

    let [dia, mes, anio] = partes;

    anio = parseInt(anio);

    if (anio < 100) {
        anio += anio >= 50 ? 1900 : 2000;
    }

    return `${anio}-${mes.padStart(2, "0")}-${dia.padStart(2, "0")}`;
}

async function importar() {
    await client.connect();

    for (const [codigo, municipio] of Object.entries(datos)) {

        if (municipio.alcalde) {
            await client.query(
                `
                INSERT INTO alcaldes (
                    codigo_ine,
                    nombre,
                    partido,
                    fecha_posesion
                )
                VALUES ($1, $2, $3, $4)
                `,
                [
                    codigo,
                    municipio.alcalde.nombre,
                    municipio.alcalde.partido,
                    convertirFecha(municipio.alcalde.fechaPosesion)
                ]
            );
        }

        if (municipio.representantes) {
            for (const representante of municipio.representantes) {
                await client.query(
                    `
                    INSERT INTO representantes (
                        codigo_ine,
                        nombre,
                        cargo,
                        partido,
                        fecha_posesion
                    )
                    VALUES ($1, $2, $3, $4, $5)
                    `,
                    [
                        codigo,
                        representante.nombre,
                        representante.cargo,
                        representante.partido,
                        convertirFecha(representante.fechaPosesion)
                    ]
                );
            }
        }
    }

    console.log("Instituciones importadas correctamente.");

    await client.end();
}

importar().catch(error => {
    console.error("Error:", error);
    client.end();
});