# INEC Ogun State PVC Distribution Tracking Application

A comprehensive web application for tracking Permanent Voter Card (PVC) distribution across Ogun State, Nigeria's electoral structure.

## 🏛️ Hierarchical Electoral Structure

This application implements the official 4-tier INEC electoral hierarchy:

### Tier 1: State Level
- **State**: Ogun State
- **State Code**: 27

### Tier 2: LGA Level (20 Local Government Areas)
| Code | LGA Name |
|------|----------|
| 01 | Abeokuta North |
| 02 | Abeokuta South |
| 03 | Ado-Odo/Ota |
| 04 | Ewekoro |
| 05 | Ifo |
| 06 | Ijebu East |
| 07 | Ijebu North |
| 08 | Ijebu North-East |
| 09 | Ijebu Ode |
| 10 | Ikene |
| 11 | Ipokia |
| 12 | Obafemi Owode |
| 13 | Odeda |
| 14 | Ogun Waterside |
| 15 | Odogbolu |
| 16 | Ogijo/Likosi |
| 17 | Remo North |
| 18 | Shagamu |
| 19 | Imeko Afon |
| 20 | Other LGAs |

### Tier 3: Ward Level
Each LGA contains 11-16 wards. Example for Sagamu (LGA 20):
- Ward 01: Oko/Ope/Itula I (11 PUs)
- Ward 02: Oko/Ope/Itula II (17 PUs)
- Ward 03: Ayegbami/Jokun (15 PUs)
- Ward 04: Sabo I (34 PUs)
- Ward 05: Sabo II (30 PUs)
- Ward 06: Isokun/Oyebajo (14 PUs)
- Ward 07: Ljagba (9 PUs)
- Ward 08: Latawa (8 PUs)
- Ward 09: Ode-Lemo (variable PUs)
- Ward 10: Ogijo/Likosi (56 PUs)
- Ward 11: Surulere (18 PUs)
- Ward 12: Isote (8 PUs)
- Ward 13: Simawa/Iwelepe (25 PUs)
- Ward 14: Agbowa (29 PUs)
- Ward 15: Ibindo/Ituwa/Alara (9 PUs)

### Tier 4: Polling Unit Level
Each ward contains variable number of Polling Units (8-56 PUs per ward).

**PU Code Format**: `27/20/15/008`
- `27` = State Code
- `20` = LGA Code  
- `15` = Ward Code
- `008` = PU Number (3-digit, zero-padded)

## 🔍 Delimitation Code Parsing

The application supports multiple delimitation code formats:
- Slash-separated: `27/20/15/008`
- Hyphen-separated: `27-20-15-008`
- Space-separated: `27 20 15 008`

All formats are normalized to the standard slash-separated format internally.

## 📱 Features

### Dashboard
- Real-time overview of PVC distribution statistics
- Visual charts showing collection rates and status distribution
- Progress tracking across all LGAs
- Recent activity monitoring

### Delimitation Code Lookup
- Search and verify electoral codes
- Support for multiple input formats
- Detailed hierarchical breakdown
- Validation against electoral database

### Electoral Structure Browser
- Navigate through State → LGA → Ward → PU hierarchy
- View statistics at each level
- Track collection percentages
- Drill-down navigation

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

```bash
cd inec-pvc-tracker
npm install
```

### Development

```bash
npm run dev
```

### Production Build

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## 📁 Project Structure

```
src/
├── App.tsx                 # Main application with routing
├── types/
│   └── index.ts           # TypeScript interfaces
├── data/
│   └── electoralData.ts   # Electoral hierarchy data
├── utils/
│   └── delimitationParser.ts  # Code parsing utilities
├── context/
│   └── PVCContext.tsx     # Global state management
├── pages/
│   ├── Dashboard.tsx      # Main dashboard view
│   ├── DelimitationLookup.tsx  # Code lookup page
│   └── ElectoralBrowser.tsx    # Hierarchy browser
└── components/            # Reusable UI components
```

## 🛠️ Technology Stack

- **Frontend Framework**: React 19
- **Language**: TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router v7
- **Charts**: Recharts
- **Icons**: Lucide React

## 📊 Data Models

### DelimitationData Interface
```typescript
interface DelimitationData {
  fullCode: string;        // "27/20/15/008"
  stateCode: string;       // "27"
  stateName: string;       // "Ogun"
  lgaCode: string;         // "20"
  lgaName: string;         // "Sagamu"
  wardCode: string;        // "15"
  wardName: string;        // "Ibindo/Ituwa/Alara"
  puCode: string;          // "008"
  puName: string;          // "Town Hall, Sagamu II"
}
```

### Key Interfaces
- `State`: State-level electoral data
- `LGA`: Local Government Area data
- `Ward`: Ward-level data with PU counts
- `PollingUnit`: Individual polling unit details
- `PVCDistributionStatus`: PVC collection tracking
- `DistributionRecord`: Distribution event records
- `DashboardStats`: Aggregated statistics

## 🎯 Usage Examples

### Parse a Delimitation Code
```typescript
import { parseDelimitationCode } from './utils/delimitationParser';

const result = parseDelimitationCode('27-20-15-008');
// Returns structured DelimitationData object
```

### Get Electoral Data
```typescript
import { getLGAs, getWardsByLGA, getPollingUnitsByWard } from './data/electoralData';

const lgas = getLGAs();
const sagamuWards = getWardsByLGA('20');
const ward15PUs = getPollingUnitsByWard('20', '15');
```

### Access PVC Context
```typescript
import { usePVC } from './context/PVCContext';

function MyComponent() {
  const { dashboardStats, distributionStatuses, parseAndLookupCode } = usePVC();
  // Use context data...
}
```

## 📝 License

This project is developed for INEC Ogun State electoral operations.

## 👥 Contributing

For internal development team use only.

---

**INEC Ogun State** - PVC Distribution Tracking System
