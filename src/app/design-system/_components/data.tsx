import React from 'react';
import { StatusPill } from '@/components/ui/StatusPill';
import {
  AvailabilityIndicator,
  ChartFrame,
  MetricIndicator,
  OperationalStatus,
  ProgressBar,
  Timeline,
  TimelineItem,
} from '@/components/ui/Indicators';
import { Row, Specimen } from './specimen';

/*======================================================================
  Data-presentation specimens
====================================================================== */

export function DataSpecimens() {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Specimen
        name="Status pills"
        variant="tone='positive' | 'attention' | 'critical' | 'neutral' | 'info' | 'accent'"
        note="Every tone carries its label. The dot is optional and aria-hidden; it is never the only signal."
      >
        <Row label="sm">
          <StatusPill tone="positive" dot>Completed</StatusPill>
          <StatusPill tone="attention" dot>In progress</StatusPill>
          <StatusPill tone="critical" dot>Delayed</StatusPill>
          <StatusPill tone="neutral" dot>Scheduled</StatusPill>
          <StatusPill tone="info" dot>Confirmed</StatusPill>
          <StatusPill tone="accent" dot>Admin</StatusPill>
        </Row>
        <Row label="md, no dot">
          <StatusPill size="md" tone="positive">Available</StatusPill>
          <StatusPill size="md" tone="neutral">Offline</StatusPill>
        </Row>
      </Specimen>

      <Specimen
        name="Metric indicators"
        variant="tone='accent' | 'neutral' | 'positive' | 'attention' | 'critical'"
        note="Label, value, optional unit and one supporting line. No sparkline, no invented trend."
      >
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <MetricIndicator label="Modules" value="10" />
          <MetricIndicator label="States" value="6" tone="neutral" />
          <MetricIndicator label="Approved" value="4" tone="positive" />
          <MetricIndicator label="Awaiting" value="1" tone="attention" />
          <MetricIndicator label="Restricted" value="1" tone="critical" />
          <MetricIndicator label="Turnover" value="12" unit="min" />
        </div>
      </Specimen>

      <Specimen
        name="Progress indicators"
        variant="tone='accent' | 'positive' | 'attention' | 'critical' · size"
        note="Always exposes the number through aria-valuenow. The label carries the meaning; the bar carries the proportion."
      >
        <div className="space-y-4">
          <ProgressBar label="OT-01 · scheduled" value={72} valueLabel="3 of 4 cases" />
          <ProgressBar label="OT-02 · complete" value={100} tone="positive" />
          <ProgressBar label="OT-03 · delayed" value={38} tone="attention" />
          <ProgressBar label="OT-04 · cleaning" value={18} tone="critical" size="sm" />
        </div>
      </Specimen>

      <Specimen
        name="Timeline"
        variant="Timeline · TimelineItem(tone, last)"
        note="Time is set in tabular mono so a sequence aligns; the tone marks the event that matters."
      >
        <Timeline label="Audit preview">
          <TimelineItem
            time="09:42:18"
            title="Schedule status changed"
            description="CONFIRMED → IN_PROGRESS · OT-01 · OT staff"
            tone="accent"
          />
          <TimelineItem
            time="09:38:04"
            title="Equipment assigned"
            description="Laparoscopy stack · Tower 2"
          />
          <TimelineItem
            time="09:31:55"
            title="Case delayed"
            description="Reason recorded · OT-03"
            tone="attention"
            last
          />
        </Timeline>
      </Specimen>

      <Specimen
        name="Chart container"
        variant="ChartFrame(title, caption, meta, footer)"
        note="A frame, not a chart library. It gives a plotted area a title, a caption and a provenance line."
      >
        <ChartFrame
          title="Theatre utilisation"
          caption="Interface preview · sample day"
          meta={<StatusPill tone="info" size="sm">Preview</StatusPill>}
          footer="Occupancy reads from the same record as the schedule."
        >
          <div className="ds-grid-paper border-rule-soft h-28 rounded-[var(--radius-sm)] border" />
        </ChartFrame>
      </Specimen>

      <Specimen
        name="Availability"
        variant="AvailabilityIndicator(state='available' | 'in-use' | 'maintenance' | 'offline')"
        note="The state is named in text; the dot only reinforces it."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <AvailabilityIndicator state="available" detail="Turnover clean complete" />
          <AvailabilityIndicator state="in-use" detail="Assigned to open case" />
          <AvailabilityIndicator state="maintenance" detail="Service window open" />
          <AvailabilityIndicator state="offline" detail="Removed from inventory" />
        </div>
      </Specimen>

      <Specimen
        name="Operational status"
        variant="OperationalStatus(level='nominal' | 'watch' | 'critical', live?)"
        note="One line of live state. `live` animates the dot; reduced motion holds it still. Used only where state streams."
        className="lg:col-span-2"
      >
        <div className="grid gap-3 sm:grid-cols-3">
          <OperationalStatus level="nominal" label="Suite" detail="4 theatres reporting" live />
          <OperationalStatus level="watch" label="Turnover" detail="OT-03 delayed" />
          <OperationalStatus level="critical" label="Equipment" detail="Anaesthesia bay 4" />
        </div>
      </Specimen>
    </div>
  );
}
