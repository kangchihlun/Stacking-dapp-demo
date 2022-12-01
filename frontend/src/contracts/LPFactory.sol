//SPDX-License-Identifier: Unlicense
pragma solidity 0.8.4;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract LPFactory is ERC20 
{
    constructor(string memory _name, string memory _symbol, uint256 _initial_supply) 
        ERC20(_name, _symbol) 
    {
        _mint(msg.sender, _initial_supply * (10 ** decimals()));
    }
}
