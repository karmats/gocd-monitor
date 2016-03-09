import React from 'react';

import RaisedButton from 'material-ui/lib/raised-button';
import { CircularProgress } from 'material-ui/lib';
import { Card, CardHeader, CardText } from 'material-ui/lib/card';
import Colors from 'material-ui/lib/styles/colors';

import Moment from 'moment';

const weatherIcons = ['mdi-weather-sunny', 'mdi-weather-cloudy', 'mdi-weather-pouring', 'mdi-weather-lightning', 'mdi-weather-partlycloudy'];

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

  randomWeatherIcon() {
    let idx = Math.floor(Math.random() * weatherIcons.length);
    return weatherIcons[idx]; 
  }

  render() {
    let pipeline = this.props.pipeline;
    let progress = pipeline.status === 'building' ?  <CircularProgress className="progress" color="#fff" size={0.5} /> : null;
    return (
      <Card style={pipeline.status === 'failed' ? styles.cardFailure : styles.cardSuccess}>
        <CardHeader
          className="buildtitle"
          title={pipeline.id}
          titleStyle={styles.cardTitle}
          subtitle={pipeline.status}
          subtitleStyle={styles.cardSubTitle}>
          <i className={this.randomWeatherIcon() + ' mdi mdi-48px buildstatus'}></i>
        </CardHeader>
        <CardText>
          <div className="buildinfo">
            <div>
              <p>
                <i className="mdi mdi-clock mdi-24px"></i>
                <span>{ Moment(pipeline.buildtime).fromNow() }</span>
              </p>
              <p>
                <i className="mdi mdi-worker mdi-24px"></i>
                <span>{pipeline.author}</span>
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
