import React from 'react';
import {WalletModal} from './WalletModal';
import Logo from '../public/svg/sui-logo-light.svg';

const Header = () => {
    return (
      <>
        <div className='bg-sui-ocean-dark px-3.5'>
            <div className='py-4'>
                <div className='flex justify-between items-center'>
                    <div>
                        <Logo />
                    </div>
                    <div>
                        <WalletModal />
                    </div>
                </div>
            </div>
        </div>
      </>
    );
  }

  export {Header};
