<script>
  import AllocationBreakdown from '../components/AllocationBreakdown.svelte';
  import Balance from '../components/Balance.svelte';
  import Etherscan from '../components/Etherscan.svelte';
  import Farming from '../components/Farming.svelte';
  import Info from '../components/Info.svelte';
  import Migration from '../components/Migration.svelte';
  import Quantstamp from '../components/Quantstamp.svelte';

  import { currentRoute } from '../stores/routes.js';
  import images from "../config/images.json";
  import links from '../config/links.json';



  import {
    getTokenImage,
  } from "../components/helpers.js";
</script>
  

<div class="content flex flex-col spl">
  <img class="w-100pc h-auto md:w-100pc h-auto"src={images.moneytowork} alt="PieDAO Hero" />
  <div class="text-center font-thin text-xs mt-4 mb-4 md:text-lg">
    What is your investment style?
   </div>
   <div class="flex justify-around w-100pc content-center">
    <a href="ciao" class="investment-card flex w-1/3 items-center min-h-150px bg-lightgrey m-10px p-20px rounded-sm">
      <div class="text-left mr-20px"><img class="w-80px h-auto"src={images.koala} alt="PieDAO Hero" /></div>
      <div class="flex flex-col text-left">
        <div class="text-lg">Sleepy gainer</div>
        <div class="font-thin">Easy peasy crypto sweeties</div>
      </div>
    </a>
    <a href="ciao" class="investment-card flex w-1/3 items-center min-h-150px bg-lightgrey m-10px p-20px rounded-sm">
      <div class="text-left mr-20px"><img class="w-80px h-auto"src={images.defihero} alt="PieDAO Hero" /></div>
      <div class="flex flex-col text-left">
        <div class="text-lg">DeFi Hero</div>
        <div class="font-thin">Reasonable gains and risks</div>
      </div>
    </a>
    <a href="ciao" class="investment-card flex w-1/3 items-center min-h-150px bg-lightgrey m-10px p-20px rounded-sm">
      <div class="text-left mr-20px"><img class="w-80px h-auto"src={images.degen} alt="PieDAO Hero" /></div>
      <div class="flex flex-col text-left">
        <div class="text-lg">Degen warrior</div>
        <div class="font-thin">Harvest them all</div>
      </div>
    </a>
   </div>
</div>


<div class="content flex w-100pc justify-between spl">
  <div class="flex w-7/12 flex-col mt-10 p-5">
    <div class="font-huge">Unlock the power of PIEs,<br/> 
      ETF-like Portfolios<br/>
      for everyone.</div>
      <img class="w-100pc h-auto md:w-100pc h-auto"src={images.etflike} alt="PieDAO Hero" />
    </div>
  <div class="flex w-5/12 flex-col mt-10 p-5">
    <div class="font-bold text-lg">Minimize Fees</div>
    <div class="font-thin mb-50px">Whit a technology that I really cannot explain, we are able to offer the best if this with less of that. You´ll like it, guaranteed!</div>
    <div class="font-bold text-lg">Edging DeFi Risks</div>
    <div class="font-thin mb-50px">Whit a technology that I really cannot explain, we are able to offer the best if this with less of that. You´ll like it, guaranteed!</div>
    <div class="font-bold text-lg">Supercharged Indexes</div>
    <div class="font-thin mb-50px">Whit a technology that I really cannot explain, we are able to offer the best if this with less of that. You´ll like it, guaranteed!</div>
  </div>
</div>


<div class="content flex flex-col w-100pc justify-between spl text-center">
  <div class="text-white bg-black rounded-4px py-6px px-8px mb-10px">RISK-OPPORTUNITIES</div>
  <div class="font-veryhuge">Collective Financial iQ,<br/>
    Contracts Audits.</div>
    <div class="font-thin text-lg mt-10px mb-10px md:w-80pc">We build PieDAO to capture the best insights from our community.<br/>
      This way we can reduce biases and deploy new ideas faster.<br/>
      All our smart contract have been officially audited.</div>
      <div class="quantstamp-container my-10px">
        <a href="learn" target="_blank">
          <img class="w-200px h-auto" src={images.logos.quantstamp} alt="quantumstamp logo" />
        </a>
      </div>
      <a href="audits" class="font-bold text-sm mb-50px">Learn about audits ></a>
</div>


