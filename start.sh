#! /bin/bash -e

# ini setting
INI_FILE=setting.ini
INI_SECTION=develop

# 引用元: 「bashでiniファイルを読む」
#  URL: https://qiita.com/srea/items/28073bc90d65eed0856d
eval `sed -e 's/[[:space:]]*\=[[:space:]]*/=/g' \
    -e 's/;.*$//' \
    -e 's/[[:space:]]*$//' \
    -e 's/^[[:space:]]*//' \
    -e "s/^\(.*\)=\([^\"']*\)$/\1=\"\2\"/" \
   < $INI_FILE \
    | sed -n -e "/^\[$INI_SECTION\]/,/^\s*\[/{/^[^;].*\=.*/p;}"`
# 引用以上

# WebRTC Native Client Momo
cd momo-19.12.1
chmod +x momo
./momo --force-i420 --no-audio --port $MOMO_PORT test &
cd -


# Python web server
cd picar
nohup poetry run python3 server.py -p $CONTROLLER_PORT &
cd -
