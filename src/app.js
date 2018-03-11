const pay = require('paypercall')({
  chargeUrl:   process.env.CHARGE_URL
, chargeToken: process.env.CHARGE_TOKEN
, dbPath:      process.env.DB_PATH || 'ifpaytt.db'
, currency:    process.env.CURRENCY
, secret:      process.env.TOKEN_SECRET
, invoiceExp:  process.env.INVOICE_EXPIRY
, accessExp:   process.env.ACCESS_EXPIRY
})

const ifttt = require('./ifttt')(process.env.IFTTT_KEY, process.env.IFTTT_PREFIX || 'ifpaytt_')

const getPrice = event => process.env[`PRICE_${event.toUpperCase()}`]

const app = require('express')()

app.set('env', process.env.NODE_ENV || 'production')
app.set('port', process.env.PORT || 6000)
app.set('host', process.env.HOST || 'localhost')
app.set('trust proxy', process.env.PROXIED || 'loopback')

app.enable('strict routing')
app.enable('case sensitive routing')
app.disable('x-powered-by')
app.disable('etag')

app.use(require('body-parser').json())
app.use(require('body-parser').urlencoded({ extended: true }))

app.use(require('morgan')('dev'))

app.post('/:event([a-z0-9_]+)'

, (req, res, next) => (req.price = getPrice(req.params.event))
    ? pay(req.price)(req, res, next)
    : next('route')

, (req, res, next) =>
    ifttt(req.params.event
    , req.body.value1 || req.invoice.msatoshi_received
    , req.body.value2 || req.invoice.id
    , req.body.value3 || { invoice: req.invoice, body: req.body }
    )
    .then(r => res.send(r.text))
    .catch(next)
)

app.listen(app.settings.port, app.settings.host, _ =>
  console.log(`Running on http://${ app.settings.host }:${ app.settings.port }`))
