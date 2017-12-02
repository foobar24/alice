#!/bin/bash

set -e

PM=apt-get
LF=/etc/default/varnish

if [ -f /etc/redhat-release ]; then
    PM=yum
    LF=/etc/varnish/varnish.params
fi

# Get dependencies
sudo $PM -y install curl

# Install node
if [ -f /etc/redhat-release ]; then
    curl --silent --location https://rpm.nodesource.com/setup_8.x | sudo bash -
else
    curl -sL https://deb.nodesource.com/setup_8.x | sudo -E bash -
fi
sudo $PM -y install nodejs

# Install dependencies
npm install

# Install pm2
npm install pm2

# Install varnish
sudo $PM -y install varnish

# Set varnish to listen on port 80
sudo sed -i 's/\:6081/\:80/' $LF

# Set node app as varnish backend
sudo sed -i 's/8080/3000/' /etc/varnish/default.vcl

# Restart varnish
sudo service varnish restart

echo "Update the 'config.json' file with your config"
echo "Next, use ./bin/start to start server"
echo "Nothing else."
