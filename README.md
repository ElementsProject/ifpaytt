# If Pay Then That

[![npm release](https://img.shields.io/npm/v/ifpaytt.svg)](https://www.npmjs.com/package/ifpaytt)
[![MIT license](https://img.shields.io/github/license/ElementsProject/ifpaytt.svg)](https://github.com/ElementsProject/ifpaytt/blob/master/LICENSE)
[![Pull Requests Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](http://makeapullrequest.com)
[![IRC](https://img.shields.io/badge/chat-on%20freenode-brightgreen.svg)](https://webchat.freenode.net/?channels=lightning-charge)

Use Bitcoin Lightning payments as the _trigger_ for IFTTT (If This Then That) _actions_.

Powered by :zap: [Lightning Charge](https://github.com/ElementsProject/lightning-charge) and [paypercall](https://github.com/ElementsProject/paypercall).

## Install

```bash
$ npm install -g ifpaytt
```

## Setup

Setup [Lightning Charge](https://github.com/ElementsProject/lightning-charge), then:

1. Get your IFTTT maker key from [IFTTT's Webhook settings page](https://ifttt.com/services/maker_webhooks/settings)
   (shown as `https://maker.ifttt.com/use/[MAKER-KEY-HERE]`).

2. Open the [new applet page](https://ifttt.com/create), click "this", enter "Webhooks", click "Receive a web request",
   enter a descriptive event name prefixed by `ifpaytt_` containing only numbers, lowercase letters and `_`
   (e.g. `ifpaytt_lightup_room404` or `ifpaytt_vend_machine137_item56`),
   and click "Create Trigger".

3. Configure your "then" action and finish creating the IFTTT applet.

4. Start the `ifpaytt` server:

   ```bash
   $ ifpaytt --charge-token [mySecretToken] --ifttt-key [myMakerKey] --currency BTC \
             --price-lightup_room404 0.00001 --price-vend_machine137_item56 0.000063

   Running on http://localhost:6000
   ```

That's it! The server is now ready to accept payments and trigger IFTTT actions.

## Paying to trigger actions

Users can access the IFTTT action through a three-part process:

1. Send an empty `POST` request to `/{event-name}` to get the BOLT11 payment request and the `X-Token` header:

    ```bash
    $ curl -i -X POST http://localhost:6000/lightup_room404

    HTTP/1.1 402 Payment Required
    X-Token: lmbdmJeoSQ0ZCB5egtnph.af1eupleFBVuhN2vrbRuDLTlsnnUPYRzDWdL5HtWykY
    Content-Type: application/vnd.lightning.bolt11

    lnbcrt8925560p1pdfh7n2pp54g5avyupe70l988h30u0hy8agpj2z7qsveu7ejhys97j98rgez0...
    ```

2. Make the payment:

    ```bash
    $ lightning-cli pay lnbcrt8925560p1pdfh7n2pp54g5avyupe70l988h30u0hy8agpj2z7qsveu7ejhys97j98rgez0...
    ```

3. Send the request again, this time with the `X-Token` header echoed back and optionally
   with `value1`, `value2` and `value3` in the request body (passed along to IFTTT):

    ```bash
    $ curl -i -X POST http://localhost:6000/lightup_room404 \
      -H 'X-Token: lmbdmJeoSQ0ZCB5egtnph.af1eupleFBVuhN2vrbRuDLTlsnnUPYRzDWdL5HtWykY' \
      -d value1='brightness=80,color=red'

    HTTP/1.1 200 OK
    Content-Type: text/plain

    Congratulations! You've fired the ifpaytt_lightup_room404 event
    ```

    (if `value[1-3]` are not set, they'll [automatically be populated](https://github.com/ElementsProject/ifpaytt/blob/master/src/app.js#L40-L42)
    with some useful information about the payment.)

## CLI options

```bash
$ ifpaytt --help

  Trigger IFTTT actions with Bitcoin Lightning payments

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
    $ ifpaytt -t chargeAccessToken -k iftttMakerKey -x BTC \
              --price-lightup_room404 0.00001 --price-vend_machine137_item56 0.00023
```

## License
MIT
