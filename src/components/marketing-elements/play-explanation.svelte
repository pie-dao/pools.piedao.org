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
      PLAY  provides exposure to the most in demand sectors defining the Metaverse. It seeks to track an index of blockchain gaming, infrastructure and entertainment projects. Web3 backers looking to gain exposure to high liquidity Metaverse assets should consider this token.    </span>
    <br/><br/>
    <span class="font-thin">
      PLAY allows investors to:
      <ul>
        <li>1. Invest in the paradigm-shifting Metaverse ecosystem powered by blockchain</li>
        <li>2. Diversify their portfolios while delegating research and due diligence to the PieDAO community</li>
        <li>3. Mitigate gas costs from managing their positions</li>
      </ul>      
    </span>

    <h1 class="mt-4">Objective:</h1>
    <div class="font-thin">
      The metaverse is a virtual space created by the convergence of physical reality, augmented reality and the internet. While no one knows for sure what the metaverse will look like, its basic characteristics are established – it spans physical and virtual worlds, is centered around a functioning economy, and allows users to experience its different places with relative ease: The virtual world of the metaverse could become its own trillion-dollar industry, being built using blockchains and decentralized applications.
        <br/><br/>
        Blockchain gaming and metaverses, in particular, are an ambitious category of the web3 ecosystem in general. The combination of virtual reality and web3, where ownership inside the virtual world is retained by users is a match made in heaven.
    </div>

    <h1 class="mt-4">Methodology:</h1>

    <div class="font-thin">
      The PieDAO community has established a set of criteria to determine a project's eligibility for inclusion. The criteria seek to achieve exposure to projects whose tokens have high liquidity, security, and provide real value to holders.
    </div>
    <br/>
    <div class="font-thin">
      <b style="color: #ED1EA0">The full PLAY Metaverse Index prospectus is <u><a target="_blank" href="https://gateway.pinata.cloud/ipfs/QmVoACenV8XqAzYg9zyN4Q4cC5tAtiKE5y6WMiJsGnAgqt">here</a></u>, covering:</b>
      <ul>
        <li>1. Eligibility criteria for inclusion in PLAY</li>
        <li>2. Methodology for asset allocation</li>
        <li>3. Rules and procedure for rebalancing</li>
      </ul>        
    </div> 
    <br/>
    <div class="font-thin">
      The allocation methodology considered for initial reference is the Correlated Risk-Adjusted Market Cap, same as per other PieDAO products, improved by weighting in for each underlying asset  the 30 & 15 Day Average Circulating Market Cap, and its 15 Day Average Liquidity on L1 DEXes.
    </div>
    <br/>
    <div class="font-thin">
      The resulting % allocation is further adjusted through the following criteria:
      <ul>
        <li>1. <b>Minimum allocation of 2% for each underlying asset.</b> Introduced  to ensure minimum slippage when minting at scale</li>
        <li>2. <b>Max allocation of 30% for single large cap holding</b>, to limit the predominance of a single large cap holding</li>
        <li>3. <b>Max cumulative allocation of 60% for the top 3 large cap holdings</b>, to eventually prevent the excessive skewness of the Pie toward large caps tokens</li>
        <li>4. <b>Max allocation per underlying asset is capped</b> to limit the slippage occurring when buying the assets on L1 DEXes</li>
        <li>5. <b>Weighting in the momentum of the asset Market Cap</b> over the past 30 days</li>
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
      The rebalancing criteria adopted for PLAY is ruled-based, taking in consideration both a subset of objective conditions playing as <b>triggers for rebalancing</b>, and a broader community consensus, which would decide on the <b>rebalancing urgency</b> based on some reference guidelines defined in the prospectus, as a conscious effort to optimize the overall rebalancing cost by preventing unnecessary rebalancings.
    </div>
  </div>
