import React from 'react';
import { Box, Skeleton, Stack } from '@mui/material';

interface FormSkeletonProps {
  inputCount?: number;
  withButton?: boolean;
  withTitle?: boolean;
  spacing?: number;
}

/**
 * Skeleton component for forms
 */
const FormSkeleton: React.FC<FormSkeletonProps> = ({
  inputCount = 3,
  withButton = true,
  withTitle = true,
  spacing = 2,
}) => {
  return (
    <Stack spacing={spacing}>
      {withTitle && (
        <Skeleton
          animation="wave"
          height={40}
          width="60%"
          style={{ marginBottom: 8 }}
        />
      )}

      {Array.from({ length: inputCount }).map((_, index) => (
        <Box key={`input-${index}`}>
          <Skeleton
            animation="wave"
            height={20}
            width="30%"
            style={{ marginBottom: 8 }}
          />
          <Skeleton
            animation="wave"
            height={56}
            width="100%"
            variant="rectangular"
            sx={{ borderRadius: 1 }}
          />
        </Box>
      ))}

      {withButton && (
        <Box sx={{ pt: 2 }}>
          <Skeleton
            animation="wave"
            height={36}
            width="100%"
            variant="rectangular"
            sx={{ borderRadius: 1 }}
          />
        </Box>
      )}
    </Stack>
  );
};

export default FormSkeleton;
