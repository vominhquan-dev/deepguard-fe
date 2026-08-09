import { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import {
  AlertTriangle,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Download,
  FileImage,
  Filter,
  Image as ImageIcon,
  LoaderCircle,
  Mic,
  RefreshCw,
  Search,
  SlidersHorizontal,
  Video,
} from "lucide-react";
import { DashboardLayout } from "../../../app/layouts/DashboardLayout";
import { useScanHistory } from "../hooks/useScanHistory";
import type { HistoryItem } from "../hooks/useScanHistory";

const ITEMS_PER_PAGE = 8;
const typeIcons = { Image: ImageIcon, Video, Audio: Mic };

function verdictMeta(item: HistoryItem) {
  if (item.verdict === "Deepfake" || item.risk >= 70) {
    return { label: "Cần xác minh", icon: AlertTriangle, classes: "bg-red-500/10 text-red-700 ring-red-500/20 dark:text-red-400" };
  }
  if (item.verdict === "Suspicious" || item.risk >= 31) {
    return { label: "Cần xem lại", icon: AlertTriangle, classes: "bg-amber-500/10 text-amber-700 ring-amber-500/20 dark:text-amber-400" };
  }
  return { label: "Có vẻ thật", icon: CheckCircle2, classes: "bg-emerald-500/10 text-emerald-700 ring-emerald-500/20 dark:text-emerald-400" };
}

function riskClass(risk: number) {
  if (risk >= 70) return "bg-red-500";
  if (risk >= 31) return "bg-amber-500";
  return "bg-emerald-500";
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function exportCsv(items: HistoryItem[]) {
  const csv = [
    ["Tên tệp", "Loại", "Kết luận", "Mức rủi ro", "Ngày kiểm tra"],
    ...items.map((item) => [item.name, item.type, verdictMeta(item).label, `${item.risk}%`, item.date]),
  ]
    .map((row) => row.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(","))
    .join("\n");
  const url = URL.createObjectURL(new Blob(["\ufeff", csv], { type: "text/csv;charset=utf-8" }));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `deepguard-history-${new Date().toISOString().slice(0, 10)}.csv`;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function History() {
  const navigate = useNavigate();
  const { items, loading, error, refetch } = useScanHistory();
  const [search, setSearch] = useState("");
  const [type, setType] = useState("Tất cả");
  const [risk, setRisk] = useState("Tất cả");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [page, setPage] = useState(1);

  const filtered = useMemo(
    () => items.filter((item) => {
      const matchSearch = item.name.toLowerCase().includes(search.trim().toLowerCase());
      const matchType = type === "Tất cả" || item.type === type;
      const matchRisk = risk === "Tất cả" || (risk === "Cao" && item.risk >= 70) || (risk === "Trung bình" && item.risk >= 31 && item.risk < 70) || (risk === "Thấp" && item.risk < 31);
      return matchSearch && matchType && matchRisk && (!from || item.date >= from) && (!to || item.date <= to);
    }),
    [items, search, type, risk, from, to],
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const currentPage = Math.min(page, totalPages);
  const visibleItems = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
  const summary = {
    total: items.length,
    risky: items.filter((item) => item.risk >= 70 || item.verdict === "Deepfake").length,
    review: items.filter((item) => (item.risk >= 31 && item.risk < 70) || item.verdict === "Suspicious").length,
  };
  const trusted = Math.max(0, summary.total - summary.risky - summary.review);
  const filtersActive = Boolean(search || type !== "Tất cả" || risk !== "Tất cả" || from || to);

  const changeFilter = (change: () => void) => {
    change();
    setPage(1);
  };
  const clearFilters = () => {
    setSearch(""); setType("Tất cả"); setRisk("Tất cả"); setFrom(""); setTo(""); setPage(1);
  };
  const openItem = (item: HistoryItem) => {
    const prediction = item.verdict === "Deepfake" ? "DEEPFAKE" : item.verdict === "Suspicious" ? "SUSPICIOUS" : "REAL";
    navigate("/results", { state: { detectionResultId: item.id, scanJobId: item.scanJobId, prediction, fakeProbability: item.risk / 100, realProbability: item.confidence / 100, imageUrl: item.originalUrl, fileName: item.name, fileType: item.type, uploadedAt: item.date } });
  };

  if (loading && items.length === 0) {
    return <DashboardLayout><div className="grid min-h-[calc(100vh-4rem)] place-items-center"><div className="text-center"><LoaderCircle className="mx-auto h-7 w-7 animate-spin text-primary" /><p className="mt-3 text-[14px] text-slate-500 dark:text-slate-400">Đang tải lịch sử kiểm tra…</p></div></div></DashboardLayout>;
  }

  if (error && items.length === 0) {
    return <DashboardLayout><div className="grid min-h-[calc(100vh-4rem)] place-items-center px-5"><section className="max-w-md rounded-2xl border border-red-200 bg-card p-7 text-center dark:border-red-500/25"><AlertTriangle className="mx-auto h-8 w-8 text-red-600 dark:text-red-400" /><h1 className="mt-4 text-lg font-bold text-slate-900 dark:text-white">Không tải được lịch sử</h1><p className="mt-2 text-[14px] leading-6 text-slate-500 dark:text-slate-400">{error}</p><button type="button" onClick={refetch} className="mt-5 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-[13px] font-bold text-primary-foreground hover:bg-[#406dcc]"><RefreshCw className="h-4 w-4" /> Thử lại</button></section></div></DashboardLayout>;
  }

  return (
    <DashboardLayout>
      <div className="min-h-full bg-background">
        <div className="mx-auto max-w-7xl px-5 py-8 lg:px-8 lg:py-10">
          <header className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="mb-2 text-[12px] font-bold uppercase tracking-[0.12em] text-primary">DeepGuard lịch sử</p>
              <h1 className="text-3xl font-bold tracking-[-0.035em] text-slate-900 dark:text-white">Lịch sử kiểm tra</h1>
              <p className="mt-2 text-[14px] leading-6 text-slate-600 dark:text-slate-300">Tìm lại các kết quả đã kiểm tra và xuất báo cáo khi cần.</p>
            </div>
            <button type="button" onClick={() => exportCsv(filtered)} disabled={filtered.length === 0} className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-[13px] font-bold text-primary-foreground shadow-sm shadow-blue-500/25 hover:bg-[#406dcc] disabled:cursor-not-allowed disabled:opacity-50"><Download className="h-4 w-4" /> Xuất CSV</button>
          </header>

          <section className="mt-7 grid gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-label="Tổng quan lịch sử">
            {[
              { label: "Tổng lượt kiểm tra", value: summary.total, note: "Toàn bộ thời gian", color: "text-slate-900 dark:text-white" },
              { label: "Cần xác minh", value: summary.risky, note: "Rủi ro cao", color: "text-red-600 dark:text-red-400" },
              { label: "Cần xem lại", value: summary.review, note: "Cần đối chiếu", color: "text-amber-600 dark:text-amber-400" },
              { label: "Có vẻ thật", value: trusted, note: "Rủi ro thấp", color: "text-emerald-700 dark:text-emerald-400" },
            ].map((card) => <div key={card.label} className="rounded-xl border border-border bg-card p-4 shadow-sm shadow-slate-900/[0.02]"><p className="text-[11px] font-bold uppercase tracking-[0.08em] text-slate-500 dark:text-slate-400">{card.label}</p><p className={`mt-2 text-3xl font-bold tracking-[-0.035em] ${card.color}`}>{card.value}</p><p className="mt-1 text-[12px] text-slate-500 dark:text-slate-400">{card.note}</p></div>)}
          </section>

          <section className="mt-6 rounded-2xl border border-border bg-card p-4 shadow-sm shadow-slate-900/[0.03]" aria-label="Bộ lọc lịch sử">
            <div className="flex items-center justify-between gap-3"><div className="flex items-center gap-2"><SlidersHorizontal className="h-4 w-4 text-primary" /><h2 className="text-[14px] font-bold text-slate-800 dark:text-slate-100">Tìm và lọc</h2></div>{filtersActive && <button type="button" onClick={clearFilters} className="text-[12px] font-bold text-primary hover:underline">Xóa bộ lọc</button>}</div>
            <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-[minmax(0,1fr)_10rem_11rem_10rem_10rem]">
              <label className="relative block"><span className="sr-only">Tìm tệp</span><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input value={search} onChange={(event) => changeFilter(() => setSearch(event.target.value))} placeholder="Tìm theo tên tệp" className="h-10 w-full rounded-lg border border-border bg-card pl-9 pr-3 text-[13px] text-slate-800 outline-none placeholder:text-slate-400 focus:border-primary dark:text-slate-100" /></label>
              <label><span className="sr-only">Loại tệp</span><select value={type} onChange={(event) => changeFilter(() => setType(event.target.value))} className="h-10 w-full rounded-lg border border-border bg-card px-3 text-[13px] font-medium text-slate-700 outline-none focus:border-primary dark:text-slate-200"><option>Tất cả</option><option>Image</option><option>Video</option><option>Audio</option></select></label>
              <label><span className="sr-only">Mức rủi ro</span><select value={risk} onChange={(event) => changeFilter(() => setRisk(event.target.value))} className="h-10 w-full rounded-lg border border-border bg-card px-3 text-[13px] font-medium text-slate-700 outline-none focus:border-primary dark:text-slate-200"><option>Tất cả</option><option>Cao</option><option>Trung bình</option><option>Thấp</option></select></label>
              <label className="relative"><span className="sr-only">Từ ngày</span><CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input type="date" value={from} onChange={(event) => changeFilter(() => setFrom(event.target.value))} className="h-10 w-full rounded-lg border border-border bg-card pl-9 pr-2 text-[12px] text-slate-700 outline-none focus:border-primary dark:text-slate-200" /></label>
              <label className="relative"><span className="sr-only">Đến ngày</span><CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input type="date" value={to} onChange={(event) => changeFilter(() => setTo(event.target.value))} className="h-10 w-full rounded-lg border border-border bg-card pl-9 pr-2 text-[12px] text-slate-700 outline-none focus:border-primary dark:text-slate-200" /></label>
            </div>
          </section>

          <section className="mt-5 overflow-hidden rounded-2xl border border-border bg-card shadow-sm shadow-slate-900/[0.03]" aria-labelledby="history-list-title">
            <div className="flex items-center justify-between border-b border-border px-5 py-4"><h2 id="history-list-title" className="text-[15px] font-bold text-slate-900 dark:text-white">Kết quả ({filtered.length})</h2>{loading && <LoaderCircle className="h-4 w-4 animate-spin text-primary" />}</div>
            {visibleItems.length === 0 ? <div className="px-5 py-16 text-center"><Filter className="mx-auto h-7 w-7 text-slate-400" /><p className="mt-3 text-[14px] font-semibold text-slate-700 dark:text-slate-200">Không có kết quả phù hợp</p><p className="mt-1 text-[13px] text-slate-500 dark:text-slate-400">Hãy điều chỉnh điều kiện lọc hoặc xóa bộ lọc hiện tại.</p></div> : <>
              <div className="hidden grid-cols-[minmax(0,1.65fr)_9rem_6rem_8rem_5rem] gap-4 border-b border-border bg-muted/45 px-5 py-3 text-[11px] font-bold uppercase tracking-[0.08em] text-slate-500 dark:text-slate-400 md:grid"><span>Tệp</span><span>Kết luận</span><span>Rủi ro</span><span>Ngày</span><span className="text-right">Chi tiết</span></div>
              <div className="divide-y divide-border">
                {visibleItems.map((item) => {
                  const meta = verdictMeta(item); const VerdictIcon = meta.icon; const TypeIcon = typeIcons[item.type];
                  return <div key={item.id} className="grid gap-3 px-5 py-4 md:grid-cols-[minmax(0,1.65fr)_9rem_6rem_8rem_5rem] md:items-center md:gap-4">
                    <div className="flex min-w-0 items-center gap-3"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/[0.07] text-primary"><TypeIcon className="h-4 w-4" /></span><div className="min-w-0"><p className="truncate text-[13px] font-semibold text-slate-800 dark:text-slate-100">{item.name}</p><p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">{item.type}{item.size !== "Không có dữ liệu" ? ` · ${item.size}` : ""}</p></div></div>
                    <span className={`inline-flex w-fit items-center gap-1.5 rounded-md px-2 py-1 text-[11px] font-bold ring-1 ${meta.classes}`}><VerdictIcon className="h-3.5 w-3.5" />{meta.label}</span>
                    <div><span className="text-[13px] font-bold text-slate-700 dark:text-slate-200">{item.risk}%</span><div className="mt-1.5 h-1.5 w-16 overflow-hidden rounded-full bg-muted"><div className={`h-full rounded-full ${riskClass(item.risk)}`} style={{ width: `${item.risk}%` }} /></div></div>
                    <span className="text-[12px] text-slate-500 dark:text-slate-400">{formatDate(item.date)}</span>
                    <button type="button" onClick={() => openItem(item)} className="inline-flex items-center justify-end gap-1 text-[12px] font-bold text-primary hover:underline">Xem <ChevronRight className="h-3.5 w-3.5" /></button>
                  </div>;
                })}
              </div>
            </>}
            {totalPages > 1 && <div className="flex items-center justify-between border-t border-border px-5 py-3"><p className="text-[12px] text-slate-500 dark:text-slate-400">Trang {currentPage}/{totalPages}</p><div className="flex gap-1"><button type="button" onClick={() => setPage((value) => Math.max(1, value - 1))} disabled={currentPage === 1} className="grid h-8 w-8 place-items-center rounded-lg border border-border text-slate-600 disabled:cursor-not-allowed disabled:opacity-40 dark:text-slate-300"><ChevronLeft className="h-4 w-4" /></button><button type="button" onClick={() => setPage((value) => Math.min(totalPages, value + 1))} disabled={currentPage === totalPages} className="grid h-8 w-8 place-items-center rounded-lg border border-border text-slate-600 disabled:cursor-not-allowed disabled:opacity-40 dark:text-slate-300"><ChevronRight className="h-4 w-4" /></button></div></div>}
          </section>
        </div>
      </div>
    </DashboardLayout>
  );
}
