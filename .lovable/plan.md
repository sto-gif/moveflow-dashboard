

## Issue
In the collapsed sidebar, each menu icon appears off-center (pushed right) because the inner `<Link>` in `src/components/app-sidebar.tsx` uses `flex items-center gap-1.5` with no centering. The shadcn `SidebarMenuButton` shrinks to a 32px square (`size-8 p-2`) when collapsed, but the Link inside it still left-aligns its content, so the 14px icon sits against the left padding edge — not centered in the icon strip.

## Fix
In `src/components/app-sidebar.tsx` (Link className inside SidebarMenuButton, ~line 95-98), add `justify-center` when collapsed so the icon is horizontally centered inside the square button.

- Before:
  ```
  className={cn(
    "relative flex items-center gap-1.5 rounded-md",
    active && "bg-[#EFF6FF] font-medium text-[#1D4ED8]",
  )}
  ```
- After:
  ```
  className={cn(
    "relative flex items-center gap-1.5 rounded-md",
    collapsed && "w-full justify-center gap-0",
    active && "bg-[#EFF6FF] font-medium text-[#1D4ED8]",
  )}
  ```

Also adjust the active indicator bar (the 3px left strip) so it doesn't visually push the icon when collapsed — hide it in collapsed mode and rely on the background color for active state:

- Add `!collapsed &&` guard around the `<span ... left-0 ... bg-[#1D4ED8] />` indicator (line 100-102), so the centered icon stays truly centered when active.

## Verification
Collapse the sidebar on `/` — every icon (Dashboard, Leads, Jobs, Settings, etc.) should be horizontally centered inside its 32px button, including the active item.

