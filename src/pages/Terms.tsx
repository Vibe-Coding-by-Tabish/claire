import LegalPage, { ExternalLink, Section } from '../components/legal/LegalPage'
import { CONTACT_EMAIL, COUNTRY, OPEN_METEO_LICENSE_URL, OPEN_METEO_TERMS_URL, OPEN_METEO_URL, OWNER_NAME } from '../lib/legal'

export default function Terms() {
  return (
    <LegalPage title="Terms of Use">
      <Section title="1. Acceptance">
        <p>
          Claire is provided by {OWNER_NAME}. By using Claire, you agree to these terms. If you don't agree, please don't
          use it.
        </p>
      </Section>

      <section
        className="mt-9 rounded-3xl border border-amber-300/40 bg-amber-300/10 p-5"
        aria-labelledby="safety-heading"
      >
        <h2 id="safety-heading" className="text-lg font-semibold text-amber-100">
          2. Safety first
        </h2>
        <div className="mt-2 space-y-3 text-amber-50/90">
          <p>
            Do not use Claire while walking, driving, cycling, operating machinery, or anywhere you need to pay attention
            to your surroundings.
          </p>
          <p className="font-medium text-amber-50">
            The camera view is not a substitute for actually looking. Look up from your screen.
          </p>
        </div>
      </section>

      <Section title="3. Your content and other people">
        <p>
          You are responsible for the snapshots you take and share. Respect other people's privacy and follow local laws.
          Don't photograph people without their consent.
        </p>
      </Section>

      <Section title="4. Accuracy">
        <p>
          Weather, compass heading, and other information in Claire are approximate. Don't rely on them for navigation or
          safety decisions.
        </p>
      </Section>

      <Section title="5. Provided as-is">
        <p>
          Claire is provided "as is", without warranties of any kind. Features may change, and some may not work on every
          device or browser.
        </p>
      </Section>

      <Section title="6. Limitation of liability">
        <p>
          To the maximum extent permitted by law, {OWNER_NAME} is not liable for any damages arising from your use of
          Claire.
        </p>
      </Section>

      <Section title="7. Third-party services">
        <p>
          Weather data is provided by <ExternalLink href={OPEN_METEO_URL}>Open-Meteo.com</ExternalLink> under the{' '}
          <ExternalLink href={OPEN_METEO_LICENSE_URL}>CC BY 4.0</ExternalLink> licence. Open-Meteo's{' '}
          <ExternalLink href={OPEN_METEO_TERMS_URL}>terms</ExternalLink> apply to that data.
        </p>
      </Section>

      <Section title="8. Acceptable use">
        <p>Don't misuse Claire, overload it, or attempt to break, probe, or disrupt the service.</p>
      </Section>

      <Section title="9. Governing law">
        <p>These terms are governed by the laws of {COUNTRY}.</p>
      </Section>

      <Section title="10. Contact">
        <p>
          Questions about these terms? Email{' '}
          <a href={`mailto:${CONTACT_EMAIL}`} className="text-white underline underline-offset-4">
            {CONTACT_EMAIL}
          </a>
          .
        </p>
      </Section>
    </LegalPage>
  )
}
