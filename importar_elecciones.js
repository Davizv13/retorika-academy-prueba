const fs = require("fs");
const { Client } = require("pg");

const datos = JSON.parse(
    fs.readFileSync("./data/elecciones.json", "utf8")
);

const client = new Client({
    host: "localhost",
    port: 5432,
    user: "postgres",
    password: "Retorika1234",
    database: "Retorika"
});

async function importar() {
    await client.connect();

    for (const [codigo, eleccion] of Object.entries(datos)) {

        const resultado = await client.query(
            `
            INSERT INTO elecciones (
                codigo_ine,
                censo,
                votos,
                nulos,
                blancos,
                abstencion,
                validos,
                ganador
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            ON CONFLICT DO NOTHING
            RETURNING id
            `,
            [
                codigo,
                eleccion.censo,
                eleccion.votos,
                eleccion.nulos,
                eleccion.blancos,
                eleccion.abstencion,
                eleccion.validos,
                eleccion.ganador
            ]
        );

        if (resultado.rows.length === 0) {
            continue;
        }

        const eleccionId = resultado.rows[0].id;

        for (const [candidatura, votos] of Object.entries(eleccion.candidaturas)) {
            await client.query(
                `
                INSERT INTO resultados_candidaturas (
                    eleccion_id,
                    candidatura,
                    votos
                )
                VALUES ($1, $2, $3)
                `,
                [
                    eleccionId,
                    candidatura,
                    votos
                ]
            );
        }
    }

    console.log("Datos electorales importados correctamente.");

    await client.end();
}

importar().catch(error => {
    console.error("Error:", error);
    client.end();
});