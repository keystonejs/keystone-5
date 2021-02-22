# Release Guidelines

## How to do a release

> This should only ever be done by a very short list of core contributors

Releasing is a two-step process. The first step updates the packages, and the second step publishes updated packages to NPM.

### Update Packages (automatic)

This step is handled for us by the [Release GitHub Action](https://github.com/keystonejs/keystone-5/actions/workflows/release.yml). As PRs are opened
against `master`, this action will open and update a PR which generates the
appropriate `CHANGELOG.md` entries and `package.json` version bumps.

Once ready for a release, merge the generated PR into `master`.

### Publish Packages

Once the version changes are merged back in to `master`, to do a manual release:

```sh
git checkout master && \
git pull && \
yarn fresh && \
yarn publish-changed && \
git push --tags
```

The `yarn publish-changed` command finds packages where the version listed in the `package.json` is ahead of the version published on npm, and attempts to publish just those packages.
As part of this step you will be asked for a one time password (OTP) for NPM.
You can access this from your authentication app.

NOTE: There is no reason you should ever manually edit the version in the `package.json`
