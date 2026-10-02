const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");

const app = express();
app.use(cors());
const port = 3000;

const pool = new Pool({
    host: "localhost",
    port: 5432,
    user: "postgres",
    password: "Retorika1234",
    database: "Retorika"
});

app.get("/", async (req, res) => {
    try {
        const resultado = await pool.query("SELECT COUNT(*) FROM municipios");

        res.json({
            mensaje: "API de Retorika funcionando",
            municipios: resultado.rows[0].count
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: "No se pudo conectar con la base de datos"
        });
    }
});

app.get("/api/municipios", async (req, res) => {
    try {
        const resultado = await pool.query(
            `SELECT codigo_ine, nombre, provincia, comunidad, poblacion
             FROM municipios
             ORDER BY nombre`
        );

        res.json(resultado.rows);

    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: "Error al consultar los municipios"
        });
    }
});


app.get("/api/municipios/:codigo", async (req, res) => {
    try {
        const { codigo } = req.params;

        const resultado = await pool.query(
            `SELECT codigo_ine, nombre, hombres, mujeres, menores15, edad15_64,
            mayores65, poblacion, edad_media AS "edadMedia", provincia, comunidad,
            superficie, densidad, porcentaje_extranjeros, extranjeros
            FROM municipios
            WHERE codigo_ine = $1`,
            [codigo]
        );

        if (resultado.rows.length === 0) {
            return res.status(404).json({
                error: "Municipio no encontrado"
            });
        }

        res.json(resultado.rows[0]);

    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: "Error al consultar el municipio"
        });
    }
});

app.get("/api/municipios/:codigo/poblacion", async (req, res) => {
    try {
        const { codigo } = req.params;

        const resultado = await pool.query(
            `SELECT anio, poblacion
             FROM poblacion_historica
             WHERE codigo_ine = $1
             ORDER BY anio`,
            [codigo]
        );

        res.json(resultado.rows);

    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: "Error al consultar la población histórica"
        });
    }
});

app.get("/api/municipios/:codigo/economia", async (req, res) => {
    try {
        const { codigo } = req.params;

        const [renta, pib, paro, unidadesLocales] = await Promise.all([
            pool.query(
                `SELECT anio, miles_euros, por_habitante
                 FROM renta
                 WHERE codigo_ine = $1
                 ORDER BY anio`,
                [codigo]
            ),
            pool.query(
                `SELECT anio, total, por_habitante
                 FROM pib
                 WHERE codigo_ine = $1
                 ORDER BY anio`,
                [codigo]
            ),
            pool.query(
                `SELECT anio, personas
                 FROM paro
                 WHERE codigo_ine = $1
                 ORDER BY anio`,
                [codigo]
            ),
            pool.query(
                `SELECT anio, unidades
                 FROM unidades_locales
                 WHERE codigo_ine = $1
                 ORDER BY anio`,
                [codigo]
            )
        ]);

        res.json({
            renta: renta.rows,
            pib: pib.rows,
            paro: paro.rows,
            unidadesLocales: unidadesLocales.rows
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: "Error al consultar los datos económicos"
        });
    }
});

app.get("/api/elecciones", async (req, res) => {

    try {

        const resultado = await pool.query(
            `SELECT codigo_ine, ganador
             FROM elecciones
             ORDER BY codigo_ine`
        );

        const elecciones = {};

        resultado.rows.forEach(eleccion => {

            elecciones[eleccion.codigo_ine] = {
                ganador: eleccion.ganador
            };

        });

        res.json(elecciones);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            error: "Error al consultar los datos electorales"
        });

    }

});

app.get("/api/municipios/:codigo/elecciones", async (req, res) => {
    try {
        const { codigo } = req.params;

        const elecciones = await pool.query(
            `SELECT id, censo, votos, nulos, blancos, abstencion, validos, ganador
             FROM elecciones
             WHERE codigo_ine = $1
             ORDER BY id DESC
             LIMIT 1`,
            [codigo]
        );

        if (elecciones.rows.length === 0) {
            return res.status(404).json({
                error: "No hay datos electorales para este municipio"
            });
        }

        const eleccion = elecciones.rows[0];

        const candidaturas = await pool.query(
            `SELECT candidatura, votos
             FROM resultados_candidaturas
             WHERE eleccion_id = $1
             ORDER BY votos DESC`,
            [eleccion.id]
        );

        res.json({
            ...eleccion,
            candidaturas: candidaturas.rows
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: "Error al consultar los datos electorales"
        });
    }
});

app.get("/api/municipios/:codigo/instituciones", async (req, res) => {
    try {
        const { codigo } = req.params;

        const alcalde = await pool.query(
            `SELECT nombre, partido,
            TO_CHAR(fecha_posesion, 'DD/MM/YYYY') AS "fechaPosesion"
            FROM alcaldes
            WHERE codigo_ine = $1`,
            [codigo]
        );

        const representantes = await pool.query(
            `SELECT nombre, cargo, partido,
            TO_CHAR(fecha_posesion, 'DD/MM/YYYY') AS "fechaPosesion"
            FROM representantes
            WHERE codigo_ine = $1
            ORDER BY nombre`,
            [codigo]
        );

        res.json({
            alcalde: alcalde.rows[0] || null,
            representantes: representantes.rows
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: "Error al consultar las instituciones"
        });
    }
});

app.get("/api/municipios/:codigo/ayuntamiento", async (req, res) => {
    try {
        const { codigo } = req.params;

        const resultado = await pool.query(
            `SELECT direccion, codigo_postal, telefono, fax, email, web,
                    latitud, longitud
             FROM ayuntamientos
             WHERE codigo_ine = $1`,
            [codigo]
        );

        if (resultado.rows.length === 0) {
            return res.status(404).json({
                error: "Ayuntamiento no encontrado"
            });
        }

        res.json(resultado.rows[0]);

    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: "Error al consultar el ayuntamiento"
        });
    }
});

app.get("/api/municipios/:codigo/entidades", async (req, res) => {
    try {
        const { codigo } = req.params;

        const resultado = await pool.query(
            `SELECT tipo, codigo_tipo, registro, nombre, direccion,
                    capital_sede, codigo_postal, provincia,
                    fecha_inscripcion, superficie
             FROM entidades_locales
             WHERE codigo_ine = $1
             ORDER BY nombre`,
            [codigo]
        );

        res.json(resultado.rows);

    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: "Error al consultar las entidades locales"
        });
    }
});

app.listen(port, () => {
    console.log(`API funcionando en http://localhost:${port}`);
});