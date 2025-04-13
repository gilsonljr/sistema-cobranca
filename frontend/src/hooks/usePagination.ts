import { useState, useMemo } from 'react';

interface UsePaginationProps {
  totalItems: number;
  initialPage?: number;
  itemsPerPage?: number;
  maxPages?: number;
}

interface UsePaginationReturn {
  currentPage: number;
  totalPages: number;
  pageItems: number[];
  nextPage: () => void;
  prevPage: () => void;
  goToPage: (page: number) => void;
  startIndex: number;
  endIndex: number;
  itemsPerPage: number;
  setItemsPerPage: (value: number) => void;
}

/**
 * Custom hook for handling pagination
 */
export function usePagination({
  totalItems,
  initialPage = 1,
  itemsPerPage: initialItemsPerPage = 10,
  maxPages = 5
}: UsePaginationProps): UsePaginationReturn {
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [itemsPerPage, setItemsPerPage] = useState(initialItemsPerPage);
  
  // Calculate total pages
  const totalPages = useMemo(() => 
    Math.max(1, Math.ceil(totalItems / itemsPerPage)),
    [totalItems, itemsPerPage]
  );
  
  // Ensure current page is within valid range
  useMemo(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);
  
  // Calculate page numbers to display
  const pageItems = useMemo(() => {
    const pages: number[] = [];
    
    // Calculate start and end page numbers
    let startPage = Math.max(1, currentPage - Math.floor(maxPages / 2));
    let endPage = startPage + maxPages - 1;
    
    // Adjust if end page is beyond total pages
    if (endPage > totalPages) {
      endPage = totalPages;
      startPage = Math.max(1, endPage - maxPages + 1);
    }
    
    // Generate page numbers
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    return pages;
  }, [currentPage, totalPages, maxPages]);
  
  // Calculate start and end indices for current page
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage - 1, totalItems - 1);
  
  // Navigation functions
  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };
  
  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };
  
  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };
  
  return {
    currentPage,
    totalPages,
    pageItems,
    nextPage,
    prevPage,
    goToPage,
    startIndex,
    endIndex,
    itemsPerPage,
    setItemsPerPage
  };
}
