import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Skeleton,
} from '@mui/material';

interface TableSkeletonProps {
  rowCount?: number;
  columnCount?: number;
  showHeader?: boolean;
  dense?: boolean;
}

/**
 * Skeleton component for tables
 */
const TableSkeleton: React.FC<TableSkeletonProps> = ({
  rowCount = 5,
  columnCount = 5,
  showHeader = true,
  dense = false,
}) => {
  return (
    <TableContainer component={Paper}>
      <Table size={dense ? 'small' : 'medium'}>
        {showHeader && (
          <TableHead>
            <TableRow>
              {Array.from({ length: columnCount }).map((_, index) => (
                <TableCell key={`header-${index}`}>
                  <Skeleton animation="wave" height={24} width="80%" />
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
        )}
        <TableBody>
          {Array.from({ length: rowCount }).map((_, rowIndex) => (
            <TableRow key={`row-${rowIndex}`}>
              {Array.from({ length: columnCount }).map((_, colIndex) => (
                <TableCell key={`cell-${rowIndex}-${colIndex}`}>
                  <Skeleton
                    animation="wave"
                    height={24}
                    width={colIndex === 0 ? '40%' : '70%'}
                  />
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default TableSkeleton;
