<script>
  import { formatFiat } from '../components/helpers.js';
  import { toNum, claim , getParticipations} from '../helpers/staking.js';
  import images from '../config/images.json';

  export let accountVeTokenBalance;
</script>

<div class="flex flex-col items-center w-full md:w-1/2 p-1px bg-lightgrey rounded-16 m-10px">
  <div class="flex flex-col nowrap w-96pc m-2pc swap-from rounded-20px bg-white p-16px">
    <div class="font-huge text-center">Governance</div>
    <div class="flex flex-row text-center p-1">
      <div class="flex flex-col items-left">
        <img class="h-auto w-24px mx-5px" src={images.veDough} alt="dough token" />
        <span class="token-symbol-container">Your veDOUGH</span>          
      </div>
      <div class="flex flex-col items-right">
        <div class="font-24px">
          {formatFiat(toNum(accountVeTokenBalance), ',', '.', '')}
        </div>        
      </div>
    </div>
  </div>
</div>