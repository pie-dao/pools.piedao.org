<script>
import BigNumber from "bignumber.js";
import { ethers } from "ethers";
import images from "../config/images.json";
import poolsConfig from "../config/pools.json";
import ovenABI from '../config/ovenABI.json';
import {
    balanceKey,
    balances,
    contract,
    eth
} from "../stores/eth.js";

import {
  maxAmount,
  getTokenImage,
  fetchEthBalance,
  fetchCalcToPie,
  formatFiat,
  subscribeToBalance
} from "../components/helpers.js";

export let ovenAddress;
export let pieAddress;

let instance;
let ethKey;

$: selectedTab = 1;
$: ovenData = {
  ethBalance: 0,
  pieBalance: 0
}

$: pie = poolsConfig[pieAddress];

$: if($eth.address) {
  fetchEthBalance($eth.address);
  ethKey = balanceKey(ethers.constants.AddressZero, $eth.address);

  ( async () => {
    instance = await contract({ address: ovenAddress, abi: ovenABI });
    ovenData.ethBalance = await instance.ethBalanceOf($eth.address) / 1e18;
    ovenData.pieBalance = await instance.outputBalanceOf($eth.address) / 1e18;
    ovenData.cap = await instance.cap() / 1e18;
  })()
  
}

$: ethBalance = BigNumber($balances[ethKey]).toString();

</script>


<div class="liquidity-container flex-col justify-items-center bg-grey-243 rounded-4px p-4 w-100pc md:p-6 ">
  <div class="flex justify-center font-thin mb-2">
    <table class="breakdown-table table-auto bg-white rounded w-full w-60pc md:w-75pc">
      <tbody>
        <tr class="">
          <td class="px-4 pt-4 pb-1 text-left" >Your ETH</td>
          <td class="px-4 pt-4 pb-1 text-right" >5.46 ETH</td>
        </tr>
        <tr class="">
          <td class="px-4 pt-1 pb-2 text-left" >Your Pie</td>
          <td class="px-4 pt-1 pb-2 text-right" >22.23 DeFi++</td>
        </tr>
        <tr class="">
          <td class="px-4 pt-1 pb-2 text-left" >Last Bake</td>
          <td class="px-4 pt-1 pb-2 text-right" >3 hours ago</td>
        </tr>
        <tr class="">
          <td class="px-4 pt-1 pb-4 text-left" >Next Bake</td>
          <td class="px-4 pt-1 pb-4 text-right" >2.14 ETH Left</td>
        </tr>
      </tbody>
    </table>

  </div>

  <div class="w-100pc flex justify-center justify-items-center content-center text-center">
  <button on:click={ () => selectedTab = 1} class:oven-button-active={selectedTab === 1} class="oven-button m-0 mt-4 mb-4 w-50pc rounded-8px min-w-100px lg:w-20pc lg:min-w-100px">
      Deposit
  </button>
  <button on:click={ () => selectedTab = 2} class:oven-button-active={selectedTab === 2} class="oven-button m-0 mt-4 mb-4 w-50pc rounded-8px min-w-100px lg:w-20pc lg:min-w-100px">
      Withdraw
  </button>
</div>

  {#if selectedTab === 1}
      <div class="input bg-white border border-solid rounded-8px border-grey-204 mx-0 md:mx-4">
          <div class="top h-32px text-sm font-thin px-4 py-4 md:py-2">
            <div class="left float-left">You Deposit</div>
            <div class="right text-white font-bold text-xs py-1px text-center align-right float-right rounded">
              <div class="percentage-btn inline-block rounded-20px h-20px bg-black w-50px cursor-pointer">100%</div>
            </div>
          </div>
          <div class="bottom  px-4 py-4 md:px-4 pb-4">
            <input type="number" class="font-thin text-base w-60pc md:w-75pc md:text-xl">
            <div class="asset-btn float-right h-32px bg-grey-243 rounded-32px px-2px flex
          align-middle justify-center items-center pointer mt-0 md:mt-14px">
          <img class="token-icon w-20px h-20px md:h-26px md:w-26px my-4px mx-2px" src="https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/info/logo.png" alt="ETH">
          <span class="py-2px px-4px">ETH</span></div> 
        </div>
      </div>

      <div class="input bg-white border border-solid rounded-8px border-grey-204 mx-0 mt-4 md:mx-4">
        <div class="top h-32px text-sm font-thin px-4 py-4 md:py-2">
          <div class="left float-left">You Get</div>
          <div class="right text-white font-bold text-xs py-1px text-center align-right float-right rounded">
          </div>
        </div>
        <div class="bottom  px-4 py-4 md:px-4 pb-4">
          <input type="number" class="font-thin text-base w-60pc md:w-75pc md:text-xl">
          <div class="asset-btn float-right h-32px bg-grey-243 rounded-32px px-2px flex
        align-middle justify-center items-center pointer mt-0 md:mt-14px">
        <img class="token-icon w-20px h-20px md:h-26px md:w-26px my-4px mx-2px" src={getTokenImage(pieAddress)} alt={`PieDAO ` + pie.symbol}>
        <span class="py-2px px-4px">{pie.symbol}</span></div> 
      </div>
    </div>

      <div class="flex justify-center">
      <button class="btn m-0 mt-4 rounded-8px px-56px py-15px" >Bake</button>
    </div>
    {/if}



    {#if selectedTab === 2}
            <div class="input bg-white border border-solid rounded-8px border-grey-204 mx-0 md:mx-4">
          <div class="top h-32px text-sm font-thin px-4 py-4 md:py-2">
            <div class="left float-left">Amount to withdraw</div>
            <div class="right text-white font-bold text-xs py-1px text-center align-right float-right rounded">
              <div class="percentage-btn inline-block rounded-20px h-20px bg-black w-50px cursor-pointer">100%</div>
            </div>
          </div>
          <div class="bottom  px-4 py-4 md:px-4 pb-4">
            <input type="number" class="font-thin text-base w-60pc md:w-75pc md:text-xl">
            <div class="asset-btn float-right h-32px bg-grey-243 rounded-32px px-2px flex
          align-middle justify-center items-center pointer mt-0 md:mt-14px">
          <img class="token-icon w-20px h-20px md:h-26px md:w-26px my-4px mx-2px" src="https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/info/logo.png" alt="ETH">
          <span class="py-2px px-4px">ETH</span></div> 
        </div>
      </div>

      <div class="input bg-white border border-solid rounded-8px border-grey-204 mx-0 mt-4 md:mx-4">
        <div class="top h-32px text-sm font-thin px-4 py-4 md:py-2">
          <div class="left float-left">Amount to withdraw</div>
          <div class="right text-white font-bold text-xs py-1px text-center align-right float-right rounded">
            <div class="percentage-btn inline-block rounded-20px h-20px bg-black w-50px cursor-pointer">100%</div>
          </div>
        </div>
        <div class="bottom  px-4 py-4 md:px-4 pb-4">
          <input type="number" class="font-thin text-base w-60pc md:w-75pc md:text-xl">
          <div class="asset-btn float-right h-32px bg-grey-243 rounded-32px px-2px flex
        align-middle justify-center items-center pointer mt-0 md:mt-14px">
        <img class="token-icon w-20px h-20px md:h-26px md:w-26px my-4px mx-2px" src={getTokenImage(pieAddress)} alt={`PieDAO ` + pie.symbol}>
        <span class="py-2px px-4px">{pie.symbol}</span></div> 
      </div>
    </div>

      <div class="flex justify-center">
      <button class="btn m-0 mt-4 rounded-8px px-56px py-15px" >Withdraw</button>
    </div>
    {/if}


</div>