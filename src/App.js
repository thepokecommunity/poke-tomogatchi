import React, { Component } from 'react';

import CherrimHolder from './CherrimHolder';
import Actions from './Actions';

export const Forms = {
  SUNSHINE: 'sunshine',
  OVERCAST: 'overcast',
};

export const Emotions = {
  DOTS: 'dots',
  TALKATIVE: 'talkative',
};

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      emotion: Emotions.DOTS,
      form: Forms.OVERCAST,
    };
  }

  render() {
    return (
      <div className="App">
        <CherrimHolder
          {...this.state}
        />

        <Actions
          {...this.state}
          changeEmotion={this.changeEmotion}
          changeForm={this.changeForm}
        />
      </div>
    );
  }

  changeEmotion = (emotion) => {
    this.setState({ emotion });
  }

  changeForm = (form) => {
    this.setState({ form });
  }
}

export default App;