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

<div class="content p-top">
  <div class="w-100pc flex flex-col items-center justify-center gradientanimation rounded py-8 px-6">
    <img class="w-80pc md:w-70pc ld:w-60pc"  src={images.herolanding} alt="PieDAO Hero" />
    <div class="text-white font-bold text-center font-hero">Wealth creation,<br class="hidden md:block lg:block"/> automated.</div>
    <div class="text-lg text-white font-thin italic text-center mt-1">“The latest hack in Decentralised Finance”</div>
    <a href="#/pies"><button class="btnwhite m-0 mt-8 rounded-8px p-15px min-w-200px w-96pc lg:w-200px lg:min-w-200px">Select your Pie</button></a>
    <div class="w-100pc flex flex-col items-start md:flex-row text-left mt-6 mb-2 md:mt-10 mb-6 text-white font-bold text-base">
      <div class="flex w-100pc justify-start items-center md:justify-center mt-4 md:mt-0 md:w-1/3">
        <img class="w-40px" src={images.heroicon1} alt="PieDAO Hero" />
        <span class="ml-4">Diversified exposure to<br class="hidden md:block" />creme-de-la-creme in crypto</span>  
      </div>
      <div class="flex w-100pc justify-start items-center md:justify-center mt-4 md:mt-0 md:w-1/3">
        <img class="w-40px" src={images.heroicon2} alt="PieDAO Hero" />
        <span class="ml-4">Set and forget strategies<br class="hidden md:block" />for maximum returns</span>
      </div>
      <div class="flex w-100pc justify-start items-center md:justify-center mt-4 md:mt-0 md:w-1/3">
        <img class="w-40px" src={images.heroicon3} alt="PieDAO Hero" />
        <span class="ml-4">Secure, transparent,<br class="hidden md:block" />and open-source</span>
      </div>
    </div>
  </div>
</div>



<div class="content font-huge text-left md:text-center px-6">A decentralised asset manager for tokenised portfolios, with a mission to bring automated wealth creation to everyone with an internet connection.</div>

<div class="content gradientbglight rounded py-8 px-6">
  <div class="flex flex-col md:flex-row">
<div class="font-huge text-left w-100pc md:w-1/2">Pies are diversified portfolios of top performing crypto assets</div>
<ul class="text-left font-thin text-base w-100pc md:w-1/2 md:pl-4 list-none md:list-disc">
  <li class="mt-4 md:mt-0">Carefully handpicked by a decentralised community of economically incentivised talent</li>
  <li class="mt-4">Maximised returns through latest-trend active strategies like staking, lending, and yield-farming - completely automated</li>
  <li class="mt-4">Low-cost onboarding, saving you 97% of Ethereum gas fees</li>
  <li class="mt-4">Architecture that enhances security & minimises risk </li>
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
