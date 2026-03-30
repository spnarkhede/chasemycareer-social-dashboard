// app/(emails)/verify-email/template.tsx
import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Button,
  Hr,
  Link,
} from "@react-email/components";

interface EmailVerificationTemplateProps {
  userName: string;
  verificationUrl: string;
  expiresAt: Date;
}

export function EmailVerificationTemplate({
  userName,
  verificationUrl,
  expiresAt,
}: EmailVerificationTemplateProps) {
  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Text style={logo}>CMC</Text>
            <Text style={title}>Verify Your Email</Text>
          </Section>

          <Section style={body}>
            <Text style={greeting}>Hi {userName},</Text>
            <Text style={text}>
              Welcome to Chase My Career! Please verify your email address to 
              complete your registration and unlock all features.
            </Text>

            <Button style={button} href={verificationUrl}>
              Verify Email Address
            </Button>

            <Text style={text}>
              Or copy and paste this link into your browser:
            </Text>
            <Link style={link} href={verificationUrl}>
              {verificationUrl}
            </Link>

            <Hr style={hr} />

            <Text style={footer}>
              This link expires on {expiresAt.toLocaleDateString()} at{" "}
              {expiresAt.toLocaleTimeString()}.
            </Text>

            <Text style={footer}>
              If you didn't create an account, you can safely ignore this email.
            </Text>
          </Section>

          <Section style={footerSection}>
            <Text style={footerText}>
              © {new Date().getFullYear()} Chase My Career. All rights reserved.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

const main = {
  backgroundColor: "#0f172a",
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif',
  padding: "40px 0",
};

const container = {
  backgroundColor: "#1e293b",
  margin: "0 auto",
  padding: "40px",
  borderRadius: "12px",
  border: "1px solid #334155",
  maxWidth: "600px",
};

const header = {
  textAlign: "center" as const,
  marginBottom: "32px",
};

const logo = {
  fontSize: "32px",
  fontWeight: "bold",
  color: "#3b82f6",
  marginBottom: "16px",
};

const title = {
  fontSize: "24px",
  fontWeight: "bold",
  color: "#ffffff",
  margin: "0",
};

const body = {
  marginBottom: "32px",
};

const greeting = {
  fontSize: "18px",
  fontWeight: "600",
  color: "#ffffff",
  marginBottom: "16px",
};

const text = {
  fontSize: "16px",
  lineHeight: "1.6",
  color: "#94a3b8",
  marginBottom: "16px",
};

const button = {
  backgroundColor: "#3b82f6",
  borderRadius: "8px",
  color: "#ffffff",
  fontSize: "16px",
  fontWeight: "600",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "block",
  padding: "14px 32px",
  margin: "24px 0",
};

const link = {
  color: "#3b82f6",
  fontSize: "14px",
  wordBreak: "break-all" as const,
};

const hr = {
  borderColor: "#334155",
  margin: "32px 0",
};

const footerSection = {
  textAlign: "center" as const,
  paddingTop: "24px",
  borderTop: "1px solid #334155",
};

const footerText = {
  fontSize: "14px",
  color: "#64748b",
  margin: "0",
};

export default EmailVerificationTemplate;