// components/emails/MeetingInvitationEmail.js
import * as React from 'react';
import { Html, Head, Body, Container, Heading, Text, Button, Img, Section, Link } from '@react-email/components';

export function MeetingInvitationEmail({ candidateName, jobTitle, hrName, companyName, schedulingLink }) {
  const previewText = `Interview Invitation for ${jobTitle} at ${companyName}`;

  if (!schedulingLink) {
    return (
        <Html>
            <Head />
            <Body style={main}>
                <Container style={container}>
                    <Text>Error: Scheduling link is missing for this recruiter.</Text>
                </Container>
            </Body>
        </Html>
    );
  }

  return (
    <Html>
      <Head>
        <title>Interview Invitation - {jobTitle}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>
      <Body style={main}>
        <Container style={container}>
          {/* Header with Logo */}
          <Section style={header}>
            <Img
              src="https://example.com/your-company-logo.png" // **IMPORTANT: Replace with your actual logo URL**
              width="160"
              height="auto"
              alt={`${companyName} Logo`}
              style={logo}
            />
          </Section>

          {/* Main Content */}
          <Section style={contentContainer}>
            <Heading style={heading}>Invitation to Interview for {jobTitle}</Heading>
            <Text style={paragraph}>Dear {candidateName},</Text>
            <Text style={paragraph}>
              Thank you for your interest in the <Text style={boldText}>{jobTitle}</Text> position at <Text style={boldText}>{companyName}</Text>.
              After reviewing your application, we are very impressed with your background and would like to
              invite you to an interview to discuss your experience and the role in more detail.
            </Text>
            <Text style={paragraph}>
              Please use the link below to select a time that is convenient for you to connect with our team.
            </Text>

            {/* Call to Action Button */}
            <Section style={buttonContainer}>
              <Button style={button} href={schedulingLink}>
                Schedule Your Interview
              </Button>
            </Section>

            <Text style={paragraph}>
              We look forward to speaking with you soon and discussing how your skills align with our goals.
            </Text>
            <Text style={paragraph}>
              Best regards,
              <br />
              <Text style={boldText}>{hrName}</Text>
              <br />
              The <Text style={boldText}>{companyName}</Text> Hiring Team
            </Text>
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              &copy; {new Date().getFullYear()} {companyName}. All rights reserved.
              <br />
              <Link href="https://yourwebsite.com/privacy" style={footerLink}>Privacy Policy</Link> | <Link href="https://yourwebsite.com/careers" style={footerLink}>Careers</Link>
            </Text>
          </Section>

        </Container>
      </Body>
    </Html>
  );
}

// Email-safe Styles
const main = {
  backgroundColor: '#f8f9fa', // Light background for the entire email
  fontFamily: 'Arial, Helvetica, sans-serif',
  padding: '20px',
  lineHeight: '1.5',
};

const container = {
  margin: '0 auto',
  maxWidth: '620px',
  backgroundColor: '#ffffff',
  borderRadius: '10px',
  overflow: 'hidden',
  boxShadow: '0 6px 20px rgba(0, 0, 0, 0.08)', // More pronounced shadow for a floating effect
};

const header = {
  backgroundColor: '#4A71FF', // A strong brand color for the header
  padding: '25px 30px',
  textAlign: 'center',
};

const logo = {
  maxWidth: '160px',
  height: 'auto',
  display: 'block',
  margin: '0 auto',
};

const contentContainer = {
  padding: '30px',
};

const heading = {
  fontSize: '26px',
  lineHeight: '1.3',
  fontWeight: '700',
  color: '#333333',
  textAlign: 'center',
  marginBottom: '25px',
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
  margin: '30px 0',
};

const button = {
  backgroundColor: '#007bff', // Your primary action color
  color: '#ffffff',
  padding: '14px 28px',
  borderRadius: '6px',
  textDecoration: 'none',
  fontSize: '17px',
  fontWeight: 'bold',
  display: 'inline-block', // Essential for button rendering
  boxShadow: '0 4px 10px rgba(0, 123, 255, 0.2)', // Subtle shadow for the button
};

const footer = {
  backgroundColor: '#f0f4f7', // A lighter gray for the footer
  padding: '20px 30px',
  textAlign: 'center',
  fontSize: '12px',
  color: '#888888',
  borderTop: '1px solid #e0e0e0', // A subtle border at the top of the footer
};

const footerText = {
    margin: '0',
    lineHeight: '1.6',
};

const footerLink = {
  color: '#888888',
  textDecoration: 'underline',
};