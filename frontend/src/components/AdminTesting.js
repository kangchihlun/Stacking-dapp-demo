import React from 'react';
import classes from './AdminTesting.module.css';

const AdminTesting = (props) => {
  return (
    <div className={classes.for_testing}>
      
      <button onClick={props.claimTst}>Claim for 1000 LP{props.page+1} token </button>
      &nbsp; &nbsp;
      {/* <button onClick={props.redistributeRewards}>
        {props.page === 1
          ? `Redistribute rewards (Admin)`
          : `Custom redistribution (Admin)`}
      </button> */}
      <div className={classes.network}>
        <p>
          Selected Network: <b>{props.network.name}</b>
          &nbsp; id: <b>{props.network.id}</b>
        </p>
        <p>Contract Balance: {props.contractBalance} TestToken (Tst) </p>
      </div>
    </div>
  );
};

export default AdminTesting;
