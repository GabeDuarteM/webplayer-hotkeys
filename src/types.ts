export interface Player {
  title: string
  url: string
  tabQuery: string
  controlQueries: {
    play: string
    next: string
    prev: string
  }
  default: boolean
}

export interface PlayerTab {
  player: Player
  tab: chrome.tabs.Tab
}

export type Command = 'play' | 'next' | 'prev'
