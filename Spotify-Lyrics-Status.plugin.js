/**
 * @name Spotify-Lyrics-Status
 * @author Robin & Fil & Tom
 * @version 0.1.6
 * @description Change your status to the lyrics of the music you a listening to on spotify
 * @website https://github.com/filveith/BetterDiscord-Spotify-Lyrics-Status
 * @source https://github.com/filveith/BetterDiscord-Spotify-Lyrics-Status/blob/master/Spotify-Lyrics-Status.plugin.js
 * @updateUrl https://raw.githubusercontent.com/filveith/BetterDiscord-Spotify-Lyrics-Status/master/Spotify-Lyrics-Status.plugin.js
 */

 const { getDefaultSettings } = require("http2");

 module.exports = (_ => {
     const config = {
         "info": {
             "name": "Spotify-Lyrics-Status",
             "author": "Robin & Fil & Tom",
             "version": "0.1.6",
             "description": "Change your discord status to the lyrics of the music your a listening to on Spotify"
         },
         "changeLog": {
             "improved": {
                 "Added": "You can choose the emojis and default status"
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
 
     const GUI = {
         newInput: (text = "") => {
             let input = document.createElement("input");
             input.className = "inputDefault-_djjkz input-cIJ7To";
             input.innerText = text;
             return input;
         },
 
         newLabel: (text) => {
             let label = document.createElement("h5");
             label.className = "h5-18_1nd";
             label.innerText = text;
             return label;
         },
 
         newDivider: (size = "15px") => {
             let divider = document.createElement("div");
             divider.style.minHeight = size;
             divider.style.minWidth = size;
             return divider;
         },
 
         newTextarea: () => {
             let textarea = document.createElement("textarea");
             textarea.className = "input-cIJ7To scrollbarGhostHairline-1mSOM1";
             textarea.style.resize = "vertical";
             textarea.rows = 4;
             return textarea;
         },
 
         newButton: (text, filled = true) => {
             let button = document.createElement("button");
             button.className = "button-38aScr colorBrand-3pXr91 sizeSmall-2cSMqn grow-q77ONN";
             if (filled) button.classList.add("lookFilled-1Gx00P");
             else button.classList.add("lookOutlined-3sRXeN");
             button.innerText = text;
             return button;
         },
 
         newHBox: () => {
             let hbox = document.createElement("div");
             hbox.style.display = "flex";
             hbox.style.flexDirection = "row";
             return hbox;
         },
 
         setExpand: (element, value) => {
             element.style.flexGrow = value;
             return element;
         },
 
         setSuggested: (element, value = true) => {
             if (value) element.classList.add("colorGreen-29iAKY");
             else element.classList.remove("mystyle");
             return element;
         },
 
         setDestructive: (element, value = true) => {
             if (value) element.classList.add("colorRed-1TFJan");
             else element.classList.remove("colorRed-1TFJan");
             return element;
         }
     };
 
     var currentLyrics, cleared = false, oldSong = " "
 
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
 
                 try {
                     if (typeof (this.getData("sEmoji")) == "undefined") {
                         BDFDB.NotificationUtils.toast("NO FILE")
                         this.setData("sEmoji", "🎵")
                         this.setData("eEmoji", "🎵")
                         this.setData("noMusic", "")
                         this.setData("noLyrics", "")
                     }
                 } catch (error) {
                     
                 }
 
                 updateInterval = BDFDB.TimeUtils.interval(_ => {
                     try {
                         let song = BDFDB.LibraryModules.SpotifyTrackUtils.getActivity(false);
                         if (song) {
                             cleared = false
                             this.getSpotifyToken();
                         } else if (!song && !cleared) {
                             var noMusicData = this.getData("noMusic")
                             Status.set( noMusicData == "" ? Status.unset() : noMusicData);
                             cleared = true;
                         }
                     } catch (error) { }
                 }, 1000);
             }
 
             onStop() { BDFDB.TimeUtils.clear(updateInterval); }
 
             setData(key, value) {
                 BdApi.setData(this.getName(), key, value);
             }
 
             getData(key) {
                 return BdApi.getData(this.getName(), key);
             }
 
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
 
                                 //GETs THE SAVED EMOJIS FROM THE JSON FILE
                                 var sEmoji = this.getData("sEmoji")
                                 var eEmoji = this.getData("eEmoji")
 
                                 Status.set(sEmoji + " " + currentLyrics[currentPositionLyrics].lyrics + " " + eEmoji); //TODO Parametre avec ou sans emoji quand afficher paroles
 
                                 //CHANGES oldSong TO THE SONG CURRENTLY PLAYING
                                 oldSong = requestResult.item.id;
 
                             } catch (error) {
                                 try {
                                     if (typeof (currentLyrics.length) == 'number') {
                                         Status.unset()
                                     } else {
                                         var noLyricsData = this.getData("noLyrics")
                                         Status.set( noLyricsData == "" ? Status.unset() : noLyricsData);
                                     }
                                 } catch (error) {
                                     var noLyricsData = this.getData("noLyrics")
                                     Status.set( noLyricsData == "" ? Status.unset() : noLyricsData);
                                 }
                             }
                         }
                         getLyrics();
                     });
                 })
             }
 
             getSettingsPanel(collapseStates = {}) {
 
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
                         sEmojiBox.value.length > 1 ? sEmojiBox.value = sEmojiBox.value.substring(0, 2) : sEmojiBox.value = sEmojiBox
                         eEmojiBox.value.length > 1 ? eEmojiBox.value = eEmojiBox.value.substring(0, 2) : eEmojiBox.value = eEmojiBox
 
                         this.setData("sEmoji", sEmojiBox.value)
                         this.setData("eEmoji", eEmojiBox.value)
                         this.setData("noMusic", noMusicBox.value)
                         this.setData("noLyrics", noLyricsBox.value)
                         BdApi.showToast("Settings were saved!", { type: "success" });
                     } catch (error) {
                         BdApi.showToast("Error while saving!", { type: "error" });
                     }
                 }
                 settings.appendChild(saveButton)
 
                 return settings
             }
         };
     })(window.BDFDB_Global.PluginUtils.buildPlugin(config));
 })();