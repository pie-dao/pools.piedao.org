<script>
  import BigNumber from "bignumber.js";
  import images from "../config/images.json";
  import { farming } from '../stores/eth/writables.js';

  import Accordion from '../components/elements/Accordion.svelte'
  import AccordionGroup from '../components/elements/AccordionGroup.svelte'
  
  import {
    formatFiat,
    subscribeToBalance,
  } from "../components/helpers.js";

  import Meta from '../components/elements/meta.svelte';
   
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

<Meta 
    metadata={{
        title: "PieDAO DOUGH, the DAO governance token, managing DEFI index products and high APR staking rewards",
        description: "An overview of PieDAO's governance token DOUGH, the voting system, and the incentives mechanism.",
        image: images.herodough,
        imageAlt: "Ready to diversify and logo, invest in a DEFI index and earn high yield today."
    }}
/>

<div class="videocontainer">
  <video loop muted autoplay poster="https://raw.githubusercontent.com/pie-dao/brand/master/misc/doughvideobg2.jpg" class="bg_video">
    <source src="https://raw.githubusercontent.com/pie-dao/brand/master/misc/doughbgvidlow.mp4" type="video/mp4">
  </video>
  <div class="content flex flex-col spl px-4">
    <div class="text-lg font-bold md:text-xl text-center mb-1">Grab a slice of the pie</div>
    <img src={images.doughcolorful} class="" alt="dough" />
    <div class="text-lg font-thin text-center mt-2">$DOUGH is the engine behind PieDAO’s self-driving wealth creation machine</div>
    <button class=" items-center btnbigblack text-white text-left py-2 px-3 mt-4 hover:opacity-80" onclick="location.href='#/swap'">
      <div class="w-100pc flex items-center">
      <div class="mr-10px"><img class="h-50px inline" src={images.doughtoken} alt="doughtoken" /></div>
      <div class="">
        <div class="text-base font-bold leading-5">Buy DOUGH</div>
        <div class="text-sm font-thin">Current price: <strong>${price}</strong></div>
      </div>
    </div>
    </button>
    <button on:click={() => addToken()} class="add-dough-metamask mt-4">
      Add to MetaMask 🦊
    </button>
  </div>
</div>

<div class="content flex flex-col spl">


<div class="content flex flex-col w-100pc justify-between spl lg:flex-row-reverse">
  <div class="flex w-full flex-col mt-0 md:mt-10 p-4 lg:w-3/7">
      <img class="w-100pc h-auto md:w-100pc h-auto" src={images.discuss} alt="Discuss" />
    </div>
  <div class="flex w-full lg:w-4/7 flex-col lg:pr-4">
    <div class="text-xl leading-10 mb-4">
     Govern: driving a DAO
    </div>
    <div class="font-thin text-l mb-20px lg:mb-50px">
      $DOUGH enables its holders to take control of their financial future, driving the decisions of PieDAO: from new products to asset rebalancing, strategies, and integrations. <br/>
      Every action taken by the organisation comes from a community vote using DOUGH. <br/>
      A bank where every customer has the right to be a board member.<br/>
      Take control of your financial future.
      <br/><br/>
      <!-- Circulating supply: &nbsp;<br/><strong>{formatFiat(circulatingSupply, ',', '.', '')} DOUGH</strong><br/><br/> -->
      Staked: &nbsp;<br/><strong>{formatFiat(doughStaked, ',', '.', '')} DOUGH</strong>
      </div>
    </div>
</div>



<div class="content flex flex-col w-100pc justify-between spl lg:flex-row">
  <div class="flex w-full flex-col mt-4 md:mt-10 p-4 lg:w-3/7">
      <img class="w-100pc h-auto md:w-100pc h-auto" src={images.earntogether} alt="Discuss" />
    </div>
  <div class="flex w-full lg:w-4/7 flex-col lg:pr-4">
    <div class="text-xl leading-10 mb-4">
     Grow and earn together.
    </div>
    <div class="font-thin text-l mb-20px lg:mb-50px">
      Governing a DAO is no easy task. Its members plan together, make decisions together, and build together.<br/>
      It’s only fair that they share the benefits together too.<br/>
      To reward their work, DOUGH holders share the revenue generated by PieDAO’s products.<br/>
      The bigger the Pies grow, the more they earn.<br/>
      With DOUGH there’s a piece of the pie for everyone.<br/>
      <a class="font-bold mt-4 md:mt-4" target="_blank" href={`https://medium.com/piedao/dough-tokens-d2479c7ea608`}>Learn about DOUGH token economics</a><br/>
      </div>
    </div>
