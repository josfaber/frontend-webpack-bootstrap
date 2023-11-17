# A Webpack bootstrap for web-development
This is my opinionated take on a complete bootstrap for (frontend) web-development. It has a development mode with live reloading for html, js and (s)css and a production builder. Next to that it has a simple Nginx docker compose file for testing the production version in Nginx.

## Uses
This bootstrap uses Webpack, Babel, Sass and various plugins and loaders.

## What it will do
All Javascript is compiled with Babel. SCSS is parsed with Sass via `sass-loader` and compiled into a css file for production. The assets are checked and image assets `<4kb` are converted into inline assets.

Files and dirs in the `src/static` folder are recursively copied-as-is into the `dist` folder

### Development
The `webpack-dev-server` is started and will take care of reloading when files are changed.

### Production
The assets will get a hash in their name, preventing file caching on a production server. Next to that, an `assets-manifest.json` file is created containing relative paths of all assets used, the version from the package file and a creation timestamp, for use with other frameworks.

## Usage
Clone project, then
```
npm install
```

Then to start development (app will open in default browser)
```
npm start
```

To build production version
```
npm run build
```

To run production version with [http-server](https://www.npmjs.com/package/http-server) 
```
npm run serve-dist
```

To serve with [Docker Nginx](https://hub.docker.com/_/nginx) run 
```
docker compose up
```