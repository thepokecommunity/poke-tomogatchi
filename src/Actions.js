import React from 'react';

import { Forms, Emotions } from './App';

class Actions extends React.Component {
  render() {
    const emotionOptions = Object.values(Emotions).map(emotion => (
      <option key={emotion} value={emotion}>
        {emotion}
      </option>
    ));

    const formOptions = Object.values(Forms).map(form => (
      <option key={form} value={form}>
        {form}
      </option>
    ));

    return (
      <div className="Actions">
        <select onChange={this.changeEmotion} defaultValue={this.props.emotion}>
          {emotionOptions}
        </select>

        <select onChange={this.changeForm} defaultValue={this.props.form}>
          {formOptions}
        </select>
      </div>
    );
  }

  changeEmotion = (e) => {
    this.props.changeEmotion(e.target.value);
  }

  changeForm = (e) => {
    this.props.changeForm(e.target.value);
  }
}

export default Actions;