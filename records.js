const fs = require('fs');



function save(data){
  return new Promise((resolve, reject) => {
    fs.writeFile('data.json', JSON.stringify(data, null, 2), (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

/**
 * Gets all trades
 * @param None
 */
function getData(){
  return new Promise((resolve, reject) => {
    fs.readFile('data.json', 'utf8', (err, data) => {
      if (err) {
        reject(err);
      } else {
        const json = JSON.parse(data);
        resolve(json);
      }
    });
  });
}

async function generateId(){
  const trades = await getData();
  const id = trades.records.length + 1;
  return id;
}

/**
 * Gets a specific quote by ID
 * @param {number} id - Accepts the ID of the specified quote.
 */
async function getTradeById(id){
  const trades = await getData();
  return trades.records.find(record => record.id == id);
}

// Get trades ready for ececution for a specific account
async function getTrade(acc){
  const trades = await getData();
  const trade =  trades.records.find(record => record.accounts[acc] && record.accounts[acc].status == "ready");
  if (trade) {
    return {...trade, ...trade.accounts[acc]}
  }
}
/**
 * Creates a new quote record
 * @param {Object} newRecord - Object containing info for new quote: the quote text and author
 */
async function createTrade(newRecord) {
  const trades = await getData();
  newRecord.id = await generateId();
  trades.records.push(newRecord);
  await save(trades);
  return newRecord;
}

/**
 * Updates a single record
 * @param {Object} trade - An object containing the changes to quote: quote and author
 * @param string status - status update
 */
async function updateTrade(t, acc, status){
  const trades = await getData();
  let trade = trades.records.find(item => item.id == t.id);
  trade.accounts[acc].status = status;
  await save(trades);
}

/**
 * Deletes a single record
 * @param {Object} record - Accepts record to be deleted.
 */
async function deleteTrade(record){
  const trades = await getData();
  trades.records = trades.records.filter(item => item.id != record.id);
  await save(trades);
}

async function deleteTrade(record){
  const trades = await getData();
  trades.records = trades.records.filter(item => item.id != record.id);
  await save(trades);
}

async function getAccounts(){
  const data = await getData();
  return data.accounts;
}

/**
 * Gets currencies
 * @param None
 */
async function getCurrencies(){
  const data = await getData();
  return data.currencies;
}

module.exports = {
  getData,
  getTrade,
  createTrade,
  deleteTrade,
  updateTrade,
  getTradeById,
  getAccounts,
  getCurrencies,
}
