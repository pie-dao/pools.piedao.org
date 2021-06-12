<script>
    import { createEventDispatcher } from 'svelte';
    import { _ } from "svelte-i18n";
    import BigNumber from "bignumber.js";
    import debounce from "lodash/debounce";
    import find from "lodash/find";
    import { eth, approveMax } from "../stores/eth.js";
    import { fetchBalances } from '../helpers/multicall';
    import { getTokenImage } from "./helpers";
    import displayNotification from "../notifications";

    export let tokenAddress;
    export let checkAllowance = true;

    const dispatch = createEventDispatcher();

    const defaultAmount = { bn: new BigNumber(0), label: 0 };
    const isEth = tokenAddress === "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE";

    const toNum = (num) => num.dividedBy(10 ** decimals);
    const ethMinusGas = (num) => toNum(num, decimals).minus(toNum(num, decimals).multipliedBy(0.1));

    const ZeroEx = '0xdef1c0ded9bec7f1a1670819833240f027b25eff';

    $: allowances = {};
    $: balances = {};
    $: isLoading = true;
    $: tokenList = [
        {
            address: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
            symbol: 'ETH',
            icon: getTokenImage('eth'),
        },
        {
            address: '0xad32A8e6220741182940c5aBF610bDE99E737b2D',
            symbol: 'DOUGH',
            icon: getTokenImage('0xad32A8e6220741182940c5aBF610bDE99E737b2D')
        },
        {
            address: '0x6b175474e89094c44da98b954eedeac495271d0f',
            symbol: 'DAI',
            icon: getTokenImage('0x6B175474E89094C44Da98b954EedeAC495271d0F')
        }
    ];

    $: initialized = {
        onMount: false,
        onChainData: false
    };

    $: amount = defaultAmount;
    $: balanceError = showBalanceError(amount);
    $: allowanceNeeded = checkAllowance ? needApproval(allowances[tokenAddress]) : false;
    $: decimals = find(tokenList, ['address', tokenAddress]).decimals || 18;

    $: if($eth.address) {
        if(!initialized.onChainData && isLoading) {
            fetchOnchainData();
            initialized.onChainData = true;
            isLoading = false;
        }
    }


    $: if (checkAllowance) {
        dispatch('allowanceNeeded', allowanceNeeded)
    }


    const showBalanceError = amount => {
        if(!balances[tokenAddress]) return;
        const weiAmount = amount.bn.toFixed(0);
        const shouldShowError = !balances[tokenAddress].bn.isGreaterThanOrEqualTo(weiAmount);
        return shouldShowError;
    }

    const fetchOnchainData = async () => {
        tokenList = await fetchBalances(
            tokenList,
            $eth.address,
            $eth.provider
        )

        if (checkAllowance) {
            tokenList.forEach( token => {
                allowances[token.address] = token.allowance;
            })
        }

        tokenList.forEach( token => {
            balances[token.address] = token.balance;
        })
    }

    const needApproval = (allowance) => {
        if (!$eth.address || !$eth.signer) return false;
        if (allowance.isEqualTo(0)) return true;
        if (allowance.isGreaterThanOrEqualTo( amount.bn )) return false;
    }

    const handleMaxInput = () => {
        const tokenBalanceBigBumber = balances[tokenAddress].bn;
        amount.bn = isEth ? ethMinusGas(tokenBalanceBigBumber) : tokenBalanceBigBumber;
        amount.label = isEth ? +ethMinusGas(tokenBalanceBigBumber) : +toNum(tokenBalanceBigBumber);
    }

    const onAmountChange = () => {
        const newAmount = new BigNumber(amount.label).multipliedBy(10 ** decimals);
        amount.bn = newAmount;
        dispatch('inputAmount', newAmount);
    }

    const approveToken = async () => {
        if (!$eth.address || !$eth.signer) {
            displayNotification({ message: $_("piedao.please.connect.wallet"), type: "hint" });
            connectWeb3();
            return;
        }

        const { emitter } = displayNotification(await approveMax(tokenAddress, ZeroEx));

        await fetchOnchainData();
        await new Promise((resolve) => emitter.on('txConfirmed', () => {
            resolve();
            allowanceNeeded = false;
            dispatch('allowanceNeeded', allowanceNeeded)
            const token = find(tokenList, ['address', tokenAddress]);
            return { message: `${token.symbol} unlocked`, type: 'success', address:null };
        }));
  }

</script>

{#if isLoading}
    <div class="animate-pulse flex space-x-4 w-full">
        <div class="flex-1 space-y-4 py-1">
            <div class="h-6 bg-grey-243 rounded-sm w-3/4"></div>
        </div>
    </div>
{:else}
    <div class="flex w-full items-center justify-center">
        <div class="flex w-full nowrap items-center p-1">
            <input 
                class:error={balanceError}
                class="swap-input-from"
                on:focus={() => {amount.label = amount.label === 0 ? '' : amount.label}}
                on:keyup={debounce(onAmountChange, 300, {leading:false, trailing:true})}
                bind:value={amount.label}
                inputmode="decimal"
                title="Token Amount"
                autocomplete="off"
                autocorrect="off"
                type="number"
                pattern="^[0-9]*[.]?[0-9]*$"
                placeholder="0"
                minlength="1"
                maxlength="79"
                spellcheck="false"
            >
            {#if allowanceNeeded}
                <button on:click={approveToken}>🔒</button>
            {/if}
        </div>
        <div class=" text-white font-bold text-xs py-1px text-center items-center rounded">
            <button on:click={handleMaxInput} class="oven-withdraw-button">MAX</button>
        </div>
    </div>
{/if}
