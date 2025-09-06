import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Heading,
  VStack,
  HStack,
  Button,
  Input,
  Tag,
  TagLabel,
  TagCloseButton,
  Card,
  CardBody,
  Avatar,
  Text,
  Badge,
  Divider,
  useToast,
  Spinner,
  Center,
  Tabs,
  TabList,
  TabPanels,
  TabPanel,
  Tab,
  Alert,
  AlertIcon,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
} from '@chakra-ui/react';
import { matchmakingAPI, teamsAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

// UserProfileModal: shows a user's profile in a modal popup
const UserProfileModal = ({ isOpen, onClose, profile }) => (
  <Modal isOpen={isOpen} onClose={onClose} size="lg">
    <ModalOverlay />
    <ModalContent>
      <ModalHeader>User Profile</ModalHeader>
      <ModalCloseButton />
      <ModalBody>
        {profile ? (
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

const UserMatchCard = ({ match, onSendInvite, onShowProfile }) => {
  const [sending, setSending] = useState(false);
  const handleInvite = async () => {
    console.log('Invite button clicked for user:', match);
    setSending(true);
    try {
      await onSendInvite(match);
    } finally {
      setSending(false);
    }
  };
  if (!match || !match.first_name || !match.last_name || !match.username) {
    return (
      <Card><CardBody><Text color="red.500">Invalid user data</Text></CardBody></Card>
    );
  }
  return (
    <Card>
      <CardBody>
        <VStack align="start" spacing={3}>
          <HStack>
            <Avatar 
              size="md" 
              name={`${match.first_name} ${match.last_name}`} 
              cursor="pointer"
              onClick={() => onShowProfile(match)}
            />
            <VStack align="start" spacing={1}>
              <Text fontWeight="bold" cursor="pointer" onClick={() => onShowProfile(match)}>
                {match.first_name} {match.last_name}
              </Text>
              <Text fontSize="sm" color="gray.600" cursor="pointer" onClick={() => onShowProfile(match)}>
                @{match.username}
              </Text>
            </VStack>
            <Badge colorScheme="green" ml="auto">
              {isNaN(match.score) ? 0 : match.score}% Match
            </Badge>
          </HStack>
          {match.bio && (
            <Text fontSize="sm" color="gray.700">
              {match.bio}
            </Text>
          )}
          {Array.isArray(match.skills) && match.skills.length > 0 && (
            <Box>
              <Text fontSize="sm" fontWeight="medium" mb={1}>Skills:</Text>
              <HStack wrap="wrap" spacing={1}>
                {match.skills.map((skill, idx) => (
                  <Tag key={idx} size="sm" colorScheme="blue">
                    {skill}
                  </Tag>
                ))}
              </HStack>
            </Box>
          )}
          {Array.isArray(match.interests) && match.interests.length > 0 && (
            <Box>
              <Text fontSize="sm" fontWeight="medium" mb={1}>Interests:</Text>
              <HStack wrap="wrap" spacing={1}>
                {match.interests.map((interest, idx) => (
                  <Tag key={idx} size="sm" colorScheme="green">
                    {interest}
                  </Tag>
                ))}
              </HStack>
            </Box>
          )}
          <Divider />
          <HStack justify="space-between" w="full">
            <VStack align="start" spacing={0}>
              <Text fontSize="xs" color="gray.500">Similarity Scores:</Text>
              <HStack spacing={3}>
                <Text fontSize="xs">
                  Skills: {isNaN(match.skills_similarity) ? 0 : match.skills_similarity}%
                </Text>
                <Text fontSize="xs">
                  Interests: {isNaN(match.interests_similarity) ? 0 : match.interests_similarity}%
                </Text>
                <Text fontSize="xs">
                  Combined: {isNaN(match.combined_similarity) ? 0 : match.combined_similarity}%
                </Text>
              </HStack>
            </VStack>
            <Button 
              size="sm" 
              colorScheme="brand"
              onClick={handleInvite}
              isLoading={sending}
              loadingText="Inviting..."
            >
              Send Team Invite
            </Button>
          </HStack>
        </VStack>
      </CardBody>
    </Card>
  );
};

const ProjectSuggestionCard = ({ project }) => (
  <Card>
    <CardBody>
      <VStack align="start" spacing={3}>
        <HStack justify="space-between" w="full">
          <Heading size="md">{project.title}</Heading>
          <Badge colorScheme={
            project.difficulty_level === 'beginner' ? 'green' : 
            project.difficulty_level === 'intermediate' ? 'yellow' : 'red'
          }>
            {project.difficulty_level}
          </Badge>
        </HStack>
        
        <Text fontSize="sm" color="gray.700">
          {project.description}
        </Text>
        
        {project.estimated_duration && (
          <Text fontSize="xs" color="gray.500">
            Estimated: {project.estimated_duration}
          </Text>
        )}
        
  {Array.isArray(project.required_skills) && project.required_skills.length > 0 && (
          <Box>
            <Text fontSize="sm" fontWeight="medium" mb={1}>Required Skills:</Text>
            <HStack wrap="wrap" spacing={1}>
              {project.required_skills.map((skill, idx) => (
                <Tag key={idx} size="sm" colorScheme="purple">
                  {skill}
                </Tag>
              ))}
            </HStack>
          </Box>
        )}
        
  {Array.isArray(project.tech_stack) && project.tech_stack.length > 0 && (
          <Box>
            <Text fontSize="sm" fontWeight="medium" mb={1}>Tech Stack:</Text>
            <HStack wrap="wrap" spacing={1}>
              {project.tech_stack.map((tech, idx) => (
                <Tag key={idx} size="sm" colorScheme="orange">
                  {tech}
                </Tag>
              ))}
            </HStack>
          </Box>
        )}
      </VStack>
    </CardBody>
  </Card>
);

const MatchmakingPage = () => {
  const { user } = useAuth();
  const toast = useToast();
  const [matches, setMatches] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [projectsLoading, setProjectsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchSkills, setSearchSkills] = useState([]);
  const [searchInterests, setSearchInterests] = useState([]);
  const [newSkill, setNewSkill] = useState('');
  const [newInterest, setNewInterest] = useState('');
  const [userTeams, setUserTeams] = useState([]);

  useEffect(() => {
    fetchUserTeams();
    fetchProjectSuggestions();
  }, []);

  const fetchUserTeams = async () => {
    try {
      const response = await teamsAPI.getUserTeams(user?.uid);
      console.log('Fetched user teams:', response.data);
      setUserTeams(Array.isArray(response.data?.results) ? response.data.results : []);
    } catch (err) {
      console.error('Failed to fetch user teams:', err);
    }
  };

  const fetchProjectSuggestions = async () => {
    try {
      setProjectsLoading(true);
      const response = await matchmakingAPI.getProjectSuggestions();
  setProjects(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error('Failed to fetch project suggestions:', err);
      // Try to populate sample data
      try {
        await matchmakingAPI.populateProjects();
        const response = await matchmakingAPI.getProjectSuggestions();
    setProjects(Array.isArray(response.data) ? response.data : []);
      } catch (populateErr) {
        console.error('Failed to populate projects:', populateErr);
      }
    } finally {
      setProjectsLoading(false);
    }
  };

  const addSearchTag = (field, value, setter, searchArray, setSearchArray) => {
    if (value.trim() && !searchArray.includes(value.trim())) {
      setSearchArray(prev => [...prev, value.trim()]);
      setter('');
    }
  };

  const removeSearchTag = (field, tagToRemove, setSearchArray) => {
    setSearchArray(prev => prev.filter(tag => tag !== tagToRemove));
  };

  const handleSearch = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await matchmakingAPI.findMatches({
        skills: searchSkills,
        interests: searchInterests,
        limit: 20
      });
      
      let matches = response.data || [];
      // Filter out current user from matches
      if (user && user.uid) {
        matches = matches.filter(m => m.firebase_uid !== user.uid);
      }
      setMatches(matches);
      
  if (Array.isArray(response.data) && response.data.length === 0) {
        toast({
          title: 'No matches found',
          description: 'Try adjusting your search criteria',
          status: 'info',
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (err) {
      setError('Failed to find matches');
      toast({
        title: 'Error finding matches',
        description: 'Please try again later',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSendInvite = async (targetUser) => {
    // Always show the modal, even if no valid team is found
    if (!Array.isArray(userTeams) || userTeams.length === 0) {
      toast({
        title: 'No valid team found',
        description: 'Create a team first or check your team data.',
        status: 'error',
        duration: 4000,
        isClosable: true,
      });
    }
    console.log('Opening invite modal for user:', targetUser);
    setInviteTargetUser(targetUser);
    setInviteModalOpen(true);
  };

  // State for invite modal
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [inviteTargetUser, setInviteTargetUser] = useState(null);
  const [selectedTeamId, setSelectedTeamId] = useState(null);

  const handleConfirmInvite = async () => {
    const team = userTeams.find(t => t.id === selectedTeamId);
    if (!team || !inviteTargetUser) {
      toast({
        title: 'No valid team or user selected',
        status: 'error',
        duration: 4000,
        isClosable: true,
      });
      return;
    }
    try {
      const payload = {
        invitee_id: inviteTargetUser.id,
        message: `Hi ${inviteTargetUser.first_name}! I think you'd be a great fit for our team "${team.name}". Want to join us?`,
        firebase_uid: user?.uid
      };
      console.log('Sending invite payload:', payload);
      const response = await teamsAPI.sendInvitation(team.id, payload);
      console.log('Invite response:', response);
      toast({
        title: 'Invitation sent!',
        description: `Sent team invite to ${inviteTargetUser.first_name} from team ${team.name}`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      setInviteModalOpen(false);
      setInviteTargetUser(null);
      setSelectedTeamId(null);
    } catch (err) {
      console.error('Invite error:', err);
      toast({
        title: 'Failed to send invitation',
        description: err.response?.data?.error || err.message || 'Please try again',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };
  // Invite modal component
// Invite modal component (move outside main component)
const InviteTeamModal = ({ isOpen, onClose, teams, selectedTeamId, setSelectedTeamId, onConfirm }) => (
  <Modal isOpen={isOpen} onClose={onClose} size="md">
    <ModalOverlay />
    <ModalContent>
      <ModalHeader>Select Team to Send Invite</ModalHeader>
      <ModalCloseButton />
      <ModalBody>
        <VStack spacing={4} align="stretch">
          {(!Array.isArray(teams) || teams.length === 0) ? (
            <>
              <Text color="red.500">No valid team found. Please create a team first to send invitations.</Text>
              <Button colorScheme="brand" isDisabled>Send Invite</Button>
            </>
          ) : (
            <>
              <Text>Select which team you want to send the invite from:</Text>
              <select
                value={selectedTeamId || ''}
                onChange={e => setSelectedTeamId(Number(e.target.value))}
              >
                <option value="" disabled>Select a team</option>
                {teams.map(team => (
                  <option key={team.id} value={team.id}>{team.name}</option>
                ))}
              </select>
              <Button
                colorScheme="brand"
                isDisabled={!selectedTeamId}
                onClick={onConfirm}
              >
                Send Invite
              </Button>
            </>
          )}
        </VStack>
      </ModalBody>
    </ModalContent>
  </Modal>
);

  // Profile modal state
  const [isProfileOpen, setProfileOpen] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState(null);

  const handleShowProfile = (profile) => {
    setSelectedProfile(profile);
    setProfileOpen(true);
  };
  const closeProfile = () => {
    setProfileOpen(false);
    setSelectedProfile(null);
  };

  return (
    <>
      <InviteTeamModal
        isOpen={inviteModalOpen}
        onClose={() => setInviteModalOpen(false)}
        teams={userTeams}
        selectedTeamId={selectedTeamId}
        setSelectedTeamId={setSelectedTeamId}
        onConfirm={handleConfirmInvite}
      />
      <Container maxW="6xl" py={8}>
        <VStack spacing={6} align="stretch">
          <Box>
            <Heading size="lg" mb={2}>Find Teammates</Heading>
            <Text color="gray.600">
              Discover the perfect teammates using AI-powered matching
            </Text>
          </Box>

        <Tabs>
          <TabList>
            <Tab>Find Matches</Tab>
            <Tab>Project Ideas</Tab>
          </TabList>

          <TabPanels>
            <TabPanel>
              {/* Search Interface */}
              <VStack spacing={4} align="stretch">
                <Box>
                  <Text fontWeight="medium" mb={2}>Search by Skills</Text>
                  <HStack mb={2}>
                    <Input
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      placeholder="Add skills to search for..."
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          addSearchTag('skills', newSkill, setNewSkill, searchSkills, setSearchSkills);
                        }
                      }}
                    />
                    <Button 
                      onClick={() => addSearchTag('skills', newSkill, setNewSkill, searchSkills, setSearchSkills)}
                      colorScheme="blue"
                    >
                      Add
                    </Button>
                  </HStack>
                  {Array.isArray(searchSkills) && searchSkills.length > 0 && (
                    <HStack wrap="wrap" spacing={2}>
                      {searchSkills.map((skill, idx) => (
                        <Tag key={idx} colorScheme="blue">
                          <TagLabel>{skill}</TagLabel>
                          <TagCloseButton onClick={() => removeSearchTag('skills', skill, setSearchSkills)} />
                        </Tag>
                      ))}
                    </HStack>
                  )}
                </Box>

                <Box>
                  <Text fontWeight="medium" mb={2}>Search by Interests</Text>
                  <HStack mb={2}>
                    <Input
                      value={newInterest}
                      onChange={(e) => setNewInterest(e.target.value)}
                      placeholder="Add interests to search for..."
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          addSearchTag('interests', newInterest, setNewInterest, searchInterests, setSearchInterests);
                        }
                      }}
                    />
                    <Button 
                      onClick={() => addSearchTag('interests', newInterest, setNewInterest, searchInterests, setSearchInterests)}
                      colorScheme="green"
                    >
                      Add
                    </Button>
                  </HStack>
                  {Array.isArray(searchInterests) && searchInterests.length > 0 && (
                    <HStack wrap="wrap" spacing={2}>
                      {searchInterests.map((interest, idx) => (
                        <Tag key={idx} colorScheme="green">
                          <TagLabel>{interest}</TagLabel>
                          <TagCloseButton onClick={() => removeSearchTag('interests', interest, setSearchInterests)} />
                        </Tag>
                      ))}
                    </HStack>
                  )}
                </Box>

                <Button
                  colorScheme="brand"
                  size="lg"
                  onClick={handleSearch}
                  isLoading={loading}
                  loadingText="Finding matches..."
                >
                  Find Teammates
                </Button>

                {error && (
                  <Alert status="error">
                    <AlertIcon />
                    {error}
                  </Alert>
                )}

                {/* Results */}
                {Array.isArray(matches) && matches.length > 0 && (
                  <VStack spacing={4} align="stretch">
                    <Text fontWeight="medium" fontSize="lg">
                      Found {Array.isArray(matches) ? matches.length : 0} potential teammates
                    </Text>
                    {matches.map((match, idx) => (
                      <UserMatchCard 
                        key={idx} 
                        match={match} 
                        onSendInvite={handleSendInvite}
                        onShowProfile={handleShowProfile}
                      />
                    ))}
                  </VStack>
                )}

                {loading && (
                  <Center py={8}>
                    <VStack spacing={2}>
                      <Spinner size="xl" color="brand.500" />
                      <Text>Finding your perfect teammates...</Text>
                    </VStack>
                  </Center>
                )}
              </VStack>
              {/* Profile Modal for recommended users */}
              <UserProfileModal
                isOpen={isProfileOpen}
                onClose={closeProfile}
                profile={selectedProfile}
              />
            </TabPanel>

            <TabPanel>
              <VStack spacing={4} align="stretch">
                <Text color="gray.600">
                  Discover project ideas that match your skills and interests
                </Text>

                {projectsLoading ? (
                  <Center py={8}>
                    <VStack spacing={2}>
                      <Spinner size="xl" color="brand.500" />
                      <Text>Loading project suggestions...</Text>
                    </VStack>
                  </Center>
                ) : (
                  <VStack spacing={4} align="stretch">
                    {projects.map((project, idx) => (
                      <ProjectSuggestionCard key={idx} project={project} />
                    ))}
                    
                    {Array.isArray(projects) && projects.length === 0 && (
                      <Center py={8}>
                        <Text color="gray.500">
                          No project suggestions available yet
                        </Text>
                      </Center>
                    )}
                  </VStack>
                )}
              </VStack>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </VStack>
    </Container>
    </>
  );
};

export default MatchmakingPage;