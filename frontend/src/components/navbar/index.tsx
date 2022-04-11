import * as React from 'react';
import { Link, useHistory } from 'react-router-dom';

import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Menu from '@mui/material/Menu';
import MenuIcon from '@mui/icons-material/Menu';
import Container from '@mui/material/Container';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';

import { useCustomTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import ThemeToggle from './ThemeToggle';

import "./navbar.css";
import CSPRlogo from '../../images/cspr.png';
import OpenOceanLogo from '../../images/openocean.png';

const pages = [
  {
    link: '/mint',
    name: 'Mint'
  },
  {
    link: '/explore',
    name: 'Explore'
  },
];

interface INavEntity {
  title: string;
  link?: string;
  action?: ()=>void;
}

const ResponsiveAppBar = () => {
  const history = useHistory();
  const { isLoggedIn, entityInfo, login, logout } = useAuth();
	const { themeVariables } = useCustomTheme();

	const [anchorElNav, setAnchorElNav] = React.useState(null);
  const [anchorElUser, setAnchorElUser] = React.useState(null);

  const settings: INavEntity[] = [
    // {
    //   title: "Profile"
    // },
    {
      title: "Dashboard",
      link: "/dashboard"
    },
    {
      title: "Logout",
      action: logout
    }
  ];

  const handleOpenNavMenu = (event: any) => {
    setAnchorElNav(event.currentTarget);
  };
  const handleOpenUserMenu = (event: any) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseNavMenu = (target: string) => {
    setAnchorElNav(null);
    console.log(target);
    history.push(target);
  };

  const handleCloseUserMenu = (navEntity: INavEntity) => {
    setAnchorElUser(null);
    if(navEntity.link)
      history.push(navEntity.link);
    if(navEntity.action)
      navEntity.action();
  };

  return (
    <AppBar position="static" className='navbarcontainer'>
      <Container maxWidth="xl">
        <Toolbar disableGutters style={{color: themeVariables.textColor}}>
          <Link to="/">
            <img src={OpenOceanLogo} alt="Open ocean logo" style={{width: '40px'}}/>
          </Link>
          <Typography
            variant="h6"
            noWrap
            component="div"
            className="mx-3"
            sx={{ 
              mr: '40px !important',
              display: { xs: 'none', md: 'flex' },
              color: themeVariables.textColor
            }}
          >
            Open Ocean
          </Typography>

          <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
            <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleOpenNavMenu}
              color="inherit"
            >
              <MenuIcon />
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorElNav}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'left',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'left',
              }}
              open={Boolean(anchorElNav)}
              onClose={handleCloseNavMenu}
              sx={{
                display: { xs: 'block', md: 'none' },
              }}
            >
              {pages.map((page) => (
                <MenuItem key={page.link} onClick={e => handleCloseNavMenu(page.link)}>
                  <Typography textAlign="center">{page.name}</Typography>
                </MenuItem>
              ))}
						<ThemeToggle />
            </Menu>
          </Box>
          <Typography
            variant="h6"
            noWrap
            component="div"
            sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}
          >
            Open Ocean
          </Typography>
          <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
            {pages.map((page) => (
              <Button
                key={page.link}
                onClick={e => handleCloseNavMenu(page.link)}
                sx={{ my: 2, color: themeVariables.textColor, display: 'block' }}
              >
                {page.name}
              </Button>
            ))}
          </Box>

          <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'block' } }}>
						<ThemeToggle />
					</Box>
					
					{
						isLoggedIn && entityInfo ?
						<div className="m-2">
							{ entityInfo.publicKey?.slice(0, 3) } ... 
							{ entityInfo.publicKey?.slice(entityInfo.publicKey.length - 2) }
						</div> :
						<Tooltip title="Connect signer" className='mx-4'>
							<IconButton aria-label="Connect to casper signer" onClick={login}>
								<img 
									src={CSPRlogo} 
									alt="Connect to casper signer" 
									className='img-fluid' style={{height: '30px'}} />
							</IconButton>
						</Tooltip>
					}
          {
            isLoggedIn && entityInfo &&
            <Box sx={{ flexGrow: 0 }}>
              <Tooltip title="Open settings">
                <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                  <Avatar alt="John Doe" src="/static/images/avatar/2.jpg" />
                </IconButton>
              </Tooltip>
              <Menu
                sx={{ mt: '45px' }}
                id="menu-appbar"
                anchorEl={anchorElUser}
                anchorOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                open={Boolean(anchorElUser)}
                onClose={handleCloseUserMenu}
              >
                {settings.map((setting) => (
                  <MenuItem key={setting.title} onClick={()=>handleCloseUserMenu(setting)}>
                    <Typography textAlign="center">{setting.title}</Typography>
                  </MenuItem>
                ))}
              </Menu>
            </Box>
          }
        </Toolbar>
      </Container>
    </AppBar>
  );
};
export default ResponsiveAppBar;