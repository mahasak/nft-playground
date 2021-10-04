import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.css'
let Web3 = require('web3');
import React, { useState, useEffect } from 'react';


export default function Home() {
  const [contract, setContract] = useState(null)
  const [web3, setWeb3] = useState(null)
  const [address, setAddress] = useState(null)
  let abi = require('../contracts/abi.json');
  let contractAddress = "0x345c8687E13Ed07d3e7923872741f0ed8cFDE8a8"
  const [totalSupply, setTotalSupply] = useState(0)
  const [maxSupply, setMaxSupply] = useState(0)

  function mint() {
    if (web3 === null || contract === null) {
      return;
    }
    console.log(web3);
    let _price = web3.utils.toWei("0.001");
    console.log(_price);



    let encoded = contract.methods.mintToken(1).encodeABI()

    let tx = {
      from: address,
      to: contractAddress,
      data: encoded,
      nonce: "0x00",
      value: web3.utils.numberToHex(_price)
    }

    let txHash = ethereum.request({
      method: 'eth_sendTransaction',
      params: [tx],
    }).then((hash) => {
      alert("You can now view your transaction with hash: " + hash)
    }).catch((err) => console.log(err))

    return txHash
  }


  useEffect(() => {
    window.ethereum ?
      ethereum.request({ method: "eth_requestAccounts" }).then((accounts) => {
        setAddress(accounts[0])
        let w3 = new Web3(ethereum)
        setWeb3(w3)
        let c = new w3.eth.Contract(abi, contractAddress)
        setContract(c)
        c.methods.totalSupply().call().then((_supply) => {
          // Optionally set it to the state to render it using React
          setTotalSupply(_supply)
        }).catch((err) => console.log(err))

        c.methods.maxSupply().call().then((_maxSupply) => {
          // Optionally set it to the state to render it using React
          setMaxSupply(_maxSupply)
        }).catch((err) => console.log(err))
      }).catch((err) => console.log(err))
      : console.log("Please install MetaMask")
  }, [])

  return (
    <div className={styles.container}>
      <Head>
        <title>Create Next App</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>
          SimpleToken supply {totalSupply}/{maxSupply}
        </h1>

        <p className={styles.description}>
          <button onClick={mint}>Mint Now</button>
        </p>

      </main>

      <footer className={styles.footer}>
        <a
          href="https://github.com/mahasak/nft-playground/"
          target="_blank"
          rel="noopener noreferrer"
        >
          SimpleToken
        </a>
      </footer>
    </div>
  )
}
