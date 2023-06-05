const fs = require('fs');
const { ethers } = require('hardhat');

// Read deployed addresses from file
exports.getDeployedAddresses = function (path) {
  const raw = fs.readFileSync(path);
  return JSON.parse(raw);
};

// Write deployed addresses to json file
exports.saveDeployedAddresses = function (path, addrs) {
  const data = JSON.stringify(addrs, null, 2);
  fs.writeFileSync(path, data);
};

exports.saveConstructorArgumentsForVerify = function (path, args) {
  const data = JSON.stringify(args, null, 2);
  fs.writeFileSync(path, data);
};

exports.saveVersionZeroInfo = function (path, info) {
  const data = JSON.stringify(info, null, 2);
  fs.writeFileSync(path, data);
};

exports.getZkBNBProxy = async function (addr) {
  // Get txTypes contract
  const TxTypes = await ethers.getContractFactory('TxTypes');
  const txTypes = await TxTypes.deploy();
  await txTypes.deployed();

  // zkbnb
  const ZkBNB = await ethers.getContractFactory('ZkBNB', {
    libraries: {
      TxTypes: txTypes.address,
    },
  });

  return ZkBNB.attach(addr);
};

// Get the keccak256 hash of a specified string name
// eg: getKeccak256('zkbnb') = '0x621eacce7c1f02dbf62859801a97d1b2903abc1c3e00e28acfb32cdac01ab36d'
exports.getKeccak256 = function (name) {
  return ethers.utils.keccak256(ethers.utils.toUtf8Bytes(name));
};

exports.deployDesertVerifier = async function (owner) {
  const DesertVerifier = await ethers.getContractFactory('DesertVerifier');
  const desertVerifier = await DesertVerifier.deploy();
  await desertVerifier.deployed();

  return desertVerifier;
};
