import { post } from 'superagent'

const enc = encodeURIComponent
  , missing = _ => { throw new Error('IFTTT_KEY is required') }

module.exports = (makerKey=missing(), prefix='') => (event, value1, value2, value3) =>
  post(`https://maker.ifttt.com/trigger/${enc(prefix+event)}/with/key/${enc(makerKey)}`)
    .type('json').send({ value1, value2, value3 })
