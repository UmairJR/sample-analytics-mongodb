'use client'
import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function Home() {
  const [activeCustomers, setActiveCustomers] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [lowAmountAccountsIds, setLowAmountAccountIds] = useState([]);
  const [distinctProducts, setDistinctProducts] = useState([]);

  useEffect(() => {
    const fetchActiveCustomers = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/active-customers');
        setActiveCustomers(response.data);
        const allAccounts = response.data.map(customer => customer.accounts).flat();
      setAccounts(allAccounts)
      } catch (error) {
        console.error('Error fetching active customers:', error);
      }
    };

    fetchActiveCustomers();
  }, []);

  const getTransactions = async (account_id) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/get-transaction?account_id=${account_id}`);
      setTransactions(response.data.transactions);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };

  const fetchLowAmountAccountIds = async () => {
    try {
      const response = await axios.post('http://localhost:5000/api/low-amount-accounts', { accounts });
      
      const accountIds = response.data;
      setLowAmountAccountIds(accountIds);
    } catch (error) {
      console.error('Error fetching low amount account IDs:', error.message);
    }
  };

  const fetchDistinctProducts = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/distinct-products');
      setDistinctProducts(response.data[0].distinctProducts);
    } catch (error) {
      console.error('Error fetching distinct products:', error.message);
    }
  };

  console.log(activeCustomers);
  console.log(transactions);
  console.log(accounts);
  console.log(lowAmountAccountsIds);
  
  return (
    <div>
      <h1>Active Customers</h1>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Address</th>
            <th>Accounts</th>
          </tr>
        </thead>
        <tbody>
          {activeCustomers.map(customer => (
            <tr key={customer._id}>
              <td>{customer.name}</td>
              <td>{customer.address}</td>
              <td>
                <ul>
                  {accounts.map((account, index) => (
                    <li key={index}>{account} <button onClick={() => getTransactions(account)}>Transactions</button></li>
                  ))}
                </ul>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <h2>Distinct Products</h2>
      <button onClick={fetchDistinctProducts}>Fetch Distinct Products</button>
      {distinctProducts.length > 0 ? (
        <ul>
          {distinctProducts.map((product, index) => (
            <li key={index}>{product}</li>
          ))}
        </ul>
      ) : (
        <p>No distinct products found.</p>
      )}
      <h2>Get tx lower than amount 5000: (For Active User) </h2>
      <button onClick={fetchLowAmountAccountIds}>Get Account Ids</button>
      {lowAmountAccountsIds.length > 0 && (
        <p>
          Account IDs: [
          {lowAmountAccountsIds.map((accountId, index) => (
            <span key={accountId}>
              {index > 0 ? ', ' : ''}
              {accountId}
            </span>
          ))}
          ]
        </p>
      )}

      {transactions.length > 0 && (
        <div>
          <h2>Transactions - {transactions.length} Transactions</h2>
          <ul>
            {transactions.map((transaction, index) => (
              <li key={index}>
                <strong>Amount:</strong> {transaction.amount}<br />
                <strong>Date:</strong> {transaction.date}<br />
                <strong>Price:</strong> {transaction.price}<br />
                <strong>Symbol:</strong> {transaction.symbol}<br />
                <strong>Total:</strong> {transaction.total}<br />
                <strong>Transaction Code:</strong> {transaction.transaction_code}<br />
                <hr />
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
  

