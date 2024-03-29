import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const LuckyModule = buildModule('LuckyModule', m => {
  const LuckyToken = m.contract("LuckyToken", ['Lucky', 'LAK', 1000000], {});
  return { LuckyToken }
})

export default LuckyModule