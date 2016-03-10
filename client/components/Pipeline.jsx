/**
 * Pipeline card
 */

import React from 'react';

import RaisedButton from 'material-ui/lib/raised-button';
import { CircularProgress } from 'material-ui/lib';
import { Card, CardHeader, CardText } from 'material-ui/lib/card';
import Colors from 'material-ui/lib/styles/colors';

import Moment from 'moment';

// Weather icon indicator
const weatherIcons = ['mdi-weather-sunny', 'mdi-weather-partlycloudy', 'mdi-weather-cloudy', 'mdi-weather-pouring', 'mdi-weather-lightning'];

// FIXME: Break out to style.css
const styles = {
  cardSuccess: {
    background: Colors.greenA700,
    marginBottom: '1rem'
  },
  cardFailure: {
    background: Colors.redA700,
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
   * Calculates which weather icon to use for a pipeline based on 5 latest build results
   * 
   * @param pipeline
   */
  weatherIcon(pipeline) {
    let idx = pipeline.results.reduce((p, c) => {
      if (c.status === 'failed') {
        p++;
      }
      return p;
    }, 0);
    return weatherIcons[idx]; 
  }

  render() {
    let pipeline = this.props.pipeline;
    let latestResult = pipeline.results[0];
    let progress = latestResult.status === 'building' ?  <CircularProgress className="progress" color="#fff" size={0.5} /> : null;
    return (
      <Card style={latestResult.status === 'failed' ? styles.cardFailure : styles.cardSuccess}>
        <CardHeader
          className="buildtitle"
          title={pipeline.id}
          titleStyle={styles.cardTitle}
          subtitle={latestResult.status}
          subtitleStyle={styles.cardSubTitle}>
          <i className={this.weatherIcon(pipeline) + ' mdi mdi-48px buildstatus'}></i>
        </CardHeader>
        <CardText>
          <div className="buildinfo">
            <div>
              <p>
                <i className="mdi mdi-clock mdi-24px"></i>
                <span>{ Moment(latestResult.buildtime).fromNow() }</span>
              </p>
              <p>
                <i className="mdi mdi-worker mdi-24px"></i>
                <span>{latestResult.author}</span>
              </p>
            </div>
            <div>
              {progress}
            </div>
          </div>
        </CardText>
      </Card>
    );
  }
}
