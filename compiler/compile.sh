#!/bin/bash
if [ $1 = "server" ]; then
  js-shell -e "`coffee -p compiler/Compiler.coffee code 2>&1`; js.compile()"
elif [ $1 = "client" ]; then
  coffee -p compiler/Compiler.coffee code
  echo "js.compile()"
else
  echo "Please supply compile mode: 'client' or 'server'."
fi
