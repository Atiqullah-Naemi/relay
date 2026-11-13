import type { Metadata } from "next"
import Link from "next/link"
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  Bot,
  CalendarDays,
  Check,
  CirclePlay,
  FileText,
  GitFork,
  Globe2,
  Hash,
  Mail,
  MessageSquareText,
  MousePointer2,
  Plug,
  ScanEye,
  Sparkles,
  Table2,
  Workflow,
} from "lucide-react"

import { LandingPreview } from "@/components/landing-preview"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

import styles from "./page.module.css"

export const metadata: Metadata = {
  title: "Relay — Less busywork. More possibility.",
  description:
    "Build AI agents that work across your apps and the web. Give Relay a goal, connect your tools, and follow every step from one workspace.",
}

const integrations = [
  { name: "Gmail", icon: Mail, color: "text-red-500" },
  { name: "Slack", icon: Hash, color: "text-purple-600" },
  { name: "Notion", icon: FileText, color: "text-zinc-900" },
  { name: "Google Sheets", icon: Table2, color: "text-emerald-600" },
  { name: "GitHub", icon: GitFork, color: "text-zinc-900" },
  { name: "Google Calendar", icon: CalendarDays, color: "text-blue-600" },
]

const steps = [
  {
    number: "01",
    icon: MessageSquareText,
    title: "Tell it what you need.",
    description:
      "Describe the job in your own words. Give your agent a clear goal and the context it needs to get there.",
  },
  {
    number: "02",
    icon: Plug,
    title: "Connect its toolkit.",
    description:
      "Bring your apps and browser together. Choose the tools your agent needs to turn a plan into action.",
  },
  {
    number: "03",
    icon: Sparkles,
    title: "Hand off the busywork.",
    description:
      "Start a run, follow its progress, and review the result. Your next big idea can have your attention back.",
  },
]

const faqs = [
  {
    question: "What can I do with Relay?",
    answer:
      "Relay helps you build AI agents for multi-step tasks across your connected apps and the web. You can research a topic, organize information, prepare updates, or move information between tools. Give your agent a specific goal and connect the apps it needs.",
  },
  {
    question: "Do I need to know how to code?",
    answer:
      "No. You describe what you want your agent to do in plain language, choose its tools, and start a run. Clear instructions and a little context are all you need to get started.",
  },
  {
    question: "Which tools can I connect?",
    answer:
      "Relay supports Gmail, Slack, Notion, Google Sheets, Google Calendar, and GitHub. Agents can also use a browser to work with websites. You can manage your connected accounts in the Integrations page of your workspace.",
  },
  {
    question: "Can I see what my agent is doing?",
    answer:
      "Yes. Each run has a status, an activity log, and an output you can review in your workspace. If an agent needs more information, you can reply and help it continue. You can also stop an active run.",
  },
]

function Brand() {
  return (
    <Link
      href="/"
      aria-label="Relay home"
      className="flex items-center gap-2.5"
    >
      <span className="flex size-9 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm shadow-blue-600/20">
        <Workflow className="size-5" aria-hidden="true" />
      </span>
      <span className="text-2xl font-semibold tracking-[-0.06em]">relay</span>
    </Link>
  )
}

