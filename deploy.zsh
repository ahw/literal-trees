#!/bin/zsh

BUILT_JS=`grep "\"out\":" build.json | grep -o "[a-zA-Z-]\+\.js"`
echo "Deploying with ${BUILT_JS}"
r.js -o build.json
scp * manchester:~/literal-trees/
scp -r js manchester:~/literal-trees/
sed "s/\(data-main=\"\)[A-Za-z\/]*.js/\1${BUILT_JS}/" index.html > build.html
scp build.html manchester:~/literal-trees/index.html
