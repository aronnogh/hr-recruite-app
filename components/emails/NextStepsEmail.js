// components/emails/NextStepsEmail.js
import * as React from 'react';
import { Html, Head, Body, Container, Heading, Text, Link } from '@react-email/components';

export function NextStepsEmail({ candidateName, jobTitle }) {
  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          <Heading style={heading}>Congratulations, {candidateName}!</Heading>
          <Text style={paragraph}>
            We are impressed with your profile and would like to inform you that your application
            for the **{jobTitle}** position has been shortlisted for the next steps.
          </Text>
          <Text style={paragraph}>
            Our HR team will review your application in detail and will reach out to you shortly
            to discuss potential interview opportunities.
          </Text>
          <Text style={paragraph}>
            Best regards,
            <br />
            The Team at Your App Name
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

// Basic styles
const main = { backgroundColor: '#f6f9fc', fontFamily: 'Arial, sans-serif' };
const container = { margin: '0 auto', padding: '20px 0 48px', width: '580px' };
const heading = { fontSize: '24px', lineHeight: '1.3', fontWeight: '700', color: '#484848' };
const paragraph = { fontSize: '16px', lineHeight: '1.4', color: '#484848' };