const fs = require("fs");
const { Client } = require("pg");

const datos = JSON.parse(
    fs.readFileSync("./data/poblacion_historica.json", "utf8")
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

    for (const [codigo, municipio] of Object.entries(datos)) {
        for (const registro of municipio.serie) {
            await client.query(
                `
                INSERT INTO poblacion_historica (
                    codigo_ine,
                    anio,
                    poblacion
                )
                VALUES ($1, $2, $3)
                ON CONFLICT (codigo_ine, anio) DO NOTHING
                `,
                [
                    codigo,
                    registro.anio,
                    registro.poblacion
                ]
            );
        }
    }

    console.log("Población histórica importada correctamente.");

    await client.end();
}

importar().catch(error => {
    console.error("Error:", error);
    client.end();
});