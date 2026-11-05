'use client';

import { useState } from 'react';
import { modules } from './clinical-data';

export function ModuleIndex() {
  const [openId, setOpenId] = useState<string | null>(modules[0].id);

  return (
    <ul className="border-t border-[#D9E3EC]">
      {modules.map((module, index) => {
        const open = module.id === openId;
        return (
          <li key={module.id} className="border-b border-[#D9E3EC]">
            <button
              type="button"
              onClick={() => setOpenId(open ? null : module.id)}
              aria-expanded={open}
              aria-controls={`module-${module.id}`}
              className={`grid w-full grid-cols-[minmax(0,1fr)_24px] items-start gap-x-6 gap-y-1 px-0 py-4 text-left transition-colors hover:bg-white/60 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#245B8F] lg:grid-cols-[200px_minmax(0,1fr)_190px_24px] lg:items-center lg:py-[18px] ${
                open ? 'bg-white/70' : ''
              }`}
            >
              <span className="flex items-baseline gap-2.5">
                <span className="w-5 shrink-0 font-mono text-[11px] text-[#718096]">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <span className="text-[14.5px] font-semibold text-[#243447]">
                  {module.name}
                </span>
              </span>
              <span className="col-start-1 pl-[30px] text-[13px] leading-[1.55] text-[#526478] lg:col-start-2 lg:pl-0">
                {module.owns}
              </span>
              <span className="col-start-1 hidden pl-[30px] text-[12px] leading-[1.5] text-[#718096] lg:col-start-3 lg:block lg:pl-0">
                {module.users}
              </span>
              <svg
                width="12"
                height="12"
                viewBox="0 0 12 12"
                fill="none"
                aria-hidden="true"
                className={`col-start-2 row-start-1 mt-1 justify-self-end text-[#718096] transition-transform lg:col-start-4 lg:mt-0 ${
                  open ? 'rotate-180' : ''
                }`}
              >
                <path d="M2.5 4.5L6 8l3.5-3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            {open ? (
              <div
                id={`module-${module.id}`}
                className="bg-white/70 px-0 pb-5 pt-1 lg:pl-[224px]"
              >
                <p className="mb-3 text-[11.5px] font-medium text-[#718096] lg:hidden">
                  Primary users · {module.users}
                </p>
                <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,260px)]">
                  <div>
                    <h3 className="text-[11.5px] font-medium text-[#526478]">What it holds</h3>
                    <ul className="mt-1.5 space-y-1">
                      {module.holds.map((item) => (
                        <li key={item} className="flex gap-2 text-[13px] leading-[1.55] text-[#243447]">
                          <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-[#9AAABB]" aria-hidden="true" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-[11.5px] font-medium text-[#526478]">Access</h3>
                    <p className="mt-1.5 text-[13px] leading-[1.55] text-[#526478]">
                      {module.access}
                    </p>
                  </div>
                </div>
              </div>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}
