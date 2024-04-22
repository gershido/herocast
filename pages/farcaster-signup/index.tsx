import React, { ReactNode, useEffect, useState } from "react";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import StepSequence from "@/common/components/Steps/StepSequence";
import RegisterFarcasterUsernameForm from "@/common/components/RegisterFarcasterUsernameForm";
import CreateFarcasterAccount from "@/common/components/CreateFarcasterAccount";
import { useAccount } from "wagmi";
import { useRouter } from "next/router";
import SwitchWalletButton from "@/common/components/SwitchWalletButton";
import { hydrateAccounts } from "../../src/stores/useAccountStore";
import SidebarNavItem from "@/common/components/Steps/SidebarNav";

enum FarcasterSignupNav {
  login = "LOGIN",
  connect_wallet = "CONNECT_WALLET",
  create_account_onchain = "CREATE_ACCOUNT_ONCHAIN",
  register_username = "REGISTER_USERNAME",
  explainer = "EXPLAINER",
}

const onboardingNavItems: SidebarNavItem[] = [
  {
    title: "Login",
    idx: 0,
    keys: [FarcasterSignupNav.login],
  },
  {
    title: "Connect wallet",
    idx: 1,
    keys: [FarcasterSignupNav.connect_wallet],
  },
  {
    title: "Create account onchain",
    idx: 2,
    keys: [FarcasterSignupNav.create_account_onchain],
  },
  {
    title: "Register username",
    idx: 3,
    keys: [FarcasterSignupNav.register_username],
  },
  {
    title: "Let's go",
    idx: 3,
    keys: [FarcasterSignupNav.explainer],
  },
];

export default function Welcome() {
  const { isConnected } = useAccount();
  const [step, setStep] = useState<FarcasterSignupNav>(FarcasterSignupNav.connect_wallet);
  const router = useRouter();

  useEffect(() => {
    if (isConnected && step === FarcasterSignupNav.connect_wallet) {
      setStep(FarcasterSignupNav.create_account_onchain);
    }

    if (!isConnected && step === FarcasterSignupNav.create_account_onchain) {
      setStep(FarcasterSignupNav.connect_wallet);
    }
  }, [isConnected]);

  const getStepContent = (
    title: string,
    description: string,
    children?: ReactNode
  ) => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <Separator />
      {children}
    </div>
  );

  const renderExplainer = () => (
    <div>
      <h3 className="mb-4 text-lg font-medium">
        You are fully onboarded to herocast 🥳
      </h3>
      <div className="w-2/3 grid grid-cols-1 items-center gap-4">
        <Button variant="default" onClick={() => router.push("/feed")}>
          Start exploring your feed
        </Button>
        <Button variant="outline" onClick={() => router.push("/post")}>
          Post your first cast
        </Button>
        <div className="w-full">
          <Button
            className="w-full"
            variant="outline"
            onClick={() => router.push("/hats")}
          >
            Share this account with others
          </Button>
          <p className="mt-1 text-sm text-gray-700">
            Use Hats Protocol to share this account with onchain permissions
          </p>
        </div>
      </div>
    </div>
  );

  const renderStep = (step: FarcasterSignupNav) => {
    switch (step) {
      case FarcasterSignupNav.login:
        return getStepContent(
          "Login",
          "Congrats, you are already logged in to herocast.",
          <div className="flex flex-col gap-4">
            <Button
              onClick={() => setStep(FarcasterSignupNav.connect_wallet)}
            >
              Next step
            </Button>
          </div>
        );
      case FarcasterSignupNav.connect_wallet:
        return getStepContent(
          "Connect your wallet",
          "We will create a Farcaster account onchain in the next step.",
          <div className="flex flex-col gap-4">
            <SwitchWalletButton />
            <Button
              disabled={!isConnected}
              onClick={() => setStep(FarcasterSignupNav.create_account_onchain)}
            >
              Next step
            </Button>
          </div>
        );
      case FarcasterSignupNav.create_account_onchain:
        return getStepContent(
          "Create your Farcaster account",
          "Let's get you onchain",
          <CreateFarcasterAccount
            onSuccess={async () => {
              await hydrateAccounts();
              setStep(FarcasterSignupNav.register_username)
            }}
          />
        );
      case FarcasterSignupNav.register_username:
        // skipped for now
        return getStepContent(
          "Register your username",
          "Submit name and bio of your Farcaster account",
          <RegisterFarcasterUsernameForm
            onSuccess={() => setStep(FarcasterSignupNav.explainer)}
          />
        );
      case FarcasterSignupNav.explainer:
        return getStepContent(
          "Let's go 🤩",
          "You just created your Farcaster account",
          renderExplainer()
        );
      default:
        return <></>;
    }
  };

  return (
    <div className="space-y-6 p-4 pb-16 block">
      <StepSequence
        title="Welcome to herocast"
        description="Follow these steps to create your Farcaster account"
        step={step}
        setStep={setStep}
        navItems={onboardingNavItems}
        renderStep={renderStep}
      />
    </div>
  );
}
