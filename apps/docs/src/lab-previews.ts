import type {
  UikButton,
  UikCombobox,
  UikComboboxItem,
  UikCommandPalette,
  UikCommandPaletteItem,
  UikDialog,
  UikInput,
  UikNav,
  UikNavItem,
  UikNavRail,
  UikNavRailItem,
  UikProgress,
  UikRadioGroup,
  UikSwitch,
  UikTreeView,
  UikTreeViewItem,
} from "@ismail-elkorchi/ui-primitives";
import type {
  UikShellActivityBar,
  UikShellActivityBarItem,
  UikShellLayout,
  UikShellSecondarySidebar,
  UikShellStatusBar,
} from "@ismail-elkorchi/ui-shell";

type OutlineToggle = (
  layout: UikShellLayout,
  secondary: UikShellSecondarySidebar,
  isOpen: boolean,
  options?: { focus?: boolean },
) => void;

export const wireLabShellControls = (
  container: HTMLElement,
  statusBar: UikShellStatusBar | null,
  layout: UikShellLayout,
  secondary: UikShellSecondarySidebar,
  setOutlineOpen: OutlineToggle,
) => {
  const messageInput = container.querySelector<UikInput>(
    '[data-docs-control="status-message"]',
  );
  if (messageInput) {
    if (statusBar) {
      messageInput.value = statusBar.message;
      messageInput.addEventListener("input", () => {
        statusBar.message = messageInput.value;
      });
    } else {
      messageInput.disabled = true;
      messageInput.setAttribute("aria-disabled", "true");
    }
  }

  const toneGroup = container.querySelector<UikRadioGroup>(
    '[data-docs-control="status-tone"]',
  );
  if (toneGroup) {
    if (statusBar) {
      toneGroup.value = statusBar.tone;
      toneGroup.addEventListener("change", () => {
        statusBar.tone = toneGroup.value as UikShellStatusBar["tone"];
      });
    } else {
      toneGroup.disabled = true;
      toneGroup.setAttribute("aria-disabled", "true");
    }
  }

  const secondaryToggle = container.querySelector<UikSwitch>(
    '[data-docs-control="secondary-toggle"]',
  );
  if (secondaryToggle) {
    secondary.focusReturnTarget = secondaryToggle;
    secondaryToggle.checked = secondary.isOpen;
    secondaryToggle.addEventListener("change", () => {
      setOutlineOpen(layout, secondary, secondaryToggle.checked);
    });
  }
};

export const wireLabOverlayControls = (container: HTMLElement) => {
  const dialog = container.querySelector<UikDialog>("[data-docs-dialog]");
  const dialogOpen = container.querySelector<UikButton>(
    '[data-docs-action="dialog-open"]',
  );
  const dialogClose = container.querySelector<UikButton>(
    '[data-docs-action="dialog-close"]',
  );

  if (dialog && dialogOpen) {
    dialogOpen.addEventListener("click", () => dialog.showModal());
  }

  if (dialog && dialogClose) {
    dialogClose.addEventListener("click", () => dialog.close());
  }

  const progress = container.querySelector<UikProgress>("[data-docs-progress]");
  const progressToggle = container.querySelector<UikButton>(
    '[data-docs-action="progress-toggle"]',
  );

  if (progress && progressToggle) {
    progressToggle.addEventListener("click", () => {
      const next = !progress.indeterminate;
      progress.indeterminate = next;
      if (next) {
        progress.value = 0;
      } else {
        progress.value = 42;
      }
    });
  }
};

export const wireLabCommandPaletteControls = (container: HTMLElement) => {
  return (
    container.querySelector<UikButton>(
      '[data-docs-action="command-palette-open"]',
    ) ?? null
  );
};

