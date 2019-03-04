# CoverageManager
This is unit test coverage report manager.

## Step to run

### Prerequisites

Edit `webpack.config.js` and `package.json` files in the [webml-pollyfill](https://github.com/intel/webml-polyfill) object.

* Open `webpack.config.js` file:

    Change:

        module: {rules: [{ test: /\.js$/, loader: 'babel-loader', exclude: /node_modules/ }]}

    to:

        module: {rules: [{test: /\.js$/, use: {loader: 'babel-loader', options: {plugins: ['istanbul']}}, exclude: /node_modules/}]}

* Open `package.json` file:

    Add:

      "babel-plugin-istanbul": "^5.1.0"

    into `devDependencies`

* Build and start the [webml-pollyfill](https://github.com/intel/webml-polyfill) object.

### Install dependency package for CoverageManager

```sh
$ npm install
```

### Set Configurations

There are three fields in the `config.json`:

   + **_webmlpolyfill_**: `{string}`, the information about [webml-pollyfill](https://github.com/intel/webml-polyfill) object.
      + **_commit_**: `{string}`, the commit number of [webml-pollyfill](https://github.com/intel/webml-polyfill) object.
      + **_path_**: `{string}`, The relative paths of [webml-pollyfill](https://github.com/intel/webml-polyfill) object root path and CoverageManager object root path.
   + **_remoteURL_**: `{string}`, remote test URL or local URL `http://localhost:8080/test/index.html`.
   + **_browser_**: `{string}`, the browser to run unit test page and get coverage report.

For example:

   webml-pollyfill object root path: `/home/intel/work1/webml-polyfill`.

   CoverageManager object root path: `/home/intel/work2/CoverageManager`.

    {
        "webmlpolyfill": {
            "commit": "d677572",
            "path": "../../work1/webml-polyfill"
        },
        "remoteURL": "http://localhost:8080/test/index.html",
        "browser": "/usr/bin/google-chrome"
    }

### Start CoverageManager

```sh
$ npm start
```

## Report

   + **General report**: `./coverage`  display current test coverage reports.
   + **Detailed report**: `./report-tree`  display the history of test coverage reports.

## Support Platforms

|  Linux  |   Mac   |  Android  |  Windows  |
|  :---:  |  :---:  |   :---:   |   :---:   |
|  PASS   |   PASS  |    TODO   |    TODO   |
