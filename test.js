import { readFile } from 'fs/promises'
import path from 'path'
import yaml from 'js-yaml'
import axios from 'axios'
import { URL } from 'url'
import parseArgs from 'minimist'

const args = parseArgs(process.argv.slice(2))

// Load config file
const config = yaml.load(await readFile(path.resolve(args.config || './config/config.yml'), 'utf8'))

/**
 * METHOD: GET
 * URL: http://10.215.218.10:8081/StatisticsPortal/login
 */
const authData = await axios.get(config.URLS.LOGIN)
  .then(d => {
    const responseUrl = new URL(d.request.res.responseUrl)

    return {
      username: config.USERNAME,
      password: config.PASSWORD,
      state: responseUrl.searchParams.get('state'),
      scope: responseUrl.searchParams.get('scope'),
      client_id: responseUrl.searchParams.get('client'),
      redirect_uri: responseUrl.searchParams.get('callback')
    }
  })
  .catch(e => {
    console.log(e)
  })

//console.log(authData)

let cookie = []

/**
 * METHOD: POST
 * URL: http://10.215.218.10:8080/Authentication/loginAuth
 * PAYLOAD:
 *  username
 *  password
 *  state
 *  scope
 *  client_id
 *  redirect_uri
 */
await axios.post(config.URLS.LOGIN_AUTH, new URLSearchParams(authData), { beforeRedirect: (options, { headers }) => {
  // Grab cookie
  if (Object.keys(headers).indexOf('set-cookie') !== -1) {
    cookie = headers['set-cookie']
  }
} })
  .catch(e => console.log('Error:', e, e.response))

console.log(cookie)

const queueName= '1550'
const startDate = new Date('2022-07-15').getTime()
const endDate = new Date('2022-07-16').getTime()

/**
 *  METHOD: GET
 *  URL: http://10.215.218.10:8081/StatisticsPortal/channelEntries?&_dc=1656684560615&action=json&isNew=1&agentName=&queueName=1550&resultCode=&reasonCode=&callerNumber=&dialedNumber=&extension=&startDate=1656633600000&endDate=1656719999000&types=1&page=1&start=0&limit=1000&jsonp=Ext.data.JsonP.callback8
*/
const channelEntries = await axios.get(`${config.URLS.CHANNEL_ENTRIES}?&queueName=${queueName}&startDate=${startDate}&endDate=${endDate}`, { headers: { cookie } })
  .then(({ data }) => {

    // Throw error if authentication fails
    if (Object.keys(data).indexOf('authenticated') !== -1 && data.authenticated === false) throw new Error(data.reason)

    return data.rows.map(row => { return {
      zyTag: row[0],
      type: row[1],
      time: row[2],
      from: row[3],
      user: row[4],
      to: row[5],
      duration: row[6],
      extension: row[7],
      callResult: row[8]
    }
  })
})

console.log(channelEntries)

/**
 *  METHOD: GET
 *  URL: http://10.215.218.10:8081/StatisticsPortal/statportal/?logdetails&zyTag=b46ba1ff-f187-d14b-df0a-99fed3f0e4ba&mediaType=1
*/

/**
 *  METHOD: POST
 *  URL: http://10.215.218.10:8081/StatisticsPortal/kpi?&_dc=1656684601992
 *  PAYLOAD:
 *    startDate: 1656633600000
 *    endDate: 1656719999000
 *    type: queue
 *    queues: Nethopur_test|||88|||1000|||1000-forwarded|||9191|||3400|||5431000
 *    page: 1
 *    start: 0
 *    limit: 25
*/

/*
 *  METHOD: POST
 *  URL: http://10.215.218.10:8081/StatisticsPortal/kpi?&_dc=1656684601996
 *  PAYLOAD:
 *    startDate: 1656633600000
 *    endDate: 1656719999000
 *    type: user
 *    users: CN=Einar Sigurðsson 2306813689,OU=Users,OU=LSH,OU=Stofnanir,DC=lsh,DC=is|||CN=Ingunn Sólveig Aradóttir 3004573479,OU=Users,OU=LSH,OU=Stofnanir,DC=lsh,DC=is|||CN=Reynhildur Karlsdóttir 1805783319,OU=Users,OU=LSH,OU=Stofnanir,DC=lsh,DC=is
 *    page: 1
 *    start: 0
 *    limit: 25
*/
