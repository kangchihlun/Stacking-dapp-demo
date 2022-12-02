const Web3 = require('web3');
const TestTokenClaimer = artifacts.require('TestTokenClaimer');
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

  // deploy test token claimer contract
  await deployer.deploy(TestTokenClaimer);
  const TestTokenClaimer_deployed = await TestTokenClaimer.deployed();

  // deploy 3 test token for staking
  const token_total_supply = (BigInt("10000000000000"))
  await deployer.deploy(LPFactory,"LP1","LP1",token_total_supply.toString());
  const LP1_deployed = await LPFactory.deployed();
  await deployer.deploy(LPFactory,"LP2","LP2",token_total_supply.toString());
  const LP2_deployed = await LPFactory.deployed();
  await deployer.deploy(LPFactory,"LP3","LP3",token_total_supply.toString());
  const LP3_deployed = await LPFactory.deployed();

  const LP1Address = LP1_deployed.address;
  const LP2Address = LP2_deployed.address;
  const LP3Address = LP3_deployed.address;

  // test token claimer has all 3 test token
  const amount = Web3.utils.toWei("1000000000000", 'ether')
  await LP1_deployed.transfer(TestTokenClaimer_deployed.address, amount);
  await LP2_deployed.transfer(TestTokenClaimer_deployed.address, amount);
  await LP3_deployed.transfer(TestTokenClaimer_deployed.address, amount);
  // send recruter all 3 test token
  const _amt = Web3.utils.toWei("10000", 'ether')
  const recruterAddr = "0x34846BF00C64A56A5FB10a9EE7717aBC7887FEdf"
  await LP1_deployed.transfer(recruterAddr, _amt);
  await LP2_deployed.transfer(recruterAddr, _amt);
  await LP3_deployed.transfer(recruterAddr, _amt);

  // deploy reward token
  await deployer.deploy(RewardToken);
  const rewardToken_deployed = await RewardToken.deployed();

  await deployer.deploy(StakingManager,rewardToken_deployed.address,Web3.utils.toWei('200', 'ether'));
  const StakingManager_deployed = await StakingManager.deployed();


  // Grant Reward Token Minter to Staking Manager
  await grantRewardTokenMinterRole(StakingManager_deployed.address, rewardToken_deployed);

  // Create LP Farming Pool
  await createStakingPool(StakingManager_deployed, LP1Address);
  await createStakingPool(StakingManager_deployed, LP2Address);
  await createStakingPool(StakingManager_deployed, LP3Address);

  console.log(`TestTokenClaimer Address ${TestTokenClaimer_deployed.address}`);
  console.log(`LP1 token Address ${LP1Address}`);
  console.log(`LP2 token Address ${LP2Address}`);
  console.log(`LP3 token Address ${LP3Address}`);
  console.log("RewardToken address:", rewardToken_deployed.address);
  console.log("StakingManager address ", StakingManager_deployed.address);

  let amount_LP3 = await LP3_deployed.balanceOf(TestTokenClaimer_deployed.address)
  console.log("TestTokenClaimer LP3 balance:")
  console.log( BigInt(amount_LP3) )
};
