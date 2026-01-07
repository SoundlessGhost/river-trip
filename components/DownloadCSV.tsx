// components/DownloadCSVButton.tsx

"use client";

import { useState } from "react";

export default function DownloadCSVButton() {
  const [loading, setLoading] = useState(false);

  const handleDownload = async (status?: "SUCCESS" | "ALL") => {
    try {
      setLoading(true);

      // API call with status parameter
      const url =
        status === "SUCCESS"
          ? "/api/registrations/export?status=SUCCESS"
          : "/api/registrations/export";

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error("Download failed");
      }

      // CSV file download koro
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = `registrations_${status || "all"}_${
        new Date().toISOString().split("T")[0]
      }.csv`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);

      console.log("✅ CSV downloaded successfully");
    } catch (error) {
      console.error("❌ Download error:", error);
      alert("Download failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex gap-3">
      {/* Only SUCCESS payments download */}
      <button
        onClick={() => handleDownload("SUCCESS")}
        disabled={loading}
        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
      >
        {loading ? "Downloading..." : "📥 Download SUCCESS Only"}
      </button>

      {/* All registrations download */}
      <button
        onClick={() => handleDownload("ALL")}
        disabled={loading}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? "Downloading..." : "📥 Download All"}
      </button>
    </div>
  );
}
