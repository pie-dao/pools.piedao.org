const zapperApiUrl = 'https://api.zapper.fi/v1';
const treasury = '0x3bcf3db69897125aa61496fc8a8b55a5e3f245d5';
const zapperApiKey = '96e0cc51-a62e-42ca-acee-910ea7d2a241';

/* eslint-disable import/prefer-default-export */
export async function fetchTreasuryBalance() {
/* eslint-enable import/prefer-default-export */

  try {
    let treasuryBalance = 0;
    const fetchSupported = await fetch(`${zapperApiUrl}/protocols/balances/supported?addresses%5B%5D=${treasury}&api_key=${zapperApiKey}`);

    if (fetchSupported.ok) {
      const supportedBalances = await fetchSupported.json();
      const balancesPromises = [];

      supportedBalances.forEach((supportedBalance) => {
        supportedBalance.protocols.forEach((protocol) => {
          balancesPromises.push(fetch(`${zapperApiUrl}/protocols/${protocol.protocol}/balances?addresses%5B%5D=${treasury}&network=${supportedBalance.network}&api_key=${zapperApiKey}`));
        });
      });

      return Promise.all(balancesPromises).then(async (balancesResponses) => {
        for (let i = 0; i < balancesResponses.length; i += 1) {
          const balanceResponse = balancesResponses[i];

          if (balanceResponse.ok) {
            /* eslint-disable no-await-in-loop */
            const specificBalances = await balanceResponse.json();
            /* eslint-enable no-await-in-loop */
            const balance = specificBalances[treasury].meta.find((meta) => meta.label === 'Total');

            if (balance) {
              treasuryBalance += balance.value;
            }
          } else {
            throw new Error(balanceResponse.status);
          }
        }

        return treasuryBalance;
      }).catch((error) => {
        throw new Error(error.message);
      });
    }
    throw new Error(fetchSupported.status);
  } catch(e) {
    return Promise.resolve(17000000);
  }
}
