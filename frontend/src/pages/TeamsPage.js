import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Heading,
  VStack,
  HStack,
  Button,
  Card,
  CardBody,
  Avatar,
  Text,
  Tag,
  Badge,
  Divider,
  useToast,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Switch,
  Alert,
  AlertIcon,
  Center,
  Spinner,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem
} from '@chakra-ui/react';
import { ChevronDownIcon, AddIcon, SettingsIcon } from '@chakra-ui/icons';
import { teamsAPI, matchmakingAPI, authAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

// UserProfileModal: shows a user's profile in a modal popup
const UserProfileModal = ({ isOpen, onClose, profile, loading, error }) => (
  <Modal isOpen={isOpen} onClose={onClose} size="lg">
    <ModalOverlay />
    <ModalContent>
      <ModalHeader>User Profile</ModalHeader>
      <ModalCloseButton />
      <ModalBody>
        {loading ? (
          <Center py={8}>
            <Spinner size="lg" color="brand.500" />
            <Text>Loading profile...</Text>
          </Center>
        ) : error ? (
          <Alert status="error">
            <AlertIcon />
            {error}
          </Alert>
        ) : profile ? (
          <VStack align="start" spacing={4}>
            <HStack spacing={4} align="center">
              <Avatar name={profile.first_name + ' ' + profile.last_name} size="lg" />
              <VStack align="start" spacing={1}>
                <Text fontWeight="bold" fontSize="lg">{profile.first_name} {profile.last_name}</Text>
                <Text fontSize="md" color="gray.600">@{profile.username}</Text>
              </VStack>
            </HStack>
            <Divider />
            <Text fontWeight="medium">Bio:</Text>
            <Text color="gray.700">{profile.bio || 'No bio provided.'}</Text>
            <Text fontWeight="medium">Skills:</Text>
            <HStack wrap="wrap" spacing={2}>
              {Array.isArray(profile.skills) && profile.skills.length > 0 ? (
                profile.skills.map((skill, idx) => (
                  <Tag key={idx} colorScheme="blue">{skill}</Tag>
                ))
              ) : (
                <Text color="gray.500">No skills listed.</Text>
              )}
            </HStack>
            <Text fontWeight="medium">Interests:</Text>
            <HStack wrap="wrap" spacing={2}>
              {Array.isArray(profile.interests) && profile.interests.length > 0 ? (
                profile.interests.map((interest, idx) => (
                  <Tag key={idx} colorScheme="purple">{interest}</Tag>
                ))
              ) : (
                <Text color="gray.500">No interests listed.</Text>
              )}
            </HStack>
          </VStack>
        ) : null}
      </ModalBody>
    </ModalContent>
  </Modal>
);

const TeamCard = ({ team, isOwn = false, onUpdate }) => {
  const [responding, setResponding] = useState(false);
  
  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'yellow';
      case 'accepted': return 'green';
      case 'declined': return 'red';
      default: return 'gray';
    }
  };

  return (
    <Card>
      <CardBody>
        <VStack align="start" spacing={3}>
          <HStack justify="space-between" w="full">
            <Heading size="md">{team.name}</Heading>
            <HStack spacing={2}>
              <Badge colorScheme={team.is_open ? 'green' : 'red'}>
                {team.is_open ? 'Open' : 'Closed'}
              </Badge>
              <Badge colorScheme="blue">
                {team.current_size}/{team.max_size} members
              </Badge>
              {isOwn && (
                <IconButton
                  size="sm"
                  icon={<SettingsIcon />}
                  aria-label="Team settings"
                />
              )}
            </HStack>
          </HStack>
          
          {team.description && (
            <Text fontSize="sm" color="gray.700">
              {team.description}
            </Text>
          )}
          
          {Array.isArray(team.required_skills) && team.required_skills.length > 0 && (
            <Box>
              <Text fontSize="sm" fontWeight="medium" mb={1}>Required Skills:</Text>
              <HStack wrap="wrap" spacing={1}>
                {team.required_skills.map((skill, idx) => (
                  <Tag key={idx} size="sm" colorScheme="blue">
                    {skill}
                  </Tag>
                ))}
              </HStack>
            </Box>
          )}
          
          {Array.isArray(team.event_tags) && team.event_tags.length > 0 && (
            <Box>
              <Text fontSize="sm" fontWeight="medium" mb={1}>Event Tags:</Text>
              <HStack wrap="wrap" spacing={1}>
                {team.event_tags.map((tag, idx) => (
                  <Tag key={idx} size="sm" colorScheme="purple">
                    {tag}
                  </Tag>
                ))}
              </HStack>
            </Box>
          )}
          
          {Array.isArray(team.memberships) && team.memberships.length > 0 && (
            <Box w="full">
              <Text fontSize="sm" fontWeight="medium" mb={2}>Team Members:</Text>
              <VStack align="start" spacing={2} w="full">
                {team.memberships.map((membership, idx) => (
                  <HStack key={idx} spacing={3} w="full">
                    <Avatar 
                      size="sm" 
                      name={`${membership.user.first_name} ${membership.user.last_name}`} 
                    />
                    <VStack align="start" spacing={0} flex={1}>
                      <Text fontSize="sm" fontWeight="medium">
                        {membership.user.first_name} {membership.user.last_name}
                        {membership.is_leader && (
                          <Badge ml={2} size="sm" colorScheme="gold">Leader</Badge>
                        )}
                      </Text>
                      {membership.role && (
                        <Text fontSize="xs" color="gray.600">
                          {membership.role}
                        </Text>
                      )}
                    </VStack>
                  </HStack>
                ))}
              </VStack>
            </Box>
          )}
          
          <Divider />
          
          <HStack justify="space-between" w="full">
            <Text fontSize="xs" color="gray.500">
              Created by {team.creator.first_name} {team.creator.last_name}
            </Text>
            <Text fontSize="xs" color="gray.500">
              {new Date(team.created_at).toLocaleDateString()}
            </Text>
          </HStack>
        </VStack>
      </CardBody>
    </Card>
  );
};

