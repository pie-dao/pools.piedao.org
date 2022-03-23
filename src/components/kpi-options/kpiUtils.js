import { ethers } from 'ethers';

import { subject } from '../../stores/eth.js';
import { fetchStakingStats, toNum } from '../../helpers/staking';
import displayNotification from '../../notifications';

import images from '../../config/images.json';
import smartcontracts from '../../config/smartcontracts.json';
import WkpiJson from '../../config/rewards/wkpi.json';
import wKpiABI from '../../abis/wKpiABI.json';
import MerkleTreeDistributorABI from '../../abis/MerkleTreeDistributorABI.json';
import { Interface } from '@ethersproject/abi';
import abi from '@pie-dao/abis/src/abis/pieSmartPool';


export const addToken = () => {
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
        (err, added) => {
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


/**
 * Conversion 1: wDOUGH-KPI -> DOUGH
 * Conversion 2: DOUGH -> veDOUGH
 */

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
    return participations['0x0056D1fd2ca3c0F3A7B6ed6CDd1F1F104B4BF9A9'];
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
    console.debug('here')
    await merkleTreeDistributor[
        "claim((uint256,uint256,uint256,address,bytes32[]))"
    ]({ account, ...rest });
    console.debug('there')
}

export async function claim($eth, init) {
    const proof = prepareProofs($eth.address);
    try {
        if (proof.leaf) {
            const params = {
                windowIndex: proof.leaf.windowIndex,
                amount: ethers.BigNumber.from(proof.leaf.amount),
                accountIndex: proof.leaf.accountIndex,
                merkleProof: proof.leaf.proof,
                $eth
            }
            const { emitter } = displayNotification(
                await merkleTreeClaim(params),
            );
            console.debug({ emitter });

            emitter.on('txConfirmed', async () => {
                console.debug('CONFIRMED')
                const subscription = subject('blockNumber').subscribe({
                    next: async () => {
                        displayNotification({
                            autoDismiss: 15000,
                            message: 'WKPI-DOUGH has been claimed!',
                            type: 'success',
                        });

                        subscription.unsubscribe();

                        // update the kpiOptionsData object...
                        init();
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

export async function redeem($eth, init, qty, months) {
    try {
        let wKpiContract = new ethers.Contract(
            smartcontracts.wkpi,
            wKpiABI,
            $eth.signer || $eth.provider,
        );

        const { emitter } = displayNotification(
            await wKpiContract.settleAndStake(qty, months),
        );

        emitter.on('txConfirmed', async () => {
            const subscription = subject('blockNumber').subscribe({
                next: async () => {
                    displayNotification({
                        autoDismiss: 15000,
                        message: 'WKPI-DOUGH has been redeemed!',
                        type: 'success',
                    });

                    subscription.unsubscribe();

                    // update the kpiOptionsData object...
                    init();
                },
            });
        });
    } catch (error) {
        console.error(error);

        displayNotification({
            autoDismiss: 15000,
            message: error.data.message,
            type: 'error',
        });
    }
}

