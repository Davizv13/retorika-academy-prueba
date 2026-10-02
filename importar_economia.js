const fs = require("fs");
const { Client } = require("pg");

const datos = JSON.parse(
    fs.readFileSync("./data/economia.json", "utf8")
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

    for (const [codigo, municipio] of Object.entries(datos.municipios)) {

        if (municipio.renta) {
            for (const [anio, datosRenta] of Object.entries(municipio.renta)) {
                await client.query(
                    `
                    INSERT INTO renta (
                        codigo_ine,
                        anio,
                        miles_euros,
                        por_habitante
                    )
                    VALUES ($1, $2, $3, $4)
                    ON CONFLICT (codigo_ine, anio) DO NOTHING
                    `,
                    [
                        codigo,
                        parseInt(anio),
                        datosRenta.milesEuros,
                        datosRenta.porHabitante
                    ]
                );
            }
        }

        if (municipio.pib) {
            for (const [anio, datosPib] of Object.entries(municipio.pib)) {
                await client.query(
                    `
                    INSERT INTO pib (
                        codigo_ine,
                        anio,
                        total,
                        por_habitante
                    )
                    VALUES ($1, $2, $3, $4)
                    ON CONFLICT (codigo_ine, anio) DO NOTHING
                    `,
                    [
                        codigo,
                        parseInt(anio),
                        datosPib.total,
                        datosPib.porHabitante
                    ]
                );
            }
        }

        if (municipio.unidadesLocales) {
            for (const [anio, unidades] of Object.entries(municipio.unidadesLocales)) {
                await client.query(
                    `
            INSERT INTO unidades_locales (
                codigo_ine,
                anio,
                unidades
            )
            VALUES ($1, $2, $3)
            ON CONFLICT (codigo_ine, anio) DO NOTHING
            `,
                    [
                        codigo,
                        parseInt(anio),
                        unidades
                    ]
                );
            }
        }

        if (municipio.paro) {
            for (const [anio, personas] of Object.entries(municipio.paro)) {
                await client.query(
                    `
                    INSERT INTO paro (
                        codigo_ine,
                        anio,
                        personas
                    )
                    VALUES ($1, $2, $3)
                    ON CONFLICT (codigo_ine, anio) DO NOTHING
                    `,
                    [
                        codigo,
                        parseInt(anio),
                        personas
                    ]
                );
            }
        }
    }

    console.log("Datos económicos importados correctamente.");

    await client.end();
}

importar().catch(error => {
    console.error("Error:", error);
    client.end();
});