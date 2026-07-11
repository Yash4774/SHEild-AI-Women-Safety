import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import ThemeProvider from "@/components/ThemeProvider";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      cacheTime: 1000 * 60 * 30,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export default function RootLayout({ children }) {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <style>{`
            :root,[data-theme="dark"]{--bg1:#050508;--bg2:#08080f;--bg3:#0d0d18;--surface:rgba(255,255,255,0.025);--border:rgba(255,255,255,0.07);--text1:#ffffff;--text2:#a1a1aa;--text3:#52525b}
            [data-theme="light"]{--bg1:#f0f1f8;--bg2:#ffffff;--bg3:#e4e6f0;--surface:rgba(0,0,0,0.035);--border:rgba(0,0,0,0.09);--text1:#0f0f1a;--text2:#4b4b6b;--text3:#9090aa}
            body{background:var(--bg1);color:var(--text1);transition:background 0.2s,color 0.2s}
            ::-webkit-scrollbar{width:4px;height:4px}
            ::-webkit-scrollbar-track{background:transparent}
            ::-webkit-scrollbar-thumb{background:rgba(124,58,237,0.35);border-radius:4px}
            *{box-sizing:border-box}
          `}</style>
        <div className="font-['Plus_Jakarta_Sans'] antialiased">
          {children}
        </div>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
