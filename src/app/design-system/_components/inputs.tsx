import React from 'react';
import {
  Checkbox,
  Field,
  SearchInput,
  Select,
  TextInput,
  Textarea,
  Toggle,
} from '@/components/ui/Input';
import { Specimen } from './specimen';

/*======================================================================
  Form specimens
  ======================================================================
  Field wires its control's id and aria-describedby automatically by
  cloning the single control it receives, so validation is announced
  rather than only coloured.
====================================================================== */

export function InputSpecimens() {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Specimen
        name="Text input and search"
        variant="TextInput · SearchInput"
        note="One control surface: border, radius, shadow, focus. Search adds a clear affordance only when there is a value."
      >
        <div className="grid gap-4">
          <Field label="Licence number" hint="Format as issued, e.g. MCI-88214">
            <TextInput placeholder="MCI-00000" defaultValue="MCI-88214" />
          </Field>

          <div>
            <p className="text-ink-secondary mb-1.5 text-[11px] font-semibold tracking-[0.1em] uppercase">
              Search
            </p>
            <SearchInput
              label="Search clinicians"
              placeholder="Search by name, specialty or licence"
            />
          </div>
        </div>
      </Specimen>

      <Specimen
        name="Select and textarea"
        variant="Select · Textarea"
        note="Native controls keep keyboard and mobile behaviour; only the surface is styled."
      >
        <div className="grid gap-4">
          <Field label="Status filter">
            <Select defaultValue="ALL">
              <option value="ALL">All statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="PENDING">Pending approval</option>
              <option value="SUSPENDED">Suspended</option>
            </Select>
          </Field>

          <Field
            label="Delay reason"
            hint="Recorded against the case and the audit entry"
          >
            <Textarea placeholder="Reason for the delay" rows={3} />
          </Field>
        </div>
      </Specimen>

      <Specimen
        name="Toggle and checkbox"
        variant="Toggle · Checkbox"
        note="The switch carries role='switch' and aria-checked; the checkbox stays native so form semantics are preserved."
      >
        <div className="grid gap-5">
          <Toggle
            label="Email notifications"
            description="Alerts for own schedule changes"
            defaultChecked
          />
          <Toggle label="Read-only workspace" description="Disabled state" disabled />
          <Checkbox
            label="Include completed cases"
            description="Adds CP-state records to the schedule view"
            defaultChecked
          />
          <Checkbox label="Include cancelled cases" disabled />
        </div>
      </Specimen>

      <Specimen
        name="Validation and error states"
        variant="Field(error) · invalid"
        note="Error text is announced (role='alert') and wired through aria-describedby; the border colour is reinforcement, not the message."
      >
        <div className="grid gap-4">
          <Field
            label="Licence number"
            required
            error="A licence number is already recorded for this account."
          >
            <TextInput invalid defaultValue="MCI-88214" />
          </Field>

          <Field label="Specialty" hint="Leave blank to record it later">
            <TextInput placeholder="e.g. Hepatobiliary surgery" />
          </Field>

          <Field
            label="Department"
            hint="Required before the profile can be completed"
            required
          >
            <Select defaultValue="">
              <option value="" disabled>
                Select a department
              </option>
              <option value="dept-1">General Surgery</option>
              <option value="dept-2">Cardiothoracic</option>
            </Select>
          </Field>
        </div>
      </Specimen>
    </div>
  );
}
