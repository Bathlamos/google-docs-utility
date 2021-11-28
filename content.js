// HTML-based Google Docs:
//   Prior to May 2021, Google Docs' Kix Editor uses HTML elements to achieve styling.
//   Tables are thus HTML tables and we style invisible tables via CSS

const manageOverrideCss = add => {
  const clazz = 'google-docs-utility-override' // duplicated in preload.js
  if (add && !document.body.classList.contains(clazz)) {
    document.body.classList.add(clazz)
  } else if (!add) {
    document.body.classList.remove(clazz)
  }
}

chrome.storage.onChanged.addListener(({ isActivated }) => manageOverrideCss(isActivated.newValue))

chrome.storage.sync.get(['isActivated'], ({ isActivated }) => manageOverrideCss(isActivated))
