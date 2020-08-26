import React, { useMemo, useEffect, useState, useCallback } from 'react'
import styled from 'styled-components'
import axios from "axios";
import { useWallet } from 'use-wallet'

import numeral from 'numeral'

import Card from '../../../components/Card'
import CardContent from '../../../components/CardContent'
import Label from '../../../components/Label'

import { getDisplayBalance } from '../../../utils/formatBalance'
import BigNumber from 'bignumber.js'

import {
  getSupply,
} from '../../../yamUtils'

interface StatsProps {
  circSupply?: string,
  curPrice?: number,
  targetPrice?: number,
  totalSupply?: string
}
const Stats: React.FC<StatsProps> = ({
  circSupply,
  curPrice,
  targetPrice,
  totalSupply,
}) => {
  const [currentPrice, setCurrentPrice] = useState(new Number)
  const [supply, setSupply] = useState("")

  const { account, ethereum } = useWallet()

  const formattedTotalSupply = useMemo(() => {
    if (supply) {
      const supplyStr = getDisplayBalance(new BigNumber(supply))
      return numeral(supplyStr).format('0.00a')
    } else return '--'
  }, [supply])

  useEffect(() => {
    axios.get('https://api.coingecko.com/api/v3/simple/price?ids=Cethereum%2Cspaghetti&vs_currencies=usd').then((res) => {
      if (res.status === 200) {
        setCurrentPrice(Number(res.data['spaghetti'].usd))
      }
    })
  }, [setCurrentPrice])

  const fetchTotalSupply = useCallback(async () => {
    const d = await getSupply(ethereum)
    console.log(d)
    setSupply(d);
  }, [setSupply, ethereum])

  useEffect(() => {
    if (ethereum) {
      fetchTotalSupply()
    }
  }, [fetchTotalSupply, ethereum])

  return (
    <StyledStats>
      <Card>
        <CardContent>
          <StyledStat>
            <StyledValue>{Number(currentPrice).toLocaleString()}</StyledValue>
            <Label text="Current Price" />
          </StyledStat>
        </CardContent>
      </Card>

      <StyledSpacer />

      {/* <Card>
        <CardContent>
          <StyledStat>
            <StyledValue>$100</StyledValue>
            <Label text="Target Price" />
          </StyledStat>
        </CardContent>
      </Card> */}

      <StyledSpacer />

      <Card>
        <CardContent>
          <StyledStat>
            <StyledValue>
              {formattedTotalSupply}
            </StyledValue>
            <Label text="Total Supply" />
          </StyledStat>
        </CardContent>
      </Card>
    </StyledStats>
  )
}

const StyledStats = styled.div`
  width: 325px;
`

const StyledStat = styled.div`
  display: flex;
  flex-direction: column;
`

const StyledValue = styled.span`
  color: ${props => props.theme.color.grey[600]};
  font-size: 36px;
  font-weight: 700;
`

const StyledSpacer = styled.div`
  height: ${props => props.theme.spacing[4]}px;
`

export default Stats