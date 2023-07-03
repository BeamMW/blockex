import React, { useEffect, useState, useCallback } from 'react';
import { styled } from '@linaria/react';
import { css } from '@linaria/core';
import { Contract, ContractsData } from '@core/types';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { Window, Button, StatusCards, Search } from '@app/shared/components';
import { selectContractsData } from '../../store/selectors';
import { ROUTES, MENU_TABS_CONFIG } from '@app/shared/constants';
import { LoadContracts, ContractSearch } from '@core/api';
import { Table, Pagination, Menu, Label } from 'semantic-ui-react';
import { setContractsData } from '../../store/actions';
import { selectStatusData } from '@app/shared/store/selectors';

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

const StyledResultItem = css`
  text-overflow: ellipsis;
  overflow: hidden; 
  width: 200px; 
  white-space: nowrap;
`;

const Contracts: React.FC = () => {
  const [activeMenuItem, setActiveMenuItem] = useState(MENU_TABS_CONFIG[1].name);
  const dispatch = useDispatch();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const defaultPage = searchParams.get("page");
  const contractsData = useSelector(selectContractsData());
  const navigate = useNavigate();
  const status = useSelector(selectStatusData());

  const handleMenuItemClick = (route: string) => {
    navigate(route);
  };

  const isActiveMenuItem = (name: string) => {
    return name === activeMenuItem;
  }

  const updateData = async (page: number) => {
    const newData = await LoadContracts(page - 1);
    dispatch(setContractsData(newData));
  }

  useEffect(() => {
    updateData(defaultPage ? Number(defaultPage) : 1);
  }, [status]);

  const paginationOnChange = async (e, data) => {
    setSearchParams({["page"]: data.activePage});
    updateData(data.activePage);
  };

  const searchResultRenderer = (resultItem) => {
    return (<Label content={`Contract ${resultItem.title}`}
                  onClick={() => contractItemClicked(resultItem.title)}
                  className={StyledResultItem} />);
  };

  const searchMethod = async (searchBy: string) => {
    const searchResult = await ContractSearch(searchBy);

    return searchResult.map((item: any) => {
      return {
        title: item.cid,
      }
    });
  }

  const contractItemClicked = useCallback((cid: string) => {
    navigate(`${ROUTES.CONTRACTS.CONTRACT.replace(':cid', '')}${cid}`);
  }, [navigate]);
  
  return (
    <Window isStatusEnabled={true}>
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
      { contractsData && contractsData.contracts &&
      <>
        <div className={StylesOverTable}>
          <Search searchMethod={searchMethod} placeholder="Search by cid, kind" resultRenderer={searchResultRenderer}/>
          <Pagination defaultActivePage={defaultPage ? defaultPage : 1} 
            onPageChange={paginationOnChange} totalPages={contractsData.pages} />
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
