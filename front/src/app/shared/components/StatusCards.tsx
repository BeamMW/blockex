import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Card } from 'semantic-ui-react';
import { css } from '@linaria/core';
import { timestampToDate } from '@core/appUtils';
import { selectStatusData } from '../store/selectors';

const StylesStatusCard = css`
  height: 150px;
  min-width: 530px;
  width: 49% !important;
  margin: 5px !important;
  padding: 0 !important;
  border-radius: 10px !important;
  background-color: rgba(255, 255, 255, .05) !important;
  border: none !important;
  box-shadow: none !important;

  > .card-content {
    padding: 20px;
    display: flex;
    flex-direction: column;

    > .line {
      display: flex;
      flex-direction: row;

      > .subline {
        width: 50%;
      }
    }

    > .line.bottom {
      margin-top: auto;
    }

    .card-header {
      opacity: .5;
      font-size: 12px;
      font-weight: 600;
      letter-spacing: .3px;
      color: #fff;
    }

    .card-text {
      margin-top: 10px;
      font-weight: 400;
      color: #fff;
      font-size: 18px;
      letter-spacing: .8px;
    }
  }
`;

const StatusCards: React.FC = ({
  ...rest
}) => {
  const status = useSelector(selectStatusData());

  return (
    <Card.Group>
      <Card className={StylesStatusCard}>
        {status && <Card.Content className='card-content'>
          <div className='line'>
            <div className='subline'>
              <div className='card-header'>BLOCKCHAIN HEIGHT</div>
              <div className='card-text'>{status.height.toLocaleString()}</div>
            </div>
            <div className='subline'>
              <div className='card-header'>LATEST BLOCK</div>
              <div className='card-text'>{timestampToDate(status.timestamp, true)}</div>
            </div>
          </div>
          <div className='line bottom'>
            <div className='subline'>
              <div className='card-header'>HASHRATE</div>
              <div className='card-text'>{(status.difficulty / 60).toLocaleString(undefined, {maximumFractionDigits:2})} Sol/s</div>
            </div>
            <div className='subline'>
              <div className='card-header'>LATEST BLOCK DIFFICULTY</div>
              <div className='card-text'>{status.difficulty.toLocaleString()}</div>
            </div>
          </div>
        </Card.Content>}
      </Card>

      <Card className={StylesStatusCard}>
        {status && <Card.Content className='card-content'>
          <div className='line'>
            <div className='subline'>
              <div className='card-header'>TOTAL EMISSION</div>
              <div className='card-text'>{status.total_coins_emission.toLocaleString()} BEAM</div>
            </div>
            <div className='subline'>
              <div className='card-header'>NEXT TREASURY EMISSION</div>
              <div className='card-text'>{status.next_treasury_coins_amount.toLocaleString()} BEAM</div>
            </div>
          </div>
          <div className='line bottom'>
            <div className='subline'>
            </div>
            <div className='subline'>
              <div className='card-header'>NEXT TREASURY EMISSION (block height)</div>
              <div className='card-text'>{status.next_treasury_emission_height.toLocaleString()}</div>
            </div>
          </div>
        </Card.Content>}
      </Card>

      <Card className={StylesStatusCard}>
        {status && <Card.Content className='card-content'>
          <div className='line'>
            <div className='subline'>
              <div className='card-header'>TOTAL COINS IN CIRCULATION</div>
              <div className='card-text'>
                {(status.coins_in_circulation_mined + status.coins_in_circulation_treasury).toLocaleString()} BEAM
              </div>
            </div>
            <div className='subline'>
              <div className='card-header'>COINS IN CIRCULATION (mined)</div>
              <div className='card-text'>{status.coins_in_circulation_mined.toLocaleString()} BEAM</div>
            </div>
          </div>
          <div className='line bottom'>
            <div className='subline'>
            </div>
            <div className='subline'>
              <div className='card-header'>COINS IN CIRCULATION (treasury)</div>
              <div className='card-text'>{status.coins_in_circulation_treasury.toLocaleString()} BEAM</div>
            </div>
          </div>
        </Card.Content>}
      </Card>

      <Card className={StylesStatusCard}>
        {status && <></>}
      </Card>
    </Card.Group>
  )
};

export default StatusCards;
