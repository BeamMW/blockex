import React, { useEffect, useState } from 'react';
import { styled } from '@linaria/react';
import { css } from '@linaria/core';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Window, Button } from '@app/shared/components';
import { selectBlocksData, selectContractsData, selectStatusData } from '../../store/selectors';
// import { IconSend, IconReceive } from '@app/shared/icons';
import { CURRENCIES, ROUTES } from '@app/shared/constants';
import { selectSystemState, selectTransactions } from '@app/shared/store/selectors';
// import { IconDeposit, IconConfirm } from '@app/shared/icons';
import { timestampToDate } from '@core/appUtils';
import { LoadBlocks, LoadContracts } from '@core/api';

import { Table, Search, Pagination, Menu, Card } from 'semantic-ui-react';
import SemanticDatepicker from 'react-semantic-ui-datepickers';
import { setBlocksData, setContractsData } from '../../store/actions';

const Content = styled.div`
  width: 100%;
  min-height: 400px;
  padding: 20px 140px;
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

const StylesOverTable = css`
  width: 100%;
  padding: 20px 100px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const StylesTable = css`
  padding: 0 100px;
  width: 100%;
  margin: 0 !important;
`;

const StylesMenuControl = css`
  padding: 20px 100px 0;
  width: 100%;
`;

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

