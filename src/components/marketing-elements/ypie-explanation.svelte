<script>
    import images from '../../config/images.json';
    import Meta from '../elements/meta.svelte';
</script>
<div>

    <Meta 
        metadata={{
            title: "YPIE Page, the Yearn Finance DEFI Index - PieDAO",
            description: "Overview of YPIE PieVault DEFI index (Yearn Ecosystem Pie). Including performance, underlying assets, strategy, and the methodology and motivation for the pie.. YPIE contains SUSHI, YFI, CREAM,  KP3R, AKRO and PICKLE.",
            image: images.ypie,
            imageAlt: "YPIE DEFI index assets and their high APR yield-generating strategies."
        }}
    />
    
    <h1 class="font-lg">Summary:</h1>
    <span class="font-thin">
        Yearn Finance Ecosystem Pie provides complete exposure to the growing Yearn network. YPIE is a PieVault, unlocking extra capabilities and active strategies.
        <br/>Metagovernance, staking, lending, and interest-bearing assets are enabled by default and operate in the background without requiring any extra work from the pie holder. These revenue streams continually cause YPIE tokens to appreciate in value, redeemable for a greater share of underlying assets over time.
    </span>

    <h1 class="mt-4">Objective:</h1>
    <div class="font-thin">
        YPIE was proposed by a community member with the goal of tracking the growing suite of tools falling under the Yearn Finance Umbrella. YPIE holders get balanced exposure to this rapidly appreciating emerging DeFi ecosystem with just one easy to mint ERC-20 token.
        <br/><br/>
        As a PieVault YPIE aims to give holders a greater return than regular pies, utilising interest-bearing versions of the underlying assets, lending those assets across DeFi (bouncing between protocols for the best return), and maximising governance participation with metagovernance
    </div>

    <h1 class="mt-4">Methodology:</h1>

    <div class="font-thin">
        The community came to consensus that YPIE should include the full range of Yearn Ecosystem products. Due to the variance in market capitalization it was agreed that our weight-based allocation methodology should be used, using a 30 day average price to minimise the impact of recent market volatility .
        <br/><br/>
        Following this design a larger percentage allocation is given to YFI and SUSHI, the two assets with large market capitalizations, and a smaller percentage to the remaining assets.
        <br/><br/>
        This is done in order to minimise the risk of a smaller project becoming a bottleneck preventing the pie from growing. Through this design we can maximise the scalability of YPIE.
    </div>

    
    <h1 class="mt-4">Operation:</h1>
    <img src={images.ypie} alt="Yearn Finance Ecosystem Pie Explanation"/>
    <div class="font-thin">
        Unlike regular pies which are Balancer pools, YPIE is a PieVault. 
        <br/><br/>
        PieVaults allow for interaction with smart-contracts, allowing the assets to be used productively across DeFi.
        <br/><br/>
        Three core features are enabled upon launch:
        <br/><br/>
        <strong>Metagovernance:</strong> The underlying assets are delegated to the DAO, allowing DOUGH holders to participate in governance decisions across the Yearn ecosystem.
        <br/><strong>Staking:</strong> The PieVault actively stakes tokens in DeFi protocols in order to obtain interest-bearing versions of each asset, providing an additional revenue stream for YPIE holders.
        <br/><strong>Lending:</strong> The YPIE PieVault lends the underlying assets to provide yet another revenue stream for holders. YPIE bounces between lending protocols (Cream, Yearn, Aave) as rates fluctuate, ensuring pie holders receive the best return on the market. 
        <br/><br/>
        Due to interest-bearing assets and lending the underlying assets in YPIE continue to grow, so YPIE tokens will increasingly accrue value as time goes on.
        <br/><br/>
        Because PieVaults are not Balancer AMMs (automated market makers) YPIE does not constantly rebalance. Instead YPIE goes through regular re-balancing periods, ensuring it continues to respond to market changes and reflect the desired allocation.
    </div>
    
</div>