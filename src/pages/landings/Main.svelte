<script>
  import images from "../../config/images.json";
  import ProductBox from '../../components/elements/product-box.svelte';
  import JoinPieDAO from '../../components/JoinPieDAO.svelte';
  import FeaturedIn from '../../components/FeaturedIn.svelte';
  import Meta from '../../components/elements/meta.svelte';
</script>

<Meta 
  metadata={{
    title: "PieDAO, the asset allocation DAO governing tokenized ETF products.",
    description: "An overview of the PieDAO mission and core products, including BCP, DEFI+L and DEFI++ DEFI index. ",
    image: images.defimadesimple,
    imageAlt: "Investors examine spreadsheets and DEFI index opportunities"
  }}
/>

  <div class="w-100pc gradientanimation m-0 p-0 flex justify-center">
    <div class="max-w-1200px flex flex-col items-center justify-center py-8 px-6">
    <img class="w-90pc block md:hidden mb-2"  src={images.herolandingmobile} alt="PieDAO Hero" />
    <img class="md:w-70pc lg:w-60pc hidden md:block"  src={images.herolanding} alt="PieDAO Hero" />
    <div class="text-white font-bold text-center font-hero">Wealth creation,<br class="hidden md:block lg:block"/> automated.</div>
    <div class="text-lg text-white font-thin italic text-center mt-1">“The latest hack in Decentralised Finance”</div>
    <a href="#/pies"><button class="btnblack m-0 mt-8 rounded-8px p-15px min-w-200px w-96pc lg:w-200px lg:min-w-200px">Select your Pie</button></a>
    <div class="w-100pc flex flex-col md:flex-row items-stretch text-left mt-6 mb-0 md:mt-10 md:mb-6 text-white font-bold text-base">
      <div class="flex w-100pc justify-start items-center md:justify-center mt-2 md:mx-3 md:mt-0 md:w-1/3 bg-black-alpha rounded py-4 px-4">
        <img class="w-40px" src={images.heroicon2} alt="PieDAO Hero" />
        <span class="ml-4 leading-5">Set and forget strategies<br class="hidden md:block" />for maximum returns</span>
      </div>
      <div class="flex w-100pc justify-start items-center md:justify-center mt-2 md:mx-3 md:mt-0 md:w-1/3 bg-black-alpha rounded py-4 px-4">
        <img class="w-40px" src={images.heroicon1} alt="PieDAO Hero" />
        <span class="ml-4 leading-5">Diversified exposure to<br class="hidden md:block" />crème de la crème in crypto</span>  
      </div>
      <div class="flex w-100pc justify-start items-center md:justify-center mt-2 md:mx-3 md:mt-0 md:w-1/3 bg-black-alpha rounded py-4 px-4">
        <img class="w-40px" src={images.heroicon3} alt="PieDAO Hero" />
        <span class="ml-4 leading-5">Secure, transparent,<br class="hidden md:block" />and open-source</span>
      </div>
    </div>
  </div>
</div>


<div class="content font-huge text-left md:text-center" style="padding-bottom: 0!important;">
  <span class="mt-6 mb-0 md:mb-4 px-6">A decentralised asset manager for tokenised portfolios, with a mission to bring automated wealth creation to everyone with an internet connection.</span>
</div>


