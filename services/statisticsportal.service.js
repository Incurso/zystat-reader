import { readFile } from 'fs/promises'
import path from 'path'
import yaml from 'js-yaml'
import axios from 'axios'
import { URL } from 'url'
import parseArgs from 'minimist'

const args = parseArgs(process.argv.slice(2))

// Load config file
const config = yaml.load(await readFile(path.resolve(args.config || './config/config.yml'), 'utf8'))

const getCookie = async () => {
  // TODO: check if cookie exists and is not expired
  let cookie = []

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

  await axios.post(config.URLS.LOGIN_AUTH, new URLSearchParams(authData), { beforeRedirect: (options, { headers }) => {
    // Grab cookie
    if (Object.keys(headers).indexOf('set-cookie') !== -1) {
      cookie = headers['set-cookie']
    }
  }})
  .catch(e => {
    console.log('Error:', e, e.response)
  })

  return cookie
}

export const get = async (queueName, startDate, endDate) => {
  let cookie = await getCookie()
  
  return new Promise((resolve, reject) => {
    return axios.get(`${config.URLS.CHANNEL_ENTRIES}?&queueName=${queueName}&startDate=${startDate}&endDate=${endDate}`, { headers: { cookie } })
      .then(async ({ data }) => {
    
        // Throw error if authentication fails
        if (Object.keys(data).indexOf('authenticated') !== -1 && data.authenticated === false) throw new Error(data.reason)
    
        const response = await data.rows.map(row => {
          return {
            zyTag: row[0],
            type: row[1],
            time: new Date(row[2]),
            from: row[3],
            user: row[4],
            to: row[5],
            duration: row[6],
            extension: row[7],
            callResult: row[8]
          }
        })

        return resolve(response)
      })
      .catch((err) => {
        return reject(err)
      })
    })
}

export default {
  get
}
