import { Button, Menu, MenuItem } from '@material-ui/core';
import React from 'react';
import { useHistory } from 'react-router-dom';

export default function AdvancedMenu({ menuItems }) {
  const [anchorEl, setAnchorEl] = React.useState(null);

  const history = useHistory();

  function handleClick(event) {
    setAnchorEl(event.currentTarget);
  }

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <div>
      <Button
        aria-controls="debug-menu"
        aria-haspopup="true"
        onClick={handleClick}
        variant="outlined"
        size="small"
      >
        Advanced
      </Button>
      <Menu
        id="debug-menu"
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={handleClose}
      >
        {menuItems.map(({ to, label }) => (
          <MenuItem
            key={label}
            onClick={() => {
              if (history.location.pathname !== to) history.push(to);
              else setAnchorEl(null);
            }}
          >
            {label}
          </MenuItem>
        ))}
      </Menu>
    </div>
  );
}
