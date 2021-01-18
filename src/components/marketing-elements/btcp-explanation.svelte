<script>
    import Meta from '../elements/meta.svelte';
</script>

<Meta 
    metadata={{
        title: "BTC++ - PieDAO, BTC index on Ethereum",
        description: "Overview of BTC++, PieDAO diversified tokenized BTC index. A breakdown of the underlying assets imBTC, WBTC, pBTC, sBTC, market performance, motivation, metholodology and operations."
    }}
/>

<div>
    <h1 class="font-lg">Summary:</h1>
    <span class="font-thin">
        ERC20 BTC tokens are much more scalable than the Bitcoin network, taking full advantage of the merits of Ethereum. BTC++ allows you to access these benefits in the safest possible way. It’s a diversified portfolio including multiple different providers, minimizing negative exposure in the event one asset loses its peg.
    </span>

    <h1 class="mt-4">Objective:</h1>
    <div class="font-thin">
        Tokenized BTC allows users to gain exposure to cryptocurrency’s largest coin without having to interact with the Bitcoin network, which can often be congested and costly. Over $2.8b of BTC has migrated to the Ethereum network through a range of different providers. These service providers can be centralized or decentralized, and both types could potentially lose their peg.
        <br/><br/>
        BTC++ minimizes the damage such an event would cause, diversifying your BTC holdings between four different service providers. If any one token fell to 0%, holders of this pie would lose just 25% instead of everything.
    </div>

    <h1 class="mt-4">Methodology:</h1>

    <div class="font-thin">
        BTC++ contains four of the leading BTC tokens on the market.
        <br/><br/>
        Unlike our DeFi pies that are weight-based, as a community we voted to evenly diversify BTC++ between the four selected tokens. That’s because this pie is focused on risk minimisation, and a 25% allocation evenly distributes the risk and minimizes potential damage.
    </div>

    
    <h1 class="mt-4">Operation:</h1>

    <div class="font-thin">
        BTC++ is a tokenized representation of the four underlying ERC20 tokens. When a user mints BTC++, our contract either purchases the underlying tokens from decentralized markets or uses available tokens in the users wallet. The funds are safely stored in our non-custodial treasury, meaning that every single BTC++ token is fully backed by reserves. Users can buy BTC++ on the open market and redeem for the underlying tokens at any time.
        <br/><br/>
        The token is created using a Balancer pool which constantly automatically rebalances to maintain the desired allocation. This is done at no cost to holders of BTC++.
    </div>
    
</div>