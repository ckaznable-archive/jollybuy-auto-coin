chrome.alarms.create("task", {periodInMinutes: 60 * 24})
chrome.alarms.onAlarm.addListener(task)

;(async () => {
  const { lastCollect } = await (new Promise(resolve => chrome.storage.sync.get("lastCollect", resolve)))
  if(!lastCollect || Date.now() - lastCollect > 1000 * 60 * 60 * 24) {
    task()
  }
})()

function task() {
  chrome.storage.sync.set({lastCollect: Date.now()})

  tabTask("https://www.jollybuy.com/SignBook")
  tabTask("https://www.jollybuy.com/act/playground/", async (id) => {
    const clickJackpot = () => {
      const target = document.querySelector(".spinner-go")
      if(!target) {
        return
      }

      target.click()
    }

    // mv3
    if(chrome.scripting) {
      await chrome.scripting.executeScript({
        func: clickJackpot,
        world: "MAIN",
        target: {
          tabId: id
        }
      })
    }

    // mv2
    else {
      await chrome.tabs.executeScript(id, {
        code: `(${clickJackpot.toString()})()`
      })
    }

    await sleep(10000)
  })
}

function tabTask(url, cb=() => {}, ms=5000) {
  chrome.tabs.create({url}, async ({id}) => {
    const re = cb(id)

    if(re?.then) {
      await re
      chrome.tabs.remove(id)
    } else {
      setTimeout(chrome.tabs.remove.bind(null, id), ms)
    }
  })
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}