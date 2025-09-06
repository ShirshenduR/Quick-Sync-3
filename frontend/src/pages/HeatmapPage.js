import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Heading,
  VStack,
  HStack,
  Text,
  Grid,
  GridItem,
  Button,
  Select,
  Card,
  CardBody,
  Badge,
  Avatar,
  useColorModeValue,
  Center,
  Spinner,
  Alert,
  AlertIcon,
  Tooltip,
  useToast
} from '@chakra-ui/react';
import { matchmakingAPI, authAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const TIME_SLOTS = [
  '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
  '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', 
  '5:00 PM', '6:00 PM', '7:00 PM', '8:00 PM', '9:00 PM'
];

const AvailabilityCell = ({ isAvailable, onClick, intensity = 0, tooltip }) => {
  const bgColor = useColorModeValue(
    isAvailable ? `green.${Math.max(100, Math.min(500, 100 + intensity * 100))}` : 'gray.100',
    isAvailable ? `green.${Math.max(100, Math.min(500, 100 + intensity * 100))}` : 'gray.700'
  );
  
  return (
    <Tooltip label={tooltip} hasArrow>
      <Box
        w="40px"
        h="30px"
        bg={bgColor}
        border="1px"
        borderColor="gray.200"
        cursor="pointer"
        onClick={onClick}
        _hover={{ 
          borderColor: 'brand.500',
          transform: 'scale(1.1)'
        }}
        transition="all 0.2s"
        borderRadius="sm"
      />
    </Tooltip>
  );
};

const AvailabilityGrid = ({ 
  availability = {}, 
  isEditable = false, 
  onToggle, 
  overlapData = null,
  title = "Availability"
}) => {
  return (
    <Box>
      <Text fontWeight="bold" mb={4} textAlign="center">{title}</Text>
      <Grid templateColumns="100px repeat(13, 40px)" gap={1}>
        {/* Header row */}
        <GridItem></GridItem>
        {TIME_SLOTS.map((time, idx) => (
          <GridItem key={idx}>
            <Text fontSize="xs" textAlign="center" transform="rotate(-45deg)" transformOrigin="center">
              {time}
            </Text>
          </GridItem>
        ))}
        
        {/* Days and time slots */}
        {DAYS_OF_WEEK.map((day) => (
          <React.Fragment key={day}>
            <GridItem>
              <Text fontSize="sm" fontWeight="medium" py={1}>
                {day}
              </Text>
            </GridItem>
            {TIME_SLOTS.map((time, timeIdx) => {
              const slotKey = `${day}_${time}`;
              const isAvailable = availability[day]?.includes(time) || false;
              const overlapIntensity = overlapData?.common_times.filter(ct => 
                ct.startsWith(day) && ct.includes(time)
              ).length || 0;
              
              return (
                <GridItem key={timeIdx}>
                  <AvailabilityCell
                    isAvailable={isAvailable}
                    intensity={overlapIntensity}
                    onClick={isEditable ? () => onToggle(day, time) : undefined}
                    tooltip={
                      overlapData 
                        ? `${day} ${time} - ${isAvailable ? 'Available' : 'Not available'}${overlapIntensity > 0 ? ` (${overlapIntensity} overlap)` : ''}`
                        : `${day} ${time} - ${isAvailable ? 'Available' : 'Not available'}`
                    }
                  />
                </GridItem>
              );
            })}
          </React.Fragment>
        ))}
      </Grid>
    </Box>
  );
};

const UserAvailabilityCard = ({ user, onClick, isSelected }) => (
  <Card 
    cursor="pointer" 
    onClick={() => onClick(user)}
    borderColor={isSelected ? 'brand.500' : 'transparent'}
    borderWidth={2}
    _hover={{ borderColor: 'brand.300' }}
  >
    <CardBody py={3}>
      <HStack spacing={3}>
        <Avatar 
          size="sm" 
          name={`${user.first_name} ${user.last_name}`} 
        />
        <VStack align="start" spacing={0} flex={1}>
          <Text fontWeight="medium" fontSize="sm">
            {user.first_name} {user.last_name}
          </Text>
          <Text fontSize="xs" color="gray.600">
            @{user.username}
          </Text>
        </VStack>
        {isSelected && (
          <Badge colorScheme="brand" size="sm">
            Selected
          </Badge>
        )}
      </HStack>
    </CardBody>
  </Card>
);

const HeatmapPage = () => {
  const { user } = useAuth();
  const toast = useToast();
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userAvailability, setUserAvailability] = useState({});
  const [selectedUserAvailability, setSelectedUserAvailability] = useState({});
  const [overlapData, setOverlapData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [savingAvailability, setSavingAvailability] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchUsers();
    fetchUserProfile();
  }, []);

  useEffect(() => {
    if (selectedUser) {
      fetchOverlapData(selectedUser.id);
    }
  }, [selectedUser, userAvailability]);

  const fetchUsers = async () => {
    try {
  const response = await authAPI.getUsers();
  setUsers(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      setError('Failed to load users');
      console.error(err);
    }
  };

  const fetchUserProfile = async () => {
    try {
      if (!user?.uid) throw new Error('No user UID available');
      const response = await authAPI.getProfile(user.uid);
      setUserAvailability(response.data.availability || {});
    } catch (err) {
      console.error('Failed to load user profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchOverlapData = async (userId) => {
    try {
      const response = await matchmakingAPI.getAvailabilityOverlap(userId);
      setOverlapData(response.data);
    } catch (err) {
      console.error('Failed to fetch overlap data:', err);
      setOverlapData(null);
    }
  };

  const handleUserSelect = async (selectedUser) => {
    setSelectedUser(selectedUser);
    // For now, we'll use mock availability data since we can't easily get other users' availability
    // In a real app, this would come from the API
    setSelectedUserAvailability({
      Monday: ['10:00 AM', '11:00 AM', '2:00 PM', '3:00 PM'],
      Tuesday: ['9:00 AM', '1:00 PM', '5:00 PM'],
      Wednesday: ['11:00 AM', '12:00 PM', '4:00 PM'],
      Thursday: ['10:00 AM', '2:00 PM', '3:00 PM', '6:00 PM'],
      Friday: ['9:00 AM', '1:00 PM', '7:00 PM'],
      Saturday: ['11:00 AM', '2:00 PM'],
      Sunday: ['3:00 PM', '4:00 PM']
    });
  };

  const toggleAvailability = async (day, time) => {
    const daySlots = userAvailability[day] || [];
    let newSlots;
    
    if (daySlots.includes(time)) {
      newSlots = daySlots.filter(slot => slot !== time);
    } else {
      newSlots = [...daySlots, time];
    }
    
    const newAvailability = {
      ...userAvailability,
      [day]: newSlots
    };
    
    setUserAvailability(newAvailability);
    
    // Auto-save after a delay
    setSavingAvailability(true);
    try {
  if (!user?.uid) throw new Error('No user UID available');
  await authAPI.updateProfile(user.uid, { availability: newAvailability });
      toast({
        title: 'Availability updated',
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
    } catch (err) {
      toast({
        title: 'Failed to save availability',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      console.error('Failed to save availability:', err);
    } finally {
      setSavingAvailability(false);
    }
  };

  if (loading) {
    return (
      <Center h="50vh">
        <VStack spacing={2}>
          <Spinner size="xl" color="brand.500" />
          <Text>Loading availability data...</Text>
        </VStack>
      </Center>
    );
  }

  return (
    <Container maxW="7xl" py={8}>
      <VStack spacing={8} align="stretch">
        <Box>
          <Heading size="lg" mb={2}>Availability Heatmap</Heading>
          <Text color="gray.600">
            Manage your weekly availability and compare schedules with teammates
          </Text>
          {savingAvailability && (
            <Badge colorScheme="blue" mt={2}>
              <Spinner size="xs" mr={1} />
              Saving...
            </Badge>
          )}
        </Box>

        {error && (
          <Alert status="error">
            <AlertIcon />
            {error}
          </Alert>
        )}

        <Grid templateColumns={{ base: "1fr", lg: "300px 1fr" }} gap={8}>
          {/* User Selection Sidebar */}
          <GridItem>
            <VStack align="stretch" spacing={4}>
              <Box>
                <Heading size="md" mb={3}>Compare With:</Heading>
                <VStack spacing={2}>
                  {Array.isArray(users) && users.map((u, idx) => (
                    <UserAvailabilityCard
                      key={idx}
                      user={u}
                      onClick={handleUserSelect}
                      isSelected={selectedUser?.id === u.id}
                    />
                  ))}
                </VStack>
              </Box>
              
              {selectedUser && overlapData && (
                <Card>
                  <CardBody>
                    <VStack align="start" spacing={2}>
                      <Text fontWeight="bold" fontSize="sm">
                        Overlap Summary
                      </Text>
                      <Text fontSize="sm">
                        <Text as="span" fontWeight="medium">
                          {Math.round(overlapData.overlap_percentage * 100)}%
                        </Text>
                        {' '}availability overlap
                      </Text>
                      <Text fontSize="sm">
                        <Text as="span" fontWeight="medium">
                          {overlapData.common_times.length}
                        </Text>
                        {' '}common time slots
                      </Text>
                    </VStack>
                  </CardBody>
                </Card>
              )}
            </VStack>
          </GridItem>

          {/* Heatmap Area */}
          <GridItem>
            <VStack spacing={8} align="stretch">
              {/* Instructions */}
              <Alert status="info">
                <AlertIcon />
                <Text fontSize="sm">
                  Click on time slots to toggle your availability. 
                  {selectedUser && ' Green intensity shows overlap with selected user.'}
                </Text>
              </Alert>

              {/* Your Availability */}
              <Box>
                <AvailabilityGrid
                  availability={userAvailability}
                  isEditable={true}
                  onToggle={toggleAvailability}
                  overlapData={selectedUser ? overlapData : null}
                  title="Your Availability"
                />
              </Box>

              {/* Selected User's Availability */}
              {selectedUser && (
                <Box>
                  <AvailabilityGrid
                    availability={selectedUserAvailability}
                    isEditable={false}
                    overlapData={overlapData}
                    title={`${selectedUser.first_name}'s Availability`}
                  />
                </Box>
              )}

              {/* Legend */}
              <Box>
                <Text fontWeight="bold" mb={2}>Legend:</Text>
                <HStack spacing={4} wrap="wrap">
                  <HStack>
                    <Box w="20px" h="20px" bg="green.200" border="1px" borderColor="gray.300" />
                    <Text fontSize="sm">Available</Text>
                  </HStack>
                  <HStack>
                    <Box w="20px" h="20px" bg="gray.100" border="1px" borderColor="gray.300" />
                    <Text fontSize="sm">Not Available</Text>
                  </HStack>
                  {selectedUser && (
                    <HStack>
                      <Box w="20px" h="20px" bg="green.400" border="1px" borderColor="gray.300" />
                      <Text fontSize="sm">Overlap</Text>
                    </HStack>
                  )}
                </HStack>
              </Box>
            </VStack>
          </GridItem>
        </Grid>
      </VStack>
    </Container>
  );
};

export default HeatmapPage;