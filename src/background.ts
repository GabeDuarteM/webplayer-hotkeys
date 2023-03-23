import { Command, Player, PlayerTab } from './types'

const players: Player[] = [
  {
    controlQueries: {
      next: '[aria-label="Player controls"] button[aria-label="Next"]',
      play:
        '[aria-label="Player controls"] button[aria-label="Pause"],[aria-label="Player controls"] button[aria-label="Play"]',
      prev: '[aria-label="Player controls"] button[aria-label="Previous"]',
    },
    default: true,
    tabQuery: '*://*.spotify.com/*',
    title: 'spotify',
    url: 'https://open.spotify.com/',
  },
  {
    controlQueries: {
      next:
        '.control.control-next, .player-controls .svg-icon-group-item:nth-of-type(5) button',
      play:
        '.control.control-play, .player-controls .svg-icon-group-item:nth-of-type(3) button',
      prev:
        '.control.control-prev, .player-controls .svg-icon-group-item:nth-of-type(1) button',
    },
    default: false,
    tabQuery: '*://*.deezer.com/*',
    title: 'deezer',
    url: 'https://www.deezer.com/',
  },
  {
    controlQueries: {
      next: '.playControls__next',
      play: 'button[title="Pause current"],button[title="Play current"]',
      prev: '.playControls__prev',
    },
    default: false,
    tabQuery: '*://soundcloud.com/*',
    title: 'soundcloud',
    url: 'https://soundcloud.com/',
  },
  {
    controlQueries: {
      next: '.ytmusic-player-bar [aria-label="Next"]',
      play: '.play-pause-button.ytmusic-player-bar',
      prev: '.ytmusic-player-bar [aria-label="Previous"]',
    },
    default: false,
    tabQuery: '*://music.youtube.com/*',
    title: 'youtubemusic',
    url: 'https://music.youtube.com/',
  },
  {
    controlQueries: {
      next: '.ytp-next-button.ytp-button',
      play: '.ytp-play-button.ytp-button',
      prev: '.ytp-prev-button.ytp-button',
    },
    default: false,
    tabQuery: '*://www.youtube.com/watch?v=*',
    title: 'youtube',
    url: 'https://www.youtube.com/',
  },
]

const checkOpenedPlayers = (): Promise<PlayerTab[]> =>
  new Promise<PlayerTab[]>((resolve, reject) => {
    try {
      const openedPlayers: PlayerTab[] = []
      let checkedPlayers = 0
      players.forEach((player) => {
        chrome.tabs.query({ url: player.tabQuery }, (tabs) => {
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

const getSelector = (player: Player, command: Command): string => {
  switch (command) {
    case 'prev':
      return player.controlQueries.prev
    case 'play':
      return player.controlQueries.play
    case 'next':
      return player.controlQueries.next

    default:
      throw new Error('webplayer-hotkeys: command not found')
  }
}

const executeCommandPlayer = (
  openedPlayer: PlayerTab,
  command: Command,
): void => {
  const querySelector = getSelector(openedPlayer.player, command)
  const code = `document.querySelector('${querySelector}').click()`

  if (openedPlayer.tab.id) {
    chrome.tabs.executeScript(openedPlayer.tab.id, { code })
  }
}

const openDefaultPlayer = (): void => {
  const defaultPlayer = players.find((x) => x.default)

  if (defaultPlayer) {
    chrome.tabs.create({ url: defaultPlayer.url })
  }
}

const onCommand = async (command: Command): Promise<void> => {
  const openedPlayers = await checkOpenedPlayers()
  if (openedPlayers.length) {
    executeCommandPlayer(openedPlayers[0], command)
  } else {
    openDefaultPlayer()
  }
}

chrome.commands.onCommand.addListener(onCommand as any)

chrome.runtime.onInstalled.addListener(() => {
  chrome.tabs.create({ url: chrome.runtime.getURL('first-time/index.html') })
})
