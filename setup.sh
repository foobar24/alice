#!/bin/bash
# Alice install script

ALICE_PORT=3000
LOG_DIR=/var/log/alice
CONF_DIR=/etc/alice
SRC_DIR=/usr/share/alice
SYSTEND_DIR=/etc/systemd/system

echo 'Alice install script'

################################################################################
# INSTALL PARAMS
################################################################################
# Get target mirror
if [ -z "$1" ]; then
  while true; do
    read -p 'Which website do you want to mirror? ' TARGET </dev/tty

    if  [[ $TARGET == http* ]] ; then
      break
    fi

    echo 'Bad input, format is: http(s)://my.website.com'
  done
else
  TARGET=$1
fi

# Get domain
if [ -z "$2" ]; then
  read -p 'What is your domain? ' HOSTNAME </dev/tty
  HOSTNAME=$(echo "$HOSTNAME" | sed 's/http[s]*:\/\///g')
else
  HOSTNAME=$2
fi

# Get user email
if [ -z "$3" ]; then
  read -p 'What is your email (for lets encrypt certificate)? ' EMAIL </dev/tty
else
  EMAIL=$3
fi

################################################################################
# INSTALL
################################################################################
# Ensure dirs
sudo mkdir -p $CONF_DIR
sudo mkdir -p $LOG_DIR

# Git
if ! type "git" > /dev/null; then
  sudo apt-get update
  sudo apt-get -y install git
fi

# Node
if ! type "node" > /dev/null; then
  curl -sL https://deb.nodesource.com/setup_8.x | sudo -E bash -
  sudo apt-get -y install nodejs
fi

# Caddy
if ! type "caddy" > /dev/null; then
  curl https://getcaddy.com | bash -s personal http.cache
fi

# Alice
if [ ! -d $SRC_DIR ]; then
  sudo git clone https://github.com/NInfolab/alice.git $SRC_DIR
  sudo sh -c "cd $SRC_DIR && npm install"
else
  sudo sh -c "cd $SRC_DIR && git pull && npm install"
fi

# PM2
if [ ! -d "$SRC_DIR/node_modules/pm2" ]; then
  sudo sh -c "cd $SRC_DIR && npm install pm2"
fi

################################################################################
# CONFIGURATION
################################################################################
# Generate alice configuration
sudo sh -c "cat > ${CONF_DIR}/alice.json <<- EOM
{
  \"source\": \"https://$HOSTNAME\",
  \"target\": \"$TARGET\",
  \"port\": $ALICE_PORT,
  \"log_path\": \"$LOG_DIR/alice.log\"
}
EOM"

# Generate caddy configuration
sudo sh -c "cat > ${CONF_DIR}/caddy <<- EOM
$HOSTNAME {
  gzip
  cache
  log $LOG_DIR/caddy.log
  tls $EMAIL
  proxy / 127.0.0.1:$ALICE_PORT {
    transparent
  }
}
EOM"

# Generate systemd service
sudo sh -c "cat > ${SYSTEND_DIR}/alice.service <<- EOM
[Unit]
Description=Alice service
Documentation=https://github.com/NInfolab/alice
After=network.target

[Service]
User=root
ExecStartPre=$SRC_DIR/node_modules/pm2/bin/pm2 start $SRC_DIR/server.js -- ${CONF_DIR}/alice.json --name alice
ExecStopPost=$SRC_DIR/node_modules/pm2/bin/pm2 stop alice
ExecStart=/usr/local/bin/caddy -conf $CONF_DIR/caddy
WorkingDirectory=$SRC_DIR
Restart=on-failure
LimitNOFILE=8192
StartLimitInterval=600

[Install]
WantedBy=multi-user.target
EOM"

# Start Alice
sudo systemctl enable alice
sudo systemctl daemon-reload
sudo systemctl start alice

echo "All set :)"
echo "Visit https://$HOSTNAME"
