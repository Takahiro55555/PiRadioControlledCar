/* Canvas */
const indicatorCanvas = document.getElementById('indicator');
const indicator = new Indicator(indicatorCanvas);

/* Web socket */
const monitorWsUrl = 'ws://' + location.host + '/ws/monitor';
const monitorWs = new WebSocket(monitorWsUrl);
const monitorIntervalSec = 2.5;

let beforeTime = 0;
setInterval(function () {
    beforeTime = performance.now();
    monitorWs.send('ping: ' + String(beforeTime));
}, monitorIntervalSec * 1000);

monitorWs.onmessage = function (ev) {
    const ping = performance.now() - beforeTime;
    document.getElementById("ping").innerHTML = 'ping: ' + String(Math.floor(ping));
    document.getElementById("signal-level").innerHTML = 'signal level: ' + String(JSON.parse(ev.data)['signal-level']);
    console.log(ev.data);
    indicator.setPing(Math.floor(ping));
    indicator.setWifiSignalLevel(JSON.parse(ev.data)['signal-level']);
    indicator.applyIndicator();
};

/* videoエレメントのサイズサイズ変更時に呼び出されるイベントハンドラ */
document.getElementById('remote_video').addEventListener('resize', function () {
    indicator.initCanvas();
}, false);

window.onload = function () {
    indicator.initCanvas();
}