<div class="content flex flex-col w-100pc justify-between spl text-center">
  <div class="text-white bg-black rounded-4px py-6px px-8px mb-10px">USD++</div>
  <div class="font-veryhuge">A Stash<br/>
    of StableCash.</div>
    <div class="font-thin text-lg mt-10px mb-10px md:w-80pc">The USD++ smart-pool currently includes as underlying assets a weighted allocation of the following USD stable-coins on the Ethereum network.<br/>
      Stablecoins are great, edging the risk is better.</div>
      <div class="my-20px">
        <img class="w-200px h-auto" src={images.usdpluscoins} alt="usd plus plus icons" />
      </div>
      <a href="audits" class="font-bold text-sm mb-50px">Learn about USD++ ></a>
</div>


<div class="content flex flex-col w-100pc justify-between spl text-center md:w-80pc">
  <div class="text-white bg-black rounded-4px py-6px px-8px mb-10px">DeFi++</div>
  <div class="font-veryhuge">Small, Large, One-Size.<br/>
    Choose the DeFi that
    fits you best.</div>
    <div class="font-thin text-lg mt-10px mb-10px md:w-80pc">Assets represented within DEFI+S/L and DEFI++ have been weighted in as a function of their current Market Capitalization, capped by a max weight of 30%.</div>
      <div class="my-20px">
        <img class="w-400px h-auto" src={images.defiplusicons} alt="DeFi plus icons" />
      </div>
      <a href="https://balancer.exchange/#/swap/ether/0xad32A8e6220741182940c5aBF610bDE99E737b2D" target="_blank">
        <button class="btn m-0 mt-4 rounded-8px p-15px min-w-200px w-800px">
          Get Started
        </button>
      </a>
      <a href="defipies" class="font-bold text-sm mt-20px mb-50px">Learn about DeFi+ Pies ></a>
</div>


<div class="content flex flex-col w-100pc justify-between spl text-center md:w-80pc">
  <div class="text-white bg-black rounded-4px py-6px px-8px mb-10px">BTC++</div>
  <div class="font-veryhuge">All wrapped BTC,<br/>
    Satoshi´s flavor.</div>
    <div class="font-thin text-lg mt-10px mb-10px md:w-80pc">The USD++ smart-pool currently includes as underlying assets a weighted allocation of the following USD stable-coins on the Ethereum network.
      Stablecoins are great, edging the risk is better.</div>
      <div class="my-20px">
        <img class="w-200px h-auto" src={images.btcplusicons} alt="BTC plus icons" />
      </div>
      <a href="https://balancer.exchange/#/swap/ether/0xad32A8e6220741182940c5aBF610bDE99E737b2D" target="_blank">
        <button class="btn m-0 mt-4 rounded-8px p-15px min-w-200px w-800px">
          Get Started
        </button>
      </a>
      <a href="defipies" class="font-bold text-sm mt-20px mb-50px">Learn about BTC++ ></a>
</div>


<div class="content flex flex-col w-100pc justify-between spl text-center md:w-80pc">
  <div class="font-veryhuge">Farm it like<br/>
    the Good Days.</div>
    <div class="font-thin text-lg mt-10px mb-10px md:w-80pc">As announced here 60,000,000 DOUGH v2 tokens (60% of total) will be locked in a vault off-circulation and assigned to the DAO to promote its development overtime through liquidity mining programs and other incentives.</div>
      <div class="my-20px">
        <img class="w-100pc h-auto" src={images.olddaysfarming} alt="Farming" />
      </div>
      <a href="https://pools.piedao.org/#/stake" target="_blank">
        <button class="btn m-0 mt-4 rounded-8px p-15px min-w-200px w-800px">
          Staking Pools
        </button>
      </a>
      <a href="defipies" class="font-bold text-sm mt-20px mb-50px">Learn about staking rewards ></a>
</div>


