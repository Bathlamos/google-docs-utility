// Defaults
chrome.storage.sync.get(['isActivated'], ({ isActivated }) => {
    if (typeof isActivated !== "boolean")
        chrome.storage.sync.set({ isActivated: true })
})

// Insert into all existing tabs, 
// e.g. for when the user installs an extension but doesn't reload the page
chrome.tabs.query({
    status: 'complete',
    url: 'https://docs.google.com/document/*'
}, (tabs) =>
    tabs.forEach((tab) => {
        chrome.tabs.insertCSS(tab.id, { file: "override.css" })
        chrome.tabs.executeScript(tab.id, { file: 'content.js', runAt: 'document_idle' })
    }))