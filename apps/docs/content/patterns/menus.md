# Menus and menubars

Use a menubar to expose primary actions and attach menus to each trigger.

## Menubar example

```example-html
<uik-menubar aria-label="App menus">
  <uik-menu>
    <uik-button slot="trigger" variant="ghost">File</uik-button>
    <uik-menu-item value="new">New</uik-menu-item>
    <uik-menu-item value="open">Open</uik-menu-item>
    <uik-menu-item value="export" disabled>Export...</uik-menu-item>
  </uik-menu>
  <uik-menu>
    <uik-button slot="trigger" variant="ghost">Edit</uik-button>
    <uik-menu-item value="undo">Undo</uik-menu-item>
    <uik-menu-item value="redo" disabled>Redo</uik-menu-item>
    <uik-menu-item value="preferences">Preferences</uik-menu-item>
  </uik-menu>
  <uik-menu>
    <uik-button slot="trigger" variant="ghost">View</uik-button>
    <uik-menu-item value="status">Status Bar</uik-menu-item>
    <uik-menu-item value="activity">Activity Bar</uik-menu-item>
  </uik-menu>
</uik-menubar>
```
