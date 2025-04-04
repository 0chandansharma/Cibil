import React from 'react';
import { Card, CardHeader, CardContent, CardActions, Typography, IconButton } from '@mui/material';
import { MoreVert as MoreVertIcon } from '@mui/icons-material';
import PropTypes from 'prop-types';

const InfoCard = ({ title, subheader, content, actions, showMoreOptions, onMoreOptionsClick }) => {
  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardHeader
        title={title}
        subheader={subheader}
        action={
          showMoreOptions && (
            <IconButton aria-label="settings" onClick={onMoreOptionsClick}>
              <MoreVertIcon />
            </IconButton>
          )
        }
      />
      <CardContent sx={{ flexGrow: 1 }}>
        {typeof content === 'string' ? (
          <Typography variant="body2" color="text.secondary">
            {content}
          </Typography>
        ) : (
          content
        )}
      </CardContent>
      {actions && <CardActions>{actions}</CardActions>}
    </Card>
  );
};

InfoCard.propTypes = {
  title: PropTypes.string.isRequired,
  subheader: PropTypes.string,
  content: PropTypes.oneOfType([PropTypes.string, PropTypes.node]).isRequired,
  actions: PropTypes.node,
  showMoreOptions: PropTypes.bool,
  onMoreOptionsClick: PropTypes.func,
};

InfoCard.defaultProps = {
  showMoreOptions: false,
};

export default InfoCard;