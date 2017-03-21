# Website Mirror by Proxy

## Installation

### Using `install.sh`

```sh
# Clone the git repository from Github.
git clone https://github.com/NInfolab/website-mirror-by-proxy.git
cd website-mirror-by-proxy
# Execute the `install.sh` script
# It will install dependencies, varnish and pm2
./install.sh
```

Edit `config.json` file according to your preferences

```sh
# Then start server
./bin/start
```

If you want to restart application, use :

```sh
./bin/restart
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
