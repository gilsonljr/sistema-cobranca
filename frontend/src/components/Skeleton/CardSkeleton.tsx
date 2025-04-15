import React from 'react';
import { Card, CardContent, CardHeader, Skeleton, Box } from '@mui/material';

interface CardSkeletonProps {
  headerHeight?: number;
  contentHeight?: number;
  withAction?: boolean;
  withAvatar?: boolean;
}

/**
 * Skeleton component for cards
 */
const CardSkeleton: React.FC<CardSkeletonProps> = ({
  headerHeight = 40,
  contentHeight = 120,
  withAction = false,
  withAvatar = false,
}) => {
  return (
    <Card>
      <CardHeader
        avatar={
          withAvatar ? (
            <Skeleton
              animation="wave"
              variant="circular"
              width={40}
              height={40}
            />
          ) : undefined
        }
        action={
          withAction ? (
            <Skeleton
              animation="wave"
              variant="rectangular"
              width={40}
              height={40}
              sx={{ borderRadius: 1 }}
            />
          ) : undefined
        }
        title={
          <Skeleton
            animation="wave"
            height={headerHeight / 2}
            width="80%"
            style={{ marginBottom: 6 }}
          />
        }
        subheader={
          <Skeleton animation="wave" height={headerHeight / 2} width="40%" />
        }
      />
      <CardContent>
        <Box sx={{ pt: 0.5 }}>
          <Skeleton animation="wave" height={contentHeight / 3} />
          <Skeleton animation="wave" height={contentHeight / 3} />
          <Skeleton animation="wave" height={contentHeight / 3} width="80%" />
        </Box>
      </CardContent>
    </Card>
  );
};

export default CardSkeleton;
