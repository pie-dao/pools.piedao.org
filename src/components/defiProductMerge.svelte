<script>
    import images from '../config/images.json'
    import smartcontracts from '../config/smartcontracts.json'
    import flattenDeep from 'lodash/flattenDeep';
    import Modal from '../components/elements/Modal.svelte';
    import Swap from '../components/JoinSwapExternAmount.svelte';
    import { pools } from '../stores/eth.js'

    let swapModal;
    let pieOfPies;

    $: listed = flattenDeep(
        $pools[smartcontracts.defi_pp.toLowerCase()].map((component) => {
        if (component.isPie) {
            if (!pieOfPies) pieOfPies = [];
            pieOfPies.push(component);
        }
            return component;
        }),
    );
    
</script>

<img src={images.defi_pp_merge} alt="defi single asset exchange"
    class="cursor-pointer"
    on:click={() => { swapModal.open() }}
/>
<Modal title={'Merge Tokens'} backgroundColor="#f3f3f3" bind:this={swapModal}>
    <span class="w-full" slot="content">
    <Swap
        {listed}
        buyTokenAddress={smartcontracts.defi_pp}
        buyTokenSymbol={'DEFI++'}
    />
    </span>
</Modal>
