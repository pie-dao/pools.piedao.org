<script>
  export let title;
  export let image;
  export let description;
</script>


<div class="white-card flex flex-col w-100pc lg:w-1/3 items-center min-h-150px bg-white my-10px lg:m-10px p-20px rounded-sm">
    <div class="text-center"><img class="w-80px h-auto"src={image} alt={title} /></div>
    <div class="flex flex-col text-center">
        <div class="text-lg">{title}</div>
        <div class="font-thin">{description}</div>
    </div>
</div>

