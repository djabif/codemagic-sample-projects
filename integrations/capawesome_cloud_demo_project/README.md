# Capawesome Cloud Integration with Codemagic

[Capawesome Cloud](https://capawesome.io/cloud/) delivers **Live Updates** to [Capacitor](https://capacitorjs.com/) and [Cordova](https://cordova.apache.org/) apps: you publish a new version of your web assets and users receive it over the air, without going through an App Store or Google Play review.

This sample is a minimal Capacitor app with the [Live Update SDK](https://capawesome.io/docs/cloud/live-updates/setup/) installed. The `codemagic.yaml` workflow builds the web assets and publishes them as a Live Update with the [Capawesome CLI](https://capawesome.io/docs/cloud/cli/).

The full guide is available in the Codemagic documentation: [Capawesome Cloud integration](https://docs.codemagic.io/integrations/capawesome-cloud-integration/).

## How the app is set up

- `@capawesome/capacitor-live-update` is installed as a dependency.
- `capacitor.config.json` configures the plugin with the Capawesome Cloud app ID and `autoUpdateStrategy: "background"`, so the plugin checks for, downloads and applies updates on its own. `autoBlockRolledBackBundles` and `readyTimeout` enable [automatic rollback](https://capawesome.io/docs/cloud/live-updates/rollbacks/) of a broken update.
- `src/js/capacitor-welcome.js` calls `LiveUpdate.ready()` at app start to signal that the new bundle started successfully.

To use this sample with your own app, replace the `appId` under `plugins.LiveUpdate` in `capacitor.config.json` with the ID of your app in Capawesome Cloud.

## Configure access to Capawesome Cloud

1. Generate a new token via the [Tokens](https://console.cloud.capawesome.io/settings/tokens) page of the Capawesome Cloud Console.
2. Open your Codemagic app settings, and go to the **Environment variables** tab.
3. Enter `CAPAWESOME_TOKEN` as the **_Variable name_**. The CLI reads this variable automatically, so no login step is needed.
4. Copy and paste the Capawesome Cloud token string as **_Variable value_**.
5. Enter the variable group name **_capawesome_credentials_**. Click the button to create the group.
6. Make sure the **Secret** option is selected.
7. Click the **Add** button to add the variable.
8. Add a second (non-secret) variable `CAPAWESOME_APP_ID` with the ID of your app to the same group.

The variable group is referenced in `codemagic.yaml`:

``` yaml
  environment:
    groups:
      - capawesome_credentials
```

## Publish a Live Update

The workflow builds the web assets, makes sure the `production` channel exists, and uploads the bundle:

``` yaml
  scripts:
    - name: Install dependencies
      script: |
        npm ci
    - name: Build web assets
      script: |
        npm run build
    - name: Create channel (no-op if it already exists)
      script: |
        npx @capawesome/cli apps:channels:create \
          --app-id $CAPAWESOME_APP_ID \
          --name production \
          --ignore-errors
    - name: Upload Live Update to Capawesome Cloud
      script: |
        npx @capawesome/cli apps:liveupdates:upload \
          --app-id $CAPAWESOME_APP_ID \
          --path dist \
          --channel production \
          --git-ref $CM_COMMIT
```

- `--git-ref $CM_COMMIT` associates the bundle with the commit that produced it.
- `apps:channels:create --ignore-errors` is idempotent, so the channel does not have to be created by hand.
- `npx @capawesome/cli` resolves to the latest CLI release. For reproducible pipelines, pin it to a specific version (e.g. `npx @capawesome/cli@4.27.0`).
- The CLI exits with a non-zero code if the upload fails, which fails the Codemagic build.

Once the upload completes, the bundle is available to every device subscribed to the `production` channel. You can review it on the [Deployments](https://console.cloud.capawesome.io/apps/_/deployments) page of the Console.

## Going further

The [integration guide](https://docs.codemagic.io/integrations/capawesome-cloud-integration/) also covers:

- Versioned channels, to keep updates compatible with the installed native version
- Signing bundles with a private key stored as a Codemagic secret
- Gradual rollouts with `--rollout-percentage` and rollbacks
- Building the web assets in Capawesome Cloud instead of on the Codemagic machine
- Combining the Live Update step with a native build in the same workflow

See also the [Capawesome Cloud Live Updates documentation](https://capawesome.io/docs/cloud/live-updates/) and the [CLI command reference](https://capawesome.io/docs/cloud/cli/commands/).
