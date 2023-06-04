import React, { useEffect, useState, useCallback } from 'react';
import { styled } from '@linaria/react';
import { css } from '@linaria/core';
import { ContractData } from '@core/types';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation, useSearchParams, useParams } from 'react-router-dom';
import { Window, Button, StatusCards } from '@app/shared/components';
import { selectBlocksData, selectContractsData, selectStatusData } from '../../store/selectors';
// import { IconSend, IconReceive } from '@app/shared/icons';
import { CURRENCIES, ROUTES, MENU_TABS_CONFIG } from '@app/shared/constants';
import { selectSystemState, selectTransactions } from '@app/shared/store/selectors';
// import { IconDeposit, IconConfirm } from '@app/shared/icons';
import { timestampToDate } from '@core/appUtils';
import { LoadContract } from '@core/api';

import { Table, Search, Pagination, Menu, Card, Segment } from 'semantic-ui-react';
import SemanticDatepicker from 'react-semantic-ui-datepickers';

const StylesOverTable = css`
  width: 100%;
  padding: 20px 0;
  display: flex;
  align-items: center;

  > .pagination {
    margin-left: auto !important;
  }
`;

const Content = styled.div`
  width: 100%;
  padding: 20px 100px;

  .subtitle-segment {
    max-width: 200px;
  }

  .subtitle {
    font-weight: 800;
    font-size: 16px;
  }

  .subtitle-inside {
    font-weight: 800;
    font-size: 14px;
    text-transform: uppercase;
  }

  > .calls {
    width: 100%;
  }
`;

const StylesTable = css`
  width: 100%;
  margin: 0 !important;
`;

const StylesMenuControl = css`
  padding: 20px 100px 0;
  width: 100%;
`;

const StylesSubrow = css`
  border-top: none !important;
`;

const StylesRow = css`
  box-shadow: none !important;
`;

const GeneratedRow = styled.div<{ margin: number }>`
  padding: 10px 0;
  margin-left: ${({ margin }) => margin}px;

  > .generated-subrow {
    padding: 0 0 10px;
  }
`;

const GeneratedTable: React.FC<{data: any}> = ({data}) => {
  const headers = data.shift();
  return (<Table collapsing>
    <Table.Header>
      <Table.Row>
        {headers.map((header, index) => {
          return <Table.HeaderCell key={index}> {header.value} </Table.HeaderCell>
        })}
      </Table.Row>
    </Table.Header>

    <Table.Body>
      {data.map((item, index) => {
        return <Table.Row key={index}>
          {item.map((value, i) => <Table.Cell key={i}>{value}</Table.Cell>)}
        </Table.Row>
      })}
    </Table.Body>
  </Table>);
}

const GeneratedUI: React.FC<{dataObj: any, margin: number}> = ({dataObj, margin}) => {
  return (<GeneratedRow margin={margin}>
    { Object.keys(dataObj).map(key => {
      if (key) {
        if (typeof dataObj[key] === 'string' || typeof dataObj[key] === 'number') {
          return <div className='generated-subrow'>
            <span className='subtitle-inside'> {key}: </span>
            <span>{dataObj[key]}</span>
          </div>
        } else if (dataObj[key].type === 'table') {
          return <>
            <div className='subtitle-inside'> {key}: </div>
            <GeneratedTable data={dataObj[key].value}></GeneratedTable>
          </>
        } else {
          return <>
            <div className='subtitle-inside'> {key}: </div>
            <GeneratedUI dataObj={dataObj[key]} margin={margin + 15}></GeneratedUI>
          </>
        }
      }
    }) }
    
  </GeneratedRow>);
}

const ContractItem: React.FC = () => {
  const [contractData, setContractData] = useState<ContractData>();
  const [activeMenuItem, setActiveMenuItem] = useState(MENU_TABS_CONFIG[1].name);
  const navigate = useNavigate();
  const { cid } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const defaultPage = searchParams.get("page");
  
  const updateData = async (page: number) => {
    const newData = await LoadContract(cid, page - 1);
    setContractData(newData);
  }

  useEffect(() => {
    updateData(defaultPage ? Number(defaultPage) : 1);
  }, []);

  const paginationOnChange = async (e, data) => {
    setSearchParams({["page"]: data.activePage});
    updateData(data.activePage);
  };
  
  return (
    <Window>
      {contractData && <Content>
        <Segment.Group>
          <Segment.Group horizontal>
            <Segment className='subtitle-segment'>
              <div className='subtitle'> CID: </div>
            </Segment>
            <Segment>{cid}</Segment>
          </Segment.Group>
          <Segment.Group horizontal>
            <Segment className='subtitle-segment'>
              <div className='subtitle'> HEIGHT: </div>
            </Segment>
            <Segment>{contractData.height}</Segment>
          </Segment.Group>
          <Segment.Group horizontal>
            <Segment className='subtitle-segment'>
              <div className='subtitle'> KIND: </div>
            </Segment>
            <Segment>{contractData.kind}</Segment>
          </Segment.Group>
        </Segment.Group>
        { contractData.state && <>
            <Segment>
              <div className='subtitle'> STATE: </div>
              <GeneratedUI dataObj={contractData.state} margin={0}></GeneratedUI>
            </Segment>
          </>
        }
        { contractData.calls && <Segment>
          <div className='subtitle'> CALLS ({contractData.calls_count}): </div>
          <div className={StylesOverTable}>
            <Pagination defaultActivePage={defaultPage ? defaultPage : 1} className="pagination"
                        onPageChange={paginationOnChange} totalPages={Math.ceil(contractData.calls_count / 50)} />
          </div>
          <div className={StylesTable}>
            <Table singleLine>
              <Table.Header>
                <Table.Row>
                  <Table.HeaderCell>HEIGHT:</Table.HeaderCell>
                  <Table.HeaderCell>CID:</Table.HeaderCell>
                  <Table.HeaderCell>KIND:</Table.HeaderCell>
                  <Table.HeaderCell>METHOD:</Table.HeaderCell>
                  <Table.HeaderCell>ARGUMENTS:</Table.HeaderCell>
                  <Table.HeaderCell>FUND:</Table.HeaderCell>
                  <Table.HeaderCell>KEYS:</Table.HeaderCell>
                </Table.Row>
              </Table.Header>

              <Table.Body>
                { contractData.calls.map((call, index)=> {
                  return call.type === 'single' ? 
                  <>
                    <Table.Row key={index}>
                      <Table.Cell>{call.value[0][0]}</Table.Cell>
                      <Table.Cell>{call.value[0].value}</Table.Cell>
                      <Table.Cell>{call.value[0][2]}</Table.Cell>
                      <Table.Cell>{call.value[0][3]}</Table.Cell>
                      <Table.Cell>{call.value[0][4].length}</Table.Cell>
                      <Table.Cell>funds</Table.Cell>
                      <Table.Cell>{call.value[0][5].value.length}</Table.Cell>
                    </Table.Row>
                    <Table.Row className={StylesRow} key={index+100}>
                      <Table.Cell className={StylesSubrow} colSpan="7"></Table.Cell>
                    </Table.Row>
                  </> : 
                  <>
                    <Table.Row key={index}></Table.Row>
                  </>
                }) }
              </Table.Body>
            </Table>
          </div>
        </Segment> }
      </Content> }
    </Window>
  );
};

export default ContractItem;
