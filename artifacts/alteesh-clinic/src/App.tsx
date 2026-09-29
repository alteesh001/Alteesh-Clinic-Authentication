import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { ClerkProvider, SignIn, SignUp, useAuth, useClerk, useUser } from "@clerk/react";
import { publishableKeyFromHost } from "@clerk/react/internal";
import { shadcn } from "@clerk/themes";
import {
  Activity,
  AlertCircle,
  ArrowUpRight,
  BadgeCheck,
  Bell,
  Building2,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  CircleHelp,
  ClipboardList,
  Clock3,
  FileText,
  HeartPulse,
  Home,
  Languages,
  LockKeyhole,
  LogOut,
  Menu,
  MessageCircle,
  MonitorDot,
  MoreHorizontal,
  PanelLeftClose,
  Plus,
  Settings2,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  UserPlus,
  UserRound,
  UsersRound,
  X,
} from "lucide-react";
import { QueryClient, QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import {
  getGetAuthStatusQueryKey,
  getGetCurrentUserQueryKey,
  useBootstrapAdmin,
  useGetAuthStatus,
  useGetCurrentUser,
} from "@workspace/api-client-react";
import type { AuthProfile, AuthProfileRole } from "@workspace/api-client-react";
import { ErrorBoundary } from "@/components/error-boundary";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { Redirect, Route, Switch, useLocation, Router as WouterRouter, Link } from "wouter";

const queryClient = new QueryClient();
const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");
const clerkPubKey = publishableKeyFromHost(
  window.location.hostname,
  import.meta.env.VITE_CLERK_PUBLISHABLE_KEY,
);
const clerkProxyUrl = import.meta.env.VITE_CLERK_PROXY_URL;

if (!clerkPubKey) {
  throw new Error("Missing VITE_CLERK_PUBLISHABLE_KEY in .env file");
}

function stripBase(path: string) {
  return basePath && path.startsWith(basePath) ? path.slice(basePath.length) || "/" : path;
}

const clerkAppearance = {
  theme: shadcn,
  cssLayerName: "clerk",
  options: {
    logoPlacement: "inside" as const,
    logoLinkUrl: basePath || "/",
    logoImageUrl: `${window.location.origin}${basePath}/logo.svg`,
    socialButtonsPlacement: "top" as const,
    socialButtonsVariant: "blockButton" as const,
  },
  variables: {
    colorPrimary: "hsl(166 37% 35%)",
    colorForeground: "hsl(227 26% 19%)",
    colorMutedForeground: "hsl(226 13% 46%)",
    colorDanger: "hsl(3 58% 48%)",
    colorBackground: "hsl(42 38% 98%)",
    colorInput: "hsl(42 36% 96%)",
    colorInputForeground: "hsl(227 26% 19%)",
    colorNeutral: "hsl(39 22% 84%)",
    fontFamily: "'DM Sans', 'Noto Sans Arabic', sans-serif",
    borderRadius: "0.9rem",
  },
  elements: {
    rootBox: "w-full flex justify-center",
    cardBox: "bg-[#fbfaf6] rounded-[1.5rem] w-[440px] max-w-full overflow-hidden shadow-xl",
    card: "!shadow-none !border-0 !bg-transparent !rounded-none",
    footer: "!shadow-none !border-0 !bg-transparent !rounded-none",
    headerTitle: "text-[#26313b] font-semibold tracking-[-0.025em]",
    headerSubtitle: "text-[#6d7475]",
    socialButtonsBlockButtonText: "text-[#26313b] font-medium",
    formFieldLabel: "text-[#26313b] font-medium",
    footerActionLink: "text-[#1f7567] font-semibold",
    footerActionText: "text-[#6d7475]",
    dividerText: "text-[#8b918f]",
    identityPreviewEditButton: "text-[#1f7567]",
    formFieldSuccessText: "text-[#1f7567]",
    alertText: "text-[#8f3e37]",
    logoBox: "h-12",
    logoImage: "h-12 w-12 rounded-2xl",
    socialButtonsBlockButton: "border-[#dedfd8] bg-[#f7f5ef] hover:bg-[#efeee7]",
    formButtonPrimary: "bg-[#1f7567] hover:bg-[#185d54] text-[#fbfaf6] rounded-xl shadow-none",
    formFieldInput: "bg-[#f7f5ef] border-[#dedfd8] text-[#26313b] rounded-xl",
    footerAction: "bg-transparent",
    dividerLine: "bg-[#dedfd8]",
    alert: "bg-[#fff1ee] border-[#f0c6bd]",
    otpCodeFieldInput: "border-[#dedfd8] bg-[#f7f5ef]",
    formFieldRow: "gap-2",
    main: "gap-5",
  },
};

function BrandMark({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`flex items-center gap-3 ${compact ? "gap-2" : ""}`} data-testid="brand-alteesh">
      <div className="relative grid size-11 shrink-0 place-items-center rounded-[15px] bg-[#19383a] shadow-[0_8px_20px_hsl(183_39%_20%/.16)]">
        <div className="absolute size-6 rounded-full border-[5px] border-[#a9d4c8]" />
        <div className="absolute h-1.5 w-7 rounded-full bg-[#a9d4c8]" />
        <div className="absolute h-7 w-1.5 rounded-full bg-[#a9d4c8]" />
        <div className="absolute -bottom-1.5 left-1/2 h-2 w-8 -translate-x-1/2 rounded-full border-b-2 border-[#f2c477]" />
      </div>
      <div className="leading-none">
        <p className="font-semibold tracking-[-0.04em] text-[#203b3d]">Alteesh</p>
        <p className="mt-1 text-[10px] font-medium uppercase tracking-[0.2em] text-[#6e817d]">
          Clinic OS
        </p>
      </div>
    </div>
  );
}

