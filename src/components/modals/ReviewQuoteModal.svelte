<script>    
    import BigNumber from "bignumber.js";
    import { quoteRefreshSeconds } from '../../classes/Timer';
    import {
        toFixed
    } from "../../components/helpers.js";
    
    
    export let quote;
    export let frozeQuote;
    export let confirm;
    export let isLoading;
    export let sellToken;
    export let buyToken;
    export let close;

    let frozeQuoteCopy = {...frozeQuote};

    const toNum = (num) => (BigNumber(num.toString()).dividedBy(10 ** 18)).toFixed(6);

    
    $: {
        console.log(quote)
        console.log(frozeQuote)    
        console.log(confirm)    
        console.log(isLoading)    
    }
    
    
</script>


<div class="liquidity-container flex-col justify-items-center bg-grey-243 rounded-4px lg:px-4 lg:pb-4">
    {#if isLoading}
        Finalizing Quote..
    {:else}
        <div class="flex justify-center font-thin mb-2">
            {#if frozeQuote}
                Quote expires in {$quoteRefreshSeconds} seconds.
            {:else}
                Quote expired.
            {/if}
        </div>
        
        <div class="flex w-100pc bg-lightgrey-2 p-4 rounded mt-8 flex-col text-black text-center text-xs md:text-xs lg:text-base justify-around">
            <div class="flex w-100pc justify-between items-center py-2 px-4  bg-white rounded">
                <div class="flex flex-col items-start">
                    <div class="font-thin text-base">
                        Your Pay
                    </div>
                    <div class="font-bold text-base">{toNum(frozeQuoteCopy.sellAmount)} {sellToken.symbol}</div>
                </div>
            </div>
            
            <div class="flex w-100pc justify-between items-center py-2 px-4 mt-2 bg-white rounded">
                <div class="flex flex-col items-start">
                    <div class="font-thin text-base">
                        You Receive
                    </div>
                    <div class="font-bold text-base"> {toNum(frozeQuoteCopy.buyAmount)} {buyToken.symbol} </div>
                </div>
            </div>
            
        </div>
        
        <div class="flex w-100pc p-4 rounded mt-1 flex-col text-black text-center text-xs md:text-xs lg:text-base justify-around">
            <div class="flex items-center w-100pc justify-between">
                <div class="flex nowrap intems-center p-1 font-thin">Guaranteed Minimum:</div>
                <div class="sc-kkGfuU hyvXgi css-1qqnh8x font-thin" style="display: inline;">{parseFloat(frozeQuoteCopy.guaranteedPrice).toFixed(6)} {buyToken.symbol}</div>
            </div>
        </div>
        
        {#if frozeQuote}
            <button on:click={confirm} disabled={isLoading} class="stake-button mt-10px rounded-20px p-15px w-100pc">Swap</button>
        {:else}
            <button on:click={() => {
                close();
            }} class="btn clear stake-button mt-10px rounded-20px p-15px w-100pc">Refresh Quote</button>
        {/if}
    {/if}
</div>