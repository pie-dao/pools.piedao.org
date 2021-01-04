<script>
  import BigNumber from "bignumber.js";
  import images from "../config/images.json";
  import FarmerTable from '../components/FarmerTable.svelte';
  import { farming } from '../stores/eth/writables.js';

  import SectionImageTop from "../components/elements/SectionImageTop.svelte"
  import SectionImageLeft from "../components/elements/SectionImageLeft.svelte"
  import SectionImageRight from "../components/elements/SectionImageRight.svelte"
  
  import {
    formatFiat,
    toFixed,
    subscribeToBalance,
  } from "../components/helpers.js";
   
   import {
    balanceKey,
    balances,
    contract,
  } from "../stores/eth.js";
  
  const DOUGH = '0xad32A8e6220741182940c5aBF610bDE99E737b2D';
  const DAO = '0x4efD8CEad66bb0fA64C8d53eBE65f31663199C6d';
  const MULTISIG = '0x3bFdA5285416eB06Ebc8bc0aBf7d105813af06d0';

  let daoBalanceKey;
  let msBalanceKey;
  let doughStaked;
  let price = 'n/a';
  let circulatingSupply = 0;
  

  const addToken = () => {
    ethereum.sendAsync({
        method: 'wallet_watchAsset',
        params: {
          "type":"ERC20",
          "options":{
            "address": '0xad32A8e6220741182940c5aBF610bDE99E737b2D',
            "symbol": 'DOUGH',
            "decimals": 18,
            "image": 'https://raw.githubusercontent.com/pie-dao/brand/master/DOUGH%20Token/DOUGH2v.png',
          },
        },
        id: Math.round(Math.random() * 100000),
    }, (err, added) => {
      if (added) {
        console.log('Thanks for your interest!')
      } else {
        alert('Something went wrong. Is Metamask there?')
      }
    })
  };
  
  $: (async () => {

    const doughToken = await contract({ address: DOUGH });
    // DAO
    subscribeToBalance(DOUGH, DAO, true);
    // Multisig
    subscribeToBalance(DOUGH, MULTISIG, true);

    daoBalanceKey = balanceKey(DOUGH, DAO);
    msBalanceKey = balanceKey(DOUGH, MULTISIG);

    const totalSupply = await doughToken.totalSupply();
    const daoBal = $balances[daoBalanceKey] || BigNumber(0);
    const msBal = $balances[msBalanceKey] || BigNumber(0);
    doughStaked = $farming['0xB9a4Bca06F14A982fcD14907D31DFACaDC8ff88E'].doughStaked.toFixed(2) || 0;
    price = $farming['0xB9a4Bca06F14A982fcD14907D31DFACaDC8ff88E'].DOUGHPrice.toFixed(2) || 0;

    if(daoBal > 0 && msBal > 0) {
      const ts = BigNumber(totalSupply.toString()).dividedBy(10**18)
      circulatingSupply = ts.minus(BigNumber(msBal)).minus(BigNumber(daoBal)).toFixed(2);
    }
  })()
