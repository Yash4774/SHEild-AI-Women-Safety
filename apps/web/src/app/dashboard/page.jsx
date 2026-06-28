"use client";
import AppShell from "@/components/AppShell";
import useUser from "@/utils/useUser";
import { useTheme } from "@/components/ThemeProvider";
import { DashboardHeader } from "@/components/Dashboard/DashboardHeader";
import { KPICards } from "@/components/Dashboard/KPICards";
import { AISafetyScore } from "@/components/Dashboard/AISafetyScore";
import { LiveActivityFeed } from "@/components/Dashboard/LiveActivityFeed";
import { StatusWidgets } from "@/components/Dashboard/StatusWidgets";
import { QuickAccessGrid } from "@/components/Dashboard/QuickAccessGrid";
import { useDashboardData } from "@/hooks/useDashboardData";
import { useGPSLocation } from "@/hooks/useGPSLocation";
import { useSafetyScore } from "@/hooks/useSafetyScore";
import { useAlertRotation } from "@/hooks/useAlertRotation";
import {
  getGreeting,
  getTimeGreeting,
  calculateWeekActivity,
} from "@/utils/dashboardHelpers";

export default function Dashboard() {
  const { data: user } = useUser();
  const { theme } = useTheme();
  const { reports, feedPosts, sosHistory, loaded } = useDashboardData();
  const { currentPos, gpsStatus, cityName } = useGPSLocation();
  const {
    destination,
    setDestination,
    safetyScore,
    calculating,
    error,
    calculateScore,
  } = useSafetyScore(currentPos, reports);
  const alertIdx = useAlertRotation(5);

  const greeting = getGreeting(user?.name);
  const timeGreet = getTimeGreeting();
  const weekActivity = calculateWeekActivity(reports, feedPosts);

  return (
    <AppShell activePage="dashboard">
      <div style={{ padding: "20px 24px", maxWidth: 1300, margin: "0 auto" }}>
        <DashboardHeader
          greeting={greeting}
          timeGreet={timeGreet}
          gpsStatus={gpsStatus}
          cityName={cityName}
          theme={theme}
        />

        <KPICards
          reports={reports}
          feedPosts={feedPosts}
          sosHistory={sosHistory}
          loaded={loaded}
          theme={theme}
        />

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 320px",
            gap: 16,
            marginBottom: 20,
          }}
          className="db-main-grid"
        >
          <AISafetyScore
            destination={destination}
            setDestination={setDestination}
            calculating={calculating}
            calculateScore={calculateScore}
            error={error}
            safetyScore={safetyScore}
            theme={theme}
          />

          <LiveActivityFeed
            reports={reports}
            alertIdx={alertIdx}
            theme={theme}
          />

          <StatusWidgets
            gpsStatus={gpsStatus}
            weekActivity={weekActivity}
            theme={theme}
          />
        </div>

        <QuickAccessGrid theme={theme} />
      </div>

      <style>{`
        @keyframes dbPulse { 0%,100%{opacity:1}50%{opacity:0.35} }
        @keyframes dbIn { from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)} }
        @media(max-width:1100px){.db-main-grid{grid-template-columns:1fr 1fr!important}}
        @media(max-width:900px){.db-kpi-grid{grid-template-columns:repeat(2,1fr)!important}.db-main-grid{grid-template-columns:1fr!important}.db-quick-grid{grid-template-columns:repeat(4,1fr)!important}}
        @media(max-width:500px){.db-kpi-grid{grid-template-columns:1fr 1fr!important}.db-quick-grid{grid-template-columns:repeat(2,1fr)!important}}
      `}</style>
    </AppShell>
  );
}