<div class="w-100pc m-w-100pc mr-4 md:m-0 p-0 flex justify-center overflow-x-scroll hidescrollbar">
  <div class="w-100pc md:max-w-1200px flex items-start justify-start justify-items-start py-8 px-6 hidescrollbar">

  <a href="ciao" class="min-w-80pc md:min-w-31pc md:w-1/3 md:max-w-1/3 mr-4 md:mx-4 my-2 md:my-0 drowpdown-shadow rounded flex flex-col pointer scale">
    <div class="w-100pc flex justify-center py-16 gradientbglightpurple rounded-top">
    <img class="w-40pc h-40pc" src="{images.defiplusplus}" alt="card" />
  </div>
      <div class="p-4 flex flex-col">
      <span class="text-lg">DeFi++</span>
      <span class="font-thin text.base">Capturing the best performing token of DeFi both small and large cap</span>
      </div>
    </a>
    <a href="ciao" class="min-w-80pc md:min-w-31pc md:w-1/3 md:max-w-1/3 mx-4 md:mx-4 my-2 md:my-0 drowpdown-shadow rounded flex flex-col pointer scale">
      <div class="w-100pc flex justify-center py-16 gradientbglightorange rounded-top">
      <img class="w-40pc h-40pc" src="{images.bcp}" alt="card" />
    </div>
        <div class="p-4 flex flex-col">
        <span class="text-lg">BCP</span>
        <span class="font-thin text.base">The most diversified, peace of mind exposure to crypto</span>
        </div>
    </a>
    <a href="ciao" class="min-w-80pc md:min-w-31pc md:w-1/3 md:max-w-1/3 mx-4 md:mx-4 my-2 md:my-0 drowpdown-shadow rounded flex flex-col pointer scale">
      <div class="w-100pc flex justify-center py-16 gradientbglightblue rounded-top">
        <img class="w-40pc h-40pc" src="{images.defiplusl}" alt="card" />
      </div>
          <div class="p-4 flex flex-col">
          <span class="text-lg">DeFi+L</span>
          <span class="font-thin text.base">All the top cap awesome DeFi project you were dreaming of</span>
          </div>
      </a>
      <a href="ciao" class="min-w-80pc md:min-w-31pc md:w-1/3 md:max-w-1/3 mx-4 md:mx-4 my-2 md:my-0 drowpdown-shadow rounded flex flex-col pointer scale">
        <div class="w-100pc flex justify-center py-16 gradientbglightgreen rounded-top">
          <img class="w-40pc h-40pc" src="{images.ypietoken}" alt="card" />
        </div>
            <div class="p-4 flex flex-col">
            <span class="text-lg">YPIE</span>
            <span class="font-thin text.base">All the top cap awesome DeFi project you were dreaming of</span>
            </div>
        </a>
        <a href="ciao" class="min-w-80pc md:min-w-31pc md:w-1/3 md:max-w-1/3 mx-4 md:mx-4 my-2 md:my-0 drowpdown-shadow rounded flex flex-col pointer scale">
          <div class="w-100pc flex justify-center py-16 gradientbglightblue rounded-top">
            <img class="w-40pc h-40pc" src="{images.defipluss}" alt="card" />
          </div>
              <div class="p-4 flex flex-col">
              <span class="text-lg">DeFi+S</span>
              <span class="font-thin text.base">All the top cap awesome DeFi project you were dreaming of</span>
              </div>
          </a>
          <a href="ciao" class="min-w-80pc md:min-w-31pc md:w-1/3 md:max-w-1/3 mx-4 md:mx-4 my-2 md:my-0 drowpdown-shadow rounded flex flex-col pointer scale">
            <div class="w-100pc flex justify-center py-16 gradientbglightorange rounded-top">
              <img class="w-40pc h-40pc" src="{images.usdplus}" alt="card" />
            </div>
                <div class="p-4 flex flex-col">
                <span class="text-lg">USD++</span>
                <span class="font-thin text.base">All the top cap awesome DeFi project you were dreaming of</span>
                </div>
            </a>
            <a href="ciao" class="min-w-80pc md:min-w-31pc md:w-1/3 md:max-w-1/3 mx-4 md:mx-4 my-2 md:my-0 drowpdown-shadow rounded flex flex-col pointer scale">
              <div class="w-100pc flex justify-center py-16 gradientbglightpurple rounded-top">
                <img class="w-40pc h-40pc" src="{images.btcplusplus}" alt="card" />
              </div>
                  <div class="p-4 flex flex-col">
                  <span class="text-lg">BTC++</span>
                  <span class="font-thin text.base">All the top cap awesome DeFi project you were dreaming of</span>
                  </div>
              </a>
      <div class="block inline-block md:hidden" style="margin-right:2rem!important;">&nbsp;</div>

</div>
</div>


<div class="flex rounded gradientbglightgreen py-6 md:py-12 px-4 md:px-6 mx-6 md:mx-40 flex items-center justify-center">
  <div class="flex flex-col md:flex-row max-w-1200px px-2 md:px-8">
<div class="font-huge text-left w-100pc md:w-1/2">Pies are diversified portfolios of top performing crypto assets</div>
<ul class="text-left font-thin text-base w-100pc md:w-1/2 md:pl-4 list-outside list-none">
  <li class="mt-4 md:mt-0">✔️ Carefully handpicked by a decentralised community of economically incentivised talent</li>
  <li class="mt-4">✔️ Maximised returns through latest-trend active strategies like staking, lending, and yield-farming - completely automated</li>
  <li class="mt-4">✔️ Low-cost onboarding, saving you 97% of Ethereum gas fees</li>
  <li class="mt-4">✔️ Architecture that enhances security & minimises risk </li>
</ul>

</div>
</div>

<div class="videocontainer-landing my-6">
  <video loop muted autoplay poster="https://raw.githubusercontent.com/pie-dao/brand/master/misc/doughvideobg2.jpg" class="bg_video-landing">
    <source src="https://raw.githubusercontent.com/pie-dao/brand/master/misc/doughbgvidlow.mp4" type="video/mp4">
  </video>
  <div class="content flex flex-col spl px-4 z-50">
    <div class="text-lg font-bold md:text-xl text-center mb-1 mt-6">Want a slice of the pie?</div>
    <img src={images.doughcolorful} class="w-50pc" alt="dough" />
    <div class="text-base md:text-lg font-thin text-center mt-2">$DOUGH is the engine behind PieDAO’s self-driving <br class="hidden md:block" />wealth creation machine</div>
    <a href="#/dough">
      <button class=" items-center btnbigblack text-white text-left py-2 px-3 mt-4 hover:opacity-80 mb-6" >
        <div class="w-100pc flex items-center">
          <div class="mr-10px"><img class="h-50px inline" src={images.doughtoken} alt="doughtoken" /></div>
          <div class="">
            <div class="text-base font-bold leading-5">Learn more</div>
          </div>
        </div>
      </button>
    </a>
  </div>
</div>

<FeaturedIn />
