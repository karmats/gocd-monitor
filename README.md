<img src="https://github.com/karmats/gocd-monitor/blob/master/assets/images/logo.png?raw=true" width="150" align="right" />


# GoCD monitor [![Build Status](https://travis-ci.org/karmats/gocd-monitor.svg?branch=master)](https://travis-ci.org/karmats/gocd-monitor) [![Dependencies](https://david-dm.org/karmats/gocd-monitor.svg)](https://david-dm.org/karmats/gocd-monitor)

Build monitor for Go cd build server https://www.go.cd/
#### Pipeline status
* Blue - Pipeline is building
* Green - Pipeline build passed
* Red - Pipeline has failed
* Yellow - Pipeline has been paused
* Orange - Pipeline build been cancelled

![Pipelines](https://github.com/karmats/gocd-monitor/blob/gh-pages/images/pipelines.png?raw=true)

#### Pipeline attributes
![Pipeline explanation](https://github.com/karmats/gocd-monitor/blob/gh-pages/images/pipeline-expl.png?raw=true)

## Setup
Open app-config.js and change the three lines
```
// Url for your go server
goServerUrl: 'https://ci.example.com',
// Go user to use for communication with go server
goUser: 'xxx',
// Password for go user
goPassword: 'xxx',
  ```

Alternatively you can configure via environment variables, these will override values within the config.js file:

```
gocdmonitor_gocd_host=https://ci.example.com
gocdmonitor_gocd_user=xxx
gocdmonitor_gocd_password=xxx
```

Optional environment variables:
```
gocdmonitor_gocd_poll_interval=60
gocdmonitor_gocd_check_pipelines_interval=60
gocdmonitor_gocd_switch_pages_interval=60
gocdmonitor_gocd_grouppipelines=true
gocdmonitor_default_sort_order=buildtime
gocdmonitor_default_hidden_pipelines=foo,bar
gocdmonitor_default_pipeline_filter_regex=pipeline.*-[0-9]+
gocdmonitor_enable_dark_theme=true
gocdmonitor_gocd_showbuildlabels=true
gocdmonitor_gocd_linktopipelineingo=true
gocdmonitor_gocd_hide_weather_icons=true
gocdmonitor_db_file_path=server/data.db
```

Enabling HTTPS of the server

Use env variables or config to enable https and define needed private and public keys. Example for environment variables:
```
gocdmonitor_use_https=true
gocdmonitor_key_path=path/to/your/publicKey
gocdmonitor_certificate_path=path/to/your/privateKey
```

This can be extremely useful for configuring in Docker environments.


Optionally set the following variables in app-config.js.  
Enable dark theme:
```
enableDarkTheme: true
```
Group pipelines by their pipeline groups:
```
groupPipelines: true
```
Click on a pipeline to open its history in GoCD:
```
linkToPipelineInGo: true
```
Hide the weather icons:
```
hideWeatherIcons: true
```

Then open a terminal and enter
```
npm install
npm start
```
Go to `http://localhost:3000`

Enjoy :)

## Configuration
Go to `http://localhost:3000?admin` and click the settings button in the bottom-right corner to open the configuration dialog.
* Sort Order - Sort pipelines by status or latest build time
* Filter Pipelines - Disable/enable pipelines to retrieve from go server. It's also possible to write a regex with the pipelines you want.
![Configuration](https://github.com/karmats/gocd-monitor/blob/gh-pages/images/configuration.png?raw=true)

### Using multiple configuration profiles

Add the `profile` attribute to your URL, e.g. `http://localhost:3000?admin&profile=team1`. Then continue to configure as usual.

## Test reports
To configure test reports, go to `http://localhost:3000/test-results?admin`. Click the '+'-button and choose the pipeline you want to generate test reports for. The system then retrieves all test files and creates graph and possible error table for all tests found in that pipeline. For now only cucumber tests are supported. If defined, the system will switch between monitor and test report page every `switchBetweenPagesInterval` seconds.
![Test reports](https://github.com/karmats/gocd-monitor/blob/gh-pages/images/test-report.png?raw=true)

## How it works
The server polls the go server every `goPollingInterval` seconds. The results are then reported to the client using [socket.io](http://socket.io/). The pipelines and its pause info are refreshed once every day.

## Development

[gocd-trial-launcher](https://www.gocd.org/test-drive-gocd.html) can be used to setup GoCD locally with sample piplines. Download and extract the appropriate archive for your development environment. Enter `./run-gocd` to start the setup.

To run the application in development mode, open a terminal and enter `npm run dev-start`. The server and client will be rebuilt when a js or jsx-file changes. By default, it points to the GoCD server started by gocd-trial-launcher ([refer](https://github.com/karmats/gocd-monitor/blob/1aad6e45c3f5454f0e4f2857f64a1055a13ea459/app-config.js#L15)).

To run tests, enter `npm test`.

## Troubleshooting
If the project has been installed with root user or by using `sudo npm install` there might be problems with the `postinstall` script since npm tries to downgrade its priviligies when running scripts. More information about this problem and how to fix it can be found [here](https://til.codes/npm-install-failed-with-cannot-run-in-wd-2/) (hint, add the `--unsafe-perm` flag when running `npm install`)
