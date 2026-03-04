import { useState, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  FileSpreadsheet, ClipboardCopy, Download, Upload, Check,
} from 'lucide-react';
import mammoth from 'mammoth';

// ── Dropdown option data ────────────────────────────────────────────────

const POLICY_FORMS = ['Dwelling Form', 'Dwelling Form (GFIP)', 'General Propery Form', 'RCBAP Form'];

const OCCUPANCY_OPTIONS = [
  'Single-Family Home', 'Residential unit', 'Residential manufactured (mobile) home',
  'Two-to-four-family building', 'Residential Condominium Building', 'Other residential building',
  'Non-residential building', 'Non-residential unit', 'Non-residential manufactured (mobile) home',
];

const RESIDENTIAL_BUILDING_TYPES = [
  'Main Dwelling', 'Detached guest house', 'Apartment unit', 'Entire apartment building',
  'Cooperative unit', 'Entire cooperative building',
  'residential condominium unit (in a residential building)',
  'residential condominium unit (in a non-residential building)',
  'Entire residential condominium building', 'Other dwelling type (explain in comments)',
];

const NON_RESIDENTIAL_BUILDING_TYPES = [
  'Agricultural building', 'Commercial building', 'Government-owned building',
  'House of worship building', 'Recreation building', 'Detached garage', 'Storage/tool shed',
  'Other non-residential building type (explain in comments)',
];

const FOUNDATION_TYPES = [
  'Slab-on-grade (non-elevated)', 'Basement (non-elevated)',
  'Crawlspace (elevated or non-elevated sub-grade)',
  'Elevated without enclosure (on piers, posts or piles)',
  'Elevated with enclosure (on piers, posts or piles)',
  'Elevated with enclosure (on foundation walls)',
];

const CONSTRUCTION_TYPES = ['Framed', 'Masonry', 'Other'];
const YES_NO_NA = ['N/A', 'Yes', 'No'];

const FLOOD_ZONES = [
  'NA','X','B','C','D','A','AE',
  ...Array.from({ length: 30 }, (_, i) => `A${i + 1}`), 'A99',
  'AH','AO','AR','V','VE',
  ...Array.from({ length: 30 }, (_, i) => `V${i + 1}`),
];

// ── Helpers ─────────────────────────────────────────────────────────────

function formatDate(iso: string): string {
  if (!iso) return '';
  const [year, month, day] = iso.split('-');
  return `${month}/${day}/${year}`;
}

function valOrZero(v: string): string {
  return v.trim() === '' ? '0' : v;
}

// ── Initial form state ──────────────────────────────────────────────────

interface FormData {
  [key: string]: string;
}

const INITIAL: FormData = {
  adjusterName: '', adjusterFcnNumber: '', adjusterPhoneNumber: '', firm_email: '',
  agentName: '', agentCellNumber: '', agentEmail: '', mortgageCompany: '',
  policyholderName: '', policyholderEmail: '', phoneNumberPrimary: '', phoneNumberSecondary: '',
  policyNumber: '', claimNumber: '', policyStartDate: '', policyEndDate: '',
  edn: '', insurer: '', insurer_street: '', insurer_city: '', insurer_state: '', insurer_zip: '',
  adjustingFirm: '', adjusterFileNumber: '',
  firm_street: '', firm_city: '', firm_state: '', firm_zip: '', firm_phone_number: '',
  loss_street: '', loss_city: '', loss_state: '', loss_zip: '',
  mailing_street: '', mailing_city: '', mailing_state: '', mailing_zip: '',
  dateOfLoss: '', dateOfAssignment: '', dateOfContact: '', dateOfInspection: '',
  coverageABuilding: '', deductibleABuilding: '', coverageBPersonalProperty: '',
  deductibleBPersonalProperty: '', coverageOtherStructures: '', deductibleOtherStructure: '',
  risk_method: '', sfip_policy_type: 'Dwelling Form', number_of_units: '',
  pri_building_occupancy: 'Single-Family Home', pri_building_type: 'Main Dwelling',
  primary_secondary: '', tenant_indicator: '', number_of_floors: '',
  pri_foundation_type: 'Slab-on-grade (non-elevated)', pri_construction_type: 'Framed',
  number_of_flood_openings: '', area_of_permanent_flood: '', openings: '', engineered_openings: '',
  does_building_contain_me: 'N/A', me_located_above_first_floor: 'N/A',
  building_contain_washer_dryer_freezer: 'N/A', washer_dryer_freezer_above_first_floor: 'N/A',
  enclosure_size: '', first_floor_height: '', first_floor_height_method: '',
  firmStatus: '', floodZone: 'NA',
  dateOfConstruction: '', substantial_improvement_date: '', firmDate: '',
  community_map: '', map_panel: '',
};

// ── Reusable form field components ──────────────────────────────────────

