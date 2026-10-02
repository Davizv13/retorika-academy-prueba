const fs = require("fs");
const { Client } = require("pg");

const datos = JSON.parse(
    fs.readFileSync("./data/ayuntamientos.json", "utf8")
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

    for (const [codigo, ayuntamiento] of Object.entries(datos)) {
        await client.query(
            `
            INSERT INTO ayuntamientos (
                codigo_ine,
                direccion,
                codigo_postal,
                telefono,
                fax,
                email,
                web,
                latitud,
                longitud
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            ON CONFLICT (codigo_ine) DO NOTHING
            `,
            [
                codigo,
                ayuntamiento.direccion,
                ayuntamiento.codigoPostal,
                ayuntamiento.telefono,
                ayuntamiento.fax,
                ayuntamiento.email,
                ayuntamiento.web,
                ayuntamiento.latitud ? parseFloat(ayuntamiento.latitud) : null,
                ayuntamiento.longitud ? parseFloat(ayuntamiento.longitud) : null
            ]
        );
    }

    console.log("Ayuntamientos importados correctamente.");

    await client.end();
}

importar().catch(error => {
    console.error("Error:", error);
    client.end();
});