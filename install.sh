#!/bin/bash

set -e
# Download node bin
wget https://nodejs.org/dist/v6.10.0/node-v6.10.0-linux-x64.tar.xz
tar xvf node-v6.10.0-linux-x64.tar.xz
rm node-v6.10.0-linux-x64.tar.xz
mv node-v6.10.0-linux-x64 node

# Install dependencies
node/bin/npm install

# Install pm2
node/bin/npm install pm2

PM=apt-get
LF=/etc/default/varnish

if [ -f /etc/redhat-release ]; then
    PM=yum
    LF=/etc/varnish/varnish.params
fi

# Install varnish
sudo $PM install -y varnish

# Set varnish to listen on port 80
sudo sed -i 's/\:6081/\:80/' $LF

# Set node app as varnish backend
sudo sed -i 's/8080/3000/' /etc/varnish/default.vcl

# Restart varnish
sudo service varnish restart

echo "Update the 'config.json' file with your config"
echo "Next, use ./bin/start to start server"
echo "Nothing else."
