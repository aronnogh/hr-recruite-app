// components/emails/NextStepsEmail.js
import * as React from 'react';
import { Html, Head, Body, Container, Heading, Text, Link, Img, Section, Button } from '@react-email/components';

export function NextStepsEmail({ candidateName, jobTitle }) {
  const previewText = `Exciting News, ${candidateName}! Your Application for ${jobTitle} has been Shortlisted!`;

  return (
    <Html>
      <Head>
        <title>Next Steps for Your Application</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>
      <Body style={main}>
        <Container style={container}>
          {/* Logo Section */}
          <Section style={header}>
            {/* Replace with your actual logo URL and alt text */}
            <Img
              src="https://www.logologo.com/logos/abstract-isometric-logo-design-free-logo.jpg" // **IMPORTANT: Replace with your actual logo URL**
              width="150"
              height="auto"
              alt="AI Recruiter Logo"
              style={logo}
            />
          </Section>

          <Section style={contentContainer}>
            <Heading style={heading}>Congratulations, {candidateName}!</Heading>
            <Text style={paragraph}>
              We are impressed with your profile and are thrilled to inform you that your application
              for the <Text style={boldText}>{jobTitle}</Text> position has been shortlisted for the next steps.
            </Text>
            <Text style={paragraph}>
              Our HR team will be reviewing your application in detail and will reach out to you shortly
              to discuss potential interview opportunities and what comes next.
            </Text>

            {/* Example Button - Uncomment if you have a specific action */}
            {/* <Section style={buttonContainer}>
              <Button style={button} href="https://website.com/careers/next-steps">
                Learn More About Our Process
              </Button>
            </Section> */}

            <Text style={paragraph}>
              In the meantime, feel free to visit our careers page to learn more about our culture and values.
            </Text>
            <Text style={paragraph}>
              Best regards,
              <br />
              <Text style={boldText}>The Team at AI Recruiter</Text>
            </Text>
          </Section>

          {/* Footer Section */}
          <Section style={footer}>
            <Text style={footerText}>
              &copy; {new Date().getFullYear()} AI Recruiter. All rights reserved.
              <br />
            </Text>
          </Section>

        </Container>
      </Body>
    </Html>
  );
}

// Email-safe Styles
const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: 'Verdana, sans-serif',
  padding: '20px',
};

const container = {
  margin: '0 auto',
  maxWidth: '600px',
  backgroundColor: '#ffffff',
  borderRadius: '8px',
  overflow: 'hidden',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)', // Subtle shadow for depth
};

const header = {
  backgroundColor: '#E0E7FF', // Light blue background for header
  padding: '20px 30px',
  textAlign: 'center',
};

const logo = {
  maxWidth: '150px',
  height: 'auto',
  display: 'block',
  margin: '0 auto',
};

const contentContainer = {
  padding: '30px',
};

const heading = {
  fontSize: '28px',
  lineHeight: '1.3',
  fontWeight: '700',
  color: '#333333',
  textAlign: 'center',
  marginBottom: '20px',
};

const paragraph = {
  fontSize: '16px',
  lineHeight: '1.6',
  color: '#555555',
  marginBottom: '15px',
};

const boldText = {
    fontWeight: 'bold',
    color: '#333333',
};

const buttonContainer = {
  textAlign: 'center',
  marginTop: '30px',
  marginBottom: '30px',
};

const button = {
  backgroundColor: '#4A71FF', // A vibrant blue
  color: '#ffffff',
  padding: '12px 25px',
  borderRadius: '5px',
  textDecoration: 'none',
  fontSize: '16px',
  fontWeight: 'bold',
  display: 'inline-block', // Important for consistent button rendering
};

const footer = {
  backgroundColor: '#f0f0f0',
  padding: '20px 30px',
  textAlign: 'center',
  fontSize: '12px',
  color: '#888888',
  borderTop: '1px solid #eeeeee',
};

const footerText = {
    margin: '0',
    lineHeight: '1.5',
};

const footerLink = {
  color: '#888888',
  textDecoration: 'underline',
};