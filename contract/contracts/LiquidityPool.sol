// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract LiquidityPool {
    address private tokenA;
    address private tokenB;
    uint256 private fee = 100; // 1% 手续费，以百分比为单位
    uint256 public totalSupply; // 总供应量

    constructor(address _tokenA, address _tokenB, uint256 initialSupplyA, uint256 initialSupplyB) {
        tokenA = _tokenA;
        tokenB = _tokenB;

        // 创建初始数量的代币
        if (tokenA != address(0)) {
            ERC20(tokenA).mint(address(this), initialSupplyA);
        }
        if (tokenB != address(0)) {
            ERC20(tokenB).mint(address(this), initialSupplyB);
        }

        // 更新总供应量
        totalSupply = initialSupplyA + initialSupplyB;
    }

    // 获取手续费
    function getFee(uint256 amount) public view returns (uint256) {
        return (amount * fee) / 10000; // 计算手续费，以百分比为单位，需要除以10000
    }

    // 添加流动性
    function addLiquidity(uint256 amountA, uint256 amountB) external {
        // 转移代币给流动性池合约
        if (tokenA != address(0)) {
            require(ERC20(tokenA).transferFrom(msg.sender, address(this), amountA), "Transfer failed for tokenA");
        }
        if (tokenB != address(0)) {
            require(ERC20(tokenB).transferFrom(msg.sender, address(this), amountB), "Transfer failed for tokenB");
        }
        // 更新总供应量
        totalSupply += amountA + amountB;
    }

    // 移除流动性
    function removeLiquidity(uint256 poolTokens) external returns (uint256, uint256) {
        // 检查用户持有的流动性代币数量是否足够
        require(poolTokens <= totalSupply, "Insufficient pool tokens");
        uint256 amountA = (poolTokens * ERC20(tokenA).balanceOf(address(this))) / totalSupply;
        uint256 amountB = (poolTokens * ERC20(tokenB).balanceOf(address(this))) / totalSupply;

        if (tokenA != address(0)) {
            require(ERC20(tokenA).transfer(msg.sender, amountA), "Transfer failed for tokenA");
        }
        if (tokenB != address(0)) {
            require(ERC20(tokenB).transfer(msg.sender, amountB), "Transfer failed for tokenB");
        }

        // 更新总供应量
        totalSupply -= poolTokens;

        return (amountA, amountB);
    }

    function swap(string memory tokenFrom, string memory tokenTo, uint256 amount) external returns (uint256) {
        address fromAddress;
        address toAddress;

        // 设置要交换的代币合约地址
        if (keccak256(abi.encodePacked(tokenFrom)) == keccak256(abi.encodePacked("tokenA"))) {
            fromAddress = tokenA;
            toAddress = tokenB;
        } else {
            fromAddress = tokenB;
            toAddress = tokenA;
        }

        // 检查代币余额是否足够，并转移代币
        require(ERC20(fromAddress).balanceOf(msg.sender) >= amount, "Insufficient balance");
        require(ERC20(fromAddress).transferFrom(msg.sender, address(this), amount), "Transfer failed for tokenFrom");

        // 计算交换后的代币数量，考虑手续费
        uint256 feeAmount = getFee(amount);
        uint256 transferAmount = amount - feeAmount;
        uint256 amountOut = (transferAmount * ERC20(toAddress).balanceOf(address(this))) / (ERC20(fromAddress).balanceOf(address(this)) + transferAmount);

        // 如果是 tokenTo，调用 transfer 函数将代币转账给用户
        require(ERC20(toAddress).transfer(msg.sender, amountOut), "Transfer failed for tokenTo");

        // 如果手续费不为0，转账手续费到合约账户
        if (feeAmount > 0) {
            require(ERC20(fromAddress).transfer(address(this), feeAmount), "Transfer failed for fee");
        }

        return amountOut;
    }

}
