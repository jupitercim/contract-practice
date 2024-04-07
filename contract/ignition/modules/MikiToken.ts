import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const MikiModule = buildModule('MikiModule', m => {
  // const MikiToken = m.contract("MikiToken", ['Miki', 'MIKI', 10000, '0xF7Ca5de28E248a8d289f437829D4cF6ce1bcfaa6'], {});
  const MikiToken = m.contract("MikiToken", ['Miki', 'MIKI', 10000, '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266'], {});
  return { MikiToken }
})

export default MikiModule