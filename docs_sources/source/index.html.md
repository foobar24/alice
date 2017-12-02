---
title: Alice documentation

language_tabs: # must be one of https://git.io/vQNgJ
  - bash

toc_footers:
  - <a href='https://github.com/lord/slate'>Documentation Powered by Slate</a>

# includes:
#   - errors

search: true
---

# Introduction

Alice is a server-side web proxy designed to host a mirror of any website. Whereas redirect-when-blocked requires the source/origin website to be modified, website-mirror-by-proxy runs separately and does not need any modification of the source/origin website.
The Wall Street Journal beautifully illustrated our approach with one inaccuracy. The person inside the country experiencing online censorship does not need any special software to access ban sites. Any regular browser will be able to access the dynamic mirrors. 

The Alice Project was born in 2015 as part of #CollateralFreedom, a movement launched by Reporters Without Borders (RSF) for fight against censorship. Her goal? Make easier to deploy proxy for bypass cybercensorship.
Why this project is named "Alice"? Do you remember Alice in Wonderland? The story by Lewis Carrol? Let us introduce you Alice on the other side of the mirror!
The first version of Alice was developed during an event at La Cantine Numérique Brest (France). The second edition in 2017 add some great news/developments like :
- HTTPS
- Auto deployment via bash script

# Installation

## Prerequisites

> add curl to debian:

```bash
sudo apt-get install curl
```

You are going to need:

* a Linux Debian 8
* curl


<!-- <aside class="notice">
You must replace <code>meowmeowmeow</code> with your personal API key.
</aside> -->

## Deployment

```bash
sh -c "$(curl -fsSL https://raw.github.com/NInfolab/alice/master/setup.sh)"
```

> The above script will ask you some questions to finalize installation

We made a script to automatically deploy the proxy. You'll need to answer a few questions:

* Which website do you want to mirror? (*http://a-site.com*)
* On which domain will you deploy this mirror? (*tchoutchou.org*)
  * It also works with subdomains. (*subdomain.domain.net*)
* What is your e-mail address?

<aside class="warning">
Letsencrypt ask for an email for two reasons: to generate a SSL and for the renewal mail (as a letsencrypt certificate last for 90 days. learn more here: <a href="https://letsencrypt.org/docs/faq/#what-is-the-lifetime-for-lets-encrypt-certificates-for-how-long-are-they-valid" target="_blank">https://letsencrypt.org/docs/faq/#what-is-the-lifetime-for-lets-encrypt-certificates-for-how-long-are-they-valid</a> )
</aside>

# Administration

## Configuration

> Configuration file is set there:

```bash
ALICE_PORT=3000
LOG_DIR=/var/log/alice
CONF_DIR=/etc/alice
SRC_DIR=/usr/share/alice
SYSTEND_DIR=/etc/systemd/system
```

Configuration is available in `setup.sh`. Base configuration is currently working and is meant to allow a quick installation.

* ALICE_PORT: port on which the proxy will be installed (different from the web server)
* LOG_DIR: directory in which logs from alice will be send
* CONF_DIR: directory in which Alice's configuration file will be installed
* SRC_DIR: directory in which Alice will be placed
* SYSTEND_DIR: directory where systemd is installed

## Service management

> See service status:

```bash
service alice status
```

> Start service:

```bash
service alice start
```

> Stop service:

```bash
service alice stop
```

> Restart service:

```bash
service alice restart
```

A few commands could be usefull to you: service commands. You might need them if your need to check/start/stop/restart Alice.

* Status allow you to check Alice status (obviously)
* Start will start Alice (Oh?)
* Stop will... Oh you really need explication for that?
* Restart: stop then start again

However if Alice stop working, you might want to know why it stoped.

## Logs

> There are 2 logs files. One for Alice, the other for Caddy. They are set there:

```bash
/var/log/alice.log
/var/log/caddy.log
```

Two log files are available: one for Alice itself, one for Caddy. We have a Caddy log file because it is our base web server.

# Annexe

## Technologies

Here are the technologies Alice is using:

* <a href="https://caddyserver.com/" target="_blank">Caddy</a> : it is the base web server. It is light and support http, https and http2.
* <a href="https://letsencrypt.org/" target="_blank">LetsEncrypt</a>: it is a free, automated, and open Certificate Authority. It allow Alice to use https.
* <a href="https://www.npmjs.com/package/http-proxy" target="_blank">http-proxy</a>: it is a proxy library.

## To do

We'd like to improve this project. Heres what we'd like to do (or what you can do ;) ):

* add mirror script: use the same Alice service to deliver another mirror on a different domain.
* TODO
