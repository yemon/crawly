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

const article = ARTICLE_BY_SLUG['what-is-record-and-replay-ui-testing'];

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
  { id: 'what-is-record-and-replay-testing', label: 'What is record-and-replay testing?' },
  { id: 'how-does-record-and-replay-testing-work', label: 'How does record-and-replay testing work?' },
  { id: 'what-can-record-and-replay-testing-catch', label: 'What can record-and-replay testing catch?' },
  { id: 'where-record-and-replay-fits', label: 'Where record-and-replay fits, and where it does not' },
  { id: 'record-and-replay-vs-writing-test-code', label: 'Record-and-replay vs writing test code' },
  { id: 'when-should-you-use-record-and-replay-testing', label: 'When should you use record-and-replay testing?' },
  { id: 'how-crawly-approaches-record-and-replay', label: 'How Crawly approaches record-and-replay' },
  { id: 'faq', label: 'Frequently asked questions' },
  { id: 'the-short-version', label: 'The short version' },
];

const faqs = [
  {
    q: 'Is record-and-replay testing reliable?',
    a: 'It is as reliable as the selectors behind it. Tools that anchor to stable attributes like data-testid hold up well across builds. Tools that lean on auto-generated class names break often. Selector strategy is the thing to check before you trust any of them.',
  },
  {
    q: 'Does record-and-replay replace Playwright or Cypress?',
    a: 'Not for a mature product. It replaces the gap where you have no tests because writing them felt like too much work. Many teams run recorded flows for quick coverage and coded tests for deep logic.',
  },
  {
    q: 'Do I need to know how to code to use it?',
    a: 'No. That is the point. If you can use your own app, you can record a test.',
  },
  {
    q: 'Will it work on a React app with controlled inputs?',
    a: 'Only if the tool types through native input events. Controlled React inputs ignore values that are set directly, so this detail decides whether the tool works at all on a modern frontend.',
  },
  {
    q: 'Is there a free record-and-replay tool for React?',
    a: 'Yes. Crawly is a free, open-source Chrome extension aimed at React and Next.js, and it runs against localhost with no account.',
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
            <b>Record-and-replay UI testing</b> is a way to create automated tests by using
            your app the way a real user would, while a tool quietly records every click,
            keystroke, and selection. Later the tool plays that recording back against your
            app and tells you whether it still behaves the same. You do not write test code
            to start. You record once, then replay as often as you want.
          </p>
          <p>
            That is the whole idea in a sentence. The rest of this guide covers how it works
            under the hood, what it catches, where it falls short, and how to decide whether
            it earns a place in your 2026 workflow.
          </p>

          <h2 id="what-is-record-and-replay-testing">What is record-and-replay testing?</h2>
          <p>
            Most automated UI testing is code-first. You open an editor, learn a framework,
            and write scripts that describe each step: find this button, click it, type into
            that field, assert the result. It is powerful and precise. It is also slow to
            start and easy to abandon when nobody on the team owns it.
          </p>
          <p>
            Record-and-replay flips the order. You interact with the running app, and the tool
            writes the test for you by watching what you do. The recording becomes a repeatable
            flow. When you replay it, the tool reproduces those same actions and flags anything
            that no longer matches.
          </p>
          <p>Think of it as a memory for your interface. You show the app a path once. It remembers the path and walks it again on demand.</p>

          <h2 id="how-does-record-and-replay-testing-work">How does record-and-replay testing work?</h2>
          <p>There are four stages, and understanding them tells you a lot about what these tools can and cannot do.</p>
          <p>
            <b>Record.</b> The tool listens to browser events as you use the app. Clicks,
            typing, dropdown selections, and mouse movement all get captured, along with a way
            to identify each element you touched.
          </p>
          <p>
            <b>Store.</b> Every action needs a stable reference to the element it targeted.
            Good tools prefer durable selectors like <code>data-testid</code> attributes and
            element <code>id</code>s, and they avoid brittle ones like auto-generated CSS class
            names that change on every build. This selector choice is the single biggest factor
            in whether your replays stay reliable over time.
          </p>
          <p>
            <b>Replay.</b> The tool drives the real DOM again. It clicks real buttons and
            fires real keystrokes rather than faking the outcome. On modern React and Next.js
            apps this matters, because controlled inputs only accept a value if the keystroke
            looks like it came from an actual keyboard. Weak tools set the value directly and
            the framework ignores it. Stronger tools type through native input events so React
            sees every character.
          </p>
          <p>
            <b>Report.</b> After the run, the tool tells you what happened. A clean pass means
            the flow still works. A failure means something changed: a button vanished, a field
            moved, a control got disabled, or the flow broke partway through.
          </p>

          <h2 id="what-can-record-and-replay-testing-catch">What can record-and-replay testing catch?</h2>
          <p>It is best at catching regressions, which are the bugs you introduce by accident while shipping something else. A few common ones:</p>
          <ul>
            <li>A button that used to exist is gone or renamed</li>
            <li>A form that submitted last week now silently fails</li>
            <li>A control that should be active is disabled</li>
            <li>A multi-step flow that breaks at step three after a refactor</li>
            <li>A field that stopped accepting input after a dependency upgrade</li>
          </ul>
          <p>None of these are exotic. They are the everyday paper cuts of frontend work, and they usually slip through because nobody has time to click through every flow by hand before each release.</p>

          <h2 id="where-record-and-replay-fits">Where record-and-replay fits, and where it does not</h2>
          <p>Being honest about the tradeoffs saves you from picking the wrong tool.</p>
          <p>
            It fits well when you want coverage fast, when the team has no dedicated QA
            engineer, when the app changes often, and when you need a quick smoke check that
            the core paths still work before you push. It also shines for demos and for
            catching the obvious breakage that should never reach a user.
          </p>
          <p>
            It fits poorly when you need deep assertions on complex business logic, when you
            want tests that live inside your codebase and run in a heavily customized CI matrix,
            or when your app has no stable selectors at all. Recorded flows can also drift if
            your UI changes shape dramatically, though that same failure is often the signal you
            wanted in the first place.
          </p>
          <p>
            The realistic view: record-and-replay is a strong first layer, not a full
            replacement for a hand-written suite once your product matures. Many teams run both.
            Recorded flows guard the critical paths day to day, and coded tests handle the tricky
            logic.
          </p>

          <h2 id="record-and-replay-vs-writing-test-code">Record-and-replay vs writing test code</h2>
          <div className="overflow-x-auto">
            <table>
              <thead>
                <tr>
                  <th>Factor</th>
                  <th>Record-and-replay</th>
                  <th>Code-first (Playwright, Cypress, Selenium)</th>
                </tr>
              </thead>
              <tbody>
                <tr><th scope="row">Time to first test</th><td>Minutes</td><td>Hours to days</td></tr>
                <tr><th scope="row">Skill needed</th><td>Know your app</td><td>Know a framework</td></tr>
                <tr><th scope="row">Who can maintain it</th><td>Anyone on the team</td><td>Usually a developer</td></tr>
                <tr><th scope="row">Precision on complex logic</th><td>Limited</td><td>High</td></tr>
                <tr><th scope="row">Lives inside your repo</th><td>Often no</td><td>Yes</td></tr>
                <tr><th scope="row">Best for</th><td>Fast smoke checks, small teams</td><td>Deep suites, mature products</td></tr>
              </tbody>
            </table>
          </div>
          <p>Neither column is the &ldquo;right&rdquo; answer. The right answer is whichever one your team will actually keep using six months from now.</p>

          <h2 id="when-should-you-use-record-and-replay-testing">When should you use record-and-replay testing?</h2>
          <p>
            Reach for it when the cost of writing code-first tests is the reason you have no
            tests at all. A two-person startup shipping a React dashboard every week does not
            need a hundred Playwright specs on day one. It needs a fast way to confirm that
            login, the main form, and the dashboard still load. Record those three flows,
            replay them before each deploy, and you have caught the majority of embarrassing
            regressions for almost no effort.
          </p>
          <p>As the product grows and the logic gets gnarlier, layer coded tests on top. Start light, add depth where it pays off.</p>

          <h2 id="how-crawly-approaches-record-and-replay">How Crawly approaches record-and-replay</h2>
          <p>
            <Link href="/">Crawly</Link> is a free, open-source Chrome extension built for
            exactly this first layer on React and Next.js apps. You record a flow by using
            your app normally, then a small on-screen spider replays it: crawling to fields,
            typing at a human-like 25 milliseconds per key through native setters and real
            input events, and pouncing on buttons.
          </p>
          <p>
            A few design choices worth calling out. It prefers <code>data-testid</code> and{' '}
            <code>id</code> selectors, so recordings survive hashed class-name changes between
            builds. It runs against localhost without any account or signup. And it makes
            results loud instead of a silent green check: you get a <b>KPOW</b> when everything
            passes, and an <b>OMG</b> or a <b>BOOM</b> when the UI changed behind your back and
            a control went missing or a run failed.
          </p>
          <p>It is not trying to be your entire test suite. It is trying to make the fast, everyday smoke check something you will actually run.</p>

          <ArticleFaq qas={faqs.map(({ q, a }) => ({ q, a: <p className="m-0">{a}</p> }))} />

          <h2 id="the-short-version">The short version</h2>
          <p>
            Record-and-replay UI testing lets you build automated tests by using your app
            instead of scripting it. It is the fastest way to get real coverage on the flows
            that matter, it catches the everyday regressions that slip past busy teams, and it
            works best as a first layer that you extend with coded tests as the product grows.
            If writing test code has been the reason you have none, this is where to start.
          </p>
        </ArticleLayout>
      </main>
      <Footer />
      <JsonLd data={pageGraph} />
    </>
  );
}
