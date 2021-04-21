<script>
  import images from '../config/images.json';
  import Meta from '../components/elements/meta.svelte';  
  </script>

<Meta 
metadata={{
    title: "PieDAO Farms, high yield DEFI farms to put your DEFI index to work",
    description: "An overview of the PieDAO farms, allowing users to stake their Pies and earn DOUGH. DOUGH / ETH, BCP, DEFI+S / ETH, DEFI+L / ETH are all incentivized."
}}
/>

<div class="w-100pc m-0 p-0 flex justify-center">
  <div class="w-100pc lg:max-w-900px flex flex-col items-center justify-center py-0 md:py-8 px-2"> 
    <div class="w-100pc">
      <a href="#/farms" class="flex items-center hover:opacity-60 mb-4">
        <img class="z-10 w-20px mr-2" src={images.backarrow} alt="token name" />
        <span>Back to Farms</span>
      </a>
    </div>

    <div class="flex justify-center items-start md:items-center">
      <div class="flex flex-col justify-start p-1px cardbordergradient w-100pc min-h-100pc   lg:min-w-30pc lg:min-h-50pc">

        <span class="py-0 px-4 mt-6 md:mt-0 md:px-12 font-thin">
          <span class="flex mt-0 md:mt-4 w-100pc">
            <div class="mr-4 flex items-center">
              <img class="z-10 w-40px md:w-60px"  src={images.doughtoken} alt="token name" />
              <img class="-ml-15px md:-ml-20px w-40px md:w-60px"  src={images.logos.eth} alt="token name" />
            </div>
            <div class="flex flex-col justify-around">
              <span class="flex items-center"
                ><span class="text-base md:text-lg md:leading-6 font-bold">DOUGH / ETH</span><span
                  class="bg-darkpurple text-white px-5px py-1px roundedxs text-xs ml-2 font-bold">55.30% APY</span
                ></span>
              <span class="block md:hidden text-sm leading-6 font-bold">Pool: Balancer</span>
              <span class="text-sm font-thin">40% Liquid - 60% Escrowed</span>
              <span class="block md:hidden text-sm text-grey">Tot 166.345 BPT Staked</span>
            </div>
            <div class="hidden md:flex flex-col justify-around text-right ml-auto font-thin">
              <span class="text-lg leading-6">Balancer</span>
              <span class="text-sm px-1 text-grey">Tot 166.345 BPT Staked</span>
            </div>
          </span>
      
          <span class="w-100pc">
            <div class="flex flex-col nowrap w-100pc swap-from border rounded-20px border-grey p-16px bg-white mt-8">
              <div class="flex items-center justify-between">
                <div class="flex nowrap intems-center p-1 font-thin">Amount to Stake</div>
                <div class="right text-white font-bold text-xs py-1px text-center align-right float-right rounded">
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
                    src={images.bpt}
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
              <div class="flex flex-col nowrap w-100pc swap-from border rounded-20px border-grey p-16px bg-white">
                <div class="flex items-center justify-between">
                  <div class="flex nowrap intems-center p-1 font-thin">Amount to Claim</div>
                  <div
                    class="right text-white font-bold text-xs py-1px text-center align-right float-right rounded">
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
                      src={images.doughtoken}
                      alt="ETH"
                    />
                    <span class="py-2px px-4px">DOUGH</span>
                  </div>
                </div>
              </div>
              <button class="clear farm-button-ghost mt-10px rounded-20px p-15px w-100pc border-grey hover:bg-black hover:text-white">Claim</button>
            </span>
      
            <span class="w-100pc mt-8 md:mt-0 md:mr-1 md:w-1/2">
              <div class="flex flex-col nowrap w-100pc swap-from border rounded-20px border-grey p-16px bg-white">
                <div class="flex items-center justify-between">
                  <div class="flex nowrap intems-center p-1 font-thin">Amount to Unstake</div>
                  <div class="right text-white font-bold text-xs py-1px text-center align-right float-right rounded">
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
                      src={images.bpt}
                      alt="ETH"
                    />
                    <span class="py-2px px-4px">BPT</span>
                  </div>
                </div>
              </div>
              <button class="clear farm-button-ghost mt-10px rounded-20px p-15px w-100pc border-grey hover:bg-black hover:text-white">Unstake</button>
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
                href="https://info.uniswap.org/pair/0xdf5096804705d135656b50b62f9ee13041253d97">
                HERE
                </a>
            </p>
            <p>Weekly rewards for this pool are <strong>20000 DOUGH</strong></p>
            <p><a href="#/swap">Buy YPIE !</a></p>
            <p><a href="#/swap">Buy DOUGH!</a></p>
          </div>
        </span>
      </div>
    </div>
    </div>
</div>