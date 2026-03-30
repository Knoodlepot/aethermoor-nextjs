'use client';

import React, { useState } from 'react';

type Tab = 'terms' | 'privacy' | 'cookies' | 'refund';

const sec: React.CSSProperties = {
  background: '#13100a',
  border: '1px solid #2e2010',
  padding: '24px 28px',
  marginBottom: 12,
};
const h2s: React.CSSProperties = {
  color: '#f0c060',
  fontFamily: '"Cinzel", Georgia, serif',
  letterSpacing: 1,
  marginTop: 0,
};
const h3s: React.CSSProperties = {
  color: '#c4873a',
  fontFamily: '"Cinzel", Georgia, serif',
  fontSize: '0.95rem',
  letterSpacing: 0.5,
  borderBottom: '1px solid #2e2010',
  paddingBottom: 5,
  marginTop: 28,
};
const h4s: React.CSSProperties = {
  color: '#d4b896',
  fontSize: '0.88rem',
  marginBottom: 3,
  marginTop: 16,
  textDecoration: 'underline',
  textDecorationColor: '#2e2010',
  textUnderlineOffset: 3,
};
const linkStyle: React.CSSProperties = { color: '#f0c060' };
const note: React.CSSProperties = { color: '#8a6f4b', fontSize: 13, marginTop: 24 };

