// app.js
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
    $('#selectedAuthor').text('');
    $('#totalPoints').text('0');
    $('#selectedBlueprintName').text('');

    ActiveAPI.getBlueprintsByAuthor(author, (plans) => {
        if (plans.length === 0) {
            alert(`No se encontraron planos para el autor "${author}".`);
            return;
        }

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
                        <button class="btn btn-sm btn-primary openBlueprintBtn" data-name="${bp.name}">
                            Abrir
                        </button>
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
    const author = $('#authorInput').val().trim();
    if (!author) {
        alert('Debe ingresar un nombre de autor.');
        return;
    }
    updateBlueprints(author);
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
