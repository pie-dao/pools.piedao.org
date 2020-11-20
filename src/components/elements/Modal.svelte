<script>
import {clickOutside} from '../../helpers/clickOutside.js';

export let backgroundColor;

export const open = () => {
    modalIsOpen = true;
}

export const close = () => {
    modalIsOpen = false;
}

let modalIsOpen = false;
console.log('backgroundColor', backgroundColor)
</script>

{#if modalIsOpen}
    <div class="genericmodal flex flex-col justify-center items-center">
        <div style={ backgroundColor ? `background-color: ${backgroundColor} !important` : "#fff"} 
             class="flex modalcontent items-start w-100pc min-h-100pc overflow-x-hidden overflow-y-auto lg:max-w-50pc lg:max-h-80pc lg:h-80pc lg:min-w-50pc lg:min-h-50pc" use:clickOutside on:click_outside={() => modalIsOpen = false}>
            <slot name="content">
                
            </slot>
        </div>
    </div>
{/if}