/**
 * Pipeline card
 */

import React from 'react';

import { Card, CardHeader, CardText } from 'material-ui/Card';
import * as Colors from 'material-ui/styles/colors';

import Moment from 'moment';

// Weather icon indicator
const weatherIconStatuses = ['sunny', 'partlycloudy', 'cloudy', 'cloudy', 'pouring', 'lightning'];

const styles = {
  cardSuccess: {
    background: Colors.greenA700,
    marginBottom: '1rem'
  },
  cardFailure: {
    background: Colors.redA700,
    marginBottom: '1rem'
  },
  cardActive: {
    background: Colors.lightBlueA700,
    marginBottom: '1rem'
  },
  cardInactive: {
    background: Colors.yellowA700,
    marginBottom: '1rem'
  },
  cardTitle: {
    color: '#fff',
    fontSize: '1.2em'
  },
  cardSubTitle: {
    color: '#fff',
    fontSize: '1em',
    fontWeight: 100
  },
  progress: {
    color: '#fff',
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
    switch(stage.status) {
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
    if (pipeline.paused) {
      return 'paused';
    } else if (pipeline.stageresults.some(result => result.status === 'building')) {
      return 'building';
    } else if (pipeline.stageresults.some(result => result.status === 'failed')) {
      return 'failed';
    } else {
      return 'passed';
    }
  }


  render() {
    let pipeline = this.props.pipeline;
    let status = Pipeline.status(pipeline);

    let stages = (
      <div className='col-xs-6'>
        <p className="right">
          <span>{(status === 'failed' || status === 'building') ? pipeline.stageresults.reduce((p, c) => {
            if (c.status === 'failed' || c.status === 'building') {
              return c.name;
            }
            return p;
          }, ' ') : ' '}</span>
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
              return <i key={stage.name} className={'mdi mdi-' + this.stageIcon(stage)}></i>
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
    }
    return (
      <Card style={style}>
        <CardHeader
          className="buildtitle"
          title={pipeline.name}
          titleStyle={styles.cardTitle}
          subtitle={status}
          subtitleStyle={styles.cardSubTitle}>
          <i className={'mdi-weather-' + this.weatherIcon(pipeline) + ' mdi mdi-48px buildstatus'}></i>
        </CardHeader>
        <CardText>
          <div className="buildinfo">
            <div className="col-xs-6">
              <p>
                <i className="mdi mdi-clock mdi-24px"></i>
                <span>{ Moment(pipeline.buildtime).fromNow() }</span>
              </p>
              <p>
                <i className="mdi mdi-worker mdi-24px"></i>
                <span>{pipeline.author}</span>
              </p>
            </div>
            {stages}
          </div>
        </CardText>
      </Card>
    );
  }
}
