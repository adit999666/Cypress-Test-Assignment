const { defineConfig } = require('cypress')

module.exports = defineConfig({
  e2e: {
    baseUrl: 'https://www.medicines.org.uk/emc/browse-companies',
    env: {
      username: 'testuser',
      password: 'testpassword',
    },
  },
})