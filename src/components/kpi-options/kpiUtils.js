import { ethers } from 'ethers';
import get from 'lodash/get';
import BigNumber from 'bignumber.js';

import { subject } from '../../stores/eth.js';
import { fetchStakingStats, toNum } from '../../helpers/staking';
import displayNotification from '../../notifications';

import images from '../../config/images.json';
import smartcontracts from '../../config/smartcontracts.json';
import WkpiJson from '../../config/rewards/wkpi.json';
import wKpiABI from '../../abis/wKpiABI.json';
import MerkleTreeDistributorABI from '../../abis/MerkleTreeDistributorABI.json';

export const getMerkleTreeDistributorContract = ($eth) => new ethers.Contract(
    smartcontracts.merkleTreeDistributor,
    MerkleTreeDistributorABI,
    $eth.signer || $eth.provider,
);

export const getWkpiContract = ($eth) => new ethers.Contract(
    smartcontracts.wkpi,
    wKpiABI,
    $eth.signer || $eth.provider,
);

export const getWkpiBalance = async ($eth) => {
    try {
        // move to multicall instantiation
        const wKpiContract = getWkpiContract($eth);
        const wKpiBalance = await wKpiContract.balanceOf($eth.address);
        return BigNumber(wKpiBalance.toString());
    } catch (err) {
        console.warn('Error getting wKPI balance', err);
    }
}

export const setWkpiData = async ($eth, kpiOptionsData, merkleTreeDistributor) => {
    let isClaimed = false;

    kpiOptionsData.wkpiBalance = await getWkpiBalance($eth);

    let claimAddress = get(WkpiJson.claims, $eth.address);

    if (claimAddress) {
        isClaimed = await merkleTreeDistributor['isClaimed(uint256,uint256)'](
            ethers.BigNumber.from(claimAddress.windowIndex),
            ethers.BigNumber.from(claimAddress.accountIndex),
        );
    }

    if (claimAddress && !isClaimed) {
        kpiOptionsData.claimableKpiOptions = BigNumber(claimAddress.amount);
    } else {
        kpiOptionsData.claimableKpiOptions = BigNumber(0);
    }

    if (claimAddress) {
        kpiOptionsData.estimatedKpiOptions = await calculateKpiOptions(
            BigNumber(claimAddress.amount),
            $eth.provider,
        );
    }
}

export const addKPIToken = () => {
    ethereum.sendAsync(
        {
            method: 'wallet_watchAsset',
            params: {
                type: 'ERC20',
                options: {
                    address: smartcontracts.wkpi,
                    symbol: 'wDOUGH-KPI',
                    decimals: 18,
                    image: images.wkpi,
                },
            },
            id: Math.round(Math.random() * 100000),
        },
        (_, added) => {
            if (added) {
                displayNotification({
                    message: 'The wDOUGH-KPI token has been added to your Metamask!',
                    type: 'success',
                });
            } else {
                displayNotification({
                    message: 'Sorry, something went wrong. Please try again later.',
                    type: 'error',
                });
            }
        },
    );
};


// call with $eth.provider
export async function calculateKpiOptions(claimableKpiOptions, provider) {
    const doughPayouts = [
        { threshold: 15000000, value: 0.5 },
        { threshold: 10000000, value: 0.2 },
        { threshold: 7500000, value: 0.1 },
    ];

    // fetching updated staking stats...
    const stakingStats = await fetchStakingStats(provider, 1);
    // taking the stakedDough amount from stats...
    const stakedDough = toNum(stakingStats.totalStakedDough);
    // finding the payout by its threshold...
    const payout = doughPayouts.find(
        (_payout) => Number(stakedDough.toString()) >= _payout.threshold,
    );
    // finally multiplying the claimableKpiOptions by the payout value...
    const kpiReward = claimableKpiOptions.times(payout.value);
    // and returning the calculated kpiReward for current address...

    // this assumes a 36m commitment
    return kpiReward;
}

// call with $eth.address
export function retrieveLeaf(address) {
    const participations = WkpiJson.claims;
    return participations[ethers.utils.getAddress(address.toLowerCase())];
}

// call with $eth.address
export function prepareProofs(address) {
    if (!address) return;

    const leaf = retrieveLeaf(address);

    /* eslint-disable consistent-return */
    return {
        leaf: leaf,
        valid: !!leaf,
        proof: leaf ? leaf.proof : null,
    };
    /* eslint-enable consistent-return */
}

export async function merkleTreeClaim(params) {
    const { $eth, ...rest } = params
    const merkleTreeDistributor = new ethers.Contract(
        smartcontracts.merkleTreeDistributor,
        MerkleTreeDistributorABI,
        $eth.signer || $eth.provider,
    );
    const account = ethers.utils.getAddress($eth.address.toLowerCase());
    await merkleTreeDistributor[
        "claim((uint256,uint256,uint256,address,bytes32[]))"
    ]({ account, ...rest });
}

export async function claim($eth, onSuccess) {
    const proof = prepareProofs($eth.address);
    const merkleTreeDistributor = getMerkleTreeDistributorContract($eth);
    try {

        if (proof.leaf) {
            const params = {
                windowIndex: proof.leaf.windowIndex,
                amount: ethers.BigNumber.from(proof.leaf.amount),
                accountIndex: proof.leaf.accountIndex,
                account: ethers.utils.getAddress($eth.address.toLowerCase()),
                merkleProof: proof.leaf.proof
            };
            const { emitter } = displayNotification(
                await merkleTreeDistributor["claim((uint256,uint256,uint256,address,bytes32[]))"](params)
            );

            emitter.on('txConfirmed', async () => {
                const subscription = subject('blockNumber').subscribe({
                    next: async () => {
                        displayNotification({
                            autoDismiss: 15000,
                            message: 'WKPI-DOUGH has been claimed!',
                            type: 'success',
                        });

                        subscription.unsubscribe();
                        // update the kpiOptionsData object...
                        onSuccess();
                    },
                });
            });
        } else {
            displayNotification({
                autoDismiss: 15000,
                message: 'cannot claim, address not valid in merkleTree',
                type: 'error',
            });
        }
    } catch (error) {
        console.error(error);
        displayNotification({
            autoDismiss: 15000,
            message: error.data?.message ?? 'An error ocurred while trying to claim your options',
            type: 'error',
        });
    }
}

export async function redeem($eth, onSuccess, qty, months) {
    try {
        let wKpiContract = new ethers.Contract(
            smartcontracts.wkpi,
            wKpiABI,
            $eth.signer || $eth.provider,
        );

        const { emitter } = displayNotification(
            await wKpiContract.settleAndStake(
                ethers.BigNumber.from(qty),
                months
            ),
        );

        emitter.on('txConfirmed', async () => {
            const subscription = subject('blockNumber').subscribe({
                next: async () => {
                    displayNotification({
                        autoDismiss: 15000,
                        message: 'wKPI-DOUGH has been redeemed for veDOUGH!',
                        type: 'success',
                    });
                    subscription.unsubscribe();
                    // update the kpiOptionsData object...
                    onSuccess();
                },
            });
        });
        return qty
    } catch (error) {
        console.error(error);
        displayNotification({
            autoDismiss: 15000,
            message: error.data?.message ?? 'There was a problem staking your tokens',
            type: 'error',
        });
    }
}

