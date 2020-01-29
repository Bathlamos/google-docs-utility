const manageOverrideCss = (add) => {
    const clazz = "google-docs-utility-override"
    if (add && !document.body.classList.contains(clazz)) {
        document.body.classList.add(clazz)
    } else if (!add) {
        document.body.classList.remove(clazz)
    }
}

chrome.storage.onChanged.addListener(({ isActivated }) => manageOverrideCss(isActivated.newValue))

chrome.storage.sync.get(['isActivated'], ({ isActivated }) => manageOverrideCss(isActivated))