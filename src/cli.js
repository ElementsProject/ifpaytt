#!/usr/bin/env node

const args = require('meow')(`
    Usage
      $ ifpaytt [options]

    Options
      -c, --charge-url <url>      lightning charge server url [default: http://localhost:9112]
      -t, --charge-token <token>  lightning charge access token [required]
      -k, --ifttt-key <key>       IFTTT maker key (available in https://ifttt.com/services/maker_webhooks/settings) [required]
      -r, --ifttt-prefix <prefix> prefix for IFTTT event names [default: ifpaytt_]

      -x, --currency <name>       the currency prices are quoted in [default: BTC]
      --price-{event} <price>     price to send events of type {event}

      -d, --db-path <path>        path to store payperclick sqlite database [default: ifpaytt.db]
      --invoice-expiry <sec>      how long should invoices be payable for [default: 1 hour]
      --access-expiry <sec>       how long should paid active tokens remain valid for [default: 1 hour]
      --token-secret <secret>     secret used for HMAC tokens [default: generated based on {charge-token}]

      -p, --port <port>           http server port [default: 6000]
      -i, --host <host>           http server listen address [default: 127.0.0.1]
      -e, --node-env <env>        nodejs environment mode [default: production]
      -h, --help                  output usage information
      -v, --version               output version number

    Example
      $ ifpaytt -t chargeAccessToken -k iftttMakerKey -x BTC \\
                --price-lightup_room404 0.00001 --price-vend_machine137_item56 0.00023

`, { flags: { chargeUrl: {alias:'c'}, chargeToken: {alias:'t'}
            , dbPath: {alias:'d'}, iftttKey: {alias:'k'}, iftttPrefix: {alias:'r'}, currency: {alias:'x'}
            , port: {alias:'p'}, host: {alias:'i'}, nodeEnv : {alias:'e'} } }
).flags

Object.keys(args).filter(k => k.length > 1)
  .forEach(k => process.env[k.replace(/([A-Z])/g, '_$1').toUpperCase()] = args[k])

require('./app')
