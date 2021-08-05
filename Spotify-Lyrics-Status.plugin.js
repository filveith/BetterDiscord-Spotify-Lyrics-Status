/**
 * @name Spotify-Lyrics-Status
 * @author nous
 * @version 0.1.2
 * @description Change your status to the lyrics of the music you a listening to
 * @website https://github.com/filveith
 * @source https://github.com/filveith/BetterDiscord-Spotify-Lyrics-Status
 */

const { stopCoverage } = require("v8");
//const fetch = require('node-fetch');

module.exports = (_ => {
	const config = {
		"info": {
			"name": "Spotify-Lyrics-Status",
			"author": "nous",
			"version": "0.1.1",
			"description": "Change your status to the lyrics of the music your a listening to"
		},
		"changeLog": {
			"improved": {
				"Working": "And that's something",
				"New": "Remove status when music paused"
			}
		}
	};

	return !window.BDFDB_Global || (!window.BDFDB_Global.loaded && !window.BDFDB_Global.started) ? class {
		getName () {return config.info.name;}
		getAuthor () {return config.info.author;}
		getVersion () {return config.info.version;}
		getDescription () {return `The Library Plugin needed for ${config.info.name} is missing. Open the Plugin Settings to download it. \n\n${config.info.description}`;}

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
		
		var _this;
		var controls, stop;
		var starting, lastSong, showActivity, currentVolume, lastVolume, stopTime, previousIsClicked, previousDoubleTimeout, currentTime;
		var timelineTimeout, timelineDragging, updateInterval;
		var playbackState = {};

		stop = false;

		const repeatStates = [
			"off",
			"context",
			"track"
		];

		//#region Stuff from animated status

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

				//BdApi.showToast(t[0], {type: "success"});
				Status.request().send(JSON.stringify({ custom_status: data }));
				//Status.request().send(s);
				if (stop) {
					//BDFDB.NotificationUtils.toast("stop is true");
					unset();
					stop = false;
				}
			},

			unset: () => {
				//Status.request().send('{"custom_status":null}');
				let data = {};
				//data.text = 
				Status.request().send(JSON.stringify({ custom_status: data }));
			}
		};

		//#endregion

		//#region custom script
		const getLyrics =  {
			//Get the lyrics and change your status to the current lyrics
			lyrics: async () => {

				var songNameFormated = (lastSong.details).replace(/ /g, '%20')
				var artistNameFormated = (lastSong.state).replace(/ /g, '%20')
				currentTimeInSong = ((currentTime / 1000).toFixed())
				const url = ('https://api.textyl.co/api/lyrics?q=' + artistNameFormated + '%20' + songNameFormated)
				
				//var url = 'https://api.textyl.co/api/lyrics?q=Freeze%20corleone%20Desiigner'
				
				//var n

				var index


				//const asynchronousFunction=async(newSpotifiyUrl)=>{

					//PRINTS THE CURRENT POSITION IN THE SONG (Example : We are 125s into Designer From Freeze Corleone)
					//BDFDB.NotificationUtils.toast('We are ' + (currentTime / 1000).toFixed() +'s into ' + lastSong.details + ' from ' + lastSong.state);
					let l
					//check if the current song lyrics exist 
					try {

						//PRINTS THE LYRICS URL OF THE CURRENT SONG (even if the song doenst exist in the database)
						//BDFDB.NotificationUtils.toast("URL : "+url)

					  	l = (await (await fetch(url)).json());

						//BDFDB.NotificationUtils.toast("l lenght = "+l.length);
						//BDFDB.NotificationUtils.toast(typeof(l.length));
						//BDFDB.NotificationUtils.toast("json = "+l[2].lyrics);
						
						for (let checkSeconds = 0; checkSeconds < l.length; checkSeconds++) {
							//console.log('         index of loop: '+checkSeconds+'     time in json: '+n[checkSeconds].seconds+' == '+currentTimeInSong)
							if((l[checkSeconds].seconds) <= (currentTimeInSong)){
								//console.log('true')
								index = checkSeconds
							}
						}

						
						//console.log('Write to file new index: '+index)
						//writeToFile('IndexFor',index.toString())

						//PRINTS THE CURRENT POSTION IN THE JSON AND THE LYRICS
						//BDFDB.NotificationUtils.toast(index+'/'+l.length+' :  '+l[index].lyrics)
						
						//BDFDB.NotificationUtils.toast(l[index].lyrics);
	
						// //Changes the status to the current lyrics
						Status.set(l[index].lyrics);
						//Status.set(url);


					} catch (error) {
						try {
							if(typeof(l.length) == 'number'){
								//BDFDB.NotificationUtils.toast('the song exist in the data base   error')
								Status.unset()
							} else {
								//BDFDB.NotificationUtils.toast('the song doesnt exist in the data base   error = '+ error)
								//BDFDB.NotificationUtils.toast("Connais pas mon reuf deso...")
								Status.set("Connais pas mon reuf deso...");
							}
						} catch (error) {
							Status.set("Je connais pas les paroles mon reuf, deso");
						}
					}
			}
		}
		//#endregion

		const SpotifyControlsComponent = class SpotifyControls extends BdApi.React.Component {
		componentDidMount() {
			controls = this;
		}

		request(socket, device, type, data) {

			return new Promise(callback => {
				let method = "PUT";
				switch (type) {
					case "next":
					case "previous":
						method = "POST";
						break;
					case "get":
						type = "";
						method = "GET";
						break;
				};
				BDFDB.LibraryRequires.request({
					url: `https://api.spotify.com/v1/me/player${type ? "/" + type : ""}${Object.entries(Object.assign({}, data)).map(n => `?${n[0]}=${n[1]}`).join("")}`,
					method: method,
					headers: {
						authorization: `Bearer ${BDFDB.LibraryModules.SpotifyTrackUtils.getActiveSocketAndDevice().socket.accessToken}`
					}
				}, (error, response, result) => {
					if (response && response.statusCode == 401) {
						BDFDB.LibraryModules.SpotifyUtils.getAccessToken(socket.accountId).then(promiseResult => {
							let newSocketDevice = BDFDB.LibraryModules.SpotifyTrackUtils.getActiveSocketAndDevice();
							this.request(newSocketDevice.socket, newSocketDevice.device, type, data).then(_ => {
								try { callback(JSON.parse(result)); }
								catch (err) { callback({}); }
							});
						});
					}
					else {
						try { callback(JSON.parse(result)); }
						catch (err) { callback({}); }
					}
				});
			});
		}

		render() {
			let socketDevice = BDFDB.LibraryModules.SpotifyTrackUtils.getActiveSocketAndDevice();
			if (!socketDevice) return null;
			if (this.props.song) {
				playbackState.is_playing = true;
				let fetchState = !BDFDB.equals(this.props.song, lastSong);
				lastSong = this.props.song;
				stopTime = null;
				if (fetchState) this.request(socketDevice.socket, socketDevice.device, "get").then(response => {
					playbackState = Object.assign({}, response);
					BDFDB.ReactUtils.forceUpdate(this);
				});
			}
			else if (!stopTime && lastSong) {
				playbackState.is_playing = false;
				stopTime = new Date();
			}
			if (!lastSong) return null;

			showActivity = showActivity != undefined ? showActivity : (BDFDB.LibraryModules.ConnectionStore.getAccounts().find(n => n.type == "spotify") || {}).show_activity;
			currentVolume = this.props.draggingVolume ? currentVolume : socketDevice.device.volume_percent;

			return BDFDB.ReactUtils.createElement("div", {
				className: BDFDB.DOMUtils.formatClassName(BDFDB.disCN._spotifycontrolscontainer, this.props.maximized && BDFDB.disCN._spotifycontrolscontainermaximized, this.props.timeline && BDFDB.disCN._spotifycontrolscontainerwithtimeline),
				children: [
					this.props.timeline && BDFDB.ReactUtils.createElement(SpotifyControlsTimelineComponent, {
						song: lastSong,
						socket: socketDevice.socket,
						device: socketDevice.device,
						controls: this
					})
				].filter(n => n)
			});
		}
	};

	const SpotifyControlsTimelineComponent = class SpotifyControlsTimeline extends BdApi.React.Component {
		componentDidMount() {
			BDFDB.TimeUtils.clear(updateInterval);
			updateInterval = BDFDB.TimeUtils.interval(_ => {
				if (!this.updater || typeof this.updater.isMounted != "function" || !this.updater.isMounted(this)) BDFDB.TimeUtils.clear(updateInterval);
				else if (playbackState.is_playing) {
					let song = BDFDB.LibraryModules.SpotifyTrackUtils.getActivity(false);
					if (!song) BDFDB.ReactUtils.forceUpdate(controls);
					else if (playbackState.is_playing) BDFDB.ReactUtils.forceUpdate(this);
					getLyrics.lyrics();
				} else {
					Status.unset()
				}
			}, 1000);
		}
		render() {	//RENDER QUE LA PARTIE TEMPS
			let maxTime = this.props.song.timestamps.end - this.props.song.timestamps.start;
			currentTime = (!playbackState.is_playing && stopTime ? stopTime : new Date()) - this.props.song.timestamps.start;
			currentTime = currentTime > maxTime ? maxTime : currentTime;
			return BDFDB.ReactUtils.createElement("div", {
				className: BDFDB.disCN._spotifycontrolstimeline,
				children: [
				]
			});
		}
	};

	return class SpotifyControls extends Plugin {
		onLoad() {
			_this = this;

			this.defaults = {
				general: {
					addTimeline: { value: true, description: "Shows the Song Timeline in the Controls" },
					addActivityButton: { value: true, description: "Shows the Activity Status Toggle Button in the Controls" },
					doubleBack: { value: true, description: "Requires the User to press the Back Button twice to go to previous Track" }
				},
				buttons: {
					share: { value: { small: false, big: true }, icons: [""], description: "Share" },
					shuffle: { value: { small: false, big: true }, icons: [""], description: "Shuffle" },
					previous: { value: { small: true, big: true }, icons: [""], description: "Previous" },
					pauseplay: { value: { small: true, big: true }, icons: ["", ""], description: "Pause/Play" },
					next: { value: { small: true, big: true }, icons: [""], description: "Next" },
					repeat: { value: { small: false, big: true }, icons: ["", ""], description: "Repeat" },
					volume: { value: { small: false, big: true }, icons: ["", "", "", ""], description: "Volume" }
				}
			};

			this.patchedModules = {
				after: {
					AppView: "default"
				}
			};
		}

		onStart() {
			// REMOVE 24.04.2021
			let oldData = BDFDB.DataUtils.load(this);
			if (oldData.settings) {
				this.settings.general = oldData.settings;
				BDFDB.DataUtils.save(this.settings.general, this, "general");
				BDFDB.DataUtils.remove(this, "settings");
			}
			if (oldData.buttonConfigs) {
				this.settings.buttons = oldData.buttonConfigs;
				BDFDB.DataUtils.save(this.settings.buttons, this, "buttons");
				BDFDB.DataUtils.remove(this, "buttonConfigs");
			}

			BDFDB.PatchUtils.patch(this, BDFDB.LibraryModules.SpotifyTrackUtils, "getActivity", {
				after: e => {
					if (e.methodArguments[0] !== false) {
						if (e.returnValue && e.returnValue.name == "Spotify") this.updatePlayer(e.returnValue);
						else if (!e.returnValue) this.updatePlayer(null);
					}
				}
			});

			BDFDB.PatchUtils.patch(this, BDFDB.LibraryModules.SpotifyTrackUtils, "wasAutoPaused", {
				instead: e => {
					return false;
				}
			});

			BDFDB.PatchUtils.patch(this, BDFDB.LibraryModules.SpotifyUtils, "pause", {
				instead: e => {
					return false;
				}
			});

			this.forceUpdateAll();
		}

		onStop() {
			this.forceUpdateAll();
			//BDFDB.NotificationUtils.toast("onStop");
			Status.unset();
			stop = true;
		}

		forceUpdateAll() {
			BDFDB.PatchUtils.forceAllUpdates(this);
			BDFDB.DiscordUtils.rerenderAll();
			Status.unset();
		}

		processAppView(e) {
			let injected = this.injectPlayer(e.returnvalue);
			if (!injected) {
				let channels = BDFDB.ReactUtils.findChild(e.returnvalue, { name: "ChannelSidebar" });
				if (channels) {
					let type = channels.type;
					channels.type = (...args) => {
						let appliedType = type(...args);
						this.injectPlayer(appliedType);
						return appliedType;
					};
				}
			}
		}

		injectPlayer(parent) {
			let [children, index] = BDFDB.ReactUtils.findParent(parent, { props: [["section", BDFDB.DiscordConstants.AnalyticsSections.ACCOUNT_PANEL]] });
			if (index > -1) children.splice(index - 1, 0, BDFDB.ReactUtils.createElement(SpotifyControlsComponent, {
				song: BDFDB.LibraryModules.SpotifyTrackUtils.getActivity(false),
				maximized: BDFDB.DataUtils.load(this, "playerState", "maximized"),
				timeline: this.settings.general.addTimeline,
				activityToggle: this.settings.general.addActivityButton
			}, true));
			return index > -1;
		}

		updatePlayer(song) {
			if (controls) {
				controls.props.song = song;
				BDFDB.ReactUtils.forceUpdate(controls);
			}
		}
	};
})(window.BDFDB_Global.PluginUtils.buildPlugin(config));
}) ();