const InvitationCard = ({ invitation, onRespond }) => {
  const [responding, setResponding] = useState(false);
  
  const handleRespond = async (action, role = '') => {
    setResponding(true);
    try {
      await onRespond(invitation.id, action, role);
    } finally {
      setResponding(false);
    }
  };

  return (
    <Card>
      <CardBody>
        <VStack align="start" spacing={3}>
          <HStack justify="space-between" w="full">
            <VStack align="start" spacing={1}>
              <Text fontWeight="bold">
                Team: {invitation.team.name}
              </Text>
              <Text fontSize="sm" color="gray.600">
                From: {invitation.inviter.first_name} {invitation.inviter.last_name}
              </Text>
            </VStack>
            <Badge colorScheme="yellow">
              {invitation.status}
            </Badge>
          </HStack>
          
          {invitation.message && (
            <Box>
              <Text fontSize="sm" fontWeight="medium">Message:</Text>
              <Text fontSize="sm" color="gray.700">
                "{invitation.message}"
              </Text>
            </Box>
          )}
          
          <Text fontSize="sm" color="gray.600">
            Team Size: {invitation.team.current_size}/{invitation.team.max_size}
          </Text>
          
          {invitation.team.description && (
            <Text fontSize="sm" color="gray.700">
              {invitation.team.description}
            </Text>
          )}
          
          <Divider />
          
          {invitation.status === 'pending' && (
            <HStack spacing={2} w="full">
              <Button
                colorScheme="green"
                size="sm"
                onClick={() => handleRespond('accept')}
                isLoading={responding}
                flex={1}
              >
                Accept
              </Button>
              <Button
                colorScheme="red"
                variant="outline"
                size="sm"
                onClick={() => handleRespond('decline')}
                isLoading={responding}
                flex={1}
              >
                Decline
              </Button>
            </HStack>
          )}
          
          <Text fontSize="xs" color="gray.500">
            Received: {new Date(invitation.created_at).toLocaleDateString()}
          </Text>
        </VStack>
      </CardBody>
    </Card>
  );
};

