/* Web socket */
const monitorWsUrl = 'ws://' + location.host + '/ws/monitor';
const monitorWs = new WebSocket(monitorWsUrl);
const monitorIntervalSec = 2.5;

let beforeTime = 0;
setInterval(function () {
    beforeTime = performance.now();
    monitorWs.send('ping: ' + String(performance.now() - beforeTime));
}, monitorIntervalSec * 1000);

monitorWs.onmessage = function (ev) {
    const ping = performance.now() - beforeTime;
    console.log(ev.data);
    document.getElementById('wi-fi').innerHTML = 'Signal Level: ' + String(JSON.parse(ev.data)['signal-level']);
    document.getElementById('ping').innerHTML = 'Ping: ' + String(Math.floor(ping));
};

