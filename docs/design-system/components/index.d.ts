import type * as React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
}
export declare function Button(props: ButtonProps): React.ReactElement;

export interface TabItem { id: string; label: string; count?: number | string; href?: string }
export interface TabsProps {
  items: TabItem[];
  value: string;
  onChange?: (id: string) => void;
  ariaLabel?: string;
  disabled?: boolean;
}
export declare function Tabs(props: TabsProps): React.ReactElement;

export interface ClubBandProps {
  name: string;
  subtitle?: string;
  color?: string;
  secondaryColor?: string;
  crest?: string;
  photo?: React.ReactNode;
  action?: React.ReactNode;
  loading?: boolean;
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
  sample?: string;
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

export interface SelectOption { value: string; label: string }
export interface SelectProps {
  label: string;
  options: SelectOption[];
  value?: string;
  onChange?: (value: string) => void;
  loading?: boolean;
}
export declare function Select(props: SelectProps): React.ReactElement;

export interface TextFieldProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'id'> {
  label: string;
  hint?: string;
  error?: string;
  trailing?: React.ReactNode;
}
export declare function TextField(props: TextFieldProps): React.ReactElement;

export type PasswordFieldProps = Omit<TextFieldProps, 'type' | 'trailing'>;
export declare function PasswordField(props: PasswordFieldProps): React.ReactElement;

export interface NoticeProps { children: React.ReactNode }
export declare function Notice(props: NoticeProps): React.ReactElement;

export interface DialogProps {
  open: boolean;
  title: string;
  description?: string;
  onClose: () => void;
  actions?: React.ReactNode;
  children?: React.ReactNode;
}
export declare function Dialog(props: DialogProps): React.ReactElement | null;

export interface SearchFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  onSubmit: (value: string) => void;
  placeholder?: string;
  error?: string;
  size?: 'default' | 'compact';
  submitLabel?: string;
  disabled?: boolean;
  className?: string;
}
export declare function SearchField(props: SearchFieldProps): React.ReactElement;

export interface PlayerPhotoProps {
  name: string;
  src?: string | null;
  size?: 'band' | 'small';
}
export declare function PlayerPhoto(props: PlayerPhotoProps): React.ReactElement;

export interface RowCell { value: React.ReactNode; label?: string }
export interface Row {
  id: string;
  title: React.ReactNode;
  detail?: React.ReactNode;
  href?: string;
  cells?: RowCell[];
  aside?: React.ReactNode;
}
export interface RowListProps {
  rows: Row[];
  columns?: string[];
  titleLabel?: string;
  ariaLabel?: string;
  footer?: React.ReactNode;
  className?: string;
}
export declare function RowList(props: RowListProps): React.ReactElement;

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
      Select: typeof Select;
      TextField: typeof TextField;
      PasswordField: typeof PasswordField;
      Notice: typeof Notice;
      Dialog: typeof Dialog;
      SearchField: typeof SearchField;
      PlayerPhoto: typeof PlayerPhoto;
      RowList: typeof RowList;
    };
  }
}
