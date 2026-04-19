
## Issue
The collapsed sidebar isn't scrolling because the shadcn `SidebarContent` primitive in `src/components/ui/sidebar.tsx` (line 399) hardcodes `group-data-[collapsible=icon]:overflow-hidden` when the sidebar is collapsed. This overrides the `overflow-y-auto` className we passed from `app-sidebar.tsx`, so scrolling is disabled exactly in the state where it's needed.

## Fix
Remove the forced `overflow-hidden` for the collapsed/icon state in `src/components/ui/sidebar.tsx` so the default `overflow-auto` (already on the same element) applies in both expanded and collapsed states.

Change in `src/components/ui/sidebar.tsx` (SidebarContent, ~line 399):

- Before: `"flex min-h-0 flex-1 flex-col gap-2 overflow-auto group-data-[collapsible=icon]:overflow-hidden"`
- After: `"flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto"`

Optionally hide the scrollbar visually for a cleaner look using `scrollbar-width: none` / `[&::-webkit-scrollbar]:hidden` while keeping scroll functional — only if you want it invisible.

## Why this works
- The sidebar wrapper is `fixed inset-y-0 h-svh`, and `SidebarContent` is `flex-1 min-h-0`, so it has a bounded height. Once `overflow-y-auto` is allowed in the collapsed state, the icon list will scroll naturally when it overflows the viewport (which is exactly what's happening on the small 284×585 viewport in your preview).

## Verification
After the change, collapse the sidebar on `/` at a short viewport — all icons from Dashboard down to Settings should be reachable by scrolling within the icon strip.
