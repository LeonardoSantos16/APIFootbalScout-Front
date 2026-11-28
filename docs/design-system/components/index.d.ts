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
  variant?: 'centered' | 'sheet';
  onClose: () => void;
  actions?: React.ReactNode;
  children?: React.ReactNode;
}
export declare function Dialog(props: DialogProps): React.ReactElement | null;

export interface SkipLinkProps { href?: string; children?: React.ReactNode }
export declare function SkipLink(props: SkipLinkProps): React.ReactElement;

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

export type TextAreaProps = Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'id'> & {
  label: string;
  hint?: string;
  error?: string;
};
export declare function TextArea(props: TextAreaProps): React.ReactElement;

export interface DateFieldProps {
  label: string;
  value: string;
  max?: string;
  onChange?: (value: string) => void;
  readOnly?: boolean;
  hint?: string;
  error?: string;
  disabled?: boolean;
}
export declare function DateField(props: DateFieldProps): React.ReactElement;

export interface SegmentedOption { value: string; label: string }
export interface SegmentedControlProps {
  label: string;
  options: SegmentedOption[];
  value?: string | null;
  onChange?: (value: string) => void;
  disabled?: boolean;
  error?: string;
}
export declare function SegmentedControl(props: SegmentedControlProps): React.ReactElement;

export interface StatusBadgeProps {
  tone?: 'draft' | 'finalized' | 'current';
  children?: React.ReactNode;
}
export declare function StatusBadge(props: StatusBadgeProps): React.ReactElement;

export interface PointListProps {
  label: string;
  items: string[];
  onChange?: (items: string[]) => void;
  count?: string;
  placeholder?: string;
  addLabel?: string;
  readOnly?: boolean;
  emptyText?: string;
  disabled?: boolean;
}
export declare function PointList(props: PointListProps): React.ReactElement;

export interface ChecklistItem { label: string; done: boolean; progress?: string }
export interface FinishChecklistProps {
  items: ChecklistItem[];
  title?: string;
}
export declare function FinishChecklist(props: FinishChecklistProps): React.ReactElement;

export interface TimelineItem {
  id: string;
  title: React.ReactNode;
  detail?: React.ReactNode;
  note?: React.ReactNode;
  status: 'draft' | 'finalized' | 'current';
  href?: string;
}
export interface TimelineGroup { id: string; label: string; items: TimelineItem[] }
export interface ReportTimelineProps { groups: TimelineGroup[] }
export declare function ReportTimeline(props: ReportTimelineProps): React.ReactElement;

export interface TargetRowProps {
  priority: number;
  cost: string;
  name?: string;
  fallbackName: string;
  detail?: React.ReactNode;
  photo?: React.ReactNode;
  href?: string;
  loading?: boolean;
  error?: React.ReactNode;
  onRetry?: () => void;
  pending?: string;
  dragging?: boolean;
  disabled?: boolean;
  canMoveUp?: boolean;
  canMoveDown?: boolean;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  onRemove?: () => void;
  handleProps?: React.ButtonHTMLAttributes<HTMLButtonElement>;
  className?: string;
}
export declare function TargetRow(props: TargetRowProps): React.ReactElement;

export interface MoneyFieldProps {
  label?: string;
  value: string;
  onChange?: (value: string) => void;
  currency: string;
  currencies?: string[];
  onCurrencyChange?: (currency: string) => void;
  lockedCurrency?: boolean;
  placeholder?: string;
  hint?: string;
  error?: string;
  disabled?: boolean;
  className?: string;
}
export declare function MoneyField(props: MoneyFieldProps): React.ReactElement;

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
      SkipLink: typeof SkipLink;
      SearchField: typeof SearchField;
      PlayerPhoto: typeof PlayerPhoto;
      RowList: typeof RowList;
      TextArea: typeof TextArea;
      DateField: typeof DateField;
      SegmentedControl: typeof SegmentedControl;
      StatusBadge: typeof StatusBadge;
      PointList: typeof PointList;
      FinishChecklist: typeof FinishChecklist;
      ReportTimeline: typeof ReportTimeline;
      TargetRow: typeof TargetRow;
      MoneyField: typeof MoneyField;
    };
  }
}
