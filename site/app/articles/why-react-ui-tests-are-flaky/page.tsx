import type { Metadata } from 'next';
import Link from 'next/link';
import { Nav } from '@/components/Nav';
import { Footer } from '@/components/Footer';
import { JsonLd } from '@/components/JsonLd';
import { ArticleLayout } from '@/components/ArticleLayout';
import { ArticleFaq } from '@/components/ArticleFaq';
import {
  ARTICLE_BY_SLUG,
  articleUrl,
  articleJsonLd,
  articleBreadcrumbLd,
  articleFaqLd,
} from '@/lib/articles';
import { graphLd, organizationLd, personLd } from '@/lib/structured-data';

export const dynamic = 'force-static';

const article = ARTICLE_BY_SLUG['why-react-ui-tests-are-flaky'];

export const metadata: Metadata = {
  title: article.title,
  description: article.description,
  keywords: article.keywords,
  alternates: { canonical: `/articles/${article.slug}` },
  openGraph: {
    type: 'article',
    url: articleUrl(article.slug),
    title: article.title,
    description: article.description,
    publishedTime: article.publishedAt,
    modifiedTime: article.modifiedAt,
    authors: ['yemon'],
    section: article.section,
    tags: article.keywords as unknown as string[],
  },
  twitter: {
    card: 'summary_large_image',
    title: article.title,
    description: article.description,
  },
  robots: {
    index: true, follow: true,
    'max-snippet': -1, 'max-image-preview': 'large', 'max-video-preview': -1,
  },
};

const toc = [
  { id: 'what-makes-a-test-flaky', label: 'What makes a test flaky?' },
  { id: 'cause-1-you-check-before-react-finishes-rendering', label: 'Cause 1: You check before React finishes rendering' },
  { id: 'cause-2-you-added-a-hardcoded-wait', label: 'Cause 2: You added a hardcoded wait' },
  { id: 'cause-3-your-selectors-are-brittle', label: 'Cause 3: Your selectors are brittle' },
  { id: 'cause-4-tests-leak-state', label: 'Cause 4: Tests leak state into each other' },
  { id: 'cause-5-your-data-is-non-deterministic', label: 'Cause 5: Your data is non-deterministic' },
  { id: 'cause-6-you-are-hitting-a-real-network', label: 'Cause 6: You are hitting a real network' },
  { id: 'cause-7-animations-move-the-target', label: 'Cause 7: Animations move the target' },
  { id: 'cause-8-passes-locally-fails-in-ci', label: 'Cause 8: Passes locally, fails in CI' },
  { id: 'cause-9-state-updates-outside-react', label: 'Cause 9: State updates outside React' },
  { id: 'summary-table', label: 'The causes and fixes at a glance' },
  { id: 'where-record-and-replay-tools-fit', label: 'Where record-and-replay tools fit' },
  { id: 'faq', label: 'Frequently asked questions' },
  { id: 'the-short-version', label: 'The short version' },
];

const faqs = [
  {
    q: 'Why does my React test pass sometimes and fail other times?',
    a: 'Almost always a timing race. Your assertion runs before React finishes an async update. Switch from immediate queries to waiting queries that retry until the condition is true.',
  },
  {
    q: 'Are hardcoded waits ever okay?',
    a: 'Rarely, and never as a real fix. A fixed sleep is either too short on slow machines or too slow everywhere else. Wait for a specific condition instead.',
  },
  {
    q: 'How do I stop tests from failing only in CI?',
    a: 'Reproduce the CI setup locally, headless and at the same viewport, then fix the underlying race. Raising timeouts hides the problem rather than solving it.',
  },
  {
    q: 'Do stable test ids really matter that much?',
    a: 'Yes. Selector brittleness is one of the top causes of flaky UI tests. Targeting roles and data-testid attributes instead of CSS classes removes a whole category of failures.',
  },
  {
    q: 'Will a no-code recorder be less flaky than hand-written tests?',
    a: 'Only if it uses stable selectors and real timing. A good recorder automates a couple of the fixes, but app-side habits like stable test ids and disabled animations still matter for reliability.',
  },
];

const pageGraph = graphLd([
  organizationLd,
  personLd,
  articleJsonLd(article, { faqQuestions: faqs.length }),
  articleBreadcrumbLd(article),
  articleFaqLd(article.slug, faqs.map((f) => ({ q: f.q, a: f.a }))),
]);

