/**
 * Cargar todas las series
 */
function getShows() {
    $.ajax({
        url: "https://platform.mediastre.am/api/show",
        type: "GET",
        dataType: "json",
        headers: {
            "X-API-Token": "215979b6242fdd636897c19bb6428cb5",
        },
        contentType: "application/json; charset=utf-8",
        success: function (result) {
            let data = result.data;
            $.each(data, function (key, serie) {
                $("#shows").append(`
                <section class="show-${serie._id} mb-5">
                    <h2 class="show-title text-white">${serie.title} 
                        <a href="javascript:;" onclick="verSerie(${key})" class="access float-end btn btn-danger btn-sm">Ver más</a>
                    </h2>
                         <div class="row" id="vid-${serie._id}"></div>
                    
                </section>
                `);
                getVideos(serie._id, serie.seasons[0]._id);
            });

            window.localStorage.setItem('series', JSON.stringify(data));

        },
        error: function (error) { },
    });
}

/**
 * Ver listado de episodios
 * @param {*} serieid 
 * @param {*} seasonsid 
 */

function getVideos(serieid, seasonsid) {
    $.ajax({
        url: "https://platform.mediastre.am/api/show/" + serieid + "/season/" + seasonsid + "/episode?limit=15",
        type: "GET",
        dataType: "json",
        headers: {
            "X-API-Token": "215979b6242fdd636897c19bb6428cb5",
        },
        contentType: "application/json; charset=utf-8",
        success: function (result) {
            let data = result.data;
            //data.splice(0, 1);
            let str = data[2].title.toLowerCase();
            if (str.includes("episodio")) {
                data = sortByKeyAsc(data, "title");
            }

            $.each(data, function (key, serie) {
                if (serie.content && serie.content[0].value._id != null) {
                    let id = key;

                    $("#vid-" + serieid).append(`
                
                        <div class="col-md-3 video">
                            <div class="episodio"> 
                                <a id="img-${id}" href="javascript:;" onclick="reproductor('${serieid}','${serie.content[0].value._id}')">
                                    <img class="netimg d-block w-100 h-200 hvr-grow" src="${serie.images[0].path}" alt="${serie.title}" >
                                </a>
                                <div class="pt-3 m-2 text-white season-title">${serie.title}</div>
                            </div>
                        </div>
                    
                    `);
                }
            });

            $("#vid-" + serieid).flickity({
                // options
                cellAlign: 'left',
                contain: true,
                pageDots: false
            });


        },
        error: function (error) { },
    });
}
/**
 * Ordenar los episodios por key
 * @param {*} array 
 * @param {*} key 
 * @returns 
 */
function sortByKeyAsc(array, key) {
    return array.sort(function (a, b) {
        var x = b[key];
        var y = a[key];
        x = parseInt(x.replace(/[^0-9\.]+/g, ""));
        y = parseInt(y.replace(/[^0-9\.]+/g, ""));
        return x > y ? -1 : x < y ? 1 : 0;
    });
}
/**
 * Ver serie popup
 * @param {*} id 
 */
function verSerie(id) {
    let series = window.localStorage.getItem('series');
    series = JSON.parse(series);
    let serieData = series[id];
    if ($("#serieModal-" + serieData._id).length > 0) {
        var myModal = new bootstrap.Modal(document.getElementById('serieModal-' + serieData._id), {
            keyboard: false
        });
        myModal.show();
        $('.select-serie').on('change', function () {
            getVideoList(this.value);
        });
    } else {
        let image = "";
        if (serieData.images) {
            image = `
                <div class="img-serie">
                    <img class="d-block w-100" src="${serieData.images[0].path}" alt="${serieData.title}" >
                </div>
            `;
        }

        let sinopsis = "";
        if (serieData.description) {
            sinopsis = `
                <div class="sinopsis">
                    <b>Sinopsis:</b>
                    <p>${serieData.description}</p>
                </div>
            `;
        }

        let selectSeason = '<select id="seasons-' + serieData._id + '" class="form-select select-serie" aria-label="Serie select">';
        let contSeason = 1;
        let jsons = [];
        serieData.seasons.forEach(season => {
            let json = '{"season":"' + season._id + '","serie": "' + serieData._id + '"}';
            jsons.push(json);
            selectSeason += "<option value='" + json + "'>Temporada " + contSeason + "</option>";
            contSeason++;
        });
        selectSeason += '</select>';
        getVideoList(jsons[0]);
        $("body").append(`
                
            <div class="modal fade" id="serieModal-${serieData._id}" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
            <div class="modal-dialog modal-xl">
                <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="serieModalLabel">${serieData.title}</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                   ${image}
                   ${sinopsis}
                   ${selectSeason}
                   <ul class="list-group episode-list">
                   </ul>
                </div>
            </div>
            </div>
        
        `);
        var myModal = new bootstrap.Modal(document.getElementById('serieModal-' + serieData._id), {
            keyboard: false
        });
        myModal.show();
        $('.select-serie').on('change', function () {
            getVideoList(this.value);
        });
    }
}
/**
 * Mostrar lista de videos en el modal
 * @param {*} json 
 */
function getVideoList(json) {
    let jsonData = JSON.parse(json);
    $.ajax({
        url: "https://platform.mediastre.am/api/show/" + jsonData.serie + "/season/" + jsonData.season + "/episode",
        type: "GET",
        dataType: "json",
        headers: {
            "X-API-Token": "215979b6242fdd636897c19bb6428cb5",
        },
        contentType: "application/json; charset=utf-8",
        success: function (result) {
            let data = result.data;
            let str = data[2].title.toLowerCase();
            if (str.includes("episodio")) {
                data = sortByKeyAsc(data, "title");
            }
            $("#serieModal-" + jsonData.serie + " .episode-list").empty();
            $.each(data, function (key, episode) {
                if (episode.content && episode.content[0].value._id != null) {
                    let id = key;
                    $("#serieModal-" + jsonData.serie + " .episode-list").append(`
                        <li class="list-group-item">
                            <div class="row">
                                <div class="col-md-2">
                                    <a id="episode-${episode._id}" href="javascript:;" onclick="reproductor('${jsonData.serie}','${episode.content[0].value._id}')">
                                        <img class="netimg d-block w-100 h-100 hvr-grow" src="${episode.images[0].path}" alt="${episode.title}" >
                                    </a>
                                </div>
                                <div class="col-md-10">
                                    ${episode.title}
                                </div>
                            </div>
                        </li>
                    `);
                }
            });
        },
        error: function (error) { },
    });
}

function reproductor(serieid, codigo) {
    if ($("#serieModal-" + serieid).length > 0) {
        $("#serieModal-" + serieid + ' .btn-close').click();
    }


    $("#modalVideo .modal-body").empty();
    $("#modalVideo .modal-body").append(`
        <div id="videoSerie" class="embed-responsive embed-responsive-16by9">
            <iframe class="embed-responsive-item" src="//mdstrm.com/embed/${codigo}" allowfullscreen></iframe>
        </div>
    `);
    var myModal = new bootstrap.Modal(document.getElementById('modalVideo'), {
        keyboard: false
    });
    myModal.show();
}

$(document).ready(function () {
    localStorage.clear();
    getShows();
});