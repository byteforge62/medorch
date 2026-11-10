import type { StaticImageData } from 'next/image';

import anaesthesiaWorkstation from '@/assets/clinical/anaesthesia-workstation.webp';
import blurMap from '@/assets/clinical/blur.json';
import clinicalCorridor from '@/assets/clinical/clinical-corridor.webp';
import clinicalCorridorTeam from '@/assets/clinical/clinical-corridor-team.webp';
import patientMonitor from '@/assets/clinical/patient-monitor.webp';
import theatrePlant from '@/assets/clinical/theatre-plant.webp';
import theatreSuite from '@/assets/clinical/theatre-suite.webp';
import treatmentRoom from '@/assets/clinical/treatment-room.webp';
import vitalsMonitor from '@/assets/clinical/vitals-monitor.webp';

/*======================================================================
  Clinical media register
  ======================================================================
  Every photograph used in the product is declared here with the plate
  code printed beside it in the interface, a factual caption, and the
  Pexels source it was licensed from. The full licence and usage record
  lives in docs/design-system/final-visual-upgrade/ASSET_MANIFEST.md.

  None of these photographs shows an identifiable patient, a hospital
  brand or a record. They are environmental evidence: rooms, plant and
  clinical work, used to anchor the interface in the real theatre floor.
====================================================================== */

export type ClinicalMediaKey =
  | 'theatre-suite'
  | 'theatre-plant'
  | 'treatment-room'
  | 'clinical-corridor'
  | 'patient-monitor'
  | 'vitals-monitor'
  | 'anaesthesia-workstation'
  | 'clinical-corridor-team';

type ClinicalMediaEntry = {
  src: StaticImageData;
  plate: string;
  caption: string;
  detail: string;
  source: string;
  photographer: string;
  purpose: string;
};

const blur = blurMap as Record<string, string>;

export const clinicalMedia: Record<ClinicalMediaKey, ClinicalMediaEntry> = {
  'theatre-suite': {
    src: theatreSuite,
    plate: 'PLATE 01',
    caption: 'Laminar-flow theatre, set for a case',
    detail: 'Ceiling pendants, anaesthesia plant and instrument trolley.',
    source: 'https://www.pexels.com/photo/39824872/',
    photographer: 'Pexels contributor',
    purpose: 'Theatre identity, theatre floor context, schedules header.',
  },
  'theatre-plant': {
    src: theatrePlant,
    plate: 'PLATE 02',
    caption: 'Theatre floor in service',
    detail: 'Operating table, gas columns and monitoring stack.',
    source: 'https://www.pexels.com/photo/39299175/',
    photographer: 'Pexels contributor',
    purpose: 'Theatre module photography and equipment context.',
  },
  'treatment-room': {
    src: treatmentRoom,
    plate: 'PLATE 03',
    caption: 'Treatment bay prepared for a procedure',
    detail: 'Procedure lamp, examination couch and wall services.',
    source: 'https://www.pexels.com/photo/7108114/',
    photographer: 'Pexels contributor',
    purpose: 'Access frontispiece and clinical workspace context.',
  },
  'clinical-corridor': {
    src: clinicalCorridor,
    plate: 'PLATE 04',
    caption: 'Transport corridor outside the theatre suite',
    detail: 'Empty trolley bays, sterile floor finish, no patients present.',
    source: 'https://www.pexels.com/photo/11660582/',
    photographer: 'Pexels contributor',
    purpose: 'Patient registry context and theatre circulation.',
  },
  'patient-monitor': {
    src: patientMonitor,
    plate: 'PLATE 05',
    caption: 'Patient monitor on a transport trolley',
    detail: 'Waveform display and lead set, unoccupied.',
    source: 'https://www.pexels.com/photo/5875565/',
    photographer: 'Pexels contributor',
    purpose: 'Monitoring equipment identity in the equipment register.',
  },
  'vitals-monitor': {
    src: vitalsMonitor,
    plate: 'PLATE 06',
    caption: 'Vital-signs monitor, theatre configuration',
    detail: 'ECG, SpO₂ and pressure traces on a live screen.',
    source: 'https://www.pexels.com/photo/11198232/',
    photographer: 'Pexels contributor',
    purpose: 'Alerts and monitoring context.',
  },
  'anaesthesia-workstation': {
    src: anaesthesiaWorkstation,
    plate: 'PLATE 07',
    caption: 'Anaesthesia workstation and gas supply',
    detail: 'Vaporiser, ventilator circuit and scavenging.',
    source: 'https://www.pexels.com/photo/13697729/',
    photographer: 'Pexels contributor',
    purpose: 'Anaesthesia plant identity in the equipment register.',
  },
  'clinical-corridor-team': {
    src: clinicalCorridorTeam,
    plate: 'PLATE 08',
    caption: 'Clinical team between theatre lists',
    detail: 'Teaching corridor, staff photographed at distance.',
    source: 'https://www.pexels.com/photo/127873/',
    photographer: 'Pexels contributor',
    purpose: 'Department and workforce environment context.',
  },
};

export function blurFor(key: ClinicalMediaKey) {
  return blur[key];
}

/*----------------------------------------------------------------------
  Category → plate mapping for the equipment register. The register is
  keyed by the categories the database actually carries, so a new
  category simply falls back to the generic plant plate rather than
  inventing an image.
---------------------------------------------------------------------- */

export function equipmentPlate(category: string, name = ''): ClinicalMediaKey {
  const value = `${category} ${name}`.toLowerCase();

  if (value.includes('monitor') || value.includes('ecg')) {
    return 'vitals-monitor';
  }
  if (value.includes('anaesthesia') || value.includes('ventilator')) {
    return 'anaesthesia-workstation';
  }
  if (value.includes('light') || value.includes('table')) {
    return 'theatre-suite';
  }
  if (value.includes('ultrasound') || value.includes('imaging')) {
    return 'patient-monitor';
  }
  if (value.includes('steril') || value.includes('suction')) {
    return 'theatre-plant';
  }
  return 'theatre-plant';
}

/*----------------------------------------------------------------------
  Department identity. The four seeded divisions map to a specialty
  plate; anything else receives the theatre environment plate and a
  neutral glyph, never an unrelated image.
---------------------------------------------------------------------- */

export function departmentPlate(name: string): ClinicalMediaKey {
  const value = name.toLowerCase();

  if (value.includes('cardio')) return 'vitals-monitor';
  if (value.includes('neuro')) return 'theatre-suite';
  if (value.includes('ortho')) return 'theatre-plant';
  if (value.includes('general')) return 'treatment-room';

  return 'clinical-corridor';
}

export function departmentGlyph(
  name: string,
): 'theatre' | 'anaesthesia' | 'sterile' | 'imaging' {
  const value = name.toLowerCase();

  if (value.includes('cardio')) return 'anaesthesia';
  if (value.includes('neuro')) return 'imaging';
  if (value.includes('ortho')) return 'sterile';

  return 'theatre';
}
