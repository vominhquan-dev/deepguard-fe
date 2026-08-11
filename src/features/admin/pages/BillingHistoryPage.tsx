import { useState, useEffect, useCallback } from "react";
import { DashboardLayout } from "../../../app/layouts/DashboardLayout";
import { useAuth } from "../../auth/context/AuthContext";
import { useTranslation } from "react-i18next";
import { getBillingHistory, BillingHistoryItem } from "../api/adminApi";
import { createAdminCacheKey, getCachedAdminData } from "../api/adminCache";
import {
  Loader2,
  Search,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Calendar,
  CreditCard,
  Coins,
  Receipt,
  CheckCircle2,
  XCircle,
  Clock,
  RotateCcw,
  Ban,
  DollarSign,
  ChevronDown,
} from "lucide-react";

/* ────── Helpers ────── */

function formatDate(iso: string, language = "en"): string {
  if (!iso) return "-";
  try {
    return new Intl.DateTimeFormat(language === "vi" ? "vi-VN" : "en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

const statusConfig: Record<
  string,
  { icon: any; label: string; color: string; bg: string }
> = {
  PENDING: {
    icon: Clock,
    label: "admin.pending",
    color: "text-amber-500",
    bg: "bg-amber-500/10",
  },
  SUCCESS: {
    icon: CheckCircle2,
    label: "admin.ui.success",
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
  },
  FAILED: {
    icon: XCircle,
    label: "admin.ui.failed",
    color: "text-red-500",
    bg: "bg-red-500/10",
  },
  CANCELLED: {
    icon: Ban,
    label: "admin.ui.cancelled",
    color: "text-slate-500",
    bg: "bg-slate-500/10",
  },
  REFUNDED: {
    icon: RotateCcw,
    label: "admin.ui.refunded",
    color: "text-blue-500",
    bg: "bg-blue-500/10",
  },
};

function getStatusCfg(s: string) {
  return (
    statusConfig[s] || {
      icon: Clock,
      label: s,
      color: "text-slate-500",
      bg: "bg-slate-500/10",
    }
  );
}

/* ────── Select Dropdown ────── */

function FilterSelect({
  value,
  onChange,
  options,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  placeholder: string;
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none px-3 py-2 pr-8 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-500/30 cursor-pointer"
      >
        <option value="">{placeholder}</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
    </div>
  );
}

/* ────── Pagination ────── */

function Pagination({
  page,
  totalPages,
  totalElements,
  onChange,
}: {
  page: number;
  totalPages: number;
  totalElements: number;
  onChange: (p: number) => void;
}) {
  const { t } = useTranslation();
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-between pt-4">
      <span className="text-xs text-slate-400">
        {totalElements} {t("admin.ui.transactions")} &middot;{" "}
        {t("admin.ui.pageOf", { page: page + 1, total: totalPages })}
      </span>
      <div className="flex gap-1">
        <button
          onClick={() => onChange(page - 1)}
          disabled={page === 0}
          className="p-1.5 rounded-md bg-slate-100 dark:bg-slate-800 disabled:opacity-30 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
        >
          <ChevronLeft className="w-4 h-4 text-slate-500" />
        </button>
        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
          const start = Math.max(0, Math.min(page - 2, totalPages - 5));
          const p = start + i;
          return (
            <button
              key={p}
              onClick={() => onChange(p)}
              className={`w-8 h-8 rounded-md text-xs font-semibold transition-colors ${
                p === page
                  ? "bg-purple-600 text-white"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700"
              }`}
            >
              {p + 1}
            </button>
          );
        })}
        <button
          onClick={() => onChange(page + 1)}
          disabled={page >= totalPages - 1}
          className="p-1.5 rounded-md bg-slate-100 dark:bg-slate-800 disabled:opacity-30 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
        >
          <ChevronRight className="w-4 h-4 text-slate-500" />
        </button>
      </div>
    </div>
  );
}

/* ────── Main ────── */

