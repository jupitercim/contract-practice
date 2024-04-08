Try running some of the following tasks:

```shell
pnpm install
pnpm hardhat node
```
Replace the address with your metamask wallet address in /ignition/modules/LuckyToken and /ignition/modules/MikiToken. And change the network to localhost in metamask.Then open another terminal to run following tasks.

```shell
pnpm hardhat ignition deploy ./ignition/modules/LuckyToken.ts
pnpm hardhat ignition deploy ./ignition/modules/MikiToken.ts
```
You will get two addresses with are the two tokens' in terminal. 

Example:

```shell
Deployed Addresses

MikiModule#MikiToken - 0x5FbDB2315678afecb367f032d93F642f64180aa3
LuckyModule#LuckyToken - 0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
```

Copy these address and replace them in the /ignition/modules/LiquidityPool file. And add these token in your metamask wallet.

Example:

```js
const LiquidityPool = m.contract("LiquidityPool", [LuckyAddress, MikiAddress],
```

Run the task

```shell
pnpm hardhat ignition deploy ./ignition/modules/LiquidityPool.ts
```
Then you will get three addresses in the teminal.

Example

```shell
MikiModule#MikiToken - 0x5FbDB2315678afecb367f032d93F642f64180aa3
LuckyModule#LuckyToken - 0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
LiquidityPoolModule#LiquidityPool - 0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0
```

After you repleced them in the ui project with constant variables. You could run command following command in ui project.
```shell
pnpm run dev
```