export default function Page() {
  return (
    <>
      <Nav />
      <main id="main" role="main">
        <ArticleLayout article={article} toc={toc}>
          <p>
            A <b>flaky test</b> is one that passes and fails on the same code with no changes
            in between. In React, the culprit is almost always <b>timing</b>: your test checks
            for something before React has finished rendering or updating. The fix is to stop
            guessing with fixed delays and start waiting for the actual condition, then clean up
            the other usual suspects, which are brittle selectors, shared state between tests,
            and data that changes from run to run.
          </p>
          <p>
            That is the whole diagnosis in a paragraph. Below, each common cause gets paired
            with the exact change that stops it, so you can work down the list and watch your
            pass rate settle.
          </p>

          <h2 id="what-makes-a-test-flaky">What makes a test flaky?</h2>
          <p>
            Flakiness is non-determinism leaking into a test that is supposed to be
            deterministic. Same input, same code, and yet the result flips. It erodes trust
            fast. Once a suite cries wolf a few times, people start rerunning failures out of
            habit and stop reading them, which defeats the point of having tests at all.
          </p>
          <p>The good news is that flaky React tests come from a short list of causes. Fix these and most of the noise disappears.</p>

          <h2 id="cause-1-you-check-before-react-finishes-rendering">Cause 1: You check before React finishes rendering</h2>
          <p>
            This is the big one. React updates the DOM asynchronously. When your test queries
            for an element or asserts on text right after an action, the update may not have
            landed yet. Sometimes it wins the race and passes. Sometimes it loses and fails.
          </p>
          <p>
            <b>The fix:</b> wait for the condition, not a moment in time. In React Testing
            Library, use <code>findBy</code> queries and <code>waitFor</code> instead of{' '}
            <code>getBy</code> right after an async action. In Playwright and Cypress, lean on
            their auto-waiting assertions, which retry until the element is ready. You are
            telling the test &ldquo;proceed when this is true,&rdquo; which removes the race
            entirely.
          </p>

          <h2 id="cause-2-you-added-a-hardcoded-wait">Cause 2: You added a hardcoded wait to make it pass</h2>
          <p>
            Everyone does this once. A test is flaky, so you drop in a fixed sleep of half a
            second and it goes green. The problem is that the delay is either too short on a
            slow CI machine, where it fails again, or too long everywhere else, where it wastes
            minutes across the suite.
          </p>
          <p>
            <b>The fix:</b> delete arbitrary sleeps and replace them with condition-based
            waiting. If you truly cannot express the condition, wait for the specific network
            response or the specific element state, never a raw number of milliseconds.
          </p>

          <h2 id="cause-3-your-selectors-are-brittle">Cause 3: Your selectors are brittle</h2>
          <p>
            Tests that target elements by CSS class, deep <code>nth-child</code> paths, or
            auto-generated class names break the moment the markup shifts. On modern React apps
            that produce hashed class names at build time, this kind of selector is flaky by
            design.
          </p>
          <p>
            <b>The fix:</b> target elements the way a user or an accessibility tree would.
            Prefer roles and accessible names, and add stable <code>data-testid</code>{' '}
            attributes to the elements you test. These survive refactors and styling changes,
            which is most of what churns in a frontend.
          </p>

          <h2 id="cause-4-tests-leak-state">Cause 4: Tests leak state into each other</h2>
          <p>
            A suite where tests pass alone but fail together has an isolation problem. Shared
            globals, a lingering <code>localStorage</code> value, a mocked module that was not
            reset, or a database row from a previous test all bleed across boundaries.
          </p>
          <p>
            <b>The fix:</b> each test should set up its own world and tear it down after. Reset
            mocks, clear storage, and reset any shared client between tests. If a test depends
            on another test running first, that dependency is a bug waiting to surface the day
            the runner changes order.
          </p>

          <h2 id="cause-5-your-data-is-non-deterministic">Cause 5: Your data is non-deterministic</h2>
          <p>
            Dates, random values, timezones, and unsorted lists are quiet sources of flakiness.
            A test that formats today&apos;s date passes until it runs at midnight in a different
            timezone. A list assertion passes until the backend returns the same items in a
            different order.
          </p>
          <p>
            <b>The fix:</b> control the inputs. Freeze time with fake timers so &ldquo;now&rdquo;
            is fixed. Seed random generators. Sort collections before asserting on them. Anything
            that can vary between runs should be pinned down inside the test.
          </p>

          <h2 id="cause-6-you-are-hitting-a-real-network">Cause 6: You are hitting a real network</h2>
          <p>
            Tests that call a live API inherit every bit of that API&apos;s instability: latency
            spikes, rate limits, transient errors, and data that changes underneath you. Your UI
            test should be testing your UI, not the reliability of a server.
          </p>
          <p>
            <b>The fix:</b> mock or stub network calls so responses are fixed and instant.
            Tools like MSW let you intercept requests at the network layer and return controlled
            responses. Save the real backend for a small number of dedicated integration tests.
          </p>

          <h2 id="cause-7-animations-move-the-target">Cause 7: Animations move the target</h2>
          <p>
            If a button is still sliding in or fading when your test tries to click it, the
            click can miss or land on the wrong element. Transitions that look smooth to a user
            are a moving target to an automated run.
          </p>
          <p>
            <b>The fix:</b> disable animations and transitions in the test environment, or
            wait for the element to reach a stable state before interacting. Most teams turn
            animations off globally during tests with a small bit of CSS.
          </p>

          <h2 id="cause-8-passes-locally-fails-in-ci">Cause 8: It passes locally but fails in CI</h2>
          <p>
            This one feels like a ghost. The suite is green on your laptop and red in the
            pipeline. Usually CI runs on a slower, more contended machine, in headless mode, at
            a different viewport, which exposes races that your fast local machine hid.
          </p>
          <p>
            <b>The fix:</b> resist the urge to just raise timeouts. Reproduce the CI conditions
            locally by running headless at the CI viewport, then fix the underlying race with
            proper waiting. Higher timeouts mask flakiness; they rarely remove it.
          </p>

          <h2 id="cause-9-state-updates-outside-react">Cause 9: State updates happen outside React&apos;s control</h2>
          <p>
            If your test triggers a state update that React was not expecting, you get warnings
            about updates not wrapped in <code>act</code>, and behind those warnings are the
            same timing races that cause failures.
          </p>
          <p>
            <b>The fix:</b> use the async utilities your testing library provides so updates
            settle inside React&apos;s lifecycle. Interact through the library&apos;s{' '}
            <code>user-event</code> helpers rather than firing raw events, and let the
            framework&apos;s waiting mechanisms handle the settling.
          </p>

          <h2 id="summary-table">The causes and fixes at a glance</h2>
          <div className="overflow-x-auto">
            <table>
              <thead>
                <tr><th>Cause</th><th>The fix</th></tr>
              </thead>
              <tbody>
                <tr><th scope="row">Checking before render finishes</th><td>Wait for the condition with findBy / waitFor / auto-waiting assertions</td></tr>
                <tr><th scope="row">Hardcoded sleeps</th><td>Replace with condition-based waiting</td></tr>
                <tr><th scope="row">Brittle selectors</th><td>Use roles and stable data-testid attributes</td></tr>
                <tr><th scope="row">State leaking between tests</th><td>Reset and isolate every test</td></tr>
                <tr><th scope="row">Non-deterministic data</th><td>Freeze time, seed randomness, sort collections</td></tr>
                <tr><th scope="row">Real network calls</th><td>Mock responses at the network layer</td></tr>
                <tr><th scope="row">Animations moving elements</th><td>Disable transitions in the test environment</td></tr>
                <tr><th scope="row">Passes locally, fails in CI</th><td>Reproduce CI conditions, fix the race, do not just raise timeouts</td></tr>
                <tr><th scope="row">Updates outside act</th><td>Use the library&apos;s async and user-event utilities</td></tr>
              </tbody>
            </table>
          </div>

          <h2 id="where-record-and-replay-tools-fit">Where record-and-replay tools fit</h2>
          <p>
            Record-and-replay tools are not immune to flakiness. They live or die by the same
            rules: stable selectors, real timing, and a settled DOM. A recorder that anchors to
            hashed class names will be just as flaky as a hand-written test that does the same.
          </p>
          <p>
            The ones that hold up make a few of these fixes automatic. <Link href="/">Crawly</Link>,
            for example, prefers <code>data-testid</code> and <code>id</code> selectors when it
            records, so playbacks survive class-name churn, and it types through native input
            events at a human-like pace rather than dumping values instantly, which avoids the
            race where a controlled React input rejects a value that arrived too fast. That
            removes two common causes for you. It does not remove the rest. Disabling animations
            in your test build and adding stable test ids to your components still pays off for
            every tool you point at your app, recorders included.
          </p>

          <ArticleFaq qas={faqs.map(({ q, a }) => ({ q, a: <p className="m-0">{a}</p> }))} />

          <h2 id="the-short-version">The short version</h2>
          <p>
            Flaky React tests are mostly a timing problem wearing different costumes. Wait for
            real conditions instead of fixed delays, target elements by role and stable test id
            instead of CSS, isolate every test, pin down your data, mock the network, and turn
            off animations in test. Work down that list and a jittery suite turns into one you
            can trust, which is the only kind worth keeping.
          </p>
        </ArticleLayout>
      </main>
      <Footer />
      <JsonLd data={pageGraph} />
    </>
  );
}
