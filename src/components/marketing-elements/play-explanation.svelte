<script>
    import images from '../../config/images.json';
    import Meta from '../elements/meta.svelte';
</script>
<div>

    <Meta 
        metadata={{
            title: "PLAY Page, NFT/Gaming Index - PieDAO",
            description: "PieDAO & NFTX team up to bring to market the most comprehensive NFT/Gaming index in the market.",
            image: images.ypie,
            imageAlt: "PLAY index assets."
        }}
    />
    
    <h1 class="font-lg">Summary:</h1>
    <span class="font-thin">
      PLAY is the result of a collaborative effort between the PieDAO and the NFTX communities, established with the clear goal to create the best and broadest Metaverse Index currently on the market, providing full exposure to most sectors defining the Metaverse ecosystem, including blockchain gaming and infrastructure, collectibles, and art. 
    </span>
    <br/><br/>
    <span class="font-thin">
      PLAY allows investors to simply:
      <ul>
        <li>1. Invest in the paradigm-shifting Metaverse ecosystem empowered by blockchain</li>
        <li>2. Diversify their portfolios while delegating the research due diligence to the PieDAO and NFTX communities</li>
        <li>3. Mitigate gas costs from managing their positions</li>
      </ul>      
    </span>

    <h1 class="mt-4">Objective:</h1>
    <div class="font-thin">
      The metaverse can be defined as a virtual shared space created by the convergence of virtually enhanced physical reality, augmented reality and the internet. While no one knows for sure what the metaverse will look like, its basic characteristics are established – it spans physical and virtual worlds, is centered around a fully functioning economy, and allows users to experience its different places with relative ease: The virtual world of the metaverse could become its own trillion-dollar industry, being built using blockchains and decentralized applications.
        <br/><br/>
        Blockchain gaming and metaverses, in particular, are an ambitious category of the crypto ecosystem in general and within ethereum. The combination of virtual reality and crypto, where ownership inside the virtual world is retained by users is a match made in heaven.
    </div>

    <h1 class="mt-4">Methodology:</h1>

    <div class="font-thin">
      The PieDAO community has established a set of criteria to determine eligibility of a project to a vote for inclusion.  The defined project inclusion criteria seek to achieve a diversified exposure to solid projects, whose tokens have reasonable distribution and liquidity, security, and provide a real value proposition to PLAY token holders.
    </div>
    <br/>
    <div class="font-thin">
      The full PLAY Metaverse Index prospectus can be found <a target="_blank" href="https://gateway.pinata.cloud/ipfs/QmVoACenV8XqAzYg9zyN4Q4cC5tAtiKE5y6WMiJsGnAgqt">here</a>, covering:
      <ul>
        <li>1. Eligibility criteria for inclusion in PLAY</li>
        <li>2. Methodology for asset allocation</li>
        <li>3. Rules and procedure for rebalancing</li>
      </ul>        
    </div> 
    <br/>
    <div class="font-thin">
      The allocation methodology considered for initial reference is the <b>Correlated Risk-Adjusted Market Cap</b>, same as for other Pies offered by PieDAO, taking in consideration the 30 Day Average Circulating Market Cap for each underlying asset.
    </div>
    <br/>
    <div class="font-thin">
      The resulting % allocation is further adjusted through the following criteria:
      <ul>
        <li>1. <b>Minimum allocation of 2% for each underlying asset</b>, introduced in order to ensure both a proper degree of diversification and the correct representation in the Pie of small cap assets.</li>
        <li>2. <b>Max allocation of 30% for single large cap holding</b>, to limit the predominance of a single large cap holding</li>
        <li>3. <b>Max cumulative allocation of 60% for the top 3 large cap holdings</b>, to eventually prevent the excessive skewness of the Pie toward large caps tokens</li>
        <li>4. Max allocation per underlying asset is capped so that its <b>$ value is &leq; 10% of its pooled $ liquidity found on L1 DEXes</b></li>
        <li>5. Weighting in the <b>momentum of the asset Market Cap over the past 30 days.</b></li>
      </ul>       
    </div>   

    <h1 class="mt-4">Operation:</h1>
    <div class="font-thin">
      PLAY is a PieVault, benefitting from a more secure architecture than traditional AMM based ETF products. PieVaults allow flexibility in the allocation, enabling holders to benefit from upward price movements without ‘selling the winners’ and buying the losers. 
      <br/><br/>
      Just like existing PieVaults, PLAY will enable meta-governance, with DOUGH holders able to vote using the underlying assets in their respective protocol decisions.
      <br/><br/>
      Active strategies are also possible and will be activated over time as they become available, with the PieVault bouncing between strategies as yields change to maintain the highest possible return for holders. PLAY holders passively benefit from this intrinsic productivity, without having to perform any action themselves.
      <br/><br/>
      The rebalancing criteria adopted for PLAY is ruled-based, taking in consideration both a subset of objective conditions playing as <b>triggers for rebalancing</b>, and a broader community consensus, which would decide on <b>the rebalancing urgency</b> based on some reference guidelines defined in the prospectus, as a conscious effort to optimize the overall rebalancing cost by preventing unnecessary rebalancings.
    </div>
  </div>