import { CDSSProtocol } from '@/types';

export const PROTOCOLS: CDSSProtocol[] = [
  {
    id: 'cdss-proto-1',
    flag_name: 'Pre-eclampsia',
    color_hex: '#D4215E',
    interventions: [
      'IV Magnesium Sulfate loading dose 4–6g over 20 minutes',
      'BP monitoring every 15 minutes — document every reading',
      'Notify OB-Gyne on call immediately',
      'Continuous fetal heart rate monitoring',
      'Insert indwelling catheter, monitor urine output hourly',
      'Prepare anticonvulsant backup (diazepam or phenytoin)',
    ],
    priority: 1,
  },
  {
    id: 'cdss-proto-2',
    flag_name: 'Fetal distress',
    color_hex: '#D4215E',
    interventions: [
      'Position patient in left lateral decubitus immediately',
      'Administer O₂ via face mask at 8–10 L/min',
      'Increase IV fluid rate — bolus if hypotensive',
      'Notify OB-Gyne STAT for possible emergency CS',
      'Prepare OR team on standby',
      'Document FHR pattern with timestamps every 5 minutes',
    ],
    priority: 2,
  },
  {
    id: 'cdss-proto-3',
    flag_name: 'Cord prolapse',
    color_hex: '#6B1133',
    interventions: [
      'EMERGENCY — Call CS team STAT immediately',
      'Manually elevate presenting part off the cord',
      'Position in knee-chest or Trendelenburg',
      'Oxygen via face mask immediately',
      'Do NOT allow patient to bear down or push',
      'Prepare OR for emergency CS NOW',
    ],
    priority: 3,
  },
  {
    id: 'cdss-proto-4',
    flag_name: 'GDM',
    color_hex: '#C47A1A',
    interventions: [
      'Blood glucose monitoring every hour',
      'Insulin drip readiness — confirm with pharmacy',
      'Notify neonatology team for newborn monitoring',
      'IV access with isotonic solution (D5LR)',
      'Document all glucose readings with exact timestamps',
    ],
    priority: 4,
  },
  {
    id: 'cdss-proto-5',
    flag_name: 'PROM',
    color_hex: '#1A5FA8',
    interventions: [
      'Assess fetal presentation and cord status immediately',
      'Monitor for chorioamnionitis: fever, foul-smelling discharge',
      'Notify OB-Gyne for delivery plan',
      'Continuous fetal monitoring',
      'Do NOT perform digital vaginal exam unless delivery imminent',
    ],
    priority: 5,
  },
  {
    id: 'cdss-proto-6',
    flag_name: 'Meconium',
    color_hex: '#C47A1A',
    interventions: [
      'Notify neonatology team to be present at delivery',
      'Prepare bulb suction and DeLee suction catheter',
      'Document color and consistency: thin/moderate/thick',
      'Do NOT stimulate infant until airway is cleared',
      'Continuous fetal monitoring — watch for late decelerations',
    ],
    priority: 6,
  },
];

export function getFlagsForProtocol(flag: string): string[] {
    const protocol = PROTOCOLS.find(p => p.flag_name === flag);
    return protocol ? protocol.interventions : [];
}

export function getProtocolsForFlags(flags: string[]): CDSSProtocol[] {
    return PROTOCOLS
        .filter(p => flags.includes(p.flag_name))
        .sort((a, b) => a.priority - b.priority);
}
