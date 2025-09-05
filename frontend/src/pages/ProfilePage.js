import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Heading,
  VStack,
  HStack,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Button,
  Tag,
  TagLabel,
  TagCloseButton,
  Alert,
  AlertIcon,
  useToast,
  Grid,
  GridItem,
  Text,
  Divider
} from '@chakra-ui/react';
import { authAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const ProfilePage = () => {
  const { user } = useAuth();
  const toast = useToast();
  const [profile, setProfile] = useState({
    username: '',
    first_name: '',
    last_name: '',
    bio: '',
    skills: [],
    interests: [],
    event_tags: [],
    availability: {}
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [newSkill, setNewSkill] = useState('');
  const [newInterest, setNewInterest] = useState('');
  const [newEventTag, setNewEventTag] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await authAPI.getProfile();
      setProfile(response.data);
    } catch (err) {
      setError('Failed to load profile');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  const addTag = (field, value, setter) => {
    if (value.trim() && !profile[field].includes(value.trim())) {
      setProfile(prev => ({
        ...prev,
        [field]: [...prev[field], value.trim()]
      }));
      setter('');
    }
  };

  const removeTag = (field, tagToRemove) => {
    setProfile(prev => ({
      ...prev,
      [field]: prev[field].filter(tag => tag !== tagToRemove)
    }));
  };

  const handleKeyPress = (e, field, value, setter) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag(field, value, setter);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      
      await authAPI.updateProfile(profile);
      
      toast({
        title: 'Profile updated successfully!',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (err) {
      setError('Failed to update profile');
      toast({
        title: 'Error updating profile',
        description: err.response?.data?.message || 'Please try again',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading && !profile.username) {
    return (
      <Container maxW="4xl" py={8}>
        <Text>Loading profile...</Text>
      </Container>
    );
  }

  return (
    <Container maxW="4xl" py={8}>
      <VStack spacing={8} align="stretch">
        <VStack spacing={2} align="start">
          <Heading size="lg">Profile Settings</Heading>
          <Text color="gray.600">
            Complete your profile to get better team matches
          </Text>
        </VStack>

        {error && (
          <Alert status="error">
            <AlertIcon />
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <VStack spacing={6} align="stretch">
            {/* Basic Info */}
            <Box>
              <Heading size="md" mb={4}>Basic Information</Heading>
              <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                <GridItem>
                  <FormControl>
                    <FormLabel>Username</FormLabel>
                    <Input
                      value={profile.username}
                      onChange={(e) => handleInputChange('username', e.target.value)}
                      placeholder="Enter username"
                    />
                  </FormControl>
                </GridItem>
                <GridItem>
                  <FormControl>
                    <FormLabel>Email</FormLabel>
                    <Input
                      value={user?.email || ''}
                      isReadOnly
                      bg="gray.50"
                    />
                  </FormControl>
                </GridItem>
                <GridItem>
                  <FormControl>
                    <FormLabel>First Name</FormLabel>
                    <Input
                      value={profile.first_name}
                      onChange={(e) => handleInputChange('first_name', e.target.value)}
                      placeholder="First name"
                    />
                  </FormControl>
                </GridItem>
                <GridItem>
                  <FormControl>
                    <FormLabel>Last Name</FormLabel>
                    <Input
                      value={profile.last_name}
                      onChange={(e) => handleInputChange('last_name', e.target.value)}
                      placeholder="Last name"
                    />
                  </FormControl>
                </GridItem>
              </Grid>
              
              <FormControl mt={4}>
                <FormLabel>Bio</FormLabel>
                <Textarea
                  value={profile.bio}
                  onChange={(e) => handleInputChange('bio', e.target.value)}
                  placeholder="Tell us about yourself..."
                  rows={3}
                />
              </FormControl>
            </Box>

            <Divider />

            {/* Skills Section */}
            <Box>
              <Heading size="md" mb={4}>Skills</Heading>
              <VStack align="stretch" spacing={3}>
                <HStack>
                  <Input
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    placeholder="Add a skill (e.g., React, Python, Design)"
                    onKeyPress={(e) => handleKeyPress(e, 'skills', newSkill, setNewSkill)}
                  />
                  <Button 
                    onClick={() => addTag('skills', newSkill, setNewSkill)}
                    colorScheme="brand"
                  >
                    Add
                  </Button>
                </HStack>
                
                {profile.skills.length > 0 && (
                  <HStack wrap="wrap" spacing={2}>
                    {profile.skills.map((skill, index) => (
                      <Tag key={index} colorScheme="blue" variant="solid">
                        <TagLabel>{skill}</TagLabel>
                        <TagCloseButton onClick={() => removeTag('skills', skill)} />
                      </Tag>
                    ))}
                  </HStack>
                )}
              </VStack>
            </Box>

            <Divider />

            {/* Interests Section */}
            <Box>
              <Heading size="md" mb={4}>Interests</Heading>
              <VStack align="stretch" spacing={3}>
                <HStack>
                  <Input
                    value={newInterest}
                    onChange={(e) => setNewInterest(e.target.value)}
                    placeholder="Add an interest (e.g., AI, Blockchain, Gaming)"
                    onKeyPress={(e) => handleKeyPress(e, 'interests', newInterest, setNewInterest)}
                  />
                  <Button 
                    onClick={() => addTag('interests', newInterest, setNewInterest)}
                    colorScheme="brand"
                  >
                    Add
                  </Button>
                </HStack>
                
                {profile.interests.length > 0 && (
                  <HStack wrap="wrap" spacing={2}>
                    {profile.interests.map((interest, index) => (
                      <Tag key={index} colorScheme="green" variant="solid">
                        <TagLabel>{interest}</TagLabel>
                        <TagCloseButton onClick={() => removeTag('interests', interest)} />
                      </Tag>
                    ))}
                  </HStack>
                )}
              </VStack>
            </Box>

            <Divider />

            {/* Event Tags Section */}
            <Box>
              <Heading size="md" mb={4}>Event Preferences</Heading>
              <VStack align="stretch" spacing={3}>
                <HStack>
                  <Input
                    value={newEventTag}
                    onChange={(e) => setNewEventTag(e.target.value)}
                    placeholder="Add event type (e.g., Hackathon, Startup, Social Impact)"
                    onKeyPress={(e) => handleKeyPress(e, 'event_tags', newEventTag, setNewEventTag)}
                  />
                  <Button 
                    onClick={() => addTag('event_tags', newEventTag, setNewEventTag)}
                    colorScheme="brand"
                  >
                    Add
                  </Button>
                </HStack>
                
                {profile.event_tags.length > 0 && (
                  <HStack wrap="wrap" spacing={2}>
                    {profile.event_tags.map((tag, index) => (
                      <Tag key={index} colorScheme="purple" variant="solid">
                        <TagLabel>{tag}</TagLabel>
                        <TagCloseButton onClick={() => removeTag('event_tags', tag)} />
                      </Tag>
                    ))}
                  </HStack>
                )}
              </VStack>
            </Box>

            {/* Submit Button */}
            <Button
              type="submit"
              colorScheme="brand"
              size="lg"
              isLoading={loading}
              loadingText="Updating..."
            >
              Update Profile
            </Button>
          </VStack>
        </form>
      </VStack>
    </Container>
  );
};

export default ProfilePage;