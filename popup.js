var saveTimer = null

function saveSettings() {
  clearTimeout(saveTimer)
  saveTimer = setTimeout(function () {
    var s = {
      btnPos: parseInt(document.getElementById('btnPos').value, 10) || DEFAULTS.btnPos,
      playerWidth: parseInt(document.getElementById('playerWidth').value, 10) || DEFAULTS.playerWidth
    }
    var obj = {}
    obj[SETTINGS_KEY] = s
    chrome.storage.local.set(obj)
  }, 200)
}

chrome.storage.local.get(SETTINGS_KEY, function (result) {
  try {
    var s = result[SETTINGS_KEY]
    if (!s || typeof s.btnPos !== 'number' || typeof s.playerWidth !== 'number') {
      s = DEFAULTS
    }
    document.getElementById('btnPos').value = s.btnPos
    document.getElementById('btnPosVal').textContent = s.btnPos + '%'
    document.getElementById('playerWidth').value = s.playerWidth
    document.getElementById('playerWidthVal').textContent = s.playerWidth + '%'
  } catch (e) {}
})

document.getElementById('btnPos').addEventListener('input', function () {
  var v = parseInt(this.value, 10) || DEFAULTS.btnPos
  document.getElementById('btnPosVal').textContent = v + '%'
  saveSettings()
})

document.getElementById('playerWidth').addEventListener('input', function () {
  var v = parseInt(this.value, 10) || DEFAULTS.playerWidth
  document.getElementById('playerWidthVal').textContent = v + '%'
  saveSettings()
})
