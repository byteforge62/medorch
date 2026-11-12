import { modules } from './clinical-data';

export function ModuleIndex() {
  return (
    <div className="border-t border-[#E4DCF0] bg-white">
      <div className="hidden grid-cols-[54px_190px_minmax(0,1fr)_190px] gap-x-6 border-b border-[#EFEAF7] px-6 py-2.5 text-[9px] font-semibold tracking-[0.12em] text-[#8A829E] uppercase lg:grid lg:px-8">
        <span>No.</span>
        <span>Module</span>
        <span>What the record holds</span>
        <span>Primary users</span>
      </div>

      <ol>
        {modules.map((module, index) => (
          <li
            key={module.id}
            className="group grid grid-cols-[34px_minmax(0,1fr)] gap-x-3 gap-y-1 border-b border-[#F1ECF9] px-4 py-4 transition-colors last:border-b-0 hover:bg-[#FBF9FF] sm:px-6 lg:grid-cols-[54px_190px_minmax(0,1fr)_190px] lg:items-center lg:gap-x-6 lg:px-8 lg:py-[15px]"
          >
            <span className="font-mono text-[9.5px] tracking-[0.08em] text-[#A39BB4]">
              {String(index + 1).padStart(2, '0')}
            </span>
            <span className="flex items-center gap-2 text-[13px] font-semibold text-[#28233D]">
              <span className="h-1 w-1 rounded-full bg-[#C3B4DF] transition-colors group-hover:bg-[#7055BE]" aria-hidden="true" />
              {module.name}
            </span>
            <span className="col-start-2 max-w-[72ch] text-[11.5px] leading-[1.55] text-[#6B6483] lg:col-start-auto">
              {module.owns}
            </span>
            <span className="col-start-2 text-[10px] leading-[1.45] text-[#8A829E] lg:col-start-auto">
              {module.users}
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}
