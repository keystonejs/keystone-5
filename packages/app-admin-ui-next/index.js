const express = require('express');
const path = require('path');
const next = require('next');
const nextBuild = require('next/dist/build').default;

const srcDir = path.join(__dirname, 'src');

class AdminUIApp {
  constructor({
    adminPath = '/admin',
    apiPath = '/admin/api',
    graphiqlPath = '/admin/graphiql',
  } = {}) {
    if (adminPath === '/') {
      throw new Error("Admin path cannot be the root path. Try; '/admin'");
    }
    this.adminPath = adminPath;
    this.apiPath = apiPath;
    this.graphiqlPath = graphiqlPath;
  }

  async prepareMiddleware({ dev, distDir }) {
    const app = new express();
    const nextApp = next({ distDir, dir: srcDir, dev });
    await nextApp.prepare();
    const handler = nextApp.getRequestHandler();
    app.use(/* this.adminPath, */ handler);
    return app;
  }

  async build() {
    return nextBuild(srcDir, {
      assetPrefix: this.adminPath,
      publicRuntimeConfig: {
        basePath: this.adminPath,
      },
    });
  }
}

module.exports = { AdminUIApp };
