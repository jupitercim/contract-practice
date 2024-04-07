import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const LiquidityPoolModule = buildModule('LiquidityPoolModule', m => {
  const LiquidityPool = m.contract("LiquidityPool", ['0x5FbDB2315678afecb367f032d93F642f64180aa3', '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512'], {});
  return { LiquidityPool }
})

export default LiquidityPoolModule
