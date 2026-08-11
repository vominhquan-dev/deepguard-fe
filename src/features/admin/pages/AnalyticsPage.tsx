import { DashboardLayout } from "../../../app/layouts/DashboardLayout";
import { AnalyticsTab } from "../components/AnalyticsTab";
import { useTranslation } from "react-i18next";

export function AnalyticsPage() {
  const { t } = useTranslation();
  return (
    <DashboardLayout>
      <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-1 h-6 rounded-full bg-purple-500" />
            <h1
              className="text-slate-900 dark:text-white"
              style={{
                fontSize: "24px",
                fontWeight: 800,
                letterSpacing: "-0.5px",
              }}
            >
              {t("admin.ui.analytics")}
            </h1>
          </div>
        </div>

        <AnalyticsTab />
      </div>
    </DashboardLayout>
  );
}
