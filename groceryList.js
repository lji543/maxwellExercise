const readline = require("readline");

const sales = {
  bread: {
    buyAmt: '3',
    ttlPrice: '6',
  },
  milk: {
    buyAmt: '2',
    ttlPrice: '5',
  },
};



const shelfItems = {
  apple: 0.89,
  banana: 0.99,
  bread: 2.17,
  milk: 3.97,
};

const formatAmount = (value) => {
  return `$ ${(Math.round(value * 100) / 100).toFixed(2)}`;
};

// count the number of each item in the cart
const tallyItems = (list) => {
  const cart = {};

  list.forEach((item) => {
    item = item.trim();
    if (cart[item]) {
      cart[item].inCart += 1;
    } else {
      cart[item] = { inCart: 1 };
    }
  });
  return cart;
};

// find prices for each item in the cart (sale or otherwise)
const findPrices = (list) => {
  const cart = tallyItems(list);

  list.forEach((item) => {
    item = item.trim();
    if (sales[item]) {
      // count the amt of the sale item that qualifies for sale pricing
      const amt = Math.floor(cart[item].inCart / sales[item].buyAmt);
      // price all other sale items at the regular price (when not enough are purchased for the deal)
      const rem = cart[item].inCart % sales[item].buyAmt;
      cart[item].ttlCost = amt * sales[item].ttlPrice + rem * shelfItems[item];
      // calculate what the original cost would have been
      cart[item].preSaleCost = cart[item].inCart * shelfItems[item];
    } else {
      cart[item].ttlCost = cart[item].inCart * shelfItems[item];
    }
  });
  return cart;
};

const printResult = (cart, totals, savings) => {
  console.log('--------------------------------');
  console.log('Thanks for shopping with us!');
  console.table(cart, ['inCart', 'ttlCost']);
  console.log('--------------------------------');
  console.log(`Total Savings: ${formatAmount(savings)}`);
  console.log(`Your Total: ${formatAmount(totals)}`);
  console.log('--------------------------------');
};

const calculateTotal = (list) => {
  const cart = findPrices(list);
  let totals = Object.values(cart).map((itemObj) => itemObj.ttlCost);
  let preSaleTotals = Object.values(cart).map((itemObj) => {
    return itemObj.preSaleCost ?? itemObj.ttlCost;
  });

  preSaleTotals = preSaleTotals.reduce((a, b) => a + b, 0);
  totals = totals.reduce((a, b) => a + b, 0);

  const savings = preSaleTotals > 0 ? preSaleTotals - totals : 0;

  printResult(cart, totals, savings);
};

const formatUserInput = (list) => {
  let newCartArray = list.split(',');
  let noError = true;
  newCartArray = newCartArray.filter((item) => {
    if (!shelfItems[item.trim()]) {
      return (noError = false);
    }
    return item;
  });
  return noError ? newCartArray : noError;
};

const getGroceryList = () => {
  const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
  });
  let prompt = 'Welcome! \nPlease enter all items purchased, separated by a comma.\n' +
    'Items available: apple, banana, bread, and/or milk \n';

  rl.question(prompt, list => {
    const formatAndCheck = formatUserInput(list);
    if (formatAndCheck) {
      calculateTotal(formatAndCheck);
    } else {
      console.log('Please check your grocery list and try again.');
    }
    rl.close();
  });
};

getGroceryList();
