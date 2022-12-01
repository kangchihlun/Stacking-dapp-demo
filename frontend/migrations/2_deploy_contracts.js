const Web3 = require('web3');
const LPFactory = artifacts.require('LPFactory');
const RewardToken = artifacts.require('RewardToken');
const StakingManager = artifacts.require('StakingManager');
require('dotenv').config();


const createStakingPool = async(stakingManager,stakeTokenAddress) => {
  console.log(`Create staking pool: ${stakeTokenAddress} ...`);
  return await stakingManager.createPool(stakeTokenAddress);
}

async function grantRewardTokenMinterRole(
  stakingManagerAddress,
  rewardToken
) {
  console.log("Grant reward token minter role...");
  return new Promise(async (resolve,reject) => {
    const tx = await rewardToken.grantRole(
      Web3.utils.soliditySha3({ type: 'string', value: "MINTER_ROLE" }),
      //solidityKeccak256(["string"], ["MINTER_ROLE"]),
      stakingManagerAddress
    );
    if( tx ){
        resolve()
    }
  })
}



module.exports = async function(deployer, network, accounts) {
  // await deployer.deploy(TokenStaking, testToken.address);

  await deployer.deploy(LPFactory,"LP1","LP1",(BigInt("1000000000000")).toString());
  const LP1_deployed = await LPFactory.deployed();
  await deployer.deploy(LPFactory,"LP2","LP2",(BigInt("1000000000000")).toString());
  const LP2_deployed = await LPFactory.deployed();
  await deployer.deploy(LPFactory,"LP3","LP3",(BigInt("1000000000000")).toString());
  const LP3_deployed = await LPFactory.deployed();

  const LP1Address = LP1_deployed.address;
  const LP2Address = LP2_deployed.address;
  const LP3Address = LP3_deployed.address;

  console.log(`LP3Address ${LP3Address}`);

  
  await deployer.deploy(RewardToken);
  const rewardToken_deployed = await RewardToken.deployed();
  console.log("RewardToken address:", rewardToken_deployed.address);

  await deployer.deploy(StakingManager,rewardToken_deployed.address,Web3.utils.toWei('200', 'ether'));
  const StakingManager_deployed = await StakingManager.deployed();


  // Grant Reward Token Minter to Staking Manager
  await grantRewardTokenMinterRole(StakingManager_deployed.address, rewardToken_deployed);

  // Create LP Farming Pool
  await createStakingPool(StakingManager_deployed, LP1Address);
  await createStakingPool(StakingManager_deployed, LP2Address);
  await createStakingPool(StakingManager_deployed, LP3Address);

  // //deploying staking contract, passing token address
  // await deployer.deploy(TokenStaking, testToken.address);
  // const tokenStaking = await TokenStaking.deployed();

  // //transfer 500k TestToken to smart contract for rewards
  // await testToken.transfer(tokenStaking.address, '500000000000000000000000');

  //   sending 1000 TestTokens to User and Creator for test , investor is second address
  //await testToken.transfer(accounts[1], '1000000000000000000000');
};
