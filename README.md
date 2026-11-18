---
tipo: recurso
fuente: Open-Meteo
fecha: 2026-11-12
tags:
  - javascript
  - fetch
  - api
  - ejercicio
---
# Ejercicio: API del clima con Fetch

## Objetivo

Crear una página web que consulte el clima actual de una ciudad usando JavaScript, `fetch` y una API gratuita. La persona debe completar la solución sin copiar una implementación terminada.

## API propuesta

Se utilizará [Open-Meteo](https://open-meteo.com/en/docs). Su API de geocodificación permite buscar una ciudad y obtener sus coordenadas; luego, la API de pronóstico permite consultar condiciones actuales como temperatura, humedad, viento y código meteorológico. Para este ejercicio no se necesita una API key.

Endpoints sugeridos:

- Geocodificación: `https://geocoding-api.open-meteo.com/v1/search`
- Pronóstico: `https://api.open-meteo.com/v1/forecast`

Parámetros sugeridos:

- Geocodificación: `name`, `count=1`, `language=es`, `format=json`, `countryCode=CO`.
- Pronóstico: `latitude`, `longitude`, `current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m` y `timezone=auto`.

## Cómo funciona la API

La aplicación realiza dos solicitudes porque el usuario escribe el nombre de una ciudad, pero el pronóstico necesita coordenadas geográficas:

```text
nombre de ciudad
      ↓
Geocoding API → latitude y longitude
      ↓
Forecast API → condiciones actuales del clima
      ↓
interfaz HTML
```

La primera respuesta entrega la ubicación. Con `latitude` y `longitude` de esa respuesta se construye la segunda URL. La segunda respuesta entrega los datos meteorológicos y sus unidades.

Las respuestas exitosas son objetos JSON. Si un parámetro es inválido, la API puede devolver un error HTTP `400` con una propiedad `reason` que explica el problema. Por eso el código debe comprobar `response.ok` antes de procesar el JSON.

## Endpoint 1: Geocoding API

### ¿Para qué sirve?

Sirve para convertir un nombre de ciudad o código postal en una lista de ubicaciones con coordenadas. En este ejercicio se usa para encontrar la ciudad que escribió la persona y obtener la latitud y longitud necesarias para consultar el clima.

### URL

```text
https://geocoding-api.open-meteo.com/v1/search
```

### Parámetros utilizados

| Parámetro | Ejemplo | Para qué sirve |
|---|---|---|
| `name` | `Medellín` | Nombre de la ciudad o código postal que se quiere buscar. Es obligatorio. |
| `count` | `1` | Cantidad máxima de resultados. El ejercicio usa el primer resultado. |
| `language` | `es` | Solicita nombres traducidos al español cuando están disponibles. |
| `format` | `json` | Indica que la respuesta debe entregarse como JSON. |
| `countryCode` | `CO` | Filtra los resultados por el código ISO de Colombia. |

### Ejemplo de solicitud

```text
https://geocoding-api.open-meteo.com/v1/search?name=Medell%C3%ADn&count=1&language=es&format=json&countryCode=CO
```

### ¿Qué devuelve?

Devuelve un objeto con la propiedad `results`, que es un arreglo de ubicaciones encontradas. Cada elemento puede incluir:

- `name`: nombre de la ubicación.
- `latitude`: latitud.
- `longitude`: longitud.
- `country`: país.
- `country_code`: código de país.
- `admin1`: departamento, estado o región administrativa.
- `timezone`: zona horaria.
- `elevation`: elevación aproximada.

Ejemplo reducido e ilustrativo; los valores reales cambian según el momento de la consulta:

```json
{
  "results": [
    {
      "name": "Medellín",
      "latitude": 6.25,
      "longitude": -75.56,
      "country": "Colombia",
      "country_code": "CO",
      "timezone": "America/Bogota"
    }
  ]
}
```

En JavaScript, el ejercicio toma el primer resultado con `data.results[0]`. Si el arreglo está vacío, significa que no se encontró una ubicación válida.

## Endpoint 2: Forecast API

### ¿Para qué sirve?

Sirve para consultar datos meteorológicos a partir de una latitud y una longitud. Puede devolver condiciones actuales, datos por hora y datos diarios. En este ejercicio solo se solicitan las condiciones actuales.

### URL

```text
https://api.open-meteo.com/v1/forecast
```

### Parámetros utilizados

| Parámetro | Ejemplo | Para qué sirve |
|---|---|---|
| `latitude` | `6.25` | Latitud obtenida del endpoint de geocodificación. Es obligatorio. |
| `longitude` | `-75.56` | Longitud obtenida del endpoint de geocodificación. Es obligatorio. |
| `current` | `temperature_2m,...` | Lista de variables meteorológicas actuales que se desean recibir. |
| `timezone` | `auto` | Detecta automáticamente la zona horaria de las coordenadas. |

### Variables solicitadas en `current`

| Variable | Qué representa | Unidad habitual |
|---|---|---|
| `temperature_2m` | Temperatura del aire a 2 metros sobre el suelo. | `°C` |
| `relative_humidity_2m` | Humedad relativa a 2 metros. | `%` |
| `weather_code` | Código numérico de la condición meteorológica según WMO. | Código numérico |
| `wind_speed_10m` | Velocidad del viento a 10 metros. | `km/h` |

### Ejemplo de solicitud

```text
https://api.open-meteo.com/v1/forecast?latitude=6.25&longitude=-75.56&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&timezone=auto
```

### ¿Qué devuelve?

Devuelve un objeto JSON con información general de la ubicación, el objeto `current` con los valores actuales y `current_units` con sus unidades.

Ejemplo reducido e ilustrativo; los valores reales cambian según el momento de la consulta:

```json
{
  "latitude": 6.25,
  "longitude": -75.56,
  "timezone": "America/Bogota",
  "current": {
    "time": "2026-11-18T10:00",
    "temperature_2m": 22.4,
    "relative_humidity_2m": 68,
    "weather_code": 2,
    "wind_speed_10m": 8.5
  },
  "current_units": {
    "temperature_2m": "°C",
    "relative_humidity_2m": "%",
    "weather_code": "wmo code",
    "wind_speed_10m": "km/h"
  }
}
```

Los valores se leen así:

```js
weather.current.temperature_2m;
weather.current_units.temperature_2m;
weather.current.relative_humidity_2m;
```

`weather_code` no trae una frase como “parcialmente nublado”; trae un número. Por eso `app.js` tiene la función `describeWeatherCode`, que traduce códigos como `0`, `2`, `61` o `95` a textos comprensibles.

## Cómo se conectan los dos endpoints en `app.js`

1. `searchLocation(city)` envía el nombre al endpoint de geocodificación.
2. La respuesta se convierte con `response.json()`.
3. Se extrae `latitude` y `longitude` del primer resultado.
4. `searchWeather(latitude, longitude)` usa esas coordenadas en el endpoint de pronóstico.
5. La respuesta se convierte nuevamente a JSON.
6. `renderWeather(location, weather)` muestra los datos en la tarjeta HTML.

La API de pronóstico acepta muchas más variables, incluyendo precipitación, nubosidad, visibilidad, presión, temperatura aparente y pronósticos horarios o diarios. Para este ejercicio se solicitan solo cuatro variables para mantener clara la relación entre la solicitud, la respuesta y la interfaz.

## Enunciado

Construir una aplicación que permita consultar y mostrar el clima actual de una ciudad colombiana.

La aplicación debe:

1. Permitir escribir el nombre de una ciudad.
2. Buscar la ciudad mediante el endpoint de geocodificación.
3. Obtener la latitud y longitud del resultado.
4. Consultar el clima actual mediante el endpoint de pronóstico.
5. Mostrar ciudad, temperatura, unidad, humedad, viento y descripción del estado del clima.
6. Mostrar un estado de carga mientras espera las respuestas.
7. Mostrar un mensaje claro cuando la ciudad no exista o falle una solicitud.
8. Validar `response.ok` antes de procesar cada respuesta.
9. Convertir el `weather_code` numérico en una descripción legible.

## Restricciones

- Usar `fetch` sin instalar bibliotecas externas.
- Usar promesas con `.then()` y `.catch()` antes de refactorizar, opcionalmente, a `async/await`.
- No escribir manualmente las coordenadas de las ciudades.
- No incluir una solución completa en este recurso.
- No desactivar la seguridad del navegador para evitar CORS.

## Criterios de éxito

- La consulta funciona con al menos una ciudad colombiana.
- La interfaz distingue carga, éxito y error.
- La respuesta se convierte desde JSON correctamente.
- Se controlan errores HTTP y errores de red.
- La persona puede explicar la relación entre API, endpoint, HTTP, JSON, promesas, `fetch` y CORS.

## Extensiones opcionales

- Mostrar la hora de actualización y la zona horaria.
- Cambiar el diseño según el código meteorológico.
- Consultar varias ciudades y compararlas.
- Separar la lógica en `buscarUbicacion`, `buscarClima` y `mostrarClima`.

## Fuentes

- [Open-Meteo Forecast API](https://open-meteo.com/en/docs)
- [Open-Meteo Geocoding API](https://open-meteo.com/en/docs/geocoding-api)
- [Tailwind CSS Play CDN](https://tailwindcss.com/docs/installation/play-cdn)

## Archivos

- [[index.html]]: interfaz inicial con estilos básicos.
- [[app.js]]: implementación de la solución con `fetch`, promesas, validaciones y manejo de errores.
