const fs = require("fs");
const path = require("path");

const DATA_DIR = path.join(__dirname, "data");

const MUNICIPIOS_FILE = path.join(
    DATA_DIR,
    "municipios.json"
);

const ENTIDADES_FILE = path.join(
    DATA_DIR,
    "entidades_locales.json"
);

const municipios = JSON.parse(
    fs.readFileSync(MUNICIPIOS_FILE, "utf8")
);

const entidades = JSON.parse(
    fs.readFileSync(ENTIDADES_FILE, "utf8")
);

const codigosMunicipios = new Set(
    Object.keys(municipios)
);

let totalVinculadas = 0;
let codigosInvalidos = 0;
let duplicados = 0;
let sinMunicipio = entidades.sinMunicipio.length;

const registros = new Set();

for (const [codigo, lista] of Object.entries(entidades.porMunicipio)) {
    if (!codigosMunicipios.has(codigo)) {
        console.log(`CÓDIGO DE MUNICIPIO INVÁLIDO: ${codigo}`);
        codigosInvalidos++;
    }

    for (const entidad of lista) {
        totalVinculadas++;

        const clave = `${entidad.codigoTipo}|${entidad.registro}`;

        if (registros.has(clave)) {
            console.log(
                `DUPLICADO: ${entidad.codigoTipo} | ${entidad.registro} | ${entidad.nombre}`
            );
            duplicados++;
        }

        registros.add(clave);

        if (entidad.codigoMunicipio !== codigo) {
            console.log(
                `ERROR DE CÓDIGO: ${entidad.nombre} → ${entidad.codigoMunicipio} / ${codigo}`
            );
        }
    }
}

const total = totalVinculadas + sinMunicipio;

console.log("\n================================");
console.log("VERIFICACIÓN DE ENTIDADES");
console.log("================================");
console.log(`Total de entidades: ${total}`);
console.log(`Vinculadas a municipios: ${totalVinculadas}`);
console.log(`Sin municipio: ${sinMunicipio}`);
console.log(`Códigos de municipio inválidos: ${codigosInvalidos}`);
console.log(`Registros duplicados: ${duplicados}`);

if (
    total === 386 &&
    totalVinculadas === 316 &&
    sinMunicipio === 70 &&
    codigosInvalidos === 0 &&
    duplicados === 0
) {
    console.log("\n✓ VERIFICACIÓN CORRECTA");
} else {
    console.log("\n⚠ HAY DATOS QUE REVISAR");
}