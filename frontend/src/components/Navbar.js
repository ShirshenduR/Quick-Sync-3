import React from 'react';
import {
  Box,
  Flex,
  Heading,
  Spacer,
  Button,
  Avatar,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  Text,
  HStack,
  IconButton,
  useColorModeValue
} from '@chakra-ui/react';
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';
import { ChevronDownIcon, HamburgerIcon } from '@chakra-ui/icons';
import { useAuth } from '../contexts/AuthContext';

const NavLink = ({ to, children, isActive }) => (
  <Button
    as={RouterLink}
    to={to}
    variant={isActive ? 'solid' : 'ghost'}
    colorScheme={isActive ? 'brand' : 'gray'}
    size="sm"
  >
    {children}
  </Button>
);

const Navbar = () => {
  const { user, logout, signInWithGoogle } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const bg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <Box bg={bg} px={4} borderBottom="1px" borderColor={borderColor}>
      <Flex h={16} alignItems="center" maxW="7xl" mx="auto">
        <Heading
          as={RouterLink}
          to="/"
          size="lg"
          color="brand.500"
          _hover={{ textDecoration: 'none' }}
        >
          QuickSync
        </Heading>

        <Spacer />

        {/* Desktop Navigation */}
        <HStack spacing={4} display={{ base: 'none', md: 'flex' }}>
          <NavLink to="/profile" isActive={location.pathname === '/profile'}>
            Profile
          </NavLink>
          <NavLink to="/matchmaking" isActive={location.pathname === '/matchmaking'}>
            Find Teammates
          </NavLink>
          <NavLink to="/teams" isActive={location.pathname === '/teams'}>
            Teams
          </NavLink>
          <NavLink to="/heatmap" isActive={location.pathname === '/heatmap'}>
            Heatmap
          </NavLink>
        </HStack>

        <Spacer />

        {/* User/Login Button */}
        {user ? (
          <Menu>
            <MenuButton as={Button} variant="ghost" size="sm">
              <HStack spacing={2}>
                <Avatar size="sm" src={user?.photoURL} name={user?.displayName || user?.email} />
                <Text display={{ base: 'none', md: 'block' }}>
                  {user?.displayName || user?.email}
                </Text>
                <ChevronDownIcon />
              </HStack>
            </MenuButton>
            <MenuList>
              <MenuItem as={RouterLink} to="/profile">
                Profile Settings
              </MenuItem>
              <MenuItem as={RouterLink} to="/teams">
                My Teams
              </MenuItem>
              <MenuDivider />
              <MenuItem onClick={handleLogout} color="red.500">
                Logout
              </MenuItem>
            </MenuList>
          </Menu>
        ) : (
          <Button
            colorScheme="brand"
            variant="solid"
            size="sm"
            onClick={signInWithGoogle}
          >
            Login
          </Button>
        )}

        {/* Mobile menu button */}
        <Menu>
          <MenuButton
            as={IconButton}
            icon={<HamburgerIcon />}
            variant="ghost"
            aria-label="Navigation menu"
            display={{ base: 'block', md: 'none' }}
            ml={2}
          />
          <MenuList display={{ base: 'block', md: 'none' }}>
            <MenuItem as={RouterLink} to="/profile">
              Profile
            </MenuItem>
            <MenuItem as={RouterLink} to="/matchmaking">
              Find Teammates
            </MenuItem>
            <MenuItem as={RouterLink} to="/teams">
              Teams
            </MenuItem>
            <MenuItem as={RouterLink} to="/heatmap">
              Heatmap
            </MenuItem>
          </MenuList>
        </Menu>
      </Flex>
    </Box>
  );
};

export default Navbar;