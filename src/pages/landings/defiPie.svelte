<script>
  import images from "../../config/images.json";
  import Audits from '../../components/marketing-elements/audits.svelte';
  import HeroCentered from '../../components/elements/HeroCentered.svelte';
  import JoinPieDAO from '../../components/JoinPieDAO.svelte';
  import ProductBox from '../../components/elements/product-box.svelte';
  import SectionImageLeft from '../../components/elements/SectionImageLeft.svelte';
  import SectionImageRight from '../../components/elements/SectionImageRight.svelte';
  
</script>
  

<div class="content flex flex-col spl">
  <HeroCentered>
    <span slot="title">
      One token.<br/>
      Full DeFi Exposure
    </span>

    <span slot="content">
      Index investing is one of the best ways to gain passive exposure to a diversified portfolio.
      With <strong>DXP</strong> you just set it and forget it and let the market do the work!
    </span>
  </HeroCentered>
</div>

<SectionImageRight title="Some text here" image={images.defiplusicons} isGrey={true}>
    <span slot="content">
      A lot more text a lot more text a lot more text a lot more text a lot more text a lot more text a lot more text a lot more text.<br/>
      a lot more text a lot more text a lot more text a lot more text a lot more text a lot more texta lot more text a lot more text.
      a lot more text a lot more text a lot more text a lot more text a lot more text a lot more text.<br/>
      <a class="font-bold mt-4 md:mt-4" target="_blank" href={`https://medium.com/piedao/dough-farming-season-7329ea5e84dd`}>Some link</a><br/>
      <a class="font-bold mt-4 md:mt-4" target="_blank" href={`https://client.aragon.org/?#/piedao/0x968986e7ab9d05b4f6334efdc6c4c5efd89d4119/`}>Another Link</a>
    </span>
</SectionImageRight>

<SectionImageLeft title="Some text here" image={images.howtomigrate} isGrey={false}>
    <span slot="content">
      A lot more text a lot more text a lot more text a lot more text a lot more text a lot more text a lot more text a lot more text.<br/>
      a lot more text a lot more text a lot more text a lot more text a lot more text a lot more texta lot more text a lot more text.
      a lot more text a lot more text a lot more text a lot more text a lot more text a lot more text.<br/>
      <a class="font-bold mt-4 md:mt-4" target="_blank" href={`https://medium.com/piedao/dough-farming-season-7329ea5e84dd`}>Some link</a><br/>
      <a class="font-bold mt-4 md:mt-4" target="_blank" href={`https://client.aragon.org/?#/piedao/0x968986e7ab9d05b4f6334efdc6c4c5efd89d4119/`}>Another Link</a>
    </span>
</SectionImageLeft>

<div class="content flex flex-col w-100pc justify-between spl text-center md:w-80pc">
    <div class="text-xl">
        Not the right fit?
    </div>
    <div class="flex justify-around w-100pc content-center">
      <ProductBox 
        link="#/pie/0x78f225869c08d478c34e5f645d07a87d3fe8eb78"
        image={images.defiplusl}
        title="DLP"
        description="DeFi’s Blue Chips. Bigger is Better."
      />
      
      <ProductBox 
        link="#/pie/0xad6a626ae2b43dcb1b39430ce496d2fa0365ba9c"
        image={images.defiplusl}
        title="DSP"
        description="Small Cap Projects with Big Potential."
      />
    </div>
</div>

<JoinPieDAO />

