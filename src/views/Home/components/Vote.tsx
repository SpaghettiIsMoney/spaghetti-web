import React, { useCallback, useEffect, useState } from 'react'
import styled from 'styled-components'
import BigNumber from 'bignumber.js'
import Countdown, { CountdownRenderProps} from 'react-countdown'

import { useWallet } from 'use-wallet'

import Button from '../../../components/Button'
import Card from '../../../components/Card'
import CardContent from '../../../components/CardContent'
import Label from '../../../components/Label'
import Spacer from '../../../components/Spacer'

import useYam from '../../../hooks/useYam'

import {
  migrate,
  getApproved,
  approveMigrate,
  didDelegate,
  getDelegatedBalance,
  getScalingFactor,
  getVotes,
  hasv1,
} from '../../../yamUtils'

interface VoteProps {
}

const METER_TOTAL = 150000

const WARNING_TIMESTAMP = 1598745600000 - 600000

const Voter: React.FC<VoteProps> = () => {
  const [totalVotes, setTotalVotes] = useState(new BigNumber(0))
  const [scalingFactor, setScalingFactor] = useState(new BigNumber(1))
  const [delegated, setDelegated] = useState(false)
  const [delegatedBalance, setDelegatedBalance] = useState(new BigNumber(0))
  const [approved, setApproved] = useState(false)

  const { account, ethereum } = useWallet()
  const yam = useYam()

  const renderer = (countdownProps: CountdownRenderProps) => {
    const { days, hours, minutes, seconds } = countdownProps
    const paddedSeconds = seconds < 10 ? `0${seconds}` : seconds
    const paddedMinutes = minutes < 10 ? `0${minutes}` : minutes
    const paddedHours = hours < 10 ? `0${hours}` : hours
    return (
      <StyledCountdown>{days}:{paddedHours}:{paddedMinutes}:{paddedSeconds}</StyledCountdown>
    )
  }

  const handleVoteClick = useCallback(() => {
    migrate(ethereum, account)
  }, [account])

  const handleApproveClick = useCallback(() => {
    approveMigrate(ethereum, account)
  }, [account])

  const fetchVotes = useCallback(async () => {
    const voteCount = await getVotes(yam)
    const scalingFactor = await getScalingFactor(yam)
    setTotalVotes(voteCount)
    setScalingFactor(scalingFactor)
  }, [yam, setTotalVotes, setScalingFactor])

  useEffect(() => {
    if (yam) {
      fetchVotes()
    }
    const refetch = setInterval(fetchVotes, 10000)
    return () => clearInterval(refetch)
  }, [fetchVotes, yam])

  const fetchDidDelegate = useCallback(async () => {
    const d = await hasv1(ethereum, account)
    if (d > 0) {
      setDelegatedBalance(d)
    }
    setDelegated(d != 0)
  }, [setDelegated, yam, account, setDelegatedBalance])

  useEffect(() => {
    if (yam && account) {
      fetchDidDelegate()
    }
  }, [fetchDidDelegate, yam, account])

  const fetchApproved = useCallback(async () => {
    const d = await getApproved(ethereum, account)
    const b = new BigNumber(d);
    if (b.gt(0)) {
      setApproved(true);
    } else {
      setApproved(false)
    }
  }, [setApproved, ethereum, account])

  
  useEffect(() => {
    if (ethereum && account) {
      fetchApproved()
    }
  }, [fetchApproved, ethereum, account])


  return (
    <Card>
      <CardContent>
        <div style={{ alignItems: 'flex-start', display: 'flex' }}>
          <StyledCenter>
            <Label text="Time remaining" />
            {Date.now() > WARNING_TIMESTAMP ? (
              <StyledTitle>{`< 10 minutes`}</StyledTitle>
            )
            : (
              <Countdown date={1598745600000} renderer={renderer} />
            )}
          </StyledCenter>
          <Spacer />
        </div>
        <Spacer />
        <div>
        <StyledDelegatedCount>⚠️ DO NOT MIGRATE FROM THE SAME ACCOUNT TWICE. ⚠️</StyledDelegatedCount>
        <StyledDelegatedCount>⚠️ THERE IS A BUG IN THE MIGRATION LOGIC. ⚠️</StyledDelegatedCount>
        <StyledDelegatedCount>⚠️ IT WILL RESET YOUR BALANCE. ⚠️</StyledDelegatedCount>
        </div>
        <Spacer />

        {!approved && !delegated ? (<Button text="Approve to migrate to PASTA v2" onClick={handleApproveClick} />) : (<></>)}
        
        {!delegated ? (
          <Button text="Migrate to PASTA v2" onClick={handleVoteClick} />
        ) : (
          <div>
            <StyledDelegatedCount>You don't have any PASTAv1 to migrate</StyledDelegatedCount>
          </div>
        )}
        <div style={{
          margin: '0 auto',
          width: 512,
          paddingTop: 24,
          opacity: 0.6,
        }}>
          <p>NOTE: You must migrate your PASTA BEFORE 12am UTC Sunday 8/30 - very soon.</p>
        </div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: 32,
          }}>
          <StyledLink target="__blank" href="https://twitter.com/SpaghettiMoney/status/1298853026556452864">More Info</StyledLink>
        </div>
      </CardContent>
    </Card>
  )
}

