import type {
  UikCommandPalette,
  UikCommandPaletteCloseReason,
  UikCommandPaletteItem,
  UikCommandPaletteOpenChangeDetail,
  UikCommandPaletteQueryChangeDetail,
  UikCommandPaletteSelectDetail,
} from "@ismail-elkorchi/ui-primitives";

export interface UikCommandCenterCommand extends UikCommandPaletteItem {
  run?: (command: UikCommandCenterCommand, query: string) => void;
}

export interface UikCommandCenterProvider {
  id: string;
  getItems: (
    query: string,
  ) => UikCommandPaletteItem[] | Promise<UikCommandPaletteItem[]>;
}

export interface UikCommandCenterConfig {
  palette: UikCommandPalette;
  commands?: UikCommandCenterCommand[];
  providers?: UikCommandCenterProvider[];
  openButton?: HTMLElement | null;
  hotkey?: string | null;
  resetQueryOnOpen?: boolean;
  isEditableElement?: (element: Element | null) => boolean;
  getActiveElement?: () => Element | null;
  onSelect?: (command: UikCommandCenterCommand, query: string) => void;
  onOpenChange?: (open: boolean, reason?: UikCommandPaletteCloseReason) => void;
}

export interface UikCommandCenterHandle {
  open: () => void;
  close: () => void;
  toggle: () => void;
  setCommands: (commands: UikCommandCenterCommand[]) => void;
  addCommands: (commands: UikCommandCenterCommand[]) => void;
  setProviders: (providers: UikCommandCenterProvider[]) => void;
  setOpenButton: (button: HTMLElement | null) => void;
  destroy: () => void;
}

let commandCenterId = 0;

const getDefaultActiveElement = () => {
  const active = document.activeElement;
  if (active instanceof HTMLElement) {
    return active.shadowRoot?.activeElement ?? active;
  }
  return active;
};

const isDefaultEditableElement = (element: Element | null) => {
  if (!element) return false;
  const tag = element.tagName;
  if (["INPUT", "TEXTAREA", "SELECT"].includes(tag)) return true;
  if (element instanceof HTMLElement && element.isContentEditable) return true;
  return ["UIK-INPUT", "UIK-TEXTAREA", "UIK-COMBOBOX"].includes(tag);
};

const resolveAriaValue = (
  element: HTMLElement,
  property: "ariaExpandedValue" | "ariaControlsValue",
  attribute: "aria-expanded" | "aria-controls",
  value: string,
) => {
  if (property in element) {
    (element as unknown as Record<string, string>)[property] = value;
    return;
  }
  element.setAttribute(attribute, value);
};

export const createUikCommandCenter = (
  config: UikCommandCenterConfig,
): UikCommandCenterHandle => {
  const palette = config.palette;
  const hotkey = config.hotkey === undefined ? "k" : config.hotkey;
  const resetQueryOnOpen = config.resetQueryOnOpen ?? true;
  const getActiveElement = config.getActiveElement ?? getDefaultActiveElement;
  const isEditableElement =
    config.isEditableElement ?? isDefaultEditableElement;

  let commands = [...(config.commands ?? [])];
  let providers = [...(config.providers ?? [])];
  let openButton: HTMLElement | null = null;
  let openButtonAbort = new AbortController();
  let requestId = 0;

  const controller = new AbortController();
  const { signal } = controller;

  const ensurePaletteId = () => {
    if (!palette.id) {
      commandCenterId += 1;
      palette.id = `uik-command-palette-${String(commandCenterId)}`;
    }
  };

  const setExpanded = (isOpen: boolean) => {
    if (!openButton) return;
    const value = isOpen ? "true" : "false";
    resolveAriaValue(openButton, "ariaExpandedValue", "aria-expanded", value);
    ensurePaletteId();
    if (palette.id) {
      resolveAriaValue(
        openButton,
        "ariaControlsValue",
        "aria-controls",
        palette.id,
      );
    }
  };

  const updateItems = async (query: string) => {
    if (providers.length === 0) {
      palette.items = commands;
      palette.loading = false;
      return;
    }

    const currentRequest = (requestId += 1);
    palette.loading = true;
    const results = await Promise.all(
      providers.map((provider) => Promise.resolve(provider.getItems(query))),
    );
    if (currentRequest !== requestId || signal.aborted) return;
    palette.items = [...commands, ...results.flat()];
    palette.loading = false;
  };

  const open = () => {
    if (palette.disabled) return;
    if (palette.open) return;
    if (resetQueryOnOpen) {
      palette.query = "";
    }
    void updateItems(palette.query);
    palette.show();
  };

  const close = () => {
    if (!palette.open) return;
    palette.close();
  };

  const toggle = () => {
    if (palette.open) {
      close();
      return;
    }
    open();
  };

  const setCommands = (next: UikCommandCenterCommand[]) => {
    commands = [...next];
    void updateItems(palette.query);
  };

  const addCommands = (next: UikCommandCenterCommand[]) => {
    commands = [...commands, ...next];
    void updateItems(palette.query);
  };

  const setProviders = (next: UikCommandCenterProvider[]) => {
    providers = [...next];
    void updateItems(palette.query);
  };

  const setOpenButton = (button: HTMLElement | null) => {
    openButtonAbort.abort();
    openButtonAbort = new AbortController();
    openButton = button;
    if (!openButton) return;

    openButton.addEventListener(
      "click",
      (event: MouseEvent) => {
        event.preventDefault();
        open();
      },
      { signal: openButtonAbort.signal },
    );

    setExpanded(palette.open);
  };

  palette.addEventListener(
    "command-palette-select",
    (event: Event) => {
      const detail = (event as CustomEvent<UikCommandPaletteSelectDetail>)
        .detail;
      const selected =
        commands.find((command) => command.id === detail.item.id) ??
        (detail.item as UikCommandCenterCommand);
      selected.run?.(selected, detail.query);
      config.onSelect?.(selected, detail.query);
    },
    { signal },
  );

  palette.addEventListener(
    "command-palette-open-change",
    (event: Event) => {
      const detail = (event as CustomEvent<UikCommandPaletteOpenChangeDetail>)
        .detail;
      setExpanded(detail.open);
      config.onOpenChange?.(detail.open, detail.reason);
    },
    { signal },
  );

  palette.addEventListener(
    "command-palette-query-change",
    (event: Event) => {
      if (providers.length === 0) return;
      const detail = (event as CustomEvent<UikCommandPaletteQueryChangeDetail>)
        .detail;
      void updateItems(detail.query);
    },
    { signal },
  );

  if (hotkey) {
    window.addEventListener(
      "keydown",
      (event: KeyboardEvent) => {
        if (event.defaultPrevented) return;
        if (!event.metaKey && !event.ctrlKey) return;
        if (event.key.toLowerCase() !== hotkey.toLowerCase()) return;
        const active = getActiveElement();
        if (isEditableElement(active)) return;
        event.preventDefault();
        toggle();
      },
      { signal },
    );
  }

  setCommands(commands);
  if (config.openButton) setOpenButton(config.openButton);

  return {
    open,
    close,
    toggle,
    setCommands,
    addCommands,
    setProviders,
    setOpenButton,
    destroy: () => {
      openButtonAbort.abort();
      controller.abort();
    },
  };
};
