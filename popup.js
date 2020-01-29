const switchElem = document.getElementById("switch")

const setLabelText = (isActivated) => {
    const label = document.getElementById("label")
    if (isActivated) {
        label.innerText = "Gridlines enabled"
    } else {
        label.innerText = "Gridlines disabled"
    }
}

const changeBrowserIcon = (isActivated) => {
    const path = `icon/icon-${isActivated? '': 'de'}activated-`
    chrome.browserAction.setIcon({
        path: Object.assign({}, ...[16, 24, 32].map(e => ({[e]: path + e + '.png'})))
    });
}

chrome.storage.sync.get(['isActivated'], ({ isActivated }) => {
    const showActivated = typeof isActivated !== "boolean" || isActivated
    switchElem.checked = showActivated
    setLabelText(showActivated)
    changeBrowserIcon(showActivated)
})

switchElem.addEventListener('change', (e) => {
    const { checked } = e.target;
    setLabelText(checked)
    changeBrowserIcon(checked)
    chrome.storage.sync.set({ isActivated: checked })
});

[...document.getElementsByClassName("hidden")].forEach(element => {
    element.classList.remove("hidden")
    setTimeout(() => element.classList.add("animated"), 100)
})