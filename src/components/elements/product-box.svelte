<script>
  export let title;
  export let subTitle;
  export let image;
  export let link;
  export let description;
</script>
{#if link}
<a href={link} class="investment-card flex flex-col items-center min-h-150px bg-lightgrey my-10px lg:m-10px p-20px rounded-sm lg:w-1/3">
    <div class="text-center"><img class="w-80px h-auto"src={image} alt={title} /></div>
    <div class="flex flex-col text-center">
        <div class="text-lg">{title}</div>
        {#if subTitle}
            <div>{subTitle}</div>
        {/if}
        <div class="font-thin">{description}</div>
    </div>
</a>
{:else}
<div class="investment-card flex flex-col lg:w-1/3 items-center min-h-150px bg-lightgrey my-10px lg:m-10px p-20px rounded-sm">
    <div class="text-center"><img class="w-80px h-auto"src={image} alt={title} /></div>
    <div class="flex flex-col text-center">
        <div class="text-lg">{title}</div>
        <div class="font-thin">{description}</div>
    </div>
</div>
{/if}
