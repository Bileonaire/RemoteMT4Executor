import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Form = () => {
    const [data, setData] = useState({ password: '', symbol: '', orderType: '', slPrice: '', tpPrice: '', pendingOrderPrice: '' });
    const [currencies, setCurrencies] = useState([]);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');
    const [accounts, setAccounts] = useState([]);
    // const [checkboxes, setCheckboxes] = useState({});

    const PASS = 't';

    const baseUrl = 'http://localhost:5000/api';

    useEffect(() => {
        axios.get(`${baseUrl}/currencies`)
            .then(response => setCurrencies(response.data))
            .catch(err => {
                console.log('Error fetching and parsing data', err.message);
                setError(err.message);
            });
    }, []);

    useEffect(() => {
        axios.get(`${baseUrl}/accounts`)
            .then(response => setAccounts(response.data))
            .catch(err => {
                console.log('Error fetching and parsing data', err.message);
                setError(err.message);
            });
    }, []);

    const onPasswordChange = (e) => setData((prev) => ({ ...prev, "password": e.target.value }));
    const onSymbolChange = (e) => setData((prev) => ({ ...prev, "symbol": e.target.value }));
    const onOrderTypeChange = (e) => setData((prev) => ({ ...prev, "orderType": e.target.value }));
    const onSlPriceChange = (e) => setData((prev) => ({ ...prev, "slPrice": e.target.value }));
    const onTpPriceChange = (e) => setData((prev) => ({ ...prev, "tpPrice": e.target.value }));
    const onPendingPriceChange = (e) => setData((prev) => ({ ...prev, "pendingOrderPrice": e.target.value }));
    const handleAccounts = (e) => console.log(e);

    const clear = () => {
        setData({ password: '', symbol: '', orderType: '', slPrice: '', tpPrice: '', pendingOrderPrice: '' });
    };

    //  Payload Example
    //     { "ordertype": "sell",
    //       "accounts": {
    //         "1" : {
    //           "account": 0,
    //           "percentage_risk": 2
    //         },
    //         "222222" : {
    //           "account": 50,
    //           "percentage_risk": 2
    //         }
    //       },
    //       "pendingorderprice": 0,
    //       "sl": 0,
    //       "tp": 0,
    //       "id": 1
    //     }

    const handleSubmit = (e) => {
        if (data.password === PASS) {
            e.preventDefault();
            const payload = {
                "ordertype": data.orderType,
                "symbol": data.symbol,
                "pendingorderprice": data.pendingOrderPrice,
                "sl": data.slPrice,
                "tp": data.tpPrice,
                "accounts": {}
            }
            let i;
            for (i in accounts) {
                const acc = accounts[i];
                if (acc.execute) {
                    const accountDetails = {};
                    const accNo = acc.account_number;
                    accountDetails[accNo] = { "account": acc.riskDollars, "percentage_risk": 99.5 };
                    payload.accounts = { ...payload.accounts, ...accountDetails }
                }
            }

            axios.post(`${baseUrl}/trades`, payload)
                .then((res) => setSuccess(res.data.message));
            clear();
        } else {
            setError("invalid password");
        }
    }

    const handleCheckboxChange = (number) => {
        const tradeAccount = accounts.find(record => record.account_number == number);
        const accs = accounts.filter(record => record.account_number != tradeAccount.account_number);

        tradeAccount.execute = !tradeAccount.execute;
        accs.unshift(tradeAccount);
        setAccounts(accs);
    };

    const handleRiskChange = (e) => {
        const tradeAccount = accounts.find(record => record.account_number == e.target.name);
        const accs = accounts.filter(record => record.account_number != tradeAccount.account_number);

        tradeAccount.riskDollars = e.target.value;
        accs.unshift(tradeAccount);
        setAccounts(accs);
    };

    return (
        <div className="container">
            <form className="col-md-6 mx-auto mt-4" onSubmit={handleSubmit}>

                {
                    error
                        ? <div className="alert alert-danger alert-dismissible fade show" role="alert">
                            <strong>Error! </strong>{error}
                            <button type="button" className="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                        </div>
                        : ""
                }

                {
                    success
                        ? <div className="alert alert-success alert-dismissible fade show" role="alert">
                            <strong>Success! </strong>{success}
                            <button type="button" className="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                        </div>
                        : ""
                }

                <div className="mb-3">
                    <label htmlFor="Password1" className="form-label">Password</label>
                    <input type="password" className="form-control" value={data.password} onChange={onPasswordChange} id="Password1" />
                </div>

                <label htmlFor="currrency1" className="form-label">Currency</label>
                <input className="form-control" list="datalistOptions1" id="currency1" value={data.currency} onChange={onSymbolChange} placeholder="Type to search..." />
                <datalist id="datalistOptions1">
                    {currencies.map((currency) => <option value={currency} key={currency} />)}
                </datalist>

                <label htmlFor="orderType" className="form-label">Order Type</label>
                <input className="form-control" list="datalistOptions" id="orderType" value={data.orderType} onChange={onOrderTypeChange} placeholder="Type to search..." />
                <datalist id="datalistOptions">
                    <option value="buy" />
                    <option value="sell" />
                    <option value="buystop" />
                    <option value="sellstop" />
                    <option value="buylimit" />
                    <option value="selllimit" />
                </datalist>

                <div className="input-group my-3">
                    <span className="input-group-text" id="inputGroup-sizing-default">Stop Loss</span>
                    <input type="text" className="form-control" aria-label="Sizing example input" value={data.slPrice} onChange={onSlPriceChange}
                        aria-describedby="inputGroup-sizing-default" required />
                </div>

                <div className="input-group mb-3">
                    <span className="input-group-text" id="inputGroup-sizing-default">Take Profit</span>
                    <input type="text" className="form-control" aria-label="Sizing example input" value={data.tpPrice} onChange={onTpPriceChange}
                        aria-describedby="inputGroup-sizing-default" />
                </div>

                <div className="input-group mb-3">
                    <span className="input-group-text" id="inputGroup-sizing-default">Pending Order Price</span>
                    <input type="text" className="form-control" aria-label="Sizing example input" value={data.pendingOrderPrice} onChange={onPendingPriceChange}
                        aria-describedby="inputGroup-sizing-default" />
                </div>

                <hr />
                {accounts.map((account) => (
                    <div key={account.account_number} className="form-check">
                        <label>
                            <input
                                type="checkbox"
                                name={account.account_number}
                                checked={account.execute}
                                onChange={() => handleCheckboxChange(account.account_number)}
                                className="form-check-input"
                            />
                            {account.account_number}
                        </label>
                        <div className="input-group input-group-sm mb-3">
                            <span className="input-group-text" id="inputGroup-sizing-sm">Risk in dollars</span>
                            <input value={account.riskDollars} name={account.account_number} onChange={handleRiskChange} type="text" className="form-control" aria-label="Sizing example input" aria-describedby="inputGroup-sizing-sm" />
                        </div>
                        <hr />
                    </div>
                ))}

                <div className="d-grid col-6 mx-auto mb-4">
                    <button type="submit" className="btn btn-success btn-lg text-center">Submit</button>
                </div>

            </form>
        </div>
    );
}

export default Form;