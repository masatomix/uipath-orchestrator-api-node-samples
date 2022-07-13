import crypto from 'crypto'
import open from 'open'
import { doRequest, getAuthorizationCode, getRandomString } from './utils'
import { default as oauthConfig } from './config_cloud'
// import { default as oauthConfig } from './config_onpre'

const main = async () => {
  // # Authorization Code with PKCE
  const { client_id, scope, redirect_uri, authorization_endpoint, token_endpoint } = oauthConfig
  const { uri_orch } = oauthConfig

  // # Generate Code Verifier
  const code_verifier = getRandomString()

  // # Generate Code Challenge from Code Verifier based on RFC7536
  const code_challenge = sha256(code_verifier)

  // # Build Auth Request URL
  const authorizationURL = createAuthorizationURL({
    client_id, authorization_endpoint,
    redirect_uri, scope, code_challenge
  })

  // # Launch Browser
  open(authorizationURL)
  // open(authorizationURL, { app: { name: 'chrome' } })

  try {
    // # Get Authorization Code
    const code = await getAuthorizationCode(redirect_uri)

    // # Get Access Token
    const grant_type = 'authorization_code'
    let option = {
      uri: token_endpoint,
      method: 'POST',
      headers: {
        'content-type': 'application/x-www-form-urlencoded',
      },
      form: {
        redirect_uri,
        client_id,
        grant_type,
        code,
        code_verifier
      },
      json: true,
    }

    // print(option)

    const body = await doRequest(option)
    // print(body)
    const access_token: string = body.access_token

    console.log('Getting Access Token succeeded')
    console.log(`Access Token: ${access_token}`)

    console.log('Getting all Users ....')
    await getAllUsers(uri_orch, access_token)

    console.log('Getting all Machine Keys ....')
    await getAllMachineKeys(uri_orch, access_token)

    console.log('Done!')

  } catch (error) {
    console.log('Getting Access Token failed!')
    console.log(JSON.stringify(error, null, 2))
  }

}

// # Generate Code Challenge from Code Verifier based on RFC7536
function sha256(target: string): string {
  const base64 = crypto.createHash('sha256').update(target, 'utf8').digest('base64')
  return base64.replace('+', '-').replace('/', '_').replace('=', '')
}

// # Build Auth Request URL
function createAuthorizationURL({
  authorization_endpoint, client_id, redirect_uri,
  state = getRandomString(),
  nonce = getRandomString(),
  scope, code_challenge
}: {
  authorization_endpoint: string, client_id: string, redirect_uri: string,
  state?: string,
  nonce?: string,
  scope: string, code_challenge: string
}): string {
  return [
    authorization_endpoint,
    '?client_id=', client_id,
    '&redirect_uri=', encodeURIComponent(redirect_uri),
    '&state=', state,
    '&nonce=', nonce,
    '&response_type=', 'code',
    '&code_challenge=', code_challenge,
    '&code_challenge_method=', 'S256',
    '&scope=', encodeURIComponent(scope),
  ].join('')
}

function print(obj: any) {
  console.log('--------')
  console.log(obj)
  console.log('--------')
}

async function getAllUsers(uri_orch: string, access_token: string) {

  let option = {
    uri: `${uri_orch}/odata/Users`,
    method: 'GET',
    headers: {
      'Content-Type': 'application/json;charset=utf-8',
      'Authorization': `Bearer ${access_token}`,
    },
    json: true,
  }

  return doRequest(option).then((resUsers: any) => {
    // console.table(resUsers.value)
    console.table(resUsers.value.map((user: any) => {
      return {
        UserName: user.UserName,
        FullName: user.FullName,
        Type: user.Type,
      }
    }))
  })
}

async function getAllMachineKeys(uri_orch: string, access_token: string) {
  let option = {
    uri: `${uri_orch}/odata/Machines`,
    method: 'GET',
    headers: {
      'Content-Type': 'application/json;charset=utf-8',
      'Authorization': `Bearer ${access_token}`,
    },
    json: true,
  }

  return doRequest(option).then((resMachines: any) => {
    // console.table(resMachines.value)
    console.table(resMachines.value.map((machine: any) => {
      return {
        Name: machine.Name,
        LicenseKey: machine.LicenseKey,
      }
    }))
  })
}

main()