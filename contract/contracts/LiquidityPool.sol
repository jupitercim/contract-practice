// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
// import "./LuckyToken.sol";
// import "./MikiToken.sol";

contract LiquidityPool {
    address private tokenA;
    address private tokenB;
    uint256 private fee = 2; // 2% 手续费，以百分比为单位
    uint256 public totalSupply; // 总供应量
    uint256 public reserve0; // tokenA 数量
    uint256 public reserve1; // tokenB 数量

    constructor(address _tokenA, address _tokenB) {
        require(_tokenA != address(0) && _tokenB != address(0), "Invalid token address");
        tokenA = _tokenA;
        tokenB = _tokenB;
    }

    // 获取手续费
    function getFee(uint256 amount) public view returns (uint256) {
        return (amount * fee) / 100; // 计算手续费，以百分比为单位，需要除以10000
    }

    function _update(uint balance0, uint balance1) private {
        reserve0 = uint256(balance0);
        reserve1 = uint256(balance1);
        totalSupply = reserve0 + reserve1;
    }

    // 添加流动性
    function addLiquidity(uint256 amountA, uint256 amountB) external {
        require(amountA > 0 || amountB > 0, "Invalid amounts: both cannot be zero");
        uint256 balance0;
        uint256 balance1;

        if (reserve0 > 0 && reserve1 > 0) {
            require(amountA * reserve1 == amountB * reserve0, "Unbalanced amounts: must be in current ratio");
        }
        require(ERC20(tokenA).transferFrom(msg.sender, address(this), amountA), "Transfer failed for tokenA");
        require(ERC20(tokenB).transferFrom(msg.sender, address(this), amountB), "Transfer failed for tokenB");

        balance0 = reserve0 + amountA;
        balance1 = reserve1 + amountB;
        _update(balance0, balance1);
    }

       // 移除流动性
    function removeLiquidity(uint256 poolTokens) external returns (uint256, uint256) {
        require(poolTokens <= totalSupply, "Insufficient pool tokens");
        uint256 amountA = (poolTokens * ERC20(tokenA).balanceOf(address(this))) / totalSupply;
        uint256 amountB = (poolTokens * ERC20(tokenB).balanceOf(address(this))) / totalSupply;

        if (tokenA != address(0)) {
            require(ERC20(tokenA).transfer(msg.sender, amountA), "Transfer failed for tokenA");
        }
        if (tokenB != address(0)) {
            require(ERC20(tokenB).transfer(msg.sender, amountB), "Transfer failed for tokenB");
        }

        totalSupply -= poolTokens;

        return (amountA, amountB);
    }

    function calculateSwapAmount(address tokenType, uint256 inputAmount) public view returns (uint256, uint256) {
        require(inputAmount > 0, "Input amount must be greater than 0");
        require(reserve0 > 0 && reserve1 > 0, "Insufficient liquidity");

        uint256 outputAmount;
        uint256 feeAmount = inputAmount * fee / 100;
        uint256 amountMinusFee = inputAmount * (100 - fee) / 100;
        if (tokenType == tokenA) {
            outputAmount = (amountMinusFee * reserve1) / (reserve0 + amountMinusFee);
        } else {
            outputAmount = (amountMinusFee * reserve0) / (reserve1 + amountMinusFee);
        }

        return (outputAmount, feeAmount);
    }


    function swap(address userWallet, address tokenFrom, address tokenTo, uint256 amount) external {
        require(amount > 0, "Input amount must be greater than 0");
        require(tokenFrom == tokenA || tokenFrom == tokenB, "Invalid tokenFrom address");
        require(tokenTo == tokenA || tokenTo == tokenB, "Invalid tokenTo address");
        require(tokenFrom != tokenTo, "tokenFrom and tokenTo must be different");

        require(ERC20(tokenFrom).balanceOf(userWallet) >= amount, "Insufficient balance");
        require(ERC20(tokenFrom).transferFrom(msg.sender, address(this), amount), "Transfer failed for tokenFrom");
        uint256 poolBalanceTokenA = ERC20(tokenA).balanceOf(address(this));
        uint256 poolBalanceTokenB = ERC20(tokenB).balanceOf(address(this));
        uint256 balance0;
        uint256 balance1;

        (uint256 amountOut,) = calculateSwapAmount(tokenFrom, amount);
        require(ERC20(tokenTo).transfer(userWallet, amountOut), "Transfer failed for tokenTo");

        if (tokenFrom == tokenA) {
            balance0 = poolBalanceTokenA + amount;
            balance1 = poolBalanceTokenB - amountOut;
        } else {
            balance0 = poolBalanceTokenA - amountOut;
            balance1 = poolBalanceTokenB + amount;
        }

        _update(balance0, balance1);
    }

    function sync() external {
        _update(ERC20(tokenA).balanceOf(address(this)), ERC20(tokenB).balanceOf(address(this)));
    }
}
