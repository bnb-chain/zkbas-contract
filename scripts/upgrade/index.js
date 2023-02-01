const hardhat = require('hardhat');
const { getDeployedAddresses } = require('../deploy-keccak256/utils');
const { getContractFactories, getUpgradeableContractImplement } = require('./utils');
const { ethers } = hardhat;

const inquirer = require('inquirer');
const figlet = require('figlet');
const chalk = require('chalk');

const AddressZero = ethers.constants.AddressZero;

let targetContracts;
const addrs = getDeployedAddresses('info/addresses.json');

const targetContractsDeployed = {
  governance: AddressZero,
  verifier: AddressZero,
  znsController: AddressZero,
  znsResolver: AddressZero,
  zkbnb: AddressZero,
};

Object.defineProperty(String.prototype, 'capitalize', {
  value() {
    return this.charAt(0).toUpperCase() + this.slice(1);
  },
  enumerable: false,
});

function main() {
  console.log(chalk.green(figlet.textSync('zkBNB upgradeable tool')));

  if (!hardhat.network.name) {
    console.log(chalk.red(`🙃 Contract not deploy in ${hardhat.network.name}`));
    return;
  }
  inquirer
    .prompt([
      {
        type: 'list',
        name: 'operator',
        message: 'What do you want?',
        choices: ['start', 'preparation', 'cut period', 'cancel', 'finish'],
      },
    ])
    .then(async (answers) => {
      switch (answers.operator) {
        case 'start':
          start();
          break;
        case 'cancel':
          cancel();
          break;
        case 'preparation':
          preparation();
          break;
        case 'cut period':
          cutPeriod();
          break;
        case 'finish':
          finish();
          break;

        default:
          break;
      }
    });
}

async function start() {
  const contractFactories = await getContractFactories();
  const upgradeGatekeeper = await contractFactories.UpgradeGatekeeper.attach(addrs.upgradeGateKeeper);

  const status = await upgradeGatekeeper.upgradeStatus();
  if (status !== 0 /* idle */) {
    console.log(chalk.red(`🙃 Update flow is in progress`));
    return;
  }

  inquirer
    .prompt([
      {
        type: 'checkbox',
        name: 'target',
        message: 'Which contracts do you want to upgrade?',
        choices: ['governance', 'verifier', 'zkbnb', 'znsController', 'znsResolver'],

        validate(answer) {
          if (answer.length < 1) {
            return 'You must choose at least one topping.';
          }

          return true;
        },
      },
    ])
    .then(async (answers) => {
      targetContracts = answers.target;
      console.log(chalk.green('🚀 Deploy new contract'));
      for (const contract of targetContracts) {
        let deployContract;
        switch (contract) {
          case 'governance':
            deployContract = await contractFactories.Governance.deploy();
            break;
          case 'verifier':
            deployContract = await contractFactories.Verifier.deploy();
            break;
          case 'zkbnb':
            deployContract = await contractFactories.ZkBNB.deploy();
            break;
          case 'znsController':
            deployContract = await contractFactories.ZNSController.deploy();
            break;
          case 'znsResolver':
            deployContract = await contractFactories.ZNSResolver.deploy();
            break;

          default:
            break;
        }
        await deployContract.deployed();
        targetContractsDeployed[contract] = deployContract.address;
        console.log('%s deployed \t in %s', contract.capitalize(), deployContract.address);
      }

      console.log(chalk.green('🚚 Start Upgrade'));
      const tx = await upgradeGatekeeper.startUpgrade([
        targetContractsDeployed.governance,
        targetContractsDeployed.verifier,
        targetContractsDeployed.znsController,
        targetContractsDeployed.znsResolver,
        targetContractsDeployed.zkbnb,
      ]);

      const receipt = await tx.wait();
      console.log(chalk.green('✅ Upgrade process started'));

      console.log('🏷️  Current version is %s', receipt.events[0].args.versionId);
    });
}
async function preparation() {
  const UpgradeGatekeeper = await ethers.getContractFactory('UpgradeGatekeeper');
  const upgradeGatekeeper = await UpgradeGatekeeper.attach(addrs.upgradeGateKeeper);

  const upgradeStatus = await upgradeGatekeeper.upgradeStatus();

  if (upgradeStatus !== 1) {
    console.log(chalk.red('🙃 Not ready for prepare'));
    return;
  }
  const tx = await upgradeGatekeeper.startPreparation();
  const receipt = await tx.wait();
  console.log('✅ Prepare upgrade...');
  console.log('Current version is %s', receipt.events[0].args.versionId);
}
async function cancel() {
  const UpgradeGatekeeper = await ethers.getContractFactory('UpgradeGatekeeper');
  const upgradeGatekeeper = await UpgradeGatekeeper.attach(addrs.upgradeGateKeeper);

  console.log(chalk.green('🚀 Cancel Upgrade'));
  await upgradeGatekeeper.cancelUpgrade();
  console.log(chalk.green('✅ Cancel Upgrade'));
}
async function cutPeriod() {
  console.log(chalk.red('🚀 Please invoke contract function in BSCScan'));

  // const securityCouncil1 = new ethers.Wallet(
  //   '0x689af8efa8c651a91ad287602527f3af2fe9f6501a7ac4b061667b5a93e037fd',
  //   ethers.provider,
  // );
  // const securityCouncil2 = new ethers.Wallet(
  //   '0xde9be858da4a475276426320d5e9262ecfc3ba460bfac56360bfa6c4c28b4ee0',
  //   ethers.provider,
  // );
  // const securityCouncil3 = new ethers.Wallet(
  //   '0xdf57089febbacf7ba0bc227dafbffa9fc08a93fdc68e1e42411a14efcf23656e',
  //   ethers.provider,
  // );

  // const addrs = getDeployedAddresses('info/addresses.json');

  // const UpgradeableMaster = await ethers.getContractFactory('UpgradeableMaster');
  // const upgradeableMaster = await UpgradeableMaster.attach(addrs.upgradeableMaster);
  // console.log(chalk.green('🚀 Approve Upgrade'));
  // await approve(securityCouncil1);
  // await approve(securityCouncil2);
  // await approve(securityCouncil3);
  // console.log(chalk.green('✅ Approved'));
  // async function approve(security) {
  //   const tx = await upgradeableMaster.connect(security).cutUpgradeNoticePeriod();
  //   const receipt = await tx.wait();
  //   console.log(
  //     'number Of approvals from security council %s',
  //     receipt.events[0].args.numberOfApprovalsFromSecurityCouncil,
  //   );
  // }
}
async function finish() {
  /* ------------------------- Check upgrade status ------------------------ */
  const UpgradeGatekeeper = await ethers.getContractFactory('UpgradeGatekeeper');
  const upgradeGatekeeper = await UpgradeGatekeeper.attach(addrs.upgradeGateKeeper);

  const upgradeStatus = await upgradeGatekeeper.upgradeStatus();

  if (upgradeStatus !== 2) {
    console.log(chalk.red('🙃 Already in the preparation stage'));
    return;
  }
  console.log(chalk.green('🚀 Finish Upgrade'));
  const tx = await upgradeGatekeeper.finishUpgrade(['0x00', '0x00', '0x00', '0x00', '0x00']);
  const receipt = await tx.wait();
  const impls = await getUpgradeableContractImplement();
  console.log('**** New implement Contract ****');
  console.table(impls);
  console.log(chalk.green('✅ Finished'));
  console.log('Current version is %s', receipt.events[1].args.versionId);
}

main();
