<script>
  import images from "../config/images.json";
  import FarmerTable from '../components/FarmerTable.svelte';
</script>
  
  
  
  <div class="content flex flex-col spl">
   <img class="w-100pc h-auto md:w-100pc h-auto"src={images.herodough} alt="PieDAO Hero" />


   <div class="text-center font-thin text-xs mt-8 md:mt-20 md:text-lg">
    <strong>DOUGH</strong> is the PieDAO governance token. Owning DOUGH makes you a member of PieDAO. Holders are capable of participating in the DAO’s governance votes and proposing votes of their own. 1.5M DOUGH tokens will be available on <strong>Balancer around Oct 3, 2020, at 1:00 pm UTC.</strong><br/>
   </div>
   <a class="singleTag font-bold mt-4 md:mt-4" target="_blank" href={`https://medium.com/piedao/dough-tokens-d2479c7ea608`}>Learn more on Medium</a>



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


  <img class="w-20pc h-auto mt-8 l md:mt-12 md:w-20pc h-auto"src={images.tokenmigration} alt="PieDAO Hero" />
  <h1 class="text-center text-lg  mt-8 md:text-xl md:mt-12">Token Migration</h1>
  <div class="text-center font-thin text-xs mt-2 md:mt-4 md:text-lg">
    PieDAO is entering the next phase of its mission to democratize the access to wealth allocation strategies by migrating the currently non-transferable token (DOUGHv1) to a transferable one (DOUGHv2).<br/>
    To further develop the community and to incentivize early adopters through the liquidity mining program the community believes the time is right to start the migration of DOUGH to DOUGH v2.<br/>
  </div>
  <a class="singleTag font-bold mt-4 md:mt-4" target="_blank" href={`https://medium.com/piedao/piedao-token-migration-d2e9cd5d1a16`}>DOUGH Migration on Medium</a>
  

  <div class="bg-grey-243 rounded-sm p-8 flex justify-between flex-wrap w-full mt-8 md:mt-20">
    <div class="p-4 flex justify-center items-center content-center flex-wrap md:w-2/3">
        <h1 class="text-lg md:text-xl">Vesting Period</h1>
        <div class="font-thin text-xs mt-2 md:mt-4 md:text-base">
            To align incentives early token requests were accepted at a lower rate then later ones but are subject to longer vesting periods. DOUGH holders are subject to the following vesting schedules:<br/>
            <ul class="list-disc list-inside mt-2 md:mt-4">
                <li>Contribution on Epoch 1 (from block to block) 1.5y vesting</li>
                <li>Contribution on Epoch 2 (from block to block) 1y vesting</li>
                <li>Summoners 3y vesting</li>
                <li>Bounties, no vesting applied</li>
              </ul>
        </div>
    </div>
    <div class="p-4 flex justify-center w-full flex-wrap md:w-1/3 p-16"><img class="w-100pc h-auto md:w-100pc h-auto"src={images.vestingperiod} alt="PieDAO Hero" /></div>
  </div>

  <div class="bg-grey-243 rounded-sm p-8 flex justify-between flex-wrap w-full mt-4 md:mt-8">
    <div class="p-4 flex justify-center w-full flex-wrap md:w-1/3 p-16"><img class="w-100pc h-auto md:w-100pc h-auto"src={images.howtomigrate} alt="PieDAO Hero" /></div>
    <div class="p-4 flex justify-center items-center content-center flex-wrap md:w-2/3">
        <h1 class="text-lg md:text-xl">How to Migrate</h1>
        <div class="font-thin text-xs mt-2 md:mt-4 md:text-base">
            To make the process as simple as possible an Aragon app will be installed which allows you to migrate your tokens.<br/>
            By visiting the Aragon interface of PieDAO and opening the migration app you can easily migrate your already vested tokens to DOUGH v2.
            The interface will automatically fill in the maximum amount you are able to migrate.<br/>
            <a class="font-bold mt-4 md:mt-4" target="_blank" href={`https://medium.com/piedao/dough-farming-season-7329ea5e84dd`}>Migration Tutorial</a><br/>
            <a class="font-bold mt-4 md:mt-4" target="_blank" href={`https://client.aragon.org/?#/piedao/0x968986e7ab9d05b4f6334efdc6c4c5efd89d4119/`}>Migrate Now</a>


        </div>
    </div>
  </div>



  <img class="w-25pc h-auto mt-8 l md:mt-16 md:w-25pc h-auto"src={images.liquiditymining} alt="PieDAO Hero" />
  <h1 class="text-center text-lg  mt-8 md:text-xl md:mt-12">Liquidity Mining</h1>
  <div class="text-left font-thin text-xs mt-2 md:mt-4 md:text-lg">
    With the imminent migration to the DOUGH v2 governance token and the launch of the DOUGH / ETH liquidity pool on Balancer, PieDAO will also open its DOUGH farming season!
  </div>
    <div class="text-left font-thin text-xs mt-2 md:mt-4 md:text-lg">
    <strong>Incentives: </strong>60,000,000 DOUGH v2 tokens (60% of total) will be locked in a vault off-circulation and assigned to the DAO to promote its development overtime through liquidity mining programs and other incentives.
</div>
    <div class="text-left font-thin text-xs mt-2 md:mt-4 md:text-lg">
    <strong>Eligibility: </strong>All Liquidity Providers to selected pools will be eligible for these incentive programs by staking their LP tokens to PieDAO staking contract.
</div>
    <!-- <div class="w-100pc text-left font-thin text-xs mt-2 md:mt-4 md:text-lg">
    <strong>Pools: </strong>
    <ul class="list-disc list-inside mt-2 md:mt-4">
        <li>Contribution on Epoch 1 (from block to block) 1.5y vesting</li>
        <li>Contribution on Epoch 2 (from block to block) 1y vesting</li>
        <li>Summoners 3y vesting</li>
        <li>Bounties, no vesting applied</li>
      </ul>
    </div> -->

  <a class="singleTag font-bold mt-4 md:mt-4" target="_blank" href={`https://medium.com/piedao/dough-farming-season-7329ea5e84dd`}>Farming Season on Medium</a>
  <h1 class="text-center text-lg  mt-8 md:text-xl md:mt-12">Available Pools</h1>
  <div class="liquidity-container flex flex-col align-center bg-grey-243 rounded-4px p-4 my-4 md:p-6 w-full">
  <FarmerTable />
</div>
</div>



  