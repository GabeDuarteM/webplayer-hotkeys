import { Command, Player, PlayerTab } from './types'

const players: Player[] = [
  {
    controlQueries: {
      next: '.spoticon-skip-forward-16',
      play: '.player-controls__buttons button:nth-child(3)',
      prev: '.spoticon-skip-back-16',
    },
    default: true,
    tabQuery: '*://*.spotify.com/*',
    title: 'spotify',
    url: 'https://open.spotify.com/',
  },
  {
    controlQueries: {
      next: '.control.control-next',
      play: '.control.control-play',
      prev: '.control.control-prev',
    },
    default: false,
    tabQuery: '*://*.deezer.com/*',
    title: 'deezer',
    url: 'https://www.deezer.com/',
  },
  {
    controlQueries: {
      next: '.skipControl__next',
      play: '.playControl',
      prev: '.skipControl__previous',
    },
    default: false,
    tabQuery: '*://soundcloud.com/*',
    title: 'soundcloud',
    url: 'https://soundcloud.com/',
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

const getSelector = (player: Player, command: Command) => {
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

const openDefaultPlayer = () => {
  const defaultPlayer = players.find(x => x.default)

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
