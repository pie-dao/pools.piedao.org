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
    <div class="genericmodal flex flex-col justify-center items-center">
        <div class="flex items-center bg-white modalcontent w-100pc min-h-100pc overflow-x-hidden overflow-y-auto lg:max-w-50pc lg:max-h-80pc lg:min-w-50pc lg:min-h-50pc" use:clickOutside on:click_outside={() => modalIsOpen = false}>
            <slot name="content">
                
            </slot>
        </div>
    </div>
{/if}