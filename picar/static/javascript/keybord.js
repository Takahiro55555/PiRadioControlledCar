const downedKeys = { "w": 0, "s": 0, "a": 0, "d": 0, "W": 0, "S": 0, "A": 0, "D": 0 };
const picarWsURL = 'ws://' + location.host + '/ws/controller';
const picarWs = new WebSocket(picarWsURL);
const sendData = { "operation": { "motor": { "x": 0, "y": 0 }, "brake": 0 } };
let beforeSendData = JSON.stringify(sendData);

document.addEventListener('keydown', (event) => {
    const keyName = event.key;
    const logElement = document.getElementById("key-input");
    if (keyName in downedKeys) {
        downedKeys[keyName] = 1;
    }
    if (event.key === " ") {
        sendData["operation"]["brake"] = 1;
    }
    sendData["operation"]["motor"] = calcAxis(downedKeys);
    if (JSON.stringify(sendData) != beforeSendData) {
        beforeSendData = JSON.stringify(sendData)
        send(picarWs, sendData);
    }
});

document.addEventListener('keyup', (event) => {
    const logElement = document.getElementById("key-input");
    for (const key in downedKeys) {
        downedKeys[key] = 0;
    }
    if (event.key === " ") {
        sendData["operation"]["brake"] = 0;
    }
    sendData["operation"]["motor"] = calcAxis(downedKeys);
    if (JSON.stringify(sendData) != beforeSendData) {
        beforeSendData = JSON.stringify(sendData)
        send(picarWs, sendData);
    }
});

function send(ws, data) {
    console.log(JSON.stringify(data));
    if (data['operation']) {
        if (data['operation']['motor']) {
            document.getElementById('axis-y').innerHTML = 'Power: ' + String(Math.floor(Number(data['operation']['motor']['y']) * 100)) + '%';
            document.getElementById('axis-x').innerHTML = 'Turn: ' + String(Math.floor(Number(data['operation']['motor']['x']) * 100)) + '%';
        }
    }
    ws.send(JSON.stringify(data));
}

function calcAxis(downedKeys) {
    let axisX = 0;
    let axisY = 0;
    for (key in downedKeys) {
        if (downedKeys[key] == 0) continue;
        switch (key) {
            case 'w':
                axisY = 0.6;
                break;
            case 'a':
                axisX = -0.6;
                break;
            case 's':
                axisY = -0.6;
                break;
            case 'd':
                axisX = 0.6;
                break;
            case 'W':
                axisY = 1.0;
                break;
            case 'A':
                axisX = -1.0;
                break;
            case 'S':
                axisY = -1.0;
                break;
            case 'D':
                axisX = 1.0;
                break;
            default:
                break;
        }
    }
    return { "x": axisX, "y": axisY };
}