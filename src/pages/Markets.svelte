<script>
import orderBy from 'lodash/orderBy';
import {getSubgraphMetadata, getPoolSwaps, getPoolMetrics} from '../helpers/subgraph.js'
( async () => {
const poolId = '0x0e5c1813587088378787e7dd6c9cb4cb01a0ea18';


const metadata = await getSubgraphMetadata(poolId);
const swaps = await getPoolSwaps(poolId);
const metrics = await getPoolMetrics(poolId);

console.log('res', {
    swaps,
    metadata,
    metrics
});

})()
</script>
<div>
Markets
</div>