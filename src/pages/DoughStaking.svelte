<script>

    import {
      eth,
    } from "../stores/eth.js";
    import { BigNumber, ethers } from "ethers";
    import sharesTimeLockABI from "../abis/sharesTimeLock.json";
    import smartcontracts from '../config/smartcontracts.json';
    import { get } from "svelte/store";

    const data = {
        totalStaked: BigNumber.from(0),
        rewardTokenSupply: BigNumber.from(0),
        accountRewardTokenBalance: BigNumber.from(0),
        accountWithdrawableRewards: BigNumber.from(0),
        accountWithdrawnRewards: BigNumber.from(0),
        accountDepositTokenBalance: BigNumber.from(0),
        accountLocks: [],
    }

    const fetchStakingData = async() => {
        const { provider, signer } = get(eth);
        console.log(smartcontracts);
        let sharesTimeLock = new ethers.Contract(smartcontracts.doughStaking, sharesTimeLockABI, signer || provider);
        console.log("fetching staking data");
        console.log($eth.address);
        let res = (await sharesTimeLock.getStakingData($eth.address));

        console.log(res);

        data = res;
    }

    // update data on address or block change
    $: if($eth.address || $eth.currentBlockNumber) {
      $eth.address || !$eth.signer
      fetchStakingData();
    };

</script>

<h1>DOUGH STAKING</h1>