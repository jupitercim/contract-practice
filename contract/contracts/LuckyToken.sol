// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract LuckyToken is ERC20 {
    uint8 private _decimals; // 代币精度

    constructor(string memory name, string memory symbol, uint256 initialSupply, address recipient) ERC20(name, symbol) {
        _decimals = 1; // 设置代币精度为 1
        _mint(recipient, initialSupply * (10 ** _decimals)); // 转换初始供应量为最小单位数量
    }

    function decimals() override public view returns (uint8) {
        return _decimals;
    }

    function mint(address account, uint256 amount) public {
        _mint(account, amount);
    }
}