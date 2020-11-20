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
    <div class="content flex flex-col" use:clickOutside on:click_outside={() => modalIsOpen = false}>
        <slot name="content"></slot>
    </div>
{/if}