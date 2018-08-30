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
                const profileListElement = $("#profiles-view");

                if (data.profiles.length > 1) {
                    data.profiles.forEach(profile => {
                        profileListElement.append($("<button type=\"button\" class=\"btn profile-options\"></button>")
                            .val(profile["profile-name"])
                            .text(profile["profile-name"])
                            .click(function () {
                                $(".profile-options").removeClass("btn-success");
                                $(this).addClass("btn-success");

                                window.owiWSObject.setCurrentProfile({
                                    'profile-name': $(this).val()
                                });
                            })
                        )
                    });

                    $("#v-pills-profiles-tab").removeClass("invisible");
                }
            });

            window.owiWSObject.GetCurrentProfile().then(data => {
                const profileName = data["profile-name"];

                $("button.profile-options").filter(function () {
                    if ($(this).val() === profileName)
                        $(this).addClass("btn-success");
                });
            });

            window.owiWSObject.GetSceneList().then(data => {
                const sceneListElement = $("#scenes-view");

                if (data.scenes.length > 1) {
                    data.scenes.forEach(scene => {
                        sceneListElement.append($("<button type=\"button\" class=\"btn scene-options\"></button>")
                            .val(scene["name"])
                            .text(scene["name"])
                            .click(function () {
                                $(".scene-options").removeClass("btn-success");
                                $(this).addClass("btn-success");

                                window.owiWSObject.setCurrentScene({
                                    'scene-name': $(this).val()
                                });
                            })
                        )
                    });
                }
            });

            window.owiWSObject.GetCurrentScene().then(data => {
                const sceneName = data["name"];

                $("button.scene-options").filter(function () {
                    if ($(this).val() === sceneName)
                        $(this).addClass("btn-success");
                });
            });

            getStreamingStatus(true);

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

function getStreamingStatus() {
    $("#stream-start").click(function () {
        window.owiWSObject.StartStreaming();
    });

    $("#stream-stop").click(function () {
        window.owiWSObject.StopStreaming();
    });

    setInterval(function () {
        window.owiWSObject.GetStreamingStatus().then(data => {
            if (data["streaming"]) {
                $("#state-online").show();
                $("#state-offline").hide();
                $("#stream-start").addClass('disabled');
                $("#stream-stop").removeClass('disabled');
                $("#state-timer").show();
                $("#state-timer").text(data["streamTimecode"].substring(0, data["streamTimecode"].indexOf(".")));
            } else {
                $("#state-online").hide();
                $("#state-offline").show();
                $("#stream-start").removeClass('disabled');
                $("#stream-stop").addClass('disabled');
                $("#state-timer").hide();
            }
        });
    }, 500);
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

function pad(num) {
    return ("0" + num).slice(-2);
}

function hhmmss(secs) {
    var minutes = Math.floor(secs / 60);
    secs = secs % 60;
    var hours = Math.floor(minutes / 60);
    minutes = minutes % 60;
    return pad(hours) + ":" + pad(minutes) + ":" + pad(secs);
}