/**
 * @name Spotify-Lyrics-Status
 * @author nous
 * @version 0.1.3
 * @description Change your status to the lyrics of the music you a listening to
 * @website https://github.com/filveith
 * @source https://github.com/filveith/BetterDiscord-Spotify-Lyrics-Status
 * @updateUrl https://raw.githubusercontent.com/filveith/BetterDiscord-Spotify-Lyrics-Status/master/Spotify-Lyrics-Status.plugin.js?token=ATY7NEUY5VDV52AP5JT2VW3BBSMNM
 */

 module.exports = (_ => {
    const config = {
        "info": {
            "name": "Spotify-Lyrics-Status",
            "author": "Robin & Fil & Tom",
            "version": "0.1.3",
            "description": "Change your status to the lyrics of the music your a listening to"
        },
        "changeLog": {
            "improved": {
                "Working": "And that's something",
                "New": "Remove status when music paused"
            }
        }
    };

    const Status = {
        authToken: Object.values(webpackJsonp.push([[], { ['']: (_, e, r) => { e.cache = r.c } }, [['']]]).cache).find(m => m.exports && m.exports.default && m.exports.default.getToken !== void 0).exports.default.getToken(),

        strerror: (req) => {
            if (req.status < 400)
                return undefined;

            if (req.status == 401)
                return "Invalid AuthToken";

            let json = JSON.parse(req.response);
            for (const s of ["errors", "custom_status", "text", "_errors", 0, "message"])
                if ((json == undefined) || ((json = json[s]) == undefined))
                    return "Internal. Report at https://github.com/filveith/BetterDiscord-Spotify-Lyrics-Status";
            return json;
        },

        request: () => {
            let req = new XMLHttpRequest();
            req.open("PATCH", "/api/v8/users/@me/settings", true);
            req.setRequestHeader("authorization", Status.authToken);
            req.setRequestHeader("content-type", "application/json");
            req.onload = () => {
                let err = Status.strerror(req);
                if (err != undefined)
                    BDFDB.NotificationUtils.toast(`Animated Status: Error: ${err}`, { type: "error" });
            };
            return req;
        },

        set: (status) => {
            let data = {};
            data.text = status;
            Status.request().send(JSON.stringify({ custom_status: data }));
        },

        unset: () => {
            let data = {};
            Status.request().send(JSON.stringify({ custom_status: data }));
        }
    };

    var currentLyrics, cleared = false, songIsPlaying = false, oldSong = " "

    return !window.BDFDB_Global || (!window.BDFDB_Global.loaded && !window.BDFDB_Global.started) ? class {
        getName() { return config.info.name; }
        getAuthor() { return config.info.author; }
        getVersion() { return config.info.version; }
        getDescription() { return `The Library Plugin needed for ${config.info.name} is missing. Open the Plugin Settings to download it. \n\n${config.info.description}`; }

        downloadLibrary() {
            require("request").get("https://mwittrien.github.io/BetterDiscordAddons/Library/0BDFDB.plugin.js", (e, r, b) => {
                if (!e && b && r.statusCode == 200) require("fs").writeFile(require("path").join(BdApi.Plugins.folder, "0BDFDB.plugin.js"), b, _ => BdApi.showToast("Finished downloading BDFDB Library", { type: "success" }));
                else BdApi.alert("Error", "Could not download BDFDB Library Plugin. Try again later or download it manually from GitHub: https://mwittrien.github.io/downloader/?library");
            });
        }

        load() {
            if (!window.BDFDB_Global || !Array.isArray(window.BDFDB_Global.pluginQueue)) window.BDFDB_Global = Object.assign({}, window.BDFDB_Global, { pluginQueue: [] });
            if (!window.BDFDB_Global.downloadModal) {
                window.BDFDB_Global.downloadModal = true;
                BdApi.showConfirmationModal("Library Missing", `The Library Plugin needed for ${config.info.name} is missing. Please click "Download Now" to install it.`, {
                    confirmText: "Download Now",
                    cancelText: "Cancel",
                    onCancel: _ => { delete window.BDFDB_Global.downloadModal; },
                    onConfirm: _ => {
                        delete window.BDFDB_Global.downloadModal;
                        this.downloadLibrary();
                    }
                });
            }
            if (!window.BDFDB_Global.pluginQueue.includes(config.info.name)) window.BDFDB_Global.pluginQueue.push(config.info.name);
        }
        start() { this.load(); }
        stop() { }
        getSettingsPanel() {
            let template = document.createElement("template");
            template.innerHTML = `<div style="color: var(--header-primary); font-size: 16px; font-weight: 300; white-space: pre; line-height: 22px;">The Library Plugin needed for ${config.info.name} is missing.\nPlease click <a style="font-weight: 500;">Download Now</a> to install it.</div>`;
            template.content.firstElementChild.querySelector("a").addEventListener("click", this.downloadLibrary);
            return template.content.firstElementChild;
        }

    } : (([Plugin, BDFDB]) => {
        return class SpotifyToken extends Plugin {

            onLoad() { }

            onStart() {
                updateInterval = BDFDB.TimeUtils.interval(_ => {
                    try {
                        let song = BDFDB.LibraryModules.SpotifyTrackUtils.getActivity(false);
                        if (song) {
                            cleared = false
                            this.getSpotifyToken();
                        } else if (!song && !cleared) {
                            BDFDB.NotificationUtils.toast("TEST")
                            Status.unset();
                            cleared = true;
                            Status.unset();
                        }
                    } catch (error) { }
                }, 1000);
            }

            onStop() { BDFDB.TimeUtils.clear(updateInterval); }

            getSpotifyToken() {

                return new Promise(callback => {
                    BDFDB.LibraryRequires.request({
                        url: 'https://api.spotify.com/v1/me/player/currently-playing',
                        method: "GET",
                        headers: {
                            authorization: `Bearer ${BDFDB.LibraryModules.SpotifyTrackUtils.getActiveSocketAndDevice().socket.accessToken}`
                        }
                    }, (error, response, result) => {

                        if (response && response.statusCode == 401) {
                            BDFDB.LibraryModules.SpotifyUtils.getAccessToken(socket.accountId).then(promiseResult => {
                                let newSocketDevice = BDFDB.LibraryModules.SpotifyTrackUtils.getActiveSocketAndDevice();
                            });
                        }

                        const getLyrics = async () => {
                            try {
                                var requestResult = JSON.parse(result)
                                var songNameFormated = (requestResult.item.name).replace(/ /g, '%20')
                                var artistNameFormated = (requestResult.item.album.artists[0].name).replace(/ /g, '%20')
                                var url = ('https://api.textyl.co/api/lyrics?q=' + artistNameFormated + '%20' + songNameFormated)
                                var currentTimeInSong, currentPositionLyrics

                                if (requestResult.item.id != oldSong) {
                                    //GET A JSON FILE WITH THE LYRICS FROM textyl.com
                                    currentLyrics = (await (await fetch(url)).json());
                                }


                                //GET THE CURRENT POSITION IN THE SONG
                                currentTimeInSong = ((requestResult.progress_ms / 1000).toFixed());

                                for (let checkSeconds = 0; checkSeconds < currentLyrics.length; checkSeconds++) {
                                    if ((currentLyrics[checkSeconds].seconds) <= (currentTimeInSong)) {
                                        currentPositionLyrics = checkSeconds
                                    }
                                }

                                //CHANGES THE STATUS TO THE CURRENT LYRICS
                                Status.set("🎵 " + currentLyrics[currentPositionLyrics].lyrics + " 🎵"); //TODO Parametre avec ou sans emoji quand afficher paroles

                                oldSong = requestResult.item.id;

                            } catch (error) {
                                try {
                                    if (typeof (currentLyrics.length) == 'number') {
                                        Status.unset()
                                    } else {
                                        Status.set("Error...");
                                    }
                                } catch (error) {
                                    Status.unset();
                                }
                            }
                        }
                        getLyrics();
                    });
                })
            }
        };
    })(window.BDFDB_Global.PluginUtils.buildPlugin(config));
})();


//TODO Parametre avec ou sans emoji quand afficher paroles
//TODO Parametre si unset ou set message (selon utilisateur)