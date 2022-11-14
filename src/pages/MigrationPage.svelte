<script>
  import migration from '../config/migration.json';
  import MigrationCardBlock from '../components/MigrationCard.svelte';
</script>

<div class="relative content flex flex-col px-4">
  <div class="mx-auto py-20">
    <h1
      class="text-xl font-bold inline bg-gradient-to-r from-[#ed1ea0] via-[#6c5dfe] to-[#ed1ea0] bg-clip-text tracking-tight text-transparent leading-12"
    >
      About the Migration
    </h1>
    <div class="mt-6 space-y-6 font-display text-sm tracking-tight">
      <p>
        The DAO is transitioning in order to seek a newer product line that is scalable and
        profitable to ensure its future. This transition does not mean we will abandon those who
        invested in PieDAO, that's why we present different buyback options available below. We're
        saying <a
          class="text-pink"
          href="https://forum.piedao.org/t/time-to-say-good-pie/1415"
          target="_blank"
          rel="noopener noreferrer">Good Pie</a
        >
        to our indexes, and taking advantage of this opportunity to rebrand the DAO, our website, and
        our systems to better serve the purpose of building solutions that help us create generational
        wealth for people.
        <a
          class="text-pink"
          href="https://forum.piedao.org/t/the-rise-of-auxo/1419"
          target="_blank"
          rel="noopener noreferrer">Learn more here</a
        >.
      </p>
    </div>
    <div class="mt-20 space-y-6 font-display text-sm text-center tracking-tight">
      <p class="text-lg">Our Buyback Options</p>
      <MigrationCardBlock migrations={migration.tokenBuyBack} />
    </div>
  </div>
</div>
