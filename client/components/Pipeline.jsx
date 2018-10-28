/**
 * Pipeline card
 */

import React from 'react';

import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import * as Colors from '@material-ui/core/colors';
import Typography from '@material-ui/core/Typography';

import { goServerUrl, showBuildLabels, linkToPipelineInGo } from '../../app-config';

const pipelineHistoryUrl = goServerUrl + '/go/tab/pipeline/history/';

// Weather icon indicator
const weatherIconStatuses = ['sunny', 'partlycloudy', 'cloudy', 'cloudy', 'pouring', 'lightning'];

const white = '#fff';
const styles = {
  cardSuccess: {
    background: Colors.green.A700,
    marginBottom: '1rem'
  },
  cardFailure: {
    background: Colors.red.A700,
    marginBottom: '1rem'
  },
  cardActive: {
    background: Colors.lightBlue.A700,
    marginBottom: '1rem'
  },
  cardInactive: {
    background: Colors.yellow.A700,
    marginBottom: '1rem'
  },
  cardCancelled: {
    background: Colors.orange.A700,
    marginBottom: '1rem'
  },
  cardContainer: {
    position: 'relative',
    paddingBottom: '0.5rem'
  },
  cardTitle: {
    color: white,
    fontSize: '1.2em'
  },
  cardLabel: {
    fontWeight: 'normal'
  },
  cardSubTitle: {
    color: white,
    fontSize: '1em',
    fontWeight: 100
  },
  progress: {
    color: white,
    float: 'right'
  }
};

export default class Pipeline extends React.Component {

  /**
   * Calculates which weather icon to use for a pipeline based on pipeline heath.
   * This function was a bit more advanced back in the days, with api changes it got reduced to this.
   * Let's keep it for now
   *
   * @param   {Object}  pipeline  The pipeline
   * @return  {string}  Pre weather icon classname
   */
  weatherIcon(pipeline) {
    return weatherIconStatuses[pipeline.health];
  }

  /**
   * Calculates icon for stage visualization.
   *
   * @param   {Object}  stage   Stage with name and status
   * @return  {string}  Material design icon classname
   */
  stageIcon(stage) {
    switch (stage.status) {
      case 'unknown':
        return 'checkbox-blank-circle-outline';
      case 'failed':
        return 'close-circle';
      case 'cancelled':
        return 'close-circle-outline';
      default:
        return 'checkbox-blank-circle';
    }
  }

  /**
   * Calculate what status a pipeline has
   *
   * @param   {Object}  pipeline  The pipeline to calculate status for
   * @return  {string}  Status paused, building, failed or passed
   */
  static status(pipeline) {
    if (pipeline.pauseinfo && pipeline.pauseinfo.paused) {
      return 'paused';
    } else if (pipeline.stageresults.some(result => result.status === 'cancelled')) {
      return 'cancelled';
    } else if (pipeline.stageresults.some(result => result.status === 'building')) {
      return 'building';
    } else if (pipeline.stageresults.some(result => result.status === 'failed')) {
      return 'failed';
    } else {
      return 'passed';
    }
  }

  /**
   * @return {boolean}  true if the moment time ago string or any stage status has changed
   */
  shouldComponentUpdate(nextProps) {
    if (nextProps.pipeline.timeago !== this.props.pipeline.timeago) {
      return true;
    }
    const thisStages = this.props.pipeline.stageresults;
    const nextStages = nextProps.pipeline.stageresults;
    for (let i = 0; i < thisStages.length; i++) {
      if (thisStages[i].status !== nextStages[i].status) {
        return true;
      }
    }
    return false;
  }

  render() {
    const { pipeline } = this.props;
    const status = Pipeline.status(pipeline);

    const stages = (
      <div className='col-xs-6'>
        <p className="right">
          <span>{(status === 'failed' || status === 'building') ? pipeline.stageresults.reduce((p, c) => {
            if (c.status === 'failed' || c.status === 'building') {
              return c.name;
            }
            return p;
          }, ' ') : (status === 'paused' ? pipeline.pauseinfo.pause_reason : ' ')}</span>
        </p>
        <p className="right">
          {
            pipeline.stageresults.map((stage) => {
              // Build in progress spinner
              if (stage.status === 'building') {
                return (<span key={stage.name} className="loader">
                  <svg className="circular" viewBox="25 25 50 50">
                    <circle className="path" cx="50" cy="50" r="20" fill="none" strokeWidth="4" strokeMiterlimit="10" />
                  </svg>
                </span>);
              } else {
                return <i key={stage.name} className={'mdi mdi-14px mdi-' + this.stageIcon(stage) }></i>
              }
            })
          }
        </p>

      </div>);

    let style = styles.cardActive;
    switch (status) {
      case 'failed':
        style = styles.cardFailure;
        break;
      case 'paused':
        style = styles.cardInactive;
        break;
      case 'passed':
        style = styles.cardSuccess;
        break;
      case 'cancelled':
        style = styles.cardCancelled;
        break;
    }

    let buildStatus = status;

    if (showBuildLabels) {
      buildStatus = <div>{status}<span style={styles.cardLabel}> : {pipeline.label}</span></div>;
    }

    const card = (<Card style={style}>
      <CardContent style={styles.cardContainer}>
        <Typography variant="h5" className="buildtitle" style={styles.cardTitle}>
          {pipeline.name}
        </Typography>
        <i className={'mdi-weather-' + this.weatherIcon(pipeline) + ' mdi mdi-48px buildstatus'}></i>
        <Typography style={styles.cardSubTitle} color="textSecondary">
          {buildStatus}
        </Typography>

        <div className="buildinfo">
          <div className="col-xs-6">
            <p>
              <i className="mdi mdi-clock mdi-24px"></i>
              <span>{ pipeline.timeago }</span>
            </p>
            <p>
              <i className="mdi mdi-worker mdi-24px"></i>
              <span>{status === 'paused' ? pipeline.pauseinfo.paused_by : pipeline.author}</span>
            </p>
          </div>
          {stages}
        </div>
      </CardContent>
    </Card>);


    return linkToPipelineInGo ? (
      <a href={pipelineHistoryUrl + pipeline.name} target="_blank">
        {card}
      </a>
    ) : card;
  }
}
