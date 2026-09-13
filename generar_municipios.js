const fs = require("fs");

const input = "./data/poblacion_ige.json";
const output = "./data/municipios_generado.json";

const data = JSON.parse(fs.readFileSync(input, "utf8"));

const variables = data.variables;
const filas = data.datos;

const iSexo = variables.indexOf("Sexo");
const iEdad = variables.indexOf("Idade");
const iCodigo = variables.indexOf("CodEspazo");
const iNombre = variables.indexOf("Espazo");
const iValor = variables.indexOf("DatoN");

const municipios = {};
const codigosExcluir = ["15026", "15063", "36011", "36012"];
for (const fila of filas) {
    
    const sexo = fila[iSexo];
    const edad = Number(fila[iEdad]);
    const codigo = String(fila[iCodigo]);
    if (codigosExcluir.includes(codigo)) {
    continue;
}
    const espacio = fila[iNombre];
    const valor = Number(fila[iValor]);

    if (!codigo || !espacio || !Number.isFinite(valor)) {
        continue;
    }

    if (!municipios[codigo]) {
        const nombre = espacio.replace(/^\d+\s*/, "");

        municipios[codigo] = {
            nombre,
            hombres: 0,
            mujeres: 0,
            menores15: 0,
            edad15_64: 0,
            mayores65: 0,
            poblacion: 0,
            sumaEdades: 0
        };
    }

    const municipio = municipios[codigo];

    if (sexo === "Homes") {
        municipio.hombres += valor;
    }

    if (sexo === "Mulleres") {
        municipio.mujeres += valor;
    }

    if (edad <= 14) {
        municipio.menores15 += valor;
    } else if (edad <= 64) {
        municipio.edad15_64 += valor;
    } else {
        municipio.mayores65 += valor;
    }

    municipio.poblacion += valor;

    if (Number.isFinite(edad) && Number.isFinite(valor)) {
    const edadParaMedia = edad === 99 ? 100 : edad;
    municipio.sumaEdades += valor * edadParaMedia;
}
}

for (const codigo of Object.keys(municipios)) {
    const municipio = municipios[codigo];

    municipio.edadMedia = municipio.poblacion > 0 && Number.isFinite(municipio.sumaEdades)
        ? Number((municipio.sumaEdades / municipio.poblacion).toFixed(2))
        : 0;

    delete municipio.sumaEdades;
}

fs.writeFileSync(
    output,
    JSON.stringify(municipios, null, 2),
    "utf8"
);

const nombres = Object.entries(municipios)
    .map(([codigo, municipio]) => `${codigo} - ${municipio.nombre}`)
    .sort();

fs.writeFileSync(
    "./data/lista_municipios.txt",
    nombres.join("\n"),
    "utf8"
);

console.log(`Generados ${nombres.length} municipios.`);
console.log("Lista guardada en data/lista_municipios.txt");