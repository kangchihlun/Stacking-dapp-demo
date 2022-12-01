import React, { useState } from 'react';
import classes from './Navigation.module.css';

const Navigation = (props) => {
  const [poolStatus, setPoolStatus] = useState('default');

  const changePool = (val) => {
    if (val === poolStatus) {
    } else {
      console.log(`setPoolStatus ${val}`);
      setPoolStatus(val);
      props.changePage(val);
    }
  };

  return (
    <div className={classes.navigation}>
      <button
        className={
          poolStatus === 'default'
            ? classes.buttonActive
            : classes.buttonNonActive
        }
        onClick={() => {
          changePool('default');
        }}
      >
        {props.apy[0]}% (APY)
      </button>
      <button
        className={
          poolStatus === 'custom'
            ? classes.buttonActive
            : classes.buttonNonActive
        }
        onClick={() => {
          changePool('custom');
        }}
      >
        {props.apy[1]}% (APY)
      </button>
      <button
        className={
          poolStatus === 'custom2'
            ? classes.buttonActive
            : classes.buttonNonActive
        }
        onClick={() => {
          changePool('custom2');
        }}
      >
        {props.apy[2]}% (APY)
      </button>
    </div>
  );
};

export default Navigation;