function TermsContent() {
  return (
    <section style={sec}>
      <h2 style={h2s}>Terms of Service</h2>
      <p style={{ color: '#8a6f4b', fontSize: 13, marginTop: 0 }}>
        Last updated: 2026-03-30 · Operator: Knoodlepot Studio (UK-based independent developer)
      </p>

      <p>By accessing or using Aethermoor you agree to these Terms of Service in full. If you do not agree, do not use the service. These terms apply worldwide; jurisdiction-specific provisions are listed below and take precedence where required by local law.</p>

      <h3 style={h3s}>1. Eligibility</h3>
      <p>Aethermoor is intended for players aged 18 and over. By using the service you confirm you meet the minimum age requirement. We do not knowingly permit users under 18 to create accounts or make purchases. Where local law sets a higher age of digital consent, that higher age applies. Accounts belonging to underage users will be terminated and any purchases refunded where legally required.</p>

      <h3 style={h3s}>2. Account Registration & Security</h3>
      <p>You are responsible for maintaining the confidentiality of your account credentials and for all activity that occurs under your account. You may not share, sell, or transfer accounts. We reserve the right to suspend or permanently terminate accounts that violate these terms, engage in fraud, exploit game systems, or are inactive for an extended period. You will be given reasonable notice before termination except where immediate action is required for security or legal reasons.</p>

      <h3 style={h3s}>3. Virtual Currency & In-Game Tokens</h3>
      <p>Aethermoor offers purchasable in-game tokens ("Aether Tokens"). These tokens have no real-world monetary value, are not redeemable for cash or other goods outside the game, and are non-transferable between accounts. Token balances, pricing, and availability may be adjusted at any time for operational, balance, or compliance reasons. In the event of service discontinuation we will handle outstanding token balances in accordance with applicable consumer law in your jurisdiction.</p>

      <h3 style={h3s}>4. Acceptable Use</h3>
      <p>You agree not to: use the service for fraudulent or illegal purposes; attempt to reverse-engineer, hack, or exploit game systems; harass, threaten, or abuse other users or staff through any in-game or community channel; use automated bots, scripts, or third-party tools to gain unfair advantage; impersonate other users, staff, or Aethermoor; or upload, transmit, or share content that is unlawful, harmful, or infringes third-party rights. Violations may result in account suspension, termination, or referral to law enforcement.</p>

      <h3 style={h3s}>5. Intellectual Property</h3>
      <p>All content within Aethermoor — including text, artwork, game mechanics, lore, music, and software — is owned by or licensed to the operator. You are granted a limited, non-exclusive, non-transferable, revocable licence to access and play the game for personal, non-commercial use only. You may not reproduce, distribute, publicly perform, or create derivative works from any part of the service without prior written consent.</p>

      <h3 style={h3s}>6. User-Generated Content</h3>
      <p>Where the service permits you to submit content (e.g. character names, community posts), you grant us a worldwide, royalty-free licence to use, host, and display that content in connection with the service. You retain ownership of your content and confirm it does not infringe any third-party rights or violate applicable law.</p>

      <h3 style={h3s}>7. Service Availability & Changes</h3>
      <p>We make no guarantee of uninterrupted or error-free service. We reserve the right to modify, suspend, or discontinue any feature at any time. Where possible we will provide advance notice of significant changes. We will not be liable for any loss resulting from service interruptions caused by events outside our reasonable control (force majeure).</p>

      <h3 style={h3s}>8. Limitation of Liability</h3>
      <p>To the maximum extent permitted by applicable law, the operator shall not be liable for indirect, incidental, special, or consequential damages arising from your use of the service. Our total aggregate liability for any claim shall not exceed the greater of (a) the amount you paid in the 12 months preceding the claim or (b) £50 GBP. Nothing in these terms excludes or limits liability for death or personal injury caused by negligence, fraud, or fraudulent misrepresentation, or any other liability that cannot be excluded by law.</p>

      <h3 style={h3s}>9. Governing Law & Dispute Resolution</h3>
      <p>These terms are governed by the laws of England and Wales. Any disputes shall be subject to the exclusive jurisdiction of the courts of England and Wales, except where mandatory consumer law in your country of residence requires otherwise. We encourage you to contact us first to resolve any dispute informally before initiating formal proceedings.</p>

      <h3 style={h3s}>Jurisdiction-Specific Provisions</h3>

      <h4 style={h4s}>United Kingdom</h4>
      <p>Under the <strong>Consumer Rights Act 2015</strong>, UK consumers have statutory rights regarding digital content including that it is of satisfactory quality, fit for purpose, and as described. These rights are in addition to any commercial remedies we offer and cannot be waived by contract. The <strong>Consumer Contracts (Information, Cancellation and Additional Charges) Regulations 2013</strong> apply to online purchases — see the Refund Policy for details. We comply with applicable duties under the <strong>Online Safety Act 2023</strong>. The <strong>Equality Act 2010</strong> applies and we do not discriminate on protected characteristics. You may seek free dispute resolution through the courts or an Alternative Dispute Resolution (ADR) provider.</p>

      <h4 style={h4s}>European Union</h4>
      <p>If you reside in the European Economic Area (EEA), you benefit from mandatory consumer protection laws that cannot be excluded by contract. Your rights under the <strong>EU Consumer Rights Directive (2011/83/EU)</strong> and the <strong>Digital Content Directive (2019/770/EU)</strong> regarding quality and conformity of digital content apply in full. The <strong>Digital Services Act (DSA, Regulation (EU) 2022/2065)</strong> applies where applicable. Dispute resolution is available via your national consumer authority or the EU Online Dispute Resolution (ODR) platform at <strong>ec.europa.eu/consumers/odr</strong>.</p>

      <h4 style={h4s}>United States</h4>
      <p>We comply with the <strong>Children's Online Privacy Protection Act (COPPA)</strong> — the service is not directed at children under 13 and we do not knowingly collect their data. Use of the service in violation of the <strong>Computer Fraud and Abuse Act (CFAA)</strong> or equivalent state law is strictly prohibited. <strong>California residents</strong>: your rights under the <strong>California Consumer Privacy Act (CCPA/CPRA)</strong> and the <strong>California Consumer Legal Remedies Act (CLRA)</strong> are preserved. Other US state consumer protection laws (including those in New York, Texas, Florida, and Washington) apply where applicable. Some states do not allow certain exclusions of implied warranties or limitations of liability; in those states our liability is limited to the fullest extent permitted by law.</p>

      <h4 style={h4s}>Canada</h4>
      <p>Consumer protection laws vary by province and may provide rights beyond these terms. In <strong>Quebec</strong>, the <strong>Consumer Protection Act (LPCQ)</strong> applies and imposes specific obligations for online contracts. The <strong>Canada Anti-Spam Legislation (CASL)</strong> governs any commercial electronic messages we send — you may unsubscribe at any time. We comply with <strong>PIPEDA</strong> and applicable provincial private-sector privacy legislation including <strong>Quebec's Law 25</strong> (Act 25).</p>

      <h4 style={h4s}>Australia & New Zealand</h4>
      <p><strong>Australia</strong>: The <strong>Australian Consumer Law (ACL, Schedule 2 of the Competition and Consumer Act 2010)</strong> applies. You have statutory consumer guarantees that cannot be excluded, restricted, or modified. Unfair contract terms protections under the ACL also apply. Our liability for breach of a consumer guarantee is limited as permitted by s.64A of the ACL where applicable. <strong>New Zealand</strong>: The <strong>Consumer Guarantees Act 1993</strong> and <strong>Fair Trading Act 1986</strong> apply and grant statutory guarantees regarding services being fit for purpose and of acceptable quality.</p>

      <h4 style={h4s}>Brazil & Latin America</h4>
      <p><strong>Brazil</strong>: The <strong>Consumer Defence Code (CDC, Law 8.078/1990)</strong> and the <strong>Marco Civil da Internet (Law 12.965/2014)</strong> apply. Where these laws grant rights that conflict with these terms, applicable law prevails. Disputes may be referred to <strong>PROCON</strong> or submitted via Consumidor.gov.br. <strong>Argentina</strong>: <strong>Law 24.240</strong> (Consumer Defence Law) grants equivalent protections. <strong>Mexico</strong>: The <strong>Ley Federal de Protección al Consumidor (PROFECO)</strong> applies. In all other Latin American jurisdictions, applicable local consumer protection legislation takes precedence over these terms where required by law.</p>

      <h4 style={h4s}>Asia-Pacific</h4>
      <p><strong>Japan</strong>: Subject to the <strong>Act on Specified Commercial Transactions</strong> and the <strong>Consumer Contract Act</strong> where applicable. <strong>South Korea</strong>: The <strong>Act on Consumer Protection in Electronic Commerce</strong> may grant additional rights regarding online purchases. <strong>China</strong>: Users in the People's Republic of China are subject to the <strong>Cybersecurity Law</strong>, <strong>Data Security Law</strong>, and <strong>Personal Information Protection Law (PIPL)</strong>; local gaming regulations also apply. <strong>Singapore</strong>: The <strong>Consumer Protection (Fair Trading) Act (CPFTA)</strong> applies. <strong>India</strong>: The <strong>Consumer Protection Act 2019</strong> and <strong>Information Technology Act 2000</strong> (as amended) apply. <strong>Thailand</strong>: The <strong>Consumer Protection Act</strong> and <strong>PDPA</strong> apply. We comply with applicable e-commerce and consumer protection law throughout the APAC region including Malaysia, Philippines, Indonesia, and Vietnam.</p>

      <h4 style={h4s}>Africa</h4>
      <p><strong>South Africa</strong>: The <strong>Electronic Communications and Transactions Act 25 of 2002 (ECT Act)</strong> and <strong>Consumer Protection Act 68 of 2008 (CPA)</strong> apply. Section 56 of the CPA provides an implied warranty of quality. The <strong>Protection of Personal Information Act (POPIA)</strong> governs data processing. <strong>Kenya</strong>: The <strong>Consumer Protection Act 2012</strong> and <strong>Data Protection Act 2019</strong> apply. <strong>Nigeria</strong>: The <strong>Federal Competition and Consumer Protection Act (FCCPA) 2018</strong> and <strong>Nigeria Data Protection Act 2023 (NDPA)</strong> apply. <strong>Ghana</strong>: The <strong>Consumer Protection Agency Act 2022</strong> applies. In all other African jurisdictions, applicable local consumer protection and data protection legislation takes precedence where required by law.</p>

      <p style={note}>These Terms of Service are provided in good faith. For legal advice specific to your situation, consult a qualified legal professional in your jurisdiction.</p>
    </section>
  );
}

