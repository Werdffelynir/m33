#!/usr/bin/bash

LOC_HOST="localhost"
LOC_PORT="8021"
LOC_DEBUG_PORT="9222"

google-chrome http://$LOC_HOST:$LOC_PORT/index.html --user-data-dir="/tmp/chrome-profile-dev" \
  --unsafely-disable-devtools-self-xss-warnings \
  --new-window \
  --auto-open-devtools-for-tabs \
  & php -S $LOC_HOST:$LOC_PORT



