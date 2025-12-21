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
const LEGAL_NAME = process.env.NEXT_PUBLIC_LEGAL_NAME ?? "Individual Entrepreneur Anatoliy Aliaksandrau";
const ID_CODE = process.env.NEXT_PUBLIC_ID_CODE ?? "";
const SUPPORT_EMAIL = process.env.NEXT_PUBLIC_SUPPORT_EMAIL ?? "support@arcadeum.app";
const WORKING_HOURS = process.env.NEXT_PUBLIC_WORKING_HOURS ?? "Monday – Friday, 10:00 – 18:00 (GMT+4)";

export default function TermsPage() {
  const { messages } = useLanguage();
  const t = messages.legal?.terms;
  const s = t?.sections;

  return (
    <Page>
      <Wrapper>
        <Header>
          <Title>{t?.title}</Title>
          <LastUpdated>{t?.lastUpdated}</LastUpdated>
        </Header>

        <Section>
          <SectionTitle>{s?.agreement?.title}</SectionTitle>
          <Paragraph>
            {formatMessage(s?.agreement?.content, { appName: APP_NAME })}
          </Paragraph>
        </Section>

        <Section>
          <SectionTitle>{s?.companyInfo?.title}</SectionTitle>
          <Paragraph>
            <strong>{s?.companyInfo?.companyName}</strong> {APP_NAME}<br />
            <strong>{s?.companyInfo?.legalName}</strong> {LEGAL_NAME}<br />
            <strong>{s?.companyInfo?.idCode}</strong> {ID_CODE}<br />
            <strong>{s?.companyInfo?.contactEmail}</strong> {SUPPORT_EMAIL}<br />
            <strong>{s?.companyInfo?.workingHours}</strong> {WORKING_HOURS}
          </Paragraph>
        </Section>

        <Section>
          <SectionTitle>{s?.services?.title}</SectionTitle>
          <Paragraph>
            {formatMessage(s?.services?.intro, { appName: APP_NAME })}
          </Paragraph>
          <List>
            {s?.services?.items?.map((item, index) => (
              <ListItem key={index}>{item}</ListItem>
            ))}
          </List>
        </Section>

        <Section>
          <SectionTitle>{s?.accounts?.title}</SectionTitle>
          <Paragraph>
            {formatMessage(s?.accounts?.intro, { appName: APP_NAME })}
          </Paragraph>
          <List>
            {s?.accounts?.items?.map((item, index) => (
              <ListItem key={index}>{item}</ListItem>
            ))}
          </List>
        </Section>

        <Section>
          <SectionTitle>{s?.delivery?.title}</SectionTitle>
          <Paragraph>
            {formatMessage(s?.delivery?.content, { appName: APP_NAME })}
          </Paragraph>
        </Section>

        <Section>
          <SectionTitle>{s?.payment?.title}</SectionTitle>
          <Paragraph>{s?.payment?.content}</Paragraph>
        </Section>

        <Section>
          <SectionTitle>{s?.refund?.title}</SectionTitle>
          <Paragraph>{s?.refund?.intro}</Paragraph>
          <List>
            <ListItem><strong>{s?.refund?.items?.virtualCurrency}</strong></ListItem>
            <ListItem><strong>{s?.refund?.items?.subscriptions}</strong></ListItem>
            <ListItem><strong>{s?.refund?.items?.technicalIssues}</strong></ListItem>
            <ListItem><strong>{s?.refund?.items?.processingTime}</strong></ListItem>
          </List>
          <Paragraph>
            {s?.refund?.contact} <ContactLink href={routes.contact}>{messages.legal?.contact?.title}</ContactLink>.
          </Paragraph>
        </Section>

        <Section>
          <SectionTitle>{s?.acceptableUse?.title}</SectionTitle>
          <Paragraph>{s?.acceptableUse?.intro}</Paragraph>
          <List>
            {s?.acceptableUse?.items?.map((item, index) => (
              <ListItem key={index}>{item}</ListItem>
            ))}
          </List>
        </Section>

        <Section>
          <SectionTitle>{s?.intellectualProperty?.title}</SectionTitle>
          <Paragraph>
            {formatMessage(s?.intellectualProperty?.content, { appName: APP_NAME })}
          </Paragraph>
        </Section>

        <Section>
          <SectionTitle>{s?.liability?.title}</SectionTitle>
          <Paragraph>
            {formatMessage(s?.liability?.content, { appName: APP_NAME })}
          </Paragraph>
        </Section>

        <Section>
          <SectionTitle>{s?.governingLaw?.title}</SectionTitle>
          <Paragraph>{s?.governingLaw?.content}</Paragraph>
        </Section>

        <Section>
          <SectionTitle>{s?.contact?.title}</SectionTitle>
          <Paragraph>
            {formatMessage(s?.contact?.content, { email: SUPPORT_EMAIL })}
          </Paragraph>
        </Section>
      </Wrapper>
    </Page>
  );
}
