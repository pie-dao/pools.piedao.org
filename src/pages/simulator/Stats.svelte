<script>
  import firebase from 'firebase';
  import firebase_env from '../../config/firebase.json';

  function loadSimulations() {
    firebase.firestore().collection('staking_simulations').get().then(response => {
        response.docs.forEach(doc => {
          console.log("simulation", doc.id, doc.data());
        });
      }).catch(error => {
        console.error(error);
      });      
  }

  // firebase variables...
  let firebase_app = null;
  let permalink_url = null;
  let simulationChanged = false;
  let simulation = {
    name: '',
    author: ''
  }

  // initialize firebase app instance...
  if (!firebase.apps.length) {
    firebase_app = firebase.initializeApp(firebase_env);
  } else {
    firebase_app = firebase.app();
  }

  // loading all the existing simulations...
  loadSimulations();
</script>

<div class="flex flex-col items-center text-center mt-8">
  <div class="w-full px-8 max-w-1200px">
    <div class="font-hero font-hero-sim">New<br />Governance<br />Mining</div>
    <a href="#/placeholder" data-aos="fade-up" data-aos-delay="500"><button class="btnbig text-white m-0 my-8 rounded-8px p-15px min-w-200px w-100pc lg:w-200px lg:min-w-200px">Earn up to 45% APY</button></a>
    <div class="text-base font-thin mx-4 md:mx-20pc mb-8">Invest in <strong>veDOUGH*</strong> and build your cashflow, taking additional yield from PieDAO farmed treasury.</div>
    <div class="font-huge">How it works</div>
</div>
</div>

