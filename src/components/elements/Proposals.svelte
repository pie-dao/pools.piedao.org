<script>
  import SvelteMarkdown from 'svelte-markdown';
  export let proposals;
</script>

<div class="flex flex-col md:flex-row flex-grow items-center justify-center md:justify-around text-l mt-20px">
  {#each proposals as proposal}
  <div class="w-full flex justify-center items-center flex-grow md:w-1/2 bg-white py-8 mt-4 md:mt-0 px-4 mx-4 rounded border-thin">
    <a class="flex flex-col items-center" target="_blank" href="{proposal.link}">
      <span class="max-w-250px md:max-w-200px font-bold text-xs bg-pink py-4px px-10px rounded text-white truncate overflow-ellipsis">{proposal.author}</span>
      <span class="my-10px">{proposal.title}</span>
      <span class="w-70px bg-black rounded text-xs text-white p-1">{proposal.state}</span>
      <div class="w-280px lg:w-360px h-100px font-thin text-xs mt-3 text-left nonowrap px-4 truncate"><SvelteMarkdown source={proposal.body} /></div>
    </a>
  </div>
  {/each}
</div>