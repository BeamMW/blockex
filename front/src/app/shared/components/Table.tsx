import React, { useState } from 'react';
import { styled } from '@linaria/react';
//import { Transaction } from '@app/core/types';
import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { selectSystemState } from '../store/selectors';

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

const Table: React.FC<TableProps> = ({ keyBy, data, config }) => {
  const [filterBy, setFilterBy] = useState(1);
  let tableData = [...data];

  useEffect(() => {
    tableData = [...data];
  },[data]);

  const sortFn = (objectA, objectB) => {
    const name = config[Math.abs(filterBy)].name;
    const a = objectA[name];
    const b = objectB[name];

    if (a === b) {
      return 0;
    }

    const sign = isPositive(filterBy) ? 1 : -1;
    return a > b ? sign : -sign;
  };

  const handleSortClick: React.MouseEventHandler<HTMLElement> = event => {
    const index = parseInt(event.currentTarget.dataset.index);
    setFilterBy(index === filterBy ? -filterBy : index);
  };

  return  (
    <StyledTable>
      <StyledThead>
        <tr>
          {config.map(({ title }, index) => (
            <Header
              key={index}
              data-index={index}
              active={
                index !== Math.abs(filterBy) ? null : isPositive(filterBy)
              }
              onClick={handleSortClick}>
                {title}
            </Header>
          ))}
        </tr>
      </StyledThead>
      <tbody>
        {tableData && tableData.length > 0 && tableData.sort(sortFn).map((item, index) => (
          <tr key={index}>
            {config.map(({ name, fn }, itemIndex) => {
              const value = item[name];
              return <Column key={itemIndex}>{!fn ? value : fn(value, item)}</Column>;
            })}
          </tr>
        ))
      }
      </tbody>
    </StyledTable>
  ) ;
};

export default Table;
