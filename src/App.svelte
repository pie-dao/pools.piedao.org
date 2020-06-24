<script>
  import './styles.css';

  import Header from './components/Header.svelte';

  const message = 'Learn Svelte';
</script>

<section id="App">
  <Header />
  <div class="App">
    <div class="content text-center flex-col font-normal">
      <header class="App-header">
        <img src="/logo.svg" class="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.svelte</code> and save to reload.
        </p>
        <a
          class="App-link"
          href="https://svelte.dev"
          target="_blank"
          rel="noopener noreferrer"
        >
          {message}
        </a>
      </header>
    </div>
  </div>
</section>
