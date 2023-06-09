import React, { useState } from 'react';
import { styled } from '@linaria/react';
//import { Transaction } from '@app/core/types';
import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Table, Search, Pagination, Menu, Card } from 'semantic-ui-react';

interface CellConfig {
  name: string;
  title: string;
  fn?: (value: any, source: any) => any;
}
interface TableProps {
  keyBy: string;
  data: any[];
  config: CellConfig[];
}

const StyledTable = styled.table`
  width: 630px;
`;

const StyledThead = styled.thead`
  height: 40px;
  border-radius: 10px;
  background-color: rgba(255, 255, 255, 0.08);
`;

const isPositive = (value: number) => 1 / value > 0;

const Header = styled.th<{ active: boolean }>`
  background-color: rgba(13, 77, 118, .9);
  text-align: left;
  color: ${({ active }) => {
    if (!active) {
      return '#8da1ad';
    }
    return active ? '#ffffff' : '#8da1ad';
  }};
  padding: 15px 30px;
`;

const Column = styled.td`
  padding: 20px 25px;
  background-color: rgba(13, 77, 118, .9);
`;

const TableComponent: React.FC<TableProps> = ({ keyBy, data, config }) => {
  // const [filterBy, setFilterBy] = useState(1);
  // let tableData = [...data];

  // useEffect(() => {
  //   tableData = [...data];
  // },[data]);

  // const sortFn = (objectA, objectB) => {
  //   const name = config[Math.abs(filterBy)].name;
  //   const a = objectA[name];
  //   const b = objectB[name];

  //   if (a === b) {
  //     return 0;
  //   }

  //   const sign = isPositive(filterBy) ? 1 : -1;
  //   return a > b ? sign : -sign;
  // };

  // const handleSortClick: React.MouseEventHandler<HTMLElement> = event => {
  //   const index = parseInt(event.currentTarget.dataset.index);
  //   setFilterBy(index === filterBy ? -filterBy : index);
  // };

  return  (<>
    {/* <div className={StylesOverTable}>
      <Search
        placeholder='Search...'
        onSearchChange={handleSearchChange}
        disabled={true}
        // results={results}
        // value={value}
      />
      <Pagination defaultActivePage={defaultPage ? defaultPage : 1} 
        onPageChange={paginationOnChange} totalPages={contractsData.pages} />
    </div> */}
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
  </>) ;
};

export default TableComponent;
