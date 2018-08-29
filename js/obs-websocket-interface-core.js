/**
 * Initial Work
 */
$(function () {
    let ip = getUrlParameter("ip");
    let port = getUrlParameter("port");
    let password = getUrlParameter("password");

    if (ip && port) {
        $("#InputIP").val(ip);
        $("#InputPort").val(port);
        $("#InputPassword").val(password);

        wsConnect();
    }

    $("#button-connect").click(function () {
        wsConnect(true);
    });
});

/**
 * Helper Functions
 */
function wsConnect(isManual) {
    if (!window.owiWSObject || !window.owiWSObject._connected) {
        let ip = $("#InputIP").val();
        let port = $("#InputPort").val();
        let password = $("#InputPassword").val();

        window.owiWSObject = new OBSWebSocket();
        window.owiWSObject.connect({address: ip + ':' + port, password: password});

        window.owiWSObject.onConnectionOpened(() => {
            $("#v-pills-connect-tab").hide();
            $("#v-pills-stream-tab").click();

            window.owiWSObject.ListProfiles().then(data => {
                const profileListElement = $("#profile-list");

                if (data.profiles.length > 1) {
                    data.profiles.forEach(profile => {
                        profileListElement.append($("<option />")
                            .val(profile["profile-name"])
                            .text(profile["profile-name"])
                        )
                    });

                    $("#profiles-switch").click(function () {
                        window.owiWSObject.setCurrentProfile({
                            'profile-name': $("#profile-list").val()
                        });
                    });

                    $("#v-pills-profiles-tab").removeClass("invisible");
                }
            });

            window.owiWSObject.GetSceneList().then(data => {
                const sceneListElement = $("#scenes-list");

                if (data.scenes.length > 1) {
                    data.scenes.forEach(scene => {
                        sceneListElement.append($("<option />")
                            .val(scene["name"])
                            .text(scene["name"])
                        )
                    });

                    $("#scenes-switch").click(function () {
                        window.owiWSObject.setCurrentScene({
                            'scene-name': $("#scenes-list").val()
                        });
                    });
                }
            });

            window.owiWSObject.GetStreamingStatus().then(data => {
                if (data["streaming"]) {
                    $("#state-online").show();
                    $("#state-offline").hide();
                    $("#stream-start").addClass('disabled');
                    $("#stream-stop").removeClass('disabled');
                } else {
                    $("#state-online").hide();
                    $("#state-offline").show();
                    $("#stream-start").removeClass('disabled');
                    $("#stream-stop").addClass('disabled');
                }

                $("#stream-start").click(function () {
                    window.owiWSObject.StartStreaming();
                });

                $("#stream-stop").click(function () {
                    window.owiWSObject.StopStreaming();
                });
            });

            window.owiWSObject.GetSourcesList().then(data => {
                let inputs = data["sources"].filter(function (obj) {
                    return obj.type == "input";
                });

                if (inputs.length === 0)
                    $("#sound-input-list-group").hide();

                inputs.forEach(obj => {
                    $("#sound-input-list").append($("<option />")
                        .val(obj["name"])
                        .text(obj["name"])
                    )
                });

                let filter = data["sources"].filter(function (obj) {
                    return obj.type == "filter";
                });

                if (filter.length === 0)
                    $("#sound-filter-list-group").hide();

                filter.forEach(obj => {
                    $("#sound-filter-list").append($("<option />")
                        .val(obj["name"])
                        .text(obj["name"])
                    )
                });

                let transition = data["sources"].filter(function (obj) {
                    return obj.type == "transition";
                });

                if (transition.length === 0)
                    $("#sound-transition-list-group").hide();

                transition.forEach(obj => {
                    $("#sound-transition-list").append($("<option />")
                        .val(obj["name"])
                        .text(obj["name"])
                    )
                });

                let scenes = data["sources"].filter(function (obj) {
                    return obj.type == "scene";
                });

                if (scenes.length === 0)
                    $("#sound-scenes-list-group").hide();

                scenes.forEach(obj => {
                    $("#sound-scenes-list").append($("<option />")
                        .val(obj["name"])
                        .text(obj["name"])
                    )
                });

                let unknown = data["sources"].filter(function (obj) {
                    return obj.type == "unknown";
                });

                if (unknown.length === 0)
                    $("#sound-unknown-list-group").hide();

                unknown.forEach(obj => {
                    $("#sound-unknown-list").append($("<option />")
                        .val(obj["name"])
                        .text(obj["name"])
                    )
                });
            });

            $("#v-pills-scenes-tab").removeClass("invisible");
            $("#v-pills-stream-tab").removeClass("invisible");
            $("#v-pills-sound-tab").removeClass("invisible");

            $("#connect-form").hide();
            $("#connected-form").show();

            if (isManual) {
                let newUrl = "https://metalllogic93.github.io/obs-websocket-interface/?";

                newUrl = newUrl + "&ip=" + ip;
                newUrl = newUrl + "&port=" + port;

                if (password)
                    newUrl = newUrl + "&passwort=" + password;

                $("#custom-url").val(newUrl);
                $('#url-modal').modal('show');
            }
        });
    }
}

//http://www.jquerybyexample.net/2012/06/get-url-parameters-using-jquery.html
function getUrlParameter(sParam) {
    var sPageURL = decodeURIComponent(window.location.search.substring(1)),
        sURLVariables = sPageURL.split('&'),
        sParameterName,
        i;

    for (i = 0; i < sURLVariables.length; i++) {
        sParameterName = sURLVariables[i].split('=');

        if (sParameterName[0] === sParam) {
            return sParameterName[1] === undefined ? true : sParameterName[1];
        }
    }
}

/*

function inputChanged() {
    let name = $("#sound-input-list").val();
    let volume = $("#sound-input-range").val();

    window.owiWSObject.SetVolume(name, volume);
}

function filterChanged() {
    let name = $("#sound-filter-list").val();
    let volume = $("#sound-filter-range").val();

    window.owiWSObject.SetVolume(name, volume);
}

function transitionsChanged() {
    let name = $("#sound-transition-list").val();
    let volume = $("#sound-transition-range").val();

    window.owiWSObject.SetVolume(name, volume);
}

function scenesChanged() {
    let name = $("#sound-scenes-list").val();
    let volume = $("#sound-scenes-range").val();

    window.owiWSObject.SetVolume(name, volume);
}

function unknownChanged() {
    let name = $("#sound-unknown-list").val();
    let volume = $("#sound-unknown-range").val();

    window.owiWSObject.SetVolume(name, volume);
}

function inputInit() {
    let name = $("#sound-input-list").val();
    window.owiWSObject.GetVolume(name).then(data => {
        $("#sound-input-range").val(data.volume);
    });
}

function filterInit() {
    let name = $("#sound-filter-list").val();
    window.owiWSObject.GetVolume(name).then(data => {
        $("#sound-filter-range").val(data.volume);
    });
}

function transitionsInit() {
    let name = $("#sound-transition-list").val();
    window.owiWSObject.GetVolume(name).then(data => {
        $("#sound-transition-range").val(data.volume);
    });
}

function scenesInit() {
    let name = $("#sound-scenes-list").val();
    window.owiWSObject.GetVolume(name).then(data => {
        $("#sound-scenes-range").val(data.volume);
    });
}

function unknownInit() {
    let name = $("#sound-unknown-list").val();
    window.owiWSObject.GetVolume(name).then(data => {
        $("#sound-unknown-range").val(data.volume);
    });
}

*/