export const wirePortfolioPreviews = (container: HTMLElement) => {
  const navItems: UikNavItem[] = [
    { id: "overview", label: "Overview", href: "#" },
    {
      id: "foundations",
      label: "Foundations",
      children: [
        { id: "tokens", label: "Tokens", href: "#" },
        { id: "components", label: "Components", href: "#" },
      ],
    },
    { id: "release", label: "Release notes", href: "#" },
  ];
  const navRailItems: UikNavRailItem[] = [
    {
      id: "overview",
      label: "Overview",
      icon: "M5 6h14M5 12h10M5 18h14",
    },
    {
      id: "tokens",
      label: "Tokens",
      icon: "M6 5h12v6H6zM6 13h12v6H6z",
    },
    {
      id: "components",
      label: "Components",
      icon: "M6 6h5v5H6zM13 6h5v5h-5zM6 13h5v5H6zM13 13h5v5h-5z",
    },
  ];
  const treeItems: UikTreeViewItem[] = [
    {
      id: "design",
      label: "Design",
      children: [
        { id: "tokens", label: "Tokens" },
        { id: "themes", label: "Themes" },
      ],
    },
    {
      id: "components",
      label: "Components",
      children: [
        { id: "inputs", label: "Inputs" },
        { id: "overlays", label: "Overlays" },
      ],
    },
  ];
  const activityItems: UikShellActivityBarItem[] = [
    {
      id: "workspace",
      label: "Workspace",
      icon: "M4 5h16v14H4z",
    },
    {
      id: "tokens",
      label: "Tokens",
      icon: "M12 4l8 4-8 4-8-4 8-4z",
    },
    {
      id: "console",
      label: "Console",
      icon: "M5 7h14M7 12h10M9 17h6",
    },
  ];
  const comboboxItems: UikComboboxItem[] = [
    { id: "inbox", label: "Inbox", value: "inbox" },
    { id: "triage", label: "Triage", value: "triage" },
    { id: "blocked", label: "Blocked", value: "blocked", isDisabled: true },
  ];
  const commandPaletteItems: UikCommandPaletteItem[] = [
    {
      id: "new-file",
      label: "Create file",
      value: "new-file",
      group: "Workspace",
      shortcut: "Cmd+N",
    },
    {
      id: "open-settings",
      label: "Open settings",
      value: "open-settings",
      group: "Workspace",
      shortcut: "Cmd+,",
    },
    {
      id: "toggle-theme",
      label: "Toggle theme",
      value: "toggle-theme",
      group: "View",
      shortcut: "Cmd+T",
    },
  ];

  container
    .querySelectorAll<UikNav>('[data-docs-portfolio="nav"]')
    .forEach((nav) => {
      nav.items = navItems;
      nav.openIds = ["foundations"];
      nav.currentId = "tokens";
    });

  container
    .querySelectorAll<UikNavRail>('[data-docs-portfolio="nav-rail"]')
    .forEach((navRail) => {
      navRail.items = navRailItems;
      navRail.activeId = "tokens";
    });

  container
    .querySelectorAll<UikTreeView>('[data-docs-portfolio="tree-view"]')
    .forEach((treeView) => {
      treeView.items = treeItems;
      treeView.openIds = ["design", "components"];
      treeView.currentId = "tokens";
    });

  container
    .querySelectorAll<UikCombobox>('[data-docs-portfolio="combobox"]')
    .forEach((combobox) => {
      combobox.items = comboboxItems;
      combobox.value = comboboxItems[0]?.value ?? "";
      combobox.open = true;
    });

  container
    .querySelectorAll<UikCommandPalette>(
      '[data-docs-portfolio="command-palette"]',
    )
    .forEach((palette) => {
      palette.items = commandPaletteItems;
    });

  container
    .querySelectorAll<HTMLElement>(
      '[data-docs-portfolio="command-palette-open"]',
    )
    .forEach((trigger) => {
      const palette = trigger
        .closest(".docs-portfolio-command-palette")
        ?.querySelector<UikCommandPalette>(
          '[data-docs-portfolio="command-palette"]',
        );
      if (!palette) return;
      trigger.addEventListener("click", () => {
        palette.show();
      });
    });

  container
    .querySelectorAll<UikShellActivityBar>(
      '[data-docs-portfolio="shell-activity-bar"]',
    )
    .forEach((activityBar) => {
      activityBar.items = activityItems;
      activityBar.activeId = "workspace";
    });

  container
    .querySelectorAll<HTMLElement>("[data-docs-dialog-trigger]")
    .forEach((trigger) => {
      const dialogId = trigger.getAttribute("data-docs-dialog-trigger");
      if (!dialogId) return;
      const dialog = container.querySelector<UikDialog>(`#${dialogId}`);
      if (!dialog) return;
      trigger.addEventListener("click", () => {
        if (!dialog.open) dialog.showModal();
      });
    });

  container
    .querySelectorAll<HTMLElement>("[data-docs-dialog-close]")
    .forEach((trigger) => {
      const dialogId = trigger.getAttribute("data-docs-dialog-close");
      if (!dialogId) return;
      const dialog = container.querySelector<UikDialog>(`#${dialogId}`);
      if (!dialog) return;
      trigger.addEventListener("click", () => {
        dialog.close();
      });
    });
};