</div>


<div class="content flex flex-col w-100pc justify-between spl lg:flex-row-reverse">
  <div class="flex w-full flex-col mt-4 md:mt-10 p-4 lg:w-3/7">
      <img class="w-100pc h-auto md:w-100pc h-auto" src={images.metavote} alt="Discuss" />
    </div>
  <div class="flex w-full lg:w-4/7 flex-col lg:pr-4">
      <div class="text-xl leading-10 mb-4">
      Meta-Govern: a home for DeFi
      </div>
      <div class="font-thin text-l mb-20px lg:mb-50px">
        DOUGH isn’t just about PieDAO.<br/>
        It’s a governance passport for the entire DeFi ecosystem. DOUGH lowers the barrier to wider governance participation in unprecedented ways.<br/>
        Any asset with governance power held in a PieVault will be automatically delegated to PieDAO, enabling DOUGH holders to vote in that protocol’s governance decisions.<br/>
        <strong>One DOUGH to govern them all.</strong>
      </div>
    </div>
</div>


  <section class="pt-12 pb-6 px-4 text-center">
    <div class="w-full max-w-2xl mx-auto">
      <h2 class="text-xl mt-6 mb-3 leading-tight font-heading">Got more questions?</h2>
    </div>
  </section>
  
  
  <div class="w-100pc px-2 md:px-8">
  <AccordionGroup>
  
    <Accordion class="flex flex-col">
      <button class="accordionbutton flex flex-col" slot="header" let:toggle on:click={toggle}>How does meta-governance work?</button>
      <div class="accordioncontent">
        With meta-governance users can participate in governance across the DeFi ecosystem with just one ERC-20, our governance token DOUGH. This occurs gas-free via Snapshot, with DOUGH holders signalling their support for a proposal and the DAO enacting their will using all the held funds.
      </div>
  </Accordion>
  
  <Accordion class="flex flex-col">
    <button class="accordionbutton flex flex-col" slot="header" let:toggle on:click={toggle}>Can I still migrate my tokens?</button>
    <div class="accordioncontent">
      To make the process as simple as possible an Aragon app will be installed which allows you to migrate your tokens.<br/>
      By visiting the Aragon interface of PieDAO and opening the migration app you can easily migrate your already vested tokens to DOUGH v2.
      The interface will automatically fill in the maximum amount you are able to migrate.<br/>
      <a class="font-bold mt-4 md:mt-4" target="_blank" href={`https://medium.com/piedao/dough-farming-season-7329ea5e84dd`}>Migration Tutorial</a><br/>
      <a class="font-bold mt-4 md:mt-4" target="_blank" href={`https://client.aragon.org/?#/piedao/0x968986e7ab9d05b4f6334efdc6c4c5efd89d4119/`}>Migrate Now</a>
      </div>
  </Accordion>
  
  <Accordion class="flex flex-col">
    <button class="accordionbutton flex flex-col" slot="header" let:toggle on:click={toggle}>How long is the vesting period?</button>
    <div class="accordioncontent">
      <div class="mt-2 md:mt-4">
        With the imminent migration to the DOUGH v2 governance token and the launch of the DOUGH / ETH liquidity pool on Balancer, PieDAO will also open its DOUGH farming season!
      </div>

      <div class="mt-2 md:mt-4">
        <strong>Incentives: </strong>60,000,000 DOUGH v2 tokens (60% of total) will be locked in a vault off-circulation and assigned to the DAO to promote its development overtime through liquidity mining programs and other incentives.  
      </div>

      <div class="mt-2 md:mt-4">
        <strong>Eligibility: </strong>All Liquidity Providers to selected pools will be eligible for these incentive programs by staking their LP tokens to PieDAO staking contract.
      </div>  
    </div>
  </Accordion>
  
  </AccordionGroup>
  </div>

</div>




  