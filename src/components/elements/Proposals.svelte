<script>
  import SvelteMarkdown from 'svelte-markdown';
  export let proposals;
</script>

<div class="flex flex-col md:flex-row flex-grow  md:justify-around text-l mt-20px gap-x-4">
  {#each proposals as proposal}
    <a
      class="w-full flex flex-grow md:w-1/2 bg-white p-8 mt-4 md:mt-0 rounded border-thin"
      target="_blank"
      href={proposal.link}
    >
      <div class="wrap flex flex-col w-full">
        <div class="w-full flex items-center justify-between">
          <div
            class="font-bold text-xs bg-darkgrey py-4px px-10px rounded text-white truncate overflow-ellipsis text-xs"
          >
            {proposal.author}
          </div>
          <div class="ml-4 w-80px bg-pink rounded text-xs text-white p-1 capitalize">
            {proposal.state}
          </div>
        </div>
        <div class="mt-3 break-words text-left leading-6">{proposal.title}</div>
        <div
          class="mt-2 max-h-100px break-words font-thin text-xs text-left overflow-ellipsis overflow-hidden"
        >
          <SvelteMarkdown source={proposal.body} />
        </div>
      </div>
    </a>
  {/each}
</div>
