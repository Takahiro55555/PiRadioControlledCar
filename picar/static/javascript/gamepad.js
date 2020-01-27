/*
 * 参考: https://github.com/luser/gamepadtest
 */
const downedKeys = { "w": 0, "s": 0, "a": 0, "d": 0, "W": 0, "S": 0, "A": 0, "D": 0 };
const picarWsURL = 'ws://' + location.host + '/ws/controller';
const picarWs = new WebSocket(picarWsURL);
const sendData = { "operation": { "motor": { "x": 0, "y": 0 }, "brake": 0 } };
let beforeSendDataString = JSON.stringify(sendData);
let isNotCurrentController = true;

let haveEvents = 'GamepadEvent' in window;
let haveWebkitEvents = 'WebKitGamepadEvent' in window;
let controllers = {};
let rAF = window.mozRequestAnimationFrame ||
    window.requestAnimationFrame;

/*** Websocket ***/
picarWs.onmessage = function (ev) {
    console.log(ev.data);
    const rcvData = JSON.parse(ev.data);
    if (isNotCurrentController) {
        if (rcvData['is-current-controller'] == 1) {
            isNotCurrentController = false;
            document.getElementById('is-enabled').innerText = 'Status: Active';
            alert("コントローラが有効になりました");
        }
    }
};

window.addEventListener('beforeunload', function () {
    console.log("Close connection");
    picarWs.close();
});

function send(ws, data) {
    const sendDataString = JSON.stringify(data);
    if (isNotCurrentController) return;
    if (sendDataString == beforeSendDataString) return;
    console.log(sendDataString);
    if (data['operation']) {
        if (data['operation']['motor']) {
            document.getElementById('axis-y').innerHTML = 'Power: ' + String(Math.floor(Number(data['operation']['motor']['y']) * 100)) + '%';
            document.getElementById('axis-x').innerHTML = 'Turn: ' + String(Math.floor(Number(data['operation']['motor']['x']) * 100)) + '%';
        }
    }
    beforeSendDataString = sendDataString;
    ws.send(beforeSendDataString);
}


/*** Gamepad ***/
function connecthandler(e) {
    addgamepad(e.gamepad);
}
function addgamepad(gamepad) {
    controllers[gamepad.index] = gamepad;
    console.log("New gamepad index: " + gamepad.index);
    rAF(updateStatus);
}

function disconnecthandler(e) {
    console.log("Disconnecting gamepad index: " + e.gamepad.index);
    removegamepad(e.gamepad);
}

function removegamepad(gamepad) {
    const i = gamepad.index;
    delete controllers[gamepad.index];
    console.log("Disconnected gamepad index: " + i + "!!!");
}

function updateStatus() {
    scangamepads();
    for (j in controllers) {
        const controller = controllers[j];
        // 左スティック
        // 0: 左右方向
        // 1: 前後方向
        // 右スティック
        // 2: 左右方向
        // 3: 前後方向
        //console.log(i + ": " + controller.axes[0].toFixed(4));
        //console.log("value", controller.axes[0] + 1);
        const axisX = controller.axes[2].toFixed(4);
        const axisY = controller.axes[3].toFixed(4) * -1; // 反転させ無いと前後逆になる
        sendData["operation"]["motor"] = { "x": Math.floor(axisX * 10) / 10, "y": Math.floor(axisY * 10) / 10 };
        send(picarWs, sendData);
    }
    rAF(updateStatus);
}

function scangamepads() {
    let gamepads = navigator.getGamepads ? navigator.getGamepads() : (navigator.webkitGetGamepads ? navigator.webkitGetGamepads() : []);
    for (let i = 0; i < gamepads.length; i++) {
        if (gamepads[i]) {
            if (!(gamepads[i].index in controllers)) {
                addgamepad(gamepads[i]);
            } else {
                controllers[gamepads[i].index] = gamepads[i];
            }
        }
    }
}

if (haveEvents) {
    window.addEventListener("gamepadconnected", connecthandler);
    window.addEventListener("gamepaddisconnected", disconnecthandler);
} else if (haveWebkitEvents) {
    window.addEventListener("webkitgamepadconnected", connecthandler);
    window.addEventListener("webkitgamepaddisconnected", disconnecthandler);
} else {
    setInterval(scangamepads, 500);
}