const MainPage: React.FC = () => {
  const TABS_CONFIG = [
    {
      name: 'blocks',
      disabled: false,
    },
    {
      name: 'contracts',
      disabled: false,
    },
    {
      name: 'dapps',
      disabled: true,
    },
    {
      name: 'assets',
      disabled: false,
    },
    {
      name: 'atomic swap offers',
      disabled: true,
    }
  ];

  const blocksData = useSelector(selectBlocksData());
  const [currentDate, setNewDate] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeMenuItem, setActiveMenuItem] = useState(TABS_CONFIG[0].name);
  const onChange = (event, data) => setNewDate(data.value);
  const dispatch = useDispatch();isLoading
  const statusData = useSelector(selectStatusData());

  const contractsData = useSelector(selectContractsData());

  // const state = { activeItem: 'home' }

  // const handleItemClick = (e, { name }) => this.setState({ activeItem: name })


  const navigate = useNavigate();

  // const getDate = (timestamp: number) => {
  //   const date = new Date(timestamp * 1000);
  //   const yearString = date.toLocaleDateString(undefined, { year: 'numeric' });
  //   const monthString = date.toLocaleDateString(undefined, { month: 'numeric' });
  //   const dayString = date.toLocaleDateString(undefined, { day: 'numeric' });
  //   const time = date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
  //   return `${dayString}.${monthString.length == 1 ? '0' + monthString.slice(-2) : monthString}.${yearString} ${time}`;
  // };

  const handleSearchChange = () => {
    
  };

  const paginationOnChange = async (e, data) => {
    if (activeMenuItem === TABS_CONFIG[0].name) {
      const newData = await LoadBlocks(data.activePage - 1);
      dispatch(setBlocksData(newData));
    } else if (activeMenuItem === TABS_CONFIG[1].name) {
      const newData = await LoadContracts(data.activePage - 1);
      dispatch(setContractsData(newData));
    }
  };

  const handleMenuItemClick = (newTab: string) => {
    setActiveMenuItem(newTab);
  };

  const isActiveMenuItem = (name: string) => {
    // console.log(name === activeMenuItem);
    return name === activeMenuItem;
  }
  
  return (
    <Window>
      <Content>
        <Card.Group>
          <Card className={StylesStatusCard}>
            <Card.Content className='card-content'>
              <div className='line'>
                <div className='subline'>
                  <div className='card-header'>BLOCKCHAIN HEIGHT</div>
                  <div className='card-text'>{statusData.height.toLocaleString()}</div>
                </div>
                <div className='subline'>
                  <div className='card-header'>LATEST BLOCK</div>
                  <div className='card-text'>{timestampToDate(statusData.timestamp)}</div>
                </div>
              </div>
              <div className='line bottom'>
                <div className='subline'>
                  <div className='card-header'>HASHRATE</div>
                  <div className='card-text'>{(statusData.difficulty / 60).toLocaleString(undefined, {maximumFractionDigits:2})} Sol/s</div>
                </div>
                <div className='subline'>
                  <div className='card-header'>LATEST BLOCK DIFFICULTY</div>
                  <div className='card-text'>{statusData.difficulty.toLocaleString()}</div>
                </div>
              </div>
            </Card.Content>
          </Card>

          <Card className={StylesStatusCard}>
            <Card.Content className='card-content'>
              <div className='line'>
                <div className='subline'>
                  <div className='card-header'>TOTAL EMISSION</div>
                  <div className='card-text'>{statusData.total_coins_emission.toLocaleString()} BEAM</div>
                </div>
                <div className='subline'>
                  <div className='card-header'>NEXT TREASURY EMISSION</div>
                  <div className='card-text'>{statusData.next_treasury_coins_amount.toLocaleString()} BEAM</div>
                </div>
              </div>
              <div className='line bottom'>
                <div className='subline'>
                </div>
                <div className='subline'>
                  <div className='card-header'>NEXT TREASURY EMISSION (block height)</div>
                  <div className='card-text'>{statusData.next_treasury_emission_height.toLocaleString()}</div>
                </div>
              </div>
            </Card.Content>
          </Card>

          <Card className={StylesStatusCard}>
            <Card.Content className='card-content'>
              <div className='line'>
                <div className='subline'>
                  <div className='card-header'>TOTAL COINS IN CIRCULATION</div>
                  <div className='card-text'>
                    {(statusData.coins_in_circulation_mined + statusData.coins_in_circulation_treasury).toLocaleString()} BEAM
                  </div>
                </div>
                <div className='subline'>
                  <div className='card-header'>COINS IN CIRCULATION (mined)</div>
                  <div className='card-text'>{statusData.coins_in_circulation_mined.toLocaleString()} BEAM</div>
                </div>
              </div>
              <div className='line bottom'>
                <div className='subline'>
                </div>
                <div className='subline'>
                  <div className='card-header'>COINS IN CIRCULATION (treasury)</div>
                  <div className='card-text'>{statusData.coins_in_circulation_treasury.toLocaleString()} BEAM</div>
                </div>
              </div>
            </Card.Content>
          </Card>

          <Card className={StylesStatusCard}>
          </Card>
        </Card.Group>
      </Content>
      <div className={StylesMenuControl}>
        <Menu pointing secondary>
          {TABS_CONFIG.map((tab, index) => 
            (<Menu.Item key={index}
              name={tab.name}
              disabled={tab.disabled}
              active={isActiveMenuItem(tab.name)}
              onClick={() => handleMenuItemClick(tab.name)}
            />)
          )}
        </Menu>
      </div>
      { blocksData.blocks && activeMenuItem === TABS_CONFIG[0].name ?
      <>
        <div className={StylesOverTable}>
          <Search
            disabled={true}
            placeholder='Search...'
            onSearchChange={handleSearchChange}
            // results={results}
            // value={value}
          />
          <SemanticDatepicker disabled={true} onChange={onChange} />
          <Pagination defaultActivePage={1} onPageChange={paginationOnChange} totalPages={blocksData.pages} />
        </div>
        <div className={StylesTable}>
          <Table singleLine>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell>HEIGHT:</Table.HeaderCell>
                <Table.HeaderCell>HASH:</Table.HeaderCell>
                <Table.HeaderCell>AGE:</Table.HeaderCell>
                <Table.HeaderCell>DIFFICULTY:</Table.HeaderCell>
                <Table.HeaderCell>#KERNELS:</Table.HeaderCell>
                <Table.HeaderCell>#INPUTS:</Table.HeaderCell>
                <Table.HeaderCell>#OUTPUTS:</Table.HeaderCell>
                <Table.HeaderCell>FEES:</Table.HeaderCell>
              </Table.Row>
            </Table.Header>

            <Table.Body>
              { blocksData.blocks.map((block, index)=> {
                return (<Table.Row key={index}>
                  <Table.Cell>{block.height}</Table.Cell>
                  <Table.Cell>{block.hash}</Table.Cell>
                  <Table.Cell>{timestampToDate(block.timestamp)}</Table.Cell>
                  <Table.Cell>{block.difficulty}</Table.Cell>
                  <Table.Cell>{block.kernelsCount}</Table.Cell>
                  <Table.Cell>{block.inputsCount}</Table.Cell>
                  <Table.Cell>{block.outputsCount}</Table.Cell>
                  <Table.Cell>{block.fee}</Table.Cell>
                </Table.Row>);
              }) }
              
            </Table.Body>
          </Table>
        </div>
      </> : <></> }
      { contractsData.contracts && activeMenuItem === TABS_CONFIG[1].name ?
      <>
        <div className={StylesOverTable}>
          <Search
            placeholder='Search...'
            onSearchChange={handleSearchChange}
            // results={results}
            // value={value}
          />
          <Pagination defaultActivePage={1} onPageChange={paginationOnChange} totalPages={contractsData.pages} />
        </div>
        <div className={StylesTable}>
          <Table singleLine>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell>HEIGHT:</Table.HeaderCell>
                <Table.HeaderCell>KIND:</Table.HeaderCell>
                <Table.HeaderCell>CID:</Table.HeaderCell>
                <Table.HeaderCell>#CALLS:</Table.HeaderCell>
              </Table.Row>
            </Table.Header>

            <Table.Body>
              { contractsData.contracts.map((contract, index)=> {
                return (<Table.Row key={index}>
                  <Table.Cell>{contract.height}</Table.Cell>
                  <Table.Cell>{typeof contract.kind === "string" ? contract.kind : contract.kind['Wrapper'] }</Table.Cell>
                  <Table.Cell>{contract.cid}</Table.Cell>
                  <Table.Cell>{contract.calls_count}</Table.Cell>
                </Table.Row>);
              })}
            </Table.Body>
          </Table>
        </div>
      </> : <></> }
      {/* <TableContent> */}
        {/* <Navigation>
          { TABS_CONFIG.map((tabItem) => {
            return (<div className='tab'>{tabItem.title}</div>);
          }) }
        </Navigation> */}

        
      {/* </TableContent> */}
    </Window>
    // <TableContent>
    //   <Menu>
    //     <Menu.Item>Home</Menu.Item>
    //     <Menu.Item>About</Menu.Item>
    //     <Menu.Item>Contact</Menu.Item>
    //   </Menu>
      
    //   <Table celled>
    //     <Table.Header>
    //       <Table.Row>
    //         <Table.HeaderCell>Name</Table.HeaderCell>
    //         <Table.HeaderCell>Age</Table.HeaderCell>
    //         <Table.HeaderCell>Gender</Table.HeaderCell>
    //       </Table.Row>
    //     </Table.Header>

    //     <Table.Body>
    //       <Table.Row>
    //         <Table.Cell>John</Table.Cell>
    //         <Table.Cell>25</Table.Cell>
    //         <Table.Cell>Male</Table.Cell>
    //       </Table.Row>
    //       <Table.Row>
    //         <Table.Cell>Jane</Table.Cell>
    //         <Table.Cell>30</Table.Cell>
    //         <Table.Cell>Female</Table.Cell>
    //       </Table.Row>
    //       <Table.Row>
    //         <Table.Cell>Bob</Table.Cell>
    //         <Table.Cell>35</Table.Cell>
    //         <Table.Cell>Male</Table.Cell>
    //       </Table.Row>
    //     </Table.Body>
    //   </Table>
    // </TableContent>
  );
};

export default MainPage;
