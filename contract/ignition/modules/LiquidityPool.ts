import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const LiquidityPoolModule = buildModule('LiquidityPoolModule', m => {
  const LiquidityPool = m.contract("LiquidityPool", ['0xe7F12a48e5a213E1F404a607db893CdCd8a31dd0', '0x24cC91A4723A086aD8a6b28456D894f64e16Dfe6', 10000, 50000], {});
  return { LiquidityPool }
})

export default LiquidityPoolModule
