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

  getNextConfig() {
    return {
      experimental: {
        basePath: this.adminPath,
      },
    };
  }

  async prepareMiddleware({ dev, distDir }) {
    const app = new express();
    const nextConfig = this.getNextConfig();
    const nextApp = next({ distDir, dir: srcDir, dev, conf: nextConfig });
    await nextApp.prepare();
    const handler = nextApp.getRequestHandler();
    app.use(handler);
    return app;
  }

  async build() {
    const nextConfig = this.getNextConfig();
    return nextBuild(srcDir, nextConfig);
  }
}

module.exports = { AdminUIApp };
