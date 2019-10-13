import moment from "moment";

/**
 * Sort reports. Failed first, then time for latest report
 */
export const sortReports = (r1, r2) => {
  const latest1 = r1.history[r1.history.length - 1];
  const latest2 = r2.history[r2.history.length - 1];
  if (latest2.failed > 0 && latest1.failed <= 0) {
    return 1;
  }
  if (latest1.failed > 0 && latest2.failed <= 0) {
    return -1;
  }
  if (latest2.when > latest1.when) {
    return 1;
  }
  return -1;
};

// From latest report to this number of days back in time
const daysInterval = 20;
/**
 * Converts report data to report object
 */
export const convertReport = report => {
  // Report model
  const reportView = {
    id: report._id,
    title: `${report.pipeline} (${report.stage})`,
    subtitle: report.job
  };
  if (report.cucumber) {
    // Create chart history data
    reportView.history = report.cucumber
      // Sort by time ascending
      .sort((a, b) => {
        return a.timestamp > b.timestamp ? 1 : -1;
      })
      // Filter reports that are not in defined interval
      .filter((report, idx, arr) => {
        // Latest test case = last in list
        const latestTestTime = moment(arr[arr.length - 1].timestamp);
        const currTestTime = moment(report.timestamp);
        return latestTestTime.diff(currTestTime, "days") <= daysInterval;
      })
      .reduce((acc, c) => {
        const errors = [];
        let passed = 0;
        let failed = 0;
        c.features.forEach(feature => {
          feature.scenarios.forEach(scenario => {
            scenario.steps.forEach(step => {
              if (step.result === "passed") {
                passed++;
              } else {
                failed++;
                errors.push({
                  test: scenario.name,
                  message: step.error
                });
              }
            });
          });
        });
        acc.push({
          passed: passed,
          failed: failed,
          errors: errors,
          when: c.timestamp
        });
        return acc;
      }, []);
  }
  return reportView;
};
