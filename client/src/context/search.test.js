import '@testing-library/jest-dom';
import { useSearch, SearchProvider } from "./search";
import { act, renderHook } from '@testing-library/react';
import React from 'react';

describe('useSearch hook', () => {
    const defaultSearch = { keyword: '', results: [] };
    it('should provide default search state', () => {
      const { result } = renderHook(() => useSearch(), {
        wrapper: SearchProvider,
      });
  
      const [searchState] = result.current;
      expect(searchState).toEqual(defaultSearch);
    });
  
    it('should update search state', () => {
      const newAuth = { keyword: 'new keyword', results: ['new result'] };
      const { result } = renderHook(() => useSearch(), {
        wrapper: SearchProvider,
      });
  
      const [auth, setAuth] = result.current;
      expect(auth).toEqual(defaultSearch);

      //calling setAuth
      act(() => {
        setAuth(newAuth);
      });

      //expect the auth to be set
      const [updatedAuth] = result.current;
      expect(updatedAuth).toEqual(newAuth);
    });
  });