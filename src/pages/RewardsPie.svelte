<script>
  import images from '../config/images.json';
  import Meta from '../components/elements/meta.svelte'; 
  import { Tabs, Tab, TabList, TabPanel } from 'svelte-tabs';
  </script>

<Meta 
metadata={{
    title: "Rewards Pie",
    description: "Stake DOUGH and generate yield"
}}
/>

<div class="w-100pc m-0 p-0 flex justify-center">
  <div class="w-100pc lg:max-w-900px flex flex-col items-center justify-center py-0 md:py-8 px-2"> 
    <div class="font-huge text-center">Rewards Pie</div>
    <div class="font-thin text-lg text-center mt-10px mb-10px md:w-80pc">Flow cash to the future</div>



    <div class="flex justify-center items-start md:items-center">
      <div class="flex flex-col justify-start p-1px cardbordergradient w-100pc min-h-100pc lg:min-w-30pc lg:min-h-50pc">

        <div class="bg-purple rounded-xl text-white py-8 px-6 mt-12 mx-12">
          <div class="font-huge">Your position</div>
              <a class="flex mt-8" href={images.doughtoken}>
                  <div class="mr-4 w-60px max-w-60px h-60px max-h-60px"><img width="60px" height="60px" src={images.vedough} alt="veDOUGH" /></div>
                  <div class="flex flex-col justify-around">
                    <span class="flex items-center">
                      <span class="text-lg leading-6">veDOUGH</span>
                      <span class="bg-black opacity-60 px-5px py-1px roundedxs text-xs ml-2">32 months left</span>
                    </span>
                    <span class="text-sm font-thin">322,342.00 veDOUGH</span>
                  </div>
                  <div class="flex flex-col justify-around text-right ml-auto font-thin">
                    <span class="text-lg leading-6">$ 543,432.00</span>
                  </div>
                </a>
                <a class="flex mt-8" href={images.doughtoken}>
                  <div class="mr-4 w-60px max-w-60px h-60px max-h-60px"><img width="60px" height="60px" src={images.rewardspie} alt="veDOUGH" /></div>
                  <div class="flex flex-col justify-around">
                    <span class="flex items-center">
                      <span class="text-lg leading-6">RewardsPIE</span>
                      <span class="bg-black opacity-60 px-5px py-1px roundedxs text-xs ml-2">claimable</span>
    
                    </span>
                    <span class="text-sm font-thin">342.00 RewardsPIE</span>
                  </div>
                  <div class="flex flex-col justify-around text-right ml-auto font-thin">
                    <span class="text-lg leading-6">$ 3,789.00</span>
                  </div>
                </a>         
        </div>


        <span class="py-0 px-4 md:px-12 font-thin">      
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
                <div class="h-32px flex items-center">
                  <img
                    class="token-icon w-30px h-30px"
                    src={images.doughtoken}
                    alt="ETH"
                  />
                  <span class="py-2px px-4px">DOUGH</span>
                </div>
              </div>
            </div>


            <div class="text-l font-bold mt-4 mb-2">Choose your commitment</div>
            <Tabs>
              <TabList class="tablist font-bold">
                <Tab><div class="flex items-center py-1 px-6"><span>36 months</span><img class="w-30px ml-2 mb-2" src={images.diamond} alt="token name" /></div></Tab>
                <Tab><div class="flex items-center py-1 px-6"><span>24 months</span></div></Tab>
                <Tab><div class="flex items-center py-2 px-6"><span>12 months</span></div></Tab>
                <Tab><div class="flex items-center py-3 px-6"><span>6 months</span></div></Tab>
              </TabList>

              <TabPanel class="mb-2">
                <div class="text-sm opacity-70">For <strong>1 DOUGH</strong> you will receive <strong>1 veDOUGH</strong></div>
              </TabPanel>
                           
              <TabPanel>
                <div class="text-sm opacity-70">For <strong>1 DOUGH</strong> you will receive <strong>0.591235 veDOUGH</strong></div>
              </TabPanel>

              <TabPanel>
                <div class="text-sm opacity-70">For <strong>1 DOUGH</strong> you will receive <strong>0.231142 veDOUGH</strong></div>
              </TabPanel>

              <TabPanel>
                <div class="text-sm opacity-70">For <strong>1 DOUGH</strong> you will receive <strong>0.115571 veDOUGH</strong></div>  
              </TabPanel>

              <TabPanel class="mb-2">
              </TabPanel>
            </Tabs>






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
                  <div class="h-32px flex items-center">
                    <img
                      class="token-icon w-30px h-30px"
                      src={images.rewardspie}
                      alt="ETH"
                    />
                    <span class="py-2px px-4px">RewardsPie</span>
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
                  <div class="h-32px flex items-center">
                    <img
                      class="token-icon w-30px h-30px"
                      src={images.vedough}
                      alt="ETH"
                    />
                    <span class="py-2px px-4px">veDOUGH</span>
                  </div>
                </div>
              </div>
              <button class="clear farm-button-ghost mt-10px rounded-20px p-15px w-100pc border-grey hover:bg-black hover:text-white">Unstake</button>
            </span>
      
          </span>
      
          <div class="info-box mt-4 mb-8">
            <h1 class="text-xl text-center font-bold">Info WIP</h1>
  
          </div>
        </span>
      </div>
    </div>
    </div>
</div>