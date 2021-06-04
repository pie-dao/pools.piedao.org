export default class ApiOx {
  constructor() {
    this.baseUrl = 'https://api.0x.org/swap/v1/';
    this.slippage = 3;
  }

  async getQuote(_sellToken, _buyToken, amount) {
    const sellToken = { ..._sellToken };
    const buyToken = { ..._buyToken };

    if (sellToken.address === '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee') {
      sellToken.address = 'ETH';
    }
    if (buyToken.address === '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee') {
      buyToken.address = 'ETH';
    }

    const weiAmount = amount.toFixed(0);
    // Slippage: 0.01 = 1%
    const callUrl = `${this.baseUrl}quote?sellAmount=${weiAmount}&buyToken=${
      buyToken.address
    }&sellToken=${sellToken.address}&slippagePercentage=${this.slippage / 100}`;
    const response = await fetch(callUrl);

    if (response.status !== 200) {
      console.error('The server responded with an unexpected status.', response);
      // TODO Handle errors
      return response.json();
    }

    const result = await response.json();
    console.log('result', result);
    return result;
  }
}
