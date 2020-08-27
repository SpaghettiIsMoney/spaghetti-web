import React, { useCallback, useEffect, useState } from 'react'
import Web3 from 'web3';
import { Contract } from 'web3-eth-contract'
import { useWallet } from 'use-wallet'
import { provider } from 'web3-core'

import { yam as yamAddress } from '../../constants/tokenAddresses'
import useYam from '../../hooks/useYam'
import { getPoolContracts } from '../../yamUtils'

import Context from './context'
import { Farm } from './types'
import Pool from '../../yam/clean_build/contracts/YAMMKRPool.json';

const NAME_FOR_POOL: { [key: string]: string } = {
  uni_pool: 'WETH_PASTA_UNI_LP',
}

const ICON_FOR_POOL: { [key: string]: string } = {
  uni_pool: '🌈',
}

const SORT_FOR_POOL: { [key: string]: number } = {
  uni_pool: 9,
}

const Farms: React.FC = ({ children }) => {

  const [farms, setFarms] = useState<Farm[]>([])
  const yam = useYam()
  const { account, ethereum } = useWallet()

  const fetchPools = useCallback(async () => {
    const pools: { [key: string]: Contract} = await getPoolContracts(yam)

    const farmsArr: Farm[] = []
    const poolKeys = Object.keys(pools)

    for (let i = 0; i < poolKeys.length; i++) {
      const poolKey = poolKeys[i]
      const pool = pools[poolKey]
      let tokenKey = poolKey.replace('_pool', '')
      if (tokenKey === 'eth') {
        tokenKey = 'weth'
      }

      try {
        let tokenAddress = ''
        
        if (tokenKey === 'uni') {
          tokenAddress = '0xE92346d9369Fe03b735Ed9bDeB6bdC2591b8227E'
          console.log(pool)

          // const web3 = new Web3(ethereum as provider);
          // const poolContract = new web3.eth.Contract(Pool.abi, Pool.networks[1].address);

          farmsArr.push({
            contract: pool,
            name: NAME_FOR_POOL[poolKey],
            depositToken: tokenKey,
            depositTokenAddress: tokenAddress,
            earnToken: 'PASTA',
            earnTokenAddress: yamAddress,
            icon: ICON_FOR_POOL[poolKey],
            id: tokenKey,
            sort: SORT_FOR_POOL[poolKey]
          })
        }

      } catch (e) {
        console.log(e)
        alert(e);
      }
    }
    farmsArr.sort((a, b) => a.sort < b.sort ? 1 : -1)
    setFarms(farmsArr)
  }, [yam, setFarms])

  useEffect(() => {
    if (yam) {
      fetchPools()
    }
  }, [yam, fetchPools])
  
  return (
    <Context.Provider value={{ farms }}>
      {children}
    </Context.Provider>
  )
}

export default Farms