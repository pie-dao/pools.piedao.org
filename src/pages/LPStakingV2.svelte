<script>
  import images from '../config/images.json';
  import Farming from '../components/piefolio/Farming.svelte';
  import Accordion from '../components/elements/Accordion.svelte';
  import AccordionGroup from '../components/elements/AccordionGroup.svelte';
  import Meta from '../components/elements/meta.svelte';
</script>

<Meta 
    metadata={{
        title: "PieDAO Farms, high yield DEFI farms to put your DEFI index to work",
        description: "An overview of the PieDAO farms, allowing users to stake their Pies and earn DOUGH. DOUGH / ETH, BCP, DEFI+S / ETH, DEFI+L / ETH are all incentivized."
    }}
/>
    
<div class="w-100pc m-0 p-0 flex justify-center">
  <div class="w-100pc lg:max-w-1280px flex flex-col-reverse lg:flex-row items-center lg:items-start justify-center py-0 md:py-8 px-2"> 
        <div class="flex flex-col w-100pc lg:w-60pc lg:mr-2pc">
          <span class="mt-0 md:mt-1 mb-2">
            <!-- Farms List -->
            <div class="w-100pc flex flex-col cardbordergradient">
              <div class="w-100pc bg-lightgrey rounded-xl text-black pt-8 pb-2 md:pt-8 pb-6 px-2 md:px-6 flex flex-col items-center">
                <div class="w-100pc font-huge text-center md:text-left">Farm Pools</div>
                <!-- svelte-ignore a11y-missing-attribute -->
                <a href="#/farm" class="flex mt-4 w-100pc rounded md:rounded-xl bg-white p-2 md:p-4 pointer">
                  <div class="mr-4 flex items-center">
                    <img
                      class="z-10"
                      width="40px"
                      height="40px"
                      src={images.doughtoken}
                      alt="token name"
                    />
                    <img
                      class="-ml-20px"
                      width="40px"
                      height="40px"
                      src={images.logos.eth}
                      alt="token name"
                    />
                  </div>
                  <div class="flex flex-col justify-around flex-grow md:flex-grow-0">
                    <span class="w-100pc flex items-center justify-between md:justify-start"><span class="md:text-lg leading-6">DOUGH / ETH</span>
                    <span class="bg-darkpurple text-white px-5px py-1px roundedxs text-xs ml-2">55.30% APY</span></span>
                    <span class="text-sm font-thin">40% Liquid - 60% Escrowed</span>
                  </div>
                  <div class="flex flex-col justify-around text-right ml-auto font-thin">
                    <span class="text-sm md:text-lg leading-6 hidden md:block">Balancer</span>
                    <span class="text-sm px-1 text-grey hidden md:block">Tot 166.345 BPT Staked</span>
                  </div>
                </a>
    
                <a href="#/farm" class="flex mt-4 w-100pc rounded md:rounded-xl bg-white p-2 md:p-4 pointer">
                  <div class="mr-4 flex items-center">
                    <img class="z-10" width="40px" height="40px" src={images.bcp} alt="token name" />
                    <img
                      class="-ml-20px invisible"
                      width="40px"
                      height="40px"
                      src={images.bcp}
                      alt="token name"
                    />
                  </div>
                  <div class="flex flex-col justify-around flex-grow md:flex-grow-0">
                    <span class="w-100pc flex items-center justify-between md:justify-start">
                      <span class="md:text-lg leading-6">BCP</span>
                      <span class="bg-darkpurple text-white px-5px py-1px roundedxs text-xs ml-2">55.30% APY</span>
                    </span>
                    <span class="text-sm font-thin">40% Liquid - 60% Escrowed</span>
                  </div>
                  <div class="flex flex-col justify-around text-right ml-auto font-thin">
                    <span class="text-sm md:text-lg leading-6 hidden md:block">PieDAO</span>
                    <span class="text-sm px-1 text-grey hidden md:block">Tot 166.345 BPT Staked</span>
                  </div>
                </a>
    
                <a href="#/farm" class="flex mt-4 w-100pc rounded md:rounded-xl bg-white p-2 md:p-4 pointer">
                  <div class="mr-4 flex items-center">
                    <img
                      class="z-10"
                      width="40px"
                      height="40px"
                      src={images.play}
                      alt="token name"
                    />
                    <img
                      class="-ml-20px"
                      width="40px"
                      height="40px"
                      src={images.doughtoken}
                      alt="token name"
                    />
                  </div>
                  <div class="flex flex-col justify-around flex-grow md:flex-grow-0">
                    <span class="w-100pc flex items-center justify-between md:justify-start">
                      <span class="md:text-lg leading-6">PLAY / DOUGH</span>
                      <span class="bg-darkpurple text-white px-5px py-1px roundedxs text-xs ml-2">55.30% APY</span>
                    </span>
                    <span class="text-sm font-thin">40% Liquid - 60% Escrowed</span>
                  </div>
                  <div class="flex flex-col justify-around text-right ml-auto font-thin">
                    <span class="text-sm md:text-lg leading-6 hidden md:block">Sushi</span>
                    <span class="text-sm px-1 text-grey hidden md:block">Tot 1088893.345 SLP Staked</span>
                  </div>
                </a>

                <a href="#/farm" class="flex mt-4 w-100pc rounded md:rounded-xl bg-white p-2 md:p-4 pointer">
                  <div class="mr-4 flex items-center">
                    <img
                      class="z-10"
                      width="40px"
                      height="40px"
                      src={images.doughtoken}
                      alt="token name"
                    />
                    <img
                      class="-ml-20px"
                      width="40px"
                      height="40px"
                      src={images.logos.eth}
                      alt="token name"
                    />
                  </div>
                  <div class="flex flex-col justify-around flex-grow md:flex-grow-0">
                    <span class="w-100pc flex items-center justify-between md:justify-start">
                      <span class="md:text-lg leading-6">DOUGH / ETH</span>
                      <span class="bg-darkpurple text-white px-5px py-1px roundedxs text-xs ml-2">55.30% APY</span>
                    </span>
                    <span class="text-sm font-thin">40% Liquid - 60% Escrowed</span>
                  </div>
                  <div class="flex flex-col justify-around text-right ml-auto font-thin">
                    <span class="text-sm md:text-lg leading-6 hidden md:block">Sushi</span>
                    <span class="text-sm px-1 text-grey hidden md:block">Tot 166.345 SLP Staked</span>
                  </div>
                </a>

                <a href="#/farm" class="flex mt-4 w-100pc rounded md:rounded-xl bg-white p-2 md:p-4 pointer">
                  <div class="mr-4 flex items-center">
                    <img
                      class="z-10"
                      width="40px"
                      height="40px"
                      src={images.defipluss}
                      alt="token name"
                    />
                    <img
                      class="-ml-20px"
                      width="40px"
                      height="40px"
                      src={images.logos.eth}
                      alt="token name"
                    />
                  </div>
                  <div class="flex flex-col justify-around flex-grow md:flex-grow-0">
                    <span class="w-100pc flex items-center justify-between md:justify-start">
                      <span class="md:text-lg leading-6">DEFI+S / ETH</span>
                    <span class="bg-darkpurple text-white px-5px py-1px roundedxs text-xs ml-2">55.30% APY</span>
                    </span>
                    <span class="text-sm font-thin">40% Liquid - 60% Escrowed</span>
                  </div>
                  <div class="flex flex-col justify-around text-right ml-auto font-thin">
                    <span class="text-sm md:text-lg leading-6 hidden md:block">Balancer</span>
                    <span class="text-sm px-1 text-grey hidden md:block">Tot 166.345 BPT Staked</span>
                  </div>
                </a>
    
                <a href="#/farm" class="flex mt-4 w-100pc rounded md:rounded-xl bg-white p-2 md:p-4 pointer">
                  <div class="mr-4 flex items-center">
                    <img
                      class="z-10"
                      width="40px"
                      height="40px"
                      src={images.defiplusl}
                      alt="token name"
                    />
                    <img
                      class="-ml-20px"
                      width="40px"
                      height="40px"
                      src={images.logos.eth}
                      alt="token name"
                    />
                  </div>
                  <div class="flex flex-col justify-around flex-grow md:flex-grow-0">
                    <span class="w-100pc flex items-center justify-between md:justify-start">
                      <span class="md:text-lg leading-6">DEFI+L ETH</span>
                    <span class="bg-darkpurple text-white px-5px py-1px roundedxs text-xs ml-2" >55.30% APY</span>
                    </span>
                    <span class="text-sm font-thin">40% Liquid - 60% Escrowed</span>
                  </div>
                  <div class="flex flex-col justify-around text-right ml-auto font-thin">
                    <span class="text-sm md:text-lg leading-6 hidden md:block">Balancer</span>
                    <span class="text-sm px-1 text-grey hidden md:block">Tot 166.345 BPT Staked</span>
                  </div>
                </a>
              </div>
            </div>
            <div class="text-center font-thin w-100pc mt-2 hover:opacity-60"><a href="#/stake">Go to old farms</a></div>
          </span>
        </div>
        <!-- YOUR FARMING POSITIONS -->
        <div class="flex flex-col w-100pc lg:w-38pc">
          <span class="-mt-4 mb-2 md:mb-1"><Farming /></span>
        </div>
      </div>
    </div>
    
    <!-- FAQ -->
    <div class="content">
      <div class="flex flex-col items-start mx-0 md:mx-4 w-100pc md:max-w-1280px">
        <div class="w-100pc font-huge text-center mb-4">Got questions?</div>
    
        <AccordionGroup>
          <Accordion class="flex flex-col">
            <button class="accordionbutton flex flex-col" slot="header" let:toggle on:click={toggle}>
              How does meta-governance work?
              </button>
            <div class="accordioncontent">
              With meta-governance users can participate in governance across the DeFi ecosystem with
              just one ERC-20, our governance token DOUGH. This occurs gas-free via Snapshot, with DOUGH
              holders signalling their support for a proposal and the DAO enacting their will using all
              the held funds.
            </div>
          </Accordion>
    
          <Accordion class="flex flex-col">
            <button class="accordionbutton flex flex-col" slot="header" let:toggle on:click={toggle}>
              Can I still migrate my tokens?
            </button>
            <div class="accordioncontent">
              To make the process as simple as possible an Aragon app will be installed which allows you
              to migrate your tokens.<br />
              By visiting the Aragon interface of PieDAO and opening the migration app you can easily migrate
              your already vested tokens to DOUGH v2. The interface will automatically fill in the maximum
              amount you are able to migrate.<br />
              <a
                class="font-bold mt-4 md:mt-4"
                target="_blank"
                href={`https://medium.com/piedao/dough-farming-season-7329ea5e84dd`}
                >Migration Tutorial</a>
                <br />
              <a
                class="font-bold mt-4 md:mt-4"
                target="_blank"
                href={`https://client.aragon.org/?#/piedao/0x968986e7ab9d05b4f6334efdc6c4c5efd89d4119/`}
                >Migrate Now</a>
            </div>
          </Accordion>
    
          <Accordion class="flex flex-col">
            <button class="accordionbutton flex flex-col" slot="header" let:toggle on:click={toggle} >
              How long is the vesting period?
              </button>
            <div class="accordioncontent">
              <div class="mt-2 md:mt-4">
                With the imminent migration to the DOUGH v2 governance token and the launch of the DOUGH
                / ETH liquidity pool on Balancer, PieDAO will also open its DOUGH farming season!
              </div>
    
              <div class="mt-2 md:mt-4">
                <strong>Incentives: </strong>60,000,000 DOUGH v2 tokens (60% of total) will be locked in
                a vault off-circulation and assigned to the DAO to promote its development overtime
                through liquidity mining programs and other incentives.
              </div>
    
              <div class="mt-2 md:mt-4">
                <strong>Eligibility: </strong>All Liquidity Providers to selected pools will be eligible
                for these incentive programs by staking their LP tokens to PieDAO staking contract.
              </div>
            </div>
          </Accordion>
        </AccordionGroup>
      </div>
    </div>