function TextField({ label, field, required, type = 'text', disabled, value, onChange }: {
  label: string; field: string; required?: boolean; type?: string; disabled?: boolean;
  value: string; onChange: (field: string, value: string) => void;
}): React.JSX.Element {
  return (
    <label className="block">
      <span className="text-sm text-[var(--color-mist)] mb-1 block">
        {label}{required && <span className="text-red-400 ml-1">*</span>}
      </span>
      <input
        type={type}
        value={value}
        onChange={e => onChange(field, e.target.value)}
        required={required}
        disabled={disabled}
        className="w-full px-3 py-2 rounded-lg bg-[var(--color-abyss)] border border-[var(--color-wave)]/30 text-[var(--color-pearl)] text-sm focus:outline-none focus:border-[var(--color-surf)] disabled:opacity-50 transition-colors"
      />
    </label>
  );
}

function SelectField({ label, field, options, value, onChange }: {
  label: string; field: string; options: string[];
  value: string; onChange: (field: string, value: string) => void;
}): React.JSX.Element {
  return (
    <label className="block">
      <span className="text-sm text-[var(--color-mist)] mb-1 block">{label}</span>
      <select
        value={value}
        onChange={e => onChange(field, e.target.value)}
        className="w-full px-3 py-2 rounded-lg bg-[var(--color-abyss)] border border-[var(--color-wave)]/30 text-[var(--color-pearl)] text-sm focus:outline-none focus:border-[var(--color-surf)] transition-colors"
      >
        {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
      </select>
    </label>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }): React.JSX.Element {
  return (
    <div className="glass rounded-2xl p-6 mb-4">
      <h2 className="text-lg font-semibold mb-4 pb-3 border-b border-[var(--color-wave)]/30">
        {title}
      </h2>
      <div className="grid sm:grid-cols-2 gap-4">
        {children}
      </div>
    </div>
  );
}

// ── Component ───────────────────────────────────────────────────────────

export default function ImportFormPage(): React.JSX.Element {
  const [form, setForm] = useState<FormData>({ ...INITIAL });
  const [sameAddress, setSameAddress] = useState(false);
  const [jsonOutput, setJsonOutput] = useState('');
  const [copied, setCopied] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const set = useCallback((field: string, value: string) => {
    setForm(prev => {
      const next = { ...prev, [field]: value };
      // Auto-fill policy end date = start date + 1 year
      if (field === 'policyStartDate' && value) {
        const d = new Date(value);
        d.setFullYear(d.getFullYear() + 1);
        next.policyEndDate = d.toISOString().split('T')[0];
      }
      return next;
    });
  }, []);

  const isNonResidential = form.pri_building_occupancy.toLowerCase().includes('non-residential');
  const buildingTypes = isNonResidential ? NON_RESIDENTIAL_BUILDING_TYPES : RESIDENTIAL_BUILDING_TYPES;

  // -- Same-as-loss toggle
  function toggleSameAddress(checked: boolean): void {
    setSameAddress(checked);
    if (checked) {
      setForm(prev => ({
        ...prev,
        mailing_street: prev.loss_street,
        mailing_city: prev.loss_city,
        mailing_state: prev.loss_state,
        mailing_zip: prev.loss_zip,
      }));
    } else {
      setForm(prev => ({
        ...prev,
        mailing_street: '', mailing_city: '', mailing_state: '', mailing_zip: '',
      }));
    }
  }

  // -- Build JSON output
  function buildJSON(): object {
    const ffh = form.first_floor_height;
    return {
      backOffice: {
        adjusterName: form.adjusterName,
        adjusterFcnNumber: form.adjusterFcnNumber,
        adjusterFileNumber: form.adjusterFileNumber,
        agencyInfo: {
          agentName: form.agentName, agentCellNumber: form.agentCellNumber,
          agentEmail: form.agentEmail, mortgageCompany: form.mortgageCompany,
        },
        policyInformation: {
          policyholderName: form.policyholderName, policyholderEmail: form.policyholderEmail,
          phoneNumberPrimary: form.phoneNumberPrimary, phoneNumberSecondary: form.phoneNumberSecondary,
          policyNumber: form.policyNumber, claimNumber: form.claimNumber,
          policyStartDate: formatDate(form.policyStartDate), policyEndDate: formatDate(form.policyEndDate),
        },
        insurerInfo: {
          insurer: form.insurer, edn: form.edn,
          policyNumber: form.policyNumber, claimNumber: form.claimNumber,
          adjuster: form.adjusterName, fcn: form.adjusterFcnNumber,
          adjustingFirm: form.adjustingFirm, fileNumber: form.adjusterFileNumber,
          insurerAddress: { street: form.insurer_street, city: form.insurer_city, state: form.insurer_state, zip: form.insurer_zip },
          firmAddress: { street: form.firm_street, city: form.firm_city, state: form.firm_state, zip: form.firm_zip },
          phoneNumber_1: form.firm_phone_number, phoneNumber_2: form.adjusterPhoneNumber,
          email: form.firm_email, comments: '',
        },
        mailingAddress: { street: form.mailing_street, city: form.mailing_city, state: form.mailing_state, zip: form.mailing_zip },
        lossAddress: { street: form.loss_street, city: form.loss_city, state: form.loss_state, zip: form.loss_zip },
        sameAddress: false,
        claimInfo: {
          dateOfLoss: formatDate(form.dateOfLoss), dateOfAssignment: formatDate(form.dateOfAssignment),
          dateOfContact: formatDate(form.dateOfContact), dateOfInspection: formatDate(form.dateOfInspection),
        },
        coverages: {
          coverageABuilding: valOrZero(form.coverageABuilding), deductibleABuilding: valOrZero(form.deductibleABuilding),
          coverageBPersonalProperty: valOrZero(form.coverageBPersonalProperty), deductibleBPersonalProperty: valOrZero(form.deductibleBPersonalProperty),
          coverageOtherStructures: valOrZero(form.coverageOtherStructures), deductibleOtherStructure: valOrZero(form.deductibleOtherStructure),
        },
        ratingInformation: {
          riskMethod: form.risk_method, sfipPolicyType: form.sfip_policy_type,
          numberOfUnits: form.number_of_units, priBuildingOccupancy: form.pri_building_occupancy,
          priBuildingType: form.pri_building_type, primarySecondary: form.primary_secondary,
          tenantIndicator: form.tenant_indicator, numberOfFloors: form.number_of_floors,
          priFoundationType: form.pri_foundation_type, priConstructionType: form.pri_construction_type,
          numberOfFloodOpenings: form.number_of_flood_openings, areaOfPermanentFlood: form.area_of_permanent_flood,
          openings: form.openings, engineeredOpenings: form.engineered_openings,
          doesBuildingContainME: form.does_building_contain_me,
          mELocatedAboveFirstFloor: form.me_located_above_first_floor,
          buildingContainWasherDryerFreezer: form.building_contain_washer_dryer_freezer,
          washerDryerFreezerAboveFirstFloor: form.washer_dryer_freezer_above_first_floor,
          enclosureSize: form.enclosure_size,
          firstFloorHeightInFeet: ffh ? Math.floor(parseFloat(ffh)).toString() : '',
          firstFloorHeightInches: ffh ? Math.floor((parseFloat(ffh) % 1) * 12).toString() : '',
          firstFloorHeightMethod: form.first_floor_height_method,
          postFirm: form.firmStatus === 'Post', preFirm: form.firmStatus === 'Pre',
          floodZone: form.floodZone,
          dateOfConstruction: formatDate(form.dateOfConstruction),
          dateOfLastSubstantialImprovement: formatDate(form.substantial_improvement_date),
          firmDate: formatDate(form.firmDate),
          communityNumber: form.community_map, mapPanelNumber: form.map_panel,
        },
      },
      userClaims: {
        claimNumber: form.claimNumber, fileNumber: form.adjusterFileNumber,
        policyholder: form.policyholderName, policyNumber: form.policyNumber,
        assignedDate: formatDate(form.dateOfAssignment), dateOfLoss: formatDate(form.dateOfLoss),
        age: 0, status: 0,
      },
    };
  }

  function handleSubmit(e: React.FormEvent): void {
    e.preventDefault();
    setJsonOutput(JSON.stringify(buildJSON(), null, 4));
  }

  function handleCopy(): void {
    navigator.clipboard.writeText(jsonOutput);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleDownload(filename: string, data: string): void {
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function downloadTokenized(): void {
    const tokenized = {
      backOffice: {
        adjusterName: '[XM8_CLAIM_REP_NAME]', adjusterFcnNumber: '[XM8_CLAIM_REP_ADJUSTER_FCN]',
        adjusterFileNumber: '[XM8_FILE_NO]',
        agencyInfo: { agentName: '[XM8_AGENT_NAME]', agentCellNumber: '[XM8_AGENT_C_PHONE]', agentEmail: 'null', mortgageCompany: '[XM8_MORTGAGE_CO]' },
        policyInformation: { policyholderName: '[XM8_INSURED_NAME]', policyholderEmail: '[XM8_INSURED_EMAIL]', phoneNumberPrimary: '[XM8_INSURED_C_PHONE]', phoneNumberSecondary: '[XM8_INSURED_H_PHONE]', policyNumber: '[XM8_POLICY_NUM]', claimNumber: '[XM8_CLAIM_NUM]', policyStartDate: '[XM8_DATE_POLICY_EFFECTIVE]', policyEndDate: '[XM8_DATE_POLICY_TERM]' },
        insurerInfo: { insurer: '[XM8_REFERENCE_COMPANY]', edn: 'null', policyNumber: '[XM8_POLICY_NUM]', claimNumber: '[XM8_CLAIM_NUM]', adjuster: '[XM8_CLAIM_REP_NAME]', fcn: '[XM8_CLAIM_REP_ADJUSTER_FCN]', adjustingFirm: '[XM8_COMPANY_HDR_NAME]', fileNumber: '[XM8_FILE_NO]', insurerAddress: { street: '[XM8_REFERENCE_B_STREET]', city: '[XM8_REFERENCE_B_CITY]', state: '[XM8_REFERENCE_B_STATE]', zip: '[XM8_REFERENCE_B_ZIP]' }, firmAddress: { street: '[XM8_CLAIM_REP_B_STREET]', city: '[XM8_CLAIM_REP_B_CITY]', state: '[XM8_CLAIM_REP_B_STATE]', zip: '[XM8_CLAIM_REP_B_ZIP]' }, phoneNumber_1: '[XM8_CLAIM_REP_B_PHONE]', phoneNumber_2: '[XM8_CLAIM_REP_C_PHONE]', email: '[XM8_CLAIM_REP_E_MAIL]', comments: 'null' },
        mailingAddress: { street: '[XM8_INSURED_H_STREET]', city: '[XM8_INSURED_H_CITY]', state: '[XM8_INSURED_H_STATE]', zip: '[XM8_INSURED_H_ZIP]' },
        lossAddress: { street: '[XM8_INSURED_P_STREET]', city: '[XM8_INSURED_P_CITY]', state: '[XM8_INSURED_P_STATE]', zip: '[XM8_INSURED_P_ZIP]' },
        sameAddress: false,
        claimInfo: { dateOfLoss: '[XM8_DATE_LOSS]', dateOfAssignment: '[XM8_DATE_RECEIVED]', dateOfContact: '[XM8_DATE_CONTACTED]', dateOfInspection: '[XM8_DATE_INSPECTED]' },
        coverages: { coverageABuilding: '[XM8_COV_POLICY_LIMIT_1]', deductibleABuilding: '[XM8_COV_DEDUCTIBLE_1]', coverageBPersonalProperty: '[XM8_COV_POLICY_LIMIT_5]', deductibleBPersonalProperty: '[XM8_COV_DEDUCTIBLE_5]', coverageOtherStructures: '[XM8_COV_POLICY_LIMIT_2]', deductibleOtherStructure: '[XM8_COV_DEDUCTIBLE_2]' },
        ratingInformation: { riskMethod: '[XM8_RISK_METHOD]', sfipPolicyType: '[XM8_SFIP_POLICY_TYPE]', numberOfUnits: '[XM8_NUMBER_OF_UNITS]', priBuildingOccupancy: '[XM8_PRI_BUILDING_OCCUPANCY]', priBuildingType: '[XM8_PRI_BUILDING_TYPE]', primarySecondary: '[XM8_PRIMARY_SECONDARY]', tenantIndicator: '[XM8_TENANT_INDICATOR]', numberOfFloors: '[XM8_NUMBER_OF_FLOORS]', priFoundationType: '[XM8_PRI_FOUNDATION_TYPE]', priConstructionType: '[XM8_PRI_CONSTRUCTION_TYPE]', numberOfFloodOpenings: '[XM8_NUMBER_OF_FLOOD_OPENINGS]', areaOfPermanentFlood: '[XM8_AREA_OF_PERMANENT_FLOOD]', openings: '[XM8_OPENINGS]', engineeredOpenings: '[XM8_ENGINEERED_OPENINGS]', doesBuildingContainME: '[XM8_DOES_BUILDING_CONTAIN_ME]', mELocatedAboveFirstFloor: '[XM8_M&E_LOCATED_ABOVE_FIRST_FLOOR]', buildingContainWasherDryerFreezer: '[XM8_BUILDING_CONTAIN_WASHER_DRYER_FREEZER]', washerDryerFreezerAboveFirstFloor: '[XM8_WASHER_DRYER_FREEZER_ABOVE_FIRST_FLOOR]', enclosureSize: '[XM8_ENCLOSURE_SIZE]', firstFloorHeightInFeet: '[XM8_FIRST_FLOOR_HEIGHT_FEET]', firstFloorHeightInches: '[XM8_FIRST_FLOOR_HEIGHT_INCHES]', firstFloorHeightMethod: '[XM8_FIRST_FLOOR_HEIGHT_METHOD]', postFirm: '[XM8_FLOOD_POST_FIRM]', preFirm: '[XM8_FLOOD_PRE_FIRM]', floodZone: '[XM8_FLOOD_ZONE]', dateOfConstruction: '[XM8_FLOOD_DATE_CONSTRUCTED]', dateOfLastSubstantialImprovement: '[XM8_SUBSTANTIAL_IMPROVEMENT_DATE]', firmDate: '[XM8_FLOOD_FIRM_DATE]', communityNumber: '[XM8_COMMUNITY_MAP]', mapPanelNumber: '[XM8_MAP_PANEL]' },
      },
      userClaims: { claimNumber: '[XM8_CLAIM_NUM]', fileNumber: '[XM8_FILE_NO]', policyholder: '[XM8_INSURED_NAME]', policyNumber: '[XM8_POLICY_NUM]', assignedDate: '[XM8_DATE_RECEIVED]', dateOfLoss: '[XM8_DATE_LOSS]', age: 0, status: 0 },
    };
    handleDownload('jsonDataTokenized.txt', JSON.stringify(tokenized, null, 4));
  }

  // -- DOCX upload
  async function handleUpload(): Promise<void> {
    const file = fileRef.current?.files?.[0];
    if (!file) { alert('Please select a file'); return; }
    if (!file.name.toLowerCase().endsWith('.docx')) { alert('Please upload a DOCX file'); return; }

    try {
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });
      const text = result.value
        .replace(/[\u201C\u201D]/g, '"')
        .replace(/[\u2018\u2019]/g, "'")
        .replace(/\r\n/g, '\n')
        .replace(/\t/g, ' ');

      const jsonMatch = text.match(/{[\s\S]*}/);
      if (!jsonMatch) { alert('No valid JSON found in document'); return; }

      let parsed;
      try { parsed = JSON.parse(jsonMatch[0]); }
      catch {
        const fixed = jsonMatch[0]
          .replace(/([{,]\s*)(\w+)(:)/g, '$1"$2"$3')
          .replace(/:\s*'([^']*)'/g, ': "$1"')
          .replace(/,\s*}/g, '}')
          .replace(/,\s*]/g, ']');
        parsed = JSON.parse(fixed);
      }

      // Map parsed JSON back into form fields
      const bo = parsed.backOffice || parsed;
      const pi = bo.policyInformation || {};
      const ai = bo.agencyInfo || {};
      const ii = bo.insurerInfo || {};
      const ia = ii.insurerAddress || {};
      const fa = ii.firmAddress || {};
      const la = bo.lossAddress || {};
      const ma = bo.mailingAddress || {};
      const ci = bo.claimInfo || {};
      const cv = bo.coverages || {};
      const ri = bo.ratingInformation || {};

      // Convert MM/DD/YYYY to YYYY-MM-DD for date inputs
      const toISO = (d: string): string => {
        if (!d) return '';
        const parts = d.split('/');
        if (parts.length === 3) return `${parts[2]}-${parts[0].padStart(2, '0')}-${parts[1].padStart(2, '0')}`;
        return d;
      };

      // Reconstruct first floor height from feet + inches
      const ffhFeet = ri.firstFloorHeightInFeet || '';
      const ffhInches = ri.firstFloorHeightInches || '';
      const ffh = ffhFeet ? (parseFloat(ffhFeet) + (parseFloat(ffhInches || '0') / 12)).toString() : '';

      const firmStatus = ri.postFirm === true || ri.postFirm === 'true' ? 'Post'
        : ri.preFirm === true || ri.preFirm === 'true' ? 'Pre' : '';

      setForm({
        adjusterName: bo.adjusterName || '',
        adjusterFcnNumber: bo.adjusterFcnNumber || '',
        adjusterPhoneNumber: ii.phoneNumber_2 || '',
        firm_email: ii.email || '',
        agentName: ai.agentName || '',
        agentCellNumber: ai.agentCellNumber || '',
        agentEmail: ai.agentEmail || '',
        mortgageCompany: ai.mortgageCompany || '',
        policyholderName: pi.policyholderName || '',
        policyholderEmail: pi.policyholderEmail || '',
        phoneNumberPrimary: pi.phoneNumberPrimary || '',
        phoneNumberSecondary: pi.phoneNumberSecondary || '',
        policyNumber: pi.policyNumber || '',
        claimNumber: pi.claimNumber || '',
        policyStartDate: toISO(pi.policyStartDate || ''),
        policyEndDate: toISO(pi.policyEndDate || ''),
        edn: ii.edn || '',
        insurer: ii.insurer || '',
        insurer_street: ia.street || '',
        insurer_city: ia.city || '',
        insurer_state: ia.state || '',
        insurer_zip: ia.zip || '',
        adjustingFirm: ii.adjustingFirm || '',
        adjusterFileNumber: bo.adjusterFileNumber || '',
        firm_street: fa.street || '',
        firm_city: fa.city || '',
        firm_state: fa.state || '',
        firm_zip: fa.zip || '',
        firm_phone_number: ii.phoneNumber_1 || '',
        loss_street: la.street || '',
        loss_city: la.city || '',
        loss_state: la.state || '',
        loss_zip: la.zip || '',
        mailing_street: ma.street || '',
        mailing_city: ma.city || '',
        mailing_state: ma.state || '',
        mailing_zip: ma.zip || '',
        dateOfLoss: toISO(ci.dateOfLoss || ''),
        dateOfAssignment: toISO(ci.dateOfAssignment || ''),
        dateOfContact: toISO(ci.dateOfContact || ''),
        dateOfInspection: toISO(ci.dateOfInspection || ''),
        coverageABuilding: cv.coverageABuilding || '',
        deductibleABuilding: cv.deductibleABuilding || '',
        coverageBPersonalProperty: cv.coverageBPersonalProperty || '',
        deductibleBPersonalProperty: cv.deductibleBPersonalProperty || '',
        coverageOtherStructures: cv.coverageOtherStructures || '',
        deductibleOtherStructure: cv.deductibleOtherStructure || '',
        risk_method: ri.riskMethod || '',
        sfip_policy_type: ri.sfipPolicyType || 'Dwelling Form',
        number_of_units: ri.numberOfUnits || '',
        pri_building_occupancy: ri.priBuildingOccupancy || 'Single-Family Home',
        pri_building_type: ri.priBuildingType || 'Main Dwelling',
        primary_secondary: ri.primarySecondary || '',
        tenant_indicator: ri.tenantIndicator || '',
        number_of_floors: ri.numberOfFloors || '',
        pri_foundation_type: ri.priFoundationType || 'Slab-on-grade (non-elevated)',
        pri_construction_type: ri.priConstructionType || 'Framed',
        number_of_flood_openings: ri.numberOfFloodOpenings || '',
        area_of_permanent_flood: ri.areaOfPermanentFlood || '',
        openings: ri.openings || '',
        engineered_openings: ri.engineeredOpenings || '',
        does_building_contain_me: ri.doesBuildingContainME || '',
        me_located_above_first_floor: ri.mELocatedAboveFirstFloor || '',
        building_contain_washer_dryer_freezer: ri.buildingContainWasherDryerFreezer || '',
        washer_dryer_freezer_above_first_floor: ri.washerDryerFreezerAboveFirstFloor || '',
        enclosure_size: ri.enclosureSize || '',
        first_floor_height: ffh,
        first_floor_height_method: ri.firstFloorHeightMethod || '',
        firmStatus,
        floodZone: ri.floodZone || 'NA',
        dateOfConstruction: toISO(ri.dateOfConstruction || ''),
        substantial_improvement_date: toISO(ri.dateOfLastSubstantialImprovement || ''),
        firmDate: toISO(ri.firmDate || ''),
        community_map: ri.communityNumber || '',
        map_panel: ri.mapPanelNumber || '',
      });

      // Also display the JSON output
      setJsonOutput(JSON.stringify(parsed, null, 4));
    } catch (err) {
      alert('Error processing file: ' + (err instanceof Error ? err.message : String(err)));
    }
  }

  return (
    <section className="pt-32 pb-20">
      <div className="container max-w-5xl">
        {/* Header */}
        <motion.div
          className="text-center mb-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="w-16 h-16 rounded-2xl bg-[var(--color-gold)]/10 flex items-center justify-center mx-auto mb-6">
            <FileSpreadsheet className="w-8 h-8 text-[var(--color-gold)]" />
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
            JSON Data Form <span className="text-gradient">OSA</span>
          </h1>
          <p className="text-lg text-[var(--color-mist)] max-w-2xl mx-auto">
            Import flood claim data into the One Stop Adjuster system. Fill out the form
            or upload a DOCX file to generate structured JSON.
          </p>
        </motion.div>

        <form onSubmit={handleSubmit}>
          <Section title="Adjuster Information">
            <TextField label="Adjuster Name" field="adjusterName" value={form.adjusterName} onChange={set} />
            <TextField label="Adjuster FCN Number" field="adjusterFcnNumber" required value={form.adjusterFcnNumber} onChange={set} />
            <TextField label="Adjuster Phone Number" field="adjusterPhoneNumber" value={form.adjusterPhoneNumber} onChange={set} />
            <TextField label="Adjuster Email" field="firm_email" type="email" value={form.firm_email} onChange={set} />
          </Section>

          <Section title="Agency Information">
            <TextField label="Agent Name" field="agentName" value={form.agentName} onChange={set} />
            <TextField label="Agent Cell Number" field="agentCellNumber" value={form.agentCellNumber} onChange={set} />
            <TextField label="Agent Email" field="agentEmail" type="email" value={form.agentEmail} onChange={set} />
            <TextField label="Mortgage Company" field="mortgageCompany" value={form.mortgageCompany} onChange={set} />
          </Section>

          <Section title="Policy Information">
            <TextField label="Policyholder Name" field="policyholderName" required value={form.policyholderName} onChange={set} />
            <TextField label="Policyholder Email" field="policyholderEmail" type="email" value={form.policyholderEmail} onChange={set} />
            <TextField label="Primary Phone Number" field="phoneNumberPrimary" value={form.phoneNumberPrimary} onChange={set} />
            <TextField label="Secondary Phone Number" field="phoneNumberSecondary" value={form.phoneNumberSecondary} onChange={set} />
            <TextField label="Policy Number" field="policyNumber" required value={form.policyNumber} onChange={set} />
            <TextField label="Claim Number" field="claimNumber" required value={form.claimNumber} onChange={set} />
            <TextField label="Policy Start Date" field="policyStartDate" type="date" value={form.policyStartDate} onChange={set} />
            <TextField label="Policy End Date" field="policyEndDate" type="date" value={form.policyEndDate} onChange={set} />
          </Section>

          <Section title="Insurer and Adjusting Firm Information">
            <TextField label="EDN" field="edn" value={form.edn} onChange={set} />
            <TextField label="Insurer" field="insurer" value={form.insurer} onChange={set} />
            <TextField label="Insurer Street" field="insurer_street" value={form.insurer_street} onChange={set} />
            <TextField label="Insurer City" field="insurer_city" value={form.insurer_city} onChange={set} />
            <TextField label="Insurer State" field="insurer_state" value={form.insurer_state} onChange={set} />
            <TextField label="Insurer Zip" field="insurer_zip" value={form.insurer_zip} onChange={set} />
            <TextField label="Adjusting Firm" field="adjustingFirm" value={form.adjustingFirm} onChange={set} />
            <TextField label="File Number" field="adjusterFileNumber" required value={form.adjusterFileNumber} onChange={set} />
            <TextField label="Firm Street" field="firm_street" value={form.firm_street} onChange={set} />
            <TextField label="Firm City" field="firm_city" value={form.firm_city} onChange={set} />
            <TextField label="Firm State" field="firm_state" value={form.firm_state} onChange={set} />
            <TextField label="Firm Zip" field="firm_zip" value={form.firm_zip} onChange={set} />
            <TextField label="Firm Phone Number" field="firm_phone_number" value={form.firm_phone_number} onChange={set} />
          </Section>

          <Section title="Policyholder Loss Address">
            <TextField label="Loss Street" field="loss_street" value={form.loss_street} onChange={set} />
            <TextField label="Loss City" field="loss_city" value={form.loss_city} onChange={set} />
            <TextField label="Loss State" field="loss_state" value={form.loss_state} onChange={set} />
            <TextField label="Loss Zip" field="loss_zip" value={form.loss_zip} onChange={set} />
          </Section>

          <div className="glass rounded-2xl p-6 mb-4">
            <h2 className="text-lg font-semibold mb-4 pb-3 border-b border-[var(--color-wave)]/30">
              Policyholder Mailing Address
            </h2>
            <label className="flex items-center gap-2 mb-4 cursor-pointer">
              <input
                type="checkbox"
                checked={sameAddress}
                onChange={e => toggleSameAddress(e.target.checked)}
                className="w-4 h-4 rounded"
              />
              <span className="text-sm text-[var(--color-mist)]">Same as Loss Address</span>
            </label>
            <div className="grid sm:grid-cols-2 gap-4">
              <TextField label="Mailing Street" field="mailing_street" disabled={sameAddress} value={form.mailing_street} onChange={set} />
              <TextField label="Mailing City" field="mailing_city" disabled={sameAddress} value={form.mailing_city} onChange={set} />
              <TextField label="Mailing State" field="mailing_state" disabled={sameAddress} value={form.mailing_state} onChange={set} />
              <TextField label="Mailing Zip" field="mailing_zip" disabled={sameAddress} value={form.mailing_zip} onChange={set} />
            </div>
          </div>

          <Section title="Claim and Property Details">
            <TextField label="Date of Loss" field="dateOfLoss" type="date" required value={form.dateOfLoss} onChange={set} />
            <TextField label="Date of Assignment" field="dateOfAssignment" type="date" required value={form.dateOfAssignment} onChange={set} />
            <TextField label="Date of Contact" field="dateOfContact" type="date" value={form.dateOfContact} onChange={set} />
            <TextField label="Date of Inspection" field="dateOfInspection" type="date" value={form.dateOfInspection} onChange={set} />
          </Section>

          <Section title="Coverage Details">
            <TextField label="Coverage A Building" field="coverageABuilding" type="number" value={form.coverageABuilding} onChange={set} />
            <TextField label="Deductible A Building" field="deductibleABuilding" type="number" value={form.deductibleABuilding} onChange={set} />
            <TextField label="Coverage B Personal Property" field="coverageBPersonalProperty" type="number" value={form.coverageBPersonalProperty} onChange={set} />
            <TextField label="Deductible B Personal Property" field="deductibleBPersonalProperty" type="number" value={form.deductibleBPersonalProperty} onChange={set} />
            <TextField label="Coverage Other Structures" field="coverageOtherStructures" type="number" value={form.coverageOtherStructures} onChange={set} />
            <TextField label="Deductible Other Structure" field="deductibleOtherStructure" type="number" value={form.deductibleOtherStructure} onChange={set} />
          </Section>

          <div className="glass rounded-2xl p-6 mb-4">
            <h2 className="text-lg font-semibold mb-4 pb-3 border-b border-[var(--color-wave)]/30">
              Rating Information
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <TextField label="Risk Method" field="risk_method" value={form.risk_method} onChange={set} />
              <SelectField label="Policy Form" field="sfip_policy_type" options={POLICY_FORMS} value={form.sfip_policy_type} onChange={set} />
              <TextField label="Number of Units" field="number_of_units" value={form.number_of_units} onChange={set} />
              <SelectField label="Occupancy" field="pri_building_occupancy" options={OCCUPANCY_OPTIONS} value={form.pri_building_occupancy} onChange={set} />
              <SelectField label="Building Type" field="pri_building_type" options={buildingTypes} value={form.pri_building_type} onChange={set} />
              <TextField label="Primary/Secondary" field="primary_secondary" value={form.primary_secondary} onChange={set} />
              <TextField label="Tenant Indicator" field="tenant_indicator" value={form.tenant_indicator} onChange={set} />
              <TextField label="Number of Floors" field="number_of_floors" value={form.number_of_floors} onChange={set} />
              <SelectField label="Foundation Type" field="pri_foundation_type" options={FOUNDATION_TYPES} value={form.pri_foundation_type} onChange={set} />
              <SelectField label="Construction Type" field="pri_construction_type" options={CONSTRUCTION_TYPES} value={form.pri_construction_type} onChange={set} />
              <TextField label="Number of Flood Openings" field="number_of_flood_openings" value={form.number_of_flood_openings} onChange={set} />
              <TextField label="Area of Permanent Flood" field="area_of_permanent_flood" value={form.area_of_permanent_flood} onChange={set} />
              <TextField label="Openings (sq. in)" field="openings" value={form.openings} onChange={set} />
              <TextField label="Engineered Openings" field="engineered_openings" value={form.engineered_openings} onChange={set} />
              <SelectField label="Does Building Contain M&E" field="does_building_contain_me" options={YES_NO_NA} value={form.does_building_contain_me} onChange={set} />
              <SelectField label="M&E Located Above First Floor" field="me_located_above_first_floor" options={YES_NO_NA} value={form.me_located_above_first_floor} onChange={set} />
              <SelectField label="Building Contains Washer/Dryer/Freezer" field="building_contain_washer_dryer_freezer" options={YES_NO_NA} value={form.building_contain_washer_dryer_freezer} onChange={set} />
              <SelectField label="Washer/Dryer/Freezer Above First Floor" field="washer_dryer_freezer_above_first_floor" options={YES_NO_NA} value={form.washer_dryer_freezer_above_first_floor} onChange={set} />
              <TextField label="Enclosure Size" field="enclosure_size" value={form.enclosure_size} onChange={set} />
              <TextField label="First Floor Height" field="first_floor_height" type="number" value={form.first_floor_height} onChange={set} />
              <TextField label="First Floor Height Method" field="first_floor_height_method" value={form.first_floor_height_method} onChange={set} />
              {/* Firm Status radio */}
              <fieldset className="sm:col-span-2">
                <legend className="text-sm text-[var(--color-mist)] mb-2">Firm Status</legend>
                <div className="flex gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="firmStatus" value="Post" checked={form.firmStatus === 'Post'} onChange={e => set('firmStatus', e.target.value)} />
                    <span className="text-sm">Post Firm</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="firmStatus" value="Pre" checked={form.firmStatus === 'Pre'} onChange={e => set('firmStatus', e.target.value)} />
                    <span className="text-sm">Pre Firm</span>
                  </label>
                </div>
              </fieldset>
              <SelectField label="Flood Zone" field="floodZone" options={FLOOD_ZONES} value={form.floodZone} onChange={set} />
              <TextField label="Date of Construction" field="dateOfConstruction" type="date" value={form.dateOfConstruction} onChange={set} />
              <TextField label="Substantial Improvement Date" field="substantial_improvement_date" type="date" value={form.substantial_improvement_date} onChange={set} />
              <TextField label="Firm Date" field="firmDate" type="date" value={form.firmDate} onChange={set} />
              <TextField label="Community Map" field="community_map" value={form.community_map} onChange={set} />
              <TextField label="Map Panel" field="map_panel" value={form.map_panel} onChange={set} />
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full py-4 rounded-xl bg-[var(--color-gold)] hover:bg-[var(--color-gold)]/90 text-[var(--color-abyss)] font-bold text-lg transition-colors mb-6"
          >
            Generate JSON
          </button>
        </form>

        {/* JSON Output */}
        {jsonOutput && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <textarea
              value={jsonOutput}
              readOnly
              className="w-full h-64 p-4 rounded-xl bg-[var(--color-abyss)] border border-[var(--color-wave)]/30 text-[var(--color-pearl)] font-mono text-xs resize-y focus:outline-none"
            />
          </motion.div>
        )}

        {/* Action Buttons */}
        {!jsonOutput && (
          <p className="text-center text-sm text-[var(--color-mist)] mb-3">
            Click "Generate JSON" above to enable copy and download options
          </p>
        )}
        <div className="grid sm:grid-cols-3 gap-4 mb-8">
          <button
            type="button"
            onClick={handleCopy}
            disabled={!jsonOutput}
            className="flex items-center justify-center gap-2 py-3 rounded-xl bg-[var(--color-surf)] hover:bg-[var(--color-surf)]/80 text-white font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {copied ? <Check className="w-5 h-5" /> : <ClipboardCopy className="w-5 h-5" />}
            {copied ? 'Copied!' : 'Copy to Clipboard'}
          </button>
          <button
            type="button"
            onClick={() => handleDownload('jsonData.txt', jsonOutput)}
            disabled={!jsonOutput}
            className="flex items-center justify-center gap-2 py-3 rounded-xl bg-[var(--color-gold)] hover:bg-[var(--color-gold)]/80 text-[var(--color-abyss)] font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Download className="w-5 h-5" />
            Download JSON
          </button>
          <button
            type="button"
            onClick={downloadTokenized}
            className="flex items-center justify-center gap-2 py-3 rounded-xl bg-[var(--color-success)] hover:bg-[var(--color-success)]/80 text-white font-semibold transition-colors"
          >
            <Download className="w-5 h-5" />
            Download XACT Tokenized
          </button>
        </div>

        {/* DOCX Upload */}
        <div className="glass rounded-2xl p-6 text-center">
          <Upload className="w-8 h-8 text-[var(--color-surf)] mx-auto mb-3" />
          <p className="font-semibold mb-1">Upload DOCX File</p>
          <p className="text-sm text-[var(--color-mist)] mb-4">
            Extract claim data from a Word document and convert to OSA JSON format
          </p>
          <div className="flex items-center justify-center gap-3">
            <input
              ref={fileRef}
              type="file"
              accept=".docx"
              className="text-sm text-[var(--color-mist)] file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-[var(--color-ocean)] file:text-white file:cursor-pointer file:font-medium hover:file:bg-[var(--color-wave)] transition-colors"
            />
            <button
              type="button"
              onClick={handleUpload}
              className="px-4 py-2 rounded-lg bg-[var(--color-surf)] hover:bg-[var(--color-surf)]/80 text-white font-medium text-sm transition-colors"
            >
              Upload
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
