# Knoodlepot Studio — Master Setup Checklist

## Business & Legal
1. **Register with HMRC as Sole Trader** — gov.uk/register-for-self-assessment | Free | ✓ Done | High
2. **Virtual Office address** — Not needed | N/A | ✓ N/A | —
3. **Open Starling Business Account** — (switched from Barclays) | Free | ✓ Done | High
4. **Register with ICO** — Required if collecting user data | £40/yr | ✓ Done | High
5. **Photo ID verified** — Passport arrived | Free | ✓ Done | High
6. **Proof of address obtained** — Utility bill or bank statement | Free | ✓ Done | High
7. **Business email set up** — knoodlepot@knoodlepotstudio.com | Free | ✓ Done | High

## Google Play Store
7. **Google Play Developer account** — play.google.com/console — $25 already paid | ✓ Paid | ✓ Done | High
8. **Identity verification on Play Console** — | Free | ✓ Done | High
9. **Payment profile set up** — | Free | ✓ Done | High
10. **Apps on 14-day trial** — 12 testers active | Free | ✓ In Progress | High

## Remaining Before Aethermoor Launch
- [ ] Add postal/business address to Privacy Policy (`app/legal/page.tsx` line 121 placeholder)
- [ ] Commit + push bad ending feature batch (6 modified files + BadEndingScreen.tsx)
- [ ] Deploy: `vercel --prod --yes`

## Projects & Estimated Costs
| Project | Est. Monthly Cost | Notes |
|---|---|---|
| Aethermoor | ~£3.90/mo | Railway Hobby plan, usage-based |
| Togetherly | Free | Basic push notifications; Firebase may be needed |
| TTS Book Reader | ~£5/mo | ElevenLabs Starter, usage-dependent |
| Smut Chat | ~£20/mo | OpenRouter + Novita.ai, variable with user numbers |
| Describr | ~£5/mo | Claude Vision API, depends on user requests |
| StitchSnap | ~£5/mo | Image processing API; lower if on-device |
