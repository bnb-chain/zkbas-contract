const hardhat = require('hardhat');
const { getDeployedAddresses, getZkBNBProxy } = require('./utils');
const { ethers } = hardhat;

async function main() {
  const addrs = getDeployedAddresses(hardhat.network.name, 'info/addresses.json');
  const [owner] = await ethers.getSigners();

  const zkbnb = await getZkBNBProxy(addrs.zkbnbProxy);
  const treasuryName = 'treasury';
  const gasName = 'gas';
  const sherName = 'sher';
  const gavinName = 'gavin';
  const treasuryRegisterFee = await zkbnb.getZNSNamePrice(treasuryName);
  const gasRegisterFee = await zkbnb.getZNSNamePrice(gasName);
  const sherRegisterFee = await zkbnb.getZNSNamePrice(sherName);
  const gavinRegisterFee = await zkbnb.getZNSNamePrice(gavinName);

  console.log('Register ZNS for treasury, gas, sher and gavin...');
  let registerZnsTx = await zkbnb.registerZNS(
    treasuryName,
    '0x56744Dc80a3a520F0cCABf083AC874a4bf6433F3',
    '0x2005db7af2bdcfae1fa8d28833ae2f1995e9a8e0825377cff121db64b0db21b7',
    '0x18a96ca582a72b16f464330c89ab73277cb96e42df105ebf5c9ac5330d47b8fc',
    {
      value: treasuryRegisterFee,
    },
  );
  await registerZnsTx.wait();
  registerZnsTx = await zkbnb.registerZNS(
    gasName,
    '0x56744Dc80a3a520F0cCABf083AC874a4bf6433F3',
    '0x0eac279f6815d42069a79374b0ce6d6bfe563935ddcdee8cc6c15c3618ea819c',
    '0x26e2d4a47aedf792fb3ea7b97c6f5c7cebb32dd30afca3fe77e31be768fc6c0f',
    {
      value: gasRegisterFee,
    },
  );
  await registerZnsTx.wait();
  registerZnsTx = await zkbnb.registerZNS(
    sherName,
    // '0xE9b15a2D396B349ABF60e53ec66Bcf9af262D449', // BSC
    // '0x7dD2Ac589eFCC8888474d95Cb4b084CCa2d8aA57', // Local
    // '0x56744Dc80a3a520F0cCABf083AC874a4bf6433F3', // BNB Zecrey Test
    owner.address,
    '0x235fdbbbf5ef1665f3422211702126433c909487c456e594ef3a56910810396a',
    '0x05dde55c8adfb6689ead7f5610726afd5fd6ea35a3516dc68e57546146f7b6b0',
    {
      value: sherRegisterFee,
    },
  );
  await registerZnsTx.wait();
  registerZnsTx = await zkbnb.registerZNS(
    gavinName,
    '0xf162Be50463c1EbFbf1A2eF944885945A768fbC1',
    '0x0649fef47f6cf3dfb767cf5599eea11677bb6495956ec4cf75707d3aca7c06ed',
    '0x0e07b60bf3a2bf5e1a355793498de43e4d8dac50b892528f9664a03ceacc0005',
    {
      value: gavinRegisterFee,
    },
  );
  await registerZnsTx.wait();
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Error:', err.message || err);
    process.exit(1);
  });
