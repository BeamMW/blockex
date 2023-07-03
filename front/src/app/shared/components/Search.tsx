import React from 'react';
import { styled } from '@linaria/react';
import { Search, Label, SearchResultProps} from 'semantic-ui-react';
import { fromGroths, getSign, toUSD } from '@core/appUtils';
import { selectSearchState } from '../store/selectors';
import { useDispatch, useSelector } from 'react-redux';
import { css } from '@linaria/core';
import { searchCleanQuery, searchFinish, searchStart, searchUpdateSelection } from '../store/actions';

// import { selectRate } from '@app/containers/Main/store/selectors';

interface Props<T = any> {
  searchMethod: (value: string) => Promise<{title: string}[]>;
  resultRenderer: (value: T) => any;
  placeholder: string;
}

const StyledSearch = css`
  & .input {
    min-width: 270px !important;
  }
`;

const SearchComponent: React.FC<Props> = ({
  searchMethod, resultRenderer, placeholder
}) => {
  const { loading, results, value } = useSelector(selectSearchState());
  const timeoutRef: any = React.useRef();
  const dispatch = useDispatch();

  React.useEffect(() => {
    return () => {
      clearTimeout(timeoutRef.current);
      dispatch(searchCleanQuery());
    }
  }, [])
  
  
  const handleSearchChange = React.useCallback((e, data) => {
    clearTimeout(timeoutRef.current)
    dispatch(searchStart({ value: data.value }))

    timeoutRef.current = setTimeout(async () => {
      if (data.value.length === 0) {
        dispatch(searchCleanQuery());
        return
      }

      const searchRes = await searchMethod(data.value);
      // searchRes.forEach((element: any) => {
      //   element['resultClickHandler'] = resultClickHandler;
      // });
      
      dispatch(searchFinish({ results: searchRes }))
    }, 300)
  }, [])

  return (
    <Search
      loading={loading}
      className={StyledSearch}
      placeholder={placeholder}
      onResultSelect={(e, data) =>
          dispatch(searchUpdateSelection({value: data.result.hash}))
      }
      onSearchChange={handleSearchChange}
      resultRenderer={resultRenderer}
      results={results}
      value={value}
    />
  );
};

export default SearchComponent;
