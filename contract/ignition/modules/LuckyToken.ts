import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const LuckyModule = buildModule('LuckyModule', m => {
  // const LuckyToken = m.contract("LuckyToken", ['LuckyCoin', 'LUK', 5000, '0xF7Ca5de28E248a8d289f437829D4cF6ce1bcfaa6'], {});
  const LuckyToken = m.contract("LuckyToken", ['LuckyCoin', 'LUK', 5000, '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266'], {});
  return { LuckyToken }
})

export default LuckyModule