function LoadingScene({ label = "Preparing your clinic space" }: { label?: string }) {
  return (
    <div className="grid min-h-[100dvh] place-items-center bg-[#f4f1e9] px-6">
      <div className="w-full max-w-sm space-y-6 text-center">
        <div className="mx-auto size-14 animate-breathe rounded-[20px] bg-[#19383a]/10 p-1">
          <div className="grid size-full place-items-center rounded-[16px] bg-[#19383a]">
            <HeartPulse className="size-6 text-[#a9d4c8]" strokeWidth={1.7} />
          </div>
        </div>
        <div className="space-y-2">
          <div className="mx-auto h-3 w-40 animate-pulse rounded-full bg-[#d8d6cc]" />
          <div className="mx-auto h-2.5 w-56 animate-pulse rounded-full bg-[#e5e2d9]" />
        </div>
        <p className="text-sm text-[#6d7475]" data-testid="status-loading">{label}</p>
      </div>
    </div>
  );
}

function StatusNotice({
  title,
  detail,
  onRetry,
}: {
  title: string;
  detail: string;
  onRetry?: () => void;
}) {
  return (
    <div className="rounded-2xl border border-[#ead5c8] bg-[#fff8f2] p-5" data-testid="status-error">
      <div className="flex items-start gap-3">
        <div className="grid size-9 shrink-0 place-items-center rounded-xl bg-[#f3d5c7] text-[#9a5545]">
          <AlertCircle className="size-4" />
        </div>
        <div className="min-w-0">
          <p className="font-semibold text-[#26313b]">{title}</p>
          <p className="mt-1 text-sm leading-6 text-[#737977]">{detail}</p>
          {onRetry ? (
            <button
              className="mt-3 text-sm font-semibold text-[#1f7567] underline-offset-4 hover:underline focus-ring"
              onClick={onRetry}
              data-testid="button-retry"
            >
              Try again
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function PublicNav() {
  return (
    <header className="absolute inset-x-0 top-0 z-20">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8 lg:px-12">
        <Link href="/" className="focus-ring rounded-xl" data-testid="link-home-logo">
          <BrandMark />
        </Link>
        <div className="flex items-center gap-2 sm:gap-4">
          <span className="hidden items-center gap-2 text-xs font-medium text-[#71817d] sm:flex" data-testid="text-language">
            <Languages className="size-3.5" />
            العربية / English
          </span>
          <Link
            href="/sign-in"
            className="focus-ring rounded-xl px-3 py-2 text-sm font-semibold text-[#2d4b4b] transition-colors hover:bg-[#e8e7dd] sm:px-4"
            data-testid="link-sign-in"
          >
            Sign in
          </Link>
          <Link
            href="/sign-up"
            className="focus-ring rounded-xl bg-[#19383a] px-4 py-2.5 text-sm font-semibold text-[#f8f4eb] shadow-[0_8px_18px_hsl(183_39%_20%/.16)] transition-transform hover:-translate-y-0.5 sm:px-5"
            data-testid="link-sign-up"
          >
            Get started
          </Link>
        </div>
      </div>
    </header>
  );
}

function HomePage() {
  return (
    <main className="overflow-hidden bg-[#f4f1e9] text-[#26313b]">
      <PublicNav />
      <section className="relative min-h-[720px] border-b border-[#dedbd1] px-5 pb-16 pt-32 sm:px-8 lg:px-12">
        <div className="pointer-events-none absolute -right-24 top-10 size-[430px] rounded-full bg-[#b6d9cc]/30 blur-3xl" />
        <div className="pointer-events-none absolute -left-40 bottom-4 size-[420px] rounded-full bg-[#f2c477]/20 blur-3xl" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-[1.02fr_.98fr] lg:gap-20">
          <div className="animate-rise-in max-w-2xl">
            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-[#c8d8cf] bg-[#eaf1ec] px-3.5 py-2 text-xs font-semibold text-[#35665e]" data-testid="badge-secure-care">
              <ShieldCheck className="size-3.5" />
              Private by design · مصمم لخصوصيتكم
            </div>
            <h1 className="max-w-3xl text-[clamp(3.35rem,8vw,7rem)] font-semibold leading-[.98] tracking-[-0.075em] text-[#203b3d]">
              Your clinic,
              <span className="block text-[#3b8175]">in good hands.</span>
            </h1>
            <p className="mt-7 max-w-xl text-[1.05rem] leading-8 text-[#66716f] sm:text-lg" dir="rtl">
              مساحة هادئة لفريقك الطبي — من أول موعد إلى آخر ملاحظة.
              <span dir="ltr" className="mt-2 block text-base sm:text-lg">
                A calmer, clearer way to run the care behind every patient visit.
              </span>
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-3">
              <Link
                href="/sign-up"
                className="focus-ring group inline-flex items-center gap-3 rounded-2xl bg-[#1f7567] px-5 py-3.5 text-sm font-semibold text-[#faf7ef] shadow-[0_12px_24px_hsl(166_37%_30%/.2)] transition-all hover:-translate-y-1 hover:bg-[#185d54]"
                data-testid="button-start-clinic"
              >
                Create your clinic space
                <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Link>
              <a
                href="#workspace"
                className="focus-ring inline-flex items-center gap-2 rounded-2xl px-4 py-3.5 text-sm font-semibold text-[#45605d] hover:bg-[#e8e7dd]"
                data-testid="link-see-workspace"
              >
                See how it works
                <ChevronRight className="size-4" />
              </a>
            </div>
            <div className="mt-12 flex items-center gap-4 text-xs text-[#7c8581]">
              <div className="flex -space-x-2">
                {["RA", "MS", "ND"].map((initials, index) => (
                  <div
                    key={initials}
                    className={`grid size-8 place-items-center rounded-full border-2 border-[#f4f1e9] text-[10px] font-bold ${index === 0 ? "bg-[#19383a] text-[#b9ded2]" : index === 1 ? "bg-[#dbb36d] text-[#42362a]" : "bg-[#bacbdc] text-[#263d4b]"}`}
                    data-testid={`avatar-team-${index}`}
                  >
                    {initials}
                  </div>
                ))}
              </div>
              <span>Built for the people who keep care moving.</span>
            </div>
          </div>
          <div className="animate-rise-in delay-2 relative" dir="ltr">
            <div className="absolute -left-8 top-10 hidden w-36 -rotate-6 rounded-2xl border border-[#ead9b6] bg-[#fff8e8] p-4 shadow-[0_18px_40px_hsl(38_40%_32%/.1)] sm:block">
              <p className="text-[10px] font-semibold uppercase tracking-[.16em] text-[#a67a35]">Today</p>
              <p className="mt-2 text-sm font-semibold text-[#5b4c35]">A little lighter</p>
              <div className="mt-3 h-1.5 w-16 rounded-full bg-[#e8c982]" />
              <div className="mt-2 h-1.5 w-24 rounded-full bg-[#f0dfb8]" />
            </div>
            <div className="clinic-shadow relative ml-auto max-w-[530px] overflow-hidden rounded-[28px] border border-[#d9ddd3] bg-[#fbfaf6]">
              <div className="flex items-center justify-between border-b border-[#e8e5dc] px-5 py-4 sm:px-7">
                <div className="flex items-center gap-3">
                  <div className="grid size-8 place-items-center rounded-xl bg-[#e2f0e9] text-[#317567]"><HeartPulse className="size-4" /></div>
                  <div>
                    <p className="text-xs font-semibold text-[#344442]">Alteesh · صباح الخير</p>
                    <p className="text-[10px] text-[#89918c]">Sunday, 26 May 2024</p>
                  </div>
                </div>
                <div className="grid size-8 place-items-center rounded-xl bg-[#f3f1eb] text-[#7c8681]"><Bell className="size-4" /></div>
              </div>
              <div className="grid gap-5 p-5 sm:p-7">
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-xs text-[#89918c]">Good morning, Dr. Lina</p>
                    <p className="mt-1 text-xl font-semibold tracking-[-.04em] text-[#263b3b]">Your clinic at a glance</p>
                  </div>
                  <span className="rounded-full bg-[#edf3ee] px-2.5 py-1 text-[10px] font-semibold text-[#3a786c]">Live</span>
                </div>
                <div className="grid grid-cols-3 gap-2.5">
                  {[
                    ["12", "Appointments", "bg-[#e3f0ec] text-[#34766b]"],
                    ["04", "Team online", "bg-[#f9edd6] text-[#927038]"],
                    ["03", "Follow-ups", "bg-[#e8e9f0] text-[#5d6683]"],
                  ].map(([value, label, tone]) => (
                    <div className="rounded-2xl border border-[#e9e6de] p-3" key={label}>
                      <div className={`grid size-8 place-items-center rounded-xl text-sm font-semibold ${tone}`}>{value}</div>
                      <p className="mt-3 text-[10px] text-[#89918c]">{label}</p>
                    </div>
                  ))}
                </div>
                <div className="rounded-2xl border border-[#e7e8df] bg-[#f7f8f3] p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold text-[#52605d]">Next on your list</p>
                    <span className="text-[10px] font-medium text-[#9ba29e]">09:30 — 12:00</span>
                  </div>
                  <div className="mt-4 space-y-3">
                    {["Mariam A.", "Omar K.", "Noura S."].map((name, index) => (
                      <div className="flex items-center gap-3" key={name}>
                        <div className="size-1.5 rounded-full bg-[#3b8175]" />
                        <span className="flex-1 text-xs text-[#53605d]">{name}</span>
                        <span className="text-[10px] text-[#9ba29e]">{["09:30", "10:15", "11:00"][index]}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div className="absolute -bottom-7 right-5 hidden rounded-2xl border border-[#cfe1da] bg-[#eff8f2] px-4 py-3 shadow-[0_14px_30px_hsl(166_25%_30%/.1)] sm:block">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#34766b]"><CheckCircle2 className="size-4" /> Everything in its place</div>
            </div>
          </div>
        </div>
      </section>

      <section id="workspace" className="border-b border-[#dedbd1] bg-[#fbfaf6] px-5 py-24 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-10 lg:grid-cols-[.7fr_1.3fr] lg:items-end">
            <div>
              <p className="text-xs font-bold uppercase tracking-[.22em] text-[#6c978d]">One clear rhythm</p>
              <h2 className="mt-4 max-w-md text-4xl font-semibold leading-[1.05] tracking-[-.06em] text-[#263b3b] sm:text-5xl">
                Less chasing.<br />More caring.
              </h2>
            </div>
            <p className="max-w-xl text-base leading-8 text-[#707b78] lg:mb-1 lg:justify-self-end" dir="rtl">
              كل ما يحتاجه فريقك، في مكان واحد واضح ومطمئن.
              <span dir="ltr" className="mt-2 block">Simple enough for a busy front desk. Thoughtful enough for clinical work.</span>
            </p>
          </div>
          <div className="mt-16 grid gap-4 md:grid-cols-3">
            {[
              { icon: UsersRound, number: "01", title: "A shared pulse", text: "Keep front desk, nurses, and clinicians aligned without adding another noisy channel.", tone: "bg-[#e6f0eb]", iconTone: "text-[#34766b]" },
              { icon: LockKeyhole, number: "02", title: "Quietly secure", text: "Role-aware access and a privacy-first foundation for the moments that matter.", tone: "bg-[#f8edd8]", iconTone: "text-[#9a7435]" },
              { icon: HeartPulse, number: "03", title: "Care in context", text: "The right signal at the right time, so your team can stay with the patient.", tone: "bg-[#e9eaf1]", iconTone: "text-[#596783]" },
            ].map(({ icon: Icon, number, title, text, tone, iconTone }, index) => (
              <article key={number} className={`group relative min-h-[285px] overflow-hidden rounded-[24px] border border-[#e4e2d9] p-6 transition-transform hover:-translate-y-1 ${index === 1 ? "bg-[#faf7ef]" : "bg-[#fbfaf6]"}`} data-testid={`card-principle-${number}`}>
                <div className={`grid size-11 place-items-center rounded-2xl ${tone} ${iconTone}`}><Icon className="size-5" /></div>
                <p className="mt-8 text-[11px] font-bold tracking-[.18em] text-[#a3aaa5]">{number}</p>
                <h3 className="mt-3 text-xl font-semibold tracking-[-.035em] text-[#344442]">{title}</h3>
                <p className="mt-3 max-w-xs text-sm leading-6 text-[#7a8380]">{text}</p>
                <div className="absolute -bottom-10 -right-8 size-32 rounded-full border-[18px] border-[#e8eee8]/80 transition-transform group-hover:scale-110" />
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#19383a] px-5 py-20 text-[#f7f4eb] sm:px-8 lg:px-12">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-[.22em] text-[#a9d4c8]">Start with one good decision</p>
            <h2 className="mt-5 max-w-2xl text-4xl font-semibold leading-[1.04] tracking-[-.06em] sm:text-6xl">
              Make room for<br /><span className="text-[#f2c477]">better care.</span>
            </h2>
            <p className="mt-6 max-w-lg leading-7 text-[#c4d2cc]">Alteesh gives your clinic a dependable home base — with the clarity your team deserves from day one.</p>
          </div>
          <div className="flex flex-col items-start gap-4 lg:items-end">
            <Link href="/sign-up" className="focus-ring inline-flex items-center gap-3 rounded-2xl bg-[#f2c477] px-5 py-3.5 text-sm font-bold text-[#344032] transition-transform hover:-translate-y-1" data-testid="button-cta-sign-up">
              Open your clinic space <ArrowUpRight className="size-4" />
            </Link>
            <span className="text-xs text-[#a8bbb3]">No complicated setup. Just your team and a clear first step.</span>
          </div>
        </div>
      </section>
      <footer className="flex flex-wrap items-center justify-between gap-4 bg-[#19383a] px-5 pb-8 text-xs text-[#8ea8a0] sm:px-8 lg:px-12">
        <div className="flex items-center gap-2"><BrandMark compact /><span className="ml-2 text-[#78958d]">© 2024 Alteesh Clinic</span></div>
        <span dir="rtl">رعاية أوضح تبدأ من هنا</span>
      </footer>
    </main>
  );
}

function AuthPage({ mode }: { mode: "sign-in" | "sign-up" }) {
  return (
    <main className="relative flex min-h-[100dvh] items-center justify-center overflow-hidden bg-[#e9eeea] px-4 py-12">
      <div className="pointer-events-none absolute -left-24 top-1/4 size-80 rounded-full bg-[#c2dfd4]/50 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 bottom-0 size-96 rounded-full bg-[#f2c477]/25 blur-3xl" />
      <div className="relative z-10 flex w-full flex-col items-center">
        <div className="mb-7 flex flex-col items-center gap-4 text-center">
          <Link href="/" className="focus-ring rounded-xl" data-testid="link-auth-logo"><BrandMark /></Link>
          <div>
            <p className="text-sm font-semibold text-[#345d58]" dir="rtl">مساحة عمل هادئة لفريقك الطبي</p>
            <p className="mt-1 text-xs text-[#71807b]">{mode === "sign-in" ? "Welcome back to your clinic space." : "Set up a better rhythm for your clinic."}</p>
          </div>
        </div>
        {mode === "sign-in" ? (
          <SignIn routing="path" path={`${basePath}/sign-in`} signUpUrl={`${basePath}/sign-up`} />
        ) : (
          <SignUp routing="path" path={`${basePath}/sign-up`} signInUrl={`${basePath}/sign-in`} />
        )}
        <p className="mt-7 flex items-center gap-2 text-[11px] text-[#74817d]"><ShieldCheck className="size-3.5 text-[#4b897c]" /> Your clinic data stays private and protected.</p>
      </div>
    </main>
  );
}

function HomeRedirect() {
  const { isLoaded, isSignedIn } = useAuth();
  if (!isLoaded) return <LoadingScene />;
  return isSignedIn ? <Redirect to="/portal" /> : <HomePage />;
}

function OnboardingPage() {
  const { isLoaded, isSignedIn } = useAuth();
  const { user } = useUser();
  const [, setLocation] = useLocation();
  const queryClientRef = useQueryClient();
  const status = useGetAuthStatus({ query: { queryKey: getGetAuthStatusQueryKey() } });
  const profile = useGetCurrentUser({
    query: { enabled: isSignedIn === true, queryKey: getGetCurrentUserQueryKey() },
  });
  const bootstrap = useBootstrapAdmin();
  const [fullName, setFullName] = useState("");
  const [clinicName, setClinicName] = useState("");
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    if (user && !fullName) {
      setFullName([user.firstName, user.lastName].filter(Boolean).join(" "));
    }
  }, [user, fullName]);

  if (!isLoaded) return <LoadingScene />;
  if (!isSignedIn) return <Redirect to="/sign-in" />;
  if (profile.isLoading || status.isLoading) return <LoadingScene label="Checking your clinic setup" />;
  if (profile.data?.isOnboarded) return <Redirect to="/portal" />;

  const fullNameError = touched && fullName.trim().length < 2;
  const clinicNameError = touched && clinicName.trim().length < 2;
  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setTouched(true);
    if (fullName.trim().length < 2 || clinicName.trim().length < 2) return;
    bootstrap.mutate(
      { data: { fullName: fullName.trim(), clinicName: clinicName.trim() } },
      {
        onSuccess: (nextProfile) => {
          queryClientRef.setQueryData(getGetCurrentUserQueryKey(), nextProfile);
          queryClientRef.setQueryData(getGetAuthStatusQueryKey(), { configured: true, clinicName: nextProfile.clinicName });
          setLocation("/portal");
        },
      },
    );
  };

  return (
    <main className="min-h-[100dvh] bg-[#f4f1e9] px-5 py-8 sm:px-8 lg:px-12">
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        <Link href="/" className="focus-ring rounded-xl" data-testid="link-onboarding-logo"><BrandMark /></Link>
        <div className="flex items-center gap-2 text-xs text-[#71807d]"><LockKeyhole className="size-3.5" /> Secure setup</div>
      </div>
      <div className="mx-auto grid max-w-6xl items-center gap-14 py-16 lg:grid-cols-[.82fr_1.18fr] lg:py-24">
        <div className="animate-rise-in">
          <div className="grid size-12 place-items-center rounded-2xl bg-[#e3f0eb] text-[#34766b]"><Sparkles className="size-5" /></div>
          <p className="mt-7 text-xs font-bold uppercase tracking-[.2em] text-[#6c978d]">Your first step</p>
          <h1 className="mt-4 max-w-lg text-5xl font-semibold leading-[1.02] tracking-[-.07em] text-[#203b3d] sm:text-6xl">Give your clinic a name and a calm beginning.</h1>
          <p className="mt-6 max-w-md leading-7 text-[#707b78]" dir="rtl">لنبدأ بتفاصيل بسيطة. يمكنك تعديلها لاحقاً من إعدادات العيادة.</p>
          <p className="mt-3 max-w-md text-sm leading-6 text-[#89918c]">You’re creating the first administrator profile. This person will guide access for the rest of your team.</p>
          <div className="mt-9 flex items-center gap-3 text-xs text-[#6f7f79]"><div className="grid size-8 place-items-center rounded-full bg-[#19383a] text-[#b8dcd0]"><BadgeCheck className="size-4" /></div> Signed in as {user?.primaryEmailAddress?.emailAddress ?? "your account"}</div>
        </div>
        <div className="animate-rise-in delay-2 rounded-[28px] border border-[#dedbd1] bg-[#fbfaf6] p-6 shadow-[0_25px_70px_hsl(227_26%_19%/.08)] sm:p-9">
          <div className="mb-8 flex items-start justify-between">
            <div><p className="text-xl font-semibold tracking-[-.04em] text-[#263b3b]">Set up your clinic</p><p className="mt-1 text-sm text-[#818984]">A few details to make the workspace yours.</p></div>
            <div className="rounded-xl bg-[#f7ecd6] px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-[.12em] text-[#98743a]">1 / 1</div>
          </div>
          {!status.data?.configured ? (
            <form onSubmit={submit} className="space-y-5" data-testid="form-onboarding">
              <label className="block"><span className="mb-2 block text-sm font-semibold text-[#3b4a48]">Your full name <span className="text-[#ae6a50]">*</span></span><input value={fullName} onChange={(event) => setFullName(event.target.value)} onBlur={() => setTouched(true)} className={`focus-ring h-12 w-full rounded-xl border bg-[#f7f5ef] px-4 text-sm text-[#263b3b] outline-none transition-colors placeholder:text-[#a1a8a3] ${fullNameError ? "border-[#c98270]" : "border-[#dedfd8] focus:border-[#4b897c]"}`} placeholder="e.g. Dr. Lina Haddad" data-testid="input-full-name" />{fullNameError ? <span className="mt-1.5 block text-xs text-[#a45a48]">Please enter at least 2 characters.</span> : null}</label>
              <label className="block"><span className="mb-2 block text-sm font-semibold text-[#3b4a48]">Clinic name <span className="text-[#ae6a50]">*</span></span><input value={clinicName} onChange={(event) => setClinicName(event.target.value)} onBlur={() => setTouched(true)} className={`focus-ring h-12 w-full rounded-xl border bg-[#f7f5ef] px-4 text-sm text-[#263b3b] outline-none transition-colors placeholder:text-[#a1a8a3] ${clinicNameError ? "border-[#c98270]" : "border-[#dedfd8] focus:border-[#4b897c]"}`} placeholder="e.g. Noura Family Clinic" data-testid="input-clinic-name" />{clinicNameError ? <span className="mt-1.5 block text-xs text-[#a45a48]">Please enter your clinic name.</span> : null}</label>
              {bootstrap.isError ? <StatusNotice title="We couldn't save that yet." detail="Please check your connection and try again. Your details are still here." onRetry={() => bootstrap.reset()} /> : null}
              <button type="submit" disabled={bootstrap.isPending} className="focus-ring mt-3 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#1f7567] text-sm font-semibold text-[#fbfaf6] transition-colors hover:bg-[#185d54] disabled:cursor-wait disabled:opacity-60" data-testid="button-complete-onboarding">
                {bootstrap.isPending ? "Creating your space…" : "Create my clinic space"} <ArrowUpRight className="size-4" />
              </button>
              <p className="flex items-center justify-center gap-2 text-center text-[11px] leading-5 text-[#8a938f]"><LockKeyhole className="size-3" /> Only you can complete this first-admin setup.</p>
            </form>
          ) : (
            <div className="rounded-2xl border border-[#ead5c8] bg-[#fff8f2] p-5"><p className="font-semibold text-[#26313b]">This clinic is already configured.</p><p className="mt-2 text-sm leading-6 text-[#737977]">Ask an existing administrator to invite you to the workspace.</p><Link href="/portal" className="mt-4 inline-flex text-sm font-semibold text-[#1f7567]" data-testid="link-go-portal">Continue to workspace <ChevronRight className="ml-1 size-4" /></Link></div>
          )}
        </div>
      </div>
    </main>
  );
}

const roleLabels: Record<AuthProfileRole, { en: string; ar: string }> = {
  super_admin: { en: "Super administrator", ar: "المشرف العام" },
  admin: { en: "Administrator", ar: "مدير العيادة" },
  doctor: { en: "Doctor", ar: "طبيب" },
  nurse: { en: "Nurse", ar: "ممرض / ممرضة" },
  receptionist: { en: "Receptionist", ar: "موظف استقبال" },
};

function PortalSidebar({ profile, onClose }: { profile: AuthProfile; onClose: () => void }) {
  const { signOut } = useClerk();
  const [location] = useLocation();
  const navItems = [
    { label: "Overview", ar: "نظرة عامة", icon: Home, href: "/portal" },
    { label: "Appointments", ar: "المواعيد", icon: CalendarDays, href: "/portal#appointments" },
    { label: "Patients", ar: "المرضى", icon: UsersRound, href: "/portal#patients" },
    { label: "Clinical notes", ar: "الملاحظات السريرية", icon: FileText, href: "/portal#notes" },
  ];
  return (
    <aside className="flex h-full w-[278px] flex-col bg-[#19383a] px-4 py-5 text-[#f5f2e9]" data-testid="portal-sidebar">
      <div className="flex items-center justify-between px-2"><Link href="/portal" className="rounded-xl focus-ring" onClick={onClose} data-testid="link-portal-logo"><div className="[&_*]:!text-[#f4f1e9]"><BrandMark compact /></div></Link><button className="grid size-9 place-items-center rounded-xl text-[#94b0a7] hover:bg-[#294b4c] lg:hidden" onClick={onClose} data-testid="button-close-sidebar"><X className="size-4" /></button></div>
      <div className="mt-10 px-2"><p className="text-[10px] font-bold uppercase tracking-[.2em] text-[#77978e]">Clinic workspace</p><div className="mt-3 flex items-center gap-3 rounded-2xl bg-[#244749] p-3"><div className="grid size-9 shrink-0 place-items-center rounded-xl bg-[#b7dacf] text-xs font-bold text-[#234446]">{(profile.clinicName ?? "AC").slice(0, 2).toUpperCase()}</div><div className="min-w-0"><p className="truncate text-sm font-semibold">{profile.clinicName ?? "Your clinic"}</p><p className="mt-0.5 truncate text-[10px] text-[#a4bdb5]" dir="rtl">مساحة العمل الطبية</p></div><ChevronRight className="ml-auto size-4 text-[#86a59d]" /></div></div>
      <nav className="mt-8 space-y-1" aria-label="Clinic navigation">
        {navItems.map(({ label, ar, icon: Icon, href }) => {
          const active = location === "/portal" && href === "/portal";
          return <Link key={label} href={href} onClick={onClose} className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm transition-colors focus-ring ${active ? "bg-[#f2c477] font-semibold text-[#344032]" : "text-[#afc2bb] hover:bg-[#244749] hover:text-[#f5f2e9]"}`} data-testid={`link-nav-${label.toLowerCase().replace(" ", "-")}`}><Icon className="size-[17px]" /><span className="flex-1">{label}</span><span className={`text-[10px] ${active ? "text-[#806839]" : "text-[#77978e]"}`} dir="rtl">{ar}</span></Link>;
        })}
      </nav>
      <div className="mt-auto space-y-1">
        <button className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm text-[#afc2bb] transition-colors hover:bg-[#244749] hover:text-[#f5f2e9] focus-ring" onClick={() => window.alert("Clinic settings will be available here.")} data-testid="button-clinic-settings"><Settings2 className="size-[17px]" /> Clinic settings</button>
        <button className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm text-[#afc2bb] transition-colors hover:bg-[#244749] hover:text-[#f5f2e9] focus-ring" onClick={() => window.alert("Help is on its way.")} data-testid="button-help"><CircleHelp className="size-[17px]" /> Help center</button>
        <div className="my-4 h-px bg-[#315354]" />
        <div className="flex items-center gap-3 rounded-2xl px-2 py-2.5"><div className="grid size-9 place-items-center rounded-full bg-[#d7e6dd] text-xs font-bold text-[#315d55]">{profile.fullName.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase()}</div><div className="min-w-0 flex-1"><p className="truncate text-xs font-semibold">{profile.fullName}</p><p className="truncate text-[10px] text-[#91ada4]">{roleLabels[profile.role].en}</p></div><button className="grid size-8 place-items-center rounded-lg text-[#91ada4] hover:bg-[#244749] hover:text-[#f5f2e9] focus-ring" onClick={() => signOut({ redirectUrl: basePath || "/" })} data-testid="button-sign-out"><LogOut className="size-4" /></button></div>
      </div>
    </aside>
  );
}

function PortalPage() {
  const { isLoaded, isSignedIn } = useAuth();
  const profile = useGetCurrentUser({ query: { enabled: isSignedIn === true, queryKey: getGetCurrentUserQueryKey() } });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notice, setNotice] = useState("");
  const today = useMemo(() => new Intl.DateTimeFormat("en", { weekday: "long", month: "long", day: "numeric" }).format(new Date()), []);
  if (!isLoaded) return <LoadingScene />;
  if (!isSignedIn) return <Redirect to="/sign-in" />;
  if (profile.isLoading) return <LoadingScene label="Loading your clinic workspace" />;
  const profileErrorStatus = (profile.error as { status?: number } | null)?.status;
  if (profile.isError && profileErrorStatus !== 404) return <div className="grid min-h-[100dvh] place-items-center bg-[#f4f1e9] px-5"><div className="w-full max-w-md"><BrandMark /><div className="mt-8"><StatusNotice title="Your clinic profile is unavailable." detail="We could not connect to your clinic workspace. Please try again." onRetry={() => profile.refetch()} /></div></div></div>;
  if (profileErrorStatus === 404 || !profile.data?.isOnboarded) return <Redirect to="/onboarding" />;
  const current = profile.data;
  const firstName = current.fullName.split(" ")[0] || "there";
  const role = roleLabels[current.role];
  const quickActions = [
    { label: "Add patient", ar: "إضافة مريض", icon: UserPlus, action: "Patient intake is ready for your next visit." },
    { label: "New appointment", ar: "موعد جديد", icon: CalendarDays, action: "Your appointment flow will open here." },
    { label: "Write a note", ar: "ملاحظة سريرية", icon: FileText, action: "Clinical notes are ready when you are." },
  ];
  return (
    <main className="min-h-[100dvh] bg-[#f4f1e9] text-[#26313b]">
      {sidebarOpen ? <div className="fixed inset-0 z-30 bg-[#19383a]/35 lg:hidden" onClick={() => setSidebarOpen(false)} /> : null}
      <div className={`fixed inset-y-0 left-0 z-40 transform transition-transform duration-300 lg:static lg:float-left lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}><PortalSidebar profile={current} onClose={() => setSidebarOpen(false)} /></div>
      <div className="min-h-[100dvh] lg:ml-[278px]">
        <header className="flex h-[76px] items-center justify-between border-b border-[#dedbd1] bg-[#f9f7f0]/85 px-5 backdrop-blur sm:px-8">
          <div className="flex items-center gap-3"><button className="grid size-10 place-items-center rounded-xl border border-[#dedbd1] bg-[#fbfaf6] text-[#52615e] lg:hidden focus-ring" onClick={() => setSidebarOpen(true)} data-testid="button-open-sidebar"><Menu className="size-5" /></button><div><p className="hidden text-xs text-[#84908b] sm:block">{today}</p><p className="text-sm font-semibold text-[#344442]" dir="rtl">صباح الخير، {firstName}</p></div></div>
          <div className="flex items-center gap-2 sm:gap-4"><button className="relative grid size-10 place-items-center rounded-xl text-[#74817d] hover:bg-[#e8e7dd] focus-ring" onClick={() => setNotice("You are all caught up. No new notifications.")} data-testid="button-notifications"><Bell className="size-[18px]" /><span className="absolute right-2.5 top-2 size-1.5 rounded-full bg-[#d08b5f]" /></button><div className="hidden h-7 w-px bg-[#dedbd1] sm:block" /><div className="flex items-center gap-2"><div className="grid size-9 place-items-center rounded-full bg-[#d7e6dd] text-xs font-bold text-[#315d55]">{current.fullName.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase()}</div><div className="hidden sm:block"><p className="text-xs font-semibold text-[#344442]">{current.fullName}</p><p className="text-[10px] text-[#84908b]">{role.en}</p></div></div></div>
        </header>
        <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:px-10 lg:py-10">
          <div className="animate-rise-in flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[#e5f0ea] px-3 py-1.5 text-[11px] font-semibold text-[#36766b]"><Activity className="size-3.5" /> Workspace is healthy</div><h1 className="text-3xl font-semibold tracking-[-.055em] text-[#263b3b] sm:text-4xl">Your clinic at a glance.</h1><p className="mt-2 text-sm text-[#7c8581]" dir="rtl">{role.ar} · Everything your team needs, in one place.</p></div><button className="focus-ring inline-flex w-fit items-center gap-2 rounded-xl bg-[#19383a] px-4 py-3 text-xs font-semibold text-[#f7f4eb] shadow-[0_8px_18px_hsl(183_39%_20%/.14)] transition-transform hover:-translate-y-0.5" onClick={() => setNotice("Invite flow is ready for your next team member.")} data-testid="button-invite-team"><UserPlus className="size-4" /> Invite a teammate</button></div>
          {notice ? <div className="mt-6 flex items-center justify-between rounded-2xl border border-[#c7ddd4] bg-[#edf7f1] px-4 py-3 text-sm text-[#397267]" data-testid="status-action-notice"><span className="flex items-center gap-2"><CheckCircle2 className="size-4" /> {notice}</span><button onClick={() => setNotice("")} className="rounded-md p-1 hover:bg-[#dceee5] focus-ring" data-testid="button-dismiss-notice"><X className="size-4" /></button></div> : null}
          <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[
              { label: "Appointments today", ar: "مواعيد اليوم", value: "12", meta: "2 still to confirm", icon: CalendarDays, tone: "bg-[#e3f0ec] text-[#34766b]" },
              { label: "Team availability", ar: "الفريق المتاح", value: "04", meta: "All core roles covered", icon: UsersRound, tone: "bg-[#f9edd6] text-[#927038]" },
              { label: "Open follow-ups", ar: "المتابعات المفتوحة", value: "03", meta: "1 needs your attention", icon: ClipboardList, tone: "bg-[#e8e9f0] text-[#5d6683]" },
              { label: "Care pulse", ar: "نبض العيادة", value: "Good", meta: "Steady this week", icon: HeartPulse, tone: "bg-[#f0e5e2] text-[#9a6257]" },
            ].map(({ label, ar, value, meta, icon: Icon, tone }) => <article key={label} className="animate-rise-in delay-1 rounded-2xl border border-[#dedbd1] bg-[#fbfaf6] p-5 shadow-[0_6px_18px_hsl(227_26%_19%/.025)]" data-testid={`card-metric-${label.toLowerCase().replaceAll(" ", "-")}`}><div className="flex items-start justify-between"><div className={`grid size-9 place-items-center rounded-xl ${tone}`}><Icon className="size-[17px]" /></div><MoreHorizontal className="size-4 text-[#aab0aa]" /></div><p className="mt-5 text-2xl font-semibold tracking-[-.06em] text-[#344442]">{value}</p><p className="mt-1 text-xs font-semibold text-[#596764]">{label}</p><p className="mt-1 text-[10px] text-[#929b96]" dir="rtl">{ar} · {meta}</p></article>)}
          </section>
          <section className="mt-8 grid gap-5 xl:grid-cols-[1.25fr_.75fr]">
            <article id="appointments" className="rounded-[22px] border border-[#dedbd1] bg-[#fbfaf6] p-5 sm:p-6" data-testid="card-today-appointments"><div className="flex items-start justify-between"><div><h2 className="font-semibold tracking-[-.03em] text-[#344442]">Today’s appointments</h2><p className="mt-1 text-xs text-[#8a938f]" dir="rtl">جدول اليوم · {today}</p></div><button className="text-xs font-semibold text-[#3c7b70] hover:underline focus-ring" onClick={() => setNotice("The full schedule will open here.")} data-testid="button-view-schedule">View schedule <ArrowUpRight className="ml-1 inline size-3.5" /></button></div><div className="mt-6 space-y-2">{[["09:30", "Mariam A.", "General consultation", "Confirmed", "bg-[#e3f0ec] text-[#34766b]"], ["10:15", "Omar K.", "Follow-up visit", "Waiting", "bg-[#f9edd6] text-[#927038]"], ["11:00", "Noura S.", "Review & care plan", "Confirmed", "bg-[#e3f0ec] text-[#34766b]"], ["11:45", "Layla H.", "First consultation", "New", "bg-[#e8e9f0] text-[#5d6683]"]].map(([time, name, detail, status, statusTone], index) => <button key={name} onClick={() => setNotice(`${name}'s appointment is selected.`)} className="group flex w-full items-center gap-3 rounded-2xl border border-transparent px-3 py-3 text-left transition-colors hover:border-[#e2e3da] hover:bg-[#f7f8f3] focus-ring" data-testid={`button-appointment-${index}`}><span className="w-12 text-[11px] font-semibold text-[#7f8985]">{time}</span><div className="grid size-9 place-items-center rounded-xl bg-[#e8efea] text-[11px] font-bold text-[#4f7c71]">{name.split(" ").map((part) => part[0]).join("")}</div><div className="min-w-0 flex-1"><p className="text-xs font-semibold text-[#465451]">{name}</p><p className="mt-0.5 truncate text-[10px] text-[#929b96]">{detail}</p></div><span className={`rounded-full px-2 py-1 text-[10px] font-semibold ${statusTone}`}>{status}</span><ChevronRight className="size-4 text-[#b2b9b3] transition-transform group-hover:translate-x-0.5" /></button>)}</div></article>
            <article id="notes" className="rounded-[22px] border border-[#dedbd1] bg-[#e7f0eb] p-5 sm:p-6" data-testid="card-clinic-pulse"><div className="flex items-start justify-between"><div><div className="grid size-9 place-items-center rounded-xl bg-[#cfe4d9] text-[#34766b]"><MonitorDot className="size-[17px]" /></div><h2 className="mt-5 font-semibold tracking-[-.03em] text-[#344442]">The clinic pulse</h2><p className="mt-1 text-xs text-[#6e817b]" dir="rtl">لمحة عن سير العمل</p></div><span className="rounded-full bg-[#d7e9df] px-2.5 py-1 text-[10px] font-semibold text-[#458074]">This week</span></div><div className="mt-8 flex items-end gap-1.5" aria-label="Care pulse trend"><div className="h-12 flex-1 rounded-t-lg bg-[#b9d6c9]" /><div className="h-16 flex-1 rounded-t-lg bg-[#a7ccbd]" /><div className="h-14 flex-1 rounded-t-lg bg-[#b9d6c9]" /><div className="h-20 flex-1 rounded-t-lg bg-[#76ad9c]" /><div className="h-24 flex-1 rounded-t-lg bg-[#4b8b7d]" /><div className="h-20 flex-1 rounded-t-lg bg-[#76ad9c]" /><div className="h-28 flex-1 rounded-t-lg bg-[#34766b]" /></div><div className="mt-2 flex justify-between text-[9px] text-[#77918a]"><span>Mon</span><span>Today</span></div><div className="mt-6 rounded-2xl border border-[#cde0d5] bg-[#f4faf5]/70 p-4"><div className="flex items-center gap-2 text-xs font-semibold text-[#397267]"><CheckCircle2 className="size-4" /> A steady week so far</div><p className="mt-2 text-[11px] leading-5 text-[#6c817a]">Your team has kept the day moving with fewer open follow-ups.</p></div></article>
          </section>
          <section className="mt-8" id="patients"><div className="mb-4 flex items-end justify-between"><div><h2 className="font-semibold tracking-[-.03em] text-[#344442]">Quick actions</h2><p className="mt-1 text-xs text-[#8a938f]" dir="rtl">خطواتك التالية</p></div><span className="text-[11px] text-[#a0a7a2]">For your role · {role.en}</span></div><div className="grid gap-3 md:grid-cols-3">{quickActions.map(({ label, ar, icon: Icon, action }) => <button key={label} className="group flex items-center gap-4 rounded-2xl border border-[#dedbd1] bg-[#fbfaf6] p-4 text-left transition-all hover:-translate-y-0.5 hover:border-[#b8d2c7] hover:shadow-[0_10px_25px_hsl(166_20%_35%/.07)] focus-ring" onClick={() => setNotice(action)} data-testid={`button-quick-${label.toLowerCase().replace(" ", "-")}`}><div className="grid size-10 place-items-center rounded-xl bg-[#edf3ee] text-[#39796d]"><Icon className="size-[18px]" /></div><div className="flex-1"><p className="text-xs font-semibold text-[#465451]">{label}</p><p className="mt-1 text-[10px] text-[#8b9590]" dir="rtl">{ar}</p></div><Plus className="size-4 text-[#a5aea8] transition-transform group-hover:rotate-90" /></button>)}</div></section>
        </div>
      </div>
    </main>
  );
}

function ClerkQueryClientCacheInvalidator() {
  const { addListener } = useClerk();
  const queryClient = useQueryClient();
  const previousUserId = useRef<string | null | undefined>(undefined);
  useEffect(() => {
    const unsubscribe = addListener(({ user }) => {
      const userId = user?.id ?? null;
      if (previousUserId.current !== undefined && previousUserId.current !== userId) queryClient.clear();
      previousUserId.current = userId;
    });
    return unsubscribe;
  }, [addListener, queryClient]);
  return null;
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function ClerkProviderWithRoutes() {
  const [, setLocation] = useLocation();
  return (
    <ClerkProvider
      publishableKey={clerkPubKey}
      proxyUrl={clerkProxyUrl}
      appearance={clerkAppearance}
      signInUrl={`${basePath}/sign-in`}
      signUpUrl={`${basePath}/sign-up`}
      localization={{
        signIn: { start: { title: "Welcome back to Alteesh", subtitle: "Sign in to your clinic workspace" } },
        signUp: { start: { title: "Create your Alteesh account", subtitle: "A calmer workspace starts here" } },
      }}
      routerPush={(to) => setLocation(stripBase(to))}
      routerReplace={(to) => setLocation(stripBase(to), { replace: true })}
    >
      <QueryClientProvider client={queryClient}>
        <ClerkQueryClientCacheInvalidator />
        <RoutedErrorBoundary>
          <Switch>
            <Route path="/" component={HomeRedirect} />
            <Route path="/sign-in/*?" component={() => <AuthPage mode="sign-in" />} />
            <Route path="/sign-up/*?" component={() => <AuthPage mode="sign-up" />} />
            <Route path="/onboarding" component={OnboardingPage} />
            <Route path="/portal" component={PortalPage} />
            <Route component={NotFound} />
          </Switch>
        </RoutedErrorBoundary>
      </QueryClientProvider>
    </ClerkProvider>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={basePath}>
          <ClerkProviderWithRoutes />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;