export function BillingHistoryPage() {
  const { accessToken } = useAuth();
  const { t, i18n } = useTranslation();
  const [data, setData] = useState<BillingHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const [searchValue, setSearchValue] = useState("");
  const [keyword, setKeyword] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [methodFilter, setMethodFilter] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const fetchData = useCallback(async (force = false) => {
    if (!accessToken) return;
    setLoading(true);
    try {
      const params = {
        keyword: keyword || undefined,
        status: statusFilter || undefined,
        paymentMethod: methodFilter || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        page,
        size: 15,
      };
      const res = await getCachedAdminData(
        accessToken,
        createAdminCacheKey("billing-history", params),
        () => getBillingHistory(accessToken, params),
        { force },
      );
      if (res.success) {
        setData(res.data.content);
        setTotalPages(res.data.totalPages);
        setTotalElements(res.data.totalElements);
      }
    } catch {
      // handled
    } finally {
      setLoading(false);
    }
  }, [
    accessToken,
    page,
    keyword,
    statusFilter,
    methodFilter,
    startDate,
    endDate,
  ]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSearch = () => {
    setPage(0);
    setKeyword(searchValue);
  };

  const clearFilters = () => {
    setPage(0);
    setKeyword("");
    setSearchValue("");
    setStatusFilter("");
    setMethodFilter("");
    setStartDate("");
    setEndDate("");
  };

  const hasFilters =
    keyword || statusFilter || methodFilter || startDate || endDate;

  const thisPageTotal = data.reduce((s, i) => s + i.amount, 0);
  const statusOptions = [
    { value: "PENDING", label: t("admin.pending") },
    { value: "SUCCESS", label: t("admin.ui.success") },
    { value: "FAILED", label: t("admin.ui.failed") },
    { value: "CANCELLED", label: t("admin.ui.cancelled") },
    { value: "REFUNDED", label: t("admin.ui.refunded") },
  ];
  const methodOptions = [
    { value: "BANK_TRANSFER", label: t("admin.ui.bankTransfer") },
    { value: "CREDIT_CARD", label: t("admin.ui.creditCard") },
    { value: "PAYPAL", label: "PayPal" },
    { value: "MOMO", label: "Momo" },
    { value: "VNPAY", label: "VNPay" },
  ];

  return (
    <DashboardLayout>
      <div className="p-6">
        {/* ── Header ── */}
        <div className="mb-5">
          <h1 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {t("admin.ui.billingHistory")}
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            {t("admin.ui.billingSubtitle")}
          </p>
        </div>

        {/* ── Filters bar ── */}
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px] max-w-xs">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              placeholder={t("admin.ui.billingSearch")}
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="w-full pl-8 pr-2.5 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/30"
            />
          </div>

          <FilterSelect
            value={statusFilter}
            onChange={(v) => {
              setPage(0);
              setStatusFilter(v);
            }}
            options={statusOptions}
            placeholder={t("admin.ui.allStatuses")}
          />

          <FilterSelect
            value={methodFilter}
            onChange={(v) => {
              setPage(0);
              setMethodFilter(v);
            }}
            options={methodOptions}
            placeholder={t("admin.ui.allMethods")}
          />

          {/* Date range */}
          <input
            type="date"
            value={startDate}
            onChange={(e) => {
              setPage(0);
              setStartDate(e.target.value);
            }}
            className="px-2.5 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-500/30"
          />
          <span className="text-xs text-slate-400">&ndash;</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => {
              setPage(0);
              setEndDate(e.target.value);
            }}
            className="px-2.5 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-500/30"
          />

          {hasFilters && (
            <button
              onClick={clearFilters}
              className="px-3 py-2 rounded-lg text-xs font-semibold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              {t("admin.ui.clear")}
            </button>
          )}

          <button
            onClick={() => fetchData(true)}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {/* ── Summary ── */}
        {!loading && data.length > 0 && (
          <div className="flex items-center gap-4 mb-3 px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-700/50">
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <Receipt className="w-3.5 h-3.5" />
              <span className="font-semibold">
                {totalElements} {t("admin.ui.transactions")}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-xs">
              <DollarSign className="w-3.5 h-3.5 text-emerald-500" />
              <span className="font-bold text-emerald-500">
                {formatCurrency(thisPageTotal)}
              </span>
              <span className="text-slate-400">({t("admin.ui.thisPage")})</span>
            </div>
          </div>
        )}

        {/* ── Table ── */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-5 h-5 text-purple-500 animate-spin" />
          </div>
        ) : data.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <Receipt className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
            <p className="text-xs font-semibold">
              {t("admin.ui.noBilling")}
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
                    <th className="text-left py-2.5 px-3 font-semibold text-slate-400 uppercase tracking-wider">
                      {t("admin.ui.transaction")}
                    </th>
                    <th className="text-left py-2.5 px-3 font-semibold text-slate-400 uppercase tracking-wider">
                      {t("admin.ui.user")}
                    </th>
                    <th className="text-left py-2.5 px-3 font-semibold text-slate-400 uppercase tracking-wider">
                      {t("admin.ui.plan")}
                    </th>
                    <th className="text-right py-2.5 px-3 font-semibold text-slate-400 uppercase tracking-wider">
                      {t("admin.ui.amount")}
                    </th>
                    <th className="text-left py-2.5 px-3 font-semibold text-slate-400 uppercase tracking-wider">
                      {t("admin.ui.method")}
                    </th>
                    <th className="text-left py-2.5 px-3 font-semibold text-slate-400 uppercase tracking-wider">
                      {t("admin.ui.status")}
                    </th>
                    <th className="text-left py-2.5 px-3 font-semibold text-slate-400 uppercase tracking-wider">
                      {t("admin.ui.date")}
                    </th>
                    <th className="text-right py-2.5 px-3 font-semibold text-slate-400 uppercase tracking-wider">
                      {t("admin.ui.credits")}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((item) => {
                    const sc = getStatusCfg(item.status);
                    const SI = sc.icon;
                    return (
                      <tr
                        key={item.paymentId}
                        className="border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/20 transition-colors"
                      >
                        <td className="py-2.5 px-3">
                          <div className="font-semibold text-slate-900 dark:text-slate-200">
                            {item.transactionCode || "\u2014"}
                          </div>
                          <div className="text-[10px] text-slate-400 leading-tight">
                            {item.paymentId.slice(0, 8)}...
                          </div>
                        </td>
                        <td className="py-2.5 px-3">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white text-[10px] font-bold shrink-0">
                              {(item.username ||
                                item.userEmail)[0].toUpperCase()}
                            </div>
                            <div>
                              <div className="font-semibold text-slate-900 dark:text-slate-200 leading-tight">
                                {item.username || item.userEmail}
                              </div>
                              <div className="text-[10px] text-slate-400 leading-tight">
                                {item.userEmail}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-2.5 px-3 text-slate-500 font-medium">
                          {item.pricingPlanName || "\u2014"}
                        </td>
                        <td className="py-2.5 px-3 text-right font-bold text-slate-900 dark:text-white">
                          {formatCurrency(item.amount)}
                        </td>
                        <td className="py-2.5 px-3">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 font-semibold text-[10px]">
                            <CreditCard className="w-3 h-3" />
                            {item.paymentMethod || "\u2014"}
                          </span>
                        </td>
                        <td className="py-2.5 px-3">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md ${sc.bg} ${sc.color} font-bold text-[10px]`}
                          >
                            <SI className="w-3 h-3" />
                            {sc.label.startsWith("admin.") ? t(sc.label) : sc.label}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-slate-500 whitespace-nowrap">
                          <span className="inline-flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-slate-400" />
                            {formatDate(item.createdAt, i18n.resolvedLanguage || "en")}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-500 font-bold text-[11px]">
                            <Coins className="w-3 h-3" />
                            {item.credits}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <Pagination
              page={page}
              totalPages={totalPages}
              totalElements={totalElements}
              onChange={setPage}
            />
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
