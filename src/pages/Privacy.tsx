import LegalPage, { ExternalLink, Section } from '../components/legal/LegalPage'
import { CONTACT_EMAIL, OPEN_METEO_TERMS_URL, OPEN_METEO_URL, OWNER_NAME, VERCEL_PRIVACY_URL } from '../lib/legal'

const STORAGE_KEYS: [string, string][] = [
  ['claire.settings', 'Your settings: lens scale, glass blur, 12/24-hour time, and which widgets are shown.'],
  ['claire.note', 'The text of your sticky note.'],
  ['claire.weather', 'The last weather result (temperature, high/low, condition, and when it was fetched) for up to 30 minutes. Your coordinates are not stored.'],
  ['claire.compass', 'Whether you turned the compass on, so it can resume without asking again where your browser allows.'],
  ['claire.safetyNoticeSeen', 'Whether the one-time safety reminder has been shown.'],
]

export default function Privacy() {
  return (
    <LegalPage title="Privacy Policy">
      <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
        <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-white/60">In short</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5">
          <li>Your camera feed stays on your device. It is never uploaded or recorded.</li>
          <li>We don't collect, store, or sell personal data.</li>
          <li>No cookies, no analytics, no accounts.</li>
          <li>The optional weather widget sends your approximate location to Open-Meteo to get the forecast.</li>
        </ul>
      </div>

      <div className="mt-9">
        <Section title="Who we are">
          <p>
            Claire is a free web app run by {OWNER_NAME} ("we", "us"). This policy explains what happens to your
            information when you use it.
          </p>
        </Section>

        <Section title="Camera">
          <p>
            Claire uses your camera to show what's behind your screen. The video is processed entirely inside your
            browser. It is never uploaded, recorded, or sent to any server, including ours.
          </p>
          <p>
            Camera access stops when you leave Claire or switch to another tab or app. You can revoke the permission at
            any time in your browser's site settings.
          </p>
        </Section>

        <Section title="Snapshots">
          <p>
            Snapshots are created on your device. They only leave it if you choose to share or download them, and then
            they go wherever you send them.
          </p>
        </Section>

        <Section title="Location (optional)">
          <p>
            Claire only asks for your location when you tap the weather widget. Your browser then sends approximate
            coordinates (rounded to about 1 km) directly to{' '}
            <ExternalLink href={OPEN_METEO_URL}>Open-Meteo</ExternalLink> to fetch the weather. We never receive your
            location. Open-Meteo's handling of that request is covered by its{' '}
            <ExternalLink href={OPEN_METEO_TERMS_URL}>terms and privacy policy</ExternalLink>.
          </p>
        </Section>

        <Section title="Motion and orientation (optional)">
          <p>
            If you turn on the compass, Claire reads your device's orientation sensors to show your heading. This is
            processed on your device and never sent anywhere.
          </p>
        </Section>

        <Section title="Data stored on your device">
          <p>
            Claire keeps a few small items in your browser's local storage so your setup is still there next time.
            They are never transmitted. Clearing this site's data in your browser removes all of them.
          </p>
          <ul className="list-disc space-y-2 pl-5">
            {STORAGE_KEYS.map(([key, what]) => (
              <li key={key}>
                <code className="rounded bg-white/10 px-1.5 py-0.5 text-[14px] text-white">{key}</code>: {what}
              </li>
            ))}
          </ul>
          <p>Your browser may also keep a copy of the app's files so Claire loads quickly and works offline.</p>
        </Section>

        <Section title="Hosting">
          <p>
            Claire is hosted on Vercel. Like any web host, Vercel may process standard technical data such as IP
            addresses in server logs in order to deliver the site. See{' '}
            <ExternalLink href={VERCEL_PRIVACY_URL}>Vercel's privacy policy</ExternalLink>.
          </p>
        </Section>

        <Section title="What we don't do">
          <ul className="list-disc space-y-1 pl-5">
            <li>No cookies</li>
            <li>No analytics</li>
            <li>No ads</li>
            <li>No tracking pixels</li>
            <li>No third-party fonts or CDNs</li>
            <li>No accounts</li>
          </ul>
        </Section>

        <Section title="Children">
          <p>Claire is not directed at children under 18.</p>
        </Section>

        <Section title="Your rights and contact">
          <p>
            For questions, requests, or complaints about your privacy, email{' '}
            <a href={`mailto:${CONTACT_EMAIL}`} className="text-white underline underline-offset-4">
              {CONTACT_EMAIL}
            </a>
            . We aim to respond within a reasonable time. Because we don't collect personal data, there is usually
            nothing for us to access or delete, but we're happy to help.
          </p>
        </Section>

        <Section title="Changes">
          <p>
            We may update this policy from time to time. The "Last updated" date at the top always reflects the latest
            version.
          </p>
        </Section>
      </div>
    </LegalPage>
  )
}
