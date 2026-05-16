(function () {
  var settings = null
  var initPending = false
  var obs = null

  function applySettings() {
    var g = document.getElementById('bili-chat-btn-group')
    if (g) g.style.top = settings.btnPos + '%'
    if (document.body.classList.contains('bili-chat-collapsed')) resizePlayer()
  }

  function collapse() {
    document.body.classList.add('bili-chat-collapsed')
    var aside = document.getElementById('aside-area-vm')
    if (aside) aside.style.setProperty('display', 'none', 'important')
    resizePlayer()
  }

  function expand() {
    document.body.classList.remove('bili-chat-collapsed')
    var aside = document.getElementById('aside-area-vm')
    if (aside) aside.style.removeProperty('display')
    var player = document.getElementById('player-ctnr')
    if (player) {
      player.style.width = ''
      player.style.margin = ''
    }
  }

  function resizePlayer() {
    if (!document.body.classList.contains('bili-chat-collapsed') || !settings) return
    var player = document.getElementById('player-ctnr')
    if (!player) return
    var w = settings.playerWidth
    if (w < 100) {
      player.style.width = w + '%'
      player.style.margin = '0 auto'
    } else {
      player.style.width = '100%'
      player.style.margin = ''
    }
  }

  function toggle() {
    try {
      if (document.body.classList.contains('bili-chat-collapsed')) {
        expand()
      } else {
        collapse()
      }
      updateButton()
    } catch (e) {}
  }

  function updateButton() {
    var btn = document.getElementById('bili-chat-collapse-btn')
    if (!btn) return
    var c = document.body.classList.contains('bili-chat-collapsed')
    btn.textContent = c ? '◀' : '▶'
    btn.title = c ? '展开评论区' : '折叠评论区'
  }

  function tryInit() {
    if (!settings) return false
    if (document.getElementById('bili-chat-btn-group')) return true
    var aside = document.getElementById('aside-area-vm')
    var player = document.getElementById('player-ctnr')
    if (!aside || !player) return false

    try {
      var group = document.createElement('div')
      group.id = 'bili-chat-btn-group'
      group.style.top = settings.btnPos + '%'

      var btn = document.createElement('button')
      btn.id = 'bili-chat-collapse-btn'
      var c = document.body.classList.contains('bili-chat-collapsed')
      btn.textContent = c ? '◀' : '▶'
      btn.title = c ? '展开评论区' : '折叠评论区'
      btn.addEventListener('click', toggle)

      group.appendChild(btn)
      if (window.getComputedStyle(player).position === 'static') {
        player.style.position = 'relative'
      }
      player.appendChild(group)

      if (c) collapse()
      return true
    } catch (e) {
      return false
    }
  }

  function startObserving() {
    initPending = false
    if (obs) {
      obs.disconnect()
    } else {
      obs = new MutationObserver(function () {
        if (!initPending) {
          initPending = true
          requestAnimationFrame(function () {
            initPending = false
            if (tryInit()) obs.disconnect()
          })
        }
      })
    }
    obs.observe(document.body, { childList: true, subtree: true })
  }

  chrome.storage.local.get(SETTINGS_KEY, function (result) {
    try {
      var s = result[SETTINGS_KEY]
      if (s && typeof s.btnPos === 'number' && typeof s.playerWidth === 'number') {
        settings = s
      } else {
        settings = DEFAULTS
      }
      applySettings()
      tryInit()
    } catch (e) {}
  })

  chrome.storage.onChanged.addListener(function (changes, area) {
    if (area !== 'local' || !changes[SETTINGS_KEY]) return
    var v = changes[SETTINGS_KEY].newValue
    if (v && typeof v.btnPos === 'number' && typeof v.playerWidth === 'number') {
      settings = v
      try {
        applySettings()
      } catch (e) {}
    }
  })

  startObserving()

  var lastUrl = location.href
  setInterval(function () {
    var url = location.href
    if (url !== lastUrl) {
      lastUrl = url
      startObserving()
      setTimeout(tryInit, 1500)
    }
  }, 1000)
})()
