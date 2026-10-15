# The Trust Bid

AI-assisted quote comparison and negotiation for moving and collision-repair services.

## Problem and audience

Moving and repair estimates can be difficult to compare when fees, scope, and binding
terms differ. The Trust Bid helps consumers collect comparable quote details, inspect
itemization, and review a recommendation backed by recorded transcript data.

## What the app does

1. Builds a structured job specification through a voice interview or quote/photo upload.
2. Finds providers through a configured directory query or a bundled directory snapshot.
3. Runs sequential simulated seller negotiations by default. Optional real calls are
   separately configured, explicitly confirmed, and disabled unless enabled by the operator.
4. Extracts structured quotes, applies deterministic red-flag and itemization checks, and
   produces a ranked report with transcripts and call recordings where available.
5. Exports the ranked quotes and itemization as a CSV file.

The follow-up invoice flow is simulated: it does **not** send an email or complete a real
booking. The landing page's sample provider rows are illustrative demo data, not live quotes.
Displayed USD quote and benchmark amounts are converted to INR using the latest published
USD/INR rate. The rate source refreshes periodically and publishes updates daily; this is not
a tick-by-tick market feed. The app's provider directory, sample businesses, benchmarks, and
calling workflow remain U.S.-focused, so converted INR amounts are for display and are not
Indian provider quotes.

## Product identity and provenance

The current product name is **The Trust Bid**. Other suitable names considered were
**Quote Compass** and **Bidwise**; The Trust Bid is used because it signals a comparison
grounded in evidence. Check name and trademark availability before public launch.

This working copy already contained a functioning application and project documents before
the improvements listed below. Existing `SPEC.md`, `VIDEOS.md`, and `brand-guidelines.pdf`
refer to an earlier challenge project and creator. Those materials and notices have been
retained. The current Git lookup resolves to `C:\Users\Manish`, with no commits or configured
remote; the original upstream and complete authorship history therefore cannot be verified.

Changes implemented in this working session:

- Added 10 MB and supported-media-type validation to document/photo extraction.
- Changed local storage reads so missing files mean an empty collection, while corrupt or
  inaccessible data now produce an explicit error rather than silently appearing empty.
- Added CSV quote export with spreadsheet-formula neutralization.
- Connected the previously unused optional live-call UI to its server-side feature gate and
  surfaced request errors.
- Addressed existing lint findings in navigation and React effect/ref handling.
- Replaced unsubstantiated landing-page savings claims with descriptions of implemented
  behavior and labeled the sample quotes as illustrative.
- Added regression tests and updated setup, deployment, and limitations documentation.

The negotiation intake, call simulation, quote extraction, report generation, vertical
configuration, and existing tests were already present in the supplied working copy; they
are not claimed as new work here.

## Technology and architecture

- Next.js 16 App Router, React 19, TypeScript, Tailwind CSS 4
- Google Gemini via `GEMINI_API_KEY` for extraction, simulated dialogue, research, and report assistance
- ElevenLabs Conversational AI and speech for voice intake and the audible showcase
- Optional Google Places discovery
- Local JSON files for development, or a Supabase `collections` table for persistent storage
- Netlify Next.js adapter configuration in `netlify.toml`

```text
Intake (voice or document) -> confirmed JobSpec -> provider discovery
  -> sequential simulated/optional live calls -> transcript -> structured Quote
  -> deterministic checks + AI-supported explanation -> ranked Report -> CSV
```

Moving and autobody market configuration is kept in `config/moving.ts` and
`config/autobody.ts`; `NEXT_PUBLIC_VERTICAL` selects the active vertical. The autobody
intake has vertical-specific fields; the moving intake remains the default experience.

## Run locally

Use Node.js 20.9 or later.

```powershell
npm install
Copy-Item .env.example .env.local
# Add the required service credentials to .env.local
npm run seed
npm run dev
```

Open `http://localhost:3000`. `npm run seed` adds demo fixtures. Use **Run demo** for the
simulated flow, or navigate through intake, calls, and report manually.
`.env.example` is only a blank template and is not loaded by Next.js. Put credentials in
`.env.local` at the project root, then stop and restart `npm run dev` so the server loads them.

### Environment variables

| Variable | Purpose |
| --- | --- |
| `GEMINI_API_KEY` | Required for extraction, simulated seller dialogue, research, and reports |
| `ELEVENLABS_API_KEY` | Required for voice sessions and text-to-speech |
| `ELEVENLABS_AGENT_ID_INTAKE` | Voice intake agent |
| `ELEVENLABS_AGENT_ID_NEGOTIATOR` | Negotiation voice agent |
| `NEXT_PUBLIC_VERTICAL` | `moving` (default) or `autobody` |
| `SUPABASE_URL` | Optional persistent storage |
| `SUPABASE_SERVICE_ROLE_KEY` | Preferred server-only key for Supabase storage |
| `SUPABASE_ANON_KEY` | Optional fallback key; configure suitable RLS policies |
| `GOOGLE_PLACES_API_KEY` / `GOOGLE_MAPS_API_KEY` | Optional live Google Places discovery |
| `LIVE_CALLS_ENABLED` | Server-side live-call gate; leave `false` unless explicitly configured |
| `NEXT_PUBLIC_LIVE_CALLS` | Shows the real-call control when set to `1` |
| `ELEVENLABS_PHONE_NUMBER_ID` | Phone number configured in the ElevenLabs/Twilio integration |
| `DEMO_MODE` | Documents the intended default mode; demo sellers are simulated |

