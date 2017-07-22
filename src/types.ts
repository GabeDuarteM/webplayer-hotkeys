export interface IPlayer {
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

export interface IPlayerTab {
  player: IPlayer
  tab: chrome.tabs.Tab
}

export type ICommand = "play" | "next" | "prev"
