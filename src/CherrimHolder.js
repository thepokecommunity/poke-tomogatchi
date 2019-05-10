import React from 'react';

import './styles/CherrimHolder.scss';

export default function CherrimHolder(props) {


  return (
    <div className="container">
      <div className="emotions">
        <img
          alt={props.emotion}
          src={`${process.env.PUBLIC_URL}/emotions/${props.emotion}.gif`}
        />
      </div>
      <div className="cherrim">
        <img
          alt="Cherrim!"
          src={`${process.env.PUBLIC_URL}/cherrim_${props.form}.png`}
        />
      </div>
    </div>
  );
}