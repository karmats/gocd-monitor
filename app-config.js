var config = {
    // Name of built js-file
    jsFilename: 'app.js',
    // Port to run the application on
    port: process.env.gocdmonitor_port || 3000,
    // Webpack dev port to run on
    devPort: 3001,
    // Set to true to use https on the post specified above. If set to true, certificate and key paths must be also defined
    useHttps: process.env.gocdmonitor_use_https === "true",
    // Certificate for https
    httpsCertificatePath: process.env.gocdmonitor_certificate_path || './server/cert/server.cert',
    // Key for https
    httpsKeyPath: process.env.gocdmonitor_key_path || './server/cert/server.key',
    // Url for your go server
    goServerUrl: process.env.gocdmonitor_gocd_host || 'https://ci.example.com',
    // Go user to use for communication with go server
    goUser: process.env.gocdmonitor_gocd_user || '',
    // Password for go user
    goPassword: process.env.gocdmonitor_gocd_password || '',
    // How often data from go should be refreshed in seconds
    goPollingInterval: process.env.gocdmonitor_gocd_poll_interval || 30,
    // How often pipeline structure data should be refreshed in seconds
    goCheckPipelinesInterval: process.env.gocdmonitor_gocd_check_pipelines_interval || 24 * 60 * 60,
    // If > 0 switches between pipeline and test results page every n seconds
    switchBetweenPagesInterval: process.env.gocdmonitor_gocd_switch_pages_interval || 0,
    // Whether to group pipelines
    groupPipelines: process.env.gocdmonitor_gocd_grouppipelines === "true",
    // How to sort pipelines by default (buildtime, status) - can be overridden in the admin UI
    defaultSortOrder: process.env.gocdmonitor_default_sort_order || 'buildtime',
    // Which pipelines to hide - can be overridden in the admin UI
    defaultDisabledPipelines: (process.env.gocdmonitor_default_hidden_pipelines || "").split(",").filter((val) => val) || [],

    // --- Client ---
    // Enable dark theme
    enableDarkTheme: process.env.gocdmonitor_enable_dark_theme === "true",
    // Whether to display build labels
    showBuildLabels: process.env.gocdmonitor_gocd_showbuildlabels === "true",
    // Whether to link to pipeline in GoCD on click
    linkToPipelineInGo: process.env.gocdmonitor_gocd_linktopipelineingo === 'true',
    // Whether to hide the weather icons
    hideWeatherIcons: process.env.gocdmonitor_hide_weather_icons === 'true',
}
module.exports = config;
