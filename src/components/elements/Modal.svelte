<script>
import {clickOutside} from '../../helpers/clickOutside.js';

export const open = () => {
    modalIsOpen = true;
}

export const close = () => {
    modalIsOpen = false;
}

let modalIsOpen = false;
</script>

{#if modalIsOpen}
    <div class="genericmodal flex flex-col justify-center items-center" use:clickOutside on:click_outside={() => modalIsOpen = false}>
        <slot name="content" class="bg-white modalcontent">
                
        </slot>
    </div>
{/if}