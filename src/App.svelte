<script>
  import './styles.css';

  import Footer from './components/Footer.svelte';
  import Header from './components/Header.svelte';

  import { currentRoute } from './stores/routes.js';
</script>

<section id="App">
  <Header />
  <svelte:component this={$currentRoute.page}/>
  <Footer />
</section>
