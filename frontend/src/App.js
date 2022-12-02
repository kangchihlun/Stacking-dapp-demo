import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import classes from './App.module.css';
import LPFactory from './abis/LPFactory.json';
import TestTokenClaimer from './abis/TestTokenClaimer.json';
import StakingManager from './abis/StakingManager.json';
import Staking from './components/Staking';
import AdminTesting from './components/AdminTesting';
import Navigation from './components/Navigation';
require('dotenv').config()


const App = () => {
  const [account, setAccount] = useState('Connecting to Metamask..');
  const [network, setNetwork] = useState({ id: '0', name: 'none' });
  const [LPToken, setLPToken] = useState('');
  const [StakingManagerContract, setStakingManagerContract] = useState('');
  const [TestTokenClaimerContract, setTestTokenClaimerContract] = useState('');

  const [inputValue, setInputValue] = useState('');
  const [contractBalance, setContractBalance] = useState('0');
  const [totalStaked, setTotalStaked] = useState([0, 0 ,0]);
  const [myStake, setMyStake] = useState([0, 0, 0]);
  const [appStatus, setAppStatus] = useState(true);
  const [loader, setLoader] = useState(false);
  const [userBalance, setUserBalance] = useState('0');
  const [apy, setApy] = useState([0, 0, 0]);
  const [page, setPage] = useState(0);
  
  const poolID = {"default":0,"custom":1,"custom2":2};
  // todo : fetch stake info from contract directly.
  const poolToken = [
    "0x3f0a8CCDac3BEf5Dc4fAEB60170f926ECcfCBcCF",
    "0x1Ac61Cb49828107f259459C1Ff6365dfEb4F5612",
    "0xACA690b67737799AF5d428123A5bC2645AF16d3a"];
  useEffect(() => {
    //connecting to ethereum blockchain
    const ethEnabled = async () => {
      fetchDataFromBlockchain();
    };

    ethEnabled();
  }, []);

  const fetchDataFromBlockchain = async () => {
    if (window.ethereum) {
      // await window.ethereum.send('eth_requestAccounts');
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      window.web3 = new Web3(window.ethereum);

      //connecting to metamask
      let web3 = window.web3;
      const accounts = await web3.eth.getAccounts();
      setAccount(accounts[0]);

      //loading users network ID and name
      const networkId = await web3.eth.net.getId();
      const networkType = await web3.eth.net.getNetworkType();
      setNetwork({ ...network, id: networkId, name: networkType });

     
      //loading TestToken contract data
      // todo: load token data from staking manager
      const testTokenData = LPFactory.networks[networkId];
      console.log(`-##-## ${poolToken[page]}`);
      let testTokenContract = null;
      let tokenClaimer = null;
      let tokenStaking = null;

      if (testTokenData) {
        let web3 = window.web3;
        // LP token
        console.log(LPFactory.abi);
        testTokenContract = new web3.eth.Contract(
          LPFactory.abi,
          poolToken[page]
        );
        setLPToken(testTokenContract);
        
        //  fetching balance of Testtoken and storing in state
        let _balance = await testTokenContract.methods
          .balanceOf(accounts[0])
          .call();
        let convertedBalance = window.web3.utils.fromWei(
          _balance.toString(),
          'Ether'
        );
        setUserBalance(convertedBalance);
      } else {
        setAppStatus(false);
        window.alert(
          'TestToken contract is not deployed on this network, please change to testnet'
        );
      }
      

      //load Test TokenClaimer
      const tokenClaimerData = TestTokenClaimer.networks[networkId];
      if(tokenClaimerData) {
        let web3 = window.web3;
        tokenClaimer = new web3.eth.Contract(
          TestTokenClaimer.abi,
          tokenClaimerData.address
        );
        setTestTokenClaimerContract(tokenClaimer);
      }

      //loading StakingManager info
      const tokenStakingData = StakingManager.networks[networkId];
      if (tokenStakingData) {
        let web3 = window.web3;
        tokenStaking = new web3.eth.Contract(
          StakingManager.abi,
          tokenStakingData.address
        );
        setStakingManagerContract(tokenStaking);

        // fetch total staked
        if(testTokenContract){
          let totalStaked = await testTokenContract.methods
          .balanceOf(tokenStakingData.address)
          .call();
          let convertedTotalBalance = window.web3.utils.fromWei(
            totalStaked.toString(),
            'Ether'
          );
          setContractBalance(convertedTotalBalance)
        }
        

        // fetch my total staked
        // not implemented yet
        if(true){
          let myStake = await tokenStaking.methods
          .getStaked(page)
          .call();

          let convertedBalance = window.web3.utils.fromWei(
            myStake.toString(),
            'Ether'
          );
          setMyStake([convertedBalance, convertedBalance , convertedBalance]);
        }
        

        //checking totalStaked
        let tempTotalStaked = await tokenStaking.methods.getStaked(page).call();
        let convertedBalance = window.web3.utils.fromWei(
          tempTotalStaked.toString(),
          'Ether'
        );
        setTotalStaked([tempTotalStaked,tempTotalStaked,tempTotalStaked]);


        //  APY values from contract
        // let tempApy = ((await tokenStaking.methods.defaultAPY().call()) / 1000) * 365;
        // let tempcustomApy = ((await tokenStaking.methods.customAPY().call()) / 1000) * 365;
        // let tempcustomApy2 = ((await tokenStaking.methods.customAPY().call()*0.45) / 1000) * 365;
        // setApy([tempApy, tempcustomApy, tempcustomApy2]);


      } else {
        setAppStatus(false);
        window.alert(
          'TokenStaking contract is not deployed on this network, please change to testnet'
        );
      }

      //removing loader
      setLoader(false);
    } else if (!window.web3) {
      setAppStatus(false);
      setAccount('Metamask is not detected');
      setLoader(false);
    }
  };

  const inputHandler = (received) => {
    setInputValue(received);
  };

  const changePage = (_page) => {
    console.log(_page)
    setPage(poolID[_page]);
  };

  const stakeHandler = () => {
    if (!appStatus) {
    } else {
      if (!inputValue || inputValue === '0' || inputValue < 0) {
        setInputValue('');
      } else {
        setLoader(true);
        let convertToWei = window.web3.utils.toWei(inputValue, 'Ether');

        //aproving tokens for spending
        LPToken.methods
          .approve( StakingManagerContract._address, convertToWei)
          .send({ from: account })
          .on('transactionHash', (hash) => {

            StakingManagerContract.methods
              .deposit(page, convertToWei)
              .send({ from: account })
              .on('transactionHash', (hash) => {
                setLoader(false);
                fetchDataFromBlockchain();
              })
              .on('receipt', (receipt) => {
                setLoader(false);
                fetchDataFromBlockchain();
              })
              .on('confirmation', (confirmationNumber, receipt) => {
                setLoader(false);
                fetchDataFromBlockchain();
              });
            
          })
          .on('error', function(error) {
            setLoader(false);
            console.log('Error Code:', error.code);
            console.log(error.message);
          });
        setInputValue('');
      }
    }
  };

  const unStakeHandler = () => {
    if (!appStatus) {
    } else {
      setLoader(true);

      // let convertToWei = window.web3.utils.toWei(inputValue, 'Ether')
      StakingManagerContract.methods
        .withdraw(page)
        .send({ from: account })
        .on('transactionHash', (hash) => {
          setLoader(false);
          fetchDataFromBlockchain();
        })
        .on('receipt', (receipt) => {
          setLoader(false);
          fetchDataFromBlockchain();
        })
        .on('confirmation', (confirmationNumber, receipt) => {
          setLoader(false);
          fetchDataFromBlockchain();
        })
        .on('error', function(error) {
          console.log('Error Code:', error.code);
          console.log(error.message);
          setLoader(false);
        });
      setInputValue('');
    }
  };

  const redistributeRewards = async () => {
    if (!appStatus) {
    } else {
      setLoader(true);
      StakingManagerContract.methods
        .harvestRewards(page)
        .send({ from: account })
        .on('transactionHash', (hash) => {
          setLoader(false);
          fetchDataFromBlockchain();
        })
        .on('receipt', (receipt) => {
          setLoader(false);
          fetchDataFromBlockchain();
        })
        .on('confirmation', (confirmationNumber, receipt) => {
          setLoader(false);
          fetchDataFromBlockchain();
        })
        .on('error', function(error) {
          console.log('Error Code:', error.code);
          console.log(error.code);
          setLoader(false);
        });
    }
  };

  const redistributeCustomRewards = async () => {
    if (!appStatus) {
    } else {
      setLoader(true);
      StakingManagerContract.methods
        .customRewards()
        .send({ from: account })
        .on('transactionHash', (hash) => {
          setLoader(false);
          fetchDataFromBlockchain();
        })
        .on('receipt', (receipt) => {
          setLoader(false);
          fetchDataFromBlockchain();
        })
        .on('confirmation', (confirmationNumber, receipt) => {
          setLoader(false);
          fetchDataFromBlockchain();
        })
        .on('error', function(error) {
          console.log('Error Code:', error.code);
          console.log(error.code);
          setLoader(false);
        });
    }
  };

  const claimTst = async () => {
    if (!appStatus) {
    } else {
      if(TestTokenClaimerContract){
        setLoader(true);
        TestTokenClaimerContract.methods
        .claimTst( poolToken[page] )
        .send({ from: account })
        .on('transactionHash', (hash) => {
          setLoader(false);
          fetchDataFromBlockchain();
        })
        .on('receipt', (receipt) => {
          setLoader(false);
          fetchDataFromBlockchain();
        })
        .on('confirmation', (confirmationNumber, receipt) => {
          setLoader(false);
          fetchDataFromBlockchain();
        })
        .on('error', function(error) {
          console.log('Error Code:', error.code);
          console.log(error.code);
          setLoader(false);
        });
      }
      
    }
  };

  return (
    <div className={classes.Grid}>
      {loader ? <div className={classes.curtain}></div> : null}
      <div className={classes.loader}></div>
      <div className={classes.Child}>
        <Navigation apy={apy} changePage={changePage} />
        <div>
          <Staking
            account={account}
            totalStaked={ totalStaked[page] }
            myStake={ myStake[page]}
            stakerAddr={StakingManagerContract._address}
            userBalance={userBalance}
            unStakeHandler={unStakeHandler}
            stakeHandler={stakeHandler}
            inputHandler={inputHandler}
            apy={ apy[page] }
            page={page}
          />
        </div>
        <div className={classes.for_testing}>
          <AdminTesting
            network={network}
            tokenStakingContract={StakingManagerContract}
            contractBalance={contractBalance}
            redistributeRewards={
              page === 1 ? redistributeRewards : redistributeCustomRewards
            }
            claimTst={claimTst}
            page={page}
          />
        </div>
      </div>
    </div>
  );
};

export default App;
