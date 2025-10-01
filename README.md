# Escuela Colombiana de Ingeniería

## Arquitecturas de Software

**Alumno:** Geronimo Martinez

# Construcción de un cliente 'grueso' con un API REST, HTML5, Javascript y CSS3

Este README incluye el enunciado del trabajo práctico y la **solución implementada** en cada sección.

---

## 1. Ajustes Backend

**Enunciado:**
Trabajar sobre la base del proyecto anterior, incluyendo las dependencias Maven de `webjars` para Bootstrap y jQuery.

**Solución:**

```xml
<dependency>
    <groupId>org.webjars</groupId>
    <artifactId>webjars-locator</artifactId>
</dependency>

<dependency>
    <groupId>org.webjars</groupId>
    <artifactId>bootstrap</artifactId>
    <version>3.3.7</version>
</dependency>

<dependency>
    <groupId>org.webjars</groupId>
    <artifactId>jquery</artifactId>
    <version>3.1.0</version>
</dependency>
```

Se asegura que las librerías se carguen localmente y no haya errores 404 en la página web.

---

## 2. Front-End - Vistas

**Enunciado:**
Crear la página `index.html` con:

* Campo de entrada para autor
* Botón "Get blueprints"
* `<div>` con el nombre del autor seleccionado
* Tabla HTML con encabezados
* `<div>` para mostrar total de puntos
* `<canvas>` para dibujar planos

**Solución:**

Archivo `index.html`:

```html
<!DOCTYPE html>
<html lang="es">
<head>
    <title>Blueprints</title>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <link rel="stylesheet" href="/webjars/bootstrap/css/bootstrap.min.css"/>
    <script src="/webjars/jquery/jquery.min.js"></script>
    <script src="/webjars/bootstrap/js/bootstrap.bundle.min.js"></script>
</head>
<body>

<div class="container my-5">
    <div class="text-center mb-4">
        <h1>Gestión de Blueprints</h1>
    </div>

    <div class="card mb-4">
        <div class="card-header">
            <strong>Consultar planos por autor</strong>
        </div>
        <div class="card-body">
            <form class="row g-3 align-items-center">
                <div class="col-auto">
                    <label for="authorInput" class="col-form-label">Autor:</label>
                </div>
                <div class="col-auto">
                    <input type="text" class="form-control" id="authorInput" placeholder="Ingrese el autor">
                </div>
                <div class="col-auto">
                    <button type="button" id="getBlueprintsBtn" class="btn btn-primary">Get blueprints</button>
                </div>
            </form>
        </div>
    </div>

    <div class="alert alert-info">
        <strong>Autor seleccionado:</strong> <span id="selectedAuthor"></span>
        <table class="table table-striped" id="blueprintsTable">
            <thead>
            <tr>
                <th>Nombre</th>
                <th>Puntos</th>
                <th>Acción</th>
            </tr>
            </thead>
            <tbody>
            </tbody>
        </table>

        <div class="card mb-4">
            <div class="card-header">
                <strong>Plano seleccionado: <span id="selectedBlueprintName"></span></strong>
            </div>
            <div class="card-body">
                <canvas id="blueprintCanvas" width="500" height="400" style="border:1px solid #000;"></canvas>
            </div>
        </div>

        <div>
            <strong>Total de puntos:</strong> <span id="totalPoints">0</span>
        </div>
    </div>
</div>

<script src="js/apimock.js"></script>
<script src="js/appclient.js"></script>
<script src="js/app.js"></script>
</body>
</html>
```

---

## 3. Front-End - Lógica

**Enunciado:**
Crear un módulo JavaScript (`app.js`) que mantenga:

* Autor seleccionado
* Listado de planos (nombre y número de puntos)

Y permita actualizar la tabla, calcular total de puntos y dibujar planos en un `<canvas>`.

**Solución:**

Archivo `app.js`:

