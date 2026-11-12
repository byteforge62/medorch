import { Check, Minus } from '@phosphor-icons/react/dist/ssr';

import { roleScopes } from './clinical-data';

type AccessCell = {
  label: string;
  allowed: boolean;
};

const rows: Array<{
  area: string;
  note: string;
  cells: [AccessCell, AccessCell, AccessCell, AccessCell];
}> = [
  {
    area: 'Schedules',
    note: 'Create, edit, status and notes',
    cells: [
      { label: 'Manage', allowed: true },
      { label: 'Manage', allowed: true },
      { label: 'Assigned', allowed: true },
      { label: 'Own', allowed: true },
    ],
  },
  {
    area: 'Theatres',
    note: 'Room state and availability',
    cells: [
      { label: 'Manage', allowed: true },
      { label: 'Read', allowed: true },
      { label: 'Read', allowed: true },
      { label: 'None', allowed: false },
    ],
  },
  {
    area: 'Patients',
    note: 'Registry and clinical detail',
    cells: [
      { label: 'Manage', allowed: true },
      { label: 'Clinical', allowed: true },
      { label: 'None', allowed: false },
      { label: 'Own visits', allowed: true },
    ],
  },
  {
    area: 'Resources',
    note: 'Staff and equipment assignment',
    cells: [
      { label: 'Assign', allowed: true },
      { label: 'Read', allowed: true },
      { label: 'Read', allowed: true },
      { label: 'None', allowed: false },
    ],
  },
  {
    area: 'Accounts',
    note: 'Approval, roles and status',
    cells: [
      { label: 'Manage', allowed: true },
      { label: 'None', allowed: false },
      { label: 'None', allowed: false },
      { label: 'None', allowed: false },
    ],
  },
  {
    area: 'Audit',
    note: 'Attributed change history',
    cells: [
      { label: 'Read', allowed: true },
      { label: 'None', allowed: false },
      { label: 'None', allowed: false },
      { label: 'None', allowed: false },
    ],
  },
];

const roles = ['Administrator', 'Doctor', 'OT staff', 'Patient'];

export function AccessPanel() {
  return (
    <div>
      {/* On a narrow screen a four-column matrix hides three of the four
          roles. The same permission data is presented as role records. */}
      <div className="grid gap-2 md:hidden">
        {roleScopes.map((role) => (
          <article
            key={role.role}
            className="rounded-[14px] border border-[#E4DCF0] bg-white/82 p-3.5"
          >
            <div className="flex items-baseline justify-between gap-3 border-b border-[#EFEAF7] pb-2">
              <h3 className="text-[12px] font-semibold text-[#28233D]">{role.role}</h3>
              <span className="font-mono text-[8.5px] tracking-[0.06em] text-[#8A829E]">
                {role.count} permissions
              </span>
            </div>
            <p className="mt-2 text-[10px] leading-[1.55] text-[#77718F]">{role.summary}</p>
            <ul className="mt-2 grid gap-1.5">
              {role.can.map((permission) => (
                <li key={permission} className="flex items-start gap-1.5 text-[10px] leading-[1.45] text-[#4E4768]">
                  <Check size={10} weight="bold" className="mt-0.5 shrink-0 text-[#7055BE]" aria-hidden="true" />
                  {permission}
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>

      <div className="hidden overflow-x-auto pb-2 md:block">
        <table className="w-full min-w-[620px] border-separate border-spacing-0 text-left">
          <caption className="sr-only">
            Server-enforced access by role. The counts are the number of
            permissions held by each role.
          </caption>
          <thead>
            <tr>
              <th scope="col" className="w-[190px] border-b border-[#DCD2EC] pb-3 pr-4 align-bottom">
                <span className="text-[9px] font-semibold tracking-[0.12em] text-[#8A829E] uppercase">
                  Operational area
                </span>
              </th>
              {roles.map((role, index) => (
                <th
                  key={role}
                  scope="col"
                  className="border-b border-[#DCD2EC] px-2 pb-3 text-center align-bottom"
                >
                  <span className="block text-[11.5px] font-semibold text-[#28233D]">{role}</span>
                  <span className="mt-0.5 block font-mono text-[8.5px] tracking-[0.06em] text-[#8A829E]">
                    {roleScopes[index].count} permissions
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.area} className="group">
                <th scope="row" className="border-b border-[#EEE8F7] py-3 pr-4 align-top">
                  <span className="block text-[12px] font-semibold text-[#28233D]">{row.area}</span>
                  <span className="mt-0.5 block text-[9.5px] leading-[1.4] text-[#8A829E]">
                    {row.note}
                  </span>
                </th>
                {row.cells.map((cell, index) => (
                  <td
                    key={`${row.area}-${roles[index]}`}
                    className="border-b border-[#EEE8F7] px-2 py-3 text-center align-top"
                  >
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[9.5px] font-medium ${
                        cell.allowed
                          ? 'bg-[#EEE8F9] text-[#5F4BA8]'
                          : 'bg-[#F6F3FA] text-[#A39BB4]'
                      }`}
                    >
                      {cell.allowed ? (
                        <Check size={9} weight="bold" aria-hidden="true" />
                      ) : (
                        <Minus size={9} weight="bold" aria-hidden="true" />
                      )}
                      {cell.label}
                    </span>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-3 flex flex-wrap items-start justify-between gap-3 border-t border-[#E7DFF2] pt-3 sm:mt-4">
        <p className="max-w-[62ch] text-[10.5px] leading-[1.6] text-[#77718F]">
          Access is checked in the server for every request. A hidden control is
          not a security boundary; the API is.
        </p>
        <p className="font-mono text-[8.5px] tracking-[0.12em] text-[#A39BB4] uppercase">
          Source · permission matrix
        </p>
      </div>
    </div>
  );
}
