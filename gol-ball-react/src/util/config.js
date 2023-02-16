import { ethers } from 'ethers'
import Web3Modal from 'web3modal'
import _ from 'lodash'
import GolNft from "../contracts/GolNft.json";
import GolBallAdmin from "../contracts/GolBallAdmin.json";

import axios from 'axios'

let confObj;

// export const getConfObject = async () => {

//   if(!_.isNil(confObj)) {
//     return confObj
//   }

//   try {
//     const web3Modal = new Web3Modal()
//     const connection = await web3Modal.connect()
//     const provider = new ethers.providers.Web3Provider(connection)
//     const signer = provider.getSigner()
//     const { chainId } = await provider.getNetwork()
//     const accounts = await provider.listAccounts()

//     if(!_.isNil(chainId) && chainId === 80001) {
//       // is mumbai
//       confObj = {
//         network: {
//           name: 'mumbai',
//           chainId: chainId,
//         },
//         Admin: {
//           address: '',
//           abi: Admin.abi
//         },
//         NFT: {
//           address: '',
//           abi: NFT.abi
//         }
//       }
    
//     } else if (!_.isNil(chainId) && chainId === 31337) {
//       // is hardhat

//       confObj = {
//         network: {
//           name: 'hardhat',
//           chainId: chainId,
//         },
//         ADMIN: {
//           address: '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0',
//           abi: Admin.abi
//         },
//         NFT: {
//           address: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
//           abi: NFT.abi
//         }
    
//       }      
    
//       const adminContract = new ethers.Contract(
//         confObj.ADMIN.address, 
//         confObj.ADMIN.abi, 
//         confObj.signer
//       )
      
//       const nftContract = new ethers.Contract(
//         confObj.NFT.address, 
//         confObj.NFT.abi, 
//         confObj.signer
//         )
      
//       confObj.signer = signer;
//       confObj.provider = provider
//       confObj.accounts = accounts
//       confObj.adminContract = adminContract
//       confObj.nftContract = nftContract
//       return confObj
  
//     } else {
//       console.error("wrong network... not mumbai, not hardhat")
//       alert('wrong network')
//     }
//   } catch (e) {
//     console.error(e)
//   } 
// }

export async function getConfigObject() {
  let provider;
  try {

    const web3Modal = new Web3Modal()
    const connection = await web3Modal.connect()
    provider = new ethers.providers.Web3Provider(connection)

    // provider = new ethers.providers.Web3Provider(window.ethereum);

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
        golNft = new ethers.Contract("0x5FbDB2315678afecb367f032d93F642f64180aa3", GolNft.abi, signer);
        golBallAdmin = new ethers.Contract("0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0", GolBallAdmin.abi, signer);
      } else if (!_.isNil(chainId) && chainId == 80001) {
        golNft = new ethers.Contract("0x9Fd1276064e15DB464DaDF71ba816795cDf86A88", GolNft.abi, signer);
        golBallAdmin = new ethers.Contract("0x9969d3B8EabF0a68268A1dFF47A9422230B16377", GolBallAdmin.abi, signer);
      } else {
        alert('wrong network, change to polygon mumbain or hardhat node port 31337')
        throw new Error('Wrong network');
      }


      if (golNft && golBallAdmin) {
        // return {golNft, golBallAdmin};
        confObj = {golNft, golBallAdmin, chainId, accounts, signer};
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

export const getGasPrice = async () => {
  const chainId = confObj.network.chainId

  // get max fees from gas station
  let maxFeePerGas = ethers.BigNumber.from(40000000000) // fallback to 40 gwei
  let maxPriorityFeePerGas = ethers.BigNumber.from(40000000000) // fallback to 40 gwei
  let gasStationUrl;
  if(chainId === 80001) {
    gasStationUrl = 'https://gasstation-mumbai.matic.today/v2'
  } else if(chainId === 137) {
    gasStationUrl = 'https://gasstation-mainnet.matic.network/v2'
  } else if(chainId === 31337){
    // network is hardhat node
    const resultArray = [maxFeePerGas, maxPriorityFeePerGas]
    return resultArray    
  
  }
  try {
    const { data } = await axios({
      method: 'get',
      url: gasStationUrl
    })
    maxFeePerGas = ethers.utils.parseUnits(
      Math.ceil(data.fast.maxFee) + '',
      'gwei'
    )
    maxPriorityFeePerGas = ethers.utils.parseUnits(
      Math.ceil(data.fast.maxPriorityFee) + '',
      'gwei'
    )
  } catch {
      // ignore
  }
  const resultArray = [maxFeePerGas, maxPriorityFeePerGas]
  return resultArray    
}
