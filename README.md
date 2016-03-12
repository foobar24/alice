# Website Mirror by Proxy

## Installation

### With DEB package

A .deb package is available for all Debian like based distributions.

```sh
# As root
echo 'deb [trusted=yes] https://apt.fury.io/wmbp/ /' > /etc/apt/sources.list.d/wmbp.list
apt-get update
sudo apt-get install website-mirror-by-proxy
# Edit conf in `/etc/website-mirror-by-proxy/config.json`
vi /etc/website-mirror-by-proxy/config.json
# Then restart server
/etc/init.d/website-mirror-by-proxy restart
```

### With `install.sh`

Clone the git repository from Github.
The script will install varnish on top of Website Mirror by Proxy, and will listen on port 80. We recommend to install the server on a clean machine.

```sh
# Clone the git repository from Github.
git clone https://github.com/NInfolab/website-mirror-by-proxy.git
cd website-mirror-by-proxy
# Execute the `install.sh` script
# It will install dependencies, varnish and pm2
./install.sh
# Edit config.json file
# Then start server
./bin/start
```

If you want to restart application, use :

```sh
PATH="$PATH:`pwd`/node/bin" ./node_modules/.bin/pm2 restart server
```

### From source

```sh
# Clone the git repository from Github.
git clone https://github.com/NInfolab/website-mirror-by-proxy.git
cd website-mirror-by-proxy
# Install dependencies
npm install
# Edit the config.json file
# Then start the server
node server.js
```
