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

const article = ARTICLE_BY_SLUG['free-ui-testing-tools-react-nextjs-2026'];

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
  { id: 'how-to-pick', label: 'How to pick a free UI testing tool' },
  { id: 'playwright', label: '1. Playwright' },
  { id: 'cypress', label: '2. Cypress' },
  { id: 'react-testing-library', label: '3. React Testing Library' },
  { id: 'vitest', label: '4. Vitest' },
  { id: 'storybook', label: '5. Storybook' },
  { id: 'crawly', label: '6. Crawly' },
  { id: 'backstopjs', label: '7. BackstopJS' },
  { id: 'lost-pixel', label: '8. Lost Pixel' },
  { id: 'selenium', label: '9. Selenium' },
  { id: 'quick-comparison', label: 'Quick comparison' },
  { id: 'faq', label: 'Frequently asked questions' },
  { id: 'the-short-version', label: 'The short version' },
];

const faqs = [
  {
    q: 'What is the best free UI testing tool for React?',
    a: 'There is no single best. For end-to-end flows most teams reach for Playwright, for component behavior React Testing Library, and for a no-code option that anyone on the team can run, Crawly. The right pick depends on which layer you are testing and who will maintain it.',
  },
  {
    q: 'Do I need to write code to test a React UI?',
    a: 'Not always. Playwright, Cypress, and React Testing Library are code-first. If you would rather record a flow by using your app, a no-code recorder like Crawly builds the test for you.',
  },
  {
    q: 'Are these tools really free, or free trials?',
    a: 'Most are open source and free with no catch, including Playwright, React Testing Library, Vitest, BackstopJS, and Crawly. Cypress and Storybook are free at the core and sell optional paid cloud services you can skip.',
  },
  {
    q: 'What is the fastest way to start testing a Next.js app?',
    a: 'Record a smoke test of your critical flows with a no-code tool so you have coverage today, then add Playwright or component tests where deeper checks pay off. Start light, add depth later.',
  },
  {
    q: 'Can I use more than one of these together?',
    a: 'Yes, and most teams do. A common stack is React Testing Library for components, Playwright or a recorder for end-to-end flows, and a visual tool like BackstopJS or Lost Pixel on top.',
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
            If you build with React or Next.js and you want to test your interface without
            paying for it, you have more good options in 2026 than ever. The short version:
            use <b>Playwright</b> for end-to-end flows, <b>React Testing Library</b> for
            component behavior, <b>Storybook</b> plus a free visual tool for catching
            look-and-feel regressions, and a no-code recorder like <b>Crawly</b> when you want
            fast coverage without writing scripts. Every tool on this list has a genuinely free
            path, and most are fully open source.
          </p>
          <p>
            This guide walks through nine of them. For each one you get what it actually does,
            who it fits, the real cost picture, and where it falls short. No tool is best at
            everything, so the goal here is to match the tool to the job.
          </p>

          <h2 id="how-to-pick">How to pick a free UI testing tool</h2>
          <p>UI testing splits into three layers, and knowing which layer you are working in narrows the choice fast.</p>
          <p>
            <b>Component testing</b> checks a single piece of UI in isolation: does this
            button call the right handler, does this form show the right error.{' '}
            <b>End-to-end testing</b> drives the whole app like a user, clicking through real
            flows in a real browser. <b>Visual testing</b> compares screenshots against a
            baseline to catch changes you did not mean to make.
          </p>
          <p>Most healthy React projects use a bit of all three. You do not need every tool below. You need one from each layer that your team will keep using.</p>

          <h2 id="playwright">1. Playwright</h2>
          <p><b>Best for:</b> end-to-end testing across browsers.</p>
          <p>
            Playwright is the default answer for browser end-to-end testing in 2026. It is
            open source, free, maintained by Microsoft, and it drives Chromium, Firefox, and
            WebKit from a single test suite. It plays well with Next.js out of the box, and
            its built-in code generator lets you click through your app and get a starter
            script written for you. It also ships screenshot testing through{' '}
            <code>toHaveScreenshot()</code>, so you get basic visual coverage without a second
            tool.
          </p>
          <p><b>The cost:</b> fully free and open source. No paid tier to unlock the core.</p>
          <p><b>Limitation:</b> you still write and maintain code. For a team with no one to own the suite, that is the wall people hit.</p>

          <h2 id="cypress">2. Cypress</h2>
          <p><b>Best for:</b> React teams who want great local debugging.</p>
          <p>
            Cypress runs inside the browser, which gives it direct access to the DOM, network,
            and app state. Its interactive runner makes watching a test fail almost pleasant,
            and its component testing mode is a nice fit for isolated React work. If your team
            lives in JavaScript, the developer experience is hard to beat.
          </p>
          <p>
            <b>The cost:</b> the test runner is open source and free. The paid part is Cypress
            Cloud, the hosted dashboard for parallelization and analytics, which you can skip
            entirely and still get full local testing.
          </p>
          <p><b>Limitation:</b> browser support has historically trailed Playwright, and heavy suites can get slow.</p>

          <h2 id="react-testing-library">3. React Testing Library</h2>
          <p><b>Best for:</b> testing component behavior the way users experience it.</p>
          <p>
            React Testing Library encourages you to test what the user sees and does rather
            than internal implementation details. You query by text, role, and label, then
            assert on behavior. It pairs with a test runner, usually Jest or Vitest, and it is
            the community standard for component-level testing on React and Next.js.
          </p>
          <p><b>The cost:</b> free and open source.</p>
          <p><b>Limitation:</b> it is not end-to-end. It renders components in a simulated environment, so it will not catch problems that only appear in a real browser.</p>

          <h2 id="vitest">4. Vitest</h2>
          <p><b>Best for:</b> a fast, modern test runner under your component tests.</p>
          <p>
            Vitest is a Vite-native test runner that has become the go-to alternative to Jest
            for many React teams. It is quick, the config is light, and it works cleanly with
            React Testing Library. If you are starting a project in 2026 and want speed, this
            is a strong default runner.
          </p>
          <p><b>The cost:</b> free and open source.</p>
          <p><b>Limitation:</b> it is a runner, not a full UI testing tool. You still pair it with a library like React Testing Library to actually exercise the UI.</p>

          <h2 id="storybook">5. Storybook</h2>
          <p><b>Best for:</b> building and testing components in isolation.</p>
          <p>
            Storybook lets you develop each component on its own, with a &ldquo;story&rdquo;
            for every state: empty, loading, error, long text. That isolation is half testing
            by itself, because it forces you to think through edge cases. Its interaction
            testing can then click and type inside a story to confirm behavior, and it becomes
            the backbone that visual tools plug into.
          </p>
          <p><b>The cost:</b> free and open source. Its hosted visual service, Chromatic, is paid, but you can pair Storybook with a free visual tool instead.</p>
          <p><b>Limitation:</b> it tests components in isolation, so it does not confirm that your full pages and routes hang together.</p>

          <h2 id="crawly">6. Crawly</h2>
          <p><b>Best for:</b> fast no-code smoke checks on React and Next.js.</p>
          <p>
            <Link href="/">Crawly</Link> is a free, open-source Chrome extension that records
            a flow while you use your app, then replays it on demand. A small on-screen spider
            crawls to your fields, types at a human-like 25 milliseconds per key through native
            input events, and pounces on buttons. Because it fires real keystrokes, it works
            with controlled React inputs that ignore values set directly. It prefers{' '}
            <code>data-testid</code> and <code>id</code> selectors, so recordings survive
            hashed class-name changes between builds, and it runs against localhost with no
            account.
          </p>
          <p><b>The cost:</b> free and open source under Apache 2.0.</p>
          <p><b>Limitation:</b> it is a first layer, not a full suite. It is built for quick regression checks on your core flows, not deep assertions on complex business logic.</p>

          <h2 id="backstopjs">7. BackstopJS</h2>
          <p><b>Best for:</b> mature visual regression testing.</p>
          <p>
            When you want to catch unintended visual changes across a page, BackstopJS is the
            most established open-source choice. You define scenarios, it captures a reference
            set, and every run compares against that baseline and shows you a visual diff of
            what moved.
          </p>
          <p><b>The cost:</b> free and open source.</p>
          <p><b>Limitation:</b> configuration takes effort, and screenshot tests can get noisy if your UI has a lot of dynamic content that shifts between runs.</p>

          <h2 id="lost-pixel">8. Lost Pixel</h2>
          <p><b>Best for:</b> visual regression on Storybook.</p>
          <p>
            If your team already lives in Storybook, Lost Pixel is the strongest free pick for
            visual testing. It renders your stories, compares them against baselines, and flags
            visual drift, giving you regression coverage that rides on the stories you already
            write.
          </p>
          <p><b>The cost:</b> free and open source for the core, with an optional paid platform for hosted workflows.</p>
          <p><b>Limitation:</b> it leans on Storybook, so its value depends on your team maintaining stories in the first place.</p>

          <h2 id="selenium">9. Selenium</h2>
          <p><b>Best for:</b> broad browser coverage and legacy or mixed-language stacks.</p>
          <p>
            Selenium is the veteran. It is open source, supports every major browser, and
            speaks many languages, which is why large and older organizations still rely on it.
            For a pure React or Next.js team starting fresh, the newer tools are usually a
            smoother ride, but Selenium remains the widest-reaching free option when you need
            it.
          </p>
          <p><b>The cost:</b> free and open source.</p>
          <p><b>Limitation:</b> more setup and more flakiness than Playwright or Cypress for typical modern web apps.</p>

          <h2 id="quick-comparison">Quick comparison</h2>
          <div className="overflow-x-auto">
            <table>
              <thead>
                <tr><th>Tool</th><th>Layer</th><th>Free path</th><th>Code required</th></tr>
              </thead>
              <tbody>
                <tr><th scope="row">Playwright</th><td>End-to-end</td><td>Fully free, OSS</td><td>Yes</td></tr>
                <tr><th scope="row">Cypress</th><td>End-to-end + component</td><td>OSS runner free, Cloud paid</td><td>Yes</td></tr>
                <tr><th scope="row">React Testing Library</th><td>Component</td><td>Fully free, OSS</td><td>Yes</td></tr>
                <tr><th scope="row">Vitest</th><td>Test runner</td><td>Fully free, OSS</td><td>Yes</td></tr>
                <tr><th scope="row">Storybook</th><td>Component isolation</td><td>Free, OSS (Chromatic paid)</td><td>Some</td></tr>
                <tr><th scope="row">Crawly</th><td>No-code end-to-end</td><td>Fully free, OSS</td><td>No</td></tr>
                <tr><th scope="row">BackstopJS</th><td>Visual</td><td>Fully free, OSS</td><td>Some</td></tr>
                <tr><th scope="row">Lost Pixel</th><td>Visual (Storybook)</td><td>Free core, platform paid</td><td>Some</td></tr>
                <tr><th scope="row">Selenium</th><td>End-to-end</td><td>Fully free, OSS</td><td>Yes</td></tr>
              </tbody>
            </table>
          </div>

          <ArticleFaq qas={faqs.map(({ q, a }) => ({ q, a: <p className="m-0">{a}</p> }))} />

          <h2 id="the-short-version">The short version</h2>
          <p>
            You can build a complete, free UI testing setup for React or Next.js in 2026
            without spending anything. Use Playwright for end-to-end, React Testing Library
            with Vitest for components, a visual tool where look-and-feel matters, and a
            no-code recorder like Crawly when you want coverage fast and code-first tools are
            the reason you have none. Pick one tool per layer, keep it in your workflow, and
            expand from there.
          </p>
        </ArticleLayout>
      </main>
      <Footer />
      <JsonLd data={pageGraph} />
    </>
  );
}