</script>
  <div class="content flex flex-col spl">
   <img class="w-100pc h-auto md:w-100pc h-auto"src={images.herodough} alt="PieDAO Hero" />


   <div class="text-center font-thin text-base mt-8 p-2 md:mt-20 md:text-lg lg:text-lg md:p-8 lg:p-8">
    <strong>DOUGH</strong> is the PieDAO governance token. Owning DOUGH makes you a member of PieDAO. Holders are capable of participating in the DAO’s governance votes and proposing votes of their own. <br/>
   </div>

   <div class="flex flex-col justify-between my-2 lg:flex-row md:flex-row">
      <div class="flex justify-center items-center bg-black text-white py-4 px-4 mx-2 my-2 rounded-sm text-center lg:w-1/2 md:w-1/2 md:my-0 lg:my-0">Circulating supply: <strong>{formatFiat(circulatingSupply, ',', '.', '')} DOUGH</strong></div>
      <div class="flex justify-center items-center bg-black text-white py-4 px-4 mx-2 my-2 rounded-sm text-center lg:w-1/2 md:w-1/2 md:my-0 lg:my-0">Staked: &nbsp;<strong>{formatFiat(doughStaked, ',', '.', '')} DOUGH</strong></div>
    </div>

   <div class="rounded-sm p-8 flex flex-col justify-between content-center items-center flex-wrap mt-4 md:mt-4">
     <div class="text-center p-4 text-2xl md:text-xl">Price: <strong>{price}$ / DOUGH</strong></div>
     <a href="https://balancer.exchange/#/swap/ether/0xad32A8e6220741182940c5aBF610bDE99E737b2D" target="_blank">
      <button class="btn m-0 mt-4 rounded-8px p-15px min-w-200px w-96pc lg:w-200px lg:min-w-200px">
        Buy
      </button>
    </a>

    <button on:click={() => addToken()} class="table-btn mt-4">
      Add to MetaMask 🦊
    </button>
   </div>

 

   <div class="bg-grey-243 rounded-sm pt-8 pb-8 flex justify-between flex-wrap w-full mt-4 md:mt-8">
    <div class="p-0 md:w-1/4">
      <div class="text-center font-thin text-xs md:text-base">PieDAO</div>
      <div class="text-center text-2xl md:text-xl font-black">Governance</div>
    </div>
    <div class="p-0 md:w-1/4">
      <div class="text-center font-thin text-xs md:text-base">Value accrual</div>
      <div class="text-center text-2xl md:text-xl font-black">Fees</div>
    </div>
    <div class="p-0 md:w-1/4">
        <div class="text-center font-thin text-xs md:text-base">Liquidity</div>
        <div class="text-center text-2xl md:text-xl font-black">Mining</div>
      </div>
    <div class="p-0 md:w-1/4">
      <div class="text-center font-thin text-xs md:text-base">DAOs Meta</div>
      <div class="text-center text-2xl md:text-xl font-black">Governance</div>
    </div>
  </div>

  <a class="singleTag font-bold my-4" target="_blank" href={`https://medium.com/piedao/dough-tokens-d2479c7ea608`}>Learn more on Medium</a>

  
  <SectionImageTop title="Token Migration" image={images.tokenmigration}>
    <span slot="content">
      PieDAO is entering the next phase of its mission to democratize the access to wealth allocation strategies by migrating the currently non-transferable token (DOUGHv1) to a transferable one (DOUGHv2).<br/>
    To further develop the community and to incentivize early adopters through the liquidity mining program the community believes the time is right to start the migration of DOUGH to DOUGH v2.<br/>
    </span>
  </SectionImageTop>


  <a class="singleTag font-bold my-4" target="_blank" href={`https://medium.com/piedao/piedao-token-migration-d2e9cd5d1a16`}>DOUGH Migration on Medium</a>
  
  <SectionImageRight title="Vesting Period" image={images.vestingperiod} isGrey={true}>
    <span slot="content">
      To align incentives early token requests were accepted at a lower rate then later ones but are subject to longer vesting periods. DOUGH holders are subject to the following vesting schedules:<br/>
      <ul class="list-disc list-inside mt-2 md:mt-4">
          <li>Contribution on Epoch 1 (from block to block) 1.5y vesting</li>
          <li>Contribution on Epoch 2 (from block to block) 1y vesting</li>
          <li>Summoners 3y vesting</li>
          <li>Bounties, no vesting applied</li>
      </ul>
    </span>
  </SectionImageRight>

  <SectionImageLeft title="How to Migrate" image={images.howtomigrate} isGrey={true}>
    <span slot="content">
      To make the process as simple as possible an Aragon app will be installed which allows you to migrate your tokens.<br/>
      By visiting the Aragon interface of PieDAO and opening the migration app you can easily migrate your already vested tokens to DOUGH v2.
      The interface will automatically fill in the maximum amount you are able to migrate.<br/>
      <a class="font-bold mt-4 md:mt-4" target="_blank" href={`https://medium.com/piedao/dough-farming-season-7329ea5e84dd`}>Migration Tutorial</a><br/>
      <a class="font-bold mt-4 md:mt-4" target="_blank" href={`https://client.aragon.org/?#/piedao/0x968986e7ab9d05b4f6334efdc6c4c5efd89d4119/`}>Migrate Now</a>
    </span>
  </SectionImageLeft>

  <SectionImageTop title="Liquidity Mining" image={images.liquiditymining}>
    <span slot="content">
      <div class="mt-2 md:mt-4">
        With the imminent migration to the DOUGH v2 governance token and the launch of the DOUGH / ETH liquidity pool on Balancer, PieDAO will also open its DOUGH farming season!
      </div>

      <div class="mt-2 md:mt-4">
        <strong>Incentives: </strong>60,000,000 DOUGH v2 tokens (60% of total) will be locked in a vault off-circulation and assigned to the DAO to promote its development overtime through liquidity mining programs and other incentives.  
      </div>

      <div class="mt-2 md:mt-4">
        <strong>Eligibility: </strong>All Liquidity Providers to selected pools will be eligible for these incentive programs by staking their LP tokens to PieDAO staking contract.
      </div>      
    </span>
  </SectionImageTop>
</div>



  