import React, { useEffect, useState, useCallback } from 'react';
import { styled } from '@linaria/react';
import { css } from '@linaria/core';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { Window, Button, StatusCards } from '@app/shared/components';
import { selectBlocksData, selectContractsData, selectStatusData } from '../../store/selectors';
import { ROUTES } from '@app/shared/constants';
import { timestampToDate } from '@core/appUtils';
import { LoadBlocks, LoadContracts } from '@core/api';
import { useSearchParams } from 'react-router-dom';

import { Table, Search, Pagination, Menu } from 'semantic-ui-react';
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

const Blocks: React.FC = () => {
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
  const [activeMenuItem, setActiveMenuItem] = useState<string>(TABS_CONFIG[0].name);
  const onChange = (event, data) => setNewDate(data.value);
  const dispatch = useDispatch();
  const statusData = useSelector(selectStatusData());
  const [searchParams, setSearchParams] = useSearchParams();
  const defaultPage = searchParams.get("page");
  const navigate = useNavigate();

  const handleSearchChange = async () => {

  };

  const updateData = async (page: number) => {
    const newData = await LoadBlocks(page - 1);
    dispatch(setBlocksData(newData));
  }

  useEffect(() => {
    updateData(defaultPage ? Number(defaultPage) : 1);
  }, []);

  const paginationOnChange = async (e, data) => {
    setSearchParams({["page"]: data.activePage});
    await updateData(data.activePage);
  };

  const handleMenuItemClick = (newTab: string) => {
    setActiveMenuItem(newTab);
    navigate(ROUTES.CONTRACTS.BASE);
  };

  const isActiveMenuItem = (name: string) => {
    // console.log(name === activeMenuItem);
    return name === activeMenuItem;
  }

  const blockItemClicked = useCallback((height: number) => {
    navigate(`${ROUTES.MAIN.BLOCK.replace(':height', '')}${height}`);
  }, [navigate]);
  
  return (
    <Window>
      <Content>
        <StatusCards statusData={statusData}/>
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
      { blocksData.blocks ?
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
          <Pagination defaultActivePage={defaultPage ? defaultPage : 1} onPageChange={paginationOnChange} totalPages={blocksData.pages} />
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
                return (<Table.Row onClick={() => blockItemClicked(block.cid)} key={index}>
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
    </Window>
  );
};

export default Blocks;
