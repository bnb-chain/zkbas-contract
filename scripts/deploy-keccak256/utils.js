const fs = require('fs');
const { ethers } = require('hardhat');

// Read deployed addresses from file
exports.getDeployedAddresses = function (network, path) {
  const raw = fs.readFileSync(path);
  const data = JSON.parse(raw);

  return data[network];
};

// Write deployed addresses to json file
exports.saveDeployedAddresses = function (network, path, addrs) {
  const raw = fs.readFileSync(path);
  const data = JSON.parse(raw);
  data[network] = addrs;
  const jsonString = JSON.stringify(data, null, 2);
  fs.writeFileSync(path, jsonString);
};

exports.getZkBNBProxy = async function (addr) {
  // Get utils contract
  const Utils = await ethers.getContractFactory('Utils');
  const utils = await Utils.deploy();
  await utils.deployed();

  // zkbnb
  const ZkBNB = await ethers.getContractFactory('ZkBNB', {
    libraries: {
      Utils: utils.address,
    },
  });

  return ZkBNB.attach(addr);
};

// Get the keccak256 hash of a specified string name
// eg: getKeccak256('zkbnb') = '0x621eacce7c1f02dbf62859801a97d1b2903abc1c3e00e28acfb32cdac01ab36d'
exports.getKeccak256 = function (name) {
  return ethers.utils.keccak256(ethers.utils.toUtf8Bytes(name));
};
