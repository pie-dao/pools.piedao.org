<script>
    import images from '../config/images.json'
    import smartPools from '../config/pools.json'
    import Modal from '../components/elements/Modal.svelte';
    import Swap from '../components/JoinSwapExternAmount.svelte';
    import { pools } from '../stores/eth.js'

    export let buyTokenAddress;
    export let openTrigger = () => swapModal.open();
    let swapModal;

    $: listed = $pools[buyTokenAddress.toLowerCase()];
    $: symbol = smartPools[buyTokenAddress.toLowerCase()].symbol;    
    
</script>
<section>
    <slot>
        <img src={images.defi_pp_merge} alt="defi single asset exchange"
            class="cursor-pointer"
            on:click={openTrigger}
        />
    </slot>
    <Modal title={'Swap Tokens'} backgroundColor="#f3f3f3" bind:this={swapModal}>
        <span class="w-full" slot="content">
        <Swap
            {listed}
            {buyTokenAddress}
            buyTokenSymbol={symbol}
        />
        </span>
    </Modal>
</section>
