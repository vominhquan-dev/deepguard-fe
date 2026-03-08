import { useState } from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import {
  Search,
  Filter,
  Image as ImageIcon,
  Video,
  Mic,
  ExternalLink,
  ChevronDown,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Download,
  Trash2,
  ChevronLeft,
  ChevronRight as ChevronRightIcon,
  Calendar,
} from 'lucide-react';
import { DashboardLayout } from '../components/DashboardLayout';

const ITEMS_PER_PAGE = 6;

const mockHistory = [
  { id: 1, name: 'interview_clip.mp4', type: 'Video', risk: 87, verdict: 'Deepfake', date: '2026-03-04', size: '48.2 MB' },
  { id: 2, name: 'profile_photo.jpg', type: 'Image', risk: 12, verdict: 'Authentic', date: '2026-03-04', size: '2.1 MB' },
  { id: 3, name: 'voice_message.mp3', type: 'Audio', risk: 65, verdict: 'Suspicious', date: '2026-03-03', size: '8.7 MB' },
  { id: 4, name: 'news_segment.mp4', type: 'Video', risk: 91, verdict: 'Deepfake', date: '2026-03-02', size: '124.0 MB' },
  { id: 5, name: 'headshot.png', type: 'Image', risk: 8, verdict: 'Authentic', date: '2026-03-02', size: '1.3 MB' },
  { id: 6, name: 'podcast_clip.wav', type: 'Audio', risk: 78, verdict: 'Deepfake', date: '2026-03-01', size: '22.4 MB' },
  { id: 7, name: 'presentation_video.mp4', type: 'Video', risk: 45, verdict: 'Suspicious', date: '2026-02-28', size: '68.9 MB' },
  { id: 8, name: 'id_photo.jpg', type: 'Image', risk: 8, verdict: 'Authentic', date: '2026-02-27', size: '0.9 MB' },
  { id: 9, name: 'ceo_speech.mp3', type: 'Audio', risk: 82, verdict: 'Deepfake', date: '2026-02-26', size: '14.3 MB' },
  { id: 10, name: 'product_demo.mp4', type: 'Video', risk: 21, verdict: 'Authentic', date: '2026-02-25', size: '88.6 MB' },
  { id: 11, name: 'social_clip.mp4', type: 'Video', risk: 73, verdict: 'Deepfake', date: '2026-02-24', size: '36.1 MB' },
  { id: 12, name: 'avatar_face.jpg', type: 'Image', risk: 94, verdict: 'Deepfake', date: '2026-02-23', size: '4.2 MB' },
];

const verdictStyle = {
  Deepfake: { bg: 'bg-red-500/10', text: 'text-red-500', border: 'border-red-500/20', icon: AlertTriangle },
  Suspicious: { bg: 'bg-amber-500/10', text: 'text-amber-500', border: 'border-amber-500/20', icon: Clock },
  Authentic: { bg: 'bg-emerald-500/10', text: 'text-emerald-500', border: 'border-emerald-500/20', icon: CheckCircle2 },
};

const typeIcon = { Video, Image: ImageIcon, Audio: Mic };