Never put service-role keys in `NEXT_PUBLIC_*` variables or commit `.env`.

## Commands and tests

```powershell
npm test
npm run lint
npx tsc --noEmit
npm run build
npm run check
```

The test suite covers quote rules, grounding of AI responses, discovery fallback and
location behavior, upload validation, local-store integrity, and CSV escaping. `npm run
check` audits seeded/stored quote data and needs the relevant local data.

## API overview

| Route | Methods | Purpose |
| --- | --- | --- |
| `/api/extract` | POST | Validate and extract from a PDF or supported image |
| `/api/jobspec` | GET, POST | Read and save job specifications |
| `/api/discovery` | GET | Find providers or return the configured snapshot |
| `/api/calls/run` | POST | Stream sequential simulated negotiation calls |
| `/api/live-call` | GET, POST | Start or poll an explicitly enabled outbound call |
| `/api/report` | GET, POST | Load or generate the ranked report |
| `/api/exchange-rate` | GET | Retrieve the latest published USD/INR rate |
| `/api/ask` | POST | Answer questions using the active job's stored data |
| `/api/take-action` | POST | Run the simulated follow-up invoice-request call |
| `/api/recording` | GET | Proxy an ElevenLabs conversation recording |

## Security, privacy, and operational limits

- There is no authentication or per-user authorization. Treat this as a local or otherwise
  access-restricted, single-user demonstration. Do not expose it as a public service with
  real customer data until authentication, authorization, and tenant isolation are added.
- Local `.data/` storage is ignored by Git, but it contains personal job details and
  transcripts. Keep it private and do not commit it. Local JSON storage is not suitable for
  concurrent production writes or serverless persistence.
- For serverless deployment, configure Supabase. The application expects a `collections`
  table with `name text primary key` and `items jsonb`; use server-only credentials and
  configure row-level security appropriately.
- Document extraction accepts PDF, JPEG, PNG, GIF, and WebP files up to 10 MB. It forwards
  the uploaded content to Gemini for processing.
- Real outbound calls require both the UI flag and server-side environment configuration,
  and each call has a confirmation step and AI/recording disclosure. Follow applicable
  consent, telemarketing, and privacy rules.
- Market references and sample landing-page amounts are examples/benchmarks, not a promise
  of a provider quote or guaranteed savings. Verify source and date before relying on them.

## Deployment

`netlify.toml` contains the Netlify build command and Next.js adapter. A deployment needs
the required Gemini/ElevenLabs variables and persistent storage configuration. Because the
application has no authentication and stores sensitive contact and call data, deploy only
to a private preview until access control and data retention are addressed. No deployment
was performed from this working session.

## GitHub publication and licence

There is no project-scoped commit history or remote in this working copy, and the existing
Git root is the user's home directory rather than this project. Do not initialize, stage,
or commit from that home-level root. Before publishing, create a dedicated project
repository, inspect its history/provenance, and retain all required upstream notices.

No `LICENSE` file was present, and the original upstream licence could not be established.
The package is marked `UNLICENSED` to avoid implying redistribution rights. This does not
grant rights to the inherited code or bundled brand materials; obtain and follow the
original licence or written permission before public redistribution. No repository was
created, pushed, or overwritten.

## Demo walkthrough

1. Start the development server and choose **Run demo**.
2. Review and confirm the seeded job details on intake.
3. Watch the simulated provider calls and the audible showcase call.
4. Open the report, inspect quote details, red flags, negotiation evidence, and transcript.
5. Export the ranked quotes to CSV.
6. Explain that the invoice callback is simulated and no real email or booking is performed.

## Presentation questions to understand

- **How are prices ranked?** Quote extraction and rationale use AI; the integrity checks
  and final ordering rules are implemented deterministically in code.
- **Can it call real providers?** Only when live-call UI and server flags, phone integration,
  credentials, and a user confirmation are all present. Demo sellers are simulations.
- **Does it email an invoice or book a move?** No. The current follow-up call is simulated.
- **Where is data stored?** `.data/` JSON locally, or the Supabase `collections` table when
  configured. The app currently has no account isolation.
- **What did this work add?** Upload validation, safer local-store error behavior, CSV export,
  live-call UI wiring, lint fixes, regression tests, and clearer project documentation.
- **What remains before public launch?** Verify upstream provenance/licensing, add
  authentication and tenant isolation, review privacy/retention, and validate live-call
  compliance and external-service configuration.
