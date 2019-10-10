import moment from 'moment';
import Pipeline from './Pipeline';

/**
* Sort pipelines by date and filter out pipelines without data
*
* @param   {Array}   pipelines         The pipelines to sort
* @param   {Array}   disabledPipelines Pipelines that are disabled
* @param   {string}  sortOrder         The sort order, 'buildtime' or 'status'
* @param   {string}  filterRegex       Regular expression to filter for
* @return  {Array}   Sorted pipelines
*/
export const sortAndFilterPipelines = (pipelines, disabledPipelines, sortOrder, filterRegex) => {
  const pipelineIsValid = p => p && p.name
  const pipelineIsNotDisabled =  p => disabledPipelines.indexOf(p.name) < 0
  const pipelineMatchesRegex = p => p.name.match(filterRegex)
 
   const activePipelines = pipelines.filter(pipelineIsValid)
    .filter(pipelineIsNotDisabled)
    .filter(pipelineMatchesRegex);
 
  // Add "time ago" moment string
  activePipelines.forEach((pipeline) => {
    pipeline.timeago = moment(pipeline.buildtime).fromNow();
  });
 
  const sortByBuildTime = (a, b) => {
    return a.buildtime > b.buildtime ? -1 : 1;
  };
 
  if (sortOrder === 'buildtime') {
    return activePipelines.sort(sortByBuildTime);
  } else {
    return activePipelines.sort((a, b) => {
      const aStatus = Pipeline.status(a);
      const bStatus = Pipeline.status(b);
 
      if (aStatus === bStatus) {
        return sortByBuildTime(a, b);
      }
 
      const statusIndex = {
        building: -1,
        failed: 0,
        cancelled: 1,
        passed: 2,
        paused: 3,
        unknown: 3,
      }
      return statusIndex[aStatus] - statusIndex[bStatus] ;
    });
  }
 }
