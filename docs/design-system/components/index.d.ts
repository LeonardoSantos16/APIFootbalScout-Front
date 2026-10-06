import type * as React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
}
export declare function Button(props: ButtonProps): React.ReactElement;

export interface TabItem { id: string; label: string; count?: number | string }
export interface TabsProps {
  items: TabItem[];
  value: string;
  onChange?: (id: string) => void;
  ariaLabel?: string;
}
export declare function Tabs(props: TabsProps): React.ReactElement;

export interface ClubBandProps {
  name: string;
  subtitle?: string;
  color?: string;
  secondaryColor?: string;
  crest?: string;
  action?: React.ReactNode;
}
export declare function ClubBand(props: ClubBandProps): React.ReactElement;

export interface CardProps {
  title?: string;
  subtitle?: string;
  aside?: React.ReactNode;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  flush?: boolean;
  className?: string;
  children?: React.ReactNode;
}
export declare function Card(props: CardProps): React.ReactElement;

export interface StatCellProps {
  label: string;
  unit?: 'por 90' | 'média' | '%' | string;
  state?: 'calculada' | 'recusada' | 'carregando';
  value?: string;
  reason?: string;
}
export declare function StatCell(props: StatCellProps): React.ReactElement;

export interface MetricsGridProps {
  metrics: StatCellProps[];
  footnote?: string;
}
export declare function MetricsGrid(props: MetricsGridProps): React.ReactElement;

export interface ChangeChipProps {
  direction?: 'up' | 'down';
  children?: React.ReactNode;
}
export declare function ChangeChip(props: ChangeChipProps): React.ReactElement;

export interface MeasurementCardProps {
  title: string;
  state: 'ComMudanca' | 'SemMudancaRelevante' | 'Indisponivel';
  previous?: string;
  current?: string;
  change?: { direction: 'up' | 'down'; text: string };
  reason?: string;
}
export declare function MeasurementCard(props: MeasurementCardProps): React.ReactElement;

export interface InlineErrorProps {
  message: string;
  onRetry?: () => void;
  retryLabel?: string;
}
export declare function InlineError(props: InlineErrorProps): React.ReactElement;

declare global {
  interface Window {
    ScoutVestiario: {
      Button: typeof Button;
      Tabs: typeof Tabs;
      ClubBand: typeof ClubBand;
      Card: typeof Card;
      StatCell: typeof StatCell;
      MetricsGrid: typeof MetricsGrid;
      ChangeChip: typeof ChangeChip;
      MeasurementCard: typeof MeasurementCard;
      InlineError: typeof InlineError;
    };
  }
}
