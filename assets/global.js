
function getShows() {
    $.ajax({
        url: "https://platform.mediastre.am/api/show",
        type: "GET",
        dataType: "json",
        headers: {
            "X-API-Token": "864f50d59f92906175b3788cfce6d5a0",
        },
        contentType: "application/json; charset=utf-8",
        success: function (result) {
            let data = result.data;
            $.each(data, function (key, serie) {
                $("#shows").append(`
                <section class="show-${serie._id}">
                    <h4 class="show-title text-white">${serie.title} <a href="javascript:;" class="access">Ver más</a></h4>
                    <div class="row" id="vid-${serie._id}"></div>
                </section>
                `);
                getVideos(serie._id, serie.seasons[0]._id);
            });
        },
        error: function (error) { },
    });
}

function getVideos(serieid, seasonsid) {
    $.ajax({
        url: "https://platform.mediastre.am/api/show/" + serieid + "/season/" + seasonsid + "/episode?limit=5",
        type: "GET",
        dataType: "json",
        headers: {
            "X-API-Token": "864f50d59f92906175b3788cfce6d5a0",
        },
        contentType: "application/json; charset=utf-8",
        success: function (result) {
            let data = result.data;
            data.splice(0, 1);
            data = sortByKeyAsc(data, "title");
            $.each(data, function (key, serie) {
                if (serie.content && serie.content[0].value._id != null) {
                    let id = key;
                    $("#vid-" + serieid).append(`
                    <div class="col-md-3 video">
                        <a id="img-${id}" href="javascript:;">
                            <img class="d-block card-img-top" src="${serie.images[0].path}" alt="${serie.title}" >
                        </a>
                        <div class="p-3 m-2 text-white season-title">${serie.title}</div>
                    </div>
                `);
                }
            });
        },
        error: function (error) { },
    });
}

function sortByKeyAsc(array, key) {
    return array.sort(function (a, b) {
        var x = b[key];
        var y = a[key];
        x = parseInt(x.replace(/[^0-9\.]+/g, ""));
        y = parseInt(y.replace(/[^0-9\.]+/g, ""));
        return x > y ? -1 : x < y ? 1 : 0;
    });
}

$(document).ready(function () {
    getShows();
});