const CreateTeamModal = ({ isOpen, onClose, onCreateTeam }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    max_size: 4,
    required_skills: [],
    event_tags: [],
    is_open: true
  });
  const [newSkill, setNewSkill] = useState('');
  const [newTag, setNewTag] = useState('');
  const [creating, setCreating] = useState(false);
  
  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addTag = (field, value, setter) => {
    if (value.trim() && !formData[field].includes(value.trim())) {
      setFormData(prev => ({
        ...prev,
        [field]: [...prev[field], value.trim()]
      }));
      setter('');
    }
  };

  const removeTag = (field, tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter(tag => tag !== tagToRemove)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      await onCreateTeam(formData);
      onClose();
      // Reset form
      setFormData({
        name: '',
        description: '',
        max_size: 4,
        required_skills: [],
        event_tags: [],
        is_open: true
      });
    } finally {
      setCreating(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Create New Team</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <form onSubmit={handleSubmit}>
            <VStack spacing={4} align="stretch">
              <FormControl isRequired>
                <FormLabel>Team Name</FormLabel>
                <Input
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Enter team name"
                />
              </FormControl>
              
              <FormControl>
                <FormLabel>Description</FormLabel>
                <Textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Describe your team's goals..."
                  rows={3}
                />
              </FormControl>
              
              <FormControl>
                <FormLabel>Maximum Team Size</FormLabel>
                <NumberInput
                  value={formData.max_size}
                  onChange={(value) => handleInputChange('max_size', parseInt(value))}
                  min={2}
                  max={10}
                >
                  <NumberInputField />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
              </FormControl>
              
              <FormControl>
                <FormLabel>Required Skills</FormLabel>
                <HStack mb={2}>
                  <Input
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    placeholder="Add required skills..."
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addTag('required_skills', newSkill, setNewSkill);
                      }
                    }}
                  />
                  <Button 
                    onClick={() => addTag('required_skills', newSkill, setNewSkill)}
                    size="sm"
                  >
                    Add
                  </Button>
                </HStack>
                {Array.isArray(formData.required_skills) && formData.required_skills.length > 0 && (
                  <HStack wrap="wrap" spacing={1}>
                    {formData.required_skills.map((skill, idx) => (
                      <Tag key={idx} size="sm" colorScheme="blue">
                        <Text>{skill}</Text>
                        <Button
                          size="xs"
                          variant="ghost"
                          ml={1}
                          onClick={() => removeTag('required_skills', skill)}
                        >
                          ×
                        </Button>
                      </Tag>
                    ))}
                  </HStack>
                )}
              </FormControl>
              
              <FormControl>
                <FormLabel>Event Tags</FormLabel>
                <HStack mb={2}>
                  <Input
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="Add event tags..."
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addTag('event_tags', newTag, setNewTag);
                      }
                    }}
                  />
                  <Button 
                    onClick={() => addTag('event_tags', newTag, setNewTag)}
                    size="sm"
                  >
                    Add
                  </Button>
                </HStack>
                {Array.isArray(formData.event_tags) && formData.event_tags.length > 0 && (
                  <HStack wrap="wrap" spacing={1}>
                    {formData.event_tags.map((tag, idx) => (
                      <Tag key={idx} size="sm" colorScheme="purple">
                        <Text>{tag}</Text>
                        <Button
                          size="xs"
                          variant="ghost"
                          ml={1}
                          onClick={() => removeTag('event_tags', tag)}
                        >
                          ×
                        </Button>
                      </Tag>
                    ))}
                  </HStack>
                )}
              </FormControl>
              
              <FormControl>
                <HStack justify="space-between">
                  <FormLabel mb={0}>Open for new members</FormLabel>
                  <Switch
                    isChecked={formData.is_open}
                    onChange={(e) => handleInputChange('is_open', e.target.checked)}
                  />
                </HStack>
              </FormControl>
              
              <HStack justify="end" spacing={2} pt={4}>
                <Button onClick={onClose}>Cancel</Button>
                <Button
                  type="submit"
                  colorScheme="brand"
                  isLoading={creating}
                  loadingText="Creating..."
                >
                  Create Team
                </Button>
              </HStack>
            </VStack>
          </form>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

