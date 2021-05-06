const withPreconstruct = require('@preconstruct/next');
const { distDir } = require('../config');

module.exports = withPreconstruct({
  distDir: `../${distDir}/www`,
  env: {
    USER_HAS_PORTFOLIO: !!process.env.IFRAMELY_API_KEY,
  },
});
