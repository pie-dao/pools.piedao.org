import { getTokenImage } from '../components/helpers.js';

const ovens = [
  {
    addressOven: '0x0c4Ff8982C66cD29eA7eA96d985f36aE60b85B1C',
    // addressOven: '0x90Cc6F4ec7Aa0468D2eDb3F627AcD988B14A78b4',
    // addressOven: '0xb9Eef048dcc5F9CC453029cC2ed21f4a558ad0E8',
    deprecated: false,
    name: 'PLAY Oven',
    description: 'Bakes PLAY with ETH',
    data: {
      ethBalance: 0,
      pieBalance: 0,
    },
    baking: {
      symbol: 'PLAY',
      address: '0x33e18a092a93ff21ad04746c7da12e35d34dc7c4',
      balance: '0',
      icon: getTokenImage('0x33e18a092a93ff21ad04746c7da12e35d34dc7c4'),
    },
    highlight: true,
    enabled: true,
  },
  {
    addressOven: '0x1d616dad84dd0b3ce83e5fe518e90617c7ae3915',
    deprecated: false,
    name: 'DEFI++ Oven',
    description: 'Bakes DEFI++ at Zero cost',
    data: {
      ethBalance: 0,
      pieBalance: 0,
    },
    baking: {
      symbol: 'DEFI++',
      address: '0x8d1ce361eb68e9e05573443c407d4a3bed23b033',
      balance: '0',
      icon: getTokenImage('0x8d1ce361eb68e9e05573443c407d4a3bed23b033'),
    },
    highlight: true,
    enabled: true,
  },
  {
    addressOven: '0xE3d74Df89163A8fA1cBa540FF6B339d13D322F61',
    deprecated: false,
    name: 'BCP Oven',
    description: 'Bakes BCP at Zero cost',
    data: {
      ethBalance: 0,
      pieBalance: 0,
    },
    baking: {
      symbol: 'BCP',
      address: '0xe4f726adc8e89c6a6017f01eada77865db22da14',
      balance: '0',
      icon: getTokenImage('0xe4f726adc8e89c6a6017f01eada77865db22da14'),
    },
    highlight: true,
    enabled: true,
  },
  {
    addressOven: '0xAedec86DeDe3DEd9562FB00AdA623c0e9bEEb951',
    deprecated: false,
    name: 'YPIE Oven',
    description: 'Bakes YPIE at Zero cost',
    data: {
      ethBalance: 0,
      pieBalance: 0,
    },
    baking: {
      symbol: 'YPIE',
      address: '0x17525e4f4af59fbc29551bc4ece6ab60ed49ce31',
      balance: '0',
      icon: getTokenImage('0x17525e4f4af59fbc29551bc4ece6ab60ed49ce31'),
    },
    highlight: true,
    enabled: true,
  },
  // {
  //   addressOven: '0x925f860d1596cc6383c16294d8290f82bde172f7',
  //   deprecated: true,
  //   name: 'YPIE Oven',
  //   description: 'Bakes YPIE at Zero cost',
  //   data: {
  //     ethBalance: 0,
  //     pieBalance: 0,
  //   },
  //   baking: {
  //     symbol: 'YPIE',
  //     address: '0x17525e4f4af59fbc29551bc4ece6ab60ed49ce31',
  //     balance: '0',
  //     icon: getTokenImage('0x17525e4f4af59fbc29551bc4ece6ab60ed49ce31'),
  //   },
  //   highlight: true,
  //   enabled: true,
  // },
];
export default ovens;
