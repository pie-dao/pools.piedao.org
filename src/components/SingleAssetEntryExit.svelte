<script>
    import images from '../config/images.json'
    import smartcontracts from '../config/smartcontracts.json'
    import stakingPools from '../config/stakingPools.json'
    import flattenDeep from 'lodash/flattenDeep';
    import Modal from '../components/elements/Modal.svelte';
    import Swap from '../components/JoinSwapExternAmount.svelte';
    import { pools } from '../stores/eth.js'

    export let allowBCP = false;
    let swapModal;
    let pieOfPies;

    $: bcp = stakingPools.find(pool => pool.slug === 'bcp')

    $: bcpListed = flattenDeep(
        $pools[bcp.stakingToken.toLowerCase()]
    );

    $: listed = flattenDeep(
        $pools[smartcontracts.defi_pp.toLowerCase()].map((component) => {
        if (component.isPie) {
            if (!pieOfPies) pieOfPies = [];
            pieOfPies.push(component);
        }
            return component;
        }),
    );

    $: mergeListed = [...listed, ...bcpListed]

    
</script>

<slot name="launcher">
    <img src={images.defi_pp_merge} alt="defi single asset exchange"
        class="cursor-pointer"
        on:click={() => { swapModal.open() }}
    />
</slot>
<Modal title={'Merge Tokens'} backgroundColor="#f3f3f3" bind:this={swapModal}>
    <span class="w-full" slot="content">
    <!-- <Swap
        listed={mergeListed}
        buyTokenAddress={smartcontracts.defi_pp}
        buyTokenSymbol={'DEFI++'}
    /> -->
    <Swap
        listed={bcpListed}
        buyTokenAddress={bcp.stakingToken}
        buyTokenSymbol={'BCP'}
    />
    </span>
</Modal>
