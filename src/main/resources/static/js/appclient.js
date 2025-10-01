// apiclient.js
const APIClient = (() => {

    function getBlueprintsByAuthor(author, callback) {
        $.ajax({
            url: `/api/blueprints/${author}`,
            type: 'GET',
            success: function(data) {
                const plans = data.map(bp => ({
                    name: bp.name,
                    points: bp.points
                }));
                callback(plans);
            },
            error: function() {
                callback([]);
            }
        });
    }

    function getBlueprintsByNameAndAuthor(author, bpname, callback) {
        $.ajax({
            url: `/api/blueprints/${author}/${bpname}`,
            type: 'GET',
            success: function(bp) {
                callback(bp.points || []);
            },
            error: function() {
                callback([]);
            }
        });
    }

    return {
        getBlueprintsByAuthor,
        getBlueprintsByNameAndAuthor
    };
})();
