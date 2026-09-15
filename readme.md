# Retorika · Inteligencia Territorial

Prototipo web desarrollado como prueba técnica para Retorika Academy SL.

La aplicación permite consultar información territorial de municipios de España orientada al análisis de campañas electorales.

## Funcionalidades

La aplicación cuenta con un mapa interactivo desde el que se puede navegar por comunidades autónomas, provincias y municipios.

Una vez seleccionado un municipio, se puede consultar:

* Resumen territorial
* Demografía
* Economía
* Elecciones
* Instituciones y representantes
* Comparación con otros municipios
* Informes

El territorio seleccionado se mantiene durante la navegación mediante los parámetros `code` y `name` de la URL.

Ejemplo:

territorio.html?code=36057&name=Vigo

## Datos

Los datos se almacenan principalmente en archivos JSON dentro de `data/`.

Se utilizan datos de diferentes fuentes públicas, entre ellas:

* Instituto Geográfico Nacional (IGN)
* Instituto Galego de Estatística (IGE)
* Xunta de Galicia
* Datos electorales públicos
* Información pública de representantes municipales

También se incluyen los archivos originales utilizados para generar parte de los datos.

Los scripts de generación y comprobación de datos son:

generar_instituciones.js
generar_ayuntamientos.js
generar_entidades_locales.js

## Tecnologías

* HTML5
* CSS3
* JavaScript
* Leaflet
* Chart.js
* JSON
* CSV
* XLSX

## Navegación

El flujo principal es:


Inicio → Mapa → Comunidad → Provincia → Municipio

Desde el análisis de un municipio se puede acceder a Economía, Elecciones, Instituciones, Comparar e Informes manteniendo el territorio seleccionado.

Por ejemplo:


economia.html?code=36057&name=Vigo
comparar.html?code=36057&name=Vigo
informes.html?code=36057&name=Vigo

## Estado del proyecto

La fase desarrollada corresponde principalmente a ANALIZA, incluyendo el mapa y las diferentes herramientas de consulta territorial.

Las fases PLANIFICA y CONECTA quedan planteadas como futuras ampliaciones del proyecto.