export default function LandingPage() {
  return (
    <div className={styles.page}>
      <a href="#main-content" className={styles.skipLink}>
        Skip to content
      </a>

      <header className="relative z-10 border-b border-slate-200/70 bg-white/90">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-6 gap-y-4 px-5 py-5 sm:px-8">
          <Brand />
          <nav
            aria-label="Main navigation"
            className="order-last flex w-full items-center justify-center gap-7 text-[13px] text-slate-600 md:order-none md:w-auto md:text-sm"
          >
            <a className={styles.navLink} href="#platform">
              Platform
            </a>
            <a className={styles.navLink} href="#how-it-works">
              How it works
            </a>
            <a className={styles.navLink} href="#integrations">
              Integrations
            </a>
          </nav>
          <div className="flex items-center gap-5">
            <Link
              href="/dashboard"
              prefetch={false}
              className={cn(styles.navLink, "hidden text-sm sm:inline-flex")}
            >
              Log in
            </Link>
            <Button
              render={<Link href="/dashboard" prefetch={false} />}
              nativeButton={false}
              className={cn(styles.darkButton, "h-10 gap-2 rounded-lg px-4")}
            >
              Get started <ArrowUpRight className="size-4" aria-hidden="true" />
            </Button>
          </div>
        </div>
      </header>

      <main id="main-content" className={styles.main}>
        <section className={styles.hero} aria-labelledby="hero-heading">
          <div className="relative mx-auto max-w-6xl px-5 pt-16 sm:px-8 sm:pt-24">
            <div className="mx-auto max-w-3xl text-center">
              <a href="#platform" className={styles.eyebrow}>
                <span className="relative flex size-2">
                  <span className="absolute inline-flex size-full rounded-full bg-blue-400 opacity-40 motion-safe:animate-ping" />
                  <span className="relative inline-flex size-2 rounded-full bg-blue-600" />
                </span>
                Meet your new unfair advantage
                <ArrowRight className="size-3.5" aria-hidden="true" />
              </a>
              <h1 id="hero-heading" className={styles.heroTitle}>
                Less busywork.
                <br />
                <span className="text-blue-600">More possibility.</span>
              </h1>
              <p className={styles.heroDescription}>
                Give your work a little extra intelligence. Build AI agents that
                use your tools, handle the repetitive stuff, and move things
                forward.
              </p>
              <div className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
                <Button
                  render={<Link href="/dashboard" prefetch={false} />}
                  nativeButton={false}
                  className={cn(
                    styles.primaryButton,
                    "h-12 gap-3 rounded-xl px-6"
                  )}
                >
                  Build your first agent
                  <ArrowRight className="size-4" aria-hidden="true" />
                </Button>
                <Button
                  variant="outline"
                  render={<a href="#demo" />}
                  nativeButton={false}
                  className={cn(
                    styles.secondaryButton,
                    "h-12 gap-2.5 rounded-xl px-6"
                  )}
                >
                  <CirclePlay className="size-4" aria-hidden="true" />
                  See it in action
                </Button>
              </div>
              <div className="mt-5 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-slate-500">
                <span className="flex items-center gap-1.5">
                  <Check
                    className="size-3.5 text-blue-600"
                    aria-hidden="true"
                  />
                  No code required
                </span>
                <span className="flex items-center gap-1.5">
                  <Check
                    className="size-3.5 text-blue-600"
                    aria-hidden="true"
                  />
                  Your tools, connected
                </span>
                <span className="flex items-center gap-1.5">
                  <Check
                    className="size-3.5 text-blue-600"
                    aria-hidden="true"
                  />
                  You stay in control
                </span>
              </div>
            </div>

            <div id="demo" className="relative mt-14 scroll-mt-8 sm:mt-16">
              <div className="mb-4 flex items-center justify-center gap-2 text-xs text-slate-500">
                A little preview of your next workday
                <ArrowDown className="size-3.5" aria-hidden="true" />
              </div>
              <LandingPreview />
            </div>
          </div>
        </section>

        <section
          id="integrations"
          aria-labelledby="integrations-heading"
          className="mx-auto max-w-6xl scroll-mt-10 px-5 pt-14 pb-16 sm:px-8 sm:pb-24"
        >
          <h2
            id="integrations-heading"
            className="text-center text-sm font-medium text-slate-500"
          >
            Your favorite tools. A new way to work with them.
          </h2>
          <div className="mt-8 grid grid-cols-2 items-center justify-items-center gap-x-6 gap-y-7 sm:grid-cols-3 lg:flex lg:justify-between">
            {integrations.map(({ name, icon: Icon, color }) => (
              <div
                key={name}
                className="flex items-center gap-2.5 text-sm font-semibold tracking-tight text-slate-600"
              >
                <Icon className={cn("size-5", color)} aria-hidden="true" />
                {name}
              </div>
            ))}
          </div>
        </section>

        <section
          id="platform"
          aria-labelledby="platform-heading"
          className="scroll-mt-10 border-y border-slate-200/70 bg-slate-50/70 py-16 sm:py-24"
        >
          <div className="mx-auto max-w-6xl px-5 sm:px-8">
            <div className="mb-10 flex flex-col justify-between gap-5 md:flex-row md:items-end">
              <div>
                <span className={styles.sectionLabel}>
                  A SMALL TEAM&apos;S SUPERPOWER
                </span>
                <h2 id="platform-heading" className={styles.sectionTitle}>
                  Not just answers.
                  <br />
                  Actual, done-and-dusted work.
                </h2>
              </div>
              <p className="max-w-sm text-[15px] text-slate-500">
                From the first instruction to the final result, Relay brings
                your tools and tasks into one connected workspace.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <Card className="rounded-2xl bg-white py-0 shadow-none ring-slate-200/80 md:col-span-2">
                <CardContent className="flex h-full flex-col gap-8 p-7 sm:p-9">
                  <div>
                    <span className={styles.featureIcon}>
                      <Globe2 className="size-5" aria-hidden="true" />
                    </span>
                    <h3 className={styles.featureTitle}>
                      One agent. Your whole toolkit.
                    </h3>
                    <p className="mt-2 max-w-md text-sm text-slate-500">
                      Research on the web, organize it in a doc, and share it
                      with your team. Your agent connects the dots across your
                      apps.
                    </p>
                  </div>
                  <div
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-100 bg-slate-50/70 px-3 py-7 sm:gap-4"
                    aria-label="Relay connects your browser, documents, and team messaging"
                  >
                    <span className="flex size-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 sm:size-14">
                      <Globe2 className="size-5" aria-hidden="true" />
                    </span>
                    <span className="h-px w-3 bg-slate-300 sm:w-7" />
                    <span className="flex size-14 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-600/20 sm:size-16">
                      <Workflow className="size-7" aria-hidden="true" />
                    </span>
                    <span className="h-px w-3 bg-slate-300 sm:w-7" />
                    <span className="flex size-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 sm:size-14">
                      <FileText className="size-5" aria-hidden="true" />
                    </span>
                    <span className="h-px w-3 bg-slate-300 sm:w-7" />
                    <span className="flex size-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-purple-600 sm:size-14">
                      <Hash className="size-5" aria-hidden="true" />
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-2xl bg-blue-50/60 py-0 shadow-none ring-blue-100">
                <CardContent className="flex h-full flex-col p-7 sm:p-9">
                  <span className={styles.featureIcon}>
                    <MousePointer2 className="size-5" aria-hidden="true" />
                  </span>
                  <h3 className={styles.featureTitle}>
                    The web is its workspace.
                  </h3>
                  <p className="mt-2 text-sm text-slate-500">
                    Give your agent a browser to navigate websites and take the
                    next step beyond a conversation.
                  </p>
                  <div className="mt-8 overflow-hidden rounded-xl border border-blue-100 bg-white shadow-sm">
                    <div
                      className="flex items-center gap-1 border-b border-slate-100 px-3 py-2.5"
                      aria-hidden="true"
                    >
                      <span className="size-1.5 rounded-full bg-slate-200" />
                      <span className="size-1.5 rounded-full bg-slate-200" />
                      <span className="size-1.5 rounded-full bg-slate-200" />
                      <span className="ml-2 h-3 w-24 rounded bg-slate-100" />
                    </div>
                    <div className="space-y-3 p-4">
                      <div className="h-2 w-2/3 rounded bg-slate-200" />
                      <div className="h-2 w-full rounded bg-slate-100" />
                      <div className="flex items-center gap-2 pt-1 text-xs font-medium text-blue-600">
                        <Check className="size-3.5" aria-hidden="true" />
                        Next step, handled.
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-2xl bg-white py-0 shadow-none ring-slate-200/80">
                <CardContent className="p-7 sm:p-9">
                  <span className={styles.featureIcon}>
                    <MessageSquareText className="size-5" aria-hidden="true" />
                  </span>
                  <h3 className={styles.featureTitle}>
                    If you can say it,
                    <br />
                    you can delegate it.
                  </h3>
                  <p className="mt-2 text-sm text-slate-500">
                    Start with a goal, not a flowchart. Plain-language
                    instructions turn your know-how into your agent&apos;s next
                    task.
                  </p>
                </CardContent>
              </Card>

              <Card className="rounded-2xl bg-white py-0 shadow-none ring-slate-200/80 md:col-span-2">
                <CardContent className="flex h-full flex-col gap-6 p-7 sm:flex-row sm:items-center sm:p-9">
                  <div className="flex-1">
                    <span className={styles.featureIcon}>
                      <ScanEye className="size-5" aria-hidden="true" />
                    </span>
                    <h3 className={styles.featureTitle}>
                      Autonomous. Never out of sight.
                    </h3>
                    <p className="mt-2 max-w-sm text-sm text-slate-500">
                      Follow every run, see what happened, and step in when your
                      agent needs a little direction. You&apos;re always in the
                      loop.
                    </p>
                  </div>
                  <div className="space-y-4 rounded-xl border border-slate-100 bg-slate-50/70 p-5 text-xs sm:w-48">
                    {[
                      "Instructions received",
                      "Tools connected",
                      "Results ready to review",
                    ].map((step) => (
                      <div
                        key={step}
                        className="flex items-center gap-2.5 text-slate-600"
                      >
                        <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                          <Check className="size-3" aria-hidden="true" />
                        </span>
                        {step}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section
          id="how-it-works"
          aria-labelledby="steps-heading"
          className="mx-auto max-w-6xl scroll-mt-10 px-5 py-16 sm:px-8 sm:py-24"
        >
          <div className="text-center">
            <span className={styles.sectionLabel}>LESS SETUP. MORE GO.</span>
            <h2 id="steps-heading" className={styles.sectionTitle}>
              From “I should” to “it&apos;s done.”
            </h2>
            <p className="mt-4 text-base text-slate-500">
              A simpler way to get a little more off your plate.
            </p>
          </div>
          <div className="mt-12 grid gap-10 md:grid-cols-3 md:gap-8">
            {steps.map(({ number, icon: Icon, title, description }) => (
              <div key={number} className="relative">
                <div className="mb-6 flex items-center gap-4">
                  <span className="flex size-12 items-center justify-center rounded-2xl border border-slate-200 bg-white text-blue-600 shadow-sm">
                    <Icon className="size-5" aria-hidden="true" />
                  </span>
                  <span className="h-px flex-1 bg-slate-200" />
                  <span className="font-mono text-xs text-slate-400">
                    {number}
                  </span>
                </div>
                <h3 className={styles.stepTitle}>{title}</h3>
                <p className="mt-3 max-w-sm text-sm text-slate-500">
                  {description}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section
          aria-labelledby="faq-heading"
          className="border-t border-slate-200/70 bg-slate-50/60 py-16 sm:py-24"
        >
          <div className="mx-auto grid max-w-6xl gap-8 px-5 sm:px-8 md:grid-cols-[1fr_1.3fr] md:gap-20">
            <div>
              <span className={styles.sectionLabel}>GOOD QUESTIONS</span>
              <h2 id="faq-heading" className={styles.sectionTitle}>
                A little clarity
                <br />
                before you start.
              </h2>
              <p className="mt-4 max-w-xs text-sm text-slate-500">
                Everything you need to know about adding an AI agent to your
                team.
              </p>
            </div>
            <Accordion defaultValue={["faq-0"]}>
              {faqs.map(({ question, answer }, index) => (
                <AccordionItem
                  key={question}
                  value={`faq-${index}`}
                  className="border-slate-200"
                >
                  <AccordionTrigger className={styles.faqTrigger}>
                    {question}
                  </AccordionTrigger>
                  <AccordionContent className="pr-6 pb-6 text-sm leading-relaxed text-slate-500">
                    {answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        <section
          aria-labelledby="cta-heading"
          className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-20"
        >
          <div className={styles.cta}>
            <div className="relative z-10">
              <span className="mb-5 inline-flex size-12 items-center justify-center rounded-2xl border border-white/15 bg-white/10">
                <Bot className="size-6" aria-hidden="true" />
              </span>
              <h2
                id="cta-heading"
                className="text-3xl font-semibold tracking-[-0.045em] sm:text-5xl"
              >
                Your best work is still yours.
                <br />
                <span className="text-blue-300">
                  Let Relay handle the rest.
                </span>
              </h2>
              <p className="mx-auto mt-5 max-w-md text-base text-slate-300">
                Make room for the work that moves you. Your first agent is a
                good place to start.
              </p>
              <Button
                render={<Link href="/dashboard" prefetch={false} />}
                nativeButton={false}
                className={cn(
                  styles.whiteButton,
                  "mt-8 h-12 gap-3 rounded-xl px-6"
                )}
              >
                Get started with Relay{" "}
                <ArrowRight className="size-4" aria-hidden="true" />
              </Button>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200/70">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 px-5 py-8 sm:flex-row sm:px-8">
          <Brand />
          <span className="text-xs text-slate-500">
            A little less busy. A lot more possible.
          </span>
          <nav
            aria-label="Footer navigation"
            className="flex gap-6 text-xs text-slate-500"
          >
            <a href="#platform" className={styles.navLink}>
              Platform
            </a>
            <a href="#how-it-works" className={styles.navLink}>
              How it works
            </a>
            <Link href="/dashboard" prefetch={false} className={styles.navLink}>
              Open workspace <span aria-hidden="true">↗</span>
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  )
}
