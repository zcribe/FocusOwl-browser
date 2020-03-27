let timer;
let timerStarted = false;
let timerWorkMinutes = 25;
let timerRestMinutes = 5;
let timerValue = 0;
let timerMode = "work";
let minutes = 0;
let seconds = 0;
let portFromCS;


function setTimeStrings(minutesString, secondsString) {
    if (minutesString === "00") {
        browser.browserAction.setBadgeText({text: ``})
    } else {
        browser.browserAction.setBadgeText({text: `${minutesString}`})
    }

    if (secondsString < 10) {
        secondsString = `0${secondsString}`
    }
    sendToFrontend({greeting: "time", minutes: minutesString, seconds: secondsString});
}

function timerStart() {
    if (!timerStarted) {
        timer = setInterval(timerUpdate, 1000);
        setTimeStrings(timerGetModeValue(), 0)
        timerStarted = true
        sendToFrontend({greeting: "start"});
    }
}

function timerUpdate() {
    timerValue++
    if (timerValue >= timerGetModeValue() * 60) {
        timerCycle()
    }
    timerUnitsSplit()
    setTimeStrings(minutes, seconds)
    setMessage()
}

function timerStop() {
    timerStarted = false;
    timerValue = 0;
    setTimeStrings("00", 0)
    clearInterval(timer);
}

function timerCycle() {
    playAudio()
    timerSwapMode()
    timerStarted = false
    timerValue = 0
    setTimeStrings("00", 0)
    sendToFrontend({greeting: "cycle"});
    clearInterval(timer)
}

function timerUnitsSplit() {
    minutes = Math.floor((timerGetModeValue() * 60 - timerValue) / 60)
    seconds = 60 - (timerValue - Math.floor(timerValue / 60) * 60)
}

function timerGetModeValue() {
    if (timerMode === "work") {
        return timerWorkMinutes
    } else if (timerMode === "rest") {
        return timerRestMinutes
    }
}

function timerSwapMode() {
    if (timerMode === "work") {
        timerMode = "rest"
    } else {
        timerMode = "work"
    }

}

function setMessage() {
    if (timerStarted) {
        sendToFrontend({greeting: "message", textContent: "Stop looking at me and focus."});
    } else {
        sendToFrontend({greeting: "message", textContent: "Ready to focus?"});
    }
}

function lengthChange(timer, action) {
    if (timerStarted) return null
    if (timer === "work") {
        if (action === "add") {
            timerWorkMinutes++
        } else if (action === "sub") {
            timerWorkMinutes = timerWorkMinutes - 1
        }
        sendToFrontend({greeting: "lengthChangeDone", timer: "work", length: timerWorkMinutes});
    } else if (timer === "rest") {
        if (action === "add") {
            timerRestMinutes++
        } else if (action === "sub") {
            timerRestMinutes = timerRestMinutes - 1
        }
        sendToFrontend({greeting: "lengthChangeDone", timer: "rest", length: timerRestMinutes});
    }

}

function playAudio() {
    let end = new Audio("/sound/end.ogg")
    let b = end.play()
}


function connected(p) {
    portFromCS = p;
    portFromCS.onMessage.addListener(function (m) {
        if (m.greeting === "start") {
            timerStart()
        } else if (m.greeting === "stop") {
            timerStop()
        } else if (m.greeting === "lengthChange") {
            lengthChange(m.timer, m.action)
        }
    });
}

function sendToFrontend(message) {
    try {
        portFromCS.postMessage(message)
    } catch (e) {

    }

}

browser.runtime.onConnect.addListener(connected);
