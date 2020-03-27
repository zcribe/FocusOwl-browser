var myPort = browser.runtime.connect({name: "port-from-cs"});
let timerStarted = false

function toggleControls() {
    let controllers = document.getElementsByClassName("button--ghost")
    for (var i = 0; i < controllers.length; i++) {
        controllers[i].classList.toggle("disabled")
    }
}

function toggleStartPause() {
    let button = document.getElementById("start")
    if (timerStarted) {
        button.textContent = "Pause"
        button.classList.toggle("button--primary")
        button.classList.toggle("button--secondary")
    } else {
        button.textContent = "Start"
        button.classList.toggle("button--primary")
        button.classList.toggle("button--secondary")
    }
}

function sendToBackend(message) {
    try {
        myPort.postMessage(message)
    } catch (e) {

    }

}

document.addEventListener("click", function (event) {

    if (event.target.classList.contains("start") && !event.target.classList.contains("disabled")) {
        sendToBackend({greeting: "start"});
    } else if (event.target.classList.contains("stop") && !event.target.classList.contains("disabled")) {
        sendToBackend({greeting: "stop"});
    } else if (event.target.classList.contains("pause") && !event.target.classList.contains("disabled")) {
        sendToBackend({greeting: "pause"});
    } else if (event.target.classList.contains("workAdd") && !event.target.classList.contains("disabled")) {
        sendToBackend({greeting: "lengthChange", timer: "work", action: "add"});
    } else if (event.target.classList.contains("workSubtract") && !event.target.classList.contains("disabled")) {
        sendToBackend({greeting: "lengthChange", timer: "work", action: "sub"});
    } else if (event.target.classList.contains("restAdd") && !event.target.classList.contains("disabled")) {
        sendToBackend({greeting: "lengthChange", timer: "rest", action: "add"});
    } else if (event.target.classList.contains("restSubtract") && !event.target.classList.contains("disabled")) {
        sendToBackend({greeting: "lengthChange", timer: "rest", action: "sub"});
    }
}, false);


myPort.onMessage.addListener(function (m) {
        if (m.greeting === "time") {
            document.querySelector("#time").textContent = `${m.minutes}:${m.seconds}`
        } else if (m.greeting === "end") {
            browser.browserAction.setBadgeText({text: ``})
            toggleControls()
        } else if (m.greeting === "cycle") {
            browser.browserAction.setBadgeText({text: ``})
            sendToBackend({greeting: "start"});
        } else if (m.greeting === "start") {
            timerStarted = true
            toggleControls()
            // toggleStartPause()

        } else if (m.greeting === "message") {
            document.getElementById("message").textContent = m.textContent
        } else if (m.greeting === "lengthChangeDone") {
            if (m.timer === "work") {
                document.getElementById("workTime").textContent = `${m.length}`
            } else if (m.timer === "rest") {
                document.getElementById("restTime").textContent = `${m.length}`
            }
        }

        // console.log(m.greeting);
    }, false );






