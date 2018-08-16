module.exports = {
  verifyConditions: ["semantic-release-chrome", "@semantic-release/github"],
  prepare: [
    {
      path: "semantic-release-chrome",
      asset: "webplayer-hotkeys.zip",
    },
  ],
  publish: [
    {
      path: "semantic-release-chrome",
      asset: "webplayer-hotkeys.zip",
      extensionId: "ikmkicnmahfdilneilgibeppbnolgkaf",
    },
    {
      path: "@semantic-release/github",
      assets: [
        {
          path: "webplayer-hotkeys.zip",
        },
      ],
    },
  ],
  analyzeCommits: {
    releaseRules: [
      {
        scope: "manifest",
        release: "patch",
      },
    ],
  },
}
