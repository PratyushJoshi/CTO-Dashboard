# Layout Components

Optimized and fixed layout system for the CTO Dashboard.

## Components

### DashboardLayout
Main layout wrapper that manages the overall page structure.

**Features:**
- Responsive sidebar toggle
- Automatic sidebar state management (open on desktop, closed on mobile)
- Configuration persistence
- Smooth transitions

**Usage:**
```tsx
<DashboardLayout config={config} onConfigChange={handleConfigChange}>
  {children}
</DashboardLayout>
```

### Header
Fixed header with navigation controls and user menu.

**Features:**
- Sidebar toggle button
- Live data indicator
- Configuration menu (refresh interval)
- Notifications bell
- User profile menu
- Responsive design
- Click-outside to close menus

### Sidebar
Collapsible navigation sidebar with department links.

**Features:**
- Responsive (overlay on mobile, fixed on desktop)
- Active route highlighting
- Status indicators for each section
- Badge notifications
- Quick actions
- System status footer
- Auto-close on mobile after navigation

**Navigation Items:**
- Overview
- Infrastructure Performance
- API Performance
- App Performance
- Business Costs
- AI Department
- QA Department
- Business Analytics
- Data Integration
- Alerts & Notifications
- Settings

### MobileNavigation
Dedicated mobile navigation panel (legacy, now integrated into Sidebar).

## Layout Structure

```
┌─────────────────────────────────────┐
│           Header (Fixed)            │
├──────────┬──────────────────────────┤
│          │                          │
│ Sidebar  │    Main Content Area     │
│ (Fixed)  │    (Scrollable)          │
│          │                          │
│          │                          │
└──────────┴──────────────────────────┘
```

## Responsive Behavior

### Desktop (≥1024px)
- Sidebar is visible by default
- Sidebar is fixed position
- Main content has left margin to accommodate sidebar
- Header spans full width

### Mobile (<1024px)
- Sidebar is hidden by default
- Sidebar overlays content when open
- Backdrop appears when sidebar is open
- Sidebar auto-closes after navigation
- Header hamburger menu toggles sidebar

## Key Improvements

1. **Fixed Z-Index Issues**: Proper layering of header (z-50), sidebar (z-40), and backdrop (z-40)
2. **Smooth Transitions**: All state changes use CSS transitions
3. **Better Mobile UX**: Auto-close sidebar after navigation on mobile
4. **Optimized Performance**: Removed unnecessary re-renders
5. **Accessibility**: Proper ARIA labels and keyboard navigation
6. **Dark Mode Support**: Full dark mode styling
7. **Click Outside**: Menus close when clicking outside
8. **Responsive Breakpoints**: Proper handling of different screen sizes

## Configuration

The layout supports configuration through the `DashboardConfig` type:

```typescript
interface DashboardConfig {
  id: string;
  userId: string;
  name: string;
  layout: WidgetLayout[];
  filters: DashboardFilter[];
  refreshInterval: number;
  isDefault: boolean;
}
```

## Styling

Custom styles are defined in `src/app/globals.css`:
- Custom scrollbar styling
- Smooth scrolling
- Card and button utilities
- Dark mode support