const StyledDelegatedCount = styled.div`
  text-align: center;
  font-size: 24px;
  color: ${props => props.theme.color.grey[600]};
  font-weight: 700;
  margin: 0 auto;
`

const StyledThankYou = styled.div`
  font-size: 24px;
  font-weight: 700;
  color: ${props => props.theme.color.secondary.main};
  text-align: center;
  padding: 0 48px;
`

const StyledDenominator = styled.div`
  margin-left: 8px;
  font-size: 18px;
  color: ${props => props.theme.color.grey[600]};
`

const StyledCountdown = styled.div`
  color: ${props => props.theme.color.primary.main};
  font-size: 32px;
  font-weight: 700;
`

const StyledTitle = styled.div`
  font-size: 32px;
  font-weight: 700;
  line-height: 32px;
`

const StyledCheckpoints = styled.div`
  position: relative;
  width: 100%;
  height: 56px;
`

/*
          <StyledCheckpoint left={35500 / METER_TOTAL * 100}>
            <StyledCheckpointText left={-48}>
              <div>Target Proposal</div>
              <div>50,000</div>
            </StyledCheckpointText>
          </StyledCheckpoint>
*/

interface StyledCheckpointProps {
  left: number
}

const StyledCenter = styled.div`
  display: flex;
  justify-content: center;
  flex-direction: column;
  margin: 0 auto;
`
const StyledCheckpoint = styled.div<StyledCheckpointProps>`
  position: absolute;
  left: ${props => props.left}%;
  z-index: 1;
  &:after {
    content: "";
    position: absolute;
    width: 1px;
    background-color: ${props => props.theme.color.grey[400]};
    height: 28px;
    left: 0;
    top: 40px;
  }
`

const StyledCheckpointText = styled.div<StyledCheckpointProps>`
  position: absolute;
  left: ${props => props.left}px;
  font-size: 14px;
  font-weight: 700;
  white-space: nowrap;
  color: ${props => props.theme.color.grey[600]};
  text-align: center;
`

const StyledMeter = styled.div`
  box-sizing: border-box;
  position: relative;
  height: 12px;
  border-radius: 16px;
  width: 100%;
  background-color: ${props => props.theme.color.grey[300]};
  padding: 2px;
`

interface StyledMeterInnerProps {
  width: number
}
const StyledMeterInner = styled.div<StyledMeterInnerProps>`
  height: 100%;
  background-color: ${props => props.theme.color.secondary.main};
  border-radius: 12px;
  width: ${props => props.width}%;
`

const StyledLink = styled.a`
  color: ${props => props.theme.color.grey[600]};
  text-decoration: none;
  font-weight: 700;
`

export default Voter
