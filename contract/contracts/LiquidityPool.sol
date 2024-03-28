// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract LiquidityPool {
    uint256 private tokenA;
    uint256 private tokenB;
    uint256 private fee = 100; // 1% 手续费，以百分比为单位

    constructor(uint256 _tokenA, uint256 _tokenB) {
        tokenA = _tokenA;
        tokenB = _tokenB;
    }

    // 获取手续费
    function getFee(uint256 amount) public view returns (uint256) {
        return (amount * fee) / 10000; // 计算手续费，以百分比为单位，需要除以10000
    }

    // 添加流动性
    function addLiquidity(uint256 amountA, uint256 amountB) external {
        tokenA += amountA;
        tokenB += amountB;
    }

    // 移除流动性
    function removeLiquidity(uint256 poolTokens) external returns (uint256, uint256) {
        uint256 amountA = (tokenA * poolTokens) / (tokenA + tokenB);
        uint256 amountB = (tokenB * poolTokens) / (tokenA + tokenB);
        tokenA -= amountA;
        tokenB -= amountB;
        return (amountA, amountB);
    }

    // 交易
    function swap(string memory tokenFrom, string memory tokenTo, uint256 amount) external returns (uint256) {
        uint256 amountOut;
        if (keccak256(abi.encodePacked(tokenFrom)) == keccak256(abi.encodePacked("tokenA"))) {
            amountOut = (amount * tokenB) / tokenA;
            tokenA += amount;
            tokenB -= amountOut;
        } else {
            amountOut = (amount * tokenA) / tokenB;
            tokenB += amount;
            tokenA -= amountOut;
        }
        return amountOut - getFee(amountOut);
    }
}