function PrivacyContent() {
  return (
    <section style={sec}>
      <h2 style={h2s}>Privacy Policy</h2>
      <p style={{ color: '#8a6f4b', fontSize: 13, marginTop: 0 }}>
        Last updated: 2026-03-30 · Data Controller: Knoodlepot Studio (UK-based independent developer)
      </p>

      <p>This Privacy Policy explains how we collect, use, store, and share personal data when you use Aethermoor. We are committed to protecting your privacy and complying with applicable data protection laws worldwide.</p>

      <h3 style={h3s}>1. Who We Are</h3>
      <p>Aethermoor is operated by <strong>Knoodlepot Studio</strong>, an independent developer based in the United Kingdom. For the purposes of UK data protection law, we are the <strong>data controller</strong>.<br /><br />
      <strong>Registered address:</strong> [POSTAL_ADDRESS — add once PO Box is set up]<br />
      <strong>Contact email:</strong> <a href="mailto:support.aethermoor@gmail.com" style={linkStyle}>support.aethermoor@gmail.com</a><br /><br />
      For all privacy matters — including Subject Access Requests, deletion requests, and complaints — contact us at the email address above.</p>

      <h3 style={h3s}>2. What Data We Collect</h3>
      <p><strong>Account data:</strong> Email address, username, and hashed password when you register an account.<br />
      <strong>Game data:</strong> Save game state, character progression, inventory, quest status, session logs, and in-game choices — collected to provide and persist your game experience.<br />
      <strong>Technical data:</strong> Browser type, approximate IP address (retained briefly for rate limiting and fraud prevention), and session authentication tokens.<br />
      <strong>Payment data:</strong> We do not store payment card details. All payment processing is handled by third-party providers (e.g. Stripe) who are independently responsible for PCI-DSS compliance and their own data practices.<br />
      <strong>Support communications:</strong> Any messages you send to our support email.<br />
      <strong>Consent records:</strong> Records of any consents you have given or withdrawn.</p>

      <h3 style={h3s}>3. How We Use Your Data</h3>
      <p>We process personal data only for the following purposes:<br />
      — Providing, maintaining, and improving the game service (legal basis: <em>performance of contract</em>)<br />
      — Authentication and account security (legal basis: <em>legitimate interests / contract</em>)<br />
      — Fraud prevention and abuse detection (legal basis: <em>legitimate interests</em>)<br />
      — Compliance with legal obligations including tax, regulatory reporting, and law enforcement requests (legal basis: <em>legal obligation</em>)<br />
      — Service-critical communications such as account verification and security alerts (legal basis: <em>contract / legitimate interests</em>)<br />
      — Marketing and promotional communications — <strong>only with your explicit opt-in consent</strong>, which you may withdraw at any time</p>

      <h3 style={h3s}>4. Third-Party Data Processors</h3>
      <p>We use the following categories of third-party processors, all subject to appropriate data processing agreements:<br />
      — <strong>Cloud hosting</strong> (Vercel, Railway PostgreSQL) for service delivery and database storage<br />
      — <strong>Payment processing</strong> (third-party provider) for purchase transactions<br />
      — <strong>AI API</strong> (Anthropic) for narrator functionality — only anonymised in-session game context is sent; no personal identifiers are transmitted<br />
      — <strong>Email delivery</strong> (Resend) for account and service emails<br />
      — <strong>Error monitoring</strong> tools for service reliability</p>
      <p>We do <strong>not</strong> sell, rent, or trade your personal data to any third party for marketing or advertising purposes.</p>

      <h3 style={h3s}>5. Data Retention</h3>
      <p>Account and game data is retained for as long as your account is active, plus a reasonable period thereafter for legal compliance, dispute resolution, and financial record-keeping obligations. You may request deletion of your account and associated data at any time; we will fulfil verified requests within the timeframes required by applicable law. Certain data may be retained longer where required by law (e.g. financial transaction records).</p>

      <h3 style={h3s}>6. International Data Transfers</h3>
      <p>Our infrastructure is hosted on services based in the United States and European Union. When personal data is transferred outside the UK or EEA, we ensure appropriate safeguards are in place — including Standard Contractual Clauses (SCCs) approved by the UK ICO and/or the European Commission, or reliance on adequacy decisions. For transfers outside these regions, we apply equivalent measures as required by applicable law.</p>

      <h3 style={h3s}>7. Cookies & Local Storage</h3>
      <p>We use browser <strong>local storage</strong> to save your game progress, theme preference, and cookie consent choice on your device — this is functionally necessary and does not track you across websites. <strong>Session cookies</strong> are used strictly for authentication and are deleted when you log out or your session expires.<br /><br />
      We use <strong>PostHog</strong> for anonymous usage analytics — this is only activated if you explicitly accept analytics cookies via the cookie consent banner shown when you first visit. You can withdraw this consent at any time by clearing your browser's local storage for this site. We do not use advertising or cross-site tracking cookies. See the <strong>Cookie Policy</strong> tab for full details.</p>

      <h3 style={h3s}>8. Security</h3>
      <p>We implement appropriate technical and organisational measures to protect your personal data against unauthorised access, loss, disclosure, alteration, or destruction. Passwords are stored as hashed values and never in plain text. Despite these measures, no transmission over the internet is completely secure; you provide data at your own risk and we encourage the use of strong, unique passwords.</p>

      <h3 style={h3s}>9. Your Rights — Overview</h3>
      <p>Regardless of where you live, you may contact us at any time to exercise the following rights (subject to applicable law):<br />
      — <strong>Access:</strong> Obtain a copy of the personal data we hold about you<br />
      — <strong>Rectification:</strong> Request correction of inaccurate or incomplete data<br />
      — <strong>Erasure:</strong> Request deletion of your personal data ("right to be forgotten")<br />
      — <strong>Restriction:</strong> Ask us to limit how we process your data in certain circumstances<br />
      — <strong>Portability:</strong> Receive your data in a structured, machine-readable format<br />
      — <strong>Objection:</strong> Object to processing based on legitimate interests or for direct marketing<br />
      — <strong>Withdraw consent:</strong> Withdraw any consent you have given at any time, without affecting the lawfulness of prior processing<br />
      — <strong>Complaint:</strong> Lodge a complaint with your local data protection authority</p>

      <h3 style={h3s}>Jurisdiction-Specific Rights</h3>

      <h4 style={h4s}>United Kingdom — UK GDPR & Data Protection Act 2018</h4>
      <p>As a UK-based operator we comply fully with <strong>UK GDPR</strong> and the <strong>Data Protection Act 2018 (DPA 2018)</strong>. You have all rights listed above. Subject Access Requests (SARs) will be fulfilled within <strong>one month</strong> of a verified request (extendable by two months for complex requests with notice). You have the right to lodge a complaint with the <strong>Information Commissioner's Office (ICO)</strong>: <strong>ico.org.uk</strong> / 0303 123 1113. We do not carry out solely automated decision-making with significant legal effects without your express consent.</p>

      <h4 style={h4s}>European Union — GDPR (Regulation 2016/679)</h4>
      <p>EU residents have rights under the <strong>General Data Protection Regulation (GDPR)</strong> in full, including all rights listed above. A valid legal basis exists for every processing activity we carry out. Where consent is the legal basis, it is freely given, specific, informed, and unambiguous; you may withdraw it at any time. You may lodge a complaint with your national <strong>Data Protection Authority (DPA)</strong>. We do not knowingly collect data from individuals under 16 (or the lower age of digital consent set by your EU member state). Cross-border transfers comply with Chapter V GDPR requirements.</p>

      <h4 style={h4s}>United States</h4>
      <p><strong>California (CCPA/CPRA):</strong> You have the right to know what personal information is collected and how it is used; the right to delete personal information; the right to opt out of sale or sharing (we do not sell or share personal information for cross-context behavioural advertising); the right to correct inaccurate information; and the right to non-discrimination for exercising these rights. Verified requests receive a response within <strong>45 days</strong> (extendable by a further 45 with notice). Submit requests to <a href="mailto:support.aethermoor@gmail.com" style={linkStyle}>support.aethermoor@gmail.com</a>.<br /><br />
      <strong>Other US state privacy laws:</strong> We honour verified consumer rights requests from residents of any US state with a comprehensive privacy law, including Virginia (CDPA), Colorado (CPA), Connecticut (CTDPA), Texas (TDPSA), Oregon (OCPA), Montana (MCDPA), and others.<br /><br />
      <strong>COPPA:</strong> We do not knowingly collect personal information from children under 13. If you believe a child has provided us with data, contact us immediately for deletion.<br /><br />
      <strong>CAN-SPAM Act:</strong> All commercial emails include a functioning unsubscribe mechanism and comply with CAN-SPAM requirements.</p>

      <h4 style={h4s}>Canada — PIPEDA & Quebec Law 25</h4>
      <p>We comply with the <strong>Personal Information Protection and Electronic Documents Act (PIPEDA)</strong> and applicable provincial legislation. <strong>Quebec residents</strong> have additional rights under <strong>Law 25 (Act respecting the protection of personal information in the private sector)</strong>, including the right to data portability, the right to be informed of and object to automated decision-making, and enhanced rights regarding de-indexation. You may file a complaint with the <strong>Office of the Privacy Commissioner of Canada (OPC)</strong> at priv.gc.ca, or with your provincial privacy commissioner. British Columbia (PIPA) and Alberta (PIPA) residents are governed by substantially similar provincial legislation that we also observe.</p>

      <h4 style={h4s}>Australia — Privacy Act 1988 & APPs</h4>
      <p>We comply with the <strong>Privacy Act 1988</strong> and the 13 <strong>Australian Privacy Principles (APPs)</strong>. You have the right to access and correct personal information we hold about you. If you believe we have breached the APPs, you may first complain to us; if unresolved, you may lodge a complaint with the <strong>Office of the Australian Information Commissioner (OAIC)</strong> at oaic.gov.au. Cross-border disclosures comply with <strong>APP 8</strong> and we ensure overseas recipients uphold comparable privacy standards.</p>

      <h4 style={h4s}>Brazil — LGPD (Law 13.709/2018)</h4>
      <p>Brazilian residents are protected by the <strong>Lei Geral de Proteção de Dados Pessoais (LGPD)</strong>. You have rights to: confirmation of processing, access, correction, anonymisation or deletion of unnecessary data, portability, deletion of consent-based data, information about sharing, and withdrawal of consent. Our legal bases under LGPD include: <em>execução de contrato</em> (contract performance), <em>legítimo interesse</em> (legitimate interests), <em>cumprimento de obrigação legal</em> (legal obligation), and <em>consentimento</em> (consent) where applicable. Complaints may be lodged with the <strong>Autoridade Nacional de Proteção de Dados (ANPD)</strong> at gov.br/anpd.</p>

      <h4 style={h4s}>Asia-Pacific</h4>
      <p><strong>Japan (APPI):</strong> We comply with the <strong>Act on the Protection of Personal Information (APPI)</strong> as amended. You have rights to disclosure, correction, deletion, and suspension of use of retained personal data. Contact us to exercise these rights; the <strong>Personal Information Protection Commission (PPC)</strong> oversees compliance.<br /><br />
      <strong>South Korea (PIPA):</strong> We comply with the <strong>Personal Information Protection Act (PIPA)</strong>. You have rights to access, correction, deletion, and suspension of processing. The <strong>Personal Information Protection Commission (PIPC)</strong> oversees compliance. Certain categories of data require separate consent under PIPA.<br /><br />
      <strong>China (PIPL):</strong> We comply with the <strong>Personal Information Protection Law (PIPL, effective 2021)</strong>, the <strong>Data Security Law</strong>, and the <strong>Cybersecurity Law</strong>. Users in China have rights to access, copy, correct, delete, and transfer personal information. Cross-border data transfers comply with applicable PIPL requirements including security assessments or standard contractual clauses where required. Separate consent is obtained for sensitive personal information.<br /><br />
      <strong>Singapore (PDPA):</strong> We comply with the <strong>Personal Data Protection Act 2012 (PDPA)</strong>. You may access and correct your personal data and withdraw consent at any time. The <strong>Personal Data Protection Commission (PDPC)</strong> handles complaints and oversees compliance.<br /><br />
      <strong>India (DPDP Act 2023):</strong> We comply with the <strong>Digital Personal Data Protection Act 2023</strong>. You have rights to access information about processing, correction, erasure, and grievance redressal. We appoint a grievance officer for Indian users; contact <a href="mailto:support.aethermoor@gmail.com" style={linkStyle}>support.aethermoor@gmail.com</a>.<br /><br />
      <strong>Thailand (PDPA):</strong> We comply with the <strong>Personal Data Protection Act B.E. 2562 (2019)</strong>, which grants rights similar to GDPR including access, rectification, erasure, restriction, portability, and objection.<br /><br />
      <strong>Other APAC jurisdictions:</strong> We observe applicable privacy legislation in New Zealand (Privacy Act 2020), Malaysia (PDPA 2010), Philippines (Data Privacy Act 2012 / Republic Act 10173), Indonesia (Personal Data Protection Law 2022), and Vietnam (Decree 13/2023/ND-CP).</p>

      <h4 style={h4s}>Africa</h4>
      <p><strong>South Africa (POPIA):</strong> We comply with the <strong>Protection of Personal Information Act 4 of 2013 (POPIA)</strong>. You have rights to access, correction, deletion, and objection. We process personal information only on lawful grounds and take reasonable security measures as required under POPIA Condition 7. Complaints may be lodged with the <strong>Information Regulator (South Africa)</strong> at inforegulator.org.za.<br /><br />
      <strong>Kenya (Data Protection Act 2019):</strong> We comply with the <strong>Data Protection Act 2019</strong>. The <strong>Office of the Data Protection Commissioner (ODPC)</strong> oversees compliance. You have rights to access, correction, rectification, and objection.<br /><br />
      <strong>Nigeria (NDPA 2023):</strong> We comply with the <strong>Nigeria Data Protection Act 2023 (NDPA)</strong> and the <strong>Nigeria Data Protection Regulation (NDPR)</strong>. The <strong>Nigeria Data Protection Commission (NDPC)</strong> oversees compliance.<br /><br />
      <strong>Ghana (Data Protection Act 2012):</strong> We comply with <strong>Act 843</strong>. The <strong>Data Protection Commission</strong> oversees compliance.<br /><br />
      <strong>Other African jurisdictions:</strong> We comply with applicable local data protection legislation in all territories where we operate or serve users, including Botswana, Rwanda, Uganda, Senegal, and others with enacted data protection frameworks.</p>

      <h3 style={h3s}>10. Contact & Data Requests</h3>
      <p>For any privacy matter — including Subject Access Requests, deletion requests, corrections, or complaints — please contact us:<br />
      Email: <a href="mailto:support.aethermoor@gmail.com" style={linkStyle}>support.aethermoor@gmail.com</a><br />
      Subject: "Privacy Request — [type of request]"<br />
      We will acknowledge your request promptly and respond within the timeframe required by applicable law (typically 30 days for UK/EU requests; 45 days for California).</p>

      <p style={note}>This Privacy Policy is provided in good faith to explain our data practices. For legal advice specific to your situation, consult a qualified data protection professional or solicitor.</p>
    </section>
  );
}

