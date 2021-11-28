// Defaults
chrome.storage.sync.get(['isActivated'], ({ isActivated }) => {
  if (typeof isActivated !== 'boolean') chrome.storage.sync.set({ isActivated: true })
})

// Find all Google Docs tabs
const findTabs = () =>
  new Promise(resolve =>
    chrome.tabs.query(
      {
        status: 'complete',
        url: 'https://docs.google.com/document/*',
      },
      resolve
    )
  )

// Changes the height of a window by a delta
const resizeWindow = (windowId, delta) =>
  new Promise(resolve =>
    chrome.windows.get(windowId, win => {
      chrome.windows.update(windowId, { height: win.height + delta })
      resolve()
    })
  )

// The most reliable I've found to trigger a re-render of the canvas element
// is to change the size of the window. Dispatching events does nothing.
// As such, we change the height by a single pixel back-and-forth
let shouldExpand = false // Toggles whether to expand or contract the window
const triggerCanvasRerender = async () => {
  const tabs = await findTabs()
  const windowIds = tabs.reduce((acc, inc) => {
    acc[inc.windowId] = true
    return acc
  }, {})

  await Promise.all(Object.keys(windowIds).map(windowId => resizeWindow(+windowId, shouldExpand ? 1 : -1)))
  shouldExpand = !shouldExpand
}

// Insert into all existing tabs,
// e.g. for when the user installs an extension but doesn't reload the page
findTabs().then(tabs =>
  tabs.forEach(tab => {
    chrome.tabs.insertCSS(tab.id, { file: 'override.css' })
    chrome.tabs.executeScript(tab.id, { file: 'content.js', runAt: 'document_idle' })
    chrome.tabs.executeScript(tab.id, { file: 'preload.js', runAt: 'document_start' })
    triggerCanvasRerender()
  })
)

chrome.storage.onChanged.addListener(triggerCanvasRerender)
