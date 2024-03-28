import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const LiquidityPoolModule = buildModule("LiquidityPoolModule", (m) => {

  const defaultTokenA = 1000;
  const defaultTokenB = 1000;


  const tokenA = m.getParameter("tokenA", defaultTokenA);
  const tokenB = m.getParameter("tokenB", defaultTokenB);


  const liquidityPool = m.contract("LiquidityPool", [tokenA, tokenB]);

  return { liquidityPool };
});

export default LiquidityPoolModule;
