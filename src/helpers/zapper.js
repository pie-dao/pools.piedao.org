const zapperApiUrl = 'https://api.zapper.fi/v1';
const treasury = '0x3bcf3db69897125aa61496fc8a8b55a5e3f245d5';
const zapperApiKey = '96e0cc51-a62e-42ca-acee-910ea7d2a241';

export async function fetchTreasuryBalance() {
  let treasuryBalance = 0;
  let fetchSupported = await fetch(`${zapperApiUrl}/protocols/balances/supported?addresses%5B%5D=${treasury}&api_key=${zapperApiKey}`);

  if (fetchSupported.ok) {
    let supportedBalances = await fetchSupported.json();
    let balancesPromises = [];

    supportedBalances.forEach(supportedBalance => {
      supportedBalance.protocols.forEach(protocol => {
        balancesPromises.push(fetch(`${zapperApiUrl}/protocols/${protocol.protocol}/balances?addresses%5B%5D=${treasury}&network=${supportedBalance.network}&api_key=${zapperApiKey}`));
      });
    });

    return Promise.all(balancesPromises).then(async (balancesResponses) => {
      for (let i = 0; i < balancesResponses.length; i++) {
        let balanceResponse = balancesResponses[i];

        if (balanceResponse.ok) {
          let specificBalances = await balanceResponse.json();
          let balance = specificBalances[treasury].meta.find(meta => meta.label == "Total");

          if (balance) {
            treasuryBalance += balance.value;
          }
        } else {
          throw new Error(balanceResponse.status);
        }
      };

      return treasuryBalance;
    }).catch(error => {
      throw new Error(error.message);
    });

  } else {
    throw new Error(fetchSupported.status);
  }
};