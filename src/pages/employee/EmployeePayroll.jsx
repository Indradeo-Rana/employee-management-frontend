import { useEffect, useState } from "react";
import employeePortalService from "../../services/employeeService";
import { showError } from "../../utils/toastHelper";

const TODAY      = new Date().toISOString().split("T")[0];
const FIRST_DAY  = TODAY.slice(0, 7) + "-01";
const YEAR_START = TODAY.slice(0, 4) + "-01-01";

const CAT_LABEL = {
  SALARY: "Salary", FOOD: "Food", HOUSE_RENT: "House Rent",
  FARE: "Fare", MACHINE_MAINTENANCE: "Machine Maint.", GST: "GST", OTHER: "Other",
};
const CAT_TONE = {
  SALARY: "border-indigo-400/30 bg-indigo-500/15 text-indigo-300",
  FOOD: "border-emerald-400/30 bg-emerald-500/15 text-emerald-300",
  HOUSE_RENT: "border-amber-400/30 bg-amber-500/15 text-amber-300",
  FARE: "border-rose-400/30 bg-rose-500/15 text-rose-300",
  MACHINE_MAINTENANCE: "border-violet-400/30 bg-violet-500/15 text-violet-300",
  GST: "border-sky-400/30 bg-sky-500/15 text-sky-300",
  OTHER: "border-slate-400/30 bg-slate-500/15 text-slate-300",
};

const PRESETS = [
  { label: "This Month", from: FIRST_DAY,  to: TODAY },
  { label: "This Year",  from: YEAR_START, to: TODAY },
  { label: "All Time",   from: "2000-01-01", to: TODAY },
];

const EmployeePayroll = () => {
  const [from,    setFrom]    = useState(FIRST_DAY);
  const [to,      setTo]      = useState(TODAY);
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = (f = from, t = to) => {
    setLoading(true);
    employeePortalService.getPayments(f, t)
      .then(setData)
      .catch(err => showError(err.response?.data?.message || "Failed to load payroll data"))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, []);

  const applyPreset = (preset) => {
    setFrom(preset.from);
    setTo(preset.to);
    fetchData(preset.from, preset.to);
  };

  const fmt = (n) => `₹${Number(n ?? 0).toLocaleString("en-IN")}`;
  const inputClasses = "h-10 rounded-lg border border-white/10 bg-white/5 px-3 text-xs text-slate-100 outline-none transition focus:border-indigo-400/70";

  return (
    <div className="space-y-5">
      <div className="space-y-1">
        <h1 className="font-['Sora'] text-2xl font-bold text-white">My Payroll</h1>
        <p className="text-xs text-slate-400">Track your payments by quick presets or custom date range.</p>
      </div>

      {/* ── Summary Cards ── */}
      {data && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { label: "Total Earned (All Time)", value: fmt(data.totalEarned), colorClass: "text-indigo-300" },
            { label: "Total Salary Paid", value: fmt(data.totalSalaryPaidAllTime), colorClass: "text-emerald-300" },
            { label: "Remaining Salary",         value: fmt(data.remainingSalary),
              colorClass: data.remainingSalary > 0 ? "text-rose-300" : "text-emerald-300" },
          ].map(s => (
            <div key={s.label} className="rounded-xl border border-white/10 bg-slate-900/70 p-4">
              <p className="mb-1 text-[11px] text-slate-400">{s.label}</p>
              <p className={`font-['Sora'] text-xl font-bold ${s.colorClass}`}>{s.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* ── Filters ── */}
      <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-3 sm:p-4">
        <div className="flex flex-wrap items-center gap-2">
          {PRESETS.map((p) => {
            const active = from === p.from && to === p.to;
            return (
              <button
                key={p.label}
                onClick={() => applyPreset(p)}
                className={`rounded-lg border px-3 py-2 text-xs font-medium transition ${active ? "border-indigo-400/40 bg-indigo-500/15 text-indigo-300" : "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"}`}
              >
                {p.label}
              </button>
            );
          })}

          <div className="h-px w-full bg-white/10 sm:hidden" />

          <div className="grid w-full gap-2 sm:ml-2 sm:w-auto sm:grid-cols-[auto_auto_auto_auto] sm:items-center">
            <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className={inputClasses} />
            <span className="hidden text-xs text-slate-400 sm:block">to</span>
            <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className={inputClasses} />
            <button
              onClick={() => fetchData()}
              className="h-10 rounded-lg bg-gradient-to-r from-indigo-500 to-indigo-400 px-4 text-xs font-semibold text-white transition hover:brightness-110"
            >
              Search
            </button>
          </div>
        </div>
      </div>

      {/* ── Payment Table ── */}
      {loading ? (
        <div className="rounded-xl border border-white/10 bg-slate-900/60 p-8 text-center text-sm text-slate-400">Loading...</div>
      ) : !data || data.payments.length === 0 ? (
        <div className="rounded-xl border border-white/10 bg-slate-900/60 px-4 py-12 text-center">
          <p className="mb-2 text-3xl">💰</p>
          <p className="text-sm text-slate-400">No payments found for this period.</p>
        </div>
      ) : (
        <>
          {/* Range summary */}
          <div className="flex flex-wrap items-center gap-3 rounded-xl border border-indigo-400/20 bg-indigo-500/[0.08] px-3 py-2 text-xs text-slate-300 sm:w-fit sm:gap-6 sm:px-4">
            <span>
              Records in range: <strong className="text-slate-100">{data.payments.length}</strong>
            </span>
            <span>
              Salary paid in range: <strong className="text-amber-300">{fmt(data.totalPaidInRange)}</strong>
            </span>
          </div>

          <div className="grid gap-3 md:hidden">
            {data.payments.map((p) => (
              <div key={p.id} className="rounded-xl border border-white/10 bg-slate-900/70 p-3">
                <div className="mb-2 flex items-start justify-between gap-3">
                  <span className="text-sm font-medium text-slate-100">
                    {new Date(p.paymentDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                  </span>
                  <span className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold ${CAT_TONE[p.category] || CAT_TONE.OTHER}`}>
                    {CAT_LABEL[p.category] || p.category}
                  </span>
                </div>

                <p className="mb-2 font-['Sora'] text-lg font-bold text-amber-300">{fmt(p.amount)}</p>

                <div className="space-y-1 text-xs">
                  <p className="text-slate-400">Site: <span className="text-slate-200">{p.siteName || "—"}</span></p>
                  <p className="text-slate-400">Note: <span className="text-slate-200">{p.note || "—"}</span></p>
                </div>
              </div>
            ))}
          </div>

          <div className="hidden overflow-x-auto rounded-2xl border border-white/10 bg-slate-900/70 md:block">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  {["Date", "Category", "Amount", "Site", "Note"].map((h) => (
                    <th
                      key={h}
                      className="border-b border-white/10 px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-400"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.payments.map((p) => (
                  <tr key={p.id} className="border-b border-white/5 transition hover:bg-white/[0.02]">
                    <td className="px-4 py-3">
                      <span className="text-sm font-medium text-slate-100">
                        {new Date(p.paymentDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold ${CAT_TONE[p.category] || CAT_TONE.OTHER}`}>
                        {CAT_LABEL[p.category] || p.category}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-['Sora'] text-sm font-bold text-amber-300">{fmt(p.amount)}</td>
                    <td className="px-4 py-3 text-xs text-slate-400">{p.siteName || "—"}</td>
                    <td className="px-4 py-3 text-xs text-slate-400">{p.note || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

export default EmployeePayroll;
