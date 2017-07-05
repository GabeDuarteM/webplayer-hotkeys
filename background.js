let comando;
let playersVerificados;
let playersAbertos;

const players = { 
	SPOTIFY: { 
		titulo: "spotify", 
		url: "https://play.spotify.com/?http=1", 
		query: "https://*.spotify.com/*",
		useID: 1,
		frameTarget: "document.getElementById('app-player').contentWindow",
		commands: {
			PLAY: "play-pause",
			NEXT: "next",
			PREVIOUS: "previous"
		}
	}, 
	SOUNDCLOUD: { 
		titulo: "soundcloud", 
		url: "https://soundcloud.com/", 
		query: "https://soundcloud.com/*",
		useID: 0,
		frameTarget: null,
		commands: {
			PLAY: "playControl",
			NEXT: "skipControl__next",
			PREVIOUS: "skipControl__previous"
		}
	}, DEEZER: { 
		titulo: "deezer", 
		url: "http://www.deezer.com/", 
		query: "http://*.deezer.com/*",
		useID: 0,
		frameTarget: null,
		commands: {
			PLAY: "control control-play",
			NEXT: "control control-next",
			PREVIOUS: "control control-prev"
		}
	}
}

const playerDefault = players.SPOTIFY;

function onCommand(command) 
{
	playersVerificados = 0;
	playersAbertos = [];
	comando = command;
	
	VerificarPlayerSoundCloud();
	VerificarPlayerSpotify();
	VerificarPlayerDeezer();
}

function VerificarPlayerSoundCloud() {
	QueryPlayer(players.SOUNDCLOUD);
}

function VerificarPlayerSpotify() {
	QueryPlayer(players.SPOTIFY);
}

function VerificarPlayerDeezer() {
	QueryPlayer(players.DEEZER);
}

function QueryPlayer(player) {
	chrome.tabs.query({url: player.query}, (tabs) => {
		playersVerificados++;
		if (tabs.length > 0) {
			ConfirmarPlayerAberto(player, tabs);
		}
	
		if (playersVerificados === 3) {
			if (playersAbertos.length === 0) {
				AbrirNovoPlayer(playerDefault);
				return;
			}
			
			CallbackPlayersVerificados(tabs);
		}
	});
}

function ConfirmarPlayerAberto(player, tabs) {
	playersAbertos.push({ player: player, tabs: tabs });
}

function CallbackPlayersVerificados(tabs) {
	if (playersVerificados !== 3) {
		return;
	}
	
	let player = DefinirPlayer();
	
	var classeComando = DefinirComando(player.player);
	
	var metodo = player.player.useID === 1 ? `getElementById("${classeComando}")` : `getElementsByClassName("${classeComando}")[0]`;
	var code = player.player.frameTarget ? player.player.frameTarget + "." : "";
	code += `document.${metodo}.click()`;
		
	chrome.tabs.executeScript(player.tabs[0].id, { code: code });
}

function AbrirNovoPlayer(player) {
	chrome.tabs.create({ url: player.url });
	window.close();
}

function DefinirPlayer() {
	if (playersAbertos.find(x => x.player === players.SOUNDCLOUD)) {
		return { player: players.SOUNDCLOUD, tabs: playersAbertos.find(x => x.player === players.SOUNDCLOUD).tabs };
	} else if (playersAbertos.find(x => x.player === players.SPOTIFY)) {
		return { player: players.SPOTIFY, tabs: playersAbertos.find(x => x.player === players.SPOTIFY).tabs };
	} else if (playersAbertos.find(x => x.player === players.DEEZER)) {
		return { player: players.DEEZER, tabs: playersAbertos.find(x => x.player === players.DEEZER).tabs };
	}
}

function DefinirComando(player) {
	switch (comando) {
		case "play":
			return player.commands.PLAY;
		case "previous":
			return player.commands.PREVIOUS;
		case "next":
			return player.commands.NEXT;
	}
}

chrome.commands.onCommand.addListener(onCommand);
