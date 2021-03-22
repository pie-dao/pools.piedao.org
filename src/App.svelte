<script>
  import "./styles.css";
  import AOS from 'aos';
  import 'aos/dist/aos.css'; 
  import Analytics from "./components/elements/Analytics.svelte";
  import Footer from "./components/Footer.svelte";
  import Header from "./components/Header.svelte";
  import { currentRoute } from "./stores/routes.js";
  import ModalVideo from "./components/elements/ModalVideo.svelte"

  AOS.init({
  once: true
});
</script>

<ModalVideo backgroundColor="">
  <span slot="content">
    <div class="videoWrapper">
      <iframe width="560" height="315" src="https://www.youtube.com/embed/2AT6LqYjj4s?controls=0" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>    </div>
  </span>
</ModalVideo>

<section id="App">
  <Header />
  <Analytics id={'G-DFT6D7P7L3'} />
  <svelte:component this={$currentRoute.page} params={$currentRoute.params} />
  <Footer />
</section>
