import { fetchEventSource } from '@microsoft/fetch-event-source';
import { isEmpty } from 'lodash';
const zapperApiUrl = 'https://api.zapper.fi/v2';
const treasury = '0x3bcf3db69897125aa61496fc8a8b55a5e3f245d5';
const zapperApiKey = '07809e9c-6d2d-4f6b-ba09-f3f7fb3e1fed';

/* eslint-disable import/prefer-default-export */
export async function fetchTreasuryBalance() {
  /* eslint-enable import/prefer-default-export */

  try {
    let totalBalance = 0;
    const balanceByProtocol = new Map();
    await fetchEventSource(
      `${zapperApiUrl}/balances?addresses%5B%5D=${treasury}&api_key=${zapperApiKey}`,
      {
        onmessage({ event, data }) {
          if (event === 'balance') {
            const { app, appId, totals } = JSON.parse(data);
            if (app && app.meta && app.meta.total) {
              balanceByProtocol.set(appId, app.meta.total);
            } else if (appId === 'tokens' && !isEmpty(totals)) {
              const tokenTotal = totals.reduce((n, { balanceUSD }) => n + balanceUSD, 0);
              const networkKey = totals[0].network;
              balanceByProtocol.set(networkKey, tokenTotal);
            }
          }
          if (event === 'end') {
            balanceByProtocol.forEach((balance) => {
              totalBalance += parseFloat(balance);
            });
          }
        },
      },
    );
    return totalBalance;
  } catch (e) {
    console.error('ERROR on zapper', e);
    return Promise.resolve(17000000);
  }
}
