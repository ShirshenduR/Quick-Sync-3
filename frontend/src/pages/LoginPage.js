import React from 'react';
import {
  Box,
  Button,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  Icon,
  Alert,
  AlertIcon,
  useColorModeValue
} from '@chakra-ui/react';
import { FaGoogle, FaUsers, FaBrain, FaClock } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';

const FeatureBox = ({ icon, title, description }) => {
  const bg = useColorModeValue('white', 'gray.700');
  const shadow = useColorModeValue('md', 'dark-lg');
  
  return (
    <VStack
      bg={bg}
      p={6}
      rounded="lg"
      shadow={shadow}
      spacing={4}
      align="start"
      w="full"
    >
      <Icon as={icon} boxSize={8} color="brand.500" />
      <Heading size="md">{title}</Heading>
      <Text color="gray.600">{description}</Text>
    </VStack>
  );
};

const LoginPage = () => {
  const { signInWithGoogle, loading, error } = useAuth();
  const bg = useColorModeValue('gray.50', 'gray.900');

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  return (
    <Box minH="100vh" bg={bg}>
      <Container maxW="6xl" py={20}>
        <VStack spacing={12} textAlign="center">
          {/* Hero Section */}
          <VStack spacing={6}>
            <Heading
              size="2xl"
              bgGradient="linear(to-r, brand.400, brand.600)"
              bgClip="text"
            >
              Welcome to QuickSync
            </Heading>
            <Text fontSize="xl" color="gray.600" maxW="2xl">
              The ultimate team matchmaking platform for hackathons and collaboration events.
              Find your perfect teammates based on skills, interests, and availability.
            </Text>
          </VStack>

          {/* Error Alert */}
          {error && (
            <Alert status="error" rounded="md" maxW="md">
              <AlertIcon />
              {error}
            </Alert>
          )}

          {/* Login Button */}
          <VStack spacing={4}>
            <Button
              leftIcon={<FaGoogle />}
              colorScheme="brand"
              size="lg"
              onClick={handleGoogleSignIn}
              isLoading={loading}
              loadingText="Signing in..."
              px={8}
              py={6}
              fontSize="lg"
            >
              Sign in with Google
            </Button>
            <Text fontSize="sm" color="gray.500">
              Quick and secure authentication with your Google account
            </Text>
          </VStack>

          {/* Features Section */}
          <VStack spacing={8} w="full" pt={12}>
            <Heading size="lg" color="gray.700">
              Why Choose QuickSync?
            </Heading>
            
            <HStack spacing={6} w="full" align="stretch">
              <FeatureBox
                icon={FaBrain}
                title="Smart Matchmaking"
                description="AI-powered matching based on your skills, interests, and project preferences using advanced semantic analysis."
              />
              
              <FeatureBox
                icon={FaUsers}
                title="One-Click Teams"
                description="Send instant team invitations and build your dream team with just a few clicks. No more endless searching."
              />
              
              <FeatureBox
                icon={FaClock}
                title="Availability Heatmap"
                description="Visual weekly schedule comparison to find the perfect collaboration windows with your teammates."
              />
            </HStack>
          </VStack>

          {/* Call to Action */}
          <VStack spacing={4} pt={8}>
            <Text fontSize="lg" fontWeight="medium" color="gray.700">
              Ready to find your perfect team?
            </Text>
            <Button
              leftIcon={<FaGoogle />}
              colorScheme="brand"
              variant="outline"
              size="lg"
              onClick={handleGoogleSignIn}
              isLoading={loading}
              px={8}
            >
              Get Started Now
            </Button>
          </VStack>
        </VStack>
      </Container>
    </Box>
  );
};

export default LoginPage;