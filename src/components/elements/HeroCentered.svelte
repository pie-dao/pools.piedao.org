<script>
    export let link;
    export let linkLabel;
    export let linkSmall;
    export let linkSmallLabel;
</script>

<div class="content flex flex-col w-100pc justify-between spl text-center md:w-80pc">
  <div class="font-veryhuge">
    <slot name="title">
                
    </slot>
  </div>
  <div class="font-thin text-lg mt-10px mb-10px md:w-80pc">
    <slot name="content">
                
    </slot>
    
    {#if link}
      <a href={link} >
        <button class="btn m-0 mt-4 rounded-8px p-15px min-w-200px w-800px">
          {linkLabel}
        </button>
      </a>
    {/if}
    {#if linkSmall}
      <a href={linkSmall} class="font-bold text-sm mt-20px mb-50px">{linkSmallLabel} ></a>
    {/if}
  </div>
</div>