export function History() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [riskFilter, setRiskFilter] = useState('All');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selected, setSelected] = useState<number[]>([]);
  const [page, setPage] = useState(1);

  const filtered = mockHistory.filter(item => {
    const matchSearch = item.name.toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === 'All' || item.type === typeFilter;
    const matchRisk =
      riskFilter === 'All' ||
      (riskFilter === 'High' && item.risk >= 70) ||
      (riskFilter === 'Medium' && item.risk >= 31 && item.risk < 70) ||
      (riskFilter === 'Low' && item.risk < 31);
    const matchDateFrom = !dateFrom || item.date >= dateFrom;
    const matchDateTo = !dateTo || item.date <= dateTo;
    return matchSearch && matchType && matchRisk && matchDateFrom && matchDateTo;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const currentPage = Math.min(page, totalPages);
  const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const toggleSelect = (id: number) => {
    setSelected(s => s.includes(id) ? s.filter(i => i !== id) : [...s, id]);
  };

  const handleFilterChange = () => setPage(1);

  const totalScans = mockHistory.length;
  const fakeCount = mockHistory.filter(i => i.verdict === 'Deepfake').length;
  const suspiciousCount = mockHistory.filter(i => i.verdict === 'Suspicious').length;

  return (
    <DashboardLayout>
      <div className="p-6 md:p-8">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-1 h-6 rounded-full bg-[#22D3EE]" />
              <h1 className="text-slate-900 dark:text-white" style={{ fontSize: '24px', fontWeight: 800, letterSpacing: '-0.5px' }}>
                Scan History
              </h1>
            </div>
            <p className="text-slate-500 dark:text-slate-400 ml-3" style={{ fontSize: '14px' }}>
              All your past deepfake detection scans
            </p>
          </div>
          <button
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white transition-all hover:shadow-lg hover:shadow-blue-500/25"
            style={{ fontSize: '14px', fontWeight: 600 }}
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total Scans', value: totalScans, color: 'text-slate-900 dark:text-white', sub: 'All time' },
            { label: 'Deepfakes', value: fakeCount, color: 'text-red-500', sub: `${Math.round((fakeCount / totalScans) * 100)}% of scans` },
            { label: 'Suspicious', value: suspiciousCount, color: 'text-amber-500', sub: `${Math.round((suspiciousCount / totalScans) * 100)}% of scans` },
            { label: 'Authentic', value: totalScans - fakeCount - suspiciousCount, color: 'text-emerald-500', sub: `${Math.round(((totalScans - fakeCount - suspiciousCount) / totalScans) * 100)}% of scans` },
          ].map(({ label, value, color, sub }) => (
            <div key={label} className="p-4 rounded-xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-700">
              <p className="text-slate-500 dark:text-slate-400 mb-1" style={{ fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</p>
              <p className={`${color}`} style={{ fontSize: '28px', fontWeight: 800, letterSpacing: '-0.5px' }}>{value}</p>
              <p className="text-slate-400" style={{ fontSize: '11px', marginTop: '2px' }}>{sub}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-5">
          {/* Search */}
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search files..."
              value={search}
              onChange={e => { setSearch(e.target.value); handleFilterChange(); }}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1E293B] text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 focus:border-[#2563EB] transition-all"
              style={{ fontSize: '14px' }}
            />
          </div>

          {/* Type filter */}
          <div className="relative">
            <select
              value={typeFilter}
              onChange={e => { setTypeFilter(e.target.value); handleFilterChange(); }}
              className="appearance-none pl-3 pr-8 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1E293B] text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 transition-all cursor-pointer"
              style={{ fontSize: '14px', fontWeight: 500 }}
            >
              {['All', 'Image', 'Video', 'Audio'].map(t => <option key={t} value={t}>Type: {t}</option>)}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
          </div>

          {/* Risk filter */}
          <div className="relative">
            <select
              value={riskFilter}
              onChange={e => { setRiskFilter(e.target.value); handleFilterChange(); }}
              className="appearance-none pl-3 pr-8 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1E293B] text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 transition-all cursor-pointer"
              style={{ fontSize: '14px', fontWeight: 500 }}
            >
              {['All', 'High', 'Medium', 'Low'].map(r => <option key={r} value={r}>Risk: {r}</option>)}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
          </div>

          {/* Date from */}
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
            <input
              type="date"
              value={dateFrom}
              onChange={e => { setDateFrom(e.target.value); handleFilterChange(); }}
              className="pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1E293B] text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 transition-all cursor-pointer"
              style={{ fontSize: '13px', fontWeight: 500 }}
              title="From date"
            />
          </div>

          {/* Date to */}
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
            <input
              type="date"
              value={dateTo}
              onChange={e => { setDateTo(e.target.value); handleFilterChange(); }}
              className="pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1E293B] text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 transition-all cursor-pointer"
              style={{ fontSize: '13px', fontWeight: 500 }}
              title="To date"
            />
          </div>

          {/* Clear date range */}
          {(dateFrom || dateTo) && (
            <button
              onClick={() => { setDateFrom(''); setDateTo(''); handleFilterChange(); }}
              className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all"
              style={{ fontSize: '12px', fontWeight: 600 }}
            >
              Clear dates
            </button>
          )}

          {selected.length > 0 && (
            <button
              onClick={() => setSelected([])}
              className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-red-500/30 bg-red-500/10 text-red-500 transition-all hover:bg-red-500/20"
              style={{ fontSize: '13px', fontWeight: 600 }}
            >
              <Trash2 className="w-3.5 h-3.5" />
              Delete ({selected.length})
            </button>
          )}
        </div>

        {/* Desktop Table */}
        <div className="hidden md:block rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-700 overflow-hidden">
          {/* Table header */}
          <div className="grid items-center border-b border-slate-200 dark:border-slate-700 px-5 py-3 bg-slate-50 dark:bg-slate-800/50" style={{ gridTemplateColumns: '32px 1fr 80px 90px 120px 110px 80px' }}>
            <input
              type="checkbox"
              className="rounded"
              checked={selected.length === paginated.length && paginated.length > 0}
              onChange={() => setSelected(selected.length === paginated.length ? [] : paginated.map(i => i.id))}
            />
            {['File Name', 'Type', 'Risk Score', 'Verdict', 'Date', 'Actions'].map(h => (
              <span key={h} className="text-slate-500 dark:text-slate-400" style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{h}</span>
            ))}
          </div>

          {/* Rows */}
          {paginated.length === 0 ? (
            <div className="py-16 text-center">
              <Filter className="w-8 h-8 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
              <p className="text-slate-500 dark:text-slate-400" style={{ fontSize: '14px' }}>No results match your filters</p>
            </div>
          ) : (
            paginated.map((item, i) => {
              const VStyle = verdictStyle[item.verdict as keyof typeof verdictStyle];
              const TypeIcon = typeIcon[item.type as keyof typeof typeIcon];
              const riskColor = item.risk >= 70 ? 'text-red-500' : item.risk >= 31 ? 'text-amber-500' : 'text-emerald-500';

              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.04 }}
                  className={`grid items-center px-5 py-3.5 border-b border-slate-100 dark:border-slate-700/60 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors ${selected.includes(item.id) ? 'bg-[#2563EB]/5 dark:bg-[#2563EB]/5' : ''}`}
                  style={{ gridTemplateColumns: '32px 1fr 80px 90px 120px 110px 80px' }}
                >
                  <input
                    type="checkbox"
                    className="rounded"
                    checked={selected.includes(item.id)}
                    onChange={() => toggleSelect(item.id)}
                  />

                  {/* File name */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center flex-shrink-0">
                      <TypeIcon className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-slate-900 dark:text-slate-200 truncate" style={{ fontSize: '13px', fontWeight: 600 }}>{item.name}</p>
                      <p className="text-slate-400" style={{ fontSize: '11px' }}>{item.size}</p>
                    </div>
                  </div>

                  {/* Type */}
                  <span className="text-slate-500 dark:text-slate-400" style={{ fontSize: '13px' }}>{item.type}</span>

                  {/* Risk score */}
                  <div>
                    <span className={`${riskColor}`} style={{ fontSize: '14px', fontWeight: 800 }}>{item.risk}%</span>
                    <div className="mt-1 h-1 w-12 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${item.risk >= 70 ? 'bg-red-500' : item.risk >= 31 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                        style={{ width: `${item.risk}%` }}
                      />
                    </div>
                  </div>

                  {/* Verdict */}
                  <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg ${VStyle.bg} border ${VStyle.border} w-fit`}>
                    <VStyle.icon className={`w-3 h-3 ${VStyle.text}`} />
                    <span className={`${VStyle.text}`} style={{ fontSize: '11px', fontWeight: 700 }}>{item.verdict}</span>
                  </div>

                  {/* Date */}
                  <span className="text-slate-400 dark:text-slate-500" style={{ fontSize: '12px' }}>{item.date}</span>

                  {/* Actions */}
                  <button
                    onClick={() => navigate('/results')}
                    className="flex items-center gap-1.5 text-[#2563EB] dark:text-[#22D3EE] hover:underline"
                    style={{ fontSize: '12px', fontWeight: 600 }}
                  >
                    <ExternalLink className="w-3 h-3" />
                    Details
                  </button>
                </motion.div>
              );
            })
          )}

          {/* Footer / Pagination */}
          <div className="px-5 py-3 bg-slate-50 dark:bg-slate-800/30 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
            <span className="text-slate-400" style={{ fontSize: '13px' }}>
              Showing {Math.min((currentPage - 1) * ITEMS_PER_PAGE + 1, filtered.length)}–{Math.min(currentPage * ITEMS_PER_PAGE, filtered.length)} of {filtered.length} scans
            </span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-7 h-7 rounded-lg text-xs font-bold transition-all ${p === currentPage ? 'bg-[#2563EB] text-white' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'}`}
                >
                  {p}
                </button>
              ))}
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                <ChevronRightIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile card view */}
        <div className="md:hidden space-y-3">
          {paginated.length === 0 ? (
            <div className="py-16 text-center rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-700">
              <Filter className="w-8 h-8 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
              <p className="text-slate-500 dark:text-slate-400" style={{ fontSize: '14px' }}>No results match your filters</p>
            </div>
          ) : (
            paginated.map((item, i) => {
              const VStyle = verdictStyle[item.verdict as keyof typeof verdictStyle];
              const TypeIcon = typeIcon[item.type as keyof typeof typeIcon];
              const riskColor = item.risk >= 70 ? 'text-red-500' : item.risk >= 31 ? 'text-amber-500' : 'text-emerald-500';
              const riskBar = item.risk >= 70 ? 'bg-red-500' : item.risk >= 31 ? 'bg-amber-500' : 'bg-emerald-500';

              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="p-4 rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-700"
                >
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center flex-shrink-0">
                      <TypeIcon className="w-4 h-4 text-slate-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-slate-900 dark:text-slate-200 truncate" style={{ fontSize: '13px', fontWeight: 700 }}>{item.name}</p>
                      <p className="text-slate-400" style={{ fontSize: '11px' }}>{item.size} · {item.date}</p>
                    </div>
                    <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg ${VStyle.bg} border ${VStyle.border}`}>
                      <VStyle.icon className={`w-3 h-3 ${VStyle.text}`} />
                      <span className={`${VStyle.text}`} style={{ fontSize: '10px', fontWeight: 700 }}>{item.verdict}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className={`${riskColor}`} style={{ fontSize: '16px', fontWeight: 800 }}>{item.risk}%</span>
                      <span className="text-slate-400 ml-1" style={{ fontSize: '11px' }}>risk score</span>
                      <div className="mt-1 h-1.5 w-24 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${riskBar}`} style={{ width: `${item.risk}%` }} />
                      </div>
                    </div>
                    <button
                      onClick={() => navigate('/results')}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#2563EB]/10 text-[#2563EB] dark:text-[#22D3EE] hover:bg-[#2563EB]/20 transition-colors"
                      style={{ fontSize: '12px', fontWeight: 600 }}
                    >
                      <ExternalLink className="w-3 h-3" />
                      Details
                    </button>
                  </div>
                </motion.div>
              );
            })
          )}

          {/* Mobile pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 disabled:opacity-40 transition-all"
                style={{ fontSize: '13px', fontWeight: 600 }}
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </button>
              <span className="text-slate-500 dark:text-slate-400" style={{ fontSize: '13px' }}>
                {currentPage} / {totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 disabled:opacity-40 transition-all"
                style={{ fontSize: '13px', fontWeight: 600 }}
              >
                Next
                <ChevronRightIcon className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}