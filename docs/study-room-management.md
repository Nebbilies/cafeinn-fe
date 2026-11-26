# Study room management (BL-054)

Status: UI implemented with local fixture data on 2026-11-23. No API calls are made; changes live in React state and reset on reload.

## Scope

- Route `/portal/study-rooms` (Admin): "Phòng học và bảng giá", covering UC-028 (rooms, rates) and the UI side of UC-029 (maintenance notice).
- Feature code lives in `src/features/study-rooms/`. The static route takes precedence over `/portal/[section]` for this destination only.
- Out of scope: API integration, permission checks, affected-booking handling and email for UC-029, and a control for putting a room into maintenance (the design does not define one yet).

## Design references

Figma file: https://www.figma.com/design/uFGpsRjt8VmGoUInMn4XNA (page "Cafe · Prototype · Quản trị").

| Screen | Node | Implemented as |
| --- | --- | --- |
| AD04 · Phòng học và bảng giá | `8691:7290` | List with sort menu, filter popover, search, table, pagination |
| AD04 · Dialog · Thêm phòng | `8691:7550` | `StudyRoomFormModal` (create) |
| AD04Edit · Dialog · Sửa phòng học | `8691:7419` | `StudyRoomFormModal` (edit) |
| AD04Maintenance · Dialog · Phòng tạm ngừng hoạt động | `8691:7768` | `StudyRoomMaintenanceModal`, opened from "Chi tiết" on a room under maintenance |
| AD04 · Dialog · detail / delete | `8762:150330`, `8762:150412` | `StudyRoomDetailModal`, `StudyRoomDeleteModal` |
| Dữ liệu mẫu · AD04 · 25 bản ghi | `8900:999` | `fixtures/study-rooms.fixture.ts` |
| CompactBrowser/AD04 views | `8762:154825` | Filter, sort, empty and page-size states |

## Decisions where the design or backend is incomplete

- Form fields follow the design: name, capacity, rate per hour, amenities. `amenities` has no backend column; `minimumDurationMinutes` exists in the backend but has no field in the design. These are known contract gaps to settle with the backend team.
- The room code is generated (`P01`, `P02`, …) because the add dialog has no code field.
- Delete is enabled only for rooms without usage history (`hasUsageHistory`), matching the disabled delete buttons in the design. The backend must confirm delete eligibility.
- Create and edit share the newer `Cafe/DialogLayout` geometry (640px, md controls). The older add dialog used 560px and sm buttons.
- The design's sort and filter buttons open prototype placeholders. Sorting offers code, name, capacity and rate; filtering offers capacity and status, consistent with the older DataBrowser views.
- Form validation mirrors backend column limits (name ≤ 50 characters, capacity 1–255, non-negative whole rate). Amenities are capped at 200 characters as a UI-only limit.

## Assets

`public/icons/*.svg` are the `Cafe/Icon/*` components (Eye `8756:3500`, Pencil `8756:3504`, Trash `8747:3507`, Plus `8614:1116`, ChevronLeft/Right/Down `8614:1132`/`8614:1134`/`8614:1138`, ChevronsLeft/Right `8995:10226`/`8995:10229`, Info `8862:4519`). They were reconstructed from the vector geometry of a local `.fig` export because Figma MCP export was unavailable, and verified visually against the design. `CafeIcon` (`src/shared/ui/cafe-icon.tsx`) tints them with the current text color through CSS masks.

## Verification

- `npm run lint`, `npm run typecheck`, `npm test` (list, fixture and form validation tests in `tests/study-room-list.test.ts`), and `npm run build` pass.
- Browser checks (headless Edge, 1280×800 and 390×844): list, detail, edit from detail, maintenance reopen, create with validation errors, new room on the last page, delete confirmation, filter, sort, search, empty state, page size, Vietnamese/English and Light/Dark. No console errors other than the pre-existing missing `favicon.ico`.
