// app/components/ThemeRegistry.js
'use client';

import * as React from 'react';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Montserrat } from 'next/font/google';
import IconButton from '@mui/material/IconButton';
import Box from '@mui/material/Box';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';

// We create a new context for the color mode
export const ColorModeContext = React.createContext({ toggleColorMode: () => {} });

// Note: The user requested Material UI v3, but "Material You" is the design language
// for Material UI v5. We will use v5 as it is the current standard.

const montserrat = Montserrat({
  weight: ['300', '400', '500', '700'],
  subsets: ['latin'],
  display: 'swap',
});

// A simple component to demonstrate the theme toggle
export function ThemeToggleButton() {
  const { toggleColorMode } = React.useContext(ColorModeContext);

  // The sx prop is a new way to style components in MUI v5
  return (
    <IconButton sx={{ ml: 1 }} onClick={toggleColorMode} color="inherit">
        {/* We can use the theme to determine the icon */}
       <Box component="span" sx={{ display: { xs: 'none', md: 'block' } }}>
        Toggle Theme
       </Box>
      <Brightness7Icon sx={{ display: { xs: 'block', md: 'none' }, ml: 1 }} />
    </IconButton>
  );
}

export default function ThemeRegistry({ children }) {
  // We manage the color mode state here
  const [mode, setMode] = React.useState('dark'); // Default to dark mode as per your original layout

  const colorMode = React.useMemo(
    () => ({
      toggleColorMode: () => {
        setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
      },
    }),
    [],
  );

  // The theme is memoized to prevent re-creation on every render
  const theme = React.useMemo(
    () =>
      createTheme({
        palette: {
          mode, // This is the key for adaptive theming
        },
        typography: {
          fontFamily: montserrat.style.fontFamily, // Set Montserrat as the default font
        },
        components: {
          // Example of customizing a component
          MuiButton: {
            styleOverrides: {
              root: {
                borderRadius: 8, // Softer corners for buttons
              },
            },
          },
        },
      }),
    [mode],
  );

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        {/* CssBaseline kickstarts an elegant, consistent, and simple baseline to build upon. */}
        {/* It also applies the theme's background color to the <body> */}
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}