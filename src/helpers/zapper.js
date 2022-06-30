import { fetchEventSource } from '@microsoft/fetch-event-source';

const zapperApiUrl = 'https://api.zapper.fi/v2';
const treasury = '0x3bcf3db69897125aa61496fc8a8b55a5e3f245d5';
const zapperApiKey = '07809e9c-6d2d-4f6b-ba09-f3f7fb3e1fed';

/* eslint-disable import/prefer-default-export */
export async function fetchTreasuryBalance() {
  /* eslint-enable import/prefer-default-export */

  try {
    let treasuryBalance = 0;
    await fetchEventSource(
      `${zapperApiUrl}/balances?addresses%5B%5D=${treasury}&api_key=${zapperApiKey}`,
      {
        onmessage({ event, data }) {
          if (event === 'balance') {
            const { app, appId, totals } = JSON.parse(data);
            if (app && app.meta && app.meta.total) {
              treasuryBalance += parseFloat(app.meta.total);
            } else if (appId === 'tokens' && totals) {
              const tokenTotal = totals.reduce((n, { balanceUSD }) => n + balanceUSD, 0);
              treasuryBalance += tokenTotal;
            }
          }
        },
      },
    );
    return treasuryBalance;
  } catch (e) {
    console.error('ERROR on zapper', e);
    return Promise.resolve(17000000);
  }
}
