import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const MikiModule = buildModule('MikiModule', m => {
  const MikiToken = m.contract("MikiToken", ['Miki', 'MIKI', 1000000], {});
  return { MikiToken }
})

export default MikiModule