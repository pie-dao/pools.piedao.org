<script>
  import images from "../config/images.json";
  import smartcontracts from '../config/smartcontracts.json';
  import StakingStats from '../components/StakingStats.svelte';
  import { LottiePlayer } from '@lottiefiles/svelte-lottie-player';
  import { onMount } from 'svelte';
  import Meta from '../components/elements/meta.svelte';
  import BuyDoughButton from '../components/elements/BuyDoughButton.svelte';
  import AddToMetamaskButton from '../components/elements/AddToMetamaskButton.svelte';

    // lottie...
    let controlsLayout = [
    'previousFrame',
    'playpause',
    'stop',
    'nextFrame',
    'progress',
    'frame',
    'loop',
    'spacer',
    'background',
    'snapshot',
    'zoom',
    'info',
  ];

  let proposals;

  export async function fetchLastSnapshots() {
    let res = await fetch('https://hub.snapshot.org/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: `query {
          proposals(
            first: 2,
            skip: 0,
            where: {
              space_in: ["piedao"]
            },
            orderBy: "created",
            orderDirection: desc
          ) {
            id
            state
            title
            body
            choices
            start
            end
            snapshot
            state
            author
            link
          }
        }`
      })
    });

    let response = await res.json();
    return response.data.proposals;
  }  


  onMount(async() => {
    try {
      proposals = await fetchLastSnapshots();
      console.log("proposals", proposals);
    } catch(error) {
      console.error(error);
    }
  });
</script>

<Meta 
    metadata={{
        title: "PieDAO DOUGH, the DAO governance token, managing DEFI index products and high APR staking rewards",
        description: "An overview of PieDAO's governance token DOUGH, the voting system, and the incentives mechanism.",
        image: images.herodough,
        imageAlt: "Ready to diversify and logo, invest in a DEFI index and earn high yield today."
    }}
/>

<div class="videocontainer">
  <video loop muted autoplay poster="https://raw.githubusercontent.com/pie-dao/brand/master/misc/doughvideobg2.jpg" class="bg_video">
    <source src="https://raw.githubusercontent.com/pie-dao/brand/master/misc/doughbgvidlow.mp4" type="video/mp4" data-aos="fade-up" data-aos-delay="500">
  </video>
  <div class="content flex flex-col spl px-4">
    <div class="text-24px font-bold text-lg leading-8 text-center mb-4" data-aos="fade-up" data-aos-delay="100">PieDAO’s<br />Governance Token</div>
    <img src={images.doughcolorful} class="crisp" alt="dough" data-aos="fade-up" data-aos-delay="150"/>
    <div class="text-lg font-thin text-center mt-4 leading-8" data-aos="fade-up" data-aos-delay="200">Contribute and be rewarded<br />for building a better organization and products.</div>
    <BuyDoughButton />
    <AddToMetamaskButton address={smartcontracts.dough} symbol='DOUGH' decimals=18 image={images.doughtoken} darkMode=true />
  </div>
</div>

<div class="flex flex-col items-center text-center mt-4 md:mt-10 mx-4 md:mx-8">
  <div class="flex flex-wrap justify-around w-full max-w-1240px bg-lightgrey rounded pb-12 px-8 md:px-10">
    <div class="min-w-150px flex flex-col items-center leading-5 mt-12"><img class="h-50px inline mb-4" src={images.hourglass} alt="hourglass" /><span>Long term<br />alignment</span></div>
    <div class="min-w-150px flex flex-col items-center leading-5 mt-12"><img class="h-50px inline mb-4" src={images.gem} alt="gem" /><span>Rewarded<br />commitment</span></div>
    <div class="min-w-150px flex flex-col items-center leading-5 mt-12"><img class="h-50px inline mb-4" src={images.pirateflag} alt="pirate flag" /><span>Treasury revenues<br />distribution</span></div>
    <div class="min-w-150px flex flex-col items-center leading-5 mt-12"><img class="h-50px inline mb-4" src={images.womanlaptop} alt="woman laptop" /><span>The future of work<br />is DAO</span></div>
    <div class="min-w-150px flex flex-col items-center leading-5 mt-12"><img class="h-50px inline mb-4" src={images.raisedhand} alt="raised hand" /><span>Hybrid governance<br />beyond coin vote</span></div>
  </div>
</div>

<div class="flex flex-col items-center text-center mt-4 md:mt-10 mx-4 md:mx-8">
  <div class="flex flex-wrap justify-around w-full max-w-1100px pb-12 px-4 md:px-10">
    <div class="font-huge text-center mt-10">A new governance model</div>
    <div class="font-thin text-l text-center mt-20px">
      DOUGH is the basic element to start your journey and be part of the PieDAO family.
      <br /><br />
      If you stake DOUGH for a minimum of 6 months, you get in exchange veDOUGH, PieDAO’s governance token.
      <br /><br />  
      With veDOUGH you can help the community steer the destiny of the DAO and its products, make proposals, vote on issues while being compensated for your commitment and effort.
      <br /><br />  
      In fact PieDAO redistributes 60% of the revenues generated by its products and treasury management to active community members, proportionally to the amount of veDOUGH they hold.
    </div>  
  </div>
</div>


<div class="w-full flex flex-col items-center text-center">
  <div class="flex w-full justify-center">
    <StakingStats />
  </div>
</div>


<div class="flex flex-col items-center text-center md:pt-0 pb-10 mx-8 ">
  <div class="flex flex-wrap justify-around w-full max-w-1100px pb-8 md:pb-12 px-4 md:px-10">
    <div class="font-huge text-center mt-4 md:mt-10">Doughconomics</div>
    <div class="font-thin text-l text-center mt-20px">
      This is how the DAO makes money and how is redistributing them to the system
    </div> 
    <a href="#/staking-simulator" class="font-bold text-base text-center">
      Test your assumptions on the simulator >
    </a>   
  </div>
  <div class="hidden md:block">
    <LottiePlayer
    src="https://assets10.lottiefiles.com/private_files/lf30_wksf88hl.json"
    autoplay="{true}"
    loop="{true}"
    controls="{false}"
    renderer="svg"
    background="white"
    height=""
    width="100%"
    controlsLayout="{controlsLayout}"
    />
  </div>
  <div class="block md:hidden">
    <img class="w-100% inline mb-4" src={images.doughconomics} alt="dough economics diagram" />
  </div>
</div>


<div class="flex flex-col items-center justify-center text-center mt-4 md:mt-10 mx-4 md:mx-8">
  <div class="flex flex-col justify-center md:justify-around w-full max-w-1240px bg-lightgrey rounded pb-4 md:pb-16 px-4 md:px-12">
    <div class="font-huge text-center mt-10">Last votes</div>
    <div class="font-thin text-l text-center mt-20px">Participate on the last Governance decisions</div>
      <div class="flex flex-col md:flex-row flex-grow items-center justify-center md:justify-around text-l mt-20px">
        {#if proposals}
          {#each proposals as proposal}
          <div class="w-full flex justify-center items-center flex-grow md:w-1/2 bg-white py-8 mt-4 md:mt-0 px-4 mx-4 rounded border-thin">
            <a class="flex flex-col items-center" target="_blank" href="{proposal.link}">
              <span class="max-w-250px md:max-w-200px font-bold text-xs bg-pink py-4px px-10px rounded text-white truncate overflow-ellipsis">{proposal.author}</span>
              <span class="my-10px">{proposal.title}</span>
              <span class="w-70px bg-black rounded text-xs text-white p-1">{proposal.state}</span>
              <!-- <p>{@html proposal.body}</p> -->
            </a>
          </div>
          {/each}
        {/if}
      </div>
  </div>
</div>


<div class="flex flex-col items-center text-center mt-8 md:mt-10 mx-8">
  <div class="flex flex-wrap justify-center w-full max-w-1240px mb-4 px-10">
    <img class="h-40px inline" src={images.hourglass} alt="hourglass" />
    <img class="h-40px inline mx-4" src={images.gem} alt="gem" />
    <img class="h-40px inline" src={images.pirateflag} alt="pirate flag" />
  </div>
  <a target="_blank" href="https://medium.com/piedao/piedao-is-expanding-the-core-team-and-open-sourcing-the-search-for-talent-b22fce733293" class="font-bold text-pink text-base text-center">
    We're hiring >
  </a>   
</div>







  