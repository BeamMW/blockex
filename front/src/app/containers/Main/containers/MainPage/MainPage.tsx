import React, { useEffect, useState } from 'react';
import { styled } from '@linaria/react';
import { css } from '@linaria/core';

import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Window, Button, Table } from '@app/shared/components';
import { selectBalance, selectBlocks, selectIsTrInProgress } from '../../store/selectors';
import { IconSend, IconReceive } from '@app/shared/icons';
import { CURRENCIES, ROUTES } from '@app/shared/constants';
import { selectSystemState, selectTransactions } from '@app/shared/store/selectors';
import { IconDeposit, IconConfirm } from '@app/shared/icons';
import { formatActiveAddressString } from '@core/appUtils';

const Content = styled.div`
  width: 100%;
  height: 1110px;
  padding: 0 140px;
  background-attachment: fixed;
  background-blend-mode: normal, multiply, multiply, multiply;
  background-image:
      linear-gradient(180deg, #000a16, #001f45),
      radial-gradient(circle at 50% 0, rgba(255, 255, 255, 0.5), rgba(0, 0, 0, 0.5)),
      linear-gradient(to left, rgba(255, 255, 255, 0.5), #d33b65),
      linear-gradient(297deg, #156fc3, rgba(255, 255, 255, 0.5)),
      radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0), rgba(21, 6, 40, 0.12));
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const TableContent = styled.div`
  width: 100%;
  padding: 0 140px;
`;

const Navigation = styled.div`
  display: flex;
  flex-direction: row;
  height: 100px;

  > .tab {
    padding: 0 16px;
    opacity: .5;
    font-size: 16px;
    font-weight: 600;
    letter-spacing: .4px;
    color: #333;
    align-self: center;
  }
`;

const HashLink = styled.a`
  text-decoration: none;
  color: #00f6d2;
`;

const MainPage: React.FC = () => {
  const blocksData = useSelector(selectBlocks());
  

  
  const navigate = useNavigate();
  const bridgeTransactions = useSelector(selectTransactions());
  const systemState = useSelector(selectSystemState());
  const [tableData, setTableData] = useState([]);

  useEffect(() => {
    if (bridgeTransactions.length > 0) {
      const data = bridgeTransactions.map((tr) => {
        const item = { ...tr };
        item['isIncome'] = systemState.account === tr.to;
        return item;
      });
      setTableData(data);
    }
  }, [bridgeTransactions]);

  const balance = useSelector(selectBalance());

  const getDate = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    const yearString = date.toLocaleDateString(undefined, { year: 'numeric' });
    const monthString = date.toLocaleDateString(undefined, { month: 'numeric' });
    const dayString = date.toLocaleDateString(undefined, { day: 'numeric' });
    const time = date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    return `${dayString}.${monthString.length == 1 ? '0' + monthString.slice(-2) : monthString}.${yearString} ${time}`;
  };

  const TABS_CONFIG = [
    {
      name: 'blocks',
      title: 'BLOCKS'
    },
    {
      name: 'contracts',
      title: 'CONTRACTS'
    },
    {
      name: 'dapps',
      title: 'DAPPS'
    },
    {
      name: 'assets',
      title: 'ASSETS'
    },
    {
      name: 'swaps',
      title: 'ATOMIC SWAP OFFERS'
    }
  ];

  const TABLE_CONFIG = [
    {
      name: 'value',
      title: 'Amount',
      fn: (value: string, tr: any) => {
        const curr = CURRENCIES.find((item) => { 
          return item.ethTokenContract.toLowerCase() === tr.contractAddress.toLowerCase()
        });
        if (curr) {
          const amount = ((parseInt(tr.value) / Math.pow(10, curr.decimals)).toFixed(curr.validator_dec)).replace(/\.?0+$/,"");
        return `${amount} ${curr.name}`;
        }
      }
    },
    {
      name: 'timeStamp',
      title: 'Date',
      fn: (value: string, tr: any) => {
        const date = getDate(tr.timeStamp);
        return date;

      }
    },
    {
      name: 'hash',
      title: 'Hash',
      fn: (value: string, tr: any) => {
        return (<HashLink href={'https://etherscan.io/tx/' + tr.hash} target='_blank'>
          {formatActiveAddressString(tr.hash)
        }</HashLink>)
      }
    }
  ];

  const handleSendClick: React.MouseEventHandler = () => {
    navigate(ROUTES.MAIN.SEND);
  };
  
  const handleReceiveClick: React.MouseEventHandler = () => {
    navigate(ROUTES.MAIN.RECEIVE);
  };

  return (
    <Window>
      <Content className='hello'></Content>

      <TableContent>
        {/* <Navigation>
          { TABS_CONFIG.map((tabItem) => {
            return (<div className='tab'>{tabItem.title}</div>);
          }) }
        </Navigation> */}
      </TableContent>
    </Window>
  );
};

export default MainPage;
