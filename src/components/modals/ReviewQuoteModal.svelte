<script>    
    import BigNumber from "bignumber.js";
    import get from 'lodash/get';
    import { quoteRefreshSeconds } from '../../classes/Timer';
    import { piesMarketDataStore } from '../../stores/coingecko';
        
    export let frozeQuote;
    export let confirm;
    export let fetchQuote;
    export let isLoading;
    export let sellToken;
    export let buyToken;
    export let includeMarket = true;

    let frozeQuoteCopy = {...frozeQuote};

    $: decimals = {
        sell: sellToken?.decimals ?? 18,
        buy: buyToken?.decimals ?? 18,
    };

    const toNum = (num, decimals) => (BigNumber(num.toString()).dividedBy(10 ** decimals)).toFixed(6);
    const toNumBuy = (num) => toNum(num, decimals.buy);
    const toNumSell = (num) => toNum(num, decimals.sell);

    $: marketPrice = get($piesMarketDataStore, `${buyToken.address.toLowerCase()}.market_data.current_price`, 0);

    $: price = parseFloat(get($piesMarketDataStore, `${sellToken.address}.market_data.current_price`, 0))
    $: buyPrice = (1/parseFloat(frozeQuoteCopy.guaranteedPrice))
    $: usdBuyPrice = (price*buyPrice).toFixed(2)

    $: spread = (usdBuyPrice - marketPrice) / usdBuyPrice * 100;
    $: {
        console.log(sellToken, price)
        console.log('$piesMarketDataStore', $piesMarketDataStore)
    }
    
</script>


<div class="liquidity-container flex-col justify-items-center bg-grey-243 rounded-4px lg:px-4 lg:pb-4">
    <div class="flex justify-center font-thin mb-2">
    {#if isLoading}
        <p>Sign transaction on Metamask...</p>
    {:else if includeMarket}
        <div class="flex justify-center font-thin mb-2">
            {#if frozeQuote}
                Quote expires in {$quoteRefreshSeconds} seconds.
            {:else}
                Quote expired.
            {/if}
        </div>
        {/if}
    </div>        
        <div class="flex w-100pc bg-lightgrey-2 p-4 rounded mt-8 flex-col text-black text-center text-xs md:text-xs lg:text-base justify-around">
            <div class="flex w-100pc justify-between items-center py-2 px-4  bg-white rounded">
                <div class="flex flex-col items-start">
                    <div class="font-thin text-base">
                        You Pay
                    </div>
                    <div class="font-bold text-base">{toNumSell(frozeQuoteCopy.sellAmount)} {sellToken.symbol}</div>
                </div>
            </div>

            {#if !includeMarket && frozeQuote?.amountWithPremiumLabel && !frozeQuote?.amountWithSlippageLabel}
            <div class="flex w-100pc justify-between items-center py-2 px-4 mt-2 bg-white rounded">
                <div class="flex flex-col items-start">
                    <div class="font-thin text-base">
                        Max Price
                    </div>
                    <div class="font-bold text-base"> {parseFloat(frozeQuoteCopy.amountWithPremiumLabel).toFixed(6)} {sellToken.symbol} </div>
                </div>
            </div>
            {/if}            
            
            <div class="flex w-100pc justify-between items-center py-2 px-4 mt-2 bg-white rounded">
                <div class="flex flex-col items-start">
                    <div class="font-thin text-base">
                        You Receive
                    </div>
                    <div class="font-bold text-base"> {toNumBuy(frozeQuoteCopy.buyAmount)} {buyToken.symbol} </div>
                </div>
            </div>

            {#if !includeMarket && frozeQuote?.amountWithSlippageLabel && !frozeQuote?.amountWithPremiumLabel}
            <div class="flex w-100pc justify-between items-center py-2 px-4 mt-2 bg-white rounded">
                <div class="flex flex-col items-start">
                    <div class="font-thin text-base">
                        Minimum
                    </div>
                    <div class="font-bold text-base"> {parseFloat(frozeQuoteCopy.amountWithSlippageLabel).toFixed(6)} {buyToken.symbol} </div>
                </div>
            </div>
            {/if}
            
        </div>
        
        <div class="flex w-100pc p-4 rounded mt-1 flex-col text-black text-center text-xs md:text-xs lg:text-base justify-around">
            {#if includeMarket}    
            <div class="flex items-center w-100pc justify-between">
                <div class="flex nowrap intems-center p-1 font-thin">Price You Pay:</div>
                <div class="sc-kkGfuU hyvXgi css-1qqnh8x font-bold" style="display: inline;">1 {buyToken.symbol} @ {buyPrice.toFixed(6)} {sellToken.symbol} (${usdBuyPrice})</div>
            </div>
            <div class="flex items-center w-100pc justify-between">
                <div class="flex nowrap intems-center p-1 font-thin">CoinGecko Price:</div>
                <div class="sc-kkGfuU hyvXgi css-1qqnh8x font-bold" style="display: inline;">${marketPrice}</div>
            </div>            
            <div class="flex items-center w-100pc justify-between">
                <div class="flex nowrap intems-center p-1 font-thin">Guaranteed Price:</div>
                <div class="sc-kkGfuU hyvXgi css-1qqnh8x font-thin" style="display: inline;">1 {sellToken.symbol} @ {parseFloat(frozeQuoteCopy.guaranteedPrice).toFixed(6)} {buyToken.symbol}</div>
            </div>
            {/if}


            {#if spread > 10}
                <div class="flex items-center w-100pc justify-between">
                    <div class="flex nowrap intems-center p-1 font-bold">🚨🚨🚨</div>
                    <div class="sc-kkGfuU hyvXgi css-1qqnh8x font-bold text-pink" style="display: inline;">Slippage {spread.toFixed(2)}%</div>
                </div>
            {/if}
        </div>
        
        {#if frozeQuote}
            <button on:click={confirm} disabled={isLoading} class="stake-button mt-10px rounded-20px p-15px w-100pc">Swap</button>
        {:else}
            <button on:click={() => {
                fetchQuote(false, true);
            }} class="btn clear stake-button mt-10px rounded-20px p-15px w-100pc">Refresh Quote</button>
        {/if}
</div>