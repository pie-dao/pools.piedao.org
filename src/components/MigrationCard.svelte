<script>
  export let migrations = [];
</script>

<div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
  {#each migrations as m}
    <div class="w-full rounded-xl flex cardbordergradient items-center">
      <div class="px-4 py-2 flex flex-col mx-auto">
        <div class=" mx-auto my-4">
          <img class="w-200px" src={m.image} alt={m.title} />
        </div>
        <div class="flex flex-col w-full mb-3">
          <span class="text-base leading-6">{m.title}</span>
        </div>
        <div>
          <span class="font-thin text-sm mb-1 opacity-70">{m.description}</span>
        </div>
        <div class="mt-2 pt-2 mb-0 flex items-center justify-between">
          <a
            href={`#/${m.link}`}
            class="flex w-full justify-center rounded-sm border border-transparent items-center bg-label-pink py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-label-pink focus:outline-none focus:ring-2 focus:ring-label-pink focus:ring-offset-2 h-10"
            >{m.button}</a
          >
        </div>
      </div>
    </div>
  {/each}
</div>
