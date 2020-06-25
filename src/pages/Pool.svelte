<script>
  import { currentRoute } from '../stores/routes.js';
  console.log('Pool page currentRoute', $currentRoute);
</script>

<div>Pool: {$currentRoute.params.address}</div>