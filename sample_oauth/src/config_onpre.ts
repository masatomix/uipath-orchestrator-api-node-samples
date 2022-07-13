export default {
  client_id: 'xxxxxxxxxxxxxxxx', // 適宜置き換えてね
  redirect_uri: 'http://localhost:8080/settings', // 適宜置き換えてね
  scope: 'OR.Users OR.Machines offline_access openid profile email', // 適宜置き換えてね
  
  // オンプレ版の場合は、下記から確認可能。
  // https://[server]/identity/.well-known/openid-configuration
  authorization_endpoint: 'https://[server]/identity/connect/authorize', // 適宜置き換えてね
  token_endpoint: 'https://[server]/identity/connect/token', // 適宜置き換えてね

  uri_orch: 'https://[server]', // 適宜置き換えてね
}
