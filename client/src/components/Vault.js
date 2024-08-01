import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import './Vault.css'; // Import the CSS file

const Vault = () => {
  const { user, isAuthenticated } = useContext(AuthContext);
  const [kingdom, setKingdom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [amount, setAmount] = useState(0);

  useEffect(() => {
    const fetchKingdom = async () => {
      if (!isAuthenticated || !user?.kingdom?._id) return; // Ensure user is authenticated and kingdom exists

      try {
        const response = await axios.get(`/api/kingdoms/${user.kingdom._id}`);
        setKingdom(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching kingdom:', error);
        setError(error.message);
        setLoading(false);
      }
    };

    fetchKingdom();
  }, [user?.kingdom, isAuthenticated]);

  const handleDeposit = async () => {
    if (!isAuthenticated || !amount) return; // Ensure user is authenticated and amount is valid

    setError(null); // Clear previous errors
    try {
      const response = await axios.post('/api/kingdoms/vault/deposit', { userId: user._id, amount });
      setKingdom(response.data);
      console.log('Gold deposited:', response.data);
    } catch (error) {
      console.error('Error depositing gold:', error);
      if (error.response && error.response.data && error.response.data.message) {
        setError(error.response.data.message);
      } else {
        setError('An error occurred while depositing gold.');
      }
    }
  };

  const handleWithdraw = async () => {
    if (!isAuthenticated || !amount) return; // Ensure user is authenticated and amount is valid

    setError(null); // Clear previous errors
    try {
      const response = await axios.post('/api/kingdoms/vault/withdraw', { userId: user._id, amount });
      setKingdom(response.data);
      console.log('Gold withdrawn:', response.data);
    } catch (error) {
      console.error('Error withdrawing gold:', error);
      if (error.response && error.response.data && error.response.data.message) {
        setError(error.response.data.message);
      } else {
        setError('An error occurred while withdrawing gold.');
      }
    }
  };

  if (loading) {
    return <div className="vault-loading">Loading...</div>;
  }

  if (error) {
    return <div className="vault-error">Error: {error}</div>;
  }

  return (
    <div className="vault-container">
      <h2>Vault</h2>
      <div className="vault-info">
        <p>Current Gold on Hand: {kingdom.gold}</p>
        <p>Current Vault Gold: {kingdom.vaultGold}</p>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
          placeholder="Enter amount"
          className="vault-input"
        />
        <div className="vault-buttons">
          <button onClick={handleDeposit} className="vault-button deposit">Deposit Gold</button>
          <button onClick={handleWithdraw} className="vault-button withdraw">Withdraw Gold</button>
        </div>
      </div>
      {error && <div className="vault-error-message">{error}</div>}
    </div>
  );
};

export default Vault;
