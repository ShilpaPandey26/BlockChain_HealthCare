// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// Contract to manage healthcare records securely
contract HealthcareRecords {
    address owner; // Address of the contract owner (admin)

    // Structure to store individual patient record details
    struct Record {
        uint256 recordID;
        string patientName;
        string diagnosis;
        string treatment;
        uint256 timestamp; 
    }

    // Mapping to store an array of records for each patient ID
    mapping(uint256 => Record[]) private patientRecords;

    // Mapping to keep track of authorized healthcare providers
    mapping(address => bool) private authorizedProviders;

    // Modifier to restrict access to only the contract owner
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can perform this function");
        _;
    }

    // Modifier to allow only authorized healthcare providers to access specific functions
    modifier onlyAuthorizedProvider() {
        require(authorizedProviders[msg.sender], "Not an authorized provider");
        _;
    }

    // Constructor runs once when the contract is deployed, setting the owner
    constructor() {
        owner = msg.sender;
    }

    // Function to return the current owner address
    function getOwner() public view returns (address) {
        return owner;
    }

    // Function for the owner to authorize a healthcare provider
    function authorizeProvider(address provider) public onlyOwner {
        authorizedProviders[provider] = true;
    }

    // Function for authorized providers to add a new record for a patient
    function addRecord(
        uint256 patientID,
        string memory patientName,
        string memory diagnosis,
        string memory treatment
    ) public onlyAuthorizedProvider {
        uint256 recordID = patientRecords[patientID].length + 1; // Generate new record ID
        patientRecords[patientID].push(
            Record(recordID, patientName, diagnosis, treatment, block.timestamp)
        );
    }

    // Function for authorized providers to retrieve all records for a patient
    function getPatientRecords(uint256 patientID) public view onlyAuthorizedProvider returns (Record[] memory) {
        return patientRecords[patientID];
    }
}
