//SPDX-License-Identifier: Unlicense
pragma solidity 0.8.4;


import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./RewardToken.sol";

contract TestTokenClaimer is Ownable{
    using SafeERC20 for IERC20; // Wrappers around ERC20 operations that throw on failure

    //cliam test 1000 Tst (for testing purpose only !!)
    function claimTst(address testToken) public {
        uint256 tst = 1000000000000000000000;
        require(IERC20(testToken).balanceOf(address(this))>tst ,"pool drained!");
        address recipient = msg.sender;
        uint256 balance = tst;
        IERC20(testToken).transfer(recipient, balance);
    }
}