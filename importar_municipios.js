const fs = require("fs");
const { Client } = require("pg");

const datos = JSON.parse(
    fs.readFileSync("./data/municipios.json", "utf8")
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
        await client.query(
            `
            INSERT INTO municipios (
                codigo_ine,
                nombre,
                hombres,
                mujeres,
                menores15,
                edad15_64,
                mayores65,
                poblacion,
                edad_media,
                provincia,
                comunidad,
                superficie,
                densidad,
                porcentaje_extranjeros,
                extranjeros
            )
            VALUES (
                $1, $2, $3, $4, $5, $6, $7, $8,
                $9, $10, $11, $12, $13, $14, $15
            )
            ON CONFLICT (codigo_ine) DO NOTHING
            `,
            [
                codigo,
                municipio.nombre,
                municipio.hombres,
                municipio.mujeres,
                municipio.menores15,
                municipio.edad15_64,
                municipio.mayores65,
                municipio.poblacion,
                municipio.edadMedia,
                municipio.provincia,
                municipio.comunidad,
                municipio.superficie,
                municipio.densidad,
                municipio.porcentajeExtranjeros,
                municipio.extranjeros
            ]
        );
    }

    console.log("Municipios importados correctamente.");

    await client.end();
}

importar().catch(error => {
    console.error("Error:", error);
    client.end();
});