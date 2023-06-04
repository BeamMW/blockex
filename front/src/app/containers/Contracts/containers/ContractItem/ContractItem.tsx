import React, { useEffect, useState, useCallback } from 'react';
import { styled } from '@linaria/react';
import { css } from '@linaria/core';
import { ContractData } from '@core/types';
import { useNavigate, useLocation, useSearchParams, useParams } from 'react-router-dom';
import { Window } from '@app/shared/components';
import { ROUTES, MENU_TABS_CONFIG } from '@app/shared/constants';
import { LoadContract } from '@core/api';
import { Table, Pagination, Segment } from 'semantic-ui-react';

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

const GeneratedTable = React.memo<{data: any}>(({data}) => {
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
          {item.map((itemValue, itemValueIndex) => <Table.Cell key={itemValueIndex}>{
            itemValue.type ? itemValue.value : itemValue
          }</Table.Cell>)}
        </Table.Row>
      })}
    </Table.Body>
  </Table>);
})

const GeneratedUI: React.FC<{dataObj: any, margin: number}> = ({dataObj, margin}) => {
  return (<GeneratedRow margin={margin}>
    { Object.keys(dataObj).map((key, keyIndex) => {
      let child;
      if (typeof dataObj[key] === 'string' || typeof dataObj[key] === 'number') {
        child = <>
          <span className='subtitle-inside'> {key}: </span>
          <span>{dataObj[key]}</span>
        </>
      } else if (dataObj[key].type && dataObj[key].type === 'table') {
        child = <>
          <div className='subtitle-inside'> {key}: </div>
          <GeneratedTable data={dataObj[key].value}></GeneratedTable>
        </>
      } else {
        child = <>
          <div className='subtitle-inside'> {key}: </div>
          <GeneratedUI dataObj={dataObj[key]} margin={margin + 15}></GeneratedUI>
        </>
      }

      return <div className='generated-subrow' key={keyIndex}>{child}</div>
    }) }
    
  </GeneratedRow>);
};

const CallRowValue: React.FC<{rowValue: any}> = ({rowValue}) => {
 return <>
    <Table.Row>
      <Table.Cell>{rowValue[0]}</Table.Cell>
      <Table.Cell>{rowValue[1].type ? rowValue[1].value : '-'}</Table.Cell>
      <Table.Cell>{rowValue[2] ? rowValue[2].value : '-'}</Table.Cell>
      <Table.Cell>{rowValue[3] ? rowValue[3] : '-'}</Table.Cell>
      {/* <Table.Cell>{rowValue[4].length}</Table.Cell> */}
      {/* <Table.Cell>funds</Table.Cell>
      <Table.Cell>keys</Table.Cell> */}
    </Table.Row>
    <Table.Row className={StylesRow}>
      <Table.Cell className={StylesSubrow} colSpan="7">
        {rowValue[4] ? <Segment>
          <div className='subtitle-inside'> ARGUMENTS: </div>
          <GeneratedUI dataObj={rowValue[4]} margin={0}></GeneratedUI>
        </Segment> : <></>}
        {rowValue[5] ? <div>
          <div className='subtitle-inside'> FUNDS: </div>
          FUNDS TABLE HERE
        </div> : <></>}
      </Table.Cell>
    </Table.Row>
  </>
};

const CallTableRow: React.FC<{data: any}> = ({data}) => {
  return <>
    { data.type === 'single' ? 
      <CallRowValue rowValue={data.value[0]}></CallRowValue> :
      <>
        {data.value.map((callItem, callItemIndex) => {
          return <CallRowValue key={callItemIndex} rowValue={callItem}></CallRowValue>
        })}
      </>
    }
  </>
};

const ContractItem: React.FC = () => {
  const [contractData, setContractData] = useState<ContractData>();
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
        { Object.keys(contractData.state).length > 0 && <>
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
                  {/* <Table.HeaderCell>ARGUMENTS:</Table.HeaderCell> */}
                  {/* <Table.HeaderCell>FUND:</Table.HeaderCell>
                  <Table.HeaderCell>KEYS:</Table.HeaderCell> */}
                </Table.Row>
              </Table.Header>

              <Table.Body>
                { contractData.calls.map((call, index)=> {
                  return <CallTableRow key={index} data={call}></CallTableRow>
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
