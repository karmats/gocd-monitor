var config = {
    // Name of built js-file
    jsFilename: 'app.js',
    // Port to run the application on
    port: process.env.gocdmonitor_port || 3000,
    // Webpack dev port to run on
    devPort: 3001,
    // Url for your go server
    goServerUrl: process.env.gocdmonitor_gocd_host || 'https://ci.example.com',
    // Go user to use for communication with go server
    goUser: process.env.gocdmonitor_gocd_user || '',
    // Password for go user
    goPassword: process.env.gocdmonitor_gocd_password || '',
    // How often data from go should be refreshed in seconds
    goPollingInterval: process.env.gocdmonitor_gocd_poll_interval || 30,
    // If > 0 switches between pipeline and test results page every n seconds
    switchBetweenPagesInterval: process.env.gocdmonitor_gocd_poll_interval || 0,
    // Whether to display build labels
    showBuildLabels: process.env.gocdmonitor_gocd_showbuildlabels === "true" ? true : false,
    // Whether to group pipelines
    groupPipelines: process.env.gocdmonitor_gocd_grouppipelines === "true" ? true : false
}
module.exports = config;
