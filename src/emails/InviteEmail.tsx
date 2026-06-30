import { Body, Button, Container, Head, Heading, Hr, Html, Preview, Section, Text } from "@react-email/components";

interface InviteEmailProps {
    inviterName: string;
    workspaceName: string;
    joinUrl: string;
}

export function InviteEmail({ inviterName, workspaceName, joinUrl }: InviteEmailProps) {
    return (
        <Html>
            <Head />
            <Preview>
                {inviterName} invited you to join {workspaceName} on Taska
            </Preview>
            <Body style={main}>
                <Container style={container}>
                    {/* Logo / App name */}
                    <Heading style={logo}>Taska</Heading>

                    <Heading style={h1}>You have been invited</Heading>

                    <Text style={text}>
                        <strong>{inviterName}</strong> has invited you to join the <strong>{workspaceName}</strong>{" "}
                        workspace on Taska.
                    </Text>

                    <Text style={text}>
                        Click the button below to accept the invitation and start collaborating with your team.
                    </Text>

                    <Section style={buttonContainer}>
                        <Button style={button} href={joinUrl}>
                            Accept invitation
                        </Button>
                    </Section>

                    <Hr style={hr} />

                    <Text style={footer}>
                        If you did not expect this invitation you can ignore this email. The link expires in 7 days.
                    </Text>

                    <Text style={footer}>Or copy this link: {joinUrl}</Text>
                </Container>
            </Body>
        </Html>
    );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const main = {
    backgroundColor: "#f6f9fc",
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
};

const container = {
    backgroundColor: "#ffffff",
    margin: "0 auto",
    padding: "40px 32px",
    borderRadius: "8px",
    maxWidth: "560px",
    marginTop: "40px",
    marginBottom: "40px",
};

const logo = {
    fontSize: "24px",
    fontWeight: "700",
    color: "#6d28d9",
    marginBottom: "24px",
};

const h1 = {
    fontSize: "22px",
    fontWeight: "600",
    color: "#1a1a1a",
    marginBottom: "16px",
};

const text = {
    fontSize: "15px",
    color: "#444",
    lineHeight: "1.6",
    marginBottom: "16px",
};

const buttonContainer = {
    textAlign: "center" as const,
    marginTop: "24px",
    marginBottom: "24px",
};

const button = {
    backgroundColor: "#6d28d9",
    color: "#fff",
    padding: "12px 28px",
    borderRadius: "6px",
    fontSize: "15px",
    fontWeight: "600",
    textDecoration: "none",
    display: "inline-block",
};

const hr = {
    borderColor: "#e6ebf1",
    margin: "28px 0",
};

const footer = {
    fontSize: "12px",
    color: "#999",
    lineHeight: "1.5",
};
