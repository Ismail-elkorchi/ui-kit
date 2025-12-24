import type {SVGTemplateResult} from 'lit';

type UikShellActivityBarIcon = string | SVGTemplateResult;

interface UikShellActivityBarItem {
  id: string;
  label: string;
  icon?: UikShellActivityBarIcon;
  tooltip?: string;
}

export type {UikShellActivityBarIcon, UikShellActivityBarItem};
