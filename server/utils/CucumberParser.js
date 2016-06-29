/**
 * Parses a cucumber test report file
 */
export default class CucumberParser {

  /**
   * @return Parsed cucumber test report
   */
  static parse(testReport) {
    // Check that this actually is a cucumber report
    if (Array.isArray(testReport) && testReport.length > 0 && testReport[0].elements) {
      return {
        features: testReport.map((feature) => {
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
          }
        })
      }
    }
    return null;
  }

  /**
   * Converts multiple cucumber result files to database object
   * 
   * @param {Object}  result    Parsed cucumber from above function
   * @param {number}  timestamp Test time
   */
  static cucumberResultToDbObject(result, timestamp) {
    const cucumberResult = result.filter(res => res.type === 'cucumber');
    if (cucumberResult.length > 0) {
      // Concatenate the features from all cucumber tests
      const cucumber = cucumberResult.reduce((acc, c) => {
        acc.features = acc.features.concat(c.features);
        return acc;
      }, { features: [] });

      // Test time 
      cucumber.timestamp = timestamp;
      return cucumber;
    }
    return null;
  }
}
