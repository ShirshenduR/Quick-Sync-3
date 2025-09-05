import { extendTheme } from '@chakra-ui/react';

// QuickSync Color Palette
const colors = {
  brand: {
    50: '#e8f5df',   // Lightest tint of primary accent
    100: '#d0ffa2',  // Primary Accent (#D0FFA2)
    200: '#b8e984',
    300: '#a0d466',
    400: '#88be48',
    500: '#70a92a',  // Darker shade of primary accent
    600: '#5e8f24',
    700: '#4c751e',
    800: '#3a5b18',
    900: '#284112',  // Darkest shade
  },
  gray: {
    50: '#f8f7f2',   // Text / Light Background (#F8F7F2)
    100: '#f1f0ea',
    200: '#e4e2da',
    300: '#d7d4ca',
    400: '#cac6ba',
    500: '#bdb8aa',
    600: '#a29d91',
    700: '#878278',
    800: '#6c675f',
    900: '#514d46',
  },
  surface: {
    50: '#e1f2f4',
    100: '#c3e5e8',
    200: '#a5d8dc',
    300: '#87cbd0',
    400: '#69bec4',
    500: '#234f55',  // Surface / Cards (#234F55)
    600: '#1e434a',
    700: '#19373e',
    800: '#142b32',
    900: '#0f1f26',
  },
  dark: {
    50: '#e0e5e7',
    100: '#c1cbcf',
    200: '#a2b1b7',
    300: '#83979f',
    400: '#647d87',
    500: '#45636f',
    600: '#364f59',
    700: '#273b43',
    800: '#16232a',  // Background (Dark) (#16232A)
    900: '#0f1a1f',
  }
};

// Theme configuration
const theme = extendTheme({
  colors,
  config: {
    initialColorMode: 'light',
    useSystemColorMode: false,
  },
  fonts: {
    heading: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif",
    body: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif",
  },
  styles: {
    global: (props) => ({
      body: {
        bg: props.colorMode === 'dark' ? 'dark.800' : 'gray.50',
        color: props.colorMode === 'dark' ? 'gray.50' : 'dark.800',
      },
    }),
  },
  components: {
    // Button component overrides
    Button: {
      baseStyle: {
        fontWeight: '600',
        borderRadius: 'lg',
      },
      variants: {
        solid: (props) => ({
          bg: props.colorScheme === 'brand' ? 'brand.100' : undefined,
          color: props.colorScheme === 'brand' ? 'dark.800' : undefined,
          _hover: {
            bg: props.colorScheme === 'brand' ? 'brand.200' : undefined,
            transform: 'translateY(-2px)',
            boxShadow: 'lg',
          },
          _active: {
            transform: 'translateY(0)',
          },
        }),
        outline: (props) => ({
          borderColor: props.colorScheme === 'brand' ? 'brand.100' : undefined,
          color: props.colorScheme === 'brand' ? 'brand.100' : undefined,
          _hover: {
            bg: props.colorScheme === 'brand' ? 'brand.100' : undefined,
            color: props.colorScheme === 'brand' ? 'dark.800' : undefined,
          },
        }),
      },
    },
    
    // Card component overrides
    Card: {
      baseStyle: (props) => ({
        container: {
          bg: props.colorMode === 'dark' ? 'surface.500' : 'white',
          borderRadius: 'xl',
          boxShadow: 'md',
          border: '1px solid',
          borderColor: props.colorMode === 'dark' ? 'surface.400' : 'gray.200',
        },
      }),
    },
    
    // Input component overrides
    Input: {
      variants: {
        filled: (props) => ({
          field: {
            bg: props.colorMode === 'dark' ? 'surface.400' : 'gray.100',
            _hover: {
              bg: props.colorMode === 'dark' ? 'surface.300' : 'gray.200',
            },
            _focus: {
              bg: props.colorMode === 'dark' ? 'surface.300' : 'gray.200',
              borderColor: 'brand.100',
            },
          },
        }),
      },
      defaultProps: {
        variant: 'filled',
      },
    },
    
    // Badge component overrides
    Badge: {
      variants: {
        subtle: (props) => ({
          bg: props.colorScheme === 'brand' ? 'brand.50' : undefined,
          color: props.colorScheme === 'brand' ? 'brand.700' : undefined,
        }),
        solid: (props) => ({
          bg: props.colorScheme === 'brand' ? 'brand.100' : undefined,
          color: props.colorScheme === 'brand' ? 'dark.800' : undefined,
        }),
      },
    },
    
    // Progress component overrides
    Progress: {
      baseStyle: (props) => ({
        filledTrack: {
          bg: 'brand.100',
        },
        track: {
          bg: props.colorMode === 'dark' ? 'surface.400' : 'gray.200',
        },
      }),
    },
  },
  // Semantic tokens for consistent theming
  semanticTokens: {
    colors: {
      'bg-primary': {
        default: 'gray.50',
        _dark: 'dark.800',
      },
      'bg-secondary': {
        default: 'white',
        _dark: 'surface.500',
      },
      'text-primary': {
        default: 'dark.800',
        _dark: 'gray.50',
      },
      'text-secondary': {
        default: 'gray.600',
        _dark: 'gray.300',
      },
      'border-primary': {
        default: 'gray.200',
        _dark: 'surface.400',
      },
      'accent': {
        default: 'brand.100',
        _dark: 'brand.100',
      },
      'accent-hover': {
        default: 'brand.200',
        _dark: 'brand.200',
      },
    },
  },
});

export default theme;