import { useEffect, useMemo, useState } from "react";
import OnboardingPage from "./features/onboarding/OnboardingPage";
import GlobePage from "./features/globe/GlobePage";
import CommunityPage from "./features/community/CommunityPage";
import NavigationBar from "./components/NavigationBar";
import { getBrainType } from "./data/brainTypes";
import type { BrainTypeId, SelectedBrainProfile } from "./types/brain";

const STORAGE_KEY = "brainball:selectedProfile";

const readProfile = (): SelectedBrainProfile | null => {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as SelectedBrainProfile;
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    return null;
  }
};

const navigateTo = (path: string) => {
  window.history.pushState({}, "", path);
  window.dispatchEvent(new PopStateEvent("popstate"));
};

export default function App() {
  const [path, setPath] = useState(window.location.pathname);
  const [profile, setProfile] = useState<SelectedBrainProfile | null>(() => readProfile());

  useEffect(() => {
    const onPop = () => setPath(window.location.pathname);
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  useEffect(() => {
    if ((path === "/globe" || path === "/community") && !profile) {
      navigateTo("/");
    }
  }, [path, profile]);

  const selectedType = useMemo(
    () => (profile ? getBrainType(profile.brainType) : null),
    [profile],
  );

  const handleSelect = (brainType: BrainTypeId) => {
    const nextProfile = { brainType, createdAt: new Date().toISOString() };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextProfile));
    setProfile(nextProfile);
    navigateTo("/globe");
  };

  const handleReset = () => {
    localStorage.removeItem(STORAGE_KEY);
    setProfile(null);
    navigateTo("/");
  };

  let page = <OnboardingPage onSelect={handleSelect} selectedType={selectedType} />;
  if (path === "/globe" && selectedType) {
    page = <GlobePage selectedType={selectedType} />;
  }
  if (path === "/community" && selectedType) {
    page = <CommunityPage selectedType={selectedType} />;
  }

  return (
    <div className="app-shell">
      <NavigationBar
        activePath={path}
        hasProfile={Boolean(profile)}
        selectedType={selectedType}
        onNavigate={navigateTo}
        onReset={handleReset}
      />
      <main>{page}</main>
    </div>
  );
}
