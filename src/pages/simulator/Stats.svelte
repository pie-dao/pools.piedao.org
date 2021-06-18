<script>
  import firebase from 'firebase';
  import firebase_env from '../../config/firebase.json';
  import { onMount } from 'svelte';
  import displayNotification from '../../notifications';

  let simulations = [];
  let filterQuery = '';
  let firebase_app = null;

  function loadSimulations() {
    simulations = [];

    firebase.firestore().collection('staking_simulations').get().then(response => {
      response.docs.forEach(doc => {
        simulations.push({id: doc.id, data: doc.data()});
      });

      simulations = simulations;
    }).catch(error => {
      console.error(error);
    });      
  }

  function filterSimulations() {
    if(filterQuery) {
      let queryObj = JSON.parse(filterQuery);
      let dbRef = firebase.firestore().collection('staking_simulations');

      queryObj.forEach(param => {
        dbRef = dbRef.where(param.field, param.operator, param.value);
      });

      simulations = [];

      dbRef.get().then(querySnapshot => {
        querySnapshot.forEach(doc => {
          simulations.push({id: doc.id, data: doc.data()});
        });

        simulations = simulations;
      }).catch(error => {
        displayNotification({
          message: 'Sorry, this query requires a composite index.',
          type: "error",
        }); 

        console.error(error);
        loadSimulations();
      }); 
    } else {
      loadSimulations();
    }
  }

  // initialize firebase app instance...
  if (!firebase.apps.length) {
    firebase_app = firebase.initializeApp(firebase_env);
  } else {
    firebase_app = firebase.app();
  }

  onMount(() => {
    // loading all the existing simulations...
    loadSimulations();
  });  
</script>

<div class="flex flex-row items-center text-center mt-8">
  <div class="w-full px-8">
    <div class="font-huge">Simulator Stats</div>
    <div class="text-base font-thin mx-4">
      A simple tool to monitor all the saved loadSimulations.
      <br>
      Still under development / improvement.
      <br><br>
      the data struct we're using is:
      <br>
      <code>
        name
        author
        inputs
        rewards
      </code>
      <br><br>
      <code>inputs</code> contains:<br>
      <code>
        commitment
        expectedApr
        rewardsUnclaimed
        stakedDough
        stakedVeDough
      </code>      
      <br><br>
      <code>rewards</code> contains an array of:<br>
      <code>
        commitment
        months
        percentage
      </code>
      <br><br>
      The query is an array of json object, for example:<br>
      <code>
        [&lbrace;"field": "inputs.expectedApr", "operator": ">=", "value": "50%"&rbrace;,&lbrace;"field": "inputs.commitment", "operator": "==", "value": "18 Months"&rbrace;]
      </code>
    </div>
  </div>
</div>

<div class="w-full p-8">
  <div class="flex flex-col nowrap swap-from border rounded-20px border-grey p-8px bg-white">
    <div class="flex nowrap items-center p-1">
      <input
        class="swap-input-from"
        style="font-size: 15px !important"
        inputmode="text"
        autocomplete="off"
        autocorrect="off"
        type="string"
        spellcheck="false"
        placeholder="write your json query in here..."
        on:change={filterSimulations}
        bind:value={filterQuery}
      />
    </div>
  </div>                
</div>  

<div class="flex flex-row md:flex-row gap-2 mb-2">
  <div class="w-full m-8 bg-lightgrey rounded text-black p-8 flex flex-col">
    <div class="flex flex-col md:flex-row border-b-2 border-gray-50 pb-4px text-center">
      <div class="flex-initial w-full md:w-1/5">
        <div class="text-base">Name</div>
      </div>
      <div class="flex-initial w-full md:w-1/5 mt-2 md:mt-0">
        <div class="text-base">Author</div>
      </div>
      <div class="flex-initial w-full md:w-1/5 mt-2 md:mt-0">
        <div class="text-base">Staking</div>
      </div>       
      <div class="flex-initial w-full md:w-1/5 mt-2 md:mt-0">
        <div class="text-base">Commitment</div>
      </div>      
      <div class="flex-initial w-full md:w-1/5 mt-2 md:mt-0">
        <div class="text-base">APR</div>
      </div>  
      <div class="flex-initial w-full md:w-1/5 mt-2 md:mt-0">
        <div class="text-base">Unclaimed</div>
      </div>
    </div>    
    {#each simulations as simulation}
      <a target="_blank" href={window.location.origin + '/#/simulator/' + simulation.id}>
        <div class="flex flex-col md:flex-row border-b-2 border-gray-50 pb-4px text-center">
          <div class="flex-initial w-full md:w-1/5">
            <div class="font-thin mt-2">{simulation.data.name}</div>
          </div>
          <div class="flex-initial w-full md:w-1/5 mt-2 md:mt-0">
            <div class="font-thin mt-2">{simulation.data.author}</div>
          </div>
          <div class="flex-initial w-full md:w-1/5 mt-2 md:mt-0">
            <div class="font-thin mt-2">{simulation.data.inputs.stakedDough}</div>
          </div>
          <div class="flex-initial w-full md:w-1/5 mt-2 md:mt-0">
            <div class="font-thin mt-2">{simulation.data.inputs.commitment}</div>
          </div>
          <div class="flex-initial w-full md:w-1/5 mt-2 md:mt-0">
            <div class="font-thin mt-2">{simulation.data.inputs.expectedApr}</div>
          </div>
          <div class="flex-initial w-full md:w-1/5 mt-2 md:mt-0">
            <div class="font-thin mt-2">{simulation.data.inputs.rewardsUnclaimed}</div>
          </div>
        </div>
      </a>
    {/each}
  </div>
</div>


