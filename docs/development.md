# Development

Building requires `node` (10 or newer) and `yarn`.

Clone the repository with `--recursive` git option.

To set up a complete development environment:

```bash
# Install dependencies
yarn install

# Build included dependencies
yarn workspace xpra-av build
yarn workspace xpra-jsmpeg build
yarn workspace xpra-broadway build
```

> The following commands runs in the foreground and have to be executed separately.

```bash
# Automatically rebuild the xpra library if changed
yarn workspace xpra-html5-client build --watch

# Start a development server for the UI
yarn workspace xpra-html5-client-react dev

# Start a nested X testing server
Xephyr -br -ac -noreset -screen 800x600 :10

# Start an xpra session on the new X server
xpra --no-daemon --bind-ws=127.0.0.1:10000 --start=xterm --html=off start :10
```

## Usage

> If you want to use a production version of the client, run `preview` instead of `dev`.

You can now use the client with the URL given in the `dev` (or `preview`) server command output.

To automatically connect to a target, use `http://localhost:port/?host=ws://ip:port&connect=true`.

You can also apply any option defined in [`XpraConnectionOptions`](https://andersevenrud.github.io/xpra-html5-client/ts/docs/interfaces/XpraConnectionOptions.html),
like `username` and `password`.

## Deployment

```bash
yarn install
yarn workspaces run build
```

Now copy the artifacts in `packages/ui/dist/` to your destination.
