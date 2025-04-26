import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';

const Healthcare = () => {
  // State variables to manage provider, signer, contract, connected account and ownership
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [contract, setContract] = useState(null);
  const [account, setAccount] = useState(null);
  const [isOwner, setIsOwner] = useState(null);

  // State for input fields and patient records
  const [patientID, setPatientID] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [treatment, setTreatment] = useState('');
  const [patientRecords, setPatientRecords] = useState([]);
  const [providerAddress, setProviderAddress] = useState('');

  // Deployed contract address
  const contractAddress = "0xa80a7b47597499246d6c6b8efde05b4899a021e8";


// contractABI is like a menu that tells your app:
// What functions are available in the smart contract
// What inputs each function needs
// What outputs they give back


    const contractABI = [
        {
            "inputs": [],
            "stateMutability": "nonpayable",
            "type": "constructor"
        },
        {
            "inputs": [
                {
                    "internalType": "uint256",
                    "name": "patientID",
                    "type": "uint256"
                },
                {
                    "internalType": "string",
                    "name": "patientName",
                    "type": "string"
                },
                {
                    "internalType": "string",
                    "name": "diagnosis",
                    "type": "string"
                },
                {
                    "internalType": "string",
                    "name": "treatment",
                    "type": "string"
                }
            ],
            "name": "addRecord",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "address",
                    "name": "provider",
                    "type": "address"
                }
            ],
            "name": "authorizeProvider",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "getOwner",
            "outputs": [
                {
                    "internalType": "address",
                    "name": "",
                    "type": "address"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "uint256",
                    "name": "patientID",
                    "type": "uint256"
                }
            ],
            "name": "getPatientRecords",
            "outputs": [
                {
                    "components": [
                        {
                            "internalType": "uint256",
                            "name": "recordID",
                            "type": "uint256"
                        },
                        {
                            "internalType": "string",
                            "name": "patientName",
                            "type": "string"
                        },
                        {
                            "internalType": "string",
                            "name": "diagnosis",
                            "type": "string"
                        },
                        {
                            "internalType": "string",
                            "name": "treatment",
                            "type": "string"
                        },
                        {
                            "internalType": "uint256",
                            "name": "timestamp",
                            "type": "uint256"
                        }
                    ],
                    "internalType": "struct HealthcareRecords.Record[]",
                    "name": "",
                    "type": "tuple[]"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        }
    ];


    // Hook runs once when component mounts to connect to MetaMask and load the contract
  useEffect(() => {
    const connectWallet = async () => {
      try {
        // Connect to Ethereum provider
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        await provider.send('eth_requestAccounts', []);
        const signer = provider.getSigner();

        setProvider(provider);
        setSigner(signer);

        // Get connected wallet address
        const accountAddress = await signer.getAddress();
        setAccount(accountAddress);

        // Instantiate contract with signer
        const contract = new ethers.Contract(contractAddress, contractABI, signer);
        setContract(contract);

        // Fetch contract owner and check if current user is the owner
        const ownerAddress = await contract.getOwner();
        setIsOwner(accountAddress.toLowerCase() === ownerAddress.toLowerCase());
      } catch (error) {
        console.error("Error connecting to wallet: ", error);
      }
    };

    connectWallet();
  }, []);

  // Fetch records for a given patient ID
  const fetchPatientRecords = async () => {
    try {
      const records = await contract.getPatientRecords(patientID);
      console.log(records);
      setPatientRecords(records);
    } catch (error) {
      console.error("Error fetching patient records", error);
    }
  };

  // Add a new medical record to the blockchain
  const addRecord = async () => {
    try {
      const tx = await contract.addRecord(patientID, "Alice", diagnosis, treatment);
      await tx.wait();
      fetchPatientRecords();
      alert("Record added successfully");
    } catch (error) {
      console.error("Error adding records", error);
    }
  };

  // Authorize a healthcare provider (only contract owner can call this)
  const authorizeProvider = async () => {
    if (isOwner) {
      try {
        const tx = await contract.authorizeProvider(providerAddress);
        await tx.wait();
        alert(`Provider ${providerAddress} authorized successfully`);
      } catch (error) {
        console.error("Error authorizing provider", error);
      }
    } else {
      alert("Only contract owner can call this function");
    }
  };

  return (
    <>
      {/* Navbar */}
      <div className="navbar">
        <div className="nav-left">
          <h1 className="nav-logo">🏥 HealthCare Application</h1>
        </div>
        <div className="nav-right">
          {account && (
            <span className="nav-account">
              Connected: {account.slice(0, 6)}...{account.slice(-4)}
            </span>
          )}
        </div>
      </div>

      {/* Main Container */}
      <div className="container">
        {/* Owner Message */}
        {isOwner && <p className="owner-info">You are the contract owner</p>}

        {/* Fetch Patient Records Form */}
        <div className="form-section">
          <h2>Fetch Patient Records</h2>
          <input
            className="input-field"
            type="text"
            placeholder="Enter Patient ID"
            value={patientID}
            onChange={(e) => setPatientID(e.target.value)}
          />
          <button className="action-button" onClick={fetchPatientRecords}>
            Fetch Records
          </button>
        </div>

        {/* Add Record Form */}
        <div className="form-section">
          <h2>Add Patient Record</h2>
          <input
            className="input-field"
            type="text"
            placeholder="Diagnosis"
            value={diagnosis}
            onChange={(e) => setDiagnosis(e.target.value)}
          />
          <input
            className="input-field"
            type="text"
            placeholder="Treatment"
            value={treatment}
            onChange={(e) => setTreatment(e.target.value)}
          />
          <button className="action-button" onClick={addRecord}>
            Add Records
          </button>
        </div>

        {/* Authorize Provider Form */}
        <div className="form-section">
          <h2>Authorize HealthCare Provider</h2>
          <input
            className="input-field"
            type="text"
            placeholder="Provider Address"
            value={providerAddress}
            onChange={(e) => setProviderAddress(e.target.value)}
          />
          <button className="action-button" onClick={authorizeProvider}>
            Authorize Provider
          </button>
        </div>

        {/* Patient Records Display Section */}
        <div className="records-section">
          <h2>Patient Records</h2>
          {patientRecords.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#888', marginTop: '20px' }}>
              No records found for this patient.
            </p>
          ) : (
            patientRecords.map((record, index) => (
              <div className="record-card" key={index}>
                <p><strong>Record ID:</strong> {record.recordID.toNumber()}</p>
                <p><strong>Diagnosis:</strong> {record.diagnosis}</p>
                <p><strong>Treatment:</strong> {record.treatment}</p>
                <p><strong>Timestamp:</strong> {new Date(record.timestamp.toNumber() * 1000).toLocaleString()}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
};

export default Healthcare;