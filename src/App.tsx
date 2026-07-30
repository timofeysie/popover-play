import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import NativePopover from "./pages/NativePopover";
import SafeArea from "./pages/SafeArea";
import IsolationProperty from "./pages/IsolationProperty";
import DepthFirstSearch from "./pages/DepthFirstSearch";
import BreadthFirstSearch from "./pages/BreadthFirstSearch";
import FishStack from "./pages/FishStack";
import KthSmallestBst from "./pages/KthSmallestBst";
import TwoSum from "./pages/TwoSum";
import SlidingWindowMaximum from "./pages/SlidingWindowMaximum";
import JavascriptGotchas from "./pages/JavascriptGotchas";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter basename={import.meta.env.BASE_URL}>
        <Routes>
          <Route path="/" element={<Index />}>
            <Route index element={<Dashboard />} />
            <Route path="popover" element={<NativePopover />} />
            <Route path="safe-area" element={<SafeArea />} />
            <Route path="isolation" element={<IsolationProperty />} />
            <Route path="dfs" element={<DepthFirstSearch />} />
            <Route path="bfs" element={<BreadthFirstSearch />} />
            <Route path="fish-stack" element={<FishStack />} />
            <Route path="kth-smallest-bst" element={<KthSmallestBst />} />
            <Route path="two-sum" element={<TwoSum />} />
            <Route path="sliding-window-maximum" element={<SlidingWindowMaximum />} />
            <Route path="javascript-gotchas" element={<JavascriptGotchas />} />
          </Route>
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
