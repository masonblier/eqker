
/*
 * table of kernel names to fns
 */
export const table = {
  'stay-cash': stayCash,
  'buy-and-hold': buyAndHold,
  'buy-down-sell-up': buyDownSellUp,
};


function stayCash({tickers,cash},{hist,buy,sell}) {
  // do nothing
}

function buyAndHold({tickers,cash},{hist,buy,sell}) {
  // buy until cant buy anymore
  let boughtSome = true;
  while (boughtSome) {
    boughtSome = false;
    for (let ticker of tickers) {
      const {price,quantity} = buy(ticker, 1);
      if (quantity > 0) boughtSome = true;
    }
  }
}

function buyDownSellUp({tickers,cash,holdings},{hist,buy,sell}) {
  for (let ticker of tickers) {
    const yesterday = hist(ticker, 1);
    const today = hist(ticker, 0);
    if (yesterday && (yesterday.open < today.close)) {
      buy(ticker, 1);
    } else {
      if (holdings[ticker] > 0) {
        sell(ticker, 1);
      }
    }
  }
}
