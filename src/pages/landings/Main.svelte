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

<div class="content flex flex-col spl">
  <img class="w-100pc h-auto md:w-100pc h-auto"src={images.defimadesimple} alt="PieDAO Hero" />
</div>

<div class="content flex flex-col w-100pc justify-between spl text-center md:w-80pc">

    <div class="font-thin text-lg mt-10px mb-10px mx-2 md:w-80pc">
      Automated Portfolio Rebalancing<br/>
      Diversification Minimizes Risk<br/>
      Community Governed ETFs
    </div>

    <div class="flex flex-col justify-around w-100pc content-center lg:flex-row">

      <ProductBox 
        link="#/pie/0x78f225869c08d478c34e5f645d07a87d3fe8eb78"
        image={images.ypietoken}
        title="YPIE"
        subTitle="Yearn Ecosystem Pie"
        description="Metagovernance, staking and lending strategies. "
      />

      <ProductBox 
        link="#/pie/0xe4f726adc8e89c6a6017f01eada77865db22da14"
        image={images.bcp}
        title="BCP"
        subTitle="Balanced Crypto Pie"
        description="The best of crypto in one token."
      />

      <ProductBox 
        link="#/pie/0x8d1ce361eb68e9e05573443c407d4a3bed23b033"
        image={images.defiplusplus}
        title="DEFI++"
        subTitle="DeFi Index"
        description="The Most Diversified DeFi Index on the Market."
      />
  </div>

  <div class="content flex flex-col w-100pc justify-between spl lg:flex-row">
    <div class="flex w-full flex-col mt-10 p-5 lg:w-7/12">
      <div class="text-lg lg:text-xl">
        Tokenized ETFs <br/>
        governed by a DAO
      </div>
        <img class="w-100pc h-auto md:w-100pc h-auto"src={images.etflike} alt="PieDAO Hero" />
      </div>
    <div class="flex w-full lg:w-5/12 flex-col mt-2 lg:mt-10 p-5">
      <div class="font-bold text-lg">Convenient</div>
      <div class="font-thin mb-20px lg:mb-50px">Broad DeFi exposure at the tap of a button.</div>
      <div class="font-bold text-lg">Safe</div>
      <div class="font-thin mb-20px lg:mb-50px">Diversification is the safest strategy. Fully audited and non-custodial.</div>
      <div class="font-bold text-lg">Transparent</div>
      <div class="font-thin mb-20px lg:mb-50px">Built by the community for the community and fully open-source.</div>
    </div>
  </div>
</div>

<JoinPieDAO />

<div class="videocontainer">
  <video loop muted autoplay poster="https://raw.githubusercontent.com/pie-dao/brand/master/misc/doughvideobg2.jpg" class="bg_video">
    <source src="https://raw.githubusercontent.com/pie-dao/brand/master/misc/doughbgvidlow.mp4" type="video/mp4">
  </video>
  <div class="content flex flex-col spl px-4">
    <div class="text-lg font-bold md:text-xl text-center mb-1">Grab a slice of the pie</div>
    <img src={images.doughcolorful} class="" alt="dough" />
    <div class="text-lg font-thin text-center mt-2">$DOUGH is the engine behind PieDAO’s self-driving wealth creation machine</div>
    <a href="#/dough">
      <button class=" items-center btnbigblack text-white text-left py-2 px-3 mt-4 hover:opacity-80" >
        <div class="w-100pc flex items-center">
          <div class="mr-10px"><img class="h-50px inline" src={images.doughtoken} alt="doughtoken" /></div>
          <div class="">
            <div class="text-base font-bold leading-5">Learn about DOUGH</div>
          </div>
        </div>
      </button>
    </a>
  </div>
</div>

<FeaturedIn />
