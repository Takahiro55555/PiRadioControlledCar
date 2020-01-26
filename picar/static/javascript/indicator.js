class Indicator {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = this.canvas.getContext('2d');
        /* canvasの初期化 */
        this.initCanvas()
    }

    /* 画面読み込み時や、videoエレメントのサイズ変更時に呼び出すべき処理 */
    initCanvas() {
        // canvasのスタイルのサイズを取得
        const canvas_width = this.canvas.clientWidth;
        const canvas_height = this.canvas.clientHeight;

        // canvasコンテキスト(?)のサイズとスタイルのサイズを統一
        // こうしないと、図形描画時の縦横比がおかしくなる
        this.canvas.width = canvas_width;
        this.canvas.height = canvas_height;
        this.wifiSignalLevel = 0;
        this.wifiSignalValue = -100;
        this.ping = 100000;
        this.isBrake = false;
        this.axisX = 0;
        this.axisY = 0;
        console.log('Initialized canvas size');
    }

    clearCanvas() {
        const canvas_width = this.canvas.clientWidth;
        const canvas_height = this.canvas.clientHeight;

        this.ctx.clearRect(0, 0, canvas_width, canvas_height);
        this.ctx.stroke();
    }

    draw() {
        //HACK: 要リファクタリング
        let offsetX = 10;
        let offsetY = 100;
        const scale = 1.0;
        const fontSize = Math.floor(24 * scale);
        let msg = "Wi-Fi: " + String(this.wifiSignalLevel) + '/4';

        //this.ctx.beginPath();
        /* テキストのサイズを取得 */
        this.ctx.font = String(fontSize) + "px serif";
        let text = this.ctx.measureText(msg);
        //this.drawTextBackground(offsetX, offsetY, text.width, text.height);
        this.ctx.fillStyle = "black";
        this.ctx.fillText(msg, offsetX, offsetY);

        offsetY += text.height + 10;
        msg = "Ping: " + String(this.ping);
        console.log(msg);
        text = this.ctx.measureText(msg);
        //this.drawTextBackground(offsetX, offsetY, text.width, text.height);
        this.ctx.fillStyle = "black";
        this.ctx.fillText(msg, offsetX, offsetY);

        offsetY += text.height + 10;
        msg = "Axis Y: " + String(this.axisY);
        text = this.ctx.measureText(msg);
        //this.drawTextBackground(offsetX, offsetY, text.width, text.height);
        this.ctx.fillStyle = "black";
        this.ctx.fillText(msg, offsetX, offsetY);

        offsetY += text.height + 10;
        msg = "Axis X: " + String(this.axisX);
        text = this.ctx.measureText(msg);
        //this.drawTextBackground(offsetX, offsetY, text.width, text.height);
        this.ctx.fillStyle = "black";
        this.ctx.fillText(msg, offsetX, offsetY);

        this.ctx.fill();
    }

    drawTextBackground(x, y, w, h) {
        this.ctx.fillStyle = "rgb(255,255,255)";
        this.ctx.fillRect(x, y, w, h);
    }

    /* インジケータのを最新の状状態に更新する*/
    applyIndicator() {
        this.clearCanvas();
        this.draw();
    }

    setWifiSignalLevel(level) {
        this.wifiSignalLevel = level;
    }

    setWifiSignalValue(val) {
        this.wifiSignalValue = val;
    }

    setPing(ping) {
        this.ping = ping;
    }

    setIsBrake(flag) {
        this.isBrake = flag;
    }

    setAxisX(x) {
        this.axisX = x;
    }

    setAxisY(y) {
        this.axisY = y;
    }

    setAxis(x, y) {
        this.setAxisX(x);
        this.setAxisY(y);
    }
}