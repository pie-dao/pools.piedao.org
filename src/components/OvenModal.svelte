<script>
import { _ } from "svelte-i18n";
import debounce from "lodash/debounce";
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

let initialized = false;
let amount = 0;
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

  if(!initialized) {
    fetch();
  }
  
  
}

$: ethBalance = BigNumber($balances[ethKey]).toFixed(4);

const fetch = async () => {
    instance = await contract({ address: ovenAddress, abi: ovenABI });
    ovenData.ethBalance = await instance.ethBalanceOf($eth.address) / 1e18;
    ovenData.pieBalance = await instance.outputBalanceOf($eth.address) / 1e18;
    ovenData.cap = await instance.cap() / 1e18;
    initialized = true;
};

const deposit = async () => {
    const requestedAmount = BigNumber(amount);
    const max = BigNumber(ethBalance).multipliedBy(10 ** 18).toFixed(0);

    if (!$eth.address || !$eth.signer) {
      displayNotification({ message: $_("piedao.please.connect.wallet"), type: "hint" });
      connectWeb3();
      return;
    }


    if (BigNumber(requestedAmount).isGreaterThan(BigNumber(max)) ) {
      const maxFormatted = amountFormatter({ amount: max, displayDecimals: 8 });
      const message = `Not enough ETH`;
      displayNotification({ message, type: "error", autoDismiss: 30000 });
      return;
    }

    const amountWei = requestedAmount.multipliedBy(10 ** 18).toFixed(0);

    let overrides = {
      gasLimit: 3000000
    }

    const { emitter } = displayNotification(await oven.deposit(amountWei) );

    emitter.on("txConfirmed", ({ hash }) => {
      const { dismiss } = displayNotification({
        message: "Confirming...",
        type: "pending",
      });

      const subscription = subject("blockNumber").subscribe({
        next: () => {
          displayNotification({
            autoDismiss: 15000,
            message: `${requestedAmount.toFixed()} ETH successfully deposited in the Oven`,
            type: "success",
          });
          dismiss();
          subscription.unsubscribe();
        },
      });

      return {
        autoDismiss: 1,
        message: "Mined",
        type: "success",
      };
    });
  };

</script>


<div class="liquidity-container flex-col justify-items-center bg-grey-243 rounded-4px p-4 w-100pc md:p-6 ">
  <div class="flex justify-center font-thin mb-2">

    <div class="flex w-full text-black text-center text-xs md:text-xs lg:text-base justify-around mt-2 md:mt-0">
      <div class="p-0 mr-8 ">
        <div class="">
          Your ETH in the Oven
        </div>
        <div class="font-bold">{ovenData.ethBalance} ETH</div>
      </div>
      <div class="p-0 mr-8">
        <div class="">
          Pie Ready to Withdraw
        </div>
        <div class="font-bold">{ovenData.pieBalance} {pie.symbol}</div>
      </div>
      <div class="p-0 mr-8">
        <div class="">
          Last Bake
        </div>
        <div class="font-bold">n/a</div>
      </div>
      <div class="flex flex-col justify-center p-0">
        <div class="">
          Next Bake
        </div>
        <div class="font-bold">n/a</div>
      </div>
  
    </div>

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
              <button on:click={() => amount = ethBalance} class="percentage-btn inline-block rounded-20px h-20px bg-black w-50px cursor-pointer">100%</button>
            </div>
          </div>
          <div class="bottom  px-4 py-4 md:px-4 pb-4">
            <input bind:value={amount} type="number" class="font-thin text-base w-60pc md:w-75pc md:text-xl">
            <div class="asset-btn float-right h-32px bg-grey-243 rounded-32px px-2px flex
          align-middle justify-center items-center pointer mt-0 md:mt-14px">
          <img class="token-icon w-20px h-20px md:h-26px md:w-26px my-4px mx-2px" src="https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/info/logo.png" alt="ETH">
          <span class="py-2px px-4px">ETH</span></div> 
        </div>
      </div>

    <!-- <div class="input bg-white border border-solid rounded-8px border-grey-204 mx-0 mt-4 md:mx-4">
        <div class="top h-32px text-sm font-thin px-4 py-4 md:py-2">
          <div class="left float-left">You Get</div>
          <div class="right text-white font-bold text-xs py-1px text-center align-right float-right rounded">
          </div>
        </div>
        <div class="bottom  px-4 py-4 md:px-4 pb-4">
          <input disabled type="number" class="font-thin text-base w-60pc md:w-75pc md:text-xl">
          <div class="asset-btn float-right h-32px bg-grey-243 rounded-32px px-2px flex
        align-middle justify-center items-center pointer mt-0 md:mt-14px">
        <img class="token-icon w-20px h-20px md:h-26px md:w-26px my-4px mx-2px" src={getTokenImage(pieAddress)} alt={`PieDAO ` + pie.symbol}>
        <span class="py-2px px-4px">{pie.symbol}</span></div> 
      </div>
    </div> -->

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