const axios = require('axios');

async function postWithRetry(url, data, options = {}) {
  const { retries = 3, backoff = 100, axiosConfig = {} } = options;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await axios.post(url, data, axiosConfig);
    } catch (err) {
      const status = err.response && err.response.status;
      if (attempt === retries || !(status === 429 || status >= 500)) {
        throw err;
      }
      const delay = backoff * Math.pow(2, attempt);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
}

module.exports = { postWithRetry };