function RefundContent() {
  return (
    <section style={sec}>
      <h2 style={h2s}>Refund Policy</h2>
      <p style={{ color: '#8a6f4b', fontSize: 13, marginTop: 0 }}>
        Last updated: 2026-03-30 · Operator: Knoodlepot Studio (UK-based independent developer)
      </p>

      <p>This Refund Policy explains your rights when purchasing Aether Tokens. Where applicable law grants you rights beyond those described here, those legal rights take precedence and we will honour them.</p>

      <h3 style={h3s}>1. General Policy</h3>
      <p>Aether Tokens are virtual in-game currency with no real-world monetary value and no cash-redemption value. As a general rule, token purchases are <strong>final and non-refundable</strong> once the tokens have been credited to your account, because digital content is made immediately available to you at the point of purchase. Exceptions and statutory rights are detailed below.</p>

      <h3 style={h3s}>2. When We Will Issue a Refund</h3>
      <p>Regardless of jurisdiction, we will process a full refund if:<br />
      — <strong>Billing error:</strong> You were charged an incorrect amount<br />
      — <strong>Duplicate charge:</strong> You were charged more than once for the same transaction<br />
      — <strong>Failed delivery:</strong> Payment was taken but tokens were not credited to your account within 24 hours<br />
      — <strong>Fraudulent transaction:</strong> Your payment method was used without your authorisation<br />
      — <strong>Service unavailability:</strong> We are permanently unable to provide the service you paid for<br /><br />
      In all other cases, refunds are subject to the statutory rights applicable in your jurisdiction as set out below.</p>

      <h3 style={h3s}>3. How to Request a Refund</h3>
      <p>Contact us at <a href="mailto:support.aethermoor@gmail.com" style={linkStyle}>support.aethermoor@gmail.com</a> with the subject line <strong>"Refund Request"</strong>. Please include: your account username or registered email, the transaction ID from your purchase receipt, the date of purchase, and a description of the issue. We aim to acknowledge requests within 2 business days and resolve them within 10 business days. Refunds are issued via the original payment method where possible.</p>

      <h3 style={h3s}>4. Chargebacks</h3>
      <p>If you initiate a chargeback through your bank or card provider without first contacting us, we reserve the right to suspend your account pending investigation. We will provide full evidence of the transaction to your payment provider and we honour legitimate chargeback outcomes. Frivolous or fraudulent chargebacks may result in permanent account termination.</p>

      <h3 style={h3s}>Jurisdiction-Specific Statutory Rights</h3>

      <h4 style={h4s}>United Kingdom</h4>
      <p>Under the <strong>Consumer Contracts (Information, Cancellation and Additional Charges) Regulations 2013 (UK CCR)</strong>, you normally have a <strong>14-day right to cancel</strong> digital content purchases made online. However, this right is lost if you expressly consent to immediate delivery of the digital content before the 14-day period expires, and acknowledge in writing that you thereby lose your right to cancel. We will request this acknowledgement at checkout. If you do not provide this acknowledgement, your 14-day right to cancel applies and you may receive a full refund within 14 days of cancellation.<br /><br />
      Your statutory rights under the <strong>Consumer Rights Act 2015</strong> are unaffected: if the digital content is not of satisfactory quality, not fit for purpose, or not as described, you are entitled to a repair, replacement, or — where repair/replacement is not possible — a full refund. Contact us to exercise these rights. You may also refer disputes to an <strong>Alternative Dispute Resolution (ADR)</strong> provider or to the <strong>courts of England and Wales</strong>. The statutory limitation period for claims is 6 years.</p>

      <h4 style={h4s}>European Union</h4>
      <p>Under the <strong>EU Consumer Rights Directive (2011/83/EU)</strong> and the <strong>Digital Content Directive (2019/770/EU)</strong>, EU consumers have a <strong>14-day right of withdrawal</strong> from digital content purchases made at a distance. This right may be waived if you expressly request immediate commencement of the service before the 14-day period expires and acknowledge that you thereby lose the right of withdrawal. We will obtain this waiver at checkout in a clear and conspicuous manner.<br /><br />
      If the digital content does not conform to the contract, you have the right to have it brought into conformity (repair or replacement) free of charge, and — where conformity cannot be achieved within a reasonable time or without significant inconvenience — the right to a proportionate price reduction or full refund. These rights apply for a minimum of <strong>two years</strong> from delivery. You may refer disputes to the EU Online Dispute Resolution platform at <strong>ec.europa.eu/consumers/odr</strong> or to your national consumer authority.</p>

      <h4 style={h4s}>United States</h4>
      <p>There is no universal federal statutory cooling-off period for digital purchases in the United States. However, several states and the FTC provide protections:<br /><br />
      <strong>California:</strong> Under the <strong>California Consumer Legal Remedies Act (CLRA)</strong> and <strong>Business and Professions Code §17200</strong>, if a product or service is misrepresented or defective, you may be entitled to a refund or other remedy. We comply with California's automatic subscription renewal law and will provide clear cancellation mechanisms.<br /><br />
      <strong>Other states:</strong> Washington, New York, Illinois, and other states have consumer protection statutes that may provide remedies where goods or services are not as described or are defective.<br /><br />
      <strong>Chargebacks:</strong> You may initiate a chargeback with your card issuer where goods were not as described or not received; we honour legitimate chargeback outcomes.<br /><br />
      <strong>FTC:</strong> You may file a complaint with the <strong>Federal Trade Commission (FTC)</strong> at reportfraud.ftc.gov. Your state Attorney General's office may also provide assistance.</p>

      <h4 style={h4s}>Canada</h4>
      <p>Consumer protection for online purchases varies by province:<br /><br />
      <strong>Quebec:</strong> The <strong>Consumer Protection Act (LPCQ)</strong> governs internet contracts and provides rights regarding unfair practices, contract cancellation, and remedies. Consumers may have the right to cancel and obtain a refund where the contract contains an abusive clause or where the goods are not as described.<br /><br />
      <strong>Ontario:</strong> The <strong>Consumer Protection Act 2002</strong> governs internet agreements and provides rights to cancel where the operator fails to meet its obligations.<br /><br />
      <strong>British Columbia:</strong> The <strong>Business Practices and Consumer Protection Act</strong> applies.<br /><br />
      <strong>Alberta:</strong> The <strong>Fair Trading Act</strong> applies.<br /><br />
      Generally, if digital content is defective or materially different from how it was described, you may be entitled to a remedy. Contact your provincial consumer protection office for assistance if we are unable to resolve your complaint.</p>

      <h4 style={h4s}>Australia</h4>
      <p>Under the <strong>Australian Consumer Law (ACL, Schedule 2 to the Competition and Consumer Act 2010)</strong>, you have statutory consumer guarantees for digital products and services that cannot be excluded by contract:<br /><br />
      — Acceptable quality (fit for all purposes commonly supplied for, free from defects, and acceptable in appearance)<br />
      — Fitness for any disclosed purpose<br />
      — As described<br />
      — Reasonable care and skill (for services)<br /><br />
      For a <strong>major failure</strong> — including where the digital content is so substantially different from what was represented that you would not have purchased it — you are entitled to choose a <strong>full refund</strong> or replacement. For a minor failure you are entitled to a repair, replacement, or refund of the price reduction. Contact the <strong>Australian Competition and Consumer Commission (ACCC)</strong> at accc.gov.au, or your state/territory consumer protection office, if we cannot resolve your complaint.</p>

      <h4 style={h4s}>New Zealand</h4>
      <p>Under the <strong>Consumer Guarantees Act 1993 (CGA)</strong>, services and digital products must be fit for purpose, of acceptable quality, and as described. If these guarantees are not met, you are entitled to a remedy proportionate to the failure. The <strong>Fair Trading Act 1986</strong> prohibits misleading and deceptive conduct. Contact the <strong>Commerce Commission New Zealand</strong> at comcom.govt.nz if disputes cannot be resolved with us directly.</p>

      <h4 style={h4s}>Brazil & Latin America</h4>
      <p><strong>Brazil:</strong> The <strong>Consumer Defence Code (CDC, Law 8.078/1990)</strong> grants consumers a statutory <strong>7-day cooling-off period</strong> from the date of purchase or delivery for all purchases made outside a physical establishment (including online). This right applies regardless of whether the digital content has been accessed. To exercise this right, notify us within 7 calendar days at <a href="mailto:support.aethermoor@gmail.com" style={linkStyle}>support.aethermoor@gmail.com</a> for a full refund. Complaints may also be submitted to <strong>PROCON</strong> (your state consumer protection service) or at Consumidor.gov.br.<br /><br />
      <strong>Argentina:</strong> <strong>Law 24.240</strong> (Consumer Defence Law) grants equivalent protections including a right of repentance within 10 days of purchase for distance contracts.<br /><br />
      <strong>Mexico:</strong> The <strong>Ley Federal de Protección al Consumidor</strong> governs consumer rights; <strong>PROFECO</strong> handles complaints.<br /><br />
      <strong>Colombia:</strong> <strong>Law 1480 of 2011</strong> (Consumer Statute) grants a 5-business-day right of withdrawal for distance contracts.<br /><br />
      <strong>Chile:</strong> <strong>Law 19.496</strong> (Consumer Protection Law) provides protections for distance purchases.<br /><br />
      In all other Latin American jurisdictions, applicable local consumer law takes precedence over this policy.</p>

      <h4 style={h4s}>Asia-Pacific</h4>
      <p><strong>Japan:</strong> Under the <strong>Act on Specified Commercial Transactions</strong>, certain distance contracts may be subject to a cooling-off right. Under the <strong>Consumer Contract Act</strong>, contracts involving misrepresentation or undue influence may be cancelled. The <strong>Consumer Affairs Agency (CAA)</strong> handles disputes.<br /><br />
      <strong>South Korea:</strong> Under the <strong>Act on Consumer Protection in Electronic Commerce</strong>, consumers generally have a <strong>7-day right of withdrawal</strong> from online purchases. This right may be excluded for digital content that is immediately accessible or downloaded, provided appropriate notice is given at the time of purchase. The <strong>Korea Consumer Agency</strong> handles unresolved disputes.<br /><br />
      <strong>China:</strong> Under the <strong>E-Commerce Law</strong> and the <strong>Law on the Protection of Consumer Rights and Interests</strong>, consumers generally have a <strong>7-day no-questions-asked right of return</strong> for purchases on online platforms. Specific Ministry of Culture regulations govern virtual goods in online games; unused virtual currency may be eligible for partial refund upon account closure. Local <strong>Market Supervision Administration</strong> offices handle complaints.<br /><br />
      <strong>Singapore:</strong> While there is no universal cooling-off right for digital goods, the <strong>Consumer Protection (Fair Trading) Act (CPFTA)</strong> provides recourse for unfair practices. The <strong>Consumers Association of Singapore (CASE)</strong> assists with dispute resolution.<br /><br />
      <strong>India:</strong> The <strong>Consumer Protection Act 2019</strong> and <strong>Consumer Protection (E-Commerce) Rules 2020</strong> apply. You may file complaints with the <strong>National Consumer Helpline</strong> or consumer forums (District, State, or National Consumer Disputes Redressal Commission).<br /><br />
      <strong>Thailand:</strong> The <strong>Consumer Protection Act B.E. 2522 (1979)</strong> and its amendments provide protections against deceptive trade practices. The <strong>Office of the Consumer Protection Board (OCPB)</strong> handles complaints.<br /><br />
      <strong>Other APAC:</strong> We comply with applicable consumer law in Malaysia, Philippines, Indonesia, and Vietnam, providing refunds and remedies as required by local law.</p>

      <h4 style={h4s}>Africa</h4>
      <p><strong>South Africa:</strong> The <strong>Consumer Protection Act 68 of 2008 (CPA)</strong> applies in full. Section 56 provides an implied warranty of quality: if goods or services are defective or not as described, you are entitled to a remedy. Consumers may return defective goods within <strong>6 months</strong> without penalty. The <strong>National Consumer Commission (NCC)</strong>, <strong>National Consumer Tribunal</strong>, and <strong>Consumer Goods and Services Ombud (CGSO)</strong> handle disputes.<br /><br />
      <strong>Kenya:</strong> The <strong>Consumer Protection Act 2012</strong> provides protections against unfair commercial practices and defective products. The <strong>Competition Authority of Kenya</strong> oversees consumer protection matters.<br /><br />
      <strong>Nigeria:</strong> The <strong>Federal Competition and Consumer Protection Act (FCCPA) 2018</strong> governs consumer rights, including rights to refunds for defective products and services. The <strong>Federal Competition and Consumer Protection Commission (FCCPC)</strong> handles complaints.<br /><br />
      <strong>Ghana:</strong> The <strong>Consumer Protection Agency Act 2022</strong> provides remedies for consumers including rights to compensation for defective or misrepresented products.<br /><br />
      <strong>Other African jurisdictions:</strong> Applicable local consumer protection legislation takes precedence. Contact us for assistance and we will endeavour to comply with applicable local requirements.</p>

      <h3 style={h3s}>Contact</h3>
      <p>For all refund requests and billing queries:<br />
      Email: <a href="mailto:support.aethermoor@gmail.com" style={{ ...linkStyle, textDecoration: 'underline', textUnderlineOffset: 2 }}>support.aethermoor@gmail.com</a><br />
      Subject line: <strong>Refund Request — [your username]</strong><br />
      Include: Transaction ID, purchase date, account email, and a description of the issue.</p>

      <p style={note}>This Refund Policy is provided for informational purposes. Where applicable law grants you greater rights than those described above, those rights take precedence and we will honour them. For specific legal advice, consult a qualified legal professional in your jurisdiction.</p>
    </section>
  );
}

