'use client';

import { useState } from 'react';
import { auditSample, roleScopes } from './clinical-data';

export function AccessPanel() {
  const [roleName, setRoleName] = useState<(typeof roleScopes)[number]['role']>(
    roleScopes[0].role,
  );
  const role = roleScopes.find((item) => item.role === roleName) ?? roleScopes[0];
  const highlighted = auditSample.filter((entry) => entry.role === role.role).length;

  return (
    <div>
      <div
        role="group"
        aria-label="Role scope"
        className="flex flex-wrap gap-1.5 border-b border-[#D9E3EC] pb-4"
      >
        {roleScopes.map((item) => {
          const selected = item.role === role.role;
          return (
            <button
              key={item.role}
              type="button"
              onClick={() => setRoleName(item.role)}
              aria-pressed={selected}
              className={`inline-flex min-h-11 items-center gap-2 rounded-md border px-3 text-[13px] font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#245B8F] sm:min-h-9 ${
                selected
                  ? 'border-[#245B8F] bg-[#245B8F] text-white'
                  : 'border-[#D9E3EC] bg-white text-[#47586B] hover:border-[#B9CADB]'
              }`}
            >
              {item.role}
              <span
                className={`font-mono text-[10.5px] ${
                  selected ? 'text-white/75' : 'text-[#718096]'
                }`}
              >
                {item.count}
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-6 grid gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-14">
        <div aria-live="polite">
          <h3 className="text-[15px] font-semibold text-[#243447]">{role.role}</h3>
          <p className="mt-1 max-w-[46ch] text-[13.5px] leading-[1.6] text-[#526478]">
            {role.summary}
          </p>

          <h4 className="mt-5 text-[11.5px] font-medium text-[#718096]">Can</h4>
          <ul className="mt-1.5 space-y-1.5">
            {role.can.map((item) => (
              <li key={item} className="flex gap-2.5 text-[13px] leading-[1.5] text-[#243447]">
                <span className="mt-[8px] h-[5px] w-[5px] shrink-0 rounded-full bg-[#24845D]" aria-hidden="true" />
                {item}
              </li>
            ))}
          </ul>

          <h4 className="mt-5 text-[11.5px] font-medium text-[#718096]">Cannot</h4>
          <ul className="mt-1.5 space-y-1.5">
            {role.cannot.map((item) => (
              <li key={item} className="flex gap-2.5 text-[13px] leading-[1.5] text-[#526478]">
                <span className="mt-[7px] h-[5px] w-[5px] shrink-0 rounded-[1px] bg-[#A7B5C4]" aria-hidden="true" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h3 className="text-[13.5px] font-semibold text-[#243447]">Sample audit extract</h3>
            <p className="text-[11.5px] text-[#718096]">
              {highlighted > 0
                ? `Highlighting ${highlighted} action${highlighted === 1 ? '' : 's'} by ${role.role}`
                : `No ${role.role.toLowerCase()}-attributed actions in this extract`}
            </p>
          </div>

          <ul className="mt-2 border-t border-[#D9E3EC]">
            {auditSample.map((entry) => {
              const match = entry.role === role.role;
              return (
                <li
                  key={`${entry.time}-${entry.action}`}
                  className={`grid grid-cols-[62px_minmax(0,1fr)] gap-x-3 border-b border-[#E6EDF4] py-2 transition-colors ${
                    match ? 'bg-[#F2F7FC]' : ''
                  }`}
                >
                  <span className="font-mono text-[10.5px] text-[#718096]">{entry.time}</span>
                  <span className="min-w-0">
                    <span className={`block text-[12.5px] leading-[1.4] ${match ? 'font-medium text-[#243447]' : 'text-[#526478]'}`}>
                      {entry.action}
                    </span>
                    <span className="mt-0.5 block text-[11px] text-[#718096]">
                      {entry.actor} · {entry.role} · {entry.entity}
                    </span>
                  </span>
                </li>
              );
            })}
          </ul>
          <p className="mt-2 text-[11px] leading-[1.5] text-[#718096]">
            Synthetic extract. In the application the trail is filterable by actor, action and
            date, and requires the audit permission.
          </p>
        </div>
      </div>
    </div>
  );
}
