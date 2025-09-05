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
  Tab,
  TabPanel,
  Progress,
  Alert,
  AlertIcon
} from '@chakra-ui/react';
import { matchmakingAPI, teamsAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const UserMatchCard = ({ match, onSendInvite }) => {
  const [sending, setSending] = useState(false);
  
  const handleInvite = async () => {
    setSending(true);
    try {
      await onSendInvite(match.user);
    } finally {
      setSending(false);
    }
  };

  return (
    <Card>
      <CardBody>
        <VStack align="start" spacing={3}>
          <HStack>
            <Avatar 
              size="md" 
              name={`${match.user.first_name} ${match.user.last_name}`} 
            />
            <VStack align="start" spacing={1}>
              <Text fontWeight="bold">
                {match.user.first_name} {match.user.last_name}
              </Text>
              <Text fontSize="sm" color="gray.600">
                @{match.user.username}
              </Text>
            </VStack>
            <Badge colorScheme="green" ml="auto">
              {Math.round(match.score * 100)}% Match
            </Badge>
          </HStack>
          
          {match.user.bio && (
            <Text fontSize="sm" color="gray.700">
              {match.user.bio}
            </Text>
          )}
          
          {match.user.skills && match.user.skills.length > 0 && (
            <Box>
              <Text fontSize="sm" fontWeight="medium" mb={1}>Skills:</Text>
              <HStack wrap="wrap" spacing={1}>
                {match.user.skills.map((skill, idx) => (
                  <Tag key={idx} size="sm" colorScheme="blue">
                    {skill}
                  </Tag>
                ))}
              </HStack>
            </Box>
          )}
          
          {match.user.interests && match.user.interests.length > 0 && (
            <Box>
              <Text fontSize="sm" fontWeight="medium" mb={1}>Interests:</Text>
              <HStack wrap="wrap" spacing={1}>
                {match.user.interests.map((interest, idx) => (
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
                  Skills: {Math.round(match.skills_similarity * 100)}%
                </Text>
                <Text fontSize="xs">
                  Interests: {Math.round(match.interests_similarity * 100)}%
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
        
        {project.required_skills && project.required_skills.length > 0 && (
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
        
        {project.tech_stack && project.tech_stack.length > 0 && (
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
      const response = await teamsAPI.getUserTeams();
      setUserTeams(response.data);
    } catch (err) {
      console.error('Failed to fetch user teams:', err);
    }
  };

  const fetchProjectSuggestions = async () => {
    try {
      setProjectsLoading(true);
      const response = await matchmakingAPI.getProjectSuggestions();
      setProjects(response.data);
    } catch (err) {
      console.error('Failed to fetch project suggestions:', err);
      // Try to populate sample data
      try {
        await matchmakingAPI.populateProjects();
        const response = await matchmakingAPI.getProjectSuggestions();
        setProjects(response.data);
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
      
      setMatches(response.data);
      
      if (response.data.length === 0) {
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
    // Find a team to invite from
    if (userTeams.length === 0) {
      toast({
        title: 'No teams available',
        description: 'Create a team first to send invitations',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    // For now, use the first team (in a real app, let user choose)
    const team = userTeams[0];
    
    try {
      await teamsAPI.sendInvitation(team.id, {
        invitee_id: targetUser.id,
        message: `Hi ${targetUser.first_name}! I think you'd be a great fit for our team "${team.name}". Want to join us?`
      });
      
      toast({
        title: 'Invitation sent!',
        description: `Sent team invite to ${targetUser.first_name}`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (err) {
      toast({
        title: 'Failed to send invitation',
        description: err.response?.data?.error || 'Please try again',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
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
                  {searchSkills.length > 0 && (
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
                  {searchInterests.length > 0 && (
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
                {matches.length > 0 && (
                  <VStack spacing={4} align="stretch">
                    <Text fontWeight="medium" fontSize="lg">
                      Found {matches.length} potential teammates
                    </Text>
                    {matches.map((match, idx) => (
                      <UserMatchCard 
                        key={idx} 
                        match={match} 
                        onSendInvite={handleSendInvite}
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
                    
                    {projects.length === 0 && (
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
  );
};

export default MatchmakingPage;