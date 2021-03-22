<script>
import images from '../config/images.json';
import Farming from '../components/piefolio/Farming.svelte';
import Accordion from '../components/elements/Accordion.svelte';
import AccordionGroup from '../components/elements/AccordionGroup.svelte';
import ModalFarm from '../components/elements/ModalFarm.svelte';

let modalinfo;
let modal;

</script>

<ModalFarm bind:this={modalinfo}>
    <span slot="content" class="py-0 px-4 md:px-12 font-thin">
      <span class="flex mt-0 md:mt-4 w-100pc">
        <div class="mr-4 flex items-center">
          <img class="z-10" width="40px" height="40px" src={images.doughtoken} alt="token name" />
          <img class="-ml-20px" width="60px" height="60px" src={images.logos.eth} alt="token name" />
        </div>
        <div class="flex flex-col justify-around">
          <span class="flex items-center"
            ><span class="text-lg leading-6 font-bold">DOUGH / ETH</span><span
              class="bg-darkpurple text-white px-5px py-1px roundedxs text-xs ml-2 font-bold">55.30% APY</span
            ></span
          >
          <span class="text-sm font-thin">40% Liquid - 60% Escrowed</span>
        </div>
        <div class="hidden md:flex flex-col justify-around text-right ml-auto font-thin">
          <span class="text-lg leading-6">Balancer</span>
          <span class="text-sm px-1 text-grey">Tot 166.345 BPT Staked</span>
        </div>
      </span>
  
      <span class="w-100pc">
        <div
          class="flex flex-col nowrap w-100pc swap-from border rounded-20px border-grey p-16px bg-white mt-8">
          <div class="flex items-center justify-between">
            <div class="flex nowrap intems-center p-1 font-thin">Amount to Stake</div>
            <div
              class="right text-white font-bold text-xs py-1px text-center align-right float-right rounded"
            >
              <button class="oven-withdraw-button">100%</button>
            </div>
          </div>
          <div class="flex nowrap items-center p-1">
            <input
              class="swap-input-from"
              inputmode="decimal"
              autocomplete="off"
              autocorrect="off"
              type="number"
              pattern="^[0-9]*[.]?[0-9]*$"
              placeholder="0.0"
              minlength="1"
              maxlength="79"
              spellcheck="false"
            />
            <div class="h-32px flex items-center pointer">
              <img
                class="token-icon w-30px h-30px"
                src="https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/info/logo.png"
                alt="ETH"
              />
              <span class="py-2px px-4px">BPT</span>
            </div>
          </div>
        </div>
        <button class="btn clear stake-button mt-10px rounded-20px p-15px w-100pc">Stake</button>
      </span>
  
      <span class="flex flex-col md:flex-row mt-4 justify-between">
        <span class="w-100pc md:mr-1 md:w-1/2">
          <div
            class="flex flex-col nowrap w-100pc swap-from border rounded-20px border-grey p-16px bg-white"
          >
            <div class="flex items-center justify-between">
              <div class="flex nowrap intems-center p-1 font-thin">Amount to Claim</div>
              <div
                class="right text-white font-bold text-xs py-1px text-center align-right float-right rounded"
              >
                <button class="oven-withdraw-button">100%</button>
              </div>
            </div>
            <div class="flex nowrap items-center p-1">
              <input
                class="swap-input-from"
                inputmode="decimal"
                autocomplete="off"
                autocorrect="off"
                type="number"
                pattern="^[0-9]*[.]?[0-9]*$"
                placeholder="0.0"
                minlength="1"
                maxlength="79"
                spellcheck="false"
              />
              <div class="h-32px flex items-center pointer">
                <img
                  class="token-icon w-30px h-30px"
                  src="https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/info/logo.png"
                  alt="ETH"
                />
                <span class="py-2px px-4px">DOUGH</span>
              </div>
            </div>
          </div>
          <button class="clear farm-button-ghost mt-10px rounded-20px p-15px w-100pc border-grey">Claim</button>
        </span>
  
        <span class="w-100pc mt-8 md:mt-0 md:mr-1 md:w-1/2">
          <div
            class="flex flex-col nowrap w-100pc swap-from border rounded-20px border-grey p-16px bg-white"
          >
            <div class="flex items-center justify-between">
              <div class="flex nowrap intems-center p-1 font-thin">Amount to Unstake</div>
              <div
                class="right text-white font-bold text-xs py-1px text-center align-right float-right rounded"
              >
                <button class="oven-withdraw-button">100%</button>
              </div>
            </div>
            <div class="flex nowrap items-center p-1">
              <input
                class="swap-input-from"
                inputmode="decimal"
                autocomplete="off"
                autocorrect="off"
                type="number"
                pattern="^[0-9]*[.]?[0-9]*$"
                placeholder="0.0"
                minlength="1"
                maxlength="79"
                spellcheck="false"
              />
              <div class="h-32px flex items-center pointer">
                <img
                  class="token-icon w-30px h-30px"
                  src="https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/info/logo.png"
                  alt="ETH"
                />
                <span class="py-2px px-4px">BPT</span>
              </div>
            </div>
          </div>
          <button class="clear farm-button-ghost mt-10px rounded-20px p-15px w-100pc border-grey">Unstake</button>
        </span>
  
      </span>
  
      <div class="info-box mt-4 mb-8">
        <h1 class="text-xl text-left font-bold">Info</h1>
        <p>
          ℹ️ <strong>YPIE/ETH</strong> Staking Rewards - the pool will keep receiving 20000 DOUGH as nominal
          weekly reward distributed to LPs, of which 20% distributed liquid along the week 80% escrowed
          within the staking contract, and subject to 52 weeks vesting from the moment they will be claimed.
        </p>
        <br />
        <p>There are total of : <strong>2740.9505 UNI-V2 </strong>.</p>
        <p>There are total : <strong>2579.4828 UNI-V2</strong> staked in the Staking contract.</p>
        <p>
          You are staking : <strong>0%</strong>
          of the pool = [0 YPIE, 0 ETH] = $ 0.00
        </p>
        <br />
        <p>
          You can add liquidity to the 🦄 Uniswap pool to get UNI-V2 tokens
          <a
            target="_blank"
            href="https://info.uniswap.org/pair/0xdf5096804705d135656b50b62f9ee13041253d97">HERE</a
          >
        </p>
        <p>Weekly rewards for this pool are <strong>20000 DOUGH</strong></p>
        <p><a href="#/swap">Buy YPIE !</a></p>
        <p><a href="#/swap">Buy DOUGH!</a></p>
      </div>
    </span>
  </ModalFarm>
  
  <div class="content">
    <div class="flex flex-col md:flex-row items-start px-0 md:px-20px w-100pc max-w-1280px">
      <div class="flex flex-col w-100pc md:w-60pc mr-2pc">
        <span class="mt-0 md:mt-1 mb-2">
          <div class="w-100pc flex flex-col cardbordergradient">
            <div
              class="w-100pc bg-lightgrey rounded-xl text-black pt-8 pb-2 md:pt-8 pb-6 px-2 md:px-6 flex flex-col items-center"
            >
              <div class="w-100pc font-huge text-center md:text-left">Farm Pools</div>
  
              <a
                class="flex mt-4 w-100pc rounded md:rounded-xl bg-white p-2 md:p-4 pointer"
                on:click={() => {
                  modalinfo.open();
                }}
              >
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
                <div class="flex flex-col justify-around">
                  <span class="flex items-center"
                    ><span class="text-sm md:text-lg leading-6">DOUGH / ETH</span><span
                      class="bg-darkpurple text-white px-5px py-1px roundedxs text-xs ml-2"
                      >55.30% APY</span
                    ></span
                  >
                  <span class="text-sm font-thin">40% Liquid - 60% Escrowed</span>
                </div>
                <div class="flex flex-col justify-around text-right ml-auto font-thin">
                  <span class="text-sm md:text-lg leading-6 hidden md:block">Balancer</span>
                  <span class="text-sm px-1 text-grey hidden md:block">Tot 166.345 BPT Staked</span>
                </div>
              </a>
  
              <a class="flex mt-2 md:mt-4 w-100pc rounded md:rounded-xl bg-white p-2 md:p-4" href="token">
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
                <div class="flex flex-col justify-around">
                  <span class="flex items-center"
                    ><span class="text-sm md:text-lg leading-6">BCP</span><span
                      class="bg-darkpurple text-white px-5px py-1px roundedxs text-xs ml-2"
                      >55.30% APY</span
                    ></span
                  >
                  <span class="text-sm font-thin">40% Liquid - 60% Escrowed</span>
                </div>
                <div class="flex flex-col justify-around text-right ml-auto font-thin">
                  <span class="text-sm md:text-lg leading-6 hidden md:block">PieDAO</span>
                  <span class="text-sm px-1 text-grey hidden md:block">Tot 166.345 BPT Staked</span>
                </div>
              </a>
  
              <a class="flex mt-2 md:mt-4 w-100pc rounded md:rounded-xl bg-white p-2 md:p-4" href="token">
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
                <div class="flex flex-col justify-around">
                  <span class="flex items-center"
                    ><span class="text-sm md:text-lg leading-6">DEFI+S / ETH</span><span
                      class="bg-darkpurple text-white px-5px py-1px roundedxs text-xs ml-2"
                      >55.30% APY</span
                    ></span
                  >
                  <span class="text-sm font-thin">40% Liquid - 60% Escrowed</span>
                </div>
                <div class="flex flex-col justify-around text-right ml-auto font-thin">
                  <span class="text-sm md:text-lg leading-6 hidden md:block">Balancer</span>
                  <span class="text-sm px-1 text-grey hidden md:block">Tot 166.345 BPT Staked</span>
                </div>
              </a>
  
              <a class="flex mt-2 md:mt-4 w-100pc rounded md:rounded-xl bg-white p-2 md:p-4" href="token">
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
                <div class="flex flex-col justify-around">
                  <span class="flex items-center"
                    ><span class="text-sm md:text-lg leading-6">DEFI+L ETH</span><span
                      class="bg-darkpurple text-white px-5px py-1px roundedxs text-xs ml-2"
                      >55.30% APY</span
                    ></span
                  >
                  <span class="text-sm font-thin">40% Liquid - 60% Escrowed</span>
                </div>
                <div class="flex flex-col justify-around text-right ml-auto font-thin">
                  <span class="text-sm md:text-lg leading-6 hidden md:block">Balancer</span>
                  <span class="text-sm px-1 text-grey hidden md:block">Tot 166.345 BPT Staked</span>
                </div>
              </a>
            </div>
          </div>
        </span>
      </div>
      <div class="flex flex-col w-100pc md:w-38pc">
        <span class="-mt-4 mb-0 md:mb-1"><Farming /></span>
      </div>
    </div>
  </div>
  
  <div class="content">
    <div class="flex flex-col items-start mx-0 md:mx-4 w-100pc md:max-w-1280px">
      <div class="w-100pc font-huge text-center mb-4">Got questions?</div>
  
      <AccordionGroup>
        <Accordion class="flex flex-col">
          <button class="accordionbutton flex flex-col" slot="header" let:toggle on:click={toggle}
            >How does meta-governance work?</button
          >
          <div class="accordioncontent">
            With meta-governance users can participate in governance across the DeFi ecosystem with
            just one ERC-20, our governance token DOUGH. This occurs gas-free via Snapshot, with DOUGH
            holders signalling their support for a proposal and the DAO enacting their will using all
            the held funds.
          </div>
        </Accordion>
  
        <Accordion class="flex flex-col">
          <button class="accordionbutton flex flex-col" slot="header" let:toggle on:click={toggle}
            >Can I still migrate my tokens?</button
          >
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
              >Migration Tutorial</a
            ><br />
            <a
              class="font-bold mt-4 md:mt-4"
              target="_blank"
              href={`https://client.aragon.org/?#/piedao/0x968986e7ab9d05b4f6334efdc6c4c5efd89d4119/`}
              >Migrate Now</a
            >
          </div>
        </Accordion>
  
        <Accordion class="flex flex-col">
          <button class="accordionbutton flex flex-col" slot="header" let:toggle on:click={toggle}
            >How long is the vesting period?</button
          >
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