function CookiesContent() {
  return (
    <section style={sec}>
      <h2 style={h2s}>Cookie Policy</h2>
      <p style={{ color: '#8a6f4b', fontSize: 13, marginTop: 0 }}>
        Last updated: 2026-03-30 · Operator: Knoodlepot Studio (UK-based independent developer)
      </p>

      <p>This Cookie Policy explains what cookies and similar storage technologies we use on Aethermoor, why we use them, and how you can control them.</p>

      <h3 style={h3s}>1. What Are Cookies?</h3>
      <p>Cookies are small text files placed on your device when you visit a website. We also use <strong>browser local storage</strong> — a similar technology that stores data locally on your device without an expiry date unless you clear it manually. Neither cookies nor local storage can execute code or transmit viruses.</p>

      <h3 style={h3s}>2. Cookies We Use</h3>

      <h4 style={h4s}>Strictly Necessary (always active)</h4>
      <p>These are required for the game to function. They cannot be disabled without breaking core features.</p>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, marginTop: 8 }}>
        <thead>
          <tr style={{ borderBottom: '1px solid #2e2010' }}>
            <th style={{ textAlign: 'left', padding: '6px 8px', color: '#c4873a' }}>Name</th>
            <th style={{ textAlign: 'left', padding: '6px 8px', color: '#c4873a' }}>Type</th>
            <th style={{ textAlign: 'left', padding: '6px 8px', color: '#c4873a' }}>Purpose</th>
            <th style={{ textAlign: 'left', padding: '6px 8px', color: '#c4873a' }}>Expires</th>
          </tr>
        </thead>
        <tbody>
          <tr style={{ borderBottom: '1px solid #1a1408' }}>
            <td style={{ padding: '6px 8px' }}>ae_session</td>
            <td style={{ padding: '6px 8px' }}>HTTP Cookie</td>
            <td style={{ padding: '6px 8px' }}>Keeps you logged in. Contains a signed authentication token — no personal data is readable from the cookie itself.</td>
            <td style={{ padding: '6px 8px' }}>Session (deleted on logout)</td>
          </tr>
          <tr style={{ borderBottom: '1px solid #1a1408' }}>
            <td style={{ padding: '6px 8px' }}>aethermoor_* (local storage)</td>
            <td style={{ padding: '6px 8px' }}>Local Storage</td>
            <td style={{ padding: '6px 8px' }}>Stores your game save (offline/demo mode), theme preference, UI layout, quick-slot settings, and event log on your device. Never sent to our servers unless you use Cloud Save.</td>
            <td style={{ padding: '6px 8px' }}>Until you clear site data</td>
          </tr>
          <tr style={{ borderBottom: '1px solid #1a1408' }}>
            <td style={{ padding: '6px 8px' }}>aethermoor_cookie_consent</td>
            <td style={{ padding: '6px 8px' }}>Local Storage</td>
            <td style={{ padding: '6px 8px' }}>Stores your cookie consent choice ('all' or 'essential') so we do not show the banner on every visit.</td>
            <td style={{ padding: '6px 8px' }}>Until you clear site data</td>
          </tr>
        </tbody>
      </table>

      <h4 style={{ ...h4s, marginTop: 20 }}>Analytics (optional — requires your consent)</h4>
      <p>These are only activated if you click <strong>"Accept All"</strong> on the cookie consent banner. If you select "Essential Only", these are never loaded.</p>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, marginTop: 8 }}>
        <thead>
          <tr style={{ borderBottom: '1px solid #2e2010' }}>
            <th style={{ textAlign: 'left', padding: '6px 8px', color: '#c4873a' }}>Provider</th>
            <th style={{ textAlign: 'left', padding: '6px 8px', color: '#c4873a' }}>Purpose</th>
            <th style={{ textAlign: 'left', padding: '6px 8px', color: '#c4873a' }}>Data sent</th>
            <th style={{ textAlign: 'left', padding: '6px 8px', color: '#c4873a' }}>Privacy policy</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={{ padding: '6px 8px' }}>PostHog</td>
            <td style={{ padding: '6px 8px' }}>Anonymous usage analytics — helps us understand which features are used and improve the game.</td>
            <td style={{ padding: '6px 8px' }}>Anonymised page views and interaction events. No personal identifiers, no payment data, no chat content.</td>
            <td style={{ padding: '6px 8px' }}><a href="https://posthog.com/privacy" style={linkStyle} target="_blank" rel="noopener noreferrer">posthog.com/privacy</a></td>
          </tr>
        </tbody>
      </table>

      <h3 style={h3s}>3. What We Do NOT Use</h3>
      <p>We do not use:<br />
      — Advertising or retargeting cookies<br />
      — Cross-site tracking cookies<br />
      — Social media tracking pixels<br />
      — Any third-party marketing or profiling technologies</p>

      <h3 style={h3s}>4. How to Manage Your Preferences</h3>
      <p><strong>Cookie consent banner:</strong> When you first visit, a banner gives you the choice of "Accept All" (includes analytics) or "Essential Only". Your choice is saved in local storage.<br /><br />
      <strong>Withdraw consent:</strong> To withdraw analytics consent after the fact, open your browser's developer tools, go to Application → Local Storage → aethermoor.knoodlepotstudio.com, and delete the <code style={{ color: '#f0c060', background: '#1a1408', padding: '1px 4px' }}>aethermoor_cookie_consent</code> key. The banner will reappear on your next visit.<br /><br />
      <strong>Browser settings:</strong> You can also block or delete all cookies via your browser settings (usually under Privacy & Security). Note that blocking strictly necessary cookies will prevent you from logging in.</p>

      <h3 style={h3s}>5. Third-Party Processors</h3>
      <p>PostHog processes analytics data on our behalf under a Data Processing Agreement. Their infrastructure is hosted in the EU/US. Data transfers comply with UK GDPR adequacy requirements. See <a href="https://posthog.com/privacy" style={linkStyle} target="_blank" rel="noopener noreferrer">posthog.com/privacy</a> for their full data practices.</p>

      <h3 style={h3s}>6. Changes to This Policy</h3>
      <p>If we add new cookies or change how we use existing ones, we will update this page and — where required by law — re-request your consent via the banner.</p>

      <h3 style={h3s}>7. Contact</h3>
      <p>For any questions about our use of cookies:<br />
      Email: <a href="mailto:support.aethermoor@gmail.com" style={linkStyle}>support.aethermoor@gmail.com</a><br />
      Subject: "Cookie Policy Query"</p>

      <p style={note}>This Cookie Policy is provided in good faith. For legal advice specific to your situation, consult a qualified legal professional.</p>
    </section>
  );
}

