<script>
import DXP from './dxp-explanation.svelte'
import BCP from './bcp-explanation.svelte';
import YPIE from './ypie-explanation.svelte';
import PLAY from './play-explanation.svelte';
import SLICE from './slice-explanation.svelte';

export let address;
</script>

<div>
    {#if address === '0x8d1ce361eb68e9e05573443c407d4a3bed23b033'}
        <DXP />
    {:else if address === '0xe4f726adc8e89c6a6017f01eada77865db22da14'}
        <BCP />
    {:else if address === '0x17525e4f4af59fbc29551bc4ece6ab60ed49ce31'}
        <YPIE />
    {:else if address === '0x33e18a092a93ff21ad04746c7da12e35d34dc7c4'}
        <PLAY />
    {:else if address === '0x1083d743a1e53805a95249fef7310d75029f7cd6'}
        <SLICE />
    {/if}
</div>