<div class="content flex flex-col w-100pc justify-between spl text-center md:w-80pc">
  <div class="font-veryhuge">The Right Choice for<br/>
    your Financial Taste.</div>
    <div class="font-thin text-lg mt-10px mb-10px md:w-80pc">Choose from a variety of risk profiles. We have a PIE for every taste.</div>

    <div class="flex justify-around w-100pc content-center">
      <a href="ciao" class="investment-card flex flex-col w-1/3 items-center min-h-150px bg-lightgrey m-10px p-20px rounded-sm">
        <div class="text-center"><img class="w-80px h-auto"src={images.usdplus} alt="PieDAO Hero" /></div>
        <div class="flex flex-col text-center">
          <div class="text-lg">USD++</div>
          <div class="font-thin">Get a stash StableCash</div>
        </div>
      </a>
      <a href="ciao" class="investment-card flex flex-col w-1/3 items-center min-h-150px bg-lightgrey m-10px p-20px rounded-sm">
        <div class="text-center"><img class="w-80px h-auto"src={images.btcplusplus} alt="PieDAO Hero" /></div>
        <div class="flex flex-col text-center">
          <div class="text-lg">BTC++</div>
          <div class="font-thin">Every flavor of BTC</div>
        </div>
      </a>
      <a href="ciao" class="investment-card flex flex-col w-1/3 items-center min-h-150px bg-lightgrey m-10px p-20px rounded-sm">
        <div class="text-center"><img class="w-80px h-auto"src={images.defiplusplus} alt="PieDAO Hero" /></div>
        <div class="flex flex-col text-center">
          <div class="text-lg">DeFi++</div>
          <div class="font-thin">All the best DeFi in one PIE</div>
        </div>
      </a>
     </div>


    <div class="flex justify-around w-100pc content-center">
      <a href="ciao" class="investment-card flex flex-col w-1/3 items-center min-h-150px bg-lightgrey m-10px p-20px rounded-sm">
        <div class="text-center"><img class="w-80px h-auto"src={images.defiplusl} alt="PieDAO Hero" /></div>
        <div class="flex flex-col text-center">
          <div class="text-lg">DeFi+L</div>
          <div class="font-thin">Supersized DeFi coins</div>
        </div>
      </a>
      <a href="ciao" class="investment-card flex flex-col w-1/3 items-center min-h-150px bg-lightgrey m-10px p-20px rounded-sm">
        <div class="text-center"><img class="w-80px h-auto"src={images.defipluss} alt="PieDAO Hero" /></div>
        <div class="flex flex-col text-center">
          <div class="text-lg">DeFi+S</div>
          <div class="font-thin">Because size doesn't matter</div>
        </div>
      </a>
      <a href="ciao" class="investment-card flex flex-col w-1/3 items-center min-h-150px bg-lightgrey m-10px p-20px rounded-sm">
        <div class="text-center"><img class="w-80px h-auto"src={images.defiplusd} alt="PieDAO Hero" /></div>
        <div class="flex flex-col text-center">
          <div class="text-lg">DeFi+D</div>
          <div class="font-thin">For you degen desires</div>
        </div>
      </a>

      <a href="ciao" class="investment-card flex flex-col w-1/3 items-center min-h-150px bg-lightgrey m-10px p-20px rounded-sm">
        <div class="text-center"><img class="w-80px h-auto"src={images.doughtoken} alt="PieDAO Hero" /></div>
        <div class="flex flex-col text-center">
          <div class="text-lg">DOUGH</div>
          <div class="font-thin">What PIEs are made of</div>
        </div>
      </a>
     </div>

</div>



<div class="content flex flex-col w-100pc justify-between spl text-center md:w-80pc">
  <div class="text-white bg-black rounded-4px py-6px px-8px mb-10px">JOIN PIEDAO</div>
  <div class="font-veryhuge">+650<br/>DAO Members</div>
    <div class="font-thin text-lg mt-10px mb-10px md:w-80pc">Hundreds of people already choose to join the PieDAO revolution.<br/>
      Get $DOUGH and become a member now!</div>
      <a href="https://balancer.exchange/#/swap/ether/0xad32A8e6220741182940c5aBF610bDE99E737b2D" target="_blank">
        <button class="btn m-0 mt-4 rounded-8px p-15px min-w-200px w-800px">
          Get DOUGH
        </button>
      </a>
      <a href="defipies" class="font-bold text-sm mt-20px mb-50px">Learn about DOUGH ></a>
</div>


<div class="content flex flex-col w-100pc justify-between spl text-center md:w-80pc">
  <div class="text-white bg-black rounded-4px py-6px px-8px mb-10px">ASE FEATURED IN</div>
      <div class="my-20px">
        <img class="w-100pc h-auto" src={images.press} alt="BTC plus icons" />
      </div>
      <a href="https://balancer.exchange/#/swap/ether/0xad32A8e6220741182940c5aBF610bDE99E737b2D" target="_blank">
</div>



