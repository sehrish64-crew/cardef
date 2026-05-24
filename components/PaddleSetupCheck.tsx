/**
 * Paddle v2 Setup Diagnostic Script (TypeScript Safe)
 * 
 * Usage:
 * 1. Create a page at app/paddle-setup-check/page.tsx
 * 2. Paste this component there
 * 3. Visit localhost:3000/paddle-setup-check
 */

"use client";

import { useEffect, useState } from "react";

// TypeScript: Use type assertion instead of extending Window to avoid conflicts with Paddle SDK types

// --- Diagnostic Result Type ---
interface DiagnosticResult {
  check: string;
  status: "✅" | "⚠️" | "❌" | "ℹ️";
  message: string;
}

// --- Main Component ---
export default function PaddleSetupCheck() {
  const [results, setResults] = useState<DiagnosticResult[]>([]);
  const [isRunning, setIsRunning] = useState(true);

  useEffect(() => {
    const runDiagnostics = async () => {
      const checks: DiagnosticResult[] = [];

      // --- Check 1: Token environment variable ---
      const token = process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN;
      if (token) {
        const isValidFormat = token.startsWith("pt_") || token.startsWith("ctok_");
        checks.push({
          check: "Environment Variable",
          status: token.startsWith("pt_") ? "✅" : isValidFormat ? "⚠️" : "❌",
          message: token.startsWith("pt_")
            ? `Billing token loaded: ${token.substring(0, 20)}...`
            : isValidFormat
              ? `Legacy ctok token detected: ${token.substring(0, 20)}... Consider using pt_ token`
              : `Token format invalid: ${token.substring(0, 20)}... Should start with "pt_"`,
        });
      } else {
        checks.push({
          check: "Environment Variable",
          status: "❌",
          message: "NEXT_PUBLIC_PADDLE_CLIENT_TOKEN not found. Check .env.local",
        });
      }

      // --- Check 2: Paddle script loaded ---
      let paddleLoaded = false;
      let attempts = 0;
      while (!paddleLoaded && attempts < 20) {
        if ((window as any).Paddle) {
          paddleLoaded = true;
          break;
        }
        await new Promise((resolve) => setTimeout(resolve, 250));
        attempts++;
      }
      checks.push({
        check: "Paddle Script Load",
        status: paddleLoaded ? "✅" : "❌",
        message: paddleLoaded
          ? `Script loaded after ${attempts * 250}ms`
          : "Script failed to load after 5 seconds",
      });

      // --- Check 3: Paddle Initialize / Setup ---
      if ((window as any).Paddle?.Initialize || (window as any).Paddle?.Setup) {
        checks.push({
          check: "Paddle Initialize Method",
          status: "✅",
          message: "Paddle.Initialize() or Setup() exists - SDK detected",
        });
      } else {
        checks.push({
          check: "Paddle Initialize Method",
          status: "❌",
          message: "Paddle.Initialize() / Setup() not found - check script source",
        });
      }

      const hasLegacy = {
        Initialize: !!(window as any).Paddle?.Initialize,
        Environment_set: !!(window as any).Paddle?.Environment?.set,
      };
      if (!hasLegacy.Initialize && !hasLegacy.Environment_set) {
        checks.push({
          check: "No Legacy Methods",
          status: "✅",
          message: "Good! No v1 methods found",
        });
      } else {
        const legacy = Object.entries(hasLegacy)
          .filter(([, exists]) => exists)
          .map(([name]) => name)
          .join(", ");
        checks.push({
          check: "No Legacy Methods",
          status: "⚠️",
          message: `Found legacy methods: ${legacy}. These may cause issues.`,
        });
      }

      // --- Check 5: Paddle.Checkout availability ---
      await new Promise((resolve) => setTimeout(resolve, 500));
      if ((window as any).Paddle?.Checkout?.open) {
        checks.push({
          check: "Paddle.Checkout.open",
          status: "✅",
          message: "Checkout method is ready",
        });
      } else {
        checks.push({
          check: "Paddle.Checkout.open",
          status: "⚠️",
          message: "Checkout not yet ready. May be loading or Setup() not called.",
        });
      }

      // --- Check 6: Expected environment ---
      const env = token?.startsWith("pt_")
        ? "Billing (pt_)"
        : token?.startsWith("ctok_")
          ? "Legacy ctok_"
          : "Production / unknown";
      checks.push({
        check: "Expected Environment",
        status: "ℹ️",
        message: env,
      });

      // --- Check 7: Checkout test readiness ---
      if ((window as any).Paddle?.Checkout?.open) {
        checks.push({
          check: "Checkout Test",
          status: "✅",
          message: "Ready to open checkout. Click 'Test Checkout' button.",
        });
      } else {
        checks.push({
          check: "Checkout Test",
          status: "❌",
          message: "Cannot test - Checkout not ready yet.",
        });
      }

      setResults(checks);
      setIsRunning(false);
    };

    runDiagnostics();
  }, []);

  // --- Test Checkout ---
  const testCheckout = () => {
    if ((window as any).Paddle?.Checkout?.open) {
      try {
        (window as any).Paddle.Checkout.open({
          items: [{ priceId: "pri_test_diagnostic" }],
          settings: { displayMode: "overlay" },
        });
      } catch (err) {
        console.error("Checkout test failed:", err);
        alert("Checkout could not open — check console logs.");
      }
    } else {
      alert("Checkout not ready yet. Refresh the page and try again.");
    }
  };

  // --- Render ---
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          🎣 Paddle v2 Setup Diagnostic
        </h1>
        <p className="text-gray-600 mb-8">
          Checking your Paddle configuration and initialization...
        </p>

        {isRunning && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="animate-spin w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full"></div>
              <p className="text-blue-900">Running diagnostics...</p>
            </div>
          </div>
        )}

        {/* Results */}
        <div className="space-y-3 mb-8">
          {results.map((result, idx) => (
            <div
              key={idx}
              className={`border rounded-lg p-4 ${result.status === "✅"
                ? "bg-green-50 border-green-200"
                : result.status === "❌"
                  ? "bg-red-50 border-red-200"
                  : result.status === "⚠️"
                    ? "bg-[#E8D0D0] border-[#D0A0A0]"
                    : "bg-blue-50 border-blue-200"
                }`}
            >
              <div className="flex items-start gap-3">
                <div className="text-xl mt-0.5">{result.status}</div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">
                    {result.check}
                  </h3>
                  <p className="text-gray-700 text-sm mt-1">{result.message}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Test Button */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Test Checkout
          </h2>
          <p className="text-gray-600 mb-4">
            Click the button below to test opening Paddle checkout. This will
            attempt to open a checkout overlay with a test price ID.
          </p>
          <button
            onClick={testCheckout}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Open Test Checkout
          </button>
          <p className="text-xs text-gray-500 mt-3">
            Note: Test price ID "pri_test_diagnostic" may not exist in your
            Paddle workspace. This is just to verify the SDK is functional.
          </p>
        </div>

        {/* Debug Info */}
        <div
          className="mt-8 bg-gray-900 text-gray-100 rounded-lg p-4 font-mono text-xs overflow-auto"
          style={{ maxHeight: "300px" }}
        >
          <div className="mb-2 font-bold text-primary/80">Debug Information:</div>
          <div>Token: {process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN}</div>
          <div>Env: {process.env.NEXT_PUBLIC_PADDLE_ENV}</div>
          <div>window.Paddle exists: {(window as any).Paddle ? "✅ yes" : "❌ no"}</div>
          <div>Paddle.Setup exists: {(window as any).Paddle?.Setup ? "✅ yes" : "❌ no"}</div>
          <div>Paddle.Checkout exists: {(window as any).Paddle?.Checkout ? "✅ yes" : "❌ no"}</div>
          <div>Paddle.Checkout.open exists: {(window as any).Paddle?.Checkout?.open ? "✅ yes" : "❌ no"}</div>
          <div className="mt-2 text-[#780000]">
            Check browser DevTools Console for additional logs
          </div>
        </div>
      </div>
    </div>
  );
}