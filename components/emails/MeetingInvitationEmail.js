// components/emails/MeetingInvitationEmail.js
import * as React from 'react';
import { Html, Head, Body, Container, Heading, Text, Link, Button } from '@react-email/components';

export function MeetingInvitationEmail({ candidateName, jobTitle, hrName, companyName }) {
  // In a real app, you'd generate a unique scheduling link (e.g., Calendly)
  const schedulingLink = "https://calendly.com/your-company-link";

  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          <Heading style={heading}>Invitation to Interview for {jobTitle}</Heading>
          <Text style={paragraph}>Dear {candidateName},</Text>
          <Text style={paragraph}>
            Thank you for your interest in the {jobTitle} position at {companyName}.
            After reviewing your application, we are very impressed with your background and would like to
            invite you to an interview to discuss your experience and the role in more detail.
          </Text>
          <Text style={paragraph}>
            Please use the link below to select a time that is convenient for you.
          </Text>
          <Button style={button} href={schedulingLink}>
            Schedule Your Interview
          </Button>
          <Text style={paragraph}>
            We look forward to speaking with you soon.
          </Text>
          <Text style={paragraph}>
            Best regards,
            <br />
            {hrName}
            <br />
            The {companyName} Hiring Team
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

// Styles
const main = { backgroundColor: '#f6f9fc', fontFamily: 'Arial, sans-serif' };
const container = { margin: '0 auto', padding: '20px 0 48px', width: '580px' };
const heading = { fontSize: '24px', lineHeight: '1.3', fontWeight: '700', color: '#484848' };
const paragraph = { fontSize: '16px', lineHeight: '1.4', color: '#484848' };
const button = { backgroundColor: '#007bff', color: '#ffffff', padding: '12px 20px', borderRadius: '5px', textDecoration: 'none', textAlign: 'center', display: 'inline-block' };