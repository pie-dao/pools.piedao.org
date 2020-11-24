<script>
  export let title;
  export let image;
  export let link;
  export let description;
</script>
{#if link}
<a href={link} class="investment-card flex flex-col w-100pc min-h-150px bg-lightgrey m-10px p-15px lg:w-1/3">
    <img class="w-80px h-auto" src={image} alt={title} />
    <div class="flex flex-col text-center">
        <div class="text-lg mt-5">{title}</div>
        <div class="font-thin">{description}</div>
    </div>
</a>
{:else}
<div href={link} class="investment-card flex flex-col w-100pc min-h-150px bg-lightgrey m-10px p-15px lg:w-1/3">
    <img class="w-80px h-auto" src={image} alt={title} />
    <div class="flex flex-col text-center">
        <div class="text-lg mt-5">{title}</div>
        <div class="font-thin">{description}</div>
    </div>
</div>
{/if}
