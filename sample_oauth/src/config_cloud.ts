export default {
  client_id: 'xxxxxxxxxxxxxxxxxx', // 適宜置き換えてね
  redirect_uri: 'http://localhost:8080/settings', // 適宜置き換えてね
  scope: 'OR.Users OR.Machines offline_access openid profile email', // 適宜置き換えてね

  // クラウド版の情報はこちらから確認可能
  // https://cloud.uipath.com/identity_/.well-known/openid-configuration 
  authorization_endpoint: 'https://cloud.uipath.com/identity_/connect/authorize', // クラウド版の場合はみんなコレ
  token_endpoint: 'https://cloud.uipath.com/identity_/connect/token',  // クラウド版の場合はみんなコレ

  uri_orch: 'https://cloud.uipath.com/{organizationName}/{tenantName}', // 適宜置き換えてね
}