```javascript
const BlueprintApp = (() => {
    let selectedAuthor = '';
    let blueprintsList = [];
    const ActiveAPI = (typeof APIClient !== 'undefined') ? APIClient : APIMock;

    function setSelectedAuthor(author) {
        selectedAuthor = author;
    }

    function getSelectedAuthor() {
        return selectedAuthor;
    }

    function updateBlueprints(author) {
        setSelectedAuthor(author);
        $('#blueprintsTable tbody').empty();

        ActiveAPI.getBlueprintsByAuthor(author, (plans) => {
            blueprintsList = plans.map(p => ({
                name: p.name,
                points: p.points.length
            }));

            blueprintsList.forEach(bp => {
                $('#blueprintsTable tbody').append(`
                    <tr>
                        <td>${bp.name}</td>
                        <td>${bp.points}</td>
                        <td>
                            <button class="btn btn-sm btn-primary openBlueprintBtn" data-name="${bp.name}">Abrir</button>
                        </td>
                    </tr>
                `);
            });

            const totalPoints = blueprintsList.reduce((sum, bp) => sum + bp.points, 0);
            $('#totalPoints').text(totalPoints);
            $('#selectedAuthor').text(author);
        });
    }

    function drawBlueprint(author, blueprintName) {
        ActiveAPI.getBlueprintsByNameAndAuthor(author, blueprintName, (points) => {
            const canvas = document.getElementById('blueprintCanvas');
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            if (points.length > 0) {
                ctx.beginPath();
                ctx.moveTo(points[0].x, points[0].y);
                points.slice(1).forEach(p => ctx.lineTo(p.x, p.y));
                ctx.stroke();
            }

            $('#selectedBlueprintName').text(blueprintName);
        });
    }

    $(document).ready(() => {
        $('#getBlueprintsBtn').on('click', () => {
            const author = $('#authorInput').val();
            if (author) updateBlueprints(author);
        });

        $(document).on('click', '.openBlueprintBtn', function() {
            const blueprintName = $(this).data('name');
            const author = getSelectedAuthor();
            drawBlueprint(author, blueprintName);
        });
    });

    return {
        setSelectedAuthor,
        getSelectedAuthor,
        updateBlueprints,
        drawBlueprint
    };
})();
```

---

## 4. Módulos de Datos

**APIMock.js** (simula datos locales):

```javascript
const APIMock = (() => {
    const blueprintsData = {
        "Alice": [
            { name: "Plano1", points: [{x:10,y:10},{x:50,y:50},{x:80,y:20}] },
            { name: "Plano2", points: [{x:20,y:30},{x:60,y:80}] }
        ],
        "Bob": [
            { name: "Casa", points: [{x:5,y:5},{x:5,y:50},{x:50,y:50},{x:50,y:5},{x:5,y:5}] },
            { name: "Puente", points: [{x:0,y:0},{x:20,y:40},{x:40,y:20}] }
        ]
    };

    function getBlueprintsByAuthor(author, callback) {
        callback(blueprintsData[author] || []);
    }

    function getBlueprintsByNameAndAuthor(author, bpname, callback) {
        const plans = blueprintsData[author] || [];
        const bp = plans.find(p => p.name === bpname);
        callback(bp ? bp.points : []);
    }

    return { getBlueprintsByAuthor, getBlueprintsByNameAndAuthor };
})();
```

**APIClient.js** (datos reales del API REST):

```javascript
const APIClient = (() => {

    function getBlueprintsByAuthor(author, callback) {
        $.ajax({
            url: `/api/blueprints/${author}`,
            type: 'GET',
            success: function(data) {
                const plans = data.map(bp => ({ name: bp.name, points: bp.points }));
                callback(plans);
            },
            error: function() { callback([]); }
        });
    }

    function getBlueprintsByNameAndAuthor(author, bpname, callback) {
        $.ajax({
            url: `/api/blueprints/${author}/${bpname}`,
            type: 'GET',
            success: function(bp) { callback(bp.points || []); },
            error: function() { callback([]); }
        });
    }

    return { getBlueprintsByAuthor, getBlueprintsByNameAndAuthor };
})();
```

---

## 5. Resultado

* La página carga correctamente las librerías de jQuery y Bootstrap sin errores 404.
* Se puede ingresar un autor y mostrar la lista de planos con total de puntos.
* Se puede abrir un plano y dibujarlo en el canvas.
* Se puede cambiar entre datos de prueba (`APIMock`) y datos reales (`APIClient`) con una línea en `app.js`.