const TeamsPage = () => {
  const { user } = useAuth();
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [myTeams, setMyTeams] = useState([]);
  const [allTeams, setAllTeams] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Recommendations state
  const [recommendations, setRecommendations] = useState([]);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);
  const [recommendationsError, setRecommendationsError] = useState(null);

  // Modal for recommended user profile
  const { isOpen: isProfileOpen, onOpen: openProfile, onClose: closeProfile } = useDisclosure();
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState(null);
  const handleShowProfile = async (uid) => {
    if (!uid || uid === 'null' || uid === 'undefined') return;
    setProfileLoading(true);
    setProfileError(null);
    try {
      const res = await authAPI.getProfile(uid);
      setSelectedProfile(res.data);
      openProfile();
    } catch (err) {
      setProfileError('Failed to load profile');
    } finally {
      setProfileLoading(false);
    }
  };

  const fetchRecommendations = React.useCallback(async () => {
    if (!user?.uid) return;
    setLoadingRecommendations(true);
    setRecommendationsError(null);
    try {
      const res = await matchmakingAPI.getRecommendations(user.uid);
      setRecommendations(res.data);
    } catch (err) {
      setRecommendationsError('Failed to load recommendations');
      console.error(err);
    } finally {
      setLoadingRecommendations(false);
    }
  }, [user?.uid]);

  useEffect(() => {
    fetchData();
    fetchRecommendations();
  }, [fetchRecommendations]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [myTeamsRes, allTeamsRes, invitationsRes] = await Promise.all([
        teamsAPI.getUserTeams(user?.uid), // Pass firebase_uid
        teamsAPI.getTeams(),
        teamsAPI.getInvitations()
      ]);
      
      setMyTeams(myTeamsRes.data);
      setAllTeams(allTeamsRes.data);
      setInvitations(invitationsRes.data);
    } catch (err) {
      setError('Failed to load teams data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };


  const handleCreateTeam = async (teamData) => {
    try {
      // Ensure firebase_uid is sent for creator
      const payload = { ...teamData, firebase_uid: user?.uid };
      await teamsAPI.createTeam(payload);
      toast({
        title: 'Team created successfully!',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      fetchData(); // Refresh data
    } catch (err) {
      toast({
        title: 'Failed to create team',
        description: err.response?.data?.message || 'Please try again',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      throw err; // Re-throw to prevent modal from closing
    }
  };

  const handleRespondToInvitation = async (invitationId, action, role) => {
    try {
      await teamsAPI.respondToInvitation(invitationId, action, role);
      toast({
        title: `Invitation ${action}ed!`,
        status: action === 'accept' ? 'success' : 'info',
        duration: 3000,
        isClosable: true,
      });
      fetchData(); // Refresh data
    } catch (err) {
      toast({
        title: `Failed to ${action} invitation`,
        description: err.response?.data?.error || 'Please try again',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  if (loading) {
    return (
      <Center h="50vh">
        <VStack spacing={2}>
          <Spinner size="xl" color="brand.500" />
          <Text>Loading teams...</Text>
        </VStack>
      </Center>
    );
  }

  return (
    <Container maxW="6xl" py={8}>
      <VStack spacing={6} align="stretch">
        <HStack justify="space-between">
          <VStack align="start" spacing={1}>
            <Heading size="lg">Teams</Heading>
            <Text color="gray.600">
              Create and manage your teams
            </Text>
          </VStack>
          <Button
            leftIcon={<AddIcon />}
            colorScheme="brand"
            onClick={onOpen}
          >
            Create Team
          </Button>
        </HStack>

        {error && (
          <Alert status="error">
            <AlertIcon />
            {error}
          </Alert>
        )}

        <Tabs>
          <TabList>
            <Tab>My Teams ({Array.isArray(myTeams) ? myTeams.length : 0})</Tab>
            <Tab>All Teams ({Array.isArray(allTeams) ? allTeams.length : 0})</Tab>
            <Tab>Invitations ({Array.isArray(invitations) ? invitations.filter(inv => inv.status === 'pending').length : 0})</Tab>
              <Tab>Recommendations</Tab>
          </TabList>

          <TabPanels>
            <TabPanel>
              <VStack spacing={4} align="stretch">
                {Array.isArray(myTeams) && myTeams.length > 0 ? (
                  myTeams.map((team, idx) => (
                    <TeamCard 
                      key={idx} 
                      team={team} 
                      isOwn={true}
                      onUpdate={fetchData}
                    />
                  ))
                ) : (
                  <Center py={8}>
                    <VStack spacing={3}>
                      <Text color="gray.500">You haven't joined any teams yet</Text>
                      <Button colorScheme="brand" onClick={onOpen}>
                        Create Your First Team
                      </Button>
                    </VStack>
                  </Center>
                )}
              </VStack>
            </TabPanel>

            <TabPanel>
              <VStack spacing={4} align="stretch">
                {Array.isArray(allTeams) && allTeams.length > 0 ? (
                  allTeams.map((team, idx) => (
                    <TeamCard key={idx} team={team} onUpdate={fetchData} />
                  ))
                ) : (
                  <Center py={8}>
                    <Text color="gray.500">No teams available</Text>
                  </Center>
                )}
              </VStack>
            </TabPanel>

            <TabPanel>
              <VStack spacing={4} align="stretch">
                {Array.isArray(invitations) && invitations.length > 0 ? (
                  invitations.map((invitation, idx) => (
                    <InvitationCard
                      key={idx}
                      invitation={invitation}
                      onRespond={handleRespondToInvitation}
                    />
                  ))
                ) : (
                  <Center py={8}>
                    <Text color="gray.500">No pending invitations</Text>
                  </Center>
                )}
              </VStack>
            </TabPanel>

              <TabPanel>
                <VStack spacing={4} align="stretch">
                  {loadingRecommendations ? (
                    <Center py={8}>
                      <Spinner size="lg" color="brand.500" />
                      <Text>Loading recommendations...</Text>
                    </Center>
                  ) : recommendationsError ? (
                    <Alert status="error">
                      <AlertIcon />
                      {recommendationsError}
                    </Alert>
                  ) : Array.isArray(recommendations) && recommendations.length > 0 ? (
                    <>
                      {recommendations.map((rec, idx) => (
                        <Card key={idx} _hover={{ boxShadow: 'md', cursor: 'pointer' }} onClick={() => handleShowProfile(rec.user?.firebase_uid)}>
                          <CardBody>
                            <HStack spacing={4} align="center">
                              <Avatar name={rec.user?.first_name + ' ' + rec.user?.last_name} />
                              <VStack align="start" spacing={1} flex={1}>
                                <Text fontWeight="bold">{rec.user?.first_name} {rec.user?.last_name}</Text>
                                <Text fontSize="sm" color="gray.600">Score: {rec.score?.toFixed(2)}</Text>
                                <Text fontSize="xs" color="gray.500">Skills similarity: {rec.skills_similarity?.toFixed(2)}, Interests similarity: {rec.interests_similarity?.toFixed(2)}</Text>
                              </VStack>
                            </HStack>
                          </CardBody>
                        </Card>
                      ))}
                      <UserProfileModal
                        isOpen={isProfileOpen}
                        onClose={closeProfile}
                        profile={selectedProfile}
                        loading={profileLoading}
                        error={profileError}
                      />
                    </>
                  ) : (
                    <Center py={8}>
                      <Text color="gray.500">No recommendations found</Text>
                    </Center>
                  )}
                </VStack>
              </TabPanel>
          </TabPanels>
        </Tabs>

        <CreateTeamModal
          isOpen={isOpen}
          onClose={onClose}
          onCreateTeam={handleCreateTeam}
        />
      </VStack>
    </Container>
  );
};

export default TeamsPage;