const axios = require('axios');

async function getPayPalAccessToken() {
  const res = await axios({
    url: `${process.env.PAYPAL_BASE_URL}/v1/oauth2/token`,
    method: 'post',
    auth: {
      username: process.env.PAYPAL_CLIENT_ID,
      password: process.env.PAYPAL_SECRET,
    },
    params: {
      grant_type: 'client_credentials',
    },
  });

  return res.data.access_token;
}

module.exports = { getPayPalAccessToken };
