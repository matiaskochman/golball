import React, { useState, useEffect } from "react";
import _ from 'lodash';
import { ethers } from "ethers";
import Web3Modal from 'web3modal'
import GolNft from "./contracts/GolNft.json";
import GolBallAdmin from "./contracts/GolBallAdmin.json";
// import { 
//   getConfigObject,
//   getGasPrice
// } from './util/config'

let configObject;

function App() {
  const [status, setStatus] = useState("");
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isCorrectNetwork, setCorrectNetwork] = useState(false)
  const [tokenIdsForAddress, setTokenIdsForAddress] = useState([]);  

    useEffect(() => {
      async function fetchData() {
        const tokenIds = fetchNftsForAddress('0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266');
        return tokenIds;
      }

      getConfigObject().then((_configObj) => {
        configObject = _configObj;
        checkCorrectNetwork(configObject).then((result) => {
          fetchData().then((tokenIdList) => {
            setLoading(false);
            setTokenIdsForAddress(tokenIdList)
          })
        });
      })
    },[])


    const getConfigObject = async () =>  {
    let provider;
    try {
  
      const web3Modal = new Web3Modal()
      const connection = await web3Modal.connect()
      provider = new ethers.providers.Web3Provider(connection)
    } catch (err) {
      // Handle any errors that occur during creation of the Web3Provider object
      console.error('Error creating Web3Provider:', err);
      // Optionally, you can show a user-friendly error message to the user
      alert('Error creating Web3Provider. Please ensure that you have a compatible Ethereum browser extension installed and try again.');
    }
    if (provider) {
  
      const { chainId } = await provider.getNetwork()
      const accounts = await provider.listAccounts()    
      const signer = provider.getSigner();
  
      // // Cargar los contratos
      let golNft, golBallAdmin;
  
      try {
        if(!_.isNil(chainId) && chainId == 31337) {
          // is usign hardhat test network
          golNft = new ethers.Contract("0x5FbDB2315678afecb367f032d93F642f64180aa3", GolNft.abi, signer);
          golBallAdmin = new ethers.Contract("0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0", GolBallAdmin.abi, signer);
        } else if (!_.isNil(chainId) && chainId == 80001) {
          // is using mumbai test network
          golNft = new ethers.Contract("0x9Fd1276064e15DB464DaDF71ba816795cDf86A88", GolNft.abi, signer);
          golBallAdmin = new ethers.Contract("0x9969d3B8EabF0a68268A1dFF47A9422230B16377", GolBallAdmin.abi, signer);
        } else {
          // another network is connected to metamask
          alert('wrong network, change to polygon mumbain or hardhat node port 31337')
          throw new Error('Wrong network');
        }
  
  
        if (golNft && golBallAdmin) {
          // return {golNft, golBallAdmin};
          const confObj = {golNft, golBallAdmin, chainId, accounts, signer};
          // setConfigObject(confObj)
          return confObj;
        } else {
          // Handle the error case
          console.error('Contract not available. Cannot interact with the contract.');
          // Optionally, you can show a user-friendly error message to the user
          alert('Error interacting with the contract. Please check that the contract address is valid and try again.');
        }
  
      } catch (err) {
        // Handle any errors that occur during creation of the Contract object
        console.error('Error creating Contract:', err);
        // Optionally, you can show a user-friendly error message to the user
        alert('Error creating Contract. Please check that the contract address is valid and try again.');
      }
  
  
    } else {
      // Handle the error case
      console.error('Web3Provider not available. Cannot interact with the Ethereum blockchain.');
      // Optionally, you can show a user-friendly error message to the user
      alert('Error interacting with the Ethereum blockchain. Please ensure that you have a compatible Ethereum browser extension installed and try again.');
    }     
  }  
  let checkCorrectNetwork = async (configObj) => {

    if(
      !_.isNil(configObj) 
      && !_.isNil(configObj) 
      && (configObj.chainId == 80001 || configObj.chainId == 31337)) {
        setCorrectNetwork(true)
    } else {
      console.log(configObj)
      setCorrectNetwork(false)
    }
    return true;
  }

  async function fetchNftsForAddress(address) {
    try {
      const balance = await configObject.golNft.balanceOf(address);
      console.log(balance)
      const tokenIds = [];
      const tokenIdList = await configObject.golNft.getTokenIdListForAddress("0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266");
      for (let i = 0; i < tokenIdList.length ; i++) {
        tokenIds.push(tokenIdList[i].toNumber())
      }
      // setTokenIdsForAddress(tokenIds)
      return tokenIds;
    } catch (error) {
      console.error(`Error: ${error}`);
    }
    // Iterar sobre cada NFT y obtener su ID y otros detalles
  }
  

  async function sendNFT(tokenId) {
    setStatus("Enviando NFT...");

    // let contracts = await getContracts();

    if (configObject.golNft && configObject.golBallAdmin) {
      let transaction;
      let tx;

      try {
        // // Aprobar la transferencia del NFT
        transaction = await configObject.golNft.approve(configObject.golBallAdmin.address, tokenId);
        tx = await transaction.wait()
        if (tx && tx.events && tx.events.length > 0) {
          const event = tx.events[0];
          console.log(event)
        }
      } catch(e) {
        if(JSON.stringify(e).includes("ERC721: approval to current owner")) {
          const error = "Trying to approve an NFT with an user which is not the owner";
          alert(error);
          throw new Error(error)
        }
      }
  
      try {
        transaction = await configObject.golBallAdmin.swap(configObject.golNft.address, tokenId);
        tx = await transaction.wait()
        if (tx && tx.events && tx.events.length > 0) {
          const event = tx.events[0];
          console.log(event)
        }
      } catch(e) {        
        if(JSON.stringify(e).includes("Collection not found")) {
          const error = "Collection not found in Admin";
          alert(error);
          throw new Error(error)
        }
      }

    } else {
      // Handle the error case
      console.error('Contract not available. Cannot interact with the contract.');
      // Optionally, you can show a user-friendly error message to the user
      alert('Error interacting with the contract. Please check that the contract address is valid and try again.');
    }

  }

  const Loading = () => {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>Loading...</p>
      </div>
    );
  };

  function Boton({label, onClick}) {
    return (
      <button 
        onClick={onClick}
        style={{
          fontSize: "1.5em",
          padding: "10px 20px",
          borderRadius: "5px",
          backgroundColor: "blue",
          color: "white",
          border: "none",
          cursor: "pointer"
        }}
      >
        {label}
      </button>
    );
  }
  function ListaDeBotones({ botonData }) {
    let leftButtons = [];
    let rightButtons = [];
    let val = 0;
    for (let index = 0; index < botonData.length; index++) {

      val = index % 2;
      if(val === 0) {
        leftButtons.push(botonData[index])
      } else {
        rightButtons.push(botonData[index])
      }
      
    }
    return (
      <div  style={{ 
        display: "flex", 
        justifyContent: "space-around",
        // backgroundColor: 'red',
        marginInline:'20%'
      }}>
        <div style={{ 
          display: "flex", 
          flexDirection: "column",
        }}>
          {leftButtons.map((boton, index) => (
            <div key={index+'a'} style={{
              display: "flex", 
              marginTop:'20px'
            }}>
              <Boton key={index} label={boton.label} onClick={boton.onClick} />
            </div>
          ))}
        </div>
        <div style={{ 
          display: "flex", 
          flexDirection: "column",
          alignItems:'space-around',
        }}>
          {rightButtons.map((boton, index) => (
            <div key={index+'b'} style={{
              display: "flex", 
              marginTop:'20px'
            }}>
              <Boton key={index} label={boton.label} onClick={boton.onClick} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if(!loading && isCorrectNetwork) {
    let botonData = [];
    if(!_.isNil(tokenIdsForAddress) && tokenIdsForAddress.length > 0) {
      for (let index = 0; index < tokenIdsForAddress.length; index++) {
        const tokenId = tokenIdsForAddress[index];
        botonData.push({
          label: `Nft ${tokenId}`,
          onClick: () => sendNFT(tokenId)
        })
      }
    }
    console.log(tokenIdsForAddress)
    return (
      <div style={{
        display:'flex',
        alignContent:'flex-start',
        flexDirection: 'column'
      }}>
        <div style={{
          display:'flex',
          justifyContent:'center',
          backgroundColor:'grey',
          marginBottom:'150px'
        }}>
          <h1>Lista de NFTs</h1>
        </div>
        <ListaDeBotones botonData={botonData} />
      </div>      
    );
  } else {
    return <Loading/>
  }
}

export default App;