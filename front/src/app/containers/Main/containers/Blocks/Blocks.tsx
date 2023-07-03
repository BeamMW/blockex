import React, { useEffect, useState, useCallback } from 'react';
import { styled } from '@linaria/react';
import { css } from '@linaria/core';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Window, Search } from '@app/shared/components';
import { selectBlocksData } from '../../store/selectors';
import { ROUTES, MENU_TABS_CONFIG } from '@app/shared/constants';
import { timestampToDate } from '@core/appUtils';
import { LoadBlocks, LoadContracts } from '@core/api';
import { useSearchParams } from 'react-router-dom';
import { BlockSearch } from '@core/api';

import { Table, Pagination, Menu, Label } from 'semantic-ui-react';
import SemanticDatepicker from 'react-semantic-ui-datepickers';
import { setBlocksData } from '../../store/actions';
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

const StylesTableContent = css`
  min-height: 900px;
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

const Blocks: React.FC = () => {
  const blocksData = useSelector(selectBlocksData());
  const [currentDate, setNewDate] = useState(null);
  const [activeMenuItem, setActiveMenuItem] = useState<string>(MENU_TABS_CONFIG[0].name);
  const onChange = (event, data) => setNewDate(data.value);
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const defaultPage = searchParams.get("page");
  const navigate = useNavigate();
  const status = useSelector(selectStatusData());

  const updateData = async (page: number) => {
    const newData = await LoadBlocks(page - 1);
    dispatch(setBlocksData(newData));
  }

  useEffect(() => {
    updateData(defaultPage ? Number(defaultPage) : 1);
  }, [status]);

  const paginationOnChange = async (e, data) => {
    setSearchParams({["page"]: data.activePage});
    updateData(data.activePage);
  };

  const handleMenuItemClick = (route: string) => {
    navigate(route);
  };

  const isActiveMenuItem = (name: string) => {
    return name === activeMenuItem;
  }

  const searchResultRenderer = (resultItem) => {
    return (<Label content={`Block ${resultItem.title}`} onClick={() => blockItemClicked(resultItem.hash)} className={StyledResultItem} />)
  };

  const searchMethod = async (searchBy: string) => {
    const searchResult = await BlockSearch(searchBy);

    return searchResult.map((item: any) => {
      return {
        title: item.height.toString(),
        hash: item.hash,
      }
    });
  }

  const blockItemClicked = useCallback((hash: string) => {
    navigate(`${ROUTES.MAIN.BLOCK.replace(':hash', '')}${hash}`);
  }, [navigate]);
  
  return (
    <Window isStatusEnabled={true}>
      <div className={StylesMenuControl}>
        <Menu pointing secondary>
          {MENU_TABS_CONFIG.map((tab, index) => 
            (<Menu.Item key={index}
              name={tab.name}
              disabled={tab.disabled}
              active={isActiveMenuItem(tab.name)}
              onClick={() => handleMenuItemClick(tab.route)}
            />)
          )}
        </Menu>
      </div>
      { blocksData.blocks && <div className={StylesTableContent}>
        <div className={StylesOverTable}>
          <Search searchMethod={searchMethod} placeholder="Search by height, hash, kernel ID" resultRenderer={searchResultRenderer}/>
          <SemanticDatepicker onChange={onChange} />
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
                return (<Table.Row key={index} onClick={() => blockItemClicked(block.hash)} className={StylesTableRow}>
                  <Table.Cell>{block.height.toLocaleString()}</Table.Cell>
                  <Table.Cell>{block.hash}</Table.Cell>
                  <Table.Cell>{timestampToDate(block.timestamp)}</Table.Cell>
                  <Table.Cell>{block.difficulty.toLocaleString()}</Table.Cell>
                  <Table.Cell>{block.kernelsCount}</Table.Cell>
                  <Table.Cell>{block.inputsCount}</Table.Cell>
                  <Table.Cell>{block.outputsCount}</Table.Cell>
                  <Table.Cell>{block.fee.toLocaleString()}</Table.Cell>
                </Table.Row>);
              }) }
              
            </Table.Body>
          </Table>
        </div>
      </div> }
    </Window>
  );
};

export default Blocks;
