// import React from 'react';
import React, { useState } from 'react';

// import {useWallet} from '../helpers/wallet';

const WalletModal = () => {
  const [showModal, setShowModal] = useState(false);
  return (
    <>
      <button 
      className='bg-sui-sky text-white px-6 py-3 rounded-full shadow hover:shadow-lg outline-none focus:outline-none'
      type='button'
      onClick={() => setShowModal(true)}
      >
        Connect your wallet
      </button>

      {showModal ? (
        <>
          <div className="flex justify-center items-center overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none bg-sui-ocean-dark bg-opacity-50">
            <div className="relative w-auto my-4 mx-auto max-w-3xl">
              <div className="border-0 rounded-lg shadow-lg relative flex flex-col w-full bg-sui-ocean outline-none focus:outline-none">
                <div className="flex items-start justify-between p-5">
                  <h3 className="text-xl text-white">
                    Connect your Wallet
                  </h3>
                  <button
                    className="bg-transparent border-0 float-right"
                    onClick={() => setShowModal(false)}
                  >
                    <span className="text-sui-sky h-4 w-4 text-lg block py-0 rounded">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </span>
                  </button>
                </div>
                <div className="relative p-5 flex-auto">
                  <h2 className='text-sui-text-light'>Wallet connector will appear here</h2>
                </div>
              </div>
            </div>
          </div>
          </>
        ) : null
      }
    </>
  );
};


export default WalletModal;

