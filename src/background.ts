import { ICommand, IPlayer, IPlayerTab } from "./types"

const players: IPlayer[] = [
  {
    controlQueries: {
      next: ".spoticon-skip-forward-16",
      play: ".player-controls__buttons button:nth-child(3)",
      prev: ".spoticon-skip-back-16",
    },
    default: true,
    tabQuery: "*://*.spotify.com/*",
    title: "spotify",
    url: "https://play.spotify.com/",
  },
  {
    controlQueries: {
      next: ".control.control-next",
      play: ".control.control-play",
      prev: ".control.control-prev",
    },
    default: false,
    tabQuery: "*://*.deezer.com/*",
    title: "deezer",
    url: "https://www.deezer.com/",
  },
  {
    controlQueries: {
      next: ".skipControl__next",
      play: ".playControl",
      prev: ".skipControl__previous",
    },
    default: false,
    tabQuery: "*://soundcloud.com/*",
    title: "soundcloud",
    url: "https://soundcloud.com/",
  },
  {
    controlQueries: {
      next: ".ytp-next-button.ytp-button",
      play: ".ytp-play-button.ytp-button",
      prev: ".ytp-prev-button.ytp-button",
    },
    default: false,
    tabQuery: "*://www.youtube.com/watch?v=*",
    title: "youtube",
    url: "https://www.youtube.com/",
  },
]

chrome.commands.onCommand.addListener(onCommand)

function onCommand(command: ICommand): void {
  CheckOpenedPlayers().then(openedPlayers => {
    if (openedPlayers.length) {
      ExecuteCommandPlayer(openedPlayers[0], command)
    } else {
      OpenDefaultPlayer()
    }
  })
}

function CheckOpenedPlayers(): Promise<IPlayerTab[]> {
  return new Promise<IPlayerTab[]>((resolve, reject) => {
    try {
      const openedPlayers: IPlayerTab[] = []
      let checkedPlayers = 0
      players.forEach(player => {
        chrome.tabs.query({ url: player.tabQuery }, tabs => {
          checkedPlayers++
          if (tabs.length && tabs[0].id) {
            openedPlayers.push({ player, tab: tabs[0] })
          }

          if (checkedPlayers === players.length) {
            resolve(openedPlayers)
          }
        })
      })
    } catch (err) {
      reject(err)
    }
  })
}

function ExecuteCommandPlayer(openedPlayer: IPlayerTab, command: ICommand): void {
  const querySelector = GetSelector(openedPlayer.player, command)
  const code = `document.querySelector('${querySelector}').click()`

  if (openedPlayer.tab.id) {
    chrome.tabs.executeScript(openedPlayer.tab.id, { code })
  }
}

function GetSelector(player: IPlayer, command: ICommand) {
  switch (command) {
    case "prev":
      return player.controlQueries.prev
    case "play":
      return player.controlQueries.play
    case "next":
      return player.controlQueries.next

    default:
      throw new Error("webplayer-hotkeys: command not found")
  }
}

function OpenDefaultPlayer() {
  const defaultPlayer = players.find(x => x.default)

  if (defaultPlayer) {
    chrome.tabs.create({ url: defaultPlayer.url })
  }
}

chrome.runtime.onInstalled.addListener(details => {
  chrome.tabs.create({ url: chrome.runtime.getURL("first-time/index.html") })
})
