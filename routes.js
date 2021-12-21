const { response } = require('express');
const express = require('express');
const router = express.Router();

const records = require('./records');

function asyncHandler(cb) {
    return async (req, res, next) => {
        try {
            await cb(req, res, next);
        } catch (err) {
            next(err);
        }
    }
}

// Send a GET request to /trades to READ a list of trades
router.get('/trades/all', asyncHandler(async (req, res) => {
    const trades = await records.getData();
    res.json(trades);
}));


router.get('/trades/:acc', asyncHandler(async (req, res) => {
    const trade = await records.getTrade(req.params.acc);
    if (trade) {
        await records.updateTrade(trade, req.params.acc, "Mt4_Recieved");
        res.json(trade);
    } else {
        res.status(404).json({ message: "Quote not found." });
    }
}));

// Set sucessful trade /trades/:id Successful Execution confirmation
router.get("/trades/:acc/:id", asyncHandler(async (req, res, next) => {
    const trade = await records.getTradeById(req.params.id);
    await records.updateTrade(trade, req.params.acc, "Executed_Successfully");
    res.status(200).end();
}));

// Set unsucessful trade /trades/unsuccessful/;acc/:id unsuccessful Execution
router.get("/trades/unsuccessful/:acc/:id", asyncHandler(async (req, res, next) => {
    const trade = await records.getTradeById(req.params.id);
    await records.updateTrade(trade, req.params.acc, "Execution_Failed");
    res.status(200).end();
}));

//Send a POST request to /trades to  CREATE a new quote
router.post('/trades', asyncHandler(async (req, res) => {
    if (req.body.ordertype) {
        const tradeData = {
            ordertype: req.body.ordertype,
            symbol: req.body.symbol,
            accounts: req.body.accounts,
            pendingorderprice: req.body.pendingorderprice,
            sl_tp_type: req.body.sl_tp_type,
            sl: req.body.sl,
            tp: req.body.tp
        };
        for (i in tradeData.accounts) {
            const x = tradeData.accounts[i];
            x.status = "ready";
        };

        const trade = await records.createTrade(tradeData);
        res.status(201).json(trade);
    } else {
        res.status(400).json({ message: "Ordertype required." });
    }
}));

// Send a DELETE request to /trades/:id DELETE a trade
router.delete("/trades/:id", asyncHandler(async (req, res, next) => {
    const quote = await records.getTrade(req.params.id);
    await records.deleteTrade(quote);
    res.status(204).end();
}));

router.get('/accounts', asyncHandler(async (req, res) => {
    const accounts = await records.getAccounts();
    res.json(accounts);
}));

// GET currencies
router.get('/currencies', asyncHandler(async (req, res) => {
    const currencies = await records.getCurrencies();
    res.json(currencies);
}));

// Add currencies
// Send a Add currency request to /currencies/:id DELETE a trade
router.post('/currencies/:currency', asyncHandler(async (req, res) => {
    const currency = req.params.currency;
    const currencies = await records.AddCurrency(currency);
    res.json(currencies);
}));

module.exports = router;