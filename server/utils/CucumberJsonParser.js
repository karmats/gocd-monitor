/**
 * Parses a cucumber test report file
 */
export default class CucumberJsonParser {

  /**
   * @return Parsed cucumber test report
   */
  static parse(testReport) {
    // Check that this actually is a cucumber report
    if (Array.isArray(testReport) && testReport.length > 0 && testReport[0].elements) {
      return testReport.map((feature) => {
        return {
          name: feature.name,
          scenarios: feature.elements.map((scenario) => {
            return {
              name: scenario.name,
              steps: scenario.steps.map((step) => {
                return {
                  name: step.keyword + step.name,
                  result: step.result.status,
                  duration: step.result.duration,
                  error: step.result.error_message
                }
              })
            }
          })
        };
      });
    }
    return [];
  }
}
