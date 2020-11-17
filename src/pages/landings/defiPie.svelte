<script>
  import images from "../../config/images.json";
  import DefiSection from '../../components/marketing-elements/defi-pie.svelte';
</script>
  

<div class="content flex flex-col spl">
  <DefiSection />
</div>

<div class="content flex flex-col w-100pc justify-between spl text-center md:w-80pc">

    <div class="font-thin text-lg mt-10px mb-10px md:w-80pc">
    Automated re-balancing locks in profits<br/>
    Minimise risk with diversification<br/>
    Own the underlying assets
    </div>

    <div class="flex justify-around w-100pc content-center">
      <a href="ciao" class="investment-card flex flex-col w-1/3 items-center min-h-150px bg-lightgrey m-10px p-20px rounded-sm">
        <div class="text-center"><img class="w-80px h-auto"src={images.defiplusl} alt="PieDAO Hero" /></div>
        <div class="flex flex-col text-center">
          <div class="text-lg">DLP</div>
          <div class="font-thin">DeFi’s Blue Chips. Bigger is Better.</div>
        </div>
      </a>

      <a href="ciao" class="investment-card flex flex-col w-1/3 items-center min-h-150px bg-lightgrey m-10px p-20px rounded-sm">
        <div class="text-center"><img class="w-80px h-auto"src={images.defiplusplus} alt="PieDAO Hero" /></div>
        <div class="flex flex-col text-center">
          <div class="text-lg">DXP</div>
          <div class="font-thin">The Most Diversified DeFi Index on the Market.</div>
        </div>
      </a>
      
      <a href="ciao" class="investment-card flex flex-col w-1/3 items-center min-h-150px bg-lightgrey m-10px p-20px rounded-sm">
        <div class="text-center"><img class="w-80px h-auto"src={images.defipluss} alt="PieDAO Hero" /></div>
        <div class="flex flex-col text-center">
          <div class="text-lg">DSP</div>
          <div class="font-thin">Small Cap Projects with Big Potential.</div>
        </div>
      </a>
      <!-- <a href="ciao" class="investment-card flex flex-col w-1/3 items-center min-h-150px bg-lightgrey m-10px p-20px rounded-sm">
        <div class="text-center"><img class="w-80px h-auto"src={images.doughtoken} alt="PieDAO Hero" /></div>
        <div class="flex flex-col text-center">
          <div class="text-lg">DOUGH</div>
          <div class="font-thin">What PIEs are made of</div>
        </div>
      </a> -->
  </div>

  <div class="content flex w-100pc justify-between spl">
    <div class="flex w-7/12 flex-col mt-10 p-5">
      <div class="text-xl">
        Tokenized ETFs <br/>
        governed by a DAO
      </div>
        <img class="w-100pc h-auto md:w-100pc h-auto"src={images.etflike} alt="PieDAO Hero" />
      </div>
    <div class="flex w-5/12 flex-col mt-10 p-5">
      <div class="font-bold text-lg">Convenient</div>
      <div class="font-thin mb-50px">Broad DeFi exposure at the tap of a button.</div>
      <div class="font-bold text-lg">Safe</div>
      <div class="font-thin mb-50px">Diversification is the safest strategy. Our balanced products are fully audited and non-custodial.</div>
      <div class="font-bold text-lg">Transparent</div>
      <div class="font-thin mb-50px">Built by the community for the community and fully open-source.</div>
    </div>
  </div>

</div>


<div class="content flex flex-col w-100pc justify-between spl text-center md:w-80pc">
  <div class="text-white bg-black rounded-4px py-6px px-8px mb-10px">JOIN PIEDAO</div>
  <div class="font-huge">+1200<br/> Members</div>
    <div class="font-thin text-lg mt-10px mb-10px md:w-80pc">
      Be a part of the community with $DOUGH. Participate in governance and be rewarded.
    </div>
    <div class="flex justify-around w-100pc content-center">
      <div href="ciao" class="investment-card items-center flex flex-col w-1/3 min-h-150px bg-lightgrey m-10px p-15px ">
        <img class="w-80px h-auto"src='https://assets.website-files.com/5e997428d0f2eb13a90aec8c/5e9f10bfd877555cb6ec4924_icon_03.png' alt="PieDAO Hero" />
        <div class="flex flex-col text-left">
          <div class="text-lg mt-5">Community Owned</div>
          <div class="font-thin">Governing together. We are a community comprising experts across multiple disciplines.</div>
        </div>
      </div>

      <div href="ciao" class="investment-card items-center flex flex-col w-1/3 min-h-150px bg-lightgrey m-10px p-15px ">
        <div class="text-center"><img class="w-80px h-auto" src='https://assets.website-files.com/5e997428d0f2eb13a90aec8c/5e9f10b52f493ec2926f4b17_icon_02.png' alt="PieDAO Hero" /></div>
        <div class="flex flex-col text-left">
          <div class="text-lg mt-5">Borderless</div>
          <div class="font-thin">Our community members contribute from around the globe, united by a belief in DeFi and open financial tools.</div>
        </div>
      </div>
      
      <div href="ciao" class="investment-card items-center flex flex-col w-1/3 min-h-150px bg-lightgrey m-10px p-15px ">
        <div class="text-center"><img class="w-80px h-auto" src='https://assets.website-files.com/5e997428d0f2eb13a90aec8c/5e9f10b52f493ec2926f4b17_icon_02.png' alt="PieDAO Hero" /></div>
        <div class="flex flex-col text-left">
          <div class="text-lg mt-5">Frictionless</div>
          <div class="font-thin">Pies make DeFi easy. All of the potential, none of the pain.</div>
        </div>
      </div>
      
    </div>
    
    <a href="#/dough">
      <button class="btn m-0 mt-4 rounded-8px p-15px min-w-200px w-600px">
        Learn more
      </button>
    </a>
</div>

<div class="content flex flex-col w-100pc justify-between spl text-center md:w-80pc">
  <div class="text-white bg-black rounded-4px py-6px px-8px mb-10px">FEATURED IN</div>
      <div class="my-20px">
        <img class="w-100pc h-auto" src={images.press} alt="BTC plus icons" />
      </div>
      <a href="https://balancer.exchange/#/swap/ether/0xad32A8e6220741182940c5aBF610bDE99E737b2D" target="_blank">
</div>



