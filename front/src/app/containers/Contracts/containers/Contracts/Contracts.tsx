import React, { useEffect, useState, useCallback } from 'react';
import { styled } from '@linaria/react';
import { css } from '@linaria/core';
import { Contract } from '@core/types';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { Window, Button, StatusCards } from '@app/shared/components';
import { selectBlocksData, selectContractsData, selectStatusData } from '../../store/selectors';
// import { IconSend, IconReceive } from '@app/shared/icons';
import { CURRENCIES, ROUTES, MENU_TABS_CONFIG } from '@app/shared/constants';
import { selectSystemState, selectTransactions } from '@app/shared/store/selectors';
// import { IconDeposit, IconConfirm } from '@app/shared/icons';
import { timestampToDate } from '@core/appUtils';
import { LoadBlocks, LoadContracts } from '@core/api';

import { Table, Search, Pagination, Menu, Card } from 'semantic-ui-react';
import SemanticDatepicker from 'react-semantic-ui-datepickers';
// import { setBlocksData, setContractsData } from '../../store/actions';

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

const StylesTableRow = css`
  cursor: pointer;
`;

const Contracts: React.FC = () => {
  const blocksData = useSelector(selectBlocksData());
  const [currentDate, setNewDate] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeMenuItem, setActiveMenuItem] = useState(MENU_TABS_CONFIG[1].name);
  const onChange = (event, data) => setNewDate(data.value);
  const dispatch = useDispatch();isLoading
  const statusData = useSelector(selectStatusData());
  const location = useLocation();


  const contractsData = useSelector(selectContractsData());

  // const state = { activeItem: 'home' }

  // const handleItemClick = (e, { name }) => this.setState({ activeItem: name })


  const navigate = useNavigate();

  const handleSearchChange = () => {
    
  };

  const paginationOnChange = async (e, data) => {
    // const newData = await LoadContracts(data.activePage - 1);
    // dispatch(setContractsData(newData));
  };

  const handleMenuItemClick = (newTab: string) => {
    navigate(newTab);
  };

  const isActiveMenuItem = (name: string) => {
    return name === activeMenuItem;
  }

  const contractItemClicked = useCallback((cid: string) => {
    navigate(`${ROUTES.CONTRACTS.CONTRACT.replace(':cid', '')}${cid}`);
  }, [navigate]);
  
  return (
    <Window>
      <Content>
        <StatusCards statusData={statusData}></StatusCards>
      </Content>
      <div className={StylesMenuControl}>
        <Menu pointing secondary>
          { MENU_TABS_CONFIG.map((tab, index) => 
            (<Menu.Item key={index}
              name={tab.name}
              disabled={tab.disabled}
              active={isActiveMenuItem(tab.name)}
              onClick={() => handleMenuItemClick(tab.route)}
            />)
          )}
        </Menu>
      </div>
      { contractsData.contracts &&
      <>
        <div className={StylesOverTable}>
          <Search
            placeholder='Search...'
            onSearchChange={handleSearchChange}
            disabled={true}
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
              { contractsData.contracts.map((contract: Contract, index: number)=> {
                return (<Table.Row key={index} onClick={() => contractItemClicked(contract.cid)} className={StylesTableRow}>
                  <Table.Cell>{contract.height}</Table.Cell>
                  <Table.Cell>{typeof contract.kind === "string" ? contract.kind : contract.kind['Wrapper'] }</Table.Cell>
                  <Table.Cell>{contract.cid}</Table.Cell>
                  <Table.Cell>{contract.calls_count}</Table.Cell>
                </Table.Row>);
              })}
            </Table.Body>
          </Table>
        </div>
      </> }
    </Window>
  );
};

export default Contracts;
