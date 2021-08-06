/**
 * @name Spotify-Lyrics-Status
 * @author nous
 * @version 0.1.3
 * @description Change your status to the lyrics of the music you a listening to
 * @website https://github.com/filveith
 * @source https://github.com/filveith/BetterDiscord-Spotify-Lyrics-Status
 */

//const req = require("../../../Downloads/0BDFDB.plugin");

module.exports = (_ => {
    const config = {
        "info": {
            "name": "Spotify-Lyrics-Status",
            "author": "nous",
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
            //BdApi.showToast("req = "+req, {type: "success"});
            return req;
        },

        set: (status) => {
            let data = {};

            //data.text = status[0];

            data.text = status;

            Status.request().send(JSON.stringify({ custom_status: data }));

            // if (stop) {
            //     unset();
            //     stop = false;
            // }
        },

        unset: () => {
            let data = {};
            //data.text = 
            Status.request().send(JSON.stringify({ custom_status: data }));
        }
    };

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
                        //BDFDB.NotificationUtils.toast("song = " + song.name);

                        if (song) {
                            //BDFDB.NotificationUtils.toast("song yes");
                            this.getSpotifyToken();
                        } else {
                            Status.unset();
                        }

                        //var repeat = setInterval(onStart(), 1000);
                        //BDFDB.NotificationUtils.toast("before lyrics");

                        // if (lastSongName == lastSong.details) {
                        // 	BDFDB.NotificationUtils.toast("setLyrics");
                        // } else {
                        // 	BDFDB.NotificationUtils.toast("getLyrics");
                        // }

                        //lastSongName = lastSong.details;
                    } catch (error) {
                        //BDFDB.NotificationUtils.toast("no song playing (Pause or no song)");
                    }
                }, 1000);
            }

            onStop() { BDFDB.TimeUtils.clear(updateInterval); } //clearInterval(repeat)

            getSpotifyToken() {

                // var _this;
                // var controls, stop;
                // var starting, lastSong, showActivity, currentVolume, lastVolume, stopTime, previousIsClicked, previousDoubleTimeout, currentTime;
                // var timelineTimeout, timelineDragging, updateInterval;
                // let currentLyrics;
                // var currentPositionLyrics;
                // let lastSongName;

                return new Promise(callback => {
                    BDFDB.LibraryRequires.request({
                        url: 'https://api.spotify.com/v1/me/player/currently-playing',
                        method: "GET",
                        headers: {
                            authorization: `Bearer ${BDFDB.LibraryModules.SpotifyTrackUtils.getActiveSocketAndDevice().socket.accessToken}`
                        }
                    }, (error, response, result) => {



                        response.statusCode == 401

                        if (response && response.statusCode == 401) {
                            //BDFDB.NotificationUtils.toast("new token")
                            
                            BDFDB.LibraryModules.SpotifyUtils.getAccessToken(socket.accountId).then(promiseResult => {
                                let newSocketDevice = BDFDB.LibraryModules.SpotifyTrackUtils.getActiveSocketAndDevice();
                                this.request(newSocketDevice.socket, newSocketDevice.device, type, data).then(_ => {
                                    try { }//callback(JSON.parse(result)); }
                                    catch (err) { callback({}); }
                                });
                            });
                        }
                        else {
                            try { }//callback(JSON.parse(result)); }
                            catch (err) { callback({}); }
                        }

                        //CUSTOM CODE START

                        var spotifyToken = BDFDB.LibraryModules.SpotifyTrackUtils.getActiveSocketAndDevice().socket.accessToken;

                        //PRINT TOKEN
                        //BDFDB.NotificationUtils.toast("token: " + spotifyToken)

                        //PARSES THE SPOTIFY TOKEN INTO YOUR CLIPBOARD
                        BDFDB.LibraryRequires.electron.clipboard.write({ text: spotifyToken });

                        //BDFDB.NotificationUtils.toast("result =  " + result)

                        var requestResult = JSON.parse(result)

                        var songNameFormated = (requestResult.item.name).replace(/ /g, '%20')
                        var artistNameFormated = (requestResult.item.album.artists[0].name).replace(/ /g, '%20')
                        const url = ('https://api.textyl.co/api/lyrics?q=' + artistNameFormated + '%20' + songNameFormated)

                        //BDFDB.NotificationUtils.toast(url)

                        var currentLyrics
                        let currentPositionLyrics
                        var currentTimeInSong

                        const getLyrics = async () => {
                            try {
                                currentLyrics = (await (await fetch(url)).json());

                                currentTimeInSong = ((requestResult.progress_ms / 1000).toFixed());

                                //BDFDB.NotificationUtils.toast("currentTime = " + currentTimeInSong)

                                for (let checkSeconds = 0; checkSeconds < currentLyrics.length; checkSeconds++) {
                                    //console.log('         index of loop: '+checkSeconds+'     time in json: '+n[checkSeconds].seconds+' == '+currentTimeInSong)
                                    if ((currentLyrics[checkSeconds].seconds) <= (currentTimeInSong)) {
                                        //console.log('true')
                                        currentPositionLyrics = checkSeconds
                                    }
                                }

                                //BDFDB.NotificationUtils.toast("lyrics = " + currentLyrics[currentPositionLyrics].lyrics)

                                Status.set(currentLyrics[currentPositionLyrics].lyrics)

                            } catch (error) {
                                try {
                                    if (typeof (currentLyrics.length) == 'number') {
                                        //BDFDB.NotificationUtils.toast('the song exist in the data base, but no lyrics for the moment   errro = ' + error)
                                        Status.unset()
                                    } else {
                                        //BDFDB.NotificationUtils.toast('the song doesnt exist in the data base   error = ' + error)
                                        //BDFDB.NotificationUtils.toast("Connais pas mon reuf deso...")
                                        Status.set("Error...");
                                    }
                                } catch (error) {
                                    Status.unset();
                                }
                            }
                        }

                        getLyrics();

                        //CUSTOM CODE END
                    });
                })
            }
        };
    })(window.BDFDB_Global.PluginUtils.buildPlugin(config));
})();