export default function LegalPage() {
  const [activeTab, setActiveTab] = useState<Tab>('terms');

  const tabs: { id: Tab; label: string }[] = [
    { id: 'terms',   label: 'Terms of Service' },
    { id: 'privacy', label: 'Privacy Policy' },
    { id: 'cookies', label: 'Cookie Policy' },
    { id: 'refund',  label: 'Refund Policy' },
  ];

  return (
    <div style={{
      margin: 0,
      background: '#0d0a06',
      color: '#d4b896',
      fontFamily: 'Georgia, serif',
      lineHeight: 1.6,
      minHeight: '100dvh',
      height: '100dvh',
      overflowY: 'auto',
    }}>
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '24px 16px 48px' }}>
        <h1 style={{ color: '#f0c060', fontFamily: '"Cinzel", Georgia, serif', letterSpacing: 1 }}>
          Aethermoor Legal
        </h1>
        <div style={{ color: '#8a6f4b', fontSize: 13 }}>Last updated: 2026-03-30</div>

        {/* Tab navigation */}
        <nav aria-label="Legal sections" style={{
          position: 'sticky',
          top: 0,
          zIndex: 10,
          background: '#13100a',
          border: '1px solid #2e2010',
          padding: 10,
          display: 'flex',
          gap: 8,
          flexWrap: 'wrap',
          marginBottom: 14,
          marginTop: 14,
        }}>
          {tabs.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              style={{
                color: activeTab === id ? '#0d0a06' : '#f0c060',
                background: activeTab === id ? '#f0c060' : 'none',
                border: '1px solid #c4873a55',
                padding: '6px 14px',
                fontSize: 14,
                cursor: 'pointer',
                fontFamily: 'Georgia, serif',
                transition: 'background 0.15s, color 0.15s',
              }}
            >
              {label}
            </button>
          ))}
          <a href="/" style={{
            color: '#f0c060',
            textDecoration: 'none',
            border: '1px solid #c4873a55',
            padding: '6px 14px',
            fontSize: 14,
            display: 'inline-flex',
            alignItems: 'center',
          }}>
            Back to Game
          </a>
        </nav>

        {/* Tab content — only the active tab is rendered */}
        {activeTab === 'terms'   && <TermsContent />}
        {activeTab === 'privacy' && <PrivacyContent />}
        {activeTab === 'cookies' && <CookiesContent />}
        {activeTab === 'refund'  && <RefundContent />}
      </div>
    </div>
  );
}
