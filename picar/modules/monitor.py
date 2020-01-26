from subprocess import check_output
import re
import time

class Monitor:
    def __init__(self, minimum_update_interlval_s=5):
        """
        Parameters
        ----------
        minimum_update_interlval_s : int
            最小更新間隔
            これよりも短い間隔でself.update_wlan0_status()を実行しても更新されない
        """
        self.__re_signal_level = re.compile(r"Signal level=\D?\d+")
        self.__wlan0_status = ""
        self.__wlan0_level_dBm = -90
        self.__before_update = 0
        self.__minimum_update_interval_s = minimum_update_interlval_s

    def __get_wlan0_status(self):
        """
        シェルコマンドを実行してwlan0の状態を取得する

        Returning
        ---------
        None
        """
        self.__wlan0_status = check_output(['iwconfig', 'wlan0']).decode()
    
    def __extract_wlan0_signal_level(self):
        """
        self.__get_wlan0_status() の事項結果からWi-Fiの受信強度を抽出する

        Returning
        ---------
        None
        """
        self.__wlan0_level_dBm = int(re.search(self.__re_signal_level, self.__wlan0_status).group(0).split('=')[1])
    
    def update_wlan0_status(self):
        """
        シェルコマンドを実行してwlan0の状態を取得する
        コンストラクタで設定した最小更新間隔を経過していない場合は、更新されない

        Returning
        ---------
        result : bool
            更新時 : True
            更新見送り時 : False
        """
        if time.time() - self.__before_update < self.__minimum_update_interval_s: return False
        self.__get_wlan0_status()
        self.__before_update = time.time()
        return True

    def get_wlan0_level(self):
        """
        0~4の5段階評価のWi-Fi強度と、実際の信号強度[dBm]を返す

        Returning
        ---------
        level : tuple
            level[0] : int
                5段階評価のWi-Fi強度
            level[1] : int
                実際の信号強度[dBm]

        Notes
        -----
        Wi-Fi強度参考 : Wi-Fiの知識 － WiFiの信号強度を理解する
            URL: https://www.ibsjapan.co.jp/tech/details/metageek-solution/wifi-signal-strength-basics.html
        """
        self.__extract_wlan0_signal_level()
        if self.__wlan0_level_dBm >= -30: return (4, self.__wlan0_level_dBm)
        if self.__wlan0_level_dBm >= -67: return (3, self.__wlan0_level_dBm)
        if self.__wlan0_level_dBm >= -70: return (2, self.__wlan0_level_dBm)
        if self.__wlan0_level_dBm >= -80: return (1, self.__wlan0_level_dBm)
        return (0, self.__wlan0_level_dBm)

if __name__ == "__main__":
    monitor = Monitor()
    seconds = 30
    start_time = time.time()
    while(time.time() - start_time < seconds):
        if monitor.update_wlan0_status():
            print(monitor.get_wlan0_level())