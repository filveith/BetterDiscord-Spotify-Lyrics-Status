/**
 * @name Spotify-Lyrics-Status
 * @author Skitzuuu & HatersGonnaHate
 * @version 2.0.2
 * @description Change your discord status to the lyrics of the music your a listening to on Spotify
 * @source https://github.com/filveith/BetterDiscord-Spotify-Lyrics-Status
 * @updateUrl https://raw.githubusercontent.com/filveith/BetterDiscord-Spotify-Lyrics-Status/master/Spotify-Lyrics-Status.plugin.js
 */

module.exports = (_ => {
    const config = {
        "info": {
            "name": "Spotify-Lyrics-Status",
            "author": "Skitzuuu & HatersGonnaHate",
            "version": "2.0.2",
            "description": "Change your discord status to the lyrics of the music you a listening to on Spotify",
            "rawUrl": "https://raw.githubusercontent.com/filveith/BetterDiscord-Spotify-Lyrics-Status/main/Spotify-Lyrics-Status.plugin.js"
        },
        "changeLog": {
            "improved": {
                "Fixed": "Auto update added"
            }
        }
    };

    /* Status API imported from Animated-Status*/
    const Status = {

        authToken: '',

        strerror: (req) => {
            if (req.status < 400) return undefined;
            if (req.status == 401) return "Invalid AuthToken";

            // Discord _sometimes_ returns an error message
            let json = JSON.parse(req.response);
            for (const s of["errors", "custom_status", "text", "_errors", 0, "message"])
                if ((json == undefined) || ((json = json[s]) == undefined))
                    return "Unknown error. Please report at github.com/filveith/BetterDiscord-Spotify-Lyrics-Status with a screenshot";

            return json;
        },


        Set: async(status) => {
            status = { text: status }

            let req = new XMLHttpRequest();
            req.open("PATCH", "/api/v9/users/@me/settings", true);
            req.setRequestHeader("authorization", Status.authToken);
            req.setRequestHeader("content-type", "application/json");
            req.onload = () => {
                let err = Status.strerror(req);
                // Ignore error when it is undefined or 'Could not interpret "{}" as string'
                if (err != undefined && err != 'Could not interpret "{}" as string.') {
                    BdApi.showToast(`Status Error: ${err}`, { type: "error" });
                }
            };
            if (status === {}) status = null;
            req.send(JSON.stringify({ custom_status: status }));
        },
    };

    const GUI = {
        newInput: (text = "", placeholder = "") => {
            let input = document.createElement("input");
            input.className = "inputDefault-3FGxgL input-2g-os5";
            input.value = String(text);
            input.placeholder = String(placeholder);
            return input;
        },

        newLabel: (text = "") => {
            let label = document.createElement("h5");
            label.className = "h5-2RwDNl";
            label.innerText = String(text);
            return label;
        },

        newDivider: (size = "15px") => {
            let divider = document.createElement("div");
            divider.style.minHeight = size;
            divider.style.minWidth = size;
            return divider;
        },

        newButton: (text, filled = true) => {
            let button = document.createElement("button");
            button.className = "button-f2h6uQ colorBrand-I6CyqQ sizeSmall-wU2dO- grow-2sR_-F";
            if (filled) button.classList.add("lookFilled-yCfaCM");
            else button.classList.add("lookOutlined-3yKVGo");
            button.innerText = String(text);
            return button;
        },

        newHBox: () => {
            let hbox = document.createElement("div");
            hbox.style.display = "flex";
            hbox.style.flexDirection = "row";
            return hbox;
        },

        newHyperlink: (mainText = "", linkText, url, hover = "") => {
            let linkTextE = document.createElement("a");
            linkTextE.style.display = "flex";
            linkTextE.style.flexDirection = "row";
            linkTextE.innerText = linkText;
            linkTextE.href = url
            linkTextE.title = hover

            let mainTextE = GUI.newLabel(mainText);

            mainTextE.appendChild(linkTextE)

            return mainTextE;
        },

        setSuggested: (element, value = true) => {
            if (value) element.classList.add("colorGreen-3y-Z79");
            else element.classList.remove("colorGreen-3y-Z79");
            return element;
        },
    };

    let currentLyrics, cleared = false,
        oldSong = " ",
        oldLyrics, noLyricsYet = false

    // One line if ? first = Install plungins : start script
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
        stop() {}
        getSettingsPanel() {
            let template = document.createElement("template");
            template.innerHTML = `<div style="color: var(--header-primary); font-size: 16px; font-weight: 300; white-space: pre; line-height: 22px;">The Library Plugin needed for ${config.info.name} is missing.\nPlease click <a style="font-weight: 500;">Download Now</a> to install it.</div>`;
            template.content.firstElementChild.querySelector("a").addEventListener("click", this.downloadLibrary);
            return template.content.firstElementChild;
        }
    } : (([Plugin, BDFDB]) => {

        return class Spotify_Lyrics_Status extends Plugin {

            onLoad() {
                BDFDB.PluginUtils.downloadUpdate(config.info.name, config.info.updateUrl)
                    // Get the discord token
                Status.authToken = BdApi.findModule(m => m.default && m.default.getToken).default.getToken();
            }

            onStart() {
                // Get the discord token
                Status.authToken = BdApi.findModule(m => m.default && m.default.getToken).default.getToken();
                // Get the spotify token
                let newSocketDevice = BDFDB.LibraryModules.SpotifyTrackUtils.getActiveSocketAndDevice();
                let socket = newSocketDevice.socket

                // Check if a configuration file exists, if not create one with default data
                try {
                    if (typeof(this.getData("sEmoji")) == "undefined") {
                        this.setData("sEmoji", "🎵")
                        this.setData("eEmoji", "🎵")
                        this.setData("noMusic", "")
                        this.setData("noLyrics", "")
                    }
                } catch (error) { BDFDB.NotificationUtils.toast("Error while writing to the config file, Please report at github.com/filveith/BetterDiscord-Spotify-Lyrics-Status with a screenshot error : " + error) }

                //The loop for the entire program
                this.interval = setInterval(() => {
                    try {
                        let song = BDFDB.LibraryModules.SpotifyTrackUtils.getActivity(false);

                        if (song) {
                            cleared = false
                            this.request(socket);
                        } else if (!song && !cleared) {
                            let noMusicData = this.getData("noMusic")
                            Status.Set(noMusicData == "" ? Status.Set() : noMusicData);
                            cleared = true;
                        }
                    } catch (error) {}
                }, 1000);
            }

            onStop() {
                Status.Set()
                clearInterval(this.interval);
            }

            setData(key, value) {
                BdApi.setData(this.getName(), key, value);
            }

            getData(key) {
                return BdApi.getData(this.getName(), key);
            }

            request(socket) {
                return new Promise(callback => {
                    // Get the song the user is currently listening to on spotify
                    BDFDB.LibraryRequires.request({
                        url: 'https://api.spotify.com/v1/me/player/currently-playing',
                        method: "GET",
                        headers: {
                            authorization: `Bearer ${socket.accessToken}`
                        }
                    }, (error, response, result) => {
                        // If the users Spotify Token is expired get a new one
                        if (response && response.statusCode == 401) {
                            BDFDB.LibraryModules.SpotifyUtils.getAccessToken(socket.accountId).then(promiseResult => {
                                let newSocketDevice = BDFDB.LibraryModules.SpotifyTrackUtils.getActiveSocketAndDevice();
                                this.request(newSocketDevice.socket).then(_ => {
                                    try { callback(JSON.parse(result)); } catch (err) { callback({}); }
                                });
                            });
                        } else {
                            try { callback(JSON.parse(result)); } catch (err) { callback({}); }
                        }


                        try {

                            let requestResult = JSON.parse(result)
                            let songNameFormated = (requestResult.item.name).replace(/ /g, '%20')
                            let artistNameFormated = (requestResult.item.album.artists[0].name).replace(/ /g, '%20')
                            let url = (`https://api.textyl.co/api/lyrics?q=${artistNameFormated}%20${songNameFormated}`)
                            let currentTimeInSong, currentPositionLyrics

                            // Check if the title is written in non-Latin characters, if yes we don't show the lyrics because it will crash the plugin (We don't know why)
                            if (!songNameFormated.match(/[\u3000-\u303f\u3040-\u309f\u30a0-\u30ff\uff00-\uff9f\u4e00-\u9faf\u3400-\u4dbf]/)) {

                                // Get the lyrics of the song currently playing (Is called only at the start of the song)
                                if (requestResult.item.id != oldSong) {
                                    Status.Set()

                                    BDFDB.LibraryRequires.request({
                                        url: url,
                                        method: "GET",
                                        headers: {
                                            "content-type": "application/json"
                                        }
                                    }, (error, response, lyrics) => {

                                        if (response.statusCode == 200) {
                                            currentLyrics = JSON.parse(lyrics);
                                        } else {
                                            Status.Set()
                                            currentLyrics = {}
                                        }

                                    })

                                    oldSong = requestResult.item.id;
                                    noLyricsYet = false
                                }

                                //GET THE CURRENT POSITION IN THE SONG
                                currentTimeInSong = ((requestResult.progress_ms / 1000).toFixed());

                                // Syncronize the song with the lyrics
                                for (let checkSeconds = 0; checkSeconds < currentLyrics.length; checkSeconds++) {
                                    if ((currentLyrics[checkSeconds].seconds) <= (currentTimeInSong)) {
                                        currentPositionLyrics = checkSeconds
                                    }
                                }

                                //GETs THE SAVED EMOJIS FROM THE JSON FILE
                                let sEmoji = this.getData("sEmoji")
                                let eEmoji = this.getData("eEmoji")

                                //CHANGES THE STATUS TO THE CURRENT LYRICS
                                let newLyrics = currentLyrics[currentPositionLyrics].lyrics
                                if (newLyrics != oldLyrics) {
                                    oldLyrics = newLyrics
                                    Status.Set(sEmoji + " " + newLyrics + " " + eEmoji);
                                }

                            } else {
                                Status.Set(this.getData("noLyrics"))
                            }


                        } catch (error) {

                            //NO LYRICS AT THIS POINT IN THE SONG
                            if (!noLyricsYet) {
                                noLyricsYet = true
                                let lyricsComing = this.getData("noLyrics")
                                Status.Set(lyricsComing == "" ? Status.Set() : lyricsComing);
                            }
                        }
                    });
                })
            }

            getSettingsPanel() {

                let settings = document.createElement("div");
                settings.style.padding = "10px";

                let emojiZone = GUI.newHBox();
                emojiZone.style.marginLeft = "22%";
                emojiZone.style.marginTop = this.kSpacing;
                settings.appendChild(emojiZone);

                //EMOJI AT THE START OF THE STATUS
                let sEmojiBox = GUI.newInput();
                sEmojiBox.title = "The emoji before the lyrics"
                sEmojiBox.value = " ";
                sEmojiBox.value = this.getData("sEmoji");
                sEmojiBox.style.width = "11%";
                emojiZone.appendChild(sEmojiBox);

                let fakeLyrics = GUI.newLabel('Never gonna give you up...');
                fakeLyrics.style.fontSize = "15px";
                fakeLyrics.style.color = "white";
                fakeLyrics.style.fontStyle = "italic";
                fakeLyrics.style.marginLeft = "10px";
                fakeLyrics.style.marginTop = "11px";
                fakeLyrics.style.marginRight = "10px";
                emojiZone.appendChild(fakeLyrics)

                //EMOJI AT THE END OF THE STATUS
                let eEmojiBox = GUI.newInput();
                eEmojiBox.title = "The emoji after the lyrics"
                eEmojiBox.value = String(this.getData("eEmoji"));
                eEmojiBox.style.width = "11%";
                eEmojiBox.value = " ";
                eEmojiBox.value = this.getData("eEmoji");
                emojiZone.appendChild(eEmojiBox);

                settings.appendChild(GUI.newDivider());

                //DEFAULT TEXT WHEN NO MUSIC PALYING
                settings.appendChild(GUI.newLabel("No music status"));
                let noMusicBox = GUI.newInput();
                noMusicBox.value = String(this.getData("noMusic"));
                noMusicBox.style.marginBottom = this.kSpacing;
                noMusicBox.placeholder = "No music status!";
                settings.appendChild(noMusicBox);

                settings.appendChild(GUI.newDivider());

                //DEFAULT TEXT WHEN NO LYRICS AVAILABLE
                settings.appendChild(GUI.newLabel("No lyrics status"));
                let noLyricsBox = GUI.newInput();
                noLyricsBox.value = String(this.getData("noLyrics"));
                noLyricsBox.style.marginBottom = this.kSpacing;
                noLyricsBox.placeholder = "No lyrics status!";
                settings.appendChild(noLyricsBox);

                settings.appendChild(GUI.newDivider());


                //SAVE BUTTON + SAVE IN JSON FILE
                let saveButton = GUI.setSuggested(GUI.newButton("Save", true));
                saveButton.title = "Save the current state";
                saveButton.onclick = () => {
                    try {
                        sEmojiBox.value.length > 1 ? sEmojiBox.value = sEmojiBox.value.substring(0, 2) : sEmojiBox.value = sEmojiBox.value
                        eEmojiBox.value.length > 1 ? eEmojiBox.value = eEmojiBox.value.substring(0, 2) : eEmojiBox.value = eEmojiBox.value

                        this.setData("sEmoji", sEmojiBox.value)
                        this.setData("eEmoji", eEmojiBox.value)
                        this.setData("noMusic", noMusicBox.value)
                        this.setData("noLyrics", noLyricsBox.value)
                        BdApi.showToast("Settings were saved!", { type: "success" });
                        noLyricsYet = false
                    } catch (error) {
                        BdApi.showToast("Error while saving!", { type: "error" });
                    }
                    // Restart
                    this.stop();
                    this.load();
                    this.start();
                }

                let saveEmojiBox = GUI.newHBox()
                saveEmojiBox.appendChild(saveButton)

                let emojiLink = GUI.newHyperlink("Ctrl+click to open :", "Emoji list", "https://emojiterra.com/", "List of compatible emojis")
                emojiLink.style.marginLeft = "80%"

                saveEmojiBox.appendChild(emojiLink)
                settings.appendChild(saveEmojiBox)

                return settings
            }
        };

    })(window.BDFDB_Global.PluginUtils.buildPlugin(config));
})();