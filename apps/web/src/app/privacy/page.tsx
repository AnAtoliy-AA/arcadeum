"use client";

import { appConfig } from "@/shared/config/app-config";
import { routes } from "@/shared/config/routes";
import { useLanguage, formatMessage } from "@/app/i18n/LanguageProvider";
import {
  Page,
  Wrapper,
  Header,
  Title,
  LastUpdated,
  Section,
  SectionTitle,
  Paragraph,
  List,
  ListItem,
  ContactLink,
} from "@/shared/ui/legal-styles";

const APP_NAME = appConfig.appName;
const PRIVACY_EMAIL = process.env.NEXT_PUBLIC_PRIVACY_EMAIL ?? "arcadeum.care@gmail.com";

export default function PrivacyPage() {
  const { messages } = useLanguage();
  const t = messages.legal?.privacy;
  const s = t?.sections;

  return (
    <Page>
      <Wrapper>
        <Header>
          <Title>{t?.title}</Title>
          <LastUpdated>{t?.lastUpdated}</LastUpdated>
        </Header>

        <Section>
          <SectionTitle>{s?.introduction?.title}</SectionTitle>
          <Paragraph>
            {formatMessage(s?.introduction?.content, { appName: APP_NAME })}
          </Paragraph>
        </Section>

        <Section>
          <SectionTitle>{s?.dataCollection?.title}</SectionTitle>
          <Paragraph>{s?.dataCollection?.intro}</Paragraph>
          <List>
            <ListItem><strong>{s?.dataCollection?.items?.account}</strong></ListItem>
            <ListItem><strong>{s?.dataCollection?.items?.payment}</strong></ListItem>
            <ListItem><strong>{s?.dataCollection?.items?.usage}</strong></ListItem>
            <ListItem><strong>{s?.dataCollection?.items?.device}</strong></ListItem>
            <ListItem><strong>{s?.dataCollection?.items?.communications}</strong></ListItem>
          </List>
        </Section>

        <Section>
          <SectionTitle>{s?.dataUsage?.title}</SectionTitle>
          <Paragraph>{s?.dataUsage?.intro}</Paragraph>
          <List>
            {s?.dataUsage?.items?.map((item, index) => (
              <ListItem key={index}>{item}</ListItem>
            ))}
          </List>
        </Section>

        <Section>
          <SectionTitle>{s?.dataSharing?.title}</SectionTitle>
          <Paragraph>{s?.dataSharing?.intro}</Paragraph>
          <List>
            <ListItem><strong>{s?.dataSharing?.items?.serviceProviders}</strong></ListItem>
            <ListItem><strong>{s?.dataSharing?.items?.legal}</strong></ListItem>
            <ListItem><strong>{s?.dataSharing?.items?.businessTransfers}</strong></ListItem>
          </List>
        </Section>

        <Section>
          <SectionTitle>{s?.dataSecurity?.title}</SectionTitle>
          <Paragraph>{s?.dataSecurity?.content}</Paragraph>
        </Section>

        <Section>
          <SectionTitle>{s?.dataRetention?.title}</SectionTitle>
          <Paragraph>{s?.dataRetention?.content}</Paragraph>
        </Section>

        <Section>
          <SectionTitle>{s?.userRights?.title}</SectionTitle>
          <Paragraph>{s?.userRights?.intro}</Paragraph>
          <List>
            <ListItem><strong>{s?.userRights?.items?.access}</strong></ListItem>
            <ListItem><strong>{s?.userRights?.items?.correction}</strong></ListItem>
            <ListItem><strong>{s?.userRights?.items?.deletion}</strong></ListItem>
            <ListItem><strong>{s?.userRights?.items?.portability}</strong></ListItem>
            <ListItem><strong>{s?.userRights?.items?.objection}</strong></ListItem>
          </List>
          <Paragraph>
            {s?.userRights?.contact} <ContactLink href={routes.contact}>{messages.legal?.contact?.title}</ContactLink>.
          </Paragraph>
        </Section>

        <Section>
          <SectionTitle>{s?.cookies?.title}</SectionTitle>
          <Paragraph>{s?.cookies?.content}</Paragraph>
        </Section>

        <Section>
          <SectionTitle>{s?.children?.title}</SectionTitle>
          <Paragraph>{s?.children?.content}</Paragraph>
        </Section>

        <Section>
          <SectionTitle>{s?.internationalTransfers?.title}</SectionTitle>
          <Paragraph>{s?.internationalTransfers?.content}</Paragraph>
        </Section>

        <Section>
          <SectionTitle>{s?.policyChanges?.title}</SectionTitle>
          <Paragraph>{s?.policyChanges?.content}</Paragraph>
        </Section>

        <Section>
          <SectionTitle>{s?.contact?.title}</SectionTitle>
          <Paragraph>
            {formatMessage(s?.contact?.content, { email: PRIVACY_EMAIL })}
          </Paragraph>
        </Section>
      </Wrapper>
    </